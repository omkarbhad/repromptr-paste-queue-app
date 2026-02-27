# 📋 Pastr — Advanced Clipboard Queue Manager

> A beautiful, floating clipboard history manager for **macOS**, **Windows**, and **Linux** with seamless keyboard shortcuts, cross-platform support, and instant paste functionality. Built with Electron for maximum compatibility across all processors and architectures.

**Author:** Omkar Bhad
**License:** MIT
**Version:** 1.0.0

---

## 📖 Overview

Pastr is a production-ready Electron application that transforms your clipboard management workflow. Instead of manually managing copy-paste operations, Pastr maintains a persistent, searchable clipboard history that you can access instantly with keyboard shortcuts.

The application runs as a lightweight, always-on-top floating window that monitors your system clipboard in real-time and maintains a queue of all copied items. With a single keystroke (Space), you can sequentially paste items from your history, dramatically improving productivity for tasks involving multiple copy-paste operations.

### Why Pastr?

- ✨ **Beautiful glassmorphic UI** with dark theme optimized for modern workflows
- 🚀 **Instant access** — lightweight floating window always accessible
- ⌨️ **Keyboard-first design** — Space to paste, Cmd+Z/Ctrl+Z to undo, Esc to hide
- 🔄 **Sequential pasting** — paste multiple items with repeated key presses
- 🗑️ **Smart auto-remove** — automatically delete items after pasting (configurable)
- 💾 **Window persistence** — remembers your preferred position
- 🔒 **Privacy-focused** — no cloud, no tracking, no accounts required
- 🌍 **True cross-platform** — works on Intel, Apple Silicon, ARM, and 32-bit processors

---

## ✨ Key Features

### Core Functionality
- **Real-time Clipboard Monitoring** — captures every copy operation automatically
- **Queue Management** — maintain up to 30 items in your clipboard history
- **Sequential Paste** — press Space repeatedly to paste items in order
- **Instant Paste** — click any item to paste its contents immediately
- **Undo Deletion** — recover accidentally deleted items with Cmd+Z or Ctrl+Z

### User Experience
- **Sticky Toggle** — pin window to stay always-on-top or let it behave normally
- **Auto-Remove** — automatically delete items after pasting (default enabled)
- **Context Menu** — right-click items for copy, delete, or move-to-top options
- **Empty State UX** — clean, intuitive interface when no items are queued
- **Window Persistence** — remembers window position across sessions

### Technical Excellence
- **Zero Dependencies** (except Electron) — minimal attack surface
- **Secure IPC** — context isolation prevents code injection attacks
- **Performance Optimized** — 1000ms clipboard polling with smart deduplication
- **Cross-Platform Paste** — native integration for each OS:
  - **macOS:** AppleScript keystroke simulation (`osascript`)
  - **Windows:** PowerShell automation
  - **Linux:** xdotool with ydotool fallback

### Accessibility
- **No Setup Required** — works out of the box
- **Minimal Permissions** — only requests Accessibility access on macOS
- **Lightweight** — runs silently in background without stealing focus

---

## 🏗️ Architecture

### System Design

```
╔═══════════════════════════════════════════════════════════╗
║              Pastr Application Architecture              ║
╚═══════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────┐
│                   MAIN PROCESS (main.js)                │
│                                                          │
│  ┌─ Clipboard Monitor (1000ms polling)               │
│  ├─ Platform Detection (macOS/Windows/Linux/ARM)     │
│  ├─ Paste Simulation (osascript/PowerShell/xdotool)  │
│  ├─ Window Management & Positioning                  │
│  ├─ IPC Event Handlers                               │
│  └─ History Queue (max 30 items)                     │
│                                                          │
│  Exposed via ipcMain handlers:                          │
│    • paste-item, paste-next, copy-item                │
│    • delete-item, move-to-top, clear-all             │
│    • toggle-sticky, set-auto-remove                  │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │  IPC (Inter-Process Communication) │
         │     via contextBridge (secure)      │
         └─────────────────┬─────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              RENDERER PROCESS (index.html)              │
│                                                          │
│  ┌─ UI Layer                                         │
│  │  • Dark glassmorphic design                       │
│  │  • Queue item rendering                          │
│  │  • Empty state management                        │
│  │                                                    │
│  ├─ Event Handlers                                  │
│  │  • Keyboard shortcuts (Space, Cmd+Z, Esc)       │
│  │  • Click/right-click actions                     │
│  │  • Auto-remove & sticky toggles                 │
│  │                                                    │
│  └─ State Management                                │
│     • history[] — clipboard queue                   │
│     • autoRemove, isPasting, undoStack              │
│                                                          │
│  API Bridge (via window.api):                         │
│    • pasteItem, pasteNext, copyItem                  │
│    • deleteItem, moveToTop, clearAll                │
│    • toggleSticky, minimizeApp, closeApp            │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │  Preload Script (preload.js)      │
         │  • contextBridge.exposeInMainWorld│
         │  • Secure API gateway            │
         │  • No Node.js access in renderer │
         └─────────────────┬─────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │   Operating System Integration   │
        ├──────────────────────────────────┤
        │ • System Clipboard Access        │
        │ • Native Keystroke Simulation    │
        │ • Window Manager Integration     │
        └──────────────────────────────────┘
```

### Platform-Specific Paste Flow

```
╔══════════════════════════════════════════════════════════╗
║         User Action: Click Paste or Press Space          ║
╚══════════════════════════════════════════════════════════╝
                          │
                          ▼
        ┌─────────────────────────────────┐
        │   RENDERER PROCESS (index.html)  │
        │  • Captures keyboard/click event │
        │  • Invokes window.api.pasteItem()│
        └─────────────────┬───────────────┘
                          │
              ipcRenderer.invoke("paste-item")
                          │
                          ▼
        ┌─────────────────────────────────┐
        │   PRELOAD SCRIPT (preload.js)   │
        │  • Routes IPC to main process   │
        └─────────────────┬───────────────┘
                          │
                  ipcMain.handle()
                          │
                          ▼
        ┌─────────────────────────────────┐
        │   MAIN PROCESS (main.js)        │
        │  simulatePaste() function       │
        └──────┬────────────────────────┬─┘
               │                        │
        Platform Detection              │
               │                        │
      ┌────────┼────────┐              │
      │        │        │              │
      ▼        ▼        ▼              │
   ┌─────┐ ┌──────┐ ┌──────┐          │
   │ macOS   Windows  Linux │          │
   ├─────┤ ├──────┤ ├──────┤          │
   │execFile│execFile│execFile         │
   │osascript PowerShell  xdotool     │
   │        │ +fallback   +fallback    │
   │keystroke  ydotool    ydotool     │
   └─────┘ └──────┘ └──────┘          │
      │        │        │              │
      └────────┼────────┘              │
               │                        │
               ▼                        ▼
        ┌──────────────────┐    ┌─────────────┐
        │ Execute Command  │    │ Update      │
        │ (platform native)│────► Clipboard   │
        └──────────────────┘    └─────────────┘
               │                        │
               ▼                        ▼
        ┌────────────────────────────────┐
        │ Simulate Keystroke             │
        │ (Cmd+V / Ctrl+V / Ctrl+V)      │
        └──────────┬─────────────────────┘
                   │
                   ▼
        ┌────────────────────────────────┐
        │ Target Application             │
        │ Receives Paste Successfully ✓  │
        └────────────────────────────────┘
```

---

## 🗂️ Repository Structure

```
scripts/paste-queue-app/
├── 📄 README.md                    # Quick start guide (condensed)
├── 📄 DETAILED_README.md           # This comprehensive documentation
├── 📄 CONTRIBUTING.md              # Contribution guidelines & development workflow
├── 📄 CHANGELOG.md                 # Version history & feature roadmap
├── 📄 SECURITY.md                  # Security policies & disclosure procedures
├── 📄 LICENSE                      # MIT License
│
├── 📄 package.json                 # Project manifest & Electron-builder config
├── 📄 package-lock.json            # Locked dependency versions
│
├── 🎯 main.js                      # Electron main process
│                                    #  • Clipboard monitoring loop
│                                    #  • Platform-specific paste simulation
│                                    #  • IPC request handlers
│                                    #  • Window management
│                                    #  • Position persistence
│
├── 🎨 index.html                   # Single-file UI (HTML + CSS + JS)
│                                    #  • Dark glassmorphic theme
│                                    #  • Queue rendering & animations
│                                    #  • Keyboard shortcuts handler
│                                    #  • Right-click context menus
│
├── 🔐 preload.js                   # Electron preload script
│                                    #  • Secure IPC bridge via contextBridge
│                                    #  • Exposes window.api for UI
│                                    #  • No direct Node.js access in renderer
│
├── .github/
│   ├── FUNDING.yml                 # Sponsorship configuration
│   ├── dependabot.yml              # Automated dependency updates
│   ├── workflows/
│   │   ├── build.yml               # CI/CD: Multi-platform builds
│   │   └── lint.yml                # CI/CD: Code quality & security checks
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md           # Bug report template with platform matrix
│   │   └── feature_request.md      # Feature request template
│   └── pull_request_template.md    # PR checklist with platform/arch matrix
│
├── .gitignore                      # Git exclusions (node_modules, dist, etc.)
│
└── dist/                           # Build output (generated)
    ├── Pastr-1.0.0-x64.dmg        # macOS Intel installer
    ├── Pastr-1.0.0-arm64.dmg      # macOS Apple Silicon installer
    ├── Pastr Setup 1.0.0-x64.exe   # Windows x86-64 installer
    ├── Pastr-1.0.0-arm64.AppImage  # Linux ARM64 AppImage
    └── ... (other platform builds)
```

### File Responsibilities

| File | Lines | Purpose | Key Components |
|------|-------|---------|-----------------|
| **main.js** | ~450 | Electron main process | Clipboard polling, paste simulation, IPC, window mgmt |
| **index.html** | ~400 | UI & frontend logic | Glassmorphic design, queue rendering, keyboard shortcuts |
| **preload.js** | ~27 | Secure IPC bridge | contextBridge.exposeInMainWorld with API methods |
| **package.json** | ~115 | Project config | Electron-builder config for 3 OS × 7 architectures |

---

## 🚀 Installation & Quick Start

### Prerequisites
- **Node.js** 18+ and npm (for development)
- **macOS 10.12+** / **Windows 7+** / **Linux** (any modern distro)
- On **macOS**: Grant Accessibility permission (System Preferences → Security & Privacy → Accessibility)
- On **Linux**: Install `xdotool` → `sudo apt-get install xdotool`

### Installation Steps

#### Option 1: Download Pre-Built Binary
Download the latest release for your platform from [GitHub Releases](https://github.com/omkarbhad/pastr-paste-queue-app/releases):
- **macOS**: Download `.dmg` file for your processor (Intel or Apple Silicon)
- **Windows**: Download `.exe` installer or portable `.exe`
- **Linux**: Download `.AppImage` or `.deb` package

#### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/omkarbhad/pastr-paste-queue-app.git
cd pastr

# Install dependencies
npm install

# Run in development mode
npm start

# Build for current platform
npm run build

# Build for all platforms & architectures
npm run build:all

# Build for specific platform
npm run build:mac    # Intel + Apple Silicon universal
npm run build:win    # x86-64, x86, ARM64
npm run build:linux  # x86-64, ARM64, ARMv7 (Raspberry Pi)
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Space** | Paste Next | Paste first item in queue and remove it (if auto-remove enabled) |
| **Cmd+Z** (Mac) | Undo Deletion | Recover last deleted item |
| **Ctrl+Z** (Win/Linux) | Undo Deletion | Recover last deleted item |
| **Esc** | Hide Window | Minimize Pastr window |

### Mouse Actions
- **Click item** — Paste immediately and close window
- **Right-click item** — Context menu (Copy, Move to Top, Delete)
- **Click trash icon** — Delete single item
- **Click "Clear All"** — Empty entire queue (with confirmation)
- **Click pin icon** — Toggle sticky/always-on-top mode

---

## 🛠️ Usage Guide

### Basic Workflow

1. **Copy Anywhere** → Text appears in Pastr queue automatically
2. **Sequential Paste** → Press Space repeatedly to paste items in order
3. **Quick Paste** → Click any item to paste immediately
4. **Manage Queue** → Right-click for options (copy, delete, reorder)
5. **Auto-Clean** → Items automatically removed after pasting (configurable)

### Advanced Usage

#### Toggle Auto-Remove
- Click the **trash icon** button in the title bar
- When enabled (default): pasted items automatically deleted
- When disabled: items stay in queue until manually removed

#### Sticky Mode
- Click the **pin icon** in title bar to lock window always-on-top
- In sticky mode: window stays visible above all other windows
- Click again to disable and allow normal window behavior

#### Undo Deleted Items
- Accidentally deleted an item? Press **Cmd+Z** or **Ctrl+Z** immediately
- Recovers the last deleted item to the queue
- Limited to recent deletions

#### Context Menu (Right-Click)
- **Copy** — Copy item text to clipboard without pasting
- **Move to Top** — Prioritize item to front of queue
- **Delete** — Remove item from queue

---

## 📦 Technologies & Dependencies

### Core Technologies
- **Electron 33.4+** — Cross-platform desktop application framework
- **Electron-builder 24.9+** — Multi-platform build & packaging tool
- **Node.js 18+** — JavaScript runtime (development only)

### No Runtime Dependencies
The application ships with **only Electron** as a runtime dependency. No heavy frameworks, no jQuery, no React — pure vanilla JavaScript for a lightweight, fast, secure experience.

### Frontend
- **HTML5** — Semantic markup
- **CSS3** — Glassmorphic design, animations, flexbox layouts
- **Vanilla JavaScript** — No framework overhead
- **Lucide Icons CDN** — Beautiful, consistent icon library

### Native Integrations
- **macOS:** AppleScript via `osascript` (built-in)
- **Windows:** PowerShell (built-in) for clipboard automation
- **Linux:** `xdotool` (external, user-installed) or `ydotool` (fallback)

### Development Tools
- **npm audit** — Security vulnerability scanning (CI/CD)
- **GitHub Actions** — Automated testing & building
- **Dependabot** — Automated dependency updates

---

## 🔧 Configuration

### Window Configuration (main.js)

```javascript
const window = new BrowserWindow({
  width: 320,
  height: 480,
  minWidth: 280,
  minHeight: 200,
  frame: false,                    // Frameless for custom title bar
  transparent: true,               // Transparent background
  alwaysOnTop: true,               // Default sticky mode
  type: "panel",                   // Prevent focus stealing
  webPreferences: {
    contextIsolation: true,        // ✅ Secure: isolate main/renderer
    nodeIntegration: false,        // ✅ Secure: no Node.js in renderer
    preload: preload.js            // ✅ Secure: bridge via preload
  }
});
```

### Clipboard Configuration (main.js)

```javascript
const MAX_ITEMS = 30;              // Maximum items in queue
const POLL_INTERVAL = 1000;        // Check clipboard every 1000ms
const IGNORE_TIMEOUT = 400;        // Ignore self-triggered copies
```

### Theme Customization (index.html CSS Variables)

```css
:root {
  --bg:          #0a0a0e;         /* Main background */
  --bg-card:     #161620;         /* Card/item background */
  --accent:      #7c6cf0;         /* Primary accent (purple) */
  --green:       #34d399;         /* Success/paste color */
  --red:         #f87171;         /* Delete/danger color */
  --text:        rgba(255,255,255,0.92);  /* Primary text */
  --text2:       rgba(255,255,255,0.50);  /* Secondary text */
}
```

---

## ✅ Requirements & Platform Support

### System Requirements

| OS | Version | Architectures | Status |
|-----|---------|---|----------|
| **macOS** | 10.12+ | Intel (x64), Apple Silicon (arm64) | ✅ Fully Supported |
| **Windows** | 7+ | x86-64, x86 (32-bit), ARM64 | ✅ Fully Supported |
| **Linux** | Any modern | x86-64, ARM64, ARMv7 (Raspberry Pi) | ✅ Fully Supported |

### Processor Support
- ✅ **Intel x86-64** — Traditional laptop/desktop processors
- ✅ **Apple Silicon** — M1, M2, M3 and newer Macs
- ✅ **ARM64** — Modern ARM servers, some Windows devices
- ✅ **ARMv7** — Raspberry Pi 2+ and older ARM boards
- ✅ **x86 32-bit** — Legacy Windows systems

### Permission Requirements

**macOS:**
- Accessibility permission required for keystroke simulation
- Auto-prompted on first paste attempt
- Grant in: System Preferences → Security & Privacy → Accessibility

**Windows:**
- PowerShell execution required (built-in on all modern Windows)
- No special permissions needed

**Linux:**
- `xdotool` package required: `sudo apt-get install xdotool`
- Fallback to `ydotool` if `xdotool` unavailable
- For Wayland: ensure `xdotool` works on your desktop

---

## 🤝 Contributing

### Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/pastr.git
   cd pastr
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
5. **Run** in development:
   ```bash
   npm start
   ```

### Development Workflow

- **Code Style:** JavaScript, single quotes, semicolons
- **Testing:** Test on at least 2 platforms (macOS, Windows, or Linux)
- **Commits:** Descriptive messages following `Type: Description` format
  - Example: `feat: add paste undo functionality`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`

### Before Submitting PR

- ✅ Test on your platform(s)
- ✅ Run `npm run build` — ensure no build errors
- ✅ Check `.github/workflows/lint.yml` passes locally
- ✅ Update documentation if adding features
- ✅ Add yourself to the acknowledgements if desired

### Architecture Guidelines

- **Minimal dependencies** — Use only Electron, no heavy frameworks
- **Vanilla JavaScript** — Keep code simple and maintainable
- **Platform abstraction** — Use platform detection constants for OS-specific code
- **Security first** — Context isolation, no eval, input validation
- **Performance** — Optimize clipboard polling, avoid redundant renders

### Common Contributions

- **Bug fixes** — Always welcome
- **Platform-specific fixes** — Especially Linux improvements
- **Performance optimizations** — Reduced CPU/memory usage
- **UI enhancements** — Better animations, accessibility
- **Documentation** — Clarifying code, adding examples
- **Localization** — Translations for non-English users

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🔐 Security

### Security Architecture
- ✅ **Context Isolation** — Main and renderer processes completely isolated
- ✅ **No Node Integration** — Node.js APIs not accessible from UI
- ✅ **Preload Security** — Secure bridge via preload script only
- ✅ **No eval()** — No dynamic code execution
- ✅ **Input Validation** — All clipboard items validated before storage
- ✅ **Clipboard Size Limits** — Items truncated at 50KB to prevent DoS

### Data Safety
- 🔒 **No Cloud Storage** — Clipboard stays local to your machine
- 🔒 **No Tracking** — No analytics, no telemetry, no ads
- 🔒 **No Accounts** — No login, no user data collection
- 🔒 **No Network** — Application never connects to the internet
- 🔒 **Optional Persistence** — Clipboard items not saved to disk by default

### Reporting Security Issues
If you discover a security vulnerability, **please do not open a public issue.** Instead, email [security@pastr.local](mailto:security@pastr.local) with:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if available)

See [SECURITY.md](SECURITY.md) for full security policy and responsible disclosure timeline.

---

## 🐛 Troubleshooting

### Paste Not Working?

**macOS:**
- Ensure Accessibility permission granted: System Preferences → Security & Privacy → Accessibility
- Check Pastr is in the list (add it if missing)
- Restart the application

**Windows:**
- Ensure PowerShell is available and accessible
- Try running as administrator
- Check Windows Defender isn't blocking clipboard access

**Linux:**
- Install xdotool: `sudo apt-get install xdotool`
- For Wayland, install `ydotool`: `sudo apt-get install ydotool`
- Ensure xdotool/ydotool can access your display

### Window Position Not Saved?

Delete the position cache file and restart:
```bash
rm ~/.pastr-window-pos
# Restart Pastr
```

### Clipboard Monitoring Not Working?

- Ensure `npm install` completed successfully
- Check Node modules aren't corrupted: `rm -rf node_modules && npm install`
- Verify Electron installation: `npx electron --version`

### High CPU Usage?

- Check clipboard polling interval (default 1000ms)
- Close other clipboard manager apps that might conflict
- Report the issue with platform/architecture details

### Application Crashes?

1. Check system logs: `tail -100 ~/.Pastr/error.log` (if available)
2. Try rebuilding: `npm install && npm start`
3. Update to latest version
4. Open an issue with platform, architecture, and error details

### Keyboard Shortcuts Not Working?

- Ensure application window has focus (click title bar)
- Check if another app is hijacking shortcuts (disable temporarily)
- Verify keyboard layout supports modifier keys (Cmd, Ctrl, etc.)

See [SECURITY.md](SECURITY.md) for more known limitations and solutions.

---

## 📝 Development Changelog

### v1.0.0 (Current)
- ✨ Multi-platform release (macOS, Windows, Linux)
- ✨ Cross-architecture support (Intel, ARM, 32-bit)
- ✨ Beautiful glassmorphic UI with dark theme
- 🔄 Sequential paste with Space key
- 🗑️ Auto-remove after pasting (configurable)
- ⌘Z Undo for deleted items
- 💾 Window position memory
- 🔐 Secure Electron architecture with context isolation
- 🚀 Optimized performance (1000ms polling, smart deduplication)
- 🎯 Comprehensive CI/CD with GitHub Actions

### Future Roadmap
- 🎯 Search/filter functionality within queue
- 🎯 Clipboard item preview (markdown, code formatting)
- 🎯 Keyboard shortcuts customization
- 🎯 Sync between devices (optional)
- 🎯 Item categorization & tags
- 🎯 Favorites & frequently used items
- 🎯 Rich text & image clipboard support

See [CHANGELOG.md](CHANGELOG.md) for full version history.

---

## ❤️ Acknowledgements

- **Lucide Icons** — Beautiful icon library used in the UI
- **Electron** — Enabling cross-platform desktop development
- **Electron-builder** — Simplifying multi-platform builds
- **Community** — Thanks to all contributors and users

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

You're free to use, modify, and distribute Pastr for any purpose, commercial or otherwise.

---

## 🔗 Quick Links

- 📦 **Releases:** https://github.com/omkarbhad/pastr-paste-queue-app/releases
- 🐛 **Issue Tracker:** https://github.com/omkarbhad/pastr-paste-queue-app/issues
- 🤝 **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- 🔐 **Security:** [SECURITY.md](SECURITY.md)
- 📋 **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

**Built with ❤️ by Omkar Bhad**

*Last Updated: February 2026*
