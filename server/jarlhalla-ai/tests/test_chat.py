import importlib.util
import sys
from pathlib import Path
from unittest.mock import patch

import httpx
import pytest
from fastapi.testclient import TestClient
from openai import APIError, RateLimitError

spec = importlib.util.spec_from_file_location('jarlhalla_app', Path(__file__).parents[1] / 'app.py')
backend = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = backend
spec.loader.exec_module(backend)
client = TestClient(backend.app)


def stream(*chunks, failure=None):
    yield from chunks
    if failure:
        raise failure


@pytest.mark.parametrize('provider', ['openai', 'anthropic', 'ollama'])
def test_success_streams_all_text(provider, monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    monkeypatch.setenv('ANTHROPIC_API_KEY', 'test-key')
    with patch.object(backend, f'stream_{provider}', return_value=stream('Hello ', 'Jarle')):
        response = client.post('/chat', json={'prompt': 'Hi', 'provider': provider})
    assert response.status_code == 200
    assert response.text == 'Hello Jarle'


def test_credit_failure_returns_json_before_stream(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    error = APIError('You have no credits remaining', request=httpx.Request('POST', 'https://provider.test'), body=None)
    with patch.object(backend, 'stream_openai', return_value=stream(failure=error)):
        response = client.post('/chat', json={'prompt': 'Hi', 'provider': 'openai'})
    assert response.status_code == 503
    assert 'credits are exhausted' in response.json()['detail']


def test_quota_code_returns_actionable_error(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    error = RateLimitError('quota', response=httpx.Response(429, request=httpx.Request('POST', 'https://provider.test')), body={'code': 'insufficient_quota'})
    with patch.object(backend, 'stream_openai', return_value=stream(failure=error)):
        response = client.post('/chat', json={'prompt': 'Hi', 'provider': 'openai'})
    assert response.status_code == 503


def test_missing_key(monkeypatch):
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    response = client.post('/chat', json={'prompt': 'Hi', 'provider': 'openai'})
    assert response.status_code == 503


def test_empty_stream(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    with patch.object(backend, 'stream_openai', return_value=stream()):
        response = client.post('/chat', json={'prompt': 'Hi', 'provider': 'openai'})
    assert response.status_code == 502


def test_upstream_details_not_exposed(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    with patch.object(backend, 'stream_openai', return_value=stream(failure=ValueError('secret-token private-url'))):
        response = client.post('/chat', json={'prompt': 'Hi', 'provider': 'openai'})
    assert response.status_code == 502
    assert 'secret-token' not in response.text
    assert 'private-url' not in response.text


def test_runtime_error_details_not_exposed(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    with patch.object(backend, 'stream_openai', return_value=stream(failure=RuntimeError('secret-token'))):
        response = client.post('/chat', json={'prompt': 'Hi', 'provider': 'openai'})
    assert response.status_code == 503
    assert 'secret-token' not in response.text


def test_stream_is_closed_on_completion(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    closed = []
    def chunks():
        try:
            yield 'Hello'
        finally:
            closed.append(True)
    with patch.object(backend, 'stream_openai', return_value=chunks()):
        response = client.post('/chat', json={'prompt': 'Hi', 'provider': 'openai'})
    assert response.text == 'Hello'
    assert closed == [True]
