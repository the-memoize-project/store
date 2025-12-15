# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Memoize Store, please send an email to security@memoize-project.org (or create a private security advisory on GitHub).

**Please do not** create a public issue for security vulnerabilities.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical: 24-48h, high: 7 days, medium: 30 days)

## Security Measures

### Authentication

- OAuth2 with Google Sign-In
- Token-based authentication
- Session expiration (7 days)
- Token validation on every protected request

### Data Protection

- User data isolation
- Ownership verification on all operations
- No cross-user data access
- Automatic session cleanup

### Infrastructure

- Cloudflare Workers edge security
- Built-in DDoS protection
- HTTPS only
- CORS properly configured

### Best Practices

- Input validation on all endpoints
- No sensitive data in error messages
- Secure token generation
- Proper error handling

## Known Limitations

1. **Token Storage**: Simplified token approach (not cryptographically signed JWT)
   - Mitigation: Tokens stored server-side with expiration
   - Future: Consider proper JWT with signing

2. **Rate Limiting**: Relies on Cloudflare's built-in protection
   - Future: Implement per-user rate limiting

3. **KV Consistency**: Eventually consistent storage (~60s propagation)
   - Impact: Recent writes may not be immediately visible
   - Mitigation: Design UI to handle eventual consistency

## Security Checklist for Contributors

- [ ] Validate all user input
- [ ] Use prepared statements (N/A for KV)
- [ ] Implement proper error handling
- [ ] Don't log sensitive data
- [ ] Use HTTPS for all external calls
- [ ] Verify user ownership before operations
- [ ] Set proper CORS headers
- [ ] Use secure random for token generation
- [ ] Implement proper session management
- [ ] Keep dependencies updated
