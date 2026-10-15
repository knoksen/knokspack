from pathlib import Path
import os
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel, Field

router = APIRouter(prefix='/workspace')
BASE = 'http://127.0.0.1:8787'

class Message(BaseModel):
    prompt: str = Field(min_length=1, max_length=15000)
    model: str = Field(default='qwen3.5:4b', pattern=r'^(qwen3\.5:4b|qwen2\.5-coder:14b|qwen2\.5-coder:1\.5b)$')
    context: str = Field(default='', max_length=24000)

@router.get('', response_class=HTMLResponse)
def workspace():
    return HTMLResponse(Path(__file__).with_name('jarlhalla_console.html').read_text(), headers={'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Content-Security-Policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"})

@router.get('/health')
async def health():
    endpoint = os.getenv('OLLAMA_BASE_URL', 'http://127.0.0.1:11436/v1').rstrip('/')
    if endpoint.endswith('/v1'):
        endpoint = endpoint[:-3]
    try:
        async with httpx.AsyncClient(timeout=5, trust_env=False) as client:
            r = await client.get(endpoint + '/api/tags')
            r.raise_for_status()
            return {'connected': bool(r.json().get('models'))}
    except (httpx.HTTPError, ValueError):
        return {'connected': False}

@router.post('/chat', response_class=StreamingResponse)
async def chat(message: Message):
    client = httpx.AsyncClient(timeout=httpx.Timeout(180, connect=5), trust_env=False)
    response = None
    try:
        request = client.build_request('POST', BASE + '/chat', json={**message.model_dump(), 'provider':'ollama', 'mode':'chat'})
        response = await client.send(request, stream=True)
        response.raise_for_status()
        iterator = response.aiter_bytes()
        first = await anext(iterator, b'')
        if not first:
            raise ValueError('empty')
    except (httpx.HTTPError, ValueError):
        if response is not None:
            await response.aclose()
        await client.aclose()
        raise HTTPException(502, 'Ingen kontakt med modellen. Kontroller Ollama og SSH-tunnelen.')
    async def chunks():
        try:
            yield first
            async for chunk in iterator:
                yield chunk
        finally:
            await response.aclose()
            await client.aclose()
    return StreamingResponse(chunks(), media_type='text/plain', headers={'Cache-Control':'no-store'})
