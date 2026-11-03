# ContriGameBot game catalog (schema v1)

The discovery catalog in `js/game-catalog.js` is separate from the playable scene registry in `js/contrigamebot-games.js`. Add a catalog entry to recommend a game without implementing its scenes in ContriGameBot. The browser recommender is `html/recommender.html`.

## Entry format

```json
{
  "id": "your-game",
  "title": "Your Game",
  "description": "A factual description of your game.",
  "genres": ["adventure"],
  "themes": ["exploration"],
  "formats": ["text adventure"],
  "platforms": ["browser"],
  "devices": null,
  "sessionMinutes": null,
  "status": "coming-soon",
  "playUrl": null
}
```

Add the entry to the catalog's `games` array. IDs are unique lowercase slugs; preserve them after release. The top-level `schemaVersion` is 1.

- `genres`, `themes`, `formats`, and `platforms` are arrays of strings. Use lowercase consistent tags; empty arrays mean no tags supplied.
- `devices` is `null` when unknown, or an array of verified device classes (`mobile`, `desktop`, etc.). An empty array confirms no supported device classes.
- `sessionMinutes` is a positive integer estimate only after measuring/reviewing typical play time, or `null` when unknown.
- `status` is `playable`, `coming-soon`, or `unavailable`. Only playable entries are recommended.
- `playUrl` is an HTTPS URL or a local HTML filename with an optional query. It may be `null` for unplayable entries. The validator checks URL syntax and allowed protocols; maintainers must verify that the destination works and belongs to the intended game.
- For a built-in adventure, add `packId` and use `contrigamebot.html?game=PACK_ID`. `npm test` verifies pack references. External games omit `packId` and need no scenes, quests, or stats.

No external games are included until their metadata and destination are reviewed. Browser-imported playable packs are not automatically added to this shared catalog. Review and commit a catalog entry to make them discoverable for all players.

## Matching behavior

The first baseline uses case-insensitive keyword matching on tags and title words, with equal weight per matching attribute. Results are sorted by score, then stable ID; at most three are shown. It recognizes mobile/phone and desktop requests, plus numeric minute limits or short/quick (15 minutes). Known incompatible device or time values exclude a game; unknown values are explicitly disclosed and do not count as matches. When nothing matches, available alternatives are labeled as alternatives. Scores are ranking values, not probabilities or suitability guarantees.

This is a limited keyword baseline: it does not interpret arbitrary natural language, negation, or follow-up context. Each submitted request is independent. Requests and replies are not persisted or sent to a server. The UI clearly labels that no AI model is connected.

## Adding AI later

Keep the catalog and ranking API as the factual source. A future server-side model can extract structured preferences and explain selected catalog IDs. Verify returned IDs and attributes before displaying them. Keep model credentials on the server. Do not derive recommendations from the legacy phone-purchase classifiers.

## Validation

Run `npm test` from `frontend`, then `npm pack --dry-run`. Tests cover built-in pack references, duplicate IDs, unsafe URLs, unknown metadata, ranking, incompatible preferences, external entries, and unavailable games. These are automated data and logic checks; browser usability and real device support require separate review.
