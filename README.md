# Pastr — Clipboard Queue Manager

A beautiful, floating clipboard history manager for **macOS**, **Windows**, and **Linux** with keyboard shortcuts. Works on all processors: Intel, Apple Silicon, ARM, and 32-bit.

**Author:** Omkar Bhad

## Features

- ✨ Floating always-on-top window
- 🔄 Sequential paste with Space key
- 🗑️ Auto-remove after pasting (default)
- ⌘Z Undo for deleted items
- 🎨 Dark glassmorphic UI
- 💾 Window position memory
- 🔒 No ads, tracking, or accounts

## Quick Start

### macOS / Windows / Linux

```bash
npm install
npm start
```

**macOS:** Grant Accessibility permission in System Preferences → Security & Privacy → Accessibility

**Linux:** Install `xdotool` first: `sudo apt-get install xdotool`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Paste next item |
| **Cmd+Z / Ctrl+Z** | Undo deletion |
| **Esc** | Hide window |

## How It Works

1. **Copy** text anywhere → appears in queue
2. **Press Space** or click "Paste Next" → pastes first item
3. **Repeat** to paste items sequentially
4. **Auto-remove** (enabled) deletes after pasting

## Building

```bash
# Current platform
npm run build

# All platforms & architectures
npm run build:all

# Specific platform
npm run build:mac    # Intel + Apple Silicon
npm run build:win    # x86-64, x86, ARM64
npm run build:linux  # x86-64, ARM64, ARMv7
```

Output in `dist/` folder.

## Platform Support

| OS | Architectures |
|----|---------------|
| macOS 10.12+ | Intel, Apple Silicon (M1/M2/M3) |
| Windows 7+ | x86-64, x86 (32-bit), ARM64 |
| Linux | x86-64, ARM64, ARMv7 (Raspberry Pi) |

## Troubleshooting

**Paste not working?**
- **macOS:** Grant Accessibility permission
- **Linux:** Install xdotool: `sudo apt-get install xdotool`
- **Windows:** Ensure PowerShell is available

**Window position not saved?** Delete `~/.pastr-window-pos` and restart.

## Development

```bash
npm start          # Run in development
npm run build:all  # Build for all platforms
```

## License

MIT

---

**Contributions welcome!** See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
