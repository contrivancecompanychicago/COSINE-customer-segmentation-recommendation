# Changelog

Notable changes to ContriGameBot are documented here. Until the first stable release, version `0.x` indicates a pre-release prototype and the interface or game-pack format may change.

## 0.2.0 — 2026-11-03

Reusable game packs and local profile features:

- Added player-name based local profiles with three save slots per game and player.
- Added the Clockwork Lighthouse as a second built-in playable game pack.
- Added in-browser starter-pack creation plus JSON import/export for game packs.
- Added basic import validation and migration of the v0.1.0 default-player save.
- Added npm package metadata and pack-validation test for distributing the browser app as static assets.
- Expanded the game pack guide and updated the interface version badge.

Saves and custom packs remain in the current browser. There are no accounts, server-side saves, cloud synchronization, or production-ready security guarantees.

## 0.1.0 — 2026-11-03

Initial playable prototype release:

- Modular, data-driven game registry with the Lantern in the Shire story pack.
- Choice-based scenes with player stats, quest log, and inventory.
- Per-game progress saved in the current browser.
- Guide for adding additional game packs.

This is a browser-only prototype. It does not include player accounts, shared/cross-device saves, server-side game state, or production readiness guarantees.
