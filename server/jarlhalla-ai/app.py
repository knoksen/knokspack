from __future__ import annotations

import os
from typing import Generator, Literal

from anthropic import Anthropic
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from openai import OpenAI
from pydantic import BaseModel, Field

app = FastAPI(title="JarlhallaAI", version="1.1.1")

Provider = Literal["openai", "anthropic", "ollama"]

DEFAULT_PROVIDER = os.getenv("JARLHALLA_AI_PROVIDER", "openai").strip().lower()
LEGACY_MODEL = os.getenv("JARLHALLA_AI_MODEL", "").strip()
OPENAI_MODEL = os.getenv("JARLHALLA_OPENAI_MODEL", LEGACY_MODEL or "gpt-5.6-sol").strip()
ANTHROPIC_MODEL = os.getenv("JARLHALLA_ANTHROPIC_MODEL", "claude-sonnet-5").strip()
OLLAMA_MODEL = os.getenv("JARLHALLA_OLLAMA_MODEL", LEGACY_MODEL or "llama3.2").strip()
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434/v1").strip()
ANTHROPIC_MAX_TOKENS = int(os.getenv("ANTHROPIC_MAX_TOKENS", "8192"))

SYSTEM_PROMPT = """You are JarlhallaAI, the private operations and publishing assistant for Jarlhalla.
You help with WordPress administration, website operations, SEO, content planning, technical troubleshooting,
and structured drafting. Be precise, practical and conservative with production systems. Never claim an action
was executed unless the calling system confirms it. For destructive or irreversible operations, provide a plan
and verification steps before suggesting execution. Prefer reversible changes, backups and explicit checks.
"""

MODE_CONTEXT = {
    "chat": "Answer as a general Jarlhalla assistant.",
    "wordpress": "Focus on WordPress, publishing, plugins, themes, security, performance and content workflows.",
    "seo": "Focus on technical SEO, Search Console, information architecture, structured content and measurable growth.",
    "operations": "Focus on Linux, Nginx, DNS, TLS, backups, monitoring, deployment and incident-safe operations.",
}


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=50000)
    mode: Literal["chat", "wordpress", "seo", "operations"] = "chat"
    provider: Provider | None = None
    model: str | None = Field(default=None, max_length=200)
    tone: str | None = Field(default=None, max_length=500)
    context: str | None = Field(default=None, max_length=50000)


def normalize_provider(value: str) -> Provider:
    provider = value.strip().lower()
    if provider not in {"openai", "anthropic", "ollama"}:
        raise RuntimeError(f"Unsupported JARLHALLA_AI_PROVIDER: {provider}")
    return provider  # type: ignore[return-value]


def resolve_provider(request: ChatRequest) -> Provider:
    return request.provider or normalize_provider(DEFAULT_PROVIDER)


def default_model(provider: Provider) -> str:
    if provider == "openai":
        return OPENAI_MODEL
    if provider == "anthropic":
        return ANTHROPIC_MODEL
    return OLLAMA_MODEL


def resolve_model(provider: Provider, request: ChatRequest) -> str:
    return (request.model or default_model(provider)).strip()


def build_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=api_key, base_url=OPENAI_BASE_URL)


def build_ollama_client() -> OpenAI:
    return OpenAI(
        api_key=os.getenv("OLLAMA_API_KEY", "ollama"),
        base_url=OLLAMA_BASE_URL,
    )


def build_anthropic_client() -> Anthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")
    return Anthropic(api_key=api_key)


def build_system_prompt(request: ChatRequest) -> str:
    parts = [SYSTEM_PROMPT, MODE_CONTEXT[request.mode]]
    if request.tone:
        parts.append(f"Requested style: {request.tone}")
    if request.context:
        parts.append(f"Operator-provided context:\n{request.context}")
    return "\n\n".join(parts)


def stream_openai(request: ChatRequest, model: str) -> Generator[str, None, None]:
    client = build_openai_client()
    stream = client.responses.create(
        model=model,
        instructions=build_system_prompt(request),
        input=request.prompt,
        stream=True,
    )

    for event in stream:
        if getattr(event, "type", None) == "response.output_text.delta":
            delta = getattr(event, "delta", "")
            if delta:
                yield delta


def stream_anthropic(request: ChatRequest, model: str) -> Generator[str, None, None]:
    client = build_anthropic_client()
    with client.messages.stream(
        model=model,
        max_tokens=ANTHROPIC_MAX_TOKENS,
        system=build_system_prompt(request),
        messages=[{"role": "user", "content": request.prompt}],
    ) as stream:
        for text in stream.text_stream:
            if text:
                yield text


def stream_ollama(request: ChatRequest, model: str) -> Generator[str, None, None]:
    client = build_ollama_client()
    stream = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": build_system_prompt(request)},
            {"role": "user", "content": request.prompt},
        ],
        stream=True,
    )

    for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


@app.get("/health")
def health() -> dict[str, object]:
    provider = normalize_provider(DEFAULT_PROVIDER)
    return {
        "status": "ok",
        "provider": provider,
        "model": default_model(provider),
        "providers": {
            "openai": {
                "configured": bool(os.getenv("OPENAI_API_KEY", "").strip()),
                "model": OPENAI_MODEL,
            },
            "anthropic": {
                "configured": bool(os.getenv("ANTHROPIC_API_KEY", "").strip()),
                "model": ANTHROPIC_MODEL,
            },
            "ollama": {
                "configured": True,
                "model": OLLAMA_MODEL,
            },
        },
    }


@app.post("/chat")
def chat(request: ChatRequest) -> StreamingResponse:
    try:
        provider = resolve_provider(request)
        model = resolve_model(provider, request)

        if provider == "ollama":
            generator = stream_ollama(request, model)
        elif provider == "anthropic":
            generator = stream_anthropic(request, model)
        elif provider == "openai":
            generator = stream_openai(request, model)
        else:
            raise RuntimeError(f"Unsupported provider: {provider}")

        return StreamingResponse(generator, media_type="text/plain; charset=utf-8")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI upstream error: {exc}") from exc
