"""Authenticated gateway task upserts against the existing Jarlhalla Tasks source."""
import fcntl
import json
import os
from pathlib import Path
from uuid import UUID
import urllib.request
import urllib.error
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

SOURCE = 'aaa9420a-4015-4bdb-b942-59ad083bf347'
STATE = Path('/jcc-task-sync-state')
VERSION = '2025-09-03'

class Task(BaseModel):
    text: str = Field(min_length=1, max_length=240)
    done: bool = False
    expected_revision: str | None = Field(default=None, max_length=64)


def notion(method, path, payload=None):
    token = os.getenv('NOTION_TOKEN', '').strip()
    if not token:
        raise HTTPException(503, 'Notion-token mangler i gatewayen.')
    request = urllib.request.Request('https://api.notion.com/v1' + path,
        data=None if payload is None else json.dumps(payload).encode(), method=method,
        headers={'Authorization':'Bearer ' + token, 'Notion-Version': VERSION, 'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        raise HTTPException(502, f'Notion avviste forespørselen (HTTP {exc.code}).', headers={'X-Upstream-Status':str(exc.code)}) from None
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise HTTPException(504, 'Notion svarte ikke entydig. Hent status før nytt forsøk.') from None


def key_and_source(task_id):
    try:
        key = str(UUID(task_id))
    except ValueError:
        raise HTTPException(422, 'Ugyldig oppgave-ID.') from None
    return key, 'https://jarlhalla.com/.well-known/command-center/tasks/' + key


def lookup(source):
    result = notion('POST', f'/data_sources/{SOURCE}/query', {
        'filter': {'property':'Source URL', 'url':{'equals':source}}, 'page_size':2})
    pages = result.get('results', [])
    if len(pages) > 1 or result.get('has_more'):
        raise HTTPException(409, 'Flere Notion-oppgaver har samme synk-ID. Ingen endring utført.')
    return pages[0] if pages else None


def result(page, action):
    properties = page['properties']
    return {'ok':True, 'action':action, 'page_id':page['id'], 'url':page['url'],
        'revision':page['last_edited_time'],
        'text':''.join(t.get('plain_text',t.get('text',{}).get('content','')) for t in properties['Task']['title']),
        'done':(properties['Status'].get('select') or {}).get('name') == 'Done'}


def make_router(auth):
    router = APIRouter(prefix='/api/tasks', dependencies=[Depends(auth)])

    @router.get('/{task_id}')
    def read(task_id: str):
        _, source = key_and_source(task_id)
        page = lookup(source)
        if not page:
            raise HTTPException(404, 'Oppgaven finnes ikke i Notion.')
        return result(page, 'read')

    @router.put('/{task_id}')
    def upsert(task_id: str, task: Task):
        key, source = key_and_source(task_id)
        text = task.text.strip()
        if not text:
            raise HTTPException(422, 'Oppgaven kan ikke være tom.')
        STATE.mkdir(exist_ok=True)
        with (STATE / (key + '.lock')).open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            schema = notion('GET', '/data_sources/' + SOURCE).get('properties', {})
            for name, kind in [('Task','title'),('Status','select'),('Source URL','url')]:
                if schema.get(name,{}).get('type') != kind:
                    raise HTTPException(409, 'Notion-skjemaet er endret. Ingen oppgave skrevet.')
            page = lookup(source)
            properties = {'Task':{'title':[{'text':{'content':text}}]},
                'Status':{'select':{'name':'Done' if task.done else 'Next'}}}
            if page:
                current = result(page, 'read')
                # A retry of an already successful write is a no-op.
                if current['text'] == text and current['done'] == task.done:
                    return {**current, 'action':'unchanged'}
                if not task.expected_revision or task.expected_revision != current['revision']:
                    raise HTTPException(409, 'Oppgaven finnes eller er endret i Notion. Hent fra Notion før oppdatering.')
                return result(notion('PATCH', '/pages/' + page['id'], {'properties':properties}), 'updated')
            if task.expected_revision:
                raise HTTPException(409, 'Tidligere synkronisert oppgave mangler. Ingen ny kopi opprettet.')
            ledger = STATE / (key + '.json')
            if ledger.exists():
                raise HTTPException(409, 'Tidligere oppretting er uavklart. Ingen ny kopi opprettet; hent status eller avklar manuelt.')
            ledger.write_text(json.dumps({'state':'pending'}))
            properties.update({'Source URL':{'url':source}, 'Area':{'select':{'name':'Automation'}},
                'Priority':{'select':{'name':'P2'}}, 'Owner Role':{'rich_text':[{'text':{'content':'Jarle / Command Center'}}]}})
            try:
                page = notion('POST', '/pages', {'parent':{'type':'data_source_id','data_source_id':SOURCE},
                    'properties':properties})
            except HTTPException as exc:
                # 4xx Notion rejection is definitive; timeouts remain pending.
                if exc.status_code == 502 and int((exc.headers or {}).get('X-Upstream-Status','500')) < 500:
                    ledger.unlink(missing_ok=True)
                raise
            ledger.write_text(json.dumps({'state':'created','page_id':page['id']}))
            return result(page, 'created')
    return router
