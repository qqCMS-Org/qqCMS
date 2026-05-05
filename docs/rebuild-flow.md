# Rebuild Flow

> **Status: IMPLEMENTED** — `triggerRebuild` is called after every write in `apps/api`. `apps/web/src/pages/api/revalidate.ts` exists (webhook receiver logic not yet implemented).

## Overview

`apps/web` is a **static site (SSG)**. Content is baked into HTML at build time. When the admin saves content in the admin panel, the public site must be rebuilt to reflect changes.

The rebuild is triggered via an HTTP webhook.

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

Located at `apps/web/src/pages/api/revalidate.ts` (file exists, logic not implemented).

This endpoint should:
1. Verify the request is from the API server (shared secret or token)
2. Trigger a rebuild (on Render.com: call the deploy hook URL; locally: run `astro build`)

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
