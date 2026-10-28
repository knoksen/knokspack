"""Fixed gateway proxy: credentials stay in the AI service environment."""
import os
from uuid import UUID
from urllib.parse import urlsplit
import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

router = APIRouter(prefix='/workspace/notion/tasks')
class Task(BaseModel):
    text: str = Field(min_length=1, max_length=240)
    done: bool = False
    expected_revision: str | None = Field(default=None, max_length=64)

async def proxy(task_id, method, body=None):
    try: task_id = str(UUID(task_id))
    except ValueError: raise HTTPException(422, 'Ugyldig oppgave-ID.') from None
    key = os.getenv('JARLHALLA_GATEWAY_KEY','').strip()
    if not key: raise HTTPException(503, 'Gateway-nøkkelen er ikke konfigurert for arbeidsrommet.')
    try:
        async with httpx.AsyncClient(timeout=120,trust_env=False) as client:
            response = await client.request(method, 'http://127.0.0.1:8080/api/tasks/' + task_id,
                headers={'x-jarlhalla-key':key}, json=body)
        data = response.json()
    except (httpx.HTTPError, ValueError):
        raise HTTPException(502, 'Ingen entydig respons fra gatewayen. Hent oppgaven før nytt forsøk.') from None
    if response.status_code != 200:
        detail = data.get('detail','Gateway-kontroll feilet.')
        raise HTTPException(response.status_code, detail if isinstance(detail,str) else 'Oppgavedata ble avvist.')
    return data

@router.get('/{task_id}')
async def read(task_id: str):
    return await proxy(task_id,'GET')

@router.put('/{task_id}')
async def write(task_id: str, task: Task, request: Request):
    origin=request.headers.get('origin')
    if origin and urlsplit(origin).netloc != request.url.netloc:
        raise HTTPException(403,'Forespørselen må komme fra samme arbeidsrom.')
    return await proxy(task_id,'PUT',task.model_dump())
