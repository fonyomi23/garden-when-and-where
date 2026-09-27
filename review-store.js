window.GardenReview = (() => {
  const KEY='garden-landmark-review-v1';
  const all=window.GARDEN_PHOTOS||[];let edits={};let storageOK=true;
  try{edits=JSON.parse(localStorage.getItem(KEY)||'{}');if(!edits||Array.isArray(edits)||typeof edits!=='object')edits={};}catch{storageOK=false;edits={};}
  const days=[31,28,31,30,31,30,31,31,30,31,30,31];
  const validDate=(m,d)=>Number.isInteger(m)&&Number.isInteger(d)&&m>=1&&m<=12&&d>=1&&d<=days[m-1];
  function validPoint(p){const b=window.GARDEN_MAP_DATA?.bounds;return !!(p&&b&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&p.lat>=b.south&&p.lat<=b.north&&p.lon>=b.west&&p.lon<=b.east);}
  function validate(id,v){if(!all.some(p=>p.id===id))throw Error('Unknown photo: '+id);if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid photo review.');
    const clean={excluded:v.excluded===true,dateApproved:v.dateApproved===true,pointApproved:v.pointApproved===true,note:String(v.note||'').slice(0,2000),location:String(v.location||'').slice(0,150),landmark:String(v.landmark||'').slice(0,150)};
    if(v.month!=null||v.day!=null){if(!validDate(v.month,v.day))throw Error('Use a valid month and day.');clean.month=v.month;clean.day=v.day;}
    if(v.point!=null){if(!validPoint(v.point))throw Error('The pin must be within the Garden map.');clean.point={lat:v.point.lat,lon:v.point.lon};}
    if(clean.pointApproved&&!clean.landmark)throw Error('Name the landmark before approving its pin.');
    if(clean.pointApproved&&!clean.point)throw Error('Place a pin before approving the landmark.');
    if(clean.dateApproved&&!validDate(clean.month,clean.day))throw Error('Set a date before approving it.');return clean;
  }
  const defaults={};
  for(const [id,v] of Object.entries(window.GARDEN_REVIEW_DEFAULTS?.reviews||{}))defaults[id]=validate(id,v);
  const get=id=>edits[id]||defaults[id]||{};
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(edits));storageOK=true;}catch{storageOK=false;}return storageOK;}
  return {get,get storageOK(){return storageOK;},save(id,v){edits[id]=validate(id,v);persist();return edits[id];},remove(id){delete edits[id];persist();},export(){return {schema:'garden-landmark-review-v1',exportedAt:new Date().toISOString(),reviews:JSON.parse(JSON.stringify({...defaults,...edits}))};},import(data){if(data?.schema!=='garden-landmark-review-v1'||!data.reviews||typeof data.reviews!=='object'||Array.isArray(data.reviews))throw Error('This is not a Garden photo review file.');const incoming={};for(const [id,v] of Object.entries(data.reviews))incoming[id]=validate(id,v);edits={...edits,...incoming};persist();return Object.keys(incoming).length;},resolve(p){const e=get(p.id);return {...p,month:e.dateApproved?e.month:p.month,day:e.dateApproved?e.day:p.day,confidence:e.dateApproved?'reviewed':p.confidence,location:e.location||p.location,landmark:e.landmark||p.landmark,pinPrompt:e.pointApproved?'Drop a pin on the main landmark shown.':p.pinPrompt,dateReady:e.dateApproved||p.dateReady!==false,excluded:e.excluded===true,point:e.pointApproved?{...e.point,name:e.landmark,status:'reviewed',basis:'Landmark confirmed in your saved review.'}:p.point||null,review:e};},validDate,validPoint};
})();
