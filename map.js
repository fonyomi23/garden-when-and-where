/* A local, north-up map from OpenStreetMap geometry. No tile server required. */
window.GardenMap = (() => {
  const R=6371008.8,rad=Math.PI/180;
  const distance=(a,b)=>{const p=(b.lat-a.lat)*rad,l=(b.lon-a.lon)*rad,s=Math.sin(p/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(l/2)**2;return 2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function create(container,{onChange=()=>{},readonly=false,label='Garden map. Click to place a pin; use arrow keys to move it.'}={}){
    const data=window.GARDEN_MAP_DATA;
    if(!data){container.textContent='Map data is unavailable.';return null;}
    const b=data.bounds,lat0=(b.north+b.south)/2,k=Math.cos(lat0*rad),W=(b.east-b.west)*rad*R*k,H=(b.north-b.south)*rad*R;
    const xy=p=>[(p.lon-b.west)*rad*R*k,(b.north-p.lat)*rad*R];
    const ll=(x,y)=>({lat:b.north-y/(rad*R),lon:b.west+x/(rad*R*k)});
    const valid=p=>p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&p.lat>=b.south&&p.lat<=b.north&&p.lon>=b.west&&p.lon<=b.east;
    let pin=null,target=null,view={x:0,y:0,w:W,h:H},drag=null;
    const coord=c=>xy({lon:c[0],lat:c[1]}).map(n=>n.toFixed(2)).join(',');
    const path=(a,close=false)=>a.map((c,i)=>(i?'L':'M')+coord(c)).join(' ')+(close?'Z':'');
    const featurePath=f=>{const g=f.geometry;if(!g)return '';if(g.type==='Polygon')return g.coordinates.map(r=>path(r,true)).join(' ');if(g.type==='MultiPolygon')return g.coordinates.flatMap(p=>p.map(r=>path(r,true))).join(' ');if(g.type==='LineString')return path(g.coordinates);if(g.type==='MultiLineString')return g.coordinates.map(r=>path(r)).join(' ');return '';};
    const features=data.features||data.geojson?.features||[];
    const classify=f=>{const t=f.properties||{};if(t.building)return 'building';if(t.natural==='water'||t.water||t.waterway)return 'water';if(t.highway||t.footway||t.bridge)return 'path';if(t.barrier)return 'fence';if(t.leisure==='garden'||t.name==='Portland Japanese Garden')return 'garden';return 'land';};
    const order={land:0,garden:1,water:2,path:3,building:4,fence:5};
    let shapes=features.filter(f=>f.geometry?.type!=='Point').sort((a,b)=>order[classify(a)]-order[classify(b)]).map(f=>`<path class="map-${classify(f)}" d="${featurePath(f)}" fill-rule="evenodd"/>`).join('');
    let labels=(data.labels||[]).map(p=>{const [x,y]=xy(p);return `<text class="map-label" x="${x}" y="${y}">${esc(p.name)}</text>`;}).join('');
    container.innerHTML=`<div class="map-tools"><button type="button" data-map-action="in" aria-label="Zoom map in">+</button><button type="button" data-map-action="out" aria-label="Zoom map out">−</button><button type="button" data-map-action="reset" aria-label="Reset map view">↺</button></div><svg class="garden-basemap" viewBox="0 0 ${W} ${H}" tabindex="0" role="application" aria-label="${esc(label)}"><rect x="-1000" y="-1000" width="3000" height="3000" fill="#e5ebdd"/>${shapes}<g class="map-labels">${labels}</g><g class="map-pins"></g></svg><div class="map-north">N ↑</div><div class="map-scale"><i></i><span>50 m</span></div><div class="map-attribution">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></div>`;
    const svg=container.querySelector('svg'),pins=container.querySelector('.map-pins');
    function draw(){let s='';if(pin&&target){const a=xy(pin),z=xy(target);s+=`<path d="M${a.join(',')} L${z.join(',')}" stroke="#806235" stroke-width="1.3" stroke-dasharray="3 2"/>`;}
      for(const [p,type] of [[target,'answer'],[pin,'guess']])if(p){const [x,y]=xy(p);s+=`<g transform="translate(${x},${y})"><circle r="5.5" class="pin-${type}"/><circle r="1.6" fill="white"/></g>`;}
      pins.innerHTML=s;
    }
    function updateView(){svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);container.querySelector('.map-scale i').style.width=`${50/view.w*100}%`;container.querySelector('.map-scale').style.width='100%';}
    function pointAt(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse());return [q.x,q.y];}
    function place(p,emit=true){if(!valid(p))return false;pin={lat:p.lat,lon:p.lon};draw();if(emit)onChange(pin);return true;}
    function zoom(f){const nw=Math.min(W,Math.max(W/4,view.w*f)),nh=nw*H/W;view={x:Math.max(0,Math.min(W-nw,view.x+(view.w-nw)/2)),y:Math.max(0,Math.min(H-nh,view.y+(view.h-nh)/2)),w:nw,h:nh};updateView();}
    container.querySelectorAll('[data-map-action]').forEach(btn=>btn.addEventListener('click',()=>{const a=btn.dataset.mapAction;if(a==='reset'){view={x:0,y:0,w:W,h:H};updateView();}else zoom(a==='in'?.65:1/.65);}));
    svg.addEventListener('pointerdown',e=>{const p=pointAt(e);drag={x:e.clientX,y:e.clientY,point:p,view:{...view},moved:false};svg.setPointerCapture(e.pointerId);});
    svg.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;if(drag.moved){const p=pointAt(e);view.x=Math.max(0,Math.min(W-view.w,view.x+drag.point[0]-p[0]));view.y=Math.max(0,Math.min(H-view.h,view.y+drag.point[1]-p[1]));updateView();}});
    svg.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&!readonly){const p=pointAt(e);place(ll(p[0],p[1]));}drag=null;});svg.addEventListener('pointercancel',()=>drag=null);
    svg.addEventListener('keydown',e=>{if(readonly)return;const amount=e.shiftKey?10:2;let p=pin?xy(pin):[view.x+view.w/2,view.y+view.h/2];if(e.key==='ArrowUp')p[1]-=amount;else if(e.key==='ArrowDown')p[1]+=amount;else if(e.key==='ArrowLeft')p[0]-=amount;else if(e.key==='ArrowRight')p[0]+=amount;else if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();p=[Math.max(0,Math.min(W,p[0])),Math.max(0,Math.min(H,p[1]))];place(ll(...p));});
    updateView();
    return {setPin(p,emit=false){if(p===null){pin=null;draw();return;}return place(p,emit);},setTarget(p){target=valid(p)?p:null;draw();},getPin(){return pin;},reset(){pin=null;target=null;view={x:0,y:0,w:W,h:H};updateView();draw();},distance,valid};
  }
  return {create,distance};
})();
