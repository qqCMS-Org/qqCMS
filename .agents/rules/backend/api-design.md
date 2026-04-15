---
id: backend-api-design
category: backend
tags: [api, rest, errors, responses]
description: API design conventions — routes, responses, error handling
---

# API Design

## URL structure

Use lowercase kebab-case. Resources are plural nouns:

```
GET    /users              # list
GET    /users/:id          # single
POST   /users              # create
PATCH  /users/:id          # partial update
DELETE /users/:id          # delete

GET    /users/:id/posts    # nested resource
```

No verbs in URLs:

```
❌ POST /createUser
❌ GET  /getUserById
✅ POST /users
✅ GET  /users/:id
```

---

## Response shape

Successful responses return data directly — no wrapper:

```json
// ✅ GET /users/1
{
  "id": 1,
  "email": "user@example.com",
  "name": "John"
}

// ✅ GET /users
[
  { "id": 1, "email": "user@example.com", "name": "John" }
]
```

---

## Error shape

All errors follow a consistent structure:

```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

For validation errors, include field-level details:

```json
{
  "error": "Invalid input",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "name", "message": "Name is required" }
  ]
}
```

---

## HTTP status codes

| Status | When |
|---|---|
| `200` | Successful GET, PATCH |
| `201` | Successful POST (resource created) |
| `204` | Successful DELETE (no content) |
| `400` | Validation error, bad request |
| `401` | Not authenticated |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict (e.g. email already exists) |
| `500` | Unexpected server error |

---

## Pagination

Use cursor-based pagination for lists:

```json
// GET /posts?limit=20&cursor=eyJpZCI6NX0
{
  "data": [...],
  "nextCursor": "eyJpZCI6MjV9",
  "hasMore": true
}
```
