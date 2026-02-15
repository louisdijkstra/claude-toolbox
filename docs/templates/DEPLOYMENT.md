# Deployment Guide

> Production deployment procedures and infrastructure setup

## Table of Contents

- [Overview](#overview)
- [Environments](#environments)
- [Infrastructure](#infrastructure)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Process](#deployment-process)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Deployment Strategy

**Method:** [Blue-Green / Canary / Rolling / etc.]

**Why this strategy:**
- [Reason 1: e.g., Zero-downtime deployments]
- [Reason 2: e.g., Easy rollback capability]
- [Reason 3: e.g., Gradual traffic shift for risk mitigation]

**Deployment frequency:**
- Production: [Daily / Weekly / On-demand]
- Staging: On every PR merge
- Development: Continuous (on every commit)

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                        │
│                    (AWS ALB / etc.)                      │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
    ┌────────▼────────┐      ┌───────▼────────┐
    │  App Server 1   │      │  App Server 2   │
    │  (Container)    │      │  (Container)    │
    └────────┬────────┘      └───────┬─────────┘
             │                        │
             └────────────┬───────────┘
                          │
               ┌──────────▼──────────┐
               │   Database (RDS)    │
               │   + Read Replicas   │
               └─────────────────────┘
```

---

## Environments

### Environment Overview

| Environment | Purpose | URL | Auto-Deploy |
|-------------|---------|-----|-------------|
| Development | Feature testing | `https://dev.example.com` | Yes (on commit) |
| Staging | Pre-production testing | `https://staging.example.com` | Yes (on PR merge) |
| Production | Live application | `https://example.com` | Manual approval |

### Environment Configuration

**Development:**
- **Infrastructure**: Single server, shared database
- **Scale**: 1 instance
- **Debug mode**: Enabled
- **Logging**: DEBUG level
- **Data**: Anonymized production data or test data

**Staging:**
- **Infrastructure**: Production-like (scaled down)
- **Scale**: 2 instances
- **Debug mode**: Disabled
- **Logging**: INFO level
- **Data**: Anonymized production data

**Production:**
- **Infrastructure**: Full redundancy, multi-AZ
- **Scale**: Auto-scaling (3-10 instances)
- **Debug mode**: Disabled
- **Logging**: WARNING level
- **Data**: Live user data

### Environment Variables

**Required for all environments:**
```bash
# Application
APP_NAME=[project-name]
APP_ENV=[development|staging|production]
SECRET_KEY=[generated-secret]

# Database
DATABASE_URL=[connection-string]
DATABASE_POOL_SIZE=[size]

# External Services
API_KEY=[service-api-key]
```

**Production-specific:**
```bash
# Performance
CACHE_ENABLED=true
CACHE_URL=[redis-url]

# Security
ALLOWED_HOSTS=[comma-separated-domains]
CORS_ORIGINS=[comma-separated-origins]

# Monitoring
SENTRY_DSN=[sentry-url]
LOG_LEVEL=WARNING
```

---

## Infrastructure

### Cloud Provider: [AWS / GCP / Azure]

**Resources:**

| Resource | Type | Configuration | Purpose |
|----------|------|---------------|---------|
| Compute | [ECS / EC2 / Lambda] | [Instance type, count] | Application servers |
| Database | [RDS / CloudSQL] | [Instance type, size] | Data persistence |
| Cache | [ElastiCache / Redis] | [Node type, cluster] | Performance caching |
| Storage | [S3 / GCS] | [Bucket config] | File storage |
| CDN | [CloudFront / CloudCDN] | [Distribution] | Static assets |
| Load Balancer | [ALB / CLB] | [Configuration] | Traffic distribution |

### Infrastructure as Code

**Tool:** [Terraform / CloudFormation / Pulumi]

**Repository:** `infrastructure/` directory

**Provision infrastructure:**
```bash
cd infrastructure/

# Initialize
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply
```

### Container Configuration

**Dockerfile:**
```dockerfile
FROM [base-image]:[version]

WORKDIR /app

COPY requirements.txt .
RUN [install-dependencies]

COPY . .

EXPOSE 8000

CMD ["[start-command]"]
```

**Docker Compose (local development):**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://db:5432/app
    depends_on:
      - database

  database:
    image: postgres:15
    environment:
      POSTGRES_DB: app
      POSTGRES_PASSWORD: password
```

### Database Setup

**Production database:**
- Engine: [PostgreSQL / MySQL / etc.] [version]
- Instance: [db.t3.medium / etc.]
- Storage: [100GB SSD]
- Backups: Daily, 7-day retention
- Multi-AZ: Enabled
- Read replicas: 2

**Migrations:**
```bash
# Run migrations in production
[migration-command]  # e.g., alembic upgrade head

# Rollback if needed
[rollback-command]  # e.g., alembic downgrade -1
```

---

## Pre-Deployment Checklist

### Code Quality

**Before deploying to staging:**
- [ ] All tests passing in CI
- [ ] Code review approved
- [ ] No linter errors
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

**Before deploying to production:**
- [ ] Successfully tested in staging
- [ ] Performance testing completed
- [ ] Security scan passed
- [ ] Database migrations tested
- [ ] Rollback plan documented

### Infrastructure

**Verify infrastructure:**
- [ ] All services healthy
- [ ] Database backups recent (<24h)
- [ ] Monitoring alerts configured
- [ ] Resource capacity sufficient
- [ ] SSL certificates valid (>30 days)

### Communication

**Notify stakeholders:**
- [ ] Deployment announcement sent
- [ ] Maintenance window communicated (if downtime expected)
- [ ] Support team notified
- [ ] Changelog published

### Rollback Readiness

**Ensure rollback capability:**
- [ ] Previous version tagged
- [ ] Database backup created
- [ ] Rollback procedure documented
- [ ] Emergency contacts available

---

## Deployment Process

### Automated Deployment (CI/CD)

**Pipeline overview:**
```
1. Code Push → GitHub
2. CI runs tests and linting
3. Build Docker image
4. Push to container registry
5. Deploy to staging (auto)
6. Run smoke tests
7. Manual approval for production
8. Deploy to production (blue-green)
9. Health checks
10. Switch traffic to new version
```

**GitHub Actions example:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run tests
        run: [test-command]

      - name: Build Docker image
        run: docker build -t [image-name] .

      - name: Push to registry
        run: docker push [image-name]

      - name: Deploy to staging
        run: [deploy-command]
```

### Manual Deployment

#### Deploy to Staging

**Step 1: Build and test locally**
```bash
# Ensure main branch is up-to-date
git checkout main
git pull origin main

# Run tests
[test-command]

# Build application
[build-command]
```

**Step 2: Deploy to staging**
```bash
# Using deployment script
./scripts/deploy.sh staging

# OR manually
[deploy-command] --environment staging
```

**Step 3: Verify deployment**
```bash
# Check deployment status
[status-command]

# Run smoke tests
[smoke-test-command]

# Verify in browser
open https://staging.example.com
```

#### Deploy to Production

**Step 1: Final checks**
```bash
# Verify staging is healthy
curl https://staging.example.com/health

# Review changes
git log --oneline production..main

# Create deployment tag
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
```

**Step 2: Database migration (if needed)**
```bash
# Backup database
[backup-command]

# Run migration in production
[migration-command]

# Verify migration
[verify-command]
```

**Step 3: Deploy application**

**Blue-Green deployment:**
```bash
# Deploy new version to "green" environment
./scripts/deploy.sh production --color green

# Verify green environment healthy
curl https://green.example.com/health

# Run smoke tests on green
./scripts/smoke-test.sh green

# Switch traffic to green (zero downtime)
./scripts/switch-traffic.sh green

# Monitor for 5 minutes
./scripts/monitor.sh

# If successful, mark blue as standby
# If issues, rollback to blue
```

**Step 4: Post-deployment verification**
```bash
# Check application health
curl https://example.com/health

# Monitor error rates
[monitoring-command]

# Check logs
[log-command]

# Verify key features
[verification-script]
```

**Step 5: Cleanup**
```bash
# If deployment successful after 24h:
# - Remove old "blue" environment
# - Update documentation
# - Close deployment ticket
```

---

## Rollback Procedures

### When to Rollback

**Rollback immediately if:**
- Critical functionality broken
- Data corruption detected
- Security vulnerability introduced
- Error rate >5%
- Response time >2x normal

**Don't rollback for:**
- Minor UI issues (fix forward)
- Low-priority bugs (fix in next release)
- Expected behavior changes (communicate to users)

### Rollback Process

#### Application Rollback (Blue-Green)

**Fast rollback (if blue environment still running):**
```bash
# Switch traffic back to blue
./scripts/switch-traffic.sh blue

# Time: ~30 seconds
# Downtime: None
```

#### Application Rollback (Containers)

**Rollback to previous version:**
```bash
# Find previous version
docker images [image-name]

# Rollback deployment
kubectl rollout undo deployment/[app-name]
# OR
[deploy-command] --version [previous-version]

# Time: ~2-5 minutes
```

#### Database Rollback

**Rollback migration:**
```bash
# Rollback to previous migration
[rollback-migration-command]

# Restore from backup (if needed)
[restore-command] --backup [backup-id]
```

**⚠️ Warning:** Database rollbacks are risky if data was written by new version. Test thoroughly.

### Post-Rollback

**After rollback:**
1. Verify application is healthy
2. Notify stakeholders
3. Create incident report
4. Investigate root cause
5. Fix issues before redeploying

---

## Monitoring

### Health Checks

**Endpoints:**
```bash
# Application health
GET /health
# Response: {"status": "healthy", "version": "1.2.3"}

# Detailed health (internal only)
GET /health/detailed
# Response: {
#   "status": "healthy",
#   "database": "connected",
#   "cache": "connected",
#   "version": "1.2.3"
# }
```

**Automated health checks:**
- Frequency: Every 30 seconds
- Timeout: 5 seconds
- Failure threshold: 3 consecutive failures

### Metrics

**Key metrics to monitor:**

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Error rate | >1% | Warning |
| Error rate | >5% | Critical |
| Response time (p95) | >500ms | Warning |
| Response time (p95) | >1000ms | Critical |
| CPU usage | >70% | Warning |
| Memory usage | >80% | Warning |
| Database connections | >80% of pool | Warning |

**Monitoring tools:**
- Application metrics: [Datadog / New Relic / CloudWatch]
- Logs: [Elasticsearch / CloudWatch / Datadog]
- Error tracking: [Sentry / Rollbar]
- Uptime monitoring: [Pingdom / UptimeRobot]

### Logs

**Log aggregation:**
- Tool: [Elasticsearch / CloudWatch / Datadog]
- Retention: 30 days
- Level: WARNING+ in production

**Critical log patterns:**
```bash
# High error rate
level:ERROR | count by 5m > 100

# Slow queries
"duration" > 1000ms

# Authentication failures
"auth failed" | count by 5m > 10
```

### Alerts

**Alert channels:**
- Critical: PagerDuty (on-call)
- Warning: Slack #alerts
- Info: Email

**Alert escalation:**
1. First alert: Slack notification
2. After 5 minutes: PagerDuty (on-call engineer)
3. After 15 minutes: Escalate to senior engineer
4. After 30 minutes: Escalate to engineering manager

---

## Troubleshooting

### Common Deployment Issues

#### Issue: Deployment fails with "health check failed"

**Symptoms:**
- Deployment hangs at health check phase
- New containers start but fail health check

**Solution:**
```bash
# Check container logs
[log-command] [container-id]

# Common causes:
# - Application not starting (check startup errors)
# - Wrong port exposed
# - Health endpoint not accessible

# Fix and redeploy
```

#### Issue: Database migration fails

**Symptoms:**
- Migration error during deployment
- Database in inconsistent state

**Solution:**
```bash
# Check migration status
[migration-status-command]

# Rollback migration
[rollback-migration-command]

# Fix migration script
# Test migration in staging
# Redeploy
```

#### Issue: High memory usage after deployment

**Symptoms:**
- Memory usage climbing steadily
- Out of memory errors

**Solution:**
```bash
# Check for memory leaks
[memory-profiling-command]

# Restart containers
[restart-command]

# If issue persists:
# - Analyze heap dump
# - Fix memory leak
# - Redeploy
```

#### Issue: Traffic not reaching new version

**Symptoms:**
- New version deployed but still seeing old version
- Load balancer not routing traffic

**Solution:**
```bash
# Check load balancer configuration
[lb-status-command]

# Verify target group health
[target-group-command]

# Register new targets
[register-targets-command]
```

---

## Emergency Procedures

### Incident Response

**Severity levels:**

| Level | Impact | Response Time | Who Responds |
|-------|--------|---------------|--------------|
| SEV-1 | Complete outage | Immediate | On-call + Manager |
| SEV-2 | Major degradation | <30 minutes | On-call |
| SEV-3 | Minor issues | <4 hours | Engineering team |

**Incident process:**
1. Detect issue (monitoring alert)
2. Acknowledge alert
3. Assess severity
4. Create incident channel (#incident-[id])
5. Assign incident commander
6. Investigate and mitigate
7. Communicate to stakeholders
8. Resolve incident
9. Post-mortem review

### Contacts

**Emergency contacts:**
- On-call engineer: [PagerDuty rotation]
- Engineering manager: [name, phone]
- DevOps lead: [name, phone]
- CTO: [name, phone]

**Vendor support:**
- Cloud provider: [support link]
- Database: [support link]
- CDN: [support link]

---

**Last Updated:** YYYY-MM-DD
**Maintained by:** DevOps Team
