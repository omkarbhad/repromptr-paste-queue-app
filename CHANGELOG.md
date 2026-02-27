# Changelog

All notable changes to Pastr are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-27

### Added
- Initial release of Pastr
- Cross-platform support: macOS, Windows, Linux
- Multi-architecture support: x86-64, ARM64, ARMv7 (Raspberry Pi)
- Floating always-on-top clipboard queue window
- Sequential paste with "Paste Next" button (Space key)
- Auto-remove toggle for items after pasting
- Undo functionality (Cmd+Z / Ctrl+Z)
- Keyboard shortcuts:
  - Space: Paste next item
  - Cmd+Z (macOS) / Ctrl+Z (Win/Linux): Undo
  - Esc: Hide window
- Dark glassmorphic UI design
- Keyboard shortcut hints in empty state
- Window position persistence
- Right-click context menu (Copy, Move to Top, Delete)
- Inline delete buttons on queue items
- Item count display
- Status bar with feedback messages
- Clipboard size limit (50KB) to prevent memory bloat
- Duplicate handling (move to top instead of duplicating)
- Empty string filtering (ignores whitespace-only copies)
- Platform-specific paste simulation:
  - macOS: osascript (Cmd+V)
  - Windows: PowerShell SendKeys (Ctrl+V)
  - Linux: xdotool with ydotool fallback (Ctrl+V)
- Build configuration for all platforms and architectures
- Comprehensive documentation with platform-specific guides

### Technical Details
- Built with Electron 33.4.11
- Pure vanilla JavaScript (no framework)
- Minimal dependencies (only Electron required)
- Lucide icons via CDN
- Optimized performance:
  - Icon rendering on-demand
  - Text comparison before DOM updates
  - Efficient array operations
  - Clipboard polling every 1000ms
- Secure IPC with contextIsolation enabled

### Supported Platforms
- **macOS**: 10.12+ (Intel x64 & Apple Silicon ARM64)
- **Windows**: 7+ (x86-64, x86, ARM64)
- **Linux**: Any distribution (x86-64, ARM64, ARMv7)

### Known Limitations
- Paste simulation requires platform-specific tools:
  - macOS: Accessibility permissions
  - Linux: xdotool or ydotool
- Clipboard items truncated at 50KB
- Max history of 30 items
- No RichText support (plain text only)

## Future Roadmap

### Planned Features
- [ ] Clipboard history persistence (save to disk)
- [ ] Search functionality
- [ ] Regex filtering
- [ ] Custom keyboard shortcuts
- [ ] Appearance customization (themes)
- [ ] Sync across devices
- [ ] Browser extension
- [ ] Mobile companion app

### Infrastructure
- [ ] Automated releases
- [ ] Update notifications
- [ ] Analytics (opt-in)
- [ ] Community website

---

For detailed information about changes, please check the [Git history](https://github.com/pastr/pastr/commits/main).
