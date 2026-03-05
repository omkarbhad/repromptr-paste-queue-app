# Changelog

All notable changes to Repromptr are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2026-03-05)


### Features

* add Saved Prompts feature with persistent disk storage ([048be1f](https://github.com/omkarbhad/repromptr-paste-queue-app/commit/048be1f8b38dc81ef345592480d1a9b51ab92034))
* Repromptr v2.0.0 — AI-powered text rewriting with streaming ([1bfa1b0](https://github.com/omkarbhad/repromptr-paste-queue-app/commit/1bfa1b0646a5e83a65949ad8b0f4cb577cccc9c1))

## [2.0.0] - 2026-02-27

### Added
- **AI Reprompt tab** — rewrite any text using AI (OpenAI, Claude, Anthropic, OpenRouter, or custom endpoint)
- **Streaming responses** — real-time character-by-character typing animation for AI output
- **Thinking indicator** — spinner + pulsing "Thinking..." shown while model processes, transitions to "Enhancing..." on first token
- **Style chips** — one-click presets: Improve, Formal, Concise, Expand, Grammar
- **Custom system prompt** — override the default AI system prompt in config
- **Config window** — separate settings window for AI provider, API key, model, and system prompt
- **One-time paste** — queue items automatically removed after pasting
- **Send to Repromptr** — right-click any queue item to send it to the AI tab
- Custom pixel art logo

### Changed
- Renamed from **repromptr** to **Repromptr**
- Default tab is now Repromptr (AI rewrite) instead of Queue
- Tabbed interface expanded: Repromptr, Queue, Saved
- Paste now uses opacity + focus release for blink-free experience
- Grammar chip restricted to grammar/spelling corrections only

### Technical
- Fire-and-forget streaming via `webContents.send()` (non-blocking IPC)
- Character buffer with `requestAnimationFrame` for smooth typing at ~120 chars/sec
- SSE streaming for OpenAI-compatible and Claude APIs using Node.js `https` module
- AI config persisted to `~/.repromptr-config`

## [1.0.0] - 2025-02-27

### Added
- Initial release as repromptr
- Cross-platform support: macOS, Windows, Linux
- Multi-architecture: x86-64, ARM64, ARMv7
- Floating always-on-top clipboard queue
- Sequential paste with Space key
- Undo with Cmd+Z / Ctrl+Z
- Dark theme UI with Lucide icons
- Window position persistence
- Saved Prompts with disk persistence
- System tray integration
- Right-click context menu
- Clipboard size limit (50KB)

---

For detailed commit history, see the [Git log](https://github.com/omkarbhad/repromptr/commits/main).
