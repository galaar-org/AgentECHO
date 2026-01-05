# AgentECHO Next.js Example

Working example of AgentECHO integrated with Next.js 16 using `proxy.ts`.

## Setup

```bash
# From repository root
pnpm install
pnpm build

# Configure environment
cd examples/nextjs-16-app
cp .env.local.example .env.local  # Edit with your values

# Run
pnpm dev
```

Open http://localhost:3001

## Environment Variables

```bash
AGENTECHO_URL=https://webhook.site/your-id
AGENTECHO_KEY_ID=dev-key
AGENTECHO_KEY=dev-secret
AGENTECHO_SAMPLE_RATE=1.0
```

Use [webhook.site](https://webhook.site) to test without a backend.

## Project Structure

```
├── proxy.ts          # AgentECHO integration
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
└── components/
```

## How It Works

`proxy.ts` captures every request:

```typescript
export function proxy(req: NextRequest, event: NextFetchEvent) {
  tracker.capture(req, event);  // Fire-and-forget
  return NextResponse.next();
}
```

Events are sent asynchronously via `event.waitUntil()` — responses are never blocked.

## Verification

With `debug: true`, check console for:

```
[AgentECHO] Initialized: { ... }
[AgentECHO] Scheduled: /
[AgentECHO] Captured: abc-123-...
```

## License

MIT
