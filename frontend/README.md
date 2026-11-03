# ContriGameBot

**Version 0.4.0** — a reusable, browser-based Game Master prototype. The package includes two playable game packs, a quest log, inventory, player-name profiles, three local save slots, and tools to create/import/export game packs.

## Find a game

Open `html/recommender.html` for a chat-style preference matcher using the shared game catalog. Keyword mode works on static hosting. Optional AI conversation runs through a local Node server; see [AI-SETUP.md](AI-SETUP.md) for server-side key configuration and testing. Unknown device support and session lengths are disclosed. See [CATALOG.md](CATALOG.md) to add built-in or externally hosted games without changing the recommender engine.

## Install

```sh
npm install @contrivancecompanychicago/contrigamebot
```

This package includes browser assets and an optional local Node server (`npm start`, Node 20+). It does not expose a public CommonJS/ES module API. Serve the installed package directory with a static web server and open `html/contrigamebot.html`. Its relative links load the packaged CSS and scripts.

For example, from a project that installed the package:

```sh
npx http-server node_modules/@contrivancecompanychicago/contrigamebot
```

Then open the URL printed by the server followed by `/html/contrigamebot.html`.

You can also use the demo directly from a checkout by serving the `frontend` directory:

```sh
cd frontend
python -m http.server 8000
```

Open `http://localhost:8000/html/contrigamebot.html`.

## Included game packs

- The Lantern in the Shire
- The Clockwork Lighthouse

Use the Game World selector to switch between them. Progress, profiles, save slots, and imported packs are stored in the browser running the demo. They do not sync across devices and are not accounts.

## Create and share packs

Use **Game pack tools** below the game to create a starter pack, import JSON, or export the selected game. See [GAMES.md](GAMES.md) for the game-pack format and how to add a pack to the built-in registry. Treat imported JSON as untrusted content; the demo validates pack structure but does not provide a hosted authoring service.

## Development and packaging

The package has no runtime dependencies. From this directory:

```sh
npm test
npm pack --dry-run
```

`npm test` checks the built-in pack structure, catalog references, and recommendation behavior. Publish from this `frontend` directory when the npm scope is configured and the release is approved:

```sh
npm publish --access public
```

This is a prototype release. It does not provide server-side persistence, authentication, multiplayer, cloud saves, or production-ready security guarantees. The fictional Shire story does not provide medical advice and this demo should not collect health information.
