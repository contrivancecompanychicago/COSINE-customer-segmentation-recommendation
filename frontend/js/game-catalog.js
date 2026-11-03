(function (root) {
  'use strict';
  // Discovery metadata is independent of playable scene packs.
  const catalog = {
    schemaVersion: 1,
    games: [
      {
        id: 'lantern-in-the-shire', title: 'The Lantern in the Shire',
        description: 'Explore Bramblewood, help a jay, and recover a missing glowstone.',
        genres: ['adventure', 'fantasy'], themes: ['forest', 'friendship', 'exploration'],
        formats: ['text adventure', 'choice based'], platforms: ['browser'],
        devices: null, sessionMinutes: null, status: 'playable',
        playUrl: 'contrigamebot.html?game=lantern-in-the-shire', packId: 'lantern-in-the-shire'
      },
      {
        id: 'clockwork-lighthouse', title: 'The Clockwork Lighthouse',
        description: 'Find a brass key and restore a stormbound lighthouse to guide a ship home.',
        genres: ['adventure'], themes: ['lighthouse', 'storm', 'rescue', 'clockwork'],
        formats: ['text adventure', 'choice based'], platforms: ['browser'],
        devices: null, sessionMinutes: null, status: 'playable',
        playUrl: 'contrigamebot.html?game=clockwork-lighthouse', packId: 'clockwork-lighthouse'
      }
    ]
  };
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  else root.CONTRIGAMEBOT_CATALOG = catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this);
