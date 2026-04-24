# Break the Login – Atacarea și securizarea autentificării (proiect #2)

Proiect eduational in cadrul cursului **Dezvoltarea Aplicațiilor Software Securizate** - *Facultatea de Matematică și Informatică
Universitatea din București*

## Quick Start

```bash
cd app-v1
docker-compose up -d
```

Access: http://localhost:3000

## Reset Databse

```bash
docker-compose down -v
docker-compose up -d --build
```
## Architecture

- **Backend**: Node.js + Express (port 3000)
- **Database**: PostgreSQL (port 5432)
- **Frontend**: Vue.js 3 CDN + Bootstrap 5

## Implemented Vulnerabilities

### 4.1 Weak Password Policy
- Accepts any password length (even "1")
- No complexity requirements
- No validation

### 4.2 Insecure Password Storage
- MD5 hash without salt
- Easily crackable

### 4.3 No Brute Force Protection
- Unlimited login attempts
- No rate limiting
- No account lockout

### 4.4 User Enumeration
- Different error messages:
  - "User not found" vs "Invalid password"
- Allows attacker enumeration

### 4.5 JWT Insecure - Multiple Vulnerabilities
- Token stored in localStorage (accessible from JavaScript → XSS)
- Token transmitted over HTTP without enforced HTTPS (vulnerable to MITM)
- No CSRF protection (no origin/referer validation)
- Long expiration (24 hours without refresh token)
- No token invalidation on logout (token remains valid until expiration)
- Weak hardcoded JWT secret (insecure_jwt_secret_v1)

### 4.6 Insecure Password Reset
- Predictable token: MD5(email + timestamp)
- No expiration
- Reusable tokens

### 4.7 IDOR (Insecure Direct Object Reference)
- No ownership verification (ticket.owner_id === user.id)
- Any authenticated user can access any ticket by ID
- Missing authorization checks completely

### 4.8 SQL Injection
- String concatenation in SQL queries
- Endpoint: GET /api/tickets/search/query?q=
- User input directly embedded in query

### 4.9 XSS (Cross-Site Scripting)
- v-html without sanitization
- Description field (TEXT) stored unsanitized in database
- Malicious JavaScript executes in victim's browser

## API Endpoints

- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user
- POST `/api/password/forgot-password` - Request reset
- POST `/api/password/reset-password` - Reset password

## Database Tables

- `users` - User accounts
- `password_resets` - Reset tokens
- `audit_logs` - Activity logs
- `session` - Session storage (auto-created)

## Testing Vulnerabilities

### Test weak passwords:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"1"}'
```


