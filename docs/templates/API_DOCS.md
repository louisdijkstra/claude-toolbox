# API Documentation

> Last Updated: YYYY-MM-DD | Version: [X.Y.Z] | Base URL: `https://api.example.com/v1`

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Webhooks](#webhooks)
- [SDKs & Client Libraries](#sdks--client-libraries)
- [Changelog](#changelog)

---

## Overview

### API Design Philosophy

**REST Principles:**
- Resource-oriented URLs
- HTTP verbs for actions
- JSON request/response bodies
- Stateless authentication
- Hypermedia links (HATEOAS)

**Versioning:**
- Version included in URL path: `/v1/`, `/v2/`
- Current version: `v1`
- Deprecation policy: 6 months notice

### Base URLs

| Environment | Base URL | Purpose |
|-------------|----------|---------|
| Production | `https://api.example.com/v1` | Live production API |
| Staging | `https://api.staging.example.com/v1` | Testing environment |
| Development | `http://localhost:8000/v1` | Local development |

### Content Types

**Request:**
```
Content-Type: application/json
Accept: application/json
```

**Response:**
```
Content-Type: application/json; charset=utf-8
```

---

## Authentication

### Method: Bearer Token (JWT)

**Obtaining a Token:**

```bash
POST /v1/auth/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg..."
}
```

**Using the Token:**

```bash
GET /v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

```bash
POST /v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg..."
}
```

### API Keys (for server-to-server)

```bash
GET /v1/data
X-API-Key: your_api_key_here
```

**Scopes:**
- `read`: Read access to resources
- `write`: Create and update resources
- `delete`: Delete resources
- `admin`: Full access

---

## Rate Limiting

**Limits:**
- **Authenticated requests**: 1000 requests/hour
- **Unauthenticated requests**: 100 requests/hour
- **Burst limit**: 100 requests/minute

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

**Rate Limit Exceeded:**
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 3600

{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again in 3600 seconds.",
    "retry_after": 3600
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "request_id": "req_abc123"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request succeeded, no content to return |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary server issue |

### Common Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| `invalid_request` | Malformed request | Check request format |
| `authentication_failed` | Invalid credentials | Verify credentials |
| `unauthorized` | Missing authentication | Provide authentication |
| `forbidden` | Insufficient permissions | Check user permissions |
| `not_found` | Resource not found | Verify resource ID |
| `validation_error` | Invalid field values | Check field constraints |
| `rate_limit_exceeded` | Too many requests | Wait and retry |
| `server_error` | Internal error | Contact support |

### Validation Errors (422)

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "age": ["Must be at least 18"]
    }
  }
}
```

---

## API Endpoints

### Users

#### Get Current User

```
GET /v1/users/me
```

**Response:**
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-03-15T14:20:00Z"
}
```

#### Update User

```
PATCH /v1/users/me
```

**Request:**
```json
{
  "name": "Jane Doe",
  "preferences": {
    "notifications": true
  }
}
```

**Response:** 200 OK (same as Get User)

---

### Resources

#### List Resources

```
GET /v1/resources
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `sort` | string | No | Sort field (default: created_at) |
| `order` | string | No | Sort order: asc, desc (default: desc) |
| `filter[status]` | string | No | Filter by status: active, archived |
| `search` | string | No | Search term |

**Example:**
```bash
GET /v1/resources?page=2&limit=50&sort=name&order=asc&filter[status]=active
```

**Response:**
```json
{
  "data": [
    {
      "id": "res_abc123",
      "name": "Resource Name",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 250,
    "total_pages": 5,
    "has_more": true
  },
  "links": {
    "self": "/v1/resources?page=2&limit=50",
    "first": "/v1/resources?page=1&limit=50",
    "prev": "/v1/resources?page=1&limit=50",
    "next": "/v1/resources?page=3&limit=50",
    "last": "/v1/resources?page=5&limit=50"
  }
}
```

#### Get Resource

```
GET /v1/resources/{id}
```

**Response:**
```json
{
  "id": "res_abc123",
  "name": "Resource Name",
  "description": "Resource description",
  "status": "active",
  "metadata": {
    "key": "value"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-03-15T14:20:00Z"
}
```

#### Create Resource

```
POST /v1/resources
```

**Request:**
```json
{
  "name": "New Resource",
  "description": "Description of the resource",
  "metadata": {
    "key": "value"
  }
}
```

**Response:** 201 Created
```json
{
  "id": "res_xyz789",
  "name": "New Resource",
  "description": "Description of the resource",
  "status": "active",
  "metadata": {
    "key": "value"
  },
  "created_at": "2024-03-15T15:30:00Z",
  "updated_at": "2024-03-15T15:30:00Z"
}
```

#### Update Resource

```
PATCH /v1/resources/{id}
```

**Request:**
```json
{
  "name": "Updated Name",
  "status": "archived"
}
```

**Response:** 200 OK (same as Get Resource)

#### Delete Resource

```
DELETE /v1/resources/{id}
```

**Response:** 204 No Content

---

## Data Models

### User

```typescript
{
  id: string;              // Unique identifier (usr_*)
  email: string;           // Email address (unique)
  name: string;            // Display name
  role: "admin" | "user";  // User role
  preferences: {           // User preferences
    notifications: boolean;
    theme: "light" | "dark";
  };
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}
```

### Resource

```typescript
{
  id: string;                        // Unique identifier (res_*)
  name: string;                      // Resource name (1-255 chars)
  description?: string;              // Optional description
  status: "active" | "archived";     // Resource status
  metadata: Record<string, any>;     // Custom metadata
  owner_id: string;                  // Owner user ID
  created_at: string;                // ISO 8601 timestamp
  updated_at: string;                // ISO 8601 timestamp
}
```

### Pagination

```typescript
{
  page: number;        // Current page number
  limit: number;       // Items per page
  total: number;       // Total number of items
  total_pages: number; // Total number of pages
  has_more: boolean;   // Whether more pages exist
}
```

### Error

```typescript
{
  error: {
    code: string;              // Machine-readable error code
    message: string;           // Human-readable error message
    details?: Record<string, any>; // Additional error context
    request_id: string;        // Request identifier for support
  }
}
```

---

## Webhooks

### Overview

Webhooks allow you to receive real-time notifications when events occur.

**Webhook URL Requirements:**
- Must be HTTPS
- Must return 200 OK within 5 seconds
- Retries: 3 attempts with exponential backoff

### Webhook Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `resource.created` | Resource created | Resource object |
| `resource.updated` | Resource updated | Resource object |
| `resource.deleted` | Resource deleted | Resource ID |
| `user.created` | User registered | User object |

### Webhook Payload

```json
{
  "id": "evt_abc123",
  "type": "resource.created",
  "created_at": "2024-03-15T15:30:00Z",
  "data": {
    "id": "res_xyz789",
    "name": "New Resource",
    ...
  }
}
```

### Webhook Signature Verification

**Header:**
```
X-Webhook-Signature: sha256=abc123...
```

**Verification (Node.js):**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return `sha256=${hash}` === signature;
}
```

### Configure Webhooks

```bash
POST /v1/webhooks

{
  "url": "https://your-app.com/webhooks",
  "events": ["resource.created", "resource.updated"],
  "secret": "your_webhook_secret"
}
```

---

## SDKs & Client Libraries

### Official SDKs

**JavaScript/TypeScript:**
```bash
npm install @example/api-client
```

```typescript
import { ApiClient } from '@example/api-client';

const client = new ApiClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

const user = await client.users.me();
```

**Python:**
```bash
pip install example-api
```

```python
from example_api import Client

client = Client(api_key='your_api_key')
user = client.users.me()
```

### Community Libraries

- **Ruby**: [github.com/example/ruby-client](link)
- **Go**: [github.com/example/go-client](link)
- **PHP**: [github.com/example/php-client](link)

---

## Changelog

### v1.2.0 (2024-03-01)

**Added:**
- New `/v1/resources/bulk` endpoint for batch operations
- Support for webhooks

**Changed:**
- Increased rate limit to 1000 requests/hour

**Deprecated:**
- `/v1/legacy/endpoint` (will be removed in v2.0)

### v1.1.0 (2024-02-01)

**Added:**
- Pagination support for list endpoints
- New `filter` query parameters

**Fixed:**
- Fixed date format in timestamps

### v1.0.0 (2024-01-01)

**Initial Release:**
- Core API endpoints
- Authentication with JWT
- Rate limiting

---

## Support

**Need Help?**
- 📖 [Full Documentation](https://docs.example.com)
- 💬 [Developer Forum](https://forum.example.com)
- 🐛 [Report API Issues](https://github.com/example/api/issues)
- 📧 [Email Support](mailto:api-support@example.com)

**Status Page:**
[status.example.com](https://status.example.com)

---

**Last Updated:** YYYY-MM-DD
**API Version:** v1.2.0
