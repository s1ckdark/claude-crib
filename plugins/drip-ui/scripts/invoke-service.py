#!/usr/bin/env python3
"""
invoke-service.py - Unified service invocation for Drip UI

Usage:
    python invoke-service.py <service> <prompt> [--image <path>]

Services:
    v0      - Vercel v0.dev (requires V0_API_KEY)
    gemini  - Google Gemini (OAuth or GOOGLE_API_KEY)
    zai     - Z.ai GLM (requires Z_AI_API_KEY)

Examples:
    python invoke-service.py v0 "Create a login form"
    python invoke-service.py gemini "Create a dashboard" --image mockup.png
    python invoke-service.py zai "Create a button component"
"""

import argparse
import asyncio
import base64
import json
import os
import sys
from pathlib import Path

try:
    import httpx
except ImportError:
    print("Error: httpx not installed. Run: pip install httpx")
    sys.exit(1)


async def invoke_v0(prompt: str) -> dict:
    """Invoke v0.dev API."""
    api_key = os.environ.get("V0_API_KEY")
    if not api_key:
        return {"error": "V0_API_KEY not set", "service": "v0"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.v0.dev/v1/chat",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={"messages": [{"role": "user", "content": prompt}]},
                timeout=120.0,
            )
            response.raise_for_status()
            return {
                "service": "v0",
                "content": response.json(),
                "status": "success",
            }
        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}", "service": "v0"}
        except Exception as e:
            return {"error": str(e), "service": "v0"}


async def invoke_gemini(prompt: str, image_path: str = None) -> dict:
    """Invoke Google Gemini API."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return {"error": "GOOGLE_API_KEY not set (or use OAuth)", "service": "gemini"}

    parts = [{"text": prompt}]

    # Add image if provided (multimodal)
    if image_path:
        image_path = Path(image_path)
        if not image_path.exists():
            return {"error": f"Image not found: {image_path}", "service": "gemini"}

        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

        mime_type = "image/png" if image_path.suffix == ".png" else "image/jpeg"
        parts.append({"inline_data": {"mime_type": mime_type, "data": image_data}})

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent?key={api_key}",
                headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": parts}]},
                timeout=120.0,
            )
            response.raise_for_status()
            data = response.json()

            # Extract text from response
            content = ""
            if "candidates" in data and data["candidates"]:
                parts = data["candidates"][0].get("content", {}).get("parts", [])
                content = "".join(p.get("text", "") for p in parts)

            return {
                "service": "gemini",
                "content": content,
                "status": "success",
            }
        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}", "service": "gemini"}
        except Exception as e:
            return {"error": str(e), "service": "gemini"}


async def invoke_zai(prompt: str) -> dict:
    """Invoke Z.ai API (OpenAI compatible)."""
    api_key = os.environ.get("Z_AI_API_KEY")
    if not api_key:
        return {"error": "Z_AI_API_KEY not set", "service": "zai"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.z.ai/api/paas/v4/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "glm-4.7",
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=120.0,
            )
            response.raise_for_status()
            data = response.json()

            content = ""
            if "choices" in data and data["choices"]:
                content = data["choices"][0].get("message", {}).get("content", "")

            return {
                "service": "zai",
                "content": content,
                "status": "success",
            }
        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}", "service": "zai"}
        except Exception as e:
            return {"error": str(e), "service": "zai"}


async def main():
    parser = argparse.ArgumentParser(description="Invoke AI service for UI generation")
    parser.add_argument("service", choices=["v0", "gemini", "zai", "all"])
    parser.add_argument("prompt", help="Design prompt")
    parser.add_argument("--image", help="Image path for multimodal (Gemini only)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    if args.service == "all":
        # Run all services in parallel
        tasks = [
            invoke_v0(args.prompt),
            invoke_gemini(args.prompt, args.image),
            invoke_zai(args.prompt),
        ]
        results = await asyncio.gather(*tasks)
    elif args.service == "v0":
        results = [await invoke_v0(args.prompt)]
    elif args.service == "gemini":
        results = [await invoke_gemini(args.prompt, args.image)]
    elif args.service == "zai":
        results = [await invoke_zai(args.prompt)]

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for result in results:
            print(f"\n=== {result['service'].upper()} ===")
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                print(result.get("content", "No content"))


if __name__ == "__main__":
    asyncio.run(main())
