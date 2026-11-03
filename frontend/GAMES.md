# Adding games to ContriGameBot

ContriGameBot is a small data-driven story engine. The renderer and save-state logic live in `contrigamebot.js`; each game’s story content is defined separately in `contrigamebot-games.js`. This keeps future game worlds from being tangled together in the UI code.

## Add a game pack

Add a new entry to `window.CONTRIGAMEBOT_GAMES` with a unique ID and these fields:

- `title`, `kicker`, `description`: game picker and landing-page details.
- `chapters`: total chapter count shown in the journey panel.
- `start`: ID of the first scene.
- `stats`: starting values for `energy`, `courage`, and `insight`.
- `quests`: quest definitions with unique IDs, descriptions, and `availableAt` scene IDs; add IDs to `effects.completeQuests` when players complete them.
- `items`: item definitions (`name`, `icon`, `description`).
- `scenes`: scene records with `chapter`, `icon`, `title`, `text`, and `choices`.

A choice uses `next` for its destination scene and can have `effects.stats`, `effects.items`, `effects.completeQuests`, or `effects.ending`. Item changes use `{ id: 'item-id' }` to add one item, `{ id: 'item-id', quantity: -1 }` to remove one. Use the existing Lantern story as a working example. Every game has its own browser save key, so progress in one game does not overwrite another.

The game selector is populated from the registry automatically. Keep game IDs and scene/quest/item IDs stable after release so saved progress remains compatible. This demo stores progress in the current browser only; it does not provide accounts or cross-device saves.
