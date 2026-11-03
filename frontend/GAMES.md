# Adding games to ContriGameBot

ContriGameBot 0.3.0 uses data-driven game packs. The engine is in `contrigamebot.js`; built-in games are in `contrigamebot-games.js`. Game progress is stored in this browser using a player name, game ID, and one of three save slots. It is not a user account and does not sync to another device.

## Game pack fields

Each entry in `window.CONTRIGAMEBOT_GAMES` is keyed by a stable unique game ID and contains:

- `title`, `kicker`, `description`: picker and landing-page details.
- `chapters`, `start`, `stats`: chapter count, first scene ID, and starting `energy`, `courage`, `insight` values.
- `quests`: optional list of `{ id, title, description, availableAt, optional }`; scene effects can complete quest IDs.
- `items`: optional map of stable item IDs to `{ name, icon, description }`.
- `scenes`: map from stable scene ID to `{ chapter, icon, title, text, choices }`.
- Each choice has a `label`, a valid destination `next`, and optional `effects`: `stats` deltas, `items` changes (`{ id, quantity }`, quantity defaults to +1), `completeQuests` IDs, or an `ending` key.

Keep IDs stable after release to preserve existing saves. All choice destinations should exist. Ending scenes should use ID `ending` for the default replay experience.

## Add, import, and export packs

The Game pack tools on the game page can create a starter pack, import JSON, and export the selected game as JSON. Imported or created packs persist in the current browser and are not automatically committed to the repository. Export a pack, review it, then add it to the built-in registry to ship it to all players. Imported pack validation checks required metadata, starting stats, scenes, and choice destinations; only import JSON from a trusted source.

To add a built-in game, add another entry to `contrigamebot-games.js` using the Clockwork Lighthouse or Lantern game as an example. The current save system is local-browser prototype functionality: there are no accounts, server saves, or cross-device synchronization.

## Make a game discoverable

Playable packs and recommendation entries are separate. Add reviewed metadata to the shared catalog following [CATALOG.md](CATALOG.md). Externally hosted games need a catalog entry but do not need a playable pack.
