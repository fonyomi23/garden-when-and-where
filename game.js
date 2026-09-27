(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const lengths = [31,28,31,30,31,30,31,31,30,31,30,31];
  let all = (window.GARDEN_PHOTOS || []).map(GardenReview.resolve);
  let photos = all.filter(p => p.dateReady && !p.excluded && p.point);
  let index = 0, step = 0, guess = 166, selectedPin = null, lastResult = null;
  const guessMap=GardenMap.create($('guessMap'),{onChange:point=>{selectedPin=point;$('reveal').disabled=false;$('mapHint').textContent='Pin placed. Move it until you’re happy, then reveal.';}});
  const answerMap=GardenMap.create($('resultMap'),{readonly:true,label:'Your guess and the reference landmark on the Garden map.'});
  const dayOfYear = (m,d) => lengths.slice(0,m-1).reduce((a,b)=>a+b,0)+Math.min(d,lengths[m-1]);
  function monthDay(n){let m=0;while(n>lengths[m])n-=lengths[m++];return {month:m+1,day:n};}
  const dateText = n => {const d=monthDay(n);return `${months[d.month-1]} ${d.day}`;};
  const current = () => photos[index % photos.length];
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = value => {try{const u=new URL(value,location.href);return /^https?:$/.test(u.protocol)?u.href:'#';}catch{return '#';}};
  $('monthSelect').innerHTML=months.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('');
  function renderCalendar(){
    let svg='<circle cx="160" cy="160" r="111" fill="none" stroke="#dee3d8" stroke-width="14"/>';
    for(let i=0;i<73;i++){const a=(i/73*360-90)*Math.PI/180;const r=i%6===0?98:103;svg+=`<line x1="${160+Math.cos(a)*r}" y1="${160+Math.sin(a)*r}" x2="${160+Math.cos(a)*119}" y2="${160+Math.sin(a)*119}" stroke="#a6b09f" stroke-width="1"/>`;}
    months.forEach((m,i)=>{const a=((dayOfYear(i+1,15)-1)/365*360-90)*Math.PI/180;svg+=`<text x="${160+Math.cos(a)*140}" y="${164+Math.sin(a)*140}" text-anchor="middle" fill="#657168" font-size="11" font-family="Arial">${m.slice(0,3).toUpperCase()}</text>`;});
    const a=((guess-1)/365*360-90)*Math.PI/180;svg+=`<circle cx="${160+Math.cos(a)*111}" cy="${160+Math.sin(a)*111}" r="9" fill="#20372f" stroke="#f5f4ee" stroke-width="3"/>`;
    $('calendar').innerHTML=svg;
  }
  function setGuess(n){
    guess=Math.max(1,Math.min(365,Math.round(n)));const d=monthDay(guess);
    $('monthSelect').value=d.month;
    $('daySelect').innerHTML=Array.from({length:lengths[d.month-1]},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
    $('daySelect').value=d.day;$('dateDisplay').textContent=dateText(guess);$('dateSlider').value=guess;$('dateSlider').setAttribute('aria-valuetext',dateText(guess));renderCalendar();
  }
  function showStep(n){step=n;['whenPanel','wherePanel','resultPanel'].forEach((id,i)=>$(id).hidden=i!==n);[1,2,3].forEach((v,i)=>{$('step'+v).className=i===n?'active':i<n?'done':'';});}
  function setPhoto(){
    if(!photos.length){$('imageFailure').hidden=false;$('imageFailure').textContent='No photos match this collection. Change the collection or review more photos.';$('lockWhen').disabled=true;$('counter').textContent='0 matching photographs';showStep(0);return;}
    const p=current();selectedPin=null;lastResult=null;setGuess(166);showStep(0);guessMap?.reset();answerMap?.reset();$('pinPrompt').textContent=p.pinPrompt||'Drop a pin on the main landmark shown.';$('mapHint').textContent=p.point?'Click to place a pin. Zoom for a closer look.':'Practice pin: this photo needs a reviewed landmark before distance can be scored.';
    $('imageFailure').hidden=true;$('imageFailure').textContent='This photograph couldn’t load. Try another photo.';$('photo').src=p.image;$('largePhoto').src=p.image;
    $('photo').alt='Photograph of Portland Japanese Garden. Look at the vegetation, light and garden details to make your guesses.';
    $('counter').textContent=`Practice edition · ${photos.length} photographs`;$('photoNumber').textContent=`${String(index+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
    $('imageLabel').textContent=p.confidence==='update'?'DATED UPDATE · EXPERIMENTAL ROUND':'LOOK FOR THE LITTLE CLUES';
    $('reveal').disabled=true;
    $('lockWhen').disabled=false;
  }
  function lockDate(){if(step!==0||!current())return;showStep(1);$('lockedDate').textContent=`Date locked: ${dateText(guess)}`;$('wherePanel').querySelector('h1').setAttribute('tabindex','-1');$('wherePanel').querySelector('h1').focus({preventScroll:true});}
  function reveal(skip=false){
    if(step!==1||(!selectedPin&&!skip))return;
    const p=current(),actual=dayOfYear(p.month,p.day),raw=Math.abs(actual-guess),distance=Math.min(raw,365-raw);
    lastResult={daysAway:distance,guessedDate:dateText(guess),actualDate:dateText(actual),location:p.location,distanceMetres:(!skip&&selectedPin&&p.point)?Math.round(GardenMap.distance(selectedPin,p.point)):null,landmark:p.point?.name||p.location,confidence:p.confidence};
    $('resultHeading').textContent=distance===0?'Right on the day.':distance===1?'One day away.':`${distance} days away.`;
    $('actualDate').textContent=dateText(actual);$('guessLine').textContent=`You guessed ${dateText(guess)}.${distance<=7?' A wonderfully close look.':distance<=21?' You caught the season.':''}`;
    $('actualPlace').textContent=p.point?.name||p.location;
    const metres=lastResult.distanceMetres;
    $('placeResult').textContent=skip?'Location skipped.':metres===null?'Landmark needs review — no distance scored.':metres<5?'Within 5 m of the reference.':`About ${Math.round(metres/5)*5} m from the reference.`;
    $('resultMap').hidden=skip||!p.point;$('mapLegend').hidden=skip||!p.point;
    answerMap?.setPin(selectedPin);answerMap?.setTarget(p.point);
    $('mapEvidence').textContent=p.point?(p.point.status==='reviewed'?'Landmark confirmed in your review.':p.point.basis||'Approximate mapped landmark; not yet reviewed by you.'):'Open the photo review desk to identify this landmark and place a reference pin.';
    $('revealNote').textContent=p.note||'Notice the state of the leaves and the details around them. Compare those clues with the next photograph.';
    const confidence=p.confidence==='reviewed'?'Date evidence: confirmed in your photo review.':p.confidence==='update'?'Date evidence: Garden update date; capture day not independently confirmed.':p.confidence==='exif'?'Date evidence: camera capture date recorded in source metadata.':p.confidence==='flickr'?'Date evidence: photographer-supplied Taken on date.':'Date evidence: explicit capture date on the source page.';
    $('sourceCredit').innerHTML=`<div>Photo: ${escape(p.credit||'Portland Japanese Garden')}</div><a href="${escape(safeURL(p.source))}" target="_blank" rel="noopener">View original source ↗</a>${p.licenseUrl?`<a href="${escape(safeURL(p.licenseUrl))}" target="_blank" rel="noopener">${escape(p.license||'Image license')}</a>`:''}<span class="confidence">${confidence}</span><a href="review.html?photo=${encodeURIComponent(p.id)}">Review this photo</a>`;
    $('imageLabel').textContent=p.location.toUpperCase();$('photo').alt=p.caption||`${p.location} at Portland Japanese Garden`;showStep(2);
    return lastResult;
  }
  function next(){if(!photos.length)return;index=(index+1)%photos.length;setPhoto();if(innerWidth<901)$('photo').scrollIntoView({behavior:'smooth',block:'start'});}
  $('dateSlider').addEventListener('input',e=>setGuess(+e.target.value));
  $('monthSelect').addEventListener('change',()=>setGuess(dayOfYear(+$('monthSelect').value,Math.min(+$('daySelect').value,lengths[+$('monthSelect').value-1]))));
  $('daySelect').addEventListener('change',()=>setGuess(dayOfYear(+$('monthSelect').value,+$('daySelect').value)));
  const dial=e=>{const r=$('calendar').getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;let a=Math.atan2(y,x)+Math.PI/2;if(a<0)a+=Math.PI*2;setGuess(1+a/(Math.PI*2)*364);};
  let dragging=false;$('calendar').addEventListener('pointerdown',e=>{dragging=true;$('calendar').setPointerCapture(e.pointerId);dial(e);});$('calendar').addEventListener('pointermove',e=>{if(dragging)dial(e);});$('calendar').addEventListener('pointerup',()=>dragging=false);$('calendar').addEventListener('pointercancel',()=>dragging=false);
  $('lockWhen').addEventListener('click',lockDate);$('reveal').addEventListener('click',()=>reveal());$('skipWhere').addEventListener('click',()=>reveal(true));$('nextPhoto').addEventListener('click',next);$('skipPhoto').addEventListener('click',next);
  $('photo').addEventListener('error',()=>{$('imageFailure').hidden=false;});
  $('enlarge').addEventListener('click',()=>$('photoDialog').showModal());$('closePhoto').addEventListener('click',()=>$('photoDialog').close());
  $('aboutButton').addEventListener('click',()=>$('aboutDialog').showModal());$('closeAbout').addEventListener('click',()=>$('aboutDialog').close());
  for(const id of ['aboutDialog','photoDialog'])$(id).addEventListener('click',e=>{if(e.target===$(id)){const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close();}});
  function filterPhotos(){all=(window.GARDEN_PHOTOS||[]).map(GardenReview.resolve);photos=all.filter(p=>p.dateReady&&!p.excluded&&(!$('licensedOnly').checked||p.openLicense)&&($('roundSet').value!=='map'||p.point));index=0;setPhoto();updateStats();}
  $('licensedOnly').addEventListener('change',filterPhotos);$('roundSet').addEventListener('change',filterPhotos);
  $('importGameReviews').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>2000000)throw Error('Review file is too large.');const count=GardenReview.import(JSON.parse(await f.text()));filterPhotos();$('gameImportStatus').textContent=`Imported ${count} reviews. Your confirmed dates and landmark pins are now used in the game.`;}catch(err){$('gameImportStatus').textContent='Import failed: '+err.message;}e.target.value='';});
  function updateStats(){
  const confirmed=all.filter(p=>p.dateReady&&!p.excluded),covered=new Set(confirmed.map(p=>p.month));
  $('auditStats').innerHTML=`<div><strong>${confirmed.length}</strong>playable photos</div><div><strong>${covered.size}/12</strong>months represented</div><div><strong>${new Set(confirmed.map(p=>p.location)).size}</strong>garden areas</div>`;
  $('auditText').textContent=`${all.filter(p=>p.openLicense).length} openly licensed photographs and ${all.filter(p=>!p.openLicense).length} official Garden photographs. ${confirmed.filter(p=>p.point).length} playable photos currently have landmark reference pins; more can be added in the review desk. ${all.filter(p=>p.excluded).length} photos are excluded by your reviews. These are sample counts, not the Garden’s entire archive.`;
  }
  updateStats();
  setPhoto();
  if(document.modelContext?.registerTool){const lifecycle=new AbortController();const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
    register({name:'submit_garden_guesses',description:'Submit a month, day and optional landmark pin, then reveal the round.',inputSchema:{type:'object',properties:{month:{type:'integer',minimum:1,maximum:12},day:{type:'integer',minimum:1,maximum:31},latitude:{type:'number'},longitude:{type:'number'}},required:['month','day'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(step!==0)throw Error('Start a new photograph first.');if(!input||!GardenReview.validDate(input.month,input.day))throw Error('Use a valid month and day.');const hasPin=input.latitude!==undefined||input.longitude!==undefined;const pin={lat:input.latitude,lon:input.longitude};if(hasPin&&!GardenReview.validPoint(pin))throw Error('Use a coordinate pair within the Garden map.');setGuess(dayOfYear(input.month,input.day));lockDate();if(hasPin){selectedPin=pin;guessMap.setPin(pin);}return reveal(!hasPin);}});
    register({name:'next_garden_photograph',description:'Start the next practice photograph, clearing the current guesses.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute(){next();return {photoNumber:index+1,photoCount:photos.length,hasMapReference:!!current()?.point};}});
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
