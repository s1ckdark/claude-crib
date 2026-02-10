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

ZAI_API_URL = "https://api.z.ai/api/paas/v4/chat/completions"
DEFAULT_MODEL = "glm-4.7"
DEFAULT_TIMEOUT = 300
MAX_TOKENS = 4096

AVAILABLE_MODELS = {
    "glm-4.7": "GLM-4.7 - Latest flagship model with thinking support",
    "glm-4-plus": "GLM-4 Plus - Enhanced model",
    "glm-4-air": "GLM-4 Air - Fast and lightweight",
    "glm-4-airx": "GLM-4 AirX - Extended context",
    "glm-4-flash": "GLM-4 Flash - Fastest inference",
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


def _build_messages(
    prompt: str,
    agent_role: str = "default",
    context_files: list[str] | None = None,
) -> list[dict]:
    """Build message array with system prompt, context, and user prompt."""
    messages = []

    # System prompt from role
    system_prompt = ROLE_SYSTEM_PROMPTS.get(agent_role, ROLE_SYSTEM_PROMPTS["default"])
    messages.append({"role": "system", "content": system_prompt})

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
    return messages


async def _call_zai(
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    thinking: bool = True,
    temperature: float = 1.0,
    max_tokens: int = MAX_TOKENS,
) -> dict:
    """Make the actual API call to Z.AI."""
    api_key = _get_api_key()

    body: dict = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if thinking:
        body["thinking"] = {"type": "enabled"}

    async with httpx.AsyncClient() as client:
        response = await client.post(
            ZAI_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            json=body,
            timeout=DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        return response.json()


def _extract_content(data: dict) -> str:
    """Extract text content from Z.AI response."""
    if "choices" not in data or not data["choices"]:
        return "(no response)"
    choice = data["choices"][0]
    return choice.get("message", {}).get("content", "(empty)")


def _extract_usage(data: dict) -> str:
    """Extract token usage info."""
    usage = data.get("usage", {})
    if not usage:
        return ""
    parts = []
    if "prompt_tokens" in usage:
        parts.append(f"prompt: {usage['prompt_tokens']}")
    if "completion_tokens" in usage:
        parts.append(f"completion: {usage['completion_tokens']}")
    if "total_tokens" in usage:
        parts.append(f"total: {usage['total_tokens']}")
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
        model: Z.AI model to use (glm-4.7, glm-4-plus, glm-4-air, glm-4-airx, glm-4-flash).
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
                messages = _build_messages(actual_prompt, agent_role, context_files)
                data = await _call_zai(messages, model=model, thinking=thinking)
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
        messages = _build_messages(actual_prompt, agent_role, context_files)
        data = await _call_zai(messages, model=model, thinking=thinking)
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
