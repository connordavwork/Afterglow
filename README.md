# Afterglow: deploy guide

A film recommender. Visitors type a Letterboxd username, the server reads their public feed (last ~50 films),
and Claude returns picks with a match %, description and reason.

```
index.html          the page
api/feed.js         username -> recent films (reads Letterboxd's public RSS feed)
api/recommend.js    builds the prompt, calls Claude with YOUR key, returns picks
vercel.json         lets the AI function run up to 60 seconds
```

## Deploy (about 10 minutes, free to start)

1. **Get an API key.** Create an account at console.anthropic.com, add a small amount of credit, then
   create a key under *API keys*. **Set a monthly spend limit** in the billing/limits settings (e.g. $10).
2. **Put the code on GitHub.** Create a new repository and upload everything in this folder
   (the folder's contents, with `index.html` at the top level and an `api` folder).
3. **Deploy on Vercel.** Sign in at vercel.com with GitHub, click *Add New → Project*, pick the repository.
   Before clicking Deploy, open *Environment Variables* and add:
   - `ANTHROPIC_API_KEY` = your key (required)
   - `DAILY_LIMIT_PER_IP` = `10` (optional, requests per visitor per day)
   - `ANTHROPIC_MODEL` = a different model name (optional, defaults to `claude-haiku-5-5`, the cheapest tier)
4. Click **Deploy**. You get a public `something.vercel.app` link. Done.

Optional: add a custom domain under the project's *Domains* settings.

## Keeping costs under control
- Spend limit on your Anthropic account (the real safety net).
- `DAILY_LIMIT_PER_IP` caps each visitor. It's best-effort (it can reset when the server restarts), so
  don't rely on it alone.
- The prompt is built on the server and inputs are size-capped, so the key can't be used as a free general chatbot.
- Never put your key in `index.html` or commit a `.env` file.

## Good to know
- **Letterboxd may block the feed lookup** from some servers. If lookups fail, the page falls back to the
  CSV export and the "list favorites" box, which still work.
- Letterboxd's feed only covers recent diary entries. For richer taste data, apply for their official API.
- Vercel's free Hobby plan is for personal, non-commercial use. Check their terms before adding ads or payments.
- Recommendations come from Claude's film knowledge. Match % is an estimate, and titles should be double-checked.

## Test locally (optional)
Install Node 18+, then: `npm i -g vercel`, create `.env.local` containing `ANTHROPIC_API_KEY=...`, run `vercel dev`.
