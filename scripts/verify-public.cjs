const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context={window:{}};vm.createContext(context);
for(const file of ['data.js','map-data.js','map-adjustments.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const photos=context.window.GARDEN_PHOTOS,b=context.window.GARDEN_MAP_DATA.bounds;
assert(photos.length>0);assert.equal(new Set(photos.map(p=>p.id)).size,photos.length);
for(const p of photos){assert(fs.existsSync(path.join(root,p.image)));assert(Number.isInteger(p.month)&&p.month>=1&&p.month<=12);assert(p.day>=1&&p.day<=[31,28,31,30,31,30,31,31,30,31,30,31][p.month-1]);assert.equal(p.point.status,'reviewed');assert(p.point.lat>=b.south&&p.point.lat<=b.north&&p.point.lon>=b.west&&p.point.lon<=b.east);assert(p.point.name&&p.source);assert(p.credit||new URL(p.source).hostname==='japanesegarden.org');}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert(!/review\.html|review-store|review-defaults|aboutDialog|roundSet|importGameReviews/.test(html));
assert(!/GardenReview|localStorage|review\.html|aboutButton|roundSet|licensedOnly/.test(js));
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert(ids.has(m[1]),`Missing element ${m[1]}`);
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!/^[a-z]+:/i.test(m[1]))assert(fs.existsSync(path.join(root,m[1])),m[1]);
for(const name of ['review.html','review.js','review-store.js','review-defaults.js'])assert(!fs.existsSync(path.join(root,name)));
console.log(`PASS: ${photos.length} reviewed rounds, valid dates and pins, all assets and UI bindings, no public review controls or browser overrides.`);
