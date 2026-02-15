# Troubleshooting Guide

> Common issues and solutions for [Project Name]

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
- [Runtime Issues](#runtime-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Authentication Issues](#authentication-issues)
- [API Issues](#api-issues)
- [Deployment Issues](#deployment-issues)
- [Getting Help](#getting-help)

---

## Quick Diagnostics

### Health Check

**Run diagnostic script:**
```bash
./scripts/diagnose.sh

# OR manually check each component:
```

**Check application status:**
```bash
# Application running?
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "version": "1.2.3"}
```

**Check database connection:**
```bash
# Can connect to database?
psql $DATABASE_URL -c "SELECT 1;"

# Expected: Returns "1"
```

**Check logs:**
```bash
# Application logs
tail -f logs/app.log

# Error logs
grep ERROR logs/app.log | tail -20
```

**Check system resources:**
```bash
# CPU and memory usage
top

# Disk space
df -h

# Open connections
netstat -an | grep LISTEN
```

---

## Installation Issues

### Issue: Dependencies fail to install

**Symptoms:**
```
Error: Could not install package X
Error: Version conflict for package Y
```

**Diagnosis:**
```bash
# Check version requirements
[package-manager] --version

# Check for conflicting dependencies
[check-conflicts-command]
```

**Solutions:**

**1. Update package manager:**
```bash
# Update npm
npm install -g npm@latest

# OR update pip
pip install --upgrade pip

# OR update uv
pip install --upgrade uv
```

**2. Clear cache and reinstall:**
```bash
# Node.js
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Python
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# OR with uv
uv cache clean
uv sync
```

**3. Check for version conflicts:**
```bash
# Inspect dependency tree
npm ls [package-name]  # Node.js
pip show [package-name]  # Python
```

**4. Install specific compatible versions:**
```bash
# If newer versions have issues
npm install [package]@[compatible-version]
pip install [package]==[compatible-version]
```

### Issue: Permission errors during installation

**Symptoms:**
```
Error: EACCES: permission denied
Error: Permission denied (publickey)
```

**Solutions:**

**1. Don't use sudo (for npm):**
```bash
# Instead, configure npm to use a different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**2. Fix ownership:**
```bash
# Fix npm directory ownership
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**3. Use virtual environment (for Python):**
```bash
# Always use venv for Python projects
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows
```

---

## Configuration Issues

### Issue: Environment variables not loaded

**Symptoms:**
```
Error: Missing required environment variable: API_KEY
Application starts but API calls fail
```

**Diagnosis:**
```bash
# Check .env file exists
ls -la .env

# Verify .env content (careful not to expose secrets!)
cat .env | grep -v "SECRET\|KEY\|PASSWORD"

# Check if environment variables are loaded
printenv | grep APP_
```

**Solutions:**

**1. Create .env file:**
```bash
# Copy from example
cp .env.example .env

# Edit with your values
[editor] .env
```

**2. Verify .env is being loaded:**
```bash
# Check if dotenv is installed
npm ls dotenv  # Node.js
pip show python-dotenv  # Python

# Load .env in code (if not automatic)
# Node.js: require('dotenv').config()
# Python: from dotenv import load_dotenv; load_dotenv()
```

**3. Restart application:**
```bash
# Environment changes require restart
[stop-command]
[start-command]
```

**4. Check .env is not in .gitignore:**
```bash
# .env should be in .gitignore for security
cat .gitignore | grep .env

# Should see: .env
```

### Issue: Wrong configuration being used

**Symptoms:**
```
Application connects to wrong database
Features behave differently than expected
```

**Diagnosis:**
```bash
# Check which config is loaded
[check-config-command]

# Common locations:
cat config/local.yml
cat config/development.yml
cat config/production.yml
```

**Solutions:**

**1. Verify APP_ENV:**
```bash
# Check environment setting
echo $APP_ENV

# Should match your intent: development, staging, or production
```

**2. Check configuration precedence:**
```
Priority (highest to lowest):
1. Environment variables
2. config/local.yml
3. config/[environment].yml
4. config/default.yml
```

**3. Override specific settings:**
```bash
# Override via environment variable
export DATABASE_URL=postgresql://localhost/mydb
[start-command]
```

---

## Runtime Issues

### Issue: Application crashes on startup

**Symptoms:**
```
Application starts then immediately exits
Error: Cannot find module 'X'
Segmentation fault
```

**Diagnosis:**
```bash
# Check logs
tail -100 logs/app.log

# Run with verbose logging
DEBUG=* [start-command]  # Node.js
[start-command] --log-level DEBUG  # Others
```

**Solutions:**

**1. Missing dependencies:**
```bash
# Reinstall dependencies
[install-command]
```

**2. Port already in use:**
```bash
# Find and kill process using port
lsof -i :8000
kill -9 [PID]

# OR use different port
PORT=8001 [start-command]
```

**3. Database not running:**
```bash
# Start database
docker-compose up -d database
# OR
[database-start-command]
```

**4. Insufficient permissions:**
```bash
# Check file permissions
ls -la [file]

# Fix permissions
chmod +x [file]
```

### Issue: Application runs but requests fail

**Symptoms:**
```
HTTP 500 Internal Server Error
Requests timeout
Connection refused
```

**Diagnosis:**
```bash
# Check if application is listening
netstat -an | grep 8000

# Test with curl
curl -v http://localhost:8000/health

# Check error logs
grep ERROR logs/app.log | tail -20
```

**Solutions:**

**1. Check API endpoint:**
```bash
# Verify correct URL
# Correct: http://localhost:8000/api/v1/users
# Wrong: http://localhost:8000/users (missing /api/v1)
```

**2. Check request format:**
```bash
# Include Content-Type header
curl -H "Content-Type: application/json" \
     -d '{"key":"value"}' \
     http://localhost:8000/api/v1/endpoint
```

**3. Check CORS configuration:**
```javascript
// Frontend calling API on different port
// Ensure CORS is enabled in backend
```

---

## Database Issues

### Issue: Cannot connect to database

**Symptoms:**
```
Error: Could not connect to database
FATAL: password authentication failed
Connection refused
```

**Diagnosis:**
```bash
# Test database connection manually
psql $DATABASE_URL

# Check database is running
docker-compose ps database
# OR
[database-status-command]

# Check connection string format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database
```

**Solutions:**

**1. Start database:**
```bash
# Using Docker
docker-compose up -d database

# Using local installation
[database-start-command]
```

**2. Verify credentials:**
```bash
# Check .env file
cat .env | grep DATABASE

# Test connection with correct credentials
psql -h localhost -U username -d database
```

**3. Check host and port:**
```bash
# Verify database is listening
nc -zv localhost 5432

# If in Docker, use service name instead of localhost
DATABASE_URL=postgresql://user:password@database:5432/dbname
```

**4. Create database if missing:**
```bash
# Create database
createdb [dbname]

# OR
psql -U postgres -c "CREATE DATABASE [dbname];"
```

### Issue: Migration fails

**Symptoms:**
```
Error: Migration XXX failed
Database schema out of sync
```

**Diagnosis:**
```bash
# Check migration status
[migration-status-command]

# Check for incomplete migrations
[check-migrations-command]
```

**Solutions:**

**1. Rollback and retry:**
```bash
# Rollback failed migration
[rollback-command]

# Retry migration
[migration-command]
```

**2. Reset database (development only!):**
```bash
# ⚠️ WARNING: This deletes all data!
dropdb [dbname]
createdb [dbname]
[migration-command]
```

**3. Manual schema fix:**
```bash
# Check what migration is trying to do
cat migrations/[migration-file]

# Apply manually if needed
psql $DATABASE_URL < migrations/[migration-file]
```

---

## Performance Issues

### Issue: Slow response times

**Symptoms:**
```
API requests take >5 seconds
Pages load slowly
Timeouts
```

**Diagnosis:**
```bash
# Measure response time
time curl http://localhost:8000/api/v1/endpoint

# Check database query performance
# (Enable query logging in database config)
tail -f logs/database.log

# Profile application
[profiling-command]
```

**Solutions:**

**1. Database queries (N+1 problem):**
```bash
# Look for repeated queries in logs
# Fix by using joins or eager loading

# Example (Django):
# Bad: User.objects.all()  # Then access user.posts in loop
# Good: User.objects.prefetch_related('posts')
```

**2. Missing database indexes:**
```sql
-- Check for slow queries
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Add index if missing
CREATE INDEX idx_users_email ON users(email);
```

**3. Enable caching:**
```bash
# Start Redis
docker-compose up -d cache

# Verify cache is working
redis-cli ping  # Should return PONG
```

**4. Optimize resource-heavy operations:**
```javascript
// Move heavy processing to background job
// Use pagination for large result sets
// Compress responses
```

### Issue: High memory usage

**Symptoms:**
```
Application uses >2GB RAM
Out of memory errors
System becomes unresponsive
```

**Diagnosis:**
```bash
# Check memory usage
top
htop

# Profile memory (Node.js)
node --inspect [app.js]
# Then use Chrome DevTools

# Python memory profiling
pip install memory_profiler
python -m memory_profiler [script.py]
```

**Solutions:**

**1. Identify memory leaks:**
```bash
# Look for:
# - Unbounded arrays/caches
# - Event listeners not cleaned up
# - Database connections not closed
```

**2. Limit concurrency:**
```javascript
// Limit concurrent operations
// Use connection pooling
// Set max request body size
```

**3. Restart workers periodically:**
```bash
# Configure worker restart after N requests
# Prevents memory accumulation
```

---

## Authentication Issues

### Issue: Login fails with correct credentials

**Symptoms:**
```
Error: Invalid credentials (but credentials are correct)
Token expired error
Redirect loop
```

**Diagnosis:**
```bash
# Check authentication logs
grep "auth" logs/app.log

# Verify user exists in database
psql $DATABASE_URL -c "SELECT * FROM users WHERE email='test@example.com';"

# Check password hash
# (Should see hashed password, not plain text)
```

**Solutions:**

**1. Clear session/cookies:**
```bash
# In browser: Clear cookies for site
# In API client: Clear stored tokens
```

**2. Check token expiration:**
```javascript
// Verify token is valid and not expired
// Implement token refresh if expired
```

**3. Verify password hashing:**
```bash
# Password should be hashed, not plain text
# Check hashing algorithm matches
```

### Issue: Unauthorized errors for valid requests

**Symptoms:**
```
HTTP 401 Unauthorized
HTTP 403 Forbidden
Token validation fails
```

**Diagnosis:**
```bash
# Check token is being sent
curl -v -H "Authorization: Bearer [token]" http://localhost:8000/api/v1/users/me

# Verify token format
# Should be: Authorization: Bearer <token>
# Not: Authorization: <token>
```

**Solutions:**

**1. Include authentication header:**
```javascript
// Correct
fetch('/api/v1/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**2. Check token is valid:**
```bash
# Decode JWT token (don't trust, just inspect)
# Visit jwt.io and paste token
# Verify: not expired, correct issuer, valid signature
```

**3. Verify permissions:**
```bash
# User may be authenticated but not authorized
# Check user role/permissions in database
```

---

## API Issues

### Issue: API returns 404 for existing endpoint

**Symptoms:**
```
HTTP 404 Not Found (but endpoint exists in code)
API version mismatch
```

**Solutions:**

**1. Check API version in URL:**
```bash
# Correct
curl http://localhost:8000/api/v1/users

# Wrong
curl http://localhost:8000/users
```

**2. Check trailing slash:**
```bash
# Some frameworks require trailing slash
curl http://localhost:8000/api/v1/users/
```

**3. Verify route is registered:**
```bash
# Check route list
[list-routes-command]
```

### Issue: CORS errors

**Symptoms:**
```
Access to fetch has been blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

**Solutions:**

**1. Enable CORS in backend:**
```javascript
// Express.js example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

**2. Check allowed origins:**
```bash
# Verify frontend URL is in allowed origins
# Development: http://localhost:3000
# Production: https://example.com
```

**3. Check preflight requests:**
```bash
# Browser sends OPTIONS request first
# Ensure OPTIONS is allowed
```

---

## Deployment Issues

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for deployment-specific troubleshooting.

---

## Getting Help

### Before asking for help

**Provide this information:**

1. **What you're trying to do**
2. **What you expected to happen**
3. **What actually happened**
4. **Error messages** (full text, not screenshot if possible)
5. **Environment details:**
   ```bash
   # Application version
   [version-command]

   # Operating system
   uname -a  # macOS/Linux
   ver  # Windows

   # Language/runtime version
   node --version  # Node.js
   python --version  # Python

   # Dependencies
   npm ls  # Node.js
   pip freeze  # Python
   ```

6. **Steps to reproduce** (minimal example)
7. **What you've tried already**

### Where to get help

**For bugs:**
- [GitHub Issues](https://github.com/[org]/[repo]/issues)
- Include all information above

**For questions:**
- [GitHub Discussions](https://github.com/[org]/[repo]/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/[project-tag])
- [Community Slack/Discord](link)

**For security issues:**
- **DO NOT** post publicly
- Email: security@example.com
- Use [security disclosure process](./SECURITY.md)

### Enable debug logging

**Maximum verbosity:**
```bash
# Node.js
DEBUG=* [start-command]

# Python
LOG_LEVEL=DEBUG [start-command]

# View all logs
tail -f logs/app.log
```

---

**Last Updated:** YYYY-MM-DD
**Can't find your issue?** [Open an issue](https://github.com/[org]/[repo]/issues/new)
