# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in Repromptr, please open a [GitHub Security Advisory](https://github.com/omkarbhad/repromptr/security/advisories/new) with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if you have one)

**Please do not open public issues for security vulnerabilities.**

We will acknowledge receipt within 48 hours.

## Security Practices

### Electron Security
- **Context Isolation**: All IPC uses context isolation
- **No Node Integration**: Node.js is not accessible from the renderer process
- **Preload Scripts**: Secure IPC bridge via preload script only
- **No Eval**: No `eval()` or dynamic code execution

### Data Safety
- **Local Only**: Clipboard data stays on your machine
- **No Tracking**: No analytics, no telemetry
- **No Accounts**: No login or data collection
- **AI API Calls**: API keys stored locally in `~/.repromptr-config`; requests go directly to your configured provider (OpenAI, Anthropic, OpenRouter, or custom)

### Clipboard Safety
- **Size Limits**: Items truncated at 50KB
- **Plain Text Only**: No code execution vectors
- **Queue in Memory**: Clipboard queue not persisted to disk

## API Key Security

- API keys are stored in `~/.repromptr-config` as plain JSON
- Keys are never sent anywhere except to the configured AI provider endpoint
- Keys are never logged or transmitted to third parties
- Consider using file permissions to protect the config file: `chmod 600 ~/.repromptr-config`

## Disclosure Timeline

1. **Day 0**: Report received
2. **Day 1**: Acknowledgment sent
3. **Day 7**: Initial assessment
4. **Day 30**: Patch release planned
5. **Day 90**: Public disclosure

## Version Support

| Version | Status |
|---------|--------|
| 2.x | Active |
| 1.x | EOL |

Only the latest version receives security updates.

---

Thank you for helping keep Repromptr secure!
