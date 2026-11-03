# ContriGameBot AI conversation (v0.4)

The optional Node server interprets natural-language preferences and follow-up requests with the OpenAI Responses API. It asks for a structured preference plan using only current catalog tags/titles. The server validates that plan, applies exclusions and known device/time constraints, and ranks catalog entries. Descriptions, play links, and unknown-feature notes come from application data. AI does not create new game listings.

## Start locally

Use Node.js 20 or newer. From `frontend`, run:

```sh
npm start
```

Open http://localhost:8000/html/recommender.html. Without a server-side key, keyword matching works and the AI checkbox is disabled. A Python static server still supports keyword mode only.

To activate AI, set `OPENAI_API_KEY` in your server environment. Keep it out of GitHub files, browser scripts, screenshots, and chat messages. On macOS/Linux you can enter it without putting the value into shell command history:

```sh
read -r -s -p 'OpenAI API key: ' OPENAI_API_KEY
echo
export OPENAI_API_KEY
npm start
```

If your shell does not support these read flags, use its secure environment-variable setup or a hosting secret manager. The app does not read `.env` files automatically. `OPENAI_MODEL` optionally overrides the default `gpt-5-mini`. Use a model supporting Responses structured outputs and low reasoning effort. `PORT` defaults to 8000. Stop the Python server first if it is already using that port.

After starting with a key, refresh the page and check **Use AI conversation**. Example checks:

1. “I would like a story about helping a ship reach safety.” Expect a rescue/lighthouse match.
2. “Something else, without storms.” Earlier preferences should be considered and storm-tagged entries excluded.
3. “Show me Krebsville, on my phone, under 10 minutes.” Expect the catalog entry with device/time unknown notes.
4. “Hello.” Expect a question about preferences.
5. Clear conversation and make a fresh request. Earlier preferences should no longer influence it.

Interpretations are probabilistic. Review semantic quality with real requests before treating AI recommendations as verified. Unknown metadata is never promoted to confirmed compatibility. A project hub retains its Open project hub action.

## Data and fallback

AI mode sends the request, up to eight recent in-page conversation messages, and the catalog to OpenAI. The request sets `store: false`; provider data handling still follows your API account's policies. The app does not persist chat history or log message text. Reload, switching mode, and Clear conversation reset local context. Static keyword mode sends no conversation to OpenAI. AI failures, refusals, timeouts, malformed plans, and missing configuration produce a clearly labeled keyword fallback for the latest request only, resetting context.

## Server boundary

This is a local prototype: the server binds to 127.0.0.1, checks Host/Origin, limits request sizes and rate, and serves only browser assets. Server source and secrets are not static assets. It has no user authentication or durable quotas. Public hosting needs an authenticated deployment with per-user usage limits and a server secret; do not expose this local server through a public tunnel as-is. No AI hosting or paid model call is configured by committing these files.

## Verification

`npm test` includes mocked Responses API and HTTP integration checks. No API key is required for tests and no paid API calls are made. Tests verify transport configuration, context forwarding, schema validation, exclusions, fallback errors, input limits, and secret-file isolation. Live model semantics and browser behavior require the manual checks above.

API implementation follows the official OpenAI documentation:

- https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses
- https://developers.openai.com/api/docs/models/gpt-5-mini
