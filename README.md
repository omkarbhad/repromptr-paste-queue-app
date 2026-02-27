# Repromptr

> AI-powered clipboard queue manager for **macOS**, **Windows**, and **Linux**. Copy text, rewrite it with AI, and paste — all from a floating window.

**Author:** Omkar Bhad
**License:** MIT
**Version:** 2.0.0

---

## What It Does

Repromptr is a lightweight Electron app that sits as a floating panel on your screen. It monitors your clipboard, maintains a queue of copied items, and lets you rewrite any text using AI before pasting it.

Three tabs:
- **Repromptr** — AI text rewriting with streaming output and style presets
- **Queue** — Clipboard history with one-click paste (items auto-removed after use)
- **Saved** — Bookmarked prompts for reuse, persisted to disk

### Key Features

- **AI Rewriting** — Improve, formalize, condense, expand, or grammar on any text
- **Streaming Output** — Character-by-character typing animation as the AI responds
- **Multiple Providers** — OpenAI, Claude (Anthropic), OpenRouter, or any custom endpoint
- **Custom System Prompt** — Override the default AI behavior
- **Clipboard Queue** — Up to 30 items, auto-captured from system clipboard
- **One-Time Paste** — Queue items are removed after pasting
- **Keyboard-First** — Space to paste next, Cmd+Z to undo, Esc to hide
- **Always-On-Top** — Floating panel that doesn't steal focus
- **Cross-Platform** — macOS (Intel + Apple Silicon), Windows, Linux (x64, ARM64, ARMv7)

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- On **macOS**: Grant Accessibility permission (System Settings > Privacy & Security > Accessibility)
- On **Linux**: Install `xdotool` (`sudo apt-get install xdotool`)

### Install & Run

```bash
git clone https://github.com/omkarbhad/repromptr.git
cd repromptr
npm install
npm start
```

### Build

```bash
npm run build          # Current platform
npm run build:mac      # macOS (Intel + Apple Silicon)
npm run build:win      # Windows (x64, x86, ARM64)
npm run build:linux    # Linux (x64, ARM64, ARMv7)
npm run build:all      # All platforms
```

---

## AI Configuration

Click the gear icon in the Repromptr tab to open the config window, or edit `~/.repromptr-config` directly:

```json
{
  "provider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4o-mini",
  "baseUrl": "",
  "systemPrompt": ""
}
```

### Supported Providers

| Provider | Default Model | Notes |
|----------|--------------|-------|
| **OpenAI** | `gpt-4o-mini` | Standard OpenAI API |
| **Claude** | `claude-haiku-4-5-20251001` | Anthropic API |
| **OpenRouter** | `openai/gpt-4o-mini` | Multi-provider gateway |
| **Custom** | (user-defined) | Any OpenAI-compatible endpoint |

### Style Presets

| Chip | What It Does |
|------|-------------|
| **Improve** | General clarity and quality improvements |
| **Formal** | Professional, formal tone |
| **Concise** | Shorter, to the point |
| **Expand** | More detail and context |
| **Grammar** | Corrects only grammar/spelling errors, preserves everything else |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Space** | Paste next item from queue |
| **Cmd+V** / **Ctrl+V** | Paste next item from queue |
| **Cmd+Z** / **Ctrl+Z** | Undo last deletion |
| **Esc** | Hide window |

### Mouse Actions
- **Click item** — Paste immediately (removes from queue)
- **Right-click item** — Context menu: Copy, Move to Top, Save as Prompt, Send to Repromptr, Delete
- **Click trash icon** — Delete single item
- **Click pin icon** — Toggle always-on-top

---

## How It Works

```
┌──────────────────────────────────────────────────┐
│ Main Process (main.js)                           │
│  - Clipboard polling (800ms interval)            │
│  - AI streaming (OpenAI / Claude / OpenRouter)   │
│  - Paste simulation (osascript / PowerShell /    │
│    xdotool)                                      │
│  - Window management, tray icon                  │
│  - Config & prompts persistence (~/.repromptr-*)     │
├──────────────────────────────────────────────────┤
│ Preload (preload.js)                             │
│  - Secure IPC bridge via contextBridge           │
├──────────────────────────────────────────────────┤
│ Renderer (index.html + config.html)              │
│  - Three-tab UI: Repromptr, Queue, Saved         │
│  - Streaming typing animation (requestAF)        │
│  - Thinking indicator + style chips              │
│  - Context menu, keyboard shortcuts              │
└──────────────────────────────────────────────────┘
```

### Paste Flow
1. User clicks an item or presses Space
2. Main process writes text to system clipboard
3. Window goes invisible (`setOpacity(0)`) and releases focus (`setFocusable(false)`)
4. Platform-specific keystroke simulation (Cmd+V / Ctrl+V)
5. Window restores visibility; item removed from queue

### AI Streaming Flow
1. User enters text, selects a style chip, clicks Enhance
2. Main process sends request to AI provider via `https`
3. Server-sent events (SSE) are parsed and forwarded to renderer
4. Renderer buffers characters and drains them via `requestAnimationFrame` at ~120 chars/sec
5. Thinking spinner shown until first token arrives

---

## Files

| File | Purpose |
|------|---------|
| `main.js` | Electron main process — clipboard, AI, paste, IPC, tray |
| `index.html` | Single-file UI (HTML + CSS + JS) |
| `preload.js` | Secure IPC bridge |
| `config.html` | AI settings window |
| `repromptr_logo.png` | App icon |
| `package.json` | Project config + electron-builder config |

### Data Files (auto-created in `~/`)
- `~/.repromptr-config` — AI provider settings
- `~/.repromptr-prompts` — Saved prompts
- `~/.repromptr-window-pos` — Window position

---

## Platform Support

| OS | Architectures | Paste Method |
|----|--------------|-------------|
| **macOS** 10.12+ | Intel (x64), Apple Silicon (arm64) | AppleScript `osascript` |
| **Windows** 7+ | x64, x86, ARM64 | PowerShell `SendKeys` |
| **Linux** | x64, ARM64, ARMv7 | `xdotool` (fallback: `ydotool`) |

---

## Troubleshooting

**Paste not working on macOS?**
Grant Accessibility permission: System Settings > Privacy & Security > Accessibility. Add the app if missing, then restart.

**Paste not working on Linux?**
Install xdotool: `sudo apt-get install xdotool`. For Wayland, try `ydotool`.

**AI not responding?**
Check your API key and provider in the config window. Ensure you have API credits.

**Window position reset?**
Delete `~/.repromptr-window-pos` and restart.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy. API keys are stored locally and never sent anywhere except to your configured AI provider.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Built by Omkar Bhad**
