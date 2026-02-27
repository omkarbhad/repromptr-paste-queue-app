# Contributing to Pastr

Thank you for your interest in contributing to Pastr! We welcome contributions from everyone.

## Code of Conduct

- Be respectful and inclusive
- Welcome diverse perspectives
- Focus on the code, not the person
- Report inappropriate behavior

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/pastr.git
   cd pastr/scripts/paste-queue-app
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
# Your platform
npm run build

# All platforms
npm run build:all
```

### Project Structure
```
scripts/paste-queue-app/
├── main.js           # Electron main process
├── preload.js        # Secure IPC bridge
├── index.html        # UI and frontend logic
├── package.json      # Dependencies and build config
└── README.md         # Documentation
```

## Making Changes

### Before you start
- Check existing issues to avoid duplicate work
- Discuss major features in an issue first
- Follow the existing code style

### Code Style
- Use consistent indentation (2 spaces)
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

### Commits
- Write clear commit messages
- Keep commits focused and atomic
- Use present tense: "Add feature" not "Added feature"

### Testing Your Changes
- Test on multiple platforms if possible:
  - macOS (Intel or Apple Silicon)
  - Windows (x86-64 or ARM64)
  - Linux (Debian/Ubuntu, Fedora, or ARM)
- Test keyboard shortcuts work
- Test paste functionality
- Test edge cases (empty queue, large clipboard items, etc.)

## Submitting Changes

### Pull Request Process
1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what and why
   - Platform(s) tested
   - Screenshots if UI changes

3. **Address feedback** from reviewers

4. **Ensure CI passes** (GitHub Actions)

### Pull Request Guidelines
- Describe the problem you're solving
- Reference related issues
- Test on at least one platform
- Update documentation if needed
- Keep commits organized

## Areas for Contribution

### Easy (Good for beginners)
- Documentation improvements
- Bug fixes
- UI/UX improvements
- Error message clarity
- README examples

### Medium
- New keyboard shortcuts
- Performance optimizations
- Platform-specific improvements
- Testing infrastructure

### Advanced
- New major features
- Architecture changes
- Cross-platform compatibility
- Performance profiling

## Reporting Bugs

Use the [Bug Report](https://github.com/pastr/pastr/issues/new?template=bug_report.md) template with:
1. Your OS and version
2. Exact steps to reproduce
3. Expected vs actual behavior
4. Error messages or screenshots

## Suggesting Features

Use the [Feature Request](https://github.com/pastr/pastr/issues/new?template=feature_request.md) template with:
1. The problem you're solving
2. Your proposed solution
3. Alternative approaches
4. Which platforms this affects

## Questions?

- Check the [README](README.md) and troubleshooting section first
- Open a discussion issue
- Join our community

## License

By contributing, you agree your code will be licensed under the MIT License (see [LICENSE](LICENSE)).

## Recognition

Contributors will be recognized in:
- Release notes for significant contributions
- Contributors section of README
- GitHub contributors page

Thank you for making Pastr better! 🎉
