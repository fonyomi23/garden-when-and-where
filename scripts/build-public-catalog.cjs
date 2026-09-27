// Run with the path to the private working copy's dist folder after incorporating reviews.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = process.argv[2];
if (!source) throw new Error('Provide the working copy dist folder.');
const context = {window: {}, localStorage: {getItem: () => null, setItem: () => {}}};
vm.createContext(context);
for (const file of ['data.js', 'map-data.js', 'review-defaults.js', 'review-store.js']) {
  vm.runInContext(fs.readFileSync(path.join(source, file), 'utf8'), context);
}
const photos = context.window.GARDEN_PHOTOS.map(context.window.GardenReview.resolve)
  .filter(p => !p.excluded && p.review.dateApproved && p.review.pointApproved)
  .map(p => Object.fromEntries(['id', 'image', 'month', 'day', 'location', 'landmark', 'point', 'credit', 'source', 'caption', 'license', 'licenseUrl', 'openLicense'].filter(k => p[k] !== undefined).map(k => [k, p[k]])));
if (!photos.length) throw new Error('No approved photographs; public collection was not changed.');
const root = path.resolve(__dirname, '..');
fs.writeFileSync(path.join(root, 'data.js'), 'window.GARDEN_PHOTOS = '+JSON.stringify(photos, null, 2)+';\n');
fs.writeFileSync(path.join(root, 'collection-summary.json'), JSON.stringify({edition: 'public', playablePhotos: photos.length, reviewedDates: photos.length, reviewedLandmarks: photos.length}, null, 2)+'\n');
console.log(`Prepared ${photos.length} fully reviewed public rounds.`);
