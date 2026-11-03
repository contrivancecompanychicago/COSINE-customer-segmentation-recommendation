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
- `status` is `playable`, `project-hub`, `coming-soon`, or `unavailable`. Playable games and project hubs are discoverable. Hubs use an Open project hub action and explicitly disclose unverified gameplay availability.
- `playUrl` is an HTTPS URL or a local HTML filename with an optional query. It may be `null` for coming-soon or unavailable entries; playable games and project hubs need a destination. The validator checks URL syntax and allowed protocols; maintainers must verify that the destination works and belongs to the intended game.
- For a built-in adventure, add `packId` and use `contrigamebot.html?game=PACK_ID`. `npm test` verifies pack references. External games omit `packId` and need no scenes, quests, or stats.

No external games are included until their metadata and destination are reviewed. Browser-imported playable packs are not automatically added to this shared catalog. Review and commit a catalog entry to make them discoverable for all players.

## Matching behavior

The first baseline uses case-insensitive keyword matching on tags and title words, with equal weight per matching attribute. Results are sorted by score, then stable ID; at most three are shown. It recognizes mobile/phone and desktop requests, plus numeric minute limits or short/quick (15 minutes). Known incompatible device or time values exclude a game; unknown values are explicitly disclosed and do not count as matches. When nothing matches, available alternatives are labeled as alternatives. Scores are ranking values, not probabilities or suitability guarantees.

This is a limited keyword baseline: it does not interpret arbitrary natural language, negation, or follow-up context. Each submitted request is independent. Requests and replies are not persisted or sent to a server. The UI labels keyword mode and offers AI mode only when the Node server reports a configured API key.

## Optional AI conversation

The optional Node server interprets recent conversation into catalog vocabulary, exclusions, device, and time preferences. It validates the structured plan and ranks catalog entries; descriptions and links stay catalog-derived. See [AI-SETUP.md](AI-SETUP.md). Keep model credentials on the server. The legacy phone-purchase classifiers are independent.

## Validation

Run `npm test` from `frontend`, then `npm pack --dry-run`. Tests cover built-in pack references, duplicate IDs, unsafe URLs, unknown metadata, ranking, incompatible preferences, external entries, and unavailable games. These are automated data and logic checks; browser usability and real device support require separate review.

## First external listing

Krebsville Nights: Unequal Treatment links to https://krebsvilleunequaltreatmentpt-1.replit.app, supplied by the project owner. On 2026-11-03 the page returned HTTP 200 and identified itself as Krebsville Nights: Unequal Treatment / COSINE MUD. Its HTML includes hospital scenes, command input, available actions, and quest scripts. These support the catalog description and tags. Full gameplay, device compatibility, and session duration were not verified; the latter two remain null. This external game does not need a built-in scene pack.

## CULAPSE project hub

The owner supplied https://culapsedatafarm-agent-lab.erichilarysmithsr.chatgpt.site. On 2026-11-03 the Sites service confirmed that exact published URL, public access, and title CULAPSEDataFarm: Kaggriculture Agent Lab. Direct retrieval returned 403, so page contents and gameplay could not be inspected. The entry uses project-hub status, conservative title-based tags, no genre or gameplay-format claims, and unknown device support/session length. Its action opens the project hub; it does not promise direct gameplay. The previously supplied GitHub repository remains inaccessible and is not used as evidence for this listing.
