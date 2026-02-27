# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in Pastr, please open a [GitHub Security Advisory](https://github.com/omkarbhad/pastr-paste-queue-app/security/advisories/new) with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if you have one)

**Please do not open public issues for security vulnerabilities.**

We will acknowledge receipt of your report within 48 hours and provide you with a status update.

## Security Practices

### Code Security
- **Context Isolation**: All Electron IPC uses context isolation
- **No Node Integration**: Node.js is not integrated into renderer process
- **Preload Scripts**: Secure IPC bridge via preload script
- **No Eval**: No `eval()` or dynamic code execution
- **Input Validation**: All clipboard items are validated

### Clipboard Safety
- **Size Limits**: Clipboard items truncated at 50KB to prevent DoS
- **No Rich Text**: Plain text only (no code execution vectors)
- **No Persistence**: Clipboard not saved to disk by default
- **Local Only**: No network communication

### Updates
- **No Auto-Update**: Users install updates manually
- **Signed Releases**: (Planned) Releases will be cryptographically signed
- **Transparency**: All changes logged in CHANGELOG

### Dependencies
- **Minimal Dependencies**: Only Electron required
- **Regular Updates**: Dependabot checks for updates weekly
- **Audit**: `npm audit` checked in CI/CD

## Known Limitations

1. **Accessibility Permissions (macOS)**: Paste simulation requires Accessibility access
2. **PowerShell (Windows)**: Uses PowerShell which some corporate networks may restrict
3. **X11/Wayland (Linux)**: xdotool may not work on Wayland; ydotool recommended

## Disclosure Timeline

We follow responsible disclosure:
1. **Day 0**: Report received
2. **Day 1**: Acknowledgment sent
3. **Day 7**: Initial assessment
4. **Day 30**: Patch release planned
5. **Day 90**: Public disclosure (if not already patched)

## Version Support

| Version | Status | Support Until |
|---------|--------|---------------|
| 1.x | Active | Current |
| 0.x | EOL | Not supported |

Only the latest version receives security updates. We recommend updating immediately when security patches are released.

## Security Headers

### Electron Configuration
- `contextIsolation: true` - Isolate main and renderer processes
- `nodeIntegration: false` - Disable Node.js in renderer
- `preload: preload.js` - Secure IPC bridge

### Content Security
- No inline scripts
- All scripts from local files
- No external resource loading

## Third-Party Security

### Electron
- Uses official Electron releases
- Automatically inherits Chromium security updates
- Regularly updated (see dependabot.yml)

### Icons
- Lucide icons loaded from CDN (minimal trust surface)
- Icon loading is isolated in UI layer

## Security Audit

We welcome security audits. If you're interested in auditing Pastr's security:
1. Review the security practices above
2. Check the codebase for common vulnerabilities
3. Test on your platform/architecture
4. Report findings responsibly

## Support

For security-related questions (non-vulnerability):
- Check our FAQ
- Review the source code
- Open a private discussion

---

Thank you for helping keep Pastr secure! 🔒
