"""LIVE acceptance: one stable, clearly marked task; create, update and repeat."""
import json
import subprocess
import urllib.request
from uuid import uuid5, NAMESPACE_URL

raw=subprocess.check_output(['docker','inspect','jarlhalla-control-gateway'],text=True)
env=dict(item.split('=',1) for item in json.loads(raw)[0]['Config']['Env'] if '=' in item)
key=env.get('JCC_API_KEY','').strip()
if not key:raise SystemExit('FAIL: gateway key missing')
task_id=str(uuid5(NAMESPACE_URL,'https://jarlhalla.com/command-center/notion-live-verification-v1'))
url='http://127.0.0.1:8080/api/tasks/'+task_id

def call(method,body=None):
    req=urllib.request.Request(url,method=method,data=None if body is None else json.dumps(body).encode(),
        headers={'x-jarlhalla-key':key,'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=120) as response:return json.load(response)

# If already verified, do not reopen it; verify the same page again.
try:
    existing=call('GET')
except Exception as exc:
    from urllib.error import HTTPError
    if not isinstance(exc,HTTPError) or exc.code!=404:raise SystemExit('FAIL: cannot read verification task; no blind write')
    existing=None
body={'text':'VERIFISERING — Command Center / Notion oppgavesynk','done':False}
if existing:
    body['done']=existing['done'];body['expected_revision']=existing['revision']
first=call('PUT',body)
second=call('PUT',{'text':body['text'],'done':True,'expected_revision':first['revision']})
third=call('PUT',{'text':body['text'],'done':True,'expected_revision':second['revision']})
read=call('GET')
assert first['page_id']==second['page_id']==third['page_id']==read['page_id']
assert third['action']=='unchanged' and read['done'] is True
print('PASS: real Notion create/update/read and repeated request use one page')
print('Page:',read['url'])
