import importlib.util
import sys
from pathlib import Path
import httpx
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
spec=importlib.util.spec_from_file_location('console_under_test',Path(__file__).with_name('jarlhalla_console.py'))
console=importlib.util.module_from_spec(spec);sys.modules[spec.name]=console;spec.loader.exec_module(console)
app=FastAPI();app.include_router(console.router)
client=TestClient(app)
real_client=httpx.AsyncClient

@pytest.fixture
def upstream(monkeypatch):
    seen=[]
    def handle(request):
        seen.append(request)
        if request.url.path.endswith('/api/tags'):return httpx.Response(200,json={'models':[{'name':'qwen3.5:4b'}]})
        return httpx.Response(200,text='Hei Jarle!')
    monkeypatch.setattr(console.httpx,'AsyncClient',lambda **kw:real_client(transport=httpx.MockTransport(handle),**kw))
    return seen

def test_personalized_norwegian_chat(upstream):
    r=client.post('/workspace/chat',json={'prompt':'Hei','workspace':'building'})
    assert r.status_code==200 and r.text=='Hei Jarle!'
    import json
    payload=json.loads(upstream[-1].content)
    assert payload['provider']=='ollama'
    assert 'Jarle Taksdal' in payload['context']
    assert 'norsk bokmål' in payload['tone']
    assert len(payload['tone'])<=500

def test_live_health(upstream):
    h=client.get('/workspace/health').json()
    assert h['connected'] and h['provider']=='ollama'

def test_disconnected_health(monkeypatch):
    def fail(request):raise httpx.ConnectError('offline')
    monkeypatch.setattr(console.httpx,'AsyncClient',lambda **kw:real_client(transport=httpx.MockTransport(fail),**kw))
    assert client.get('/workspace/health').json()['connected'] is False
    assert client.post('/workspace/chat',json={'prompt':'Hei'}).status_code==502

def test_validation():
    for payload in [{'prompt':''},{'prompt':'a','workspace':'unknown'},{'prompt':'a','model':'not-allowed'}]:
        assert client.post('/workspace/chat',json=payload).status_code==422

def test_no_arbitrary_file_access():
    assert client.get('/workspace/knokspack/%2e%2e/app.py').status_code==404
