# Contributing to Klipit Pro

We're excited that you want to contribute to Klipit Pro! This document provides guidelines and instructions for contributing.

## 🎯 Code of Conduct

Please be respectful and constructive in all interactions with other contributors.

## 🐛 Reporting Bugs

### Before Submitting a Bug Report

1. Check the issue tracker - your bug might already be reported
2. Check the documentation and existing code
3. Gather debug information

### How to Submit a Great Bug Report

Include the following:

- **Descriptive Title**: "Unable to upload files over 50MB"
- **Clear Description**: What you expected vs. what happened
- **Reproduction Steps**: Exact steps to reproduce
- **Environment Details**:
  - OS and version
  - Node.js version
  - Browser (if frontend issue)
  - Docker version (if using containers)
- **Error Messages**: Include full error logs
- **Screenshots**: For UI issues

### Example Bug Report

```
Title: File upload fails with "413 Payload Too Large" for files > 50MB

Description:
When attempting to upload a file larger than 50MB, the API returns a 413 error.

Steps to Reproduce:
1. Go to clipboard with handle 'ABC123'
2. Click upload file button
3. Select a 60MB file
4. Click upload

Expected: File uploads successfully
Actual: Error "413 Payload Too Large"

Environment:
- OS: Ubuntu 20.04
- Node: v18.12.0
- Browser: Chrome 110.0
```

## ✨ Suggesting Enhancements

### Before Submitting

1. Check if the feature has already been suggested
2. Review the project roadmap
3. Consider if this aligns with project goals

### How to Submit a Great Suggestion

Include:

- **Clear Title**: "Feature: Real-time clipboard sync with WebSockets"
- **Detailed Description**: Why this feature would be useful
- **Use Cases**: How users would benefit
- **Possible Implementation**: Your ideas (optional)

## 🚀 Pull Request Process

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/yourusername/klipit-pro.git
cd klipit-pro
git checkout -b feature/your-feature-name
```

### 2. Create a Branch

Use clear naming:

```bash
# Features
git checkout -b feature/add-two-factor-auth

# Bug fixes
git checkout -b fix/clipboard-expiry-issue

# Documentation
git checkout -b docs/update-api-docs

# Refactoring
git checkout -b refactor/database-queries
```

### 3. Make Your Changes

Follow the coding standards:

#### Backend (Node.js/TypeScript)

```typescript
// ✓ Good
function generateClipboardHandle(): string {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

// ✓ Use descriptive names
async function fetchClipboardWithExpiry(handle: string): Promise<Clipboard> {
  return await query(
    `SELECT * FROM clipboards WHERE handle = $1 AND expires_at > NOW()`,
    [handle]
  );
}

// ✓ Add error handling
try {
  await connectDatabase();
} catch (error) {
  console.error('Database connection failed:', error);
  process.exit(1);
}
```

#### Frontend (React/TypeScript)

```typescript
// ✓ Functional components with hooks
interface ClipboardProps {
  handle: string;
  onUpdate?: (content: string) => void;
}

export const Clipboard: React.FC<ClipboardProps> = ({ handle, onUpdate }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchClipboard();
  }, [handle]);

  return <div>{/* Component JSX */}</div>;
};

// ✓ Use custom hooks
function useClipboard(handle: string) {
  const [data, setData] = useState(null);
  // Hook logic
  return { data };
}
```

### 4. Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### 5. Run Linter

```bash
# Backend
cd backend
npm run lint
npm run lint:fix

# Frontend
cd frontend
npm run lint
npm run format
```

### 6. Commit Your Changes

```bash
# Use clear, descriptive commit messages
git add .
git commit -m "feat: add two-factor authentication

- Implement TOTP-based 2FA
- Add backup codes support
- Update user model with 2FA fields"
```

### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- **Title**: Clear, concise title
- **Description**: What changes were made and why
- **Closes**: Reference related issues (#123)
- **Type**: Feature / Fix / Docs / Refactor
- **Testing**: How you tested the changes

### Example PR Description

```markdown
## Description
Implements real-time clipboard synchronization using WebSockets.

## Changes
- Add WebSocket connection handler
- Implement clipboard change listener
- Update frontend to listen for updates
- Add connection pooling

## How to Test
1. Open clipboard in 2 browsers
2. Edit content in one browser
3. Verify real-time update in other browser

## Closes
#456

## Checklist
- [x] Tests added
- [x] Documentation updated
- [x] No breaking changes
- [x] Linting passes
```

## 📋 Commit Message Guidelines

Use the Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build, dependencies, etc.

Examples:
```
feat(auth): add two-factor authentication
fix(clipboard): prevent expiry race condition
docs(api): update endpoint documentation
refactor(database): optimize query performance
```

## 🏗️ Project Structure

Understand the structure before contributing:

```
backend/
├── src/
│   ├── routes/          # API endpoints
│   ├── controllers/     # Business logic (future)
│   ├── models/          # Data models (future)
│   ├── services/        # Reusable logic
│   ├── middleware/      # Express middleware
│   └── config/          # Configuration
├── tests/               # Test files
└── docs/                # Backend documentation

frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   └── styles/          # CSS/styling
└── tests/               # Test files
```

## 🧪 Testing Requirements

1. **Unit Tests**: For functions and utilities
2. **Integration Tests**: For API endpoints
3. **Component Tests**: For React components
4. **E2E Tests**: For user workflows

## 📚 Documentation Requirements

When adding features:

1. Update relevant API documentation
2. Add code comments for complex logic
3. Include usage examples
4. Update this CONTRIBUTING guide if needed

## 🔍 Code Review

Your PR will be reviewed for:

- ✓ Code quality and style
- ✓ Test coverage
- ✓ Documentation
- ✓ Performance implications
- ✓ Security considerations
- ✓ Breaking changes

## ✅ Before You Submit

- [ ] Forked the repository
- [ ] Created a feature branch
- [ ] Made meaningful commits
- [ ] Updated tests
- [ ] Updated documentation
- [ ] Ran `npm run lint` and fixed issues
- [ ] Ran `npm test` successfully
- [ ] Verified code works locally
- [ ] No merge conflicts

## 📖 Development Resources

- [API Documentation](./backend/API.md)
- [Setup Guide](./SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [React Documentation](https://react.dev/)

## 🎓 Learning Resources

New to the tech stack?

- **TypeScript**: https://www.typescriptlang.org/docs/
- **Express.js**: https://expressjs.com/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **React**: https://react.dev/learn
- **Docker**: https://docs.docker.com/

## 🤝 Getting Help

- **Issues**: Ask on GitHub Issues
- **Discussions**: Use GitHub Discussions
- **Code Review**: Ask reviewers for clarification

## 🎉 Recognition

Contributors are recognized in:
- CONTRIBUTORS file
- GitHub contributors page
- Project README (for major contributions)

---

**Thank you for contributing to Klipit Pro! 🚀**

Your efforts help make this project better for everyone.
