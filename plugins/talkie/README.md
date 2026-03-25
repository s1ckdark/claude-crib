# talkie

TTS voice feedback for Claude Code responses using macOS `say`.

## Overview

Talkie reads Claude Code responses aloud using macOS built-in voices. Korean text uses the Yuna voice; English text uses Samantha. Language is auto-detected per response.

## Requirements

- macOS (uses `say` command)
- OMC state API

## Commands

| Command | Description |
|---|---|
| `/talkie:on` | Enable TTS mode — all responses are summarized and read aloud |
| `/talkie:off` | Disable TTS mode (silent) |
| `/talkie:report` | Report mode — voice feedback only on task completion |

## How It Works

A PostToolUse hook checks the current talkie state via OMC `state_read`. When active, it summarizes the response and passes it to `scripts/say.sh`, which auto-detects language and selects the appropriate voice.
