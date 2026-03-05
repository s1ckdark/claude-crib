#!/usr/bin/env python3
"""
Z.AI MCP Server - Provides ask_zai tool for Claude Code integration.

Exposes Z.AI's GLM models via MCP protocol, following the same pattern
as oh-my-claudecode's Codex/Gemini wrappers.

Environment:
    Z_AI_API_KEY - Required API key for Z.AI
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx
from mcp.server.fastmcp import FastMCP

# ── Constants ──────────────────────────────────────────────

ZAI_API_URL = "https://api.z.ai/api/coding/anthropic/v1/messages"
DEFAULT_MODEL = "glm-5"
DEFAULT_TIMEOUT = 300
MAX_TOKENS = 4096

AVAILABLE_MODELS = {
    "glm-5": "GLM-5 - Latest flagship model, most capable",
    "glm-4.7-flash": "GLM-4.7 Flash - Fast inference, free on coding plan",
    "glm-4.7": "GLM-4.7 - Flagship with thinking support",
    "glm-4.6": "GLM-4.6 - Unified reasoning, coding, and agentic",
    "glm-4.6v": "GLM-4.6V - Vision-language model",
    "glm-4.5": "GLM-4.5 - Standard model",
    "glm-4.5-flash": "GLM-4.5 Flash - Fast inference, free on coding plan",
    "glm-4.5-air": "GLM-4.5 Air - Lightweight and fast",
    "glm-4.5v": "GLM-4.5V - Vision-language model",
    "glm-5-code": "GLM-5 Code - Code-specialized model",
    "glm-4-plus": "GLM-4 Plus - Legacy enhanced model",
}

ROLE_SYSTEM_PROMPTS = {
    "architect": "You are a senior software architect. Analyze code structure, design patterns, and provide architectural guidance. Be thorough and precise.",
    "code-reviewer": "You are an expert code reviewer. Identify bugs, security issues, performance problems, and suggest improvements. Rate severity of each finding.",
    "analyst": "You are a pre-planning analyst. Break down requirements, identify risks, dependencies, and unknowns. Provide structured analysis.",
    "planner": "You are a strategic planner. Create detailed implementation plans with phases, milestones, and contingencies.",
    "critic": "You are a critical reviewer. Challenge assumptions, find weaknesses in plans, and suggest alternatives. Be constructively critical.",
    "writer": "You are a technical writer. Create clear, concise documentation. Follow best practices for the target format.",
    "designer": "You are a UI/UX designer. Provide design guidance, component architecture, and accessibility recommendations.",
    "security-reviewer": "You are a security expert. Identify vulnerabilities (OWASP Top 10), suggest mitigations, and review security architecture.",
    "tdd-guide": "You are a TDD expert. Guide test-first development, suggest test cases, and review test quality.",
    "default": "You are a helpful AI assistant. Provide clear, accurate, and actionable responses.",
}

# ── Background jobs storage ────────────────────────────────

_jobs: dict[str, dict] = {}
_job_counter = 0

# ── Server setup ───────────────────────────────────────────

mcp = FastMCP("zai", dependencies=["httpx"])


def _get_api_key() -> str:
    key = os.environ.get("ZAI_API_KEY", "") or os.environ.get("Z_AI_API_KEY", "")
    if not key:
        raise ValueError("Z_AI_API_KEY environment variable is not set")
    return key


def _build_request(
    prompt: str,
    agent_role: str = "default",
    context_files: list[str] | None = None,
) -> tuple[str, list[dict]]:
    """Build system prompt and messages for Anthropic-compatible API.

    Returns (system_prompt, messages) tuple.
    """
    system_prompt = ROLE_SYSTEM_PROMPTS.get(agent_role, ROLE_SYSTEM_PROMPTS["default"])
    messages = []

    # Attach context files content
    if context_files:
        context_parts = []
        for fpath in context_files:
            p = Path(fpath)
            if p.exists() and p.is_file():
                try:
                    content = p.read_text(encoding="utf-8", errors="replace")
                    context_parts.append(f"### File: {fpath}\n```\n{content}\n```")
                except Exception:
                    context_parts.append(f"### File: {fpath}\n(could not read)")
        if context_parts:
            messages.append({
                "role": "user",
                "content": "Here are the relevant files for context:\n\n" + "\n\n".join(context_parts),
            })
            messages.append({
                "role": "assistant",
                "content": "I've reviewed the provided files. Please share the task.",
            })

    messages.append({"role": "user", "content": prompt})
    return system_prompt, messages


async def _call_zai(
    system_prompt: str,
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    thinking: bool = True,
    temperature: float = 1.0,
    max_tokens: int = MAX_TOKENS,
) -> dict:
    """Make the actual API call to Z.AI via Anthropic-compatible endpoint."""
    api_key = _get_api_key()

    body: dict = {
        "model": model,
        "system": system_prompt,
        "messages": messages,
        "max_tokens": max_tokens,
    }
    if thinking:
        body["thinking"] = {"type": "enabled", "budget_tokens": max_tokens}

    async with httpx.AsyncClient() as client:
        response = await client.post(
            ZAI_API_URL,
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
            json=body,
            timeout=DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        return response.json()


def _extract_content(data: dict) -> str:
    """Extract text content from Anthropic-format Z.AI response."""
    content_blocks = data.get("content", [])
    if not content_blocks:
        return "(no response)"
    text_parts = [b["text"] for b in content_blocks if b.get("type") == "text"]
    return "\n".join(text_parts) if text_parts else "(empty)"


def _extract_usage(data: dict) -> str:
    """Extract token usage info from Anthropic-format response."""
    usage = data.get("usage", {})
    if not usage:
        return ""
    parts = []
    if "input_tokens" in usage:
        parts.append(f"input: {usage['input_tokens']}")
    if "output_tokens" in usage:
        parts.append(f"output: {usage['output_tokens']}")
    cached = usage.get("cache_read_input_tokens", 0)
    if cached:
        parts.append(f"cached: {cached}")
    return f"[tokens: {', '.join(parts)}]" if parts else ""


def _format_output(content: str, agent_role: str, model: str, usage: str) -> str:
    """Format response with YAML frontmatter matching Codex/Gemini pattern."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    frontmatter = (
        f"---\n"
        f"provider: zai\n"
        f"agent_role: {agent_role}\n"
        f"model: {model}\n"
        f"timestamp: {ts}\n"
        f"---\n\n"
    )
    result = frontmatter + content
    if usage:
        result += f"\n\n{usage}"
    return result


# ── MCP Tools ──────────────────────────────────────────────


@mcp.tool()
async def ask_zai(
    prompt: str = "",
    prompt_file: str = "",
    output_file: str = "",
    agent_role: str = "default",
    context_files: list[str] | None = None,
    model: str = DEFAULT_MODEL,
    thinking: bool = True,
    background: bool = False,
) -> str:
    """Ask Z.AI (GLM) a question with optional role and context files.

    Args:
        prompt: Direct prompt text. Ignored if prompt_file is set.
        prompt_file: Path to file containing the prompt (preferred for long prompts).
        output_file: Path to write the response to. If empty, returns directly.
        agent_role: Perspective role (architect, code-reviewer, analyst, planner, critic, writer, designer, security-reviewer, tdd-guide, default).
        context_files: List of file paths to include as context.
        model: Z.AI model to use (glm-5, glm-4.7-flash, glm-4.7, glm-4.6, glm-4.5-flash, etc).
        thinking: Enable thinking/reasoning mode (default: true).
        background: Run in background and return job ID (default: false).
    """
    # Resolve prompt
    actual_prompt = prompt
    if prompt_file:
        p = Path(prompt_file)
        if p.exists():
            actual_prompt = p.read_text(encoding="utf-8")
        else:
            return f"Error: prompt_file not found: {prompt_file}"

    if not actual_prompt.strip():
        return "Error: No prompt provided. Use 'prompt' or 'prompt_file'."

    # Background execution
    if background:
        if not output_file:
            return "Error: output_file is required for background mode."

        global _job_counter
        _job_counter += 1
        job_id = f"zai-{_job_counter}-{int(time.time())}"
        _jobs[job_id] = {"status": "running", "started": time.time(), "output_file": output_file}

        async def _run_bg():
            try:
                system_prompt, messages = _build_request(actual_prompt, agent_role, context_files)
                data = await _call_zai(system_prompt, messages, model=model, thinking=thinking)
                content = _extract_content(data)
                usage = _extract_usage(data)
                result = _format_output(content, agent_role, model, usage)

                Path(output_file).parent.mkdir(parents=True, exist_ok=True)
                Path(output_file).write_text(result, encoding="utf-8")

                _jobs[job_id] = {
                    "status": "completed",
                    "started": _jobs[job_id]["started"],
                    "finished": time.time(),
                    "output_file": output_file,
                    "result_preview": content[:200],
                }
            except Exception as e:
                _jobs[job_id] = {
                    "status": "failed",
                    "started": _jobs[job_id]["started"],
                    "finished": time.time(),
                    "error": str(e),
                }

        asyncio.create_task(_run_bg())
        return (
            f"**Background job launched**\n\n"
            f"- **Job ID:** `{job_id}`\n"
            f"- **Status:** running\n"
            f"- **Output:** `{output_file}`\n\n"
            f"Use `check_zai_status` or `wait_for_zai_job` to monitor progress."
        )

    # Synchronous execution
    try:
        system_prompt, messages = _build_request(actual_prompt, agent_role, context_files)
        data = await _call_zai(system_prompt, messages, model=model, thinking=thinking)
        content = _extract_content(data)
        usage = _extract_usage(data)
        result = _format_output(content, agent_role, model, usage)

        if output_file:
            Path(output_file).parent.mkdir(parents=True, exist_ok=True)
            Path(output_file).write_text(result, encoding="utf-8")
            return f"Response written to `{output_file}`\n\n{usage}"

        return result

    except httpx.HTTPStatusError as e:
        return f"Z.AI API error: HTTP {e.response.status_code} - {e.response.text[:300]}"
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def check_zai_status(job_id: str) -> str:
    """Check the status of a background Z.AI job.

    Args:
        job_id: The job ID returned by ask_zai with background=true.
    """
    job = _jobs.get(job_id)
    if not job:
        return f"Job not found: {job_id}"
    return json.dumps(job, indent=2, default=str)


@mcp.tool()
async def wait_for_zai_job(job_id: str, timeout_ms: int = 300000) -> str:
    """Wait for a background Z.AI job to complete.

    Args:
        job_id: The job ID returned by ask_zai with background=true.
        timeout_ms: Maximum wait time in milliseconds (default: 300000 = 5 min).
    """
    job = _jobs.get(job_id)
    if not job:
        return f"Job not found: {job_id}"

    timeout_s = timeout_ms / 1000.0
    start = time.time()
    while time.time() - start < timeout_s:
        job = _jobs.get(job_id, {})
        if job.get("status") in ("completed", "failed"):
            return json.dumps(job, indent=2, default=str)
        await asyncio.sleep(1.0)

    return json.dumps({"job_id": job_id, "status": "timeout", "elapsed_ms": int((time.time() - start) * 1000)})


@mcp.tool()
async def list_zai_models() -> str:
    """List available Z.AI models and their descriptions."""
    lines = ["Available Z.AI Models:", ""]
    for model_id, desc in AVAILABLE_MODELS.items():
        marker = " (default)" if model_id == DEFAULT_MODEL else ""
        lines.append(f"  {model_id}{marker}: {desc}")
    return "\n".join(lines)


# ── Entry point ────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run()
