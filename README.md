# When & Where — Portland Japanese Garden

An independent photo guessing prototype: guess the month and day, then place a pin on the main landmark shown. There is no year guessing. This is a coworker playtest, not an official Portland Japanese Garden product.

## Play

Open `index.html` locally, or use the GitHub Pages link shown in this repository once Pages is enabled. Keep the files and images folder together. No installation or build step is needed.

## Photo reviews

The September 18 reviews are included automatically: 123 approved capture dates, 119 approved landmark pins, and 7 excluded photos. There are 123 playable photographs and 120 map reference rounds, including one original source reference. Four unapproved draft pins remain in the review desk and are not used as scoring coordinates.

Open `review.html` to continue reviewing. New edits stay in your browser; export them as JSON for a backup or to incorporate into a later release. When using local files, import later review exports in the game too. Reset local changes returns to the included defaults.

## Source records and attribution

Photographer credits and available license links appear in the game. Original source records are in `sources.json`, capture data in `data.js`, and saved review decisions in `review-defaults.js`. The collection contains 100 photos with declared open licenses and 30 official Garden photos without an established open license. Inclusion in this repository does not grant additional reuse rights. Follow each photograph's source and license terms.

Map data: © OpenStreetMap contributors, available under ODbL: https://www.openstreetmap.org/copyright. Landmark coordinates and distance results are approximate, not surveyed measurements.

## GitHub Pages

Publish the `main` branch from `/ (root)` in Settings → Pages. The `.nojekyll` file allows these static files to be served directly. Subsequent pushes to `main` update the shared game.
