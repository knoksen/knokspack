from __future__ import annotations

import os
from typing import Generator, Literal

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from openai import OpenAI
from pydantic import BaseModel, Field

app = FastAPI(title="JarlhallaAI", version="1.0.0")

PROVIDER = os.getenv("JARLHALLA_AI_PROVIDER", "openai").strip().lower()
MODEL = os.getenv("JARLHALLA_AI_MODEL", "gpt-5.6-luna").strip()
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434/v1").strip()

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
    tone: str | None = Field(default=None, max_length=500)
    context: str | None = Field(default=None, max_length=50000)


def build_client() -> OpenAI:
    if PROVIDER == "ollama":
        return OpenAI(
            api_key=os.getenv("OLLAMA_API_KEY", "ollama"),
            base_url=OLLAMA_BASE_URL,
        )

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    return OpenAI(api_key=api_key, base_url=OPENAI_BASE_URL)


def build_system_prompt(request: ChatRequest) -> str:
    parts = [SYSTEM_PROMPT, MODE_CONTEXT[request.mode]]
    if request.tone:
        parts.append(f"Requested style: {request.tone}")
    if request.context:
        parts.append(f"Operator-provided context:\n{request.context}")
    return "\n\n".join(parts)


def stream_openai(request: ChatRequest) -> Generator[str, None, None]:
    client = build_client()
    stream = client.responses.create(
        model=MODEL,
        input=[
            {"role": "system", "content": build_system_prompt(request)},
            {"role": "user", "content": request.prompt},
        ],
        stream=True,
    )

    for event in stream:
        if getattr(event, "type", None) == "response.output_text.delta":
            delta = getattr(event, "delta", "")
            if delta:
                yield delta


def stream_ollama(request: ChatRequest) -> Generator[str, None, None]:
    client = build_client()
    stream = client.chat.completions.create(
        model=MODEL,
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
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "provider": PROVIDER,
        "model": MODEL,
    }


@app.post("/chat")
def chat(request: ChatRequest) -> StreamingResponse:
    try:
        if PROVIDER == "ollama":
            generator = stream_ollama(request)
        elif PROVIDER == "openai":
            generator = stream_openai(request)
        else:
            raise RuntimeError(f"Unsupported JARLHALLA_AI_PROVIDER: {PROVIDER}")

        return StreamingResponse(generator, media_type="text/plain; charset=utf-8")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI upstream error: {exc}") from exc
