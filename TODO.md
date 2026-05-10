# pending

## rotate anthropic api key

current key (`sk-ant-api03-xSJK8...`) sits in plain text on disk in 2 places. rotate before going public.

1. console.anthropic.com → Settings → API Keys → "Create Key"
2. paste new key into `clearpath/.env.local` (replace old line)
3. update Vercel: `cd clearpath && vercel env rm ANTHROPIC_API_KEY production` then `vercel env add ANTHROPIC_API_KEY production`
4. redeploy: `vercel --prod`
5. delete `~/my-weekender-project/.env.local` (root copy — Next.js doesn't read it, it's dead weight)
6. revoke old `xSJK8...` key on console.anthropic.com

note: Vercel prod currently has `ANTHROPIC_API_KEY=""` (empty), so prod Anthropic calls are broken until step 3 lands.

## posthog funnels

set up in posthog dashboard:

- **landing page funnel** — track conversion from landing visit → primary CTA click → signup/checkout
- **user journeys funnel** — instrument the key user paths and create funnels for each

(needs the specific events/steps decided before building.)
