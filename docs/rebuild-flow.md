# Rebuild Flow

> **Status: IMPLEMENTED** — Full revalidation cycle is in place: API triggers the webhook, `apps/web` validates the secret, clears the in-memory HTML cache, and optionally calls a deploy hook.

## Overview

`apps/web` is **SSR with in-memory HTML caching** — effectively ISR without a TTL. Pages are rendered on first request and cached in memory. When content changes, the API sends a webhook that clears the cache so the next request re-renders from fresh data.

## Flow

```
Admin saves content in admin panel
        │
        ▼
Admin panel calls POST /pages/:id  (or any write endpoint)
        │
        ▼
API server handles the mutation (saves to DB)
        │
        ▼
API server sends POST {PUBLIC_CLIENT_URL}/api/revalidate
  with Authorization header or shared secret
        │
        ▼
apps/web /api/revalidate handler
  → triggers `astro build` (or signals the hosting platform)
        │
        ▼
Static HTML is regenerated from fresh API data
```

## Webhook Endpoint

```
POST /api/revalidate        (in apps/web)
```

Located at `apps/web/src/pages/api/revalidate.ts`.

This endpoint:
1. Verifies the `x-revalidate-secret` header against `REVALIDATE_SECRET` env var (timing-safe compare)
2. Calls `invalidateAll()` to clear the in-memory HTML cache
3. Optionally POSTs to `DEPLOY_HOOK_URL` (e.g. Render.com deploy hook) to trigger a full redeploy

## API Server Side

The server calls the webhook **after every successful write** to pages, navigation, or settings.

```ts
// apps/api/src/modules/rebuild/rebuild.service.ts
export const triggerRebuild = async () => {
  if (!config.publicClientUrl) return;

  await fetch(`${config.publicClientUrl}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": config.jwtSecret,
    },
  }).catch(() => null);
};
```

## On Render.com

Render.com provides a **deploy hook URL** per service. Setting `PUBLIC_CLIENT_URL` to the deploy hook and calling it from the API triggers a full rebuild and redeploy of the static site.

## Local Development

In local development the rebuild is manual:

```sh
bun run dev --cwd apps/web
# or
bun run build --cwd apps/web
```
