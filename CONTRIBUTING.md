# Contributing to WhatsApp Bot Platform

Thank you for your interest in contributing to the WhatsApp Bot Platform! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
1. **Search existing issues** to avoid duplicates
2. **Use issue templates** when available
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots/logs if applicable

### Suggesting Features
1. **Check existing feature requests**
2. **Describe the feature clearly**
3. **Explain the use case**
4. **Consider implementation complexity**

### Code Contributions

#### Prerequisites
- Node.js 18+
- Git knowledge
- Understanding of JavaScript/React
- Familiarity with WhatsApp Bot concepts

#### Development Setup
1. **Fork the repository**
```bash
git clone https://github.com/yourusername/whatsapp-bot-platform.git
cd whatsapp-bot-platform
```

2. **Install dependencies**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

3. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

#### Code Standards

##### JavaScript Style Guide
- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

##### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Follow component composition patterns
- Use TypeScript for type safety
- Implement proper state management

##### Backend Guidelines
- Follow RESTful API principles
- Implement proper error handling
- Use middleware for common functionality
- Validate all inputs
- Log important events

#### Plugin Development

##### Creating New Commands
```javascript
import { Queen } from "../lib/event.js";

Queen.addCommand({
  pattern: ["commandname"],
  category: "category",
  React: "🎯",
  desc: "Command description",
  usage: ".commandname <args>",
  adminOnly: false,
  groupOnly: false
}, async (message, sock, args) => {
  // Command implementation
  await sock.sendMessage(message.key.remoteJid, {
    text: "Response message"
  });
});

export {};
```

##### Plugin Guidelines
- One command per file when possible
- Use descriptive file names
- Include proper error handling
- Add usage examples
- Test thoroughly

#### Testing

##### Manual Testing
1. **Test all user flows**
2. **Verify bot functionality**
3. **Check responsive design**
4. **Test error scenarios**
5. **Validate security measures**

##### Automated Testing
```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

#### Commit Guidelines

##### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

##### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

##### Examples
```bash
feat(bot): add weather command with location support
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
```

#### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md**
5. **Create detailed PR description**

##### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Automated tests pass
- [ ] Cross-browser testing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🏗️ Project Structure

### Backend Architecture
```
backend/
├── Connect/
│   ├── lib/           # Core libraries
│   ├── plugin/        # Command plugins
│   ├── config/        # Configuration files
│   ├── language/      # Internationalization
│   └── database/      # Database schemas
├── data/              # User data storage
└── server.js          # Main server file
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/    # React components
│   ├── contexts/      # Context providers
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   └── styles/        # CSS/styling
└── public/            # Static assets
```

## 🔒 Security Guidelines

### Code Security
- **Validate all inputs**
- **Sanitize user data**
- **Use parameterized queries**
- **Implement rate limiting**
- **Follow OWASP guidelines**

### Sensitive Information
- **Never commit secrets**
- **Use environment variables**
- **Encrypt sensitive data**
- **Implement proper authentication**
- **Log security events**

## 📚 Resources

### Documentation
- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [React Documentation](https://reactjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide)
- [Socket.IO Documentation](https://socket.io/docs)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended IDE
- [Postman](https://www.postman.com/) - API testing
- [React DevTools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html)

## 🎯 Development Roadmap

### Planned Features
- [ ] Voice message support
- [ ] File sharing capabilities
- [ ] Advanced AI integration
- [ ] Multi-language support
- [ ] Plugin marketplace
- [ ] Mobile app
- [ ] Docker deployment
- [ ] Cloud hosting options

### Current Priorities
1. Bug fixes and stability
2. Performance optimizations
3. Security enhancements
4. Documentation improvements
5. Test coverage increase

## 💬 Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: Direct contact with maintainers

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines
- Maintain professional communication

## 🏆 Recognition

### Contributors
We appreciate all contributors! Your contributions will be recognized in:
- README.md contributors section
- CHANGELOG.md acknowledgments
- GitHub contributors page

### Types of Contributions
- Code contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Testing and feedback
- Community support

## 📞 Getting Help

### Before Asking for Help
1. **Read the documentation**
2. **Search existing issues**
3. **Check the FAQ**
4. **Try debugging yourself**

### How to Ask for Help
1. **Provide context**
2. **Include error messages**
3. **Share relevant code**
4. **Describe what you've tried**
5. **Be specific about the problem**

---

Thank you for contributing to the WhatsApp Bot Platform! Together, we can build an amazing tool for the community. 🚀