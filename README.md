# When & Where — Portland Japanese Garden

An independent photo guessing prototype: guess the month and day, then place a pin on the main landmark shown. There is no year guessing. This is a coworker playtest, not an official Portland Japanese Garden product.

## Play

Play at https://fonyomi23.github.io/garden-when-and-where/ or open `index.html` locally. Keep the files and images folder together. No installation or build step is needed.

## Public edition

The public game has one curated collection of 119 photographs, each with an approved capture date and landmark pin. It does not load browser review overrides or expose a review desk. Photographer credits and license links appear after each reveal.

The original local working copy retains the review desk, excluded photographs, draft pins, and review exports. To refresh this public collection after incorporating more reviews there, run:

```sh
node scripts/build-public-catalog.cjs /path/to/working-copy/dist
```

Then run `node scripts/verify-public.cjs` and test the game before publishing.

## Source records and attribution

Photographer credits and available license links appear in the game. Original source records are in `sources.json`, the approved public answers in `data.js`. The source archive includes both photos with declared open licenses and official Garden photos without an established open license. Inclusion in this repository does not grant additional reuse rights. Follow each photograph's source and license terms.

Map data: © OpenStreetMap contributors, available under ODbL: https://www.openstreetmap.org/copyright. Landmark coordinates and distance results are approximate, not surveyed measurements. `map-adjustments.js` applies approximate path corrections from the creator’s annotated map; the original OpenStreetMap geometry is preserved in `map-data.js` and `map-source.geojson`. These changes do not move the approved answer pins.

## GitHub Pages

Publish the `main` branch from `/ (root)` in Settings → Pages. The `.nojekyll` file allows these static files to be served directly. Subsequent pushes to `main` update the shared game.
