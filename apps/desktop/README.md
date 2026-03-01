# AI Monitor Desktop Client

Electron-based desktop application for local agent execution.

## Features (Phase 4)
- Run AI agents locally for maximum privacy
- WebSocket relay to cloud control plane
- BYOK (Bring Your Own Key) for LLM APIs
- Ollama integration for offline inference
- Reuses web dashboard React components

## Architecture
- Electron main process spawns Python child process
- Python process runs CrewAI orchestration locally
- WebSocket connection to cloud for external message routing
