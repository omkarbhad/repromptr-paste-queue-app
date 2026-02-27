# Contributing to Repromptr

Thank you for your interest in contributing to Repromptr! We welcome contributions from everyone.

## Code of Conduct

- Be respectful and inclusive
- Welcome diverse perspectives
- Focus on the code, not the person

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/repromptr.git
   cd repromptr
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running in Development Mode
```bash
npm start
```

### Building for Distribution
```bash
npm run build          # Current platform
npm run build:mac      # macOS
npm run build:win      # Windows
npm run build:linux    # Linux
npm run build:all      # All platforms
```

### Project Structure
```
repromptr/
├── main.js           # Electron main process
├── preload.js        # Secure IPC bridge
├── index.html        # UI and frontend logic
├── config.html       # AI config window
├── repromptr_logo.png
└── package.json      # Dependencies and build config
```

## Making Changes

### Before you start
- Check existing issues to avoid duplicate work
- Discuss major features in an issue first
- Follow the existing code style

### Code Style
- 2-space indentation
- Meaningful variable names
- Comments only for non-obvious logic

### Testing Your Changes
- Test on multiple platforms if possible
- Test keyboard shortcuts
- Test paste functionality
- Test AI streaming with at least one provider

## Submitting Changes

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what and why
   - Platform(s) tested
   - Screenshots if UI changes
3. **Address feedback** from reviewers

## Areas for Contribution

- Bug fixes
- Platform-specific improvements (especially Linux/Wayland)
- Performance optimizations
- UI/UX enhancements
- New AI provider integrations
- Documentation improvements

## Reporting Bugs

Use the [Bug Report](https://github.com/omkarbhad/repromptr/issues/new?template=bug_report.md) template with:
1. Your OS and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Error messages or screenshots

## License

By contributing, you agree your code will be licensed under the MIT License (see [LICENSE](LICENSE)).

Thank you for making Repromptr better!
