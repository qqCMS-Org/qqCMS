# Media

> **Status: NOT IMPLEMENTED** — Media upload module is not yet created in `apps/api`. `uploads/` directory does not exist.

## Storage

Files are stored in the local filesystem under `UPLOAD_DIR` (default: `./uploads` relative to `apps/api`).

The directory is created automatically on server startup if it does not exist.

In Docker deployments, `uploads/` is mounted as a named volume to persist files across container restarts (see [deployment.md](./deployment.md)).

## Upload Flow

```
Admin uploads file via Media Library UI
        │
        ▼
POST /media  (multipart/form-data)
        │
        ▼
Server validates MIME type and file size
        │
  validation fails → 400 Bad Request
        │
  validation passes
        │
        ▼
Generate UUID-based filename (e.g. a1b2c3d4.jpg)
        │
        ▼
Save file to UPLOAD_DIR/<uuid>.<ext>
        │
        ▼
Insert record into `media` table
        │
        ▼
Return { id, url, filename, original_name, mime_type, size }
```

## Validation Rules

| Rule | Value |
|---|---|
| Allowed MIME types | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| Max file size | 10 MB |
| Filename on disk | UUID v4 + original extension |

Requests with disallowed MIME types or oversized files are rejected with `400 Bad Request`.

## API Endpoints (planned)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/media` | List all uploaded files |
| `POST` | `/media` | Upload a new file (multipart/form-data) |
| `DELETE` | `/media/:id` | Delete a file (removes from disk and DB) |

## Public URL

Uploaded files are served as static assets:

```
GET /uploads/<uuid>.<ext>
```

The `url` field in the `media` table stores this path (e.g. `/uploads/a1b2c3d4.jpg`).

## TipTap Integration

When an admin inserts an image in the TipTap editor, they select from the media library. The editor stores the `url` value as the `src` attribute in the JSON document.

> **Not implemented** — TipTap image extension and media library UI are planned but not built.
