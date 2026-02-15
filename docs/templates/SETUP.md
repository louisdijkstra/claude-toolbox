# Setup Guide

> Quick start guide for getting [Project Name] running locally

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## Prerequisites

**Required:**

| Tool | Version | Installation |
|------|---------|--------------|
| [Tool 1] | [X.X+] | [Installation link or command] |
| [Tool 2] | [X.X+] | [Installation link or command] |
| [Tool 3] | [X.X+] | [Installation link or command] |

**Optional (for development):**
- [Tool 4] ([version]) - [purpose]
- [Tool 5] ([version]) - [purpose]

**Verify installation:**
```bash
# Check versions
[tool1] --version  # Should be X.X+
[tool2] --version  # Should be X.X+
[tool3] --version  # Should be X.X+
```

**Platform-specific notes:**
- **macOS**: [Any Mac-specific requirements or gotchas]
- **Linux**: [Any Linux-specific requirements or gotchas]
- **Windows**: [Any Windows-specific requirements or gotchas]

---

## Installation

### Method 1: Quick Install (Recommended)

**Clone the repository:**
```bash
git clone https://github.com/[org]/[repo].git
cd [repo]
```

**Install dependencies:**
```bash
# Backend dependencies
[install command]  # e.g., pip install -r requirements.txt, npm install

# Frontend dependencies (if separate)
cd frontend
[install command]
cd ..
```

**Expected output:**
```
✓ Installing dependencies...
✓ Building packages...
✓ Setup complete!
```

### Method 2: Docker (Alternative)

**Using Docker Compose:**
```bash
# Clone and start
git clone https://github.com/[org]/[repo].git
cd [repo]
docker-compose up -d

# Verify containers are running
docker-compose ps
```

**Expected output:**
```
NAME              STATUS          PORTS
app               Up 10 seconds   0.0.0.0:8000->8000/tcp
database          Up 10 seconds   0.0.0.0:5432->5432/tcp
```

---

## Configuration

### Step 1: Environment Variables

**Copy example environment file:**
```bash
cp .env.example .env
```

**Required variables:**
```bash
# .env file
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Application
SECRET_KEY=generate_a_secure_random_string_here
API_KEY=your_api_key_here

# External Services
[SERVICE_API_KEY]=your_service_key
[SERVICE_URL]=https://api.service.com
```

**Generate secure secrets:**
```bash
# Generate SECRET_KEY (example for Python)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OR for Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 2: Configuration Files

**Create local configuration:**
```bash
# Copy default config
cp config/default.yml config/local.yml

# Edit local config
[editor] config/local.yml
```

**Example configuration:**
```yaml
# config/local.yml
app:
  name: [Project Name]
  environment: development
  port: 8000
  debug: true

database:
  host: localhost
  port: 5432
  name: [dbname]

logging:
  level: DEBUG
  format: json
```

### Step 3: API Keys and Credentials

**External services requiring setup:**

1. **[Service 1]**:
   - Sign up at [URL]
   - Create API key at [dashboard URL]
   - Add to `.env`: `SERVICE1_API_KEY=your_key`

2. **[Service 2]**:
   - Sign up at [URL]
   - Configure webhook URL: `https://your-domain.com/webhooks/service2`
   - Add credentials to `.env`

**Optional services:**
- [Service 3]: [Setup instructions if needed]

---

## Database Setup

### Step 1: Start Database

**Using Docker:**
```bash
docker-compose up -d database

# Verify database is running
docker-compose ps database
```

**Using local installation:**
```bash
# Start PostgreSQL (example)
[start command for your database]

# Verify connection
[connection test command]
```

### Step 2: Create Database

```bash
# Create database
createdb [dbname]

# OR using SQL
psql -U postgres -c "CREATE DATABASE [dbname];"
```

### Step 3: Run Migrations

**Apply database schema:**
```bash
# Run all migrations
[migration command]  # e.g., alembic upgrade head, npm run migrate

# Verify migrations applied
[migration status command]
```

**Expected output:**
```
✓ Running migration 001_initial_schema
✓ Running migration 002_add_users_table
✓ Running migration 003_add_indexes
✓ All migrations applied successfully
```

### Step 4: Seed Data (Optional)

**Load sample data for development:**
```bash
[seed command]  # e.g., python manage.py seed, npm run seed
```

**Expected output:**
```
✓ Creating 10 sample users
✓ Creating 50 sample resources
✓ Seed data loaded successfully
```

---

## Running the Application

### Development Mode

**Start all services:**
```bash
# Terminal 1: Start backend
[backend start command]  # e.g., uvicorn main:app --reload, npm run dev

# Terminal 2: Start frontend (if separate)
cd frontend
[frontend start command]  # e.g., npm start

# Terminal 3: Start background workers (if applicable)
[worker start command]
```

**Using a process manager:**
```bash
# Using foreman/overmind/honcho
[process manager] start

# OR using npm scripts
npm run dev:all
```

**Expected output:**
```
[Backend]  ✓ Server running at http://localhost:8000
[Frontend] ✓ Frontend running at http://localhost:3000
[Worker]   ✓ Worker started, processing jobs
```

### Production Mode

**Build for production:**
```bash
# Build frontend assets
cd frontend
npm run build
cd ..

# Collect static files (if applicable)
[collect static command]
```

**Start production server:**
```bash
# Start with production settings
[production start command]  # e.g., gunicorn, pm2 start
```

### Docker Mode

**Start all services:**
```bash
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Verification

### Step 1: Health Check

**Check API is running:**
```bash
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

**Check frontend is accessible:**
```bash
# Open in browser
open http://localhost:3000  # macOS
xdg-open http://localhost:3000  # Linux
start http://localhost:3000  # Windows
```

### Step 2: Run Tests

**Verify everything works:**
```bash
# Run test suite
[test command]  # e.g., pytest, npm test

# Run linter
[lint command]  # e.g., ruff check, npm run lint
```

**Expected output:**
```
✓ 45 tests passing
✓ 0 tests failing
✓ Linter: No issues found
```

### Step 3: Create Test User

**Create your first user:**
```bash
# Using CLI
[create user command]

# OR using API
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure_password"}'
```

### Step 4: Verify Features

**Test core functionality:**
- [ ] Homepage loads at `http://localhost:3000`
- [ ] API responds at `http://localhost:8000/api/v1/health`
- [ ] User can register/login
- [ ] Database operations work
- [ ] [Key feature 1] works
- [ ] [Key feature 2] works

---

## Troubleshooting

### Common Issues

#### Issue: Port already in use

**Error:**
```
Error: Port 8000 is already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 [PID]  # macOS/Linux
taskkill /PID [PID] /F  # Windows

# OR use a different port
PORT=8001 [start command]
```

#### Issue: Database connection failed

**Error:**
```
Error: Could not connect to database
```

**Solution:**
```bash
# Check database is running
docker-compose ps database
# OR
[database status command]

# Check credentials in .env
cat .env | grep DATABASE_URL

# Test connection manually
psql $DATABASE_URL  # PostgreSQL
```

#### Issue: Missing dependencies

**Error:**
```
ModuleNotFoundError: No module named 'package_name'
```

**Solution:**
```bash
# Reinstall dependencies
[install command]

# Clear cache and reinstall
rm -rf node_modules package-lock.json  # Node.js
rm -rf venv  # Python
[install command]
```

#### Issue: Migration failed

**Error:**
```
Error: Migration failed at step X
```

**Solution:**
```bash
# Rollback migrations
[rollback command]

# Drop and recreate database
dropdb [dbname]
createdb [dbname]
[migration command]
```

#### Issue: Environment variables not loaded

**Error:**
```
Error: Missing required environment variable: API_KEY
```

**Solution:**
```bash
# Verify .env file exists
ls -la .env

# Check .env is in .gitignore
cat .gitignore | grep .env

# Restart application to reload environment
[restart command]
```

**Full troubleshooting guide:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Next Steps

**You're all set! 🎉**

**Recommended next steps:**

1. **Read the documentation**
   - [Architecture overview](./ARCHITECTURE.md)
   - [API documentation](./API_DOCS.md)
   - [Contributing guide](./CONTRIBUTING.md)

2. **Explore the codebase**
   - `/src` - Main application code
   - `/tests` - Test files
   - `/docs` - Additional documentation

3. **Make your first change**
   - Create a feature branch: `git checkout -b feature/my-feature`
   - Make changes
   - Run tests: `[test command]`
   - Submit a pull request

4. **Join the community**
   - [GitHub Discussions](https://github.com/[org]/[repo]/discussions)
   - [Slack/Discord](link)
   - [Contributing guide](./CONTRIBUTING.md)

**Development workflow:**
```bash
# Daily development cycle
git checkout main
git pull
git checkout -b feature/your-feature
# ... make changes ...
[test command]
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
# ... create pull request ...
```

---

**Need Help?**
- 📖 [Full Documentation](./docs/)
- 💬 [GitHub Discussions](https://github.com/[org]/[repo]/discussions)
- 🐛 [Report Issues](https://github.com/[org]/[repo]/issues)
- 📧 [Email Support](mailto:support@example.com)

---

**Setup complete!** Ready to start developing.

Last Updated: YYYY-MM-DD
