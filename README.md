# Pro Pundits

Pro Pundits is a responsive football predictions and player-statistics website, presented in a white, gold and charcoal theme.

## Live website

https://pro-pundits.vercel.app

## Repository contents

- `index.html` — website interface, navigation and client-side interactions.
- `api/matches.js` — upcoming fixtures and provider prediction data.
- `api/live.js` — live scores and selected match event details.
- `api/players.js` — player-statistics leaderboard.
- `api/supabase-config.js` and `api/supabase-health.js` — Supabase configuration and health-check endpoints.
- `.env.example` — names of required environment variables (never put real secrets here).
- `.github/workflows/deploy-pages.yml` — repository workflow configuration.

## Deployment

The production website is hosted on Vercel and is connected to the `main` branch. New commits to `main` trigger a Vercel deployment.

For Vercel, use the **Other** framework preset and keep the project root at `./`. The API routes in `api/` are Vercel serverless functions.

## Environment variables

Configure secrets in Vercel → Project → Settings → Environment Variables. Do not commit real keys to GitHub.

- `API_FOOTBALL_KEY` — server-side API-Football key used by the football-data endpoints.
- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_ANON_KEY` — Supabase publishable/anon key used for the supported client authentication flow.

Never expose a Supabase service-role key in browser code. Keep all provider secrets server-side.

## API usage and season availability

The site caches football responses to reduce API calls. Live scores refresh in the browser about every two minutes, and detailed event lookups are limited to a small number of live fixtures.

The current API-Football Free plan used for this project supports player-statistics seasons 2022–2024. The Players section defaults to 2024 and labels those records as historical. Availability of fixtures, predictions, live scores and player categories depends on API-Football plan coverage, request limits and data availability.

## Important user-facing limitations

- Provider forecasts and probabilities are estimates, not guarantees.
- A “no live matches” message means no live fixtures were returned at the time of the request; it is not itself an error.
- Some player statistics are historical because of the current free-plan season restriction.
- Users should verify match information independently and follow local laws. Pro Pundits does not guarantee betting outcomes.

## Creator

Created by **Iheanacho Simon**.
