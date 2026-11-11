# Pro Pundits

Premium football analysis and player-statistics website. The interface uses a white, gold and charcoal theme.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. Set the project framework preset to **Other** (static HTML + Vercel Functions).
3. Keep the root directory as `./`.
4. Deploy. The homepage is `index.html`.

## Connect live player statistics

The player leaderboard uses API-Football (API-Sports).

1. Create an account at https://www.api-football.com/ and copy your API key from its dashboard.
2. In Vercel, open **Project → Settings → Environment Variables**.
3. Add `API_FOOTBALL_KEY` with your API key as the value. Apply it to Production (and Preview if needed).
4. Save, then open **Deployments** and redeploy the latest deployment.
5. Open the Player stats section. Choose a league and season, then select Top scorers, Assists, Clean sheets or cards.

Do not put the API key in `index.html`, commit it to GitHub, or share it publicly. The key is read only by the serverless function at `/api/players`.

## What works now

- Responsive white-and-gold homepage and navigation.
- Football and basketball sample market cards, search and market filters.
- Analysis strategy selection.
- Add/remove/clear shortlist.
- Live player-statistics requests through the protected Vercel API route once the API key is configured.

## Important limitations

The match cards and example markets are clearly labelled illustrative data; they are not live fixtures or verified predictions. Live match scores, real fixtures, user authentication, subscriptions/payments and a production admin panel are not connected yet. Those require trusted data sources and service configuration. No prediction is guaranteed.

## Local preview

You can open `index.html` directly for the front-end preview. To test the API route locally, use Vercel CLI and add `API_FOOTBALL_KEY` to a local `.env.local` file (never commit that file).
