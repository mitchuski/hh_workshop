// graph_page.mjs — the shared graph-board template. One code path renders
// the live site's web AND any synthetic dataset (the demo cohort): pass a
// graph {nodes, edges} in the spellweb dialect, get a self-contained page.
// opts.banner: a ribbon (used by the demo to declare fictional data).
// opts.title: page title override.

export function graphPage(graph, opts = {}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>hh_workshop — the web</title>
<style>
:root { --bg:#0e1116; --panel:#161b22cc; --line:#2a3038; --ink:#d7dde6; --dim:#8b949e; --amber:#e0a526; --sapphire:#5b8def }
* { box-sizing:border-box }
body { margin:0; background:var(--bg); color:var(--ink); font:13.5px/1.5 ui-monospace,Consolas,monospace; overflow:hidden }
header { position:fixed; inset:0 0 auto 0; z-index:5; padding:10px 16px; border-bottom:1px solid var(--line); background:#0e1116e6; backdrop-filter:blur(4px); display:flex; gap:14px; align-items:baseline }
header h1 { margin:0; font-size:14px; font-weight:600 } header h1 em { color:var(--amber); font-style:normal }
header a { color:var(--sapphire); text-decoration:none; font-size:12px }
body.embed header { display:none }
#stage { position:fixed; inset:0; cursor:grab }
#stage.grabbing { cursor:grabbing }
svg { width:100%; height:100% }
.hud { position:fixed; z-index:6; background:var(--panel); border:1px solid var(--line); border-radius:10px; backdrop-filter:blur(6px) }
#bar { top:52px; left:14px; padding:10px 12px; display:flex; flex-direction:column; gap:8px; max-width:250px }
body.embed #bar { top:14px }
#bar .rowx { display:flex; gap:6px; align-items:center }
input#q { background:#0b0e12; border:1px solid var(--line); color:var(--ink); border-radius:6px; padding:6px 9px; font:inherit; width:150px }
input#q:focus { outline:none; border-color:var(--sapphire) }
button { background:#1f2733; border:1px solid var(--line); color:var(--ink); border-radius:6px; padding:6px 10px; font:inherit; cursor:pointer }
button:hover { border-color:var(--sapphire) }
#chips { display:flex; flex-wrap:wrap; gap:4px }
.chip { border:1px solid var(--line); border-radius:99px; padding:1px 9px; font-size:11.5px; color:var(--dim); cursor:pointer; user-select:none }
.chip.on { color:var(--ink); background:#1f2733 }
.chip .dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:5px; vertical-align:-1px }
#inspect { top:52px; right:14px; width:290px; max-height:calc(100vh - 80px); overflow:auto; padding:14px 16px; display:none }
body.embed #inspect { top:14px }
#inspect h3 { margin:0 0 6px; font-size:14px } #inspect h4 { color:var(--dim); margin:12px 0 4px; font-size:11.5px; letter-spacing:.05em }
#inspect .pill { display:inline-block; border:1px solid var(--line); border-radius:99px; padding:1px 8px; margin:2px 4px 2px 0; font-size:11px; color:var(--dim) }
#inspect p { margin:8px 0; color:var(--dim); font-size:12.5px }
#inspect .edge { font-size:12px; margin:3px 0; cursor:pointer } #inspect .edge:hover { color:var(--sapphire) }
#inspect .edge b { color:var(--amber); font-weight:400 }
#inspect .close { position:absolute; top:8px; right:10px; color:var(--dim); cursor:pointer; background:none; border:none; font-size:14px }
#hint { position:fixed; bottom:12px; left:50%; transform:translateX(-50%); color:var(--dim); font-size:11.5px; z-index:6; background:var(--panel); border:1px solid var(--line); border-radius:99px; padding:3px 14px }
text { pointer-events:none; user-select:none }
#banner { position:fixed; inset:auto 0 0 0; z-index:8; text-align:center; padding:6px 12px; background:#3a2b0a; color:#e0a526; font-size:12px; border-top:1px solid #5a4310 }
</style></head><body>
<header><h1>hh_workshop · <em>the web</em></h1><span style="color:var(--dim);font-size:12px">derived — re-run = re-true</span>
<span style="flex:1"></span><a href="index.html">home</a>&nbsp;&nbsp;<a href="claims.html">the register</a></header>
${opts.banner ? '<div id="banner">' + opts.banner + '</div>' : ''}<div id="stage"><svg id="web"></svg></div>
<div class="hud" id="bar">
  <div class="rowx"><input id="q" list="names" placeholder="find a node…"><button id="fit" title="fit to view">⌖ fit</button></div>
  <datalist id="names"></datalist>
  <div id="chips"></div>
</div>
<div class="hud" id="inspect"></div>
<div id="hint">click a node — its neighborhood lights · drag space to pan · wheel zooms at the cursor</div>
<script>
const BUILD = 'hh-graph v4 · tours + icons · ' + ${JSON.stringify(new Date().toISOString().slice(0, 16))}
console.log('%c' + BUILD, 'color:#e0a526')
const G = ${JSON.stringify({ nodes: graph.nodes, edges: graph.edges })}
const TOURS = ${JSON.stringify(graph.tours || [])}
// per-type glyphs — the spellweb theme grammar, workshop dialect
const ICON = { claim:'◆', triptych:'📖', form:'✍', law:'📜', role:'○', term:'·', player:'😊', run:'⚙', lever:'↗', fold:'🔑', corpus:'🌾', page:'📄', book:'📕', chronicle:'🗞', artefact:'✦' }
if (location.search.includes('embed')) document.body.classList.add('embed')
const COLOR = { claim:'#e0a526', triptych:'#c084fc', form:'#5b8def', law:'#4caf7d', role:'#7dd3c0', term:'#55606b', player:'#f472b6', run:'#94a3b8', lever:'#eab308', fold:'#fb923c', corpus:'#a3e635', page:'#38bdf8', book:'#f87171', chronicle:'#64748b', artefact:'#e8e3d5' }
const R = { claim:7, triptych:13, law:12, player:11, book:9, run:9, fold:9, form:9, page:7, corpus:8, chronicle:7, lever:7, role:7, term:4.5, artefact:11 }
const ALWAYS_LABEL = new Set(['triptych','law','player','book','fold','run','corpus','artefact'])
const DEFAULT_OFF = new Set(['term'])          // the laws' object nouns — detail on demand
const DIST = { carries:60, renders:55, bound_in:70, proposed_in:70, folds:60, binds:85, spooled_from:80, probed:80, composed_of:65, forged_by:75 }
const NS = 'http://www.w3.org/2000/svg'
const svg = document.getElementById('web'), stage = document.getElementById('stage')
// a hidden iframe measures 0×0 — never let the geometry see that (it
// collapses the fit scale to 0 and the zoom math divides by it)
let W = innerWidth || 960, H = innerHeight || 640
let hadRealSize = innerWidth > 0
const fx = (v) => Number.isFinite(v) ? v.toFixed(2) : '0'
const gRoot = document.createElementNS(NS,'g'); svg.appendChild(gRoot)
const gE = document.createElementNS(NS,'g'); const gN = document.createElementNS(NS,'g')
gRoot.appendChild(gE); gRoot.appendChild(gN)

const off = new Set(DEFAULT_OFF)
const nodes = G.nodes.map((n,i)=>({ ...n, x:W/2+(120+3.2*i)*Math.cos(i*2.399963), y:H/2+(120+2.1*i)*Math.sin(i*2.399963), vx:0, vy:0, r:R[n.type]||6 }))
const byId = Object.fromEntries(nodes.map(n=>[n.id,n]))
const links = G.edges.map(e=>({ ...e, s:byId[e.source], t:byId[e.target] })).filter(l=>l.s&&l.t)
const deg = {}; for (const l of links){ deg[l.s.id]=(deg[l.s.id]||0)+1; deg[l.t.id]=(deg[l.t.id]||0)+1 }
const vis = (n) => !off.has(n.type)
const lVis = (l) => vis(l.s) && vis(l.t)

// ---- DOM ----
const edgeEls = links.map(l=>{ const el=document.createElementNS(NS,'line'); el.setAttribute('stroke','#2a3038'); el.setAttribute('stroke-width','1'); gE.appendChild(el); return el })
const nodeEls = nodes.map(n=>{
  const gp=document.createElementNS(NS,'g'); gp.style.cursor='pointer'
  const c=document.createElementNS(NS,'circle'); c.setAttribute('r',n.r); c.setAttribute('fill',COLOR[n.type]||'#8b949e'); c.setAttribute('fill-opacity','.9')
  c.setAttribute('stroke', n.domain==='swordsman'?'#e0a526':n.domain==='mage'?'#5b8def':n.domain==='first_person'?'#4caf7d':'#2a3038'); c.setAttribute('stroke-width','1.5')
  const t=document.createElementNS(NS,'text'); t.textContent=n.label.length>26?n.label.slice(0,25)+'…':n.label
  t.setAttribute('font-size','10'); t.setAttribute('fill','#aeb6c2'); t.setAttribute('dx',n.r+4); t.setAttribute('dy','3.5')
  const tip=document.createElementNS(NS,'title'); tip.textContent = n.label + ' — ' + (n.desc||'')
  if (n.r >= 8 && ICON[n.type] && ICON[n.type] !== '·') {
    const ic=document.createElementNS(NS,'text'); ic.textContent=ICON[n.type]
    ic.setAttribute('font-size', String(Math.round(n.r*1.05))); ic.setAttribute('text-anchor','middle'); ic.setAttribute('dy','3.5')
    gp.appendChild(ic)
  }
  gp.appendChild(c); gp.insertBefore(c, gp.firstChild); gp.appendChild(t); gp.appendChild(tip); gN.appendChild(gp)
  gp.addEventListener('pointerdown',ev=>{ drag=n; dragMoved=false; ev.stopPropagation(); svg.setPointerCapture(ev.pointerId) })
  gp.addEventListener('click',ev=>{ if(!dragMoved){ if(conMode){ conToggle(n.id) } else select(n) } ev.stopPropagation() })
  n._c=c; n._t=t; n._g=gp
  return gp })

// ---- selection / labels / filters ----
let sel=null
let tourActive=null, tourStep=0, tourSet=new Set()
function labelPolicy(n){
  if (!vis(n)) return false
  if (sel){ if (n===sel) return true; if (nbr.has(n.id)) return true; return false }
  if (tourActive) return tourSet.has(n.id)
  return ALWAYS_LABEL.has(n.type) || (deg[n.id]||0) >= 6
}
let nbr = new Set()
function applyStyles(){
  for (const n of nodes){
    n._g.style.display = vis(n)?'':'none'
    n._t.style.display = labelPolicy(n)?'':'none'
    let dim = false
    if (sel) dim = n!==sel && !nbr.has(n.id)
    else if (tourActive) dim = !tourSet.has(n.id)
    n._g.style.opacity = dim? '0.14':'1'
    n._c.setAttribute('stroke-width', n===sel?'3':'1.5')
  }
  edgeEls.forEach((el,i)=>{ const l=links[i]
    el.style.display = lVis(l)?'':'none'
    const on = sel ? (l.s===sel || l.t===sel) : (tourActive && tourSet.has(l.s.id) && tourSet.has(l.t.id))
    el.setAttribute('stroke', on?'#5b8def':'#2a3038')
    el.setAttribute('stroke-width', on?'1.6':'1')
    el.style.opacity = (sel || tourActive) && !on ? '0.1':'1'
  })
}

// ---- tours: the spellweb preset pattern, derived --------------------------
function tourStart(t){
  tourActive = t; tourStep = 0
  tourSet = new Set(t.marks.map(m => m.nodeId))
  for (const m of t.marks){ const n = byId[m.nodeId]; if (n && off.has(n.type)) off.delete(n.type) }
  document.querySelectorAll('#chips .chip').forEach(c => c.classList.toggle('on', !off.has(c.dataset.t)))
  if (sel) select(sel)
  tourGo(0); applyStyles(); tourCard()
}
function tourExit(){ tourActive=null; tourSet=new Set(); applyStyles(); tourCard(); fitView() }
function tourGo(i){
  if (!tourActive) return
  tourStep = Math.max(0, Math.min(tourActive.marks.length-1, i))
  const n = byId[tourActive.marks[tourStep].nodeId]
  if (n){ centerOn(n) }
  tourCard()
}
function tourCard(){
  let card = document.getElementById('tourcard')
  if (!tourActive){ if (card) card.remove(); return }
  if (!card){ card = document.createElement('div'); card.className='hud'; card.id='tourcard'
    card.style.cssText='left:50%; transform:translateX(-50%); bottom:44px; width:min(560px, 92vw); padding:12px 16px'
    document.body.appendChild(card) }
  const m = tourActive.marks[tourStep]
  const n = byId[m.nodeId]
  card.innerHTML =
    '<div style="display:flex; gap:10px; align-items:baseline">'+
    '<b style="color:#e0a526">'+tourActive.emoji+' '+tourActive.name+'</b>'+
    '<span style="color:#8b949e; font-size:11.5px; flex:1">'+(tourStep+1)+' / '+tourActive.marks.length+'</span>'+
    '<button id="tprev">←</button><button id="tnext">→</button><button id="texit" title="the whole web">✕</button></div>'+
    '<div style="margin:8px 0 2px"><b style="color:'+(COLOR[n?.type]||'#8b949e')+'">'+(n?n.label:'')+'</b> — <span style="color:#aeb6c2">'+m.note+'</span></div>'+
    '<div style="color:#8b949e; font-size:11.5px; font-style:italic; margin-top:6px">'+tourActive.proverb+'</div>'
  card.querySelector('#tprev').onclick=()=>tourGo(tourStep-1)
  card.querySelector('#tnext').onclick=()=>tourGo(tourStep+1)
  card.querySelector('#texit').onclick=tourExit
}
function select(n){
  sel = n===sel? null : n
  nbr = new Set()
  if (sel) for (const l of links){ if(l.s===sel) nbr.add(l.t.id); if(l.t===sel) nbr.add(l.s.id) }
  applyStyles(); inspect()
}
function inspect(){
  const box = document.getElementById('inspect')
  if (!sel){ box.style.display='none'; return }
  const n = sel
  const inn = links.filter(l=>l.t===n&&lVis(l)), out = links.filter(l=>l.s===n&&lVis(l))
  box.innerHTML = '<button class="close">✕</button>' +
    '<h3 style="color:'+(COLOR[n.type]||'#8b949e')+'">'+n.label+'</h3>' +
    '<span class="pill">'+n.type+'</span><span class="pill">'+n.domain+'</span><span class="pill">'+(deg[n.id]||0)+' edges</span>' +
    '<p>'+(n.desc||'')+'</p>' +
    (n.kappa?'<p style="word-break:break-all;font-size:11px">κ '+n.kappa+'</p>':'') +
    (out.length?'<h4>OUTGOING</h4>'+out.map((l,i)=>'<div class="edge" data-id="'+l.t.id+'">—<b>'+l.type+'</b>→ '+l.t.label+'</div>').join(''):'') +
    (inn.length?'<h4>INCOMING</h4>'+inn.map(l=>'<div class="edge" data-id="'+l.s.id+'">'+l.s.label+' —<b>'+l.type+'</b>→</div>').join(''):'')
  box.style.display='block'
  box.querySelector('.close').onclick=()=>select(sel)
  box.querySelectorAll('.edge').forEach(el=>el.onclick=()=>{ const m=byId[el.dataset.id]; if(m){ select(m); centerOn(m) } })
}

// ---- chips + search ----
const chips = document.getElementById('chips')
const types = [...new Set(nodes.map(n=>n.type))].sort()
chips.innerHTML = types.map(t=>'<span class="chip'+(off.has(t)?'':' on')+'" data-t="'+t+'"><span class="dot" style="background:'+(COLOR[t]||'#8b949e')+'"></span>'+t+' '+nodes.filter(n=>n.type===t).length+'</span>').join('')
chips.onclick=(ev)=>{ const c=ev.target.closest('.chip'); if(!c) return
  const t=c.dataset.t; off.has(t)?off.delete(t):off.add(t); c.classList.toggle('on',!off.has(t))
  if (sel && !vis(sel)) select(sel)
  applyStyles(); warm() }
document.getElementById('names').innerHTML = nodes.map(n=>'<option value="'+n.label.replace(/"/g,'&quot;')+'">').join('')
document.getElementById('q').addEventListener('change',ev=>{
  const n = nodes.find(x=>x.label.toLowerCase()===ev.target.value.toLowerCase()) || nodes.find(x=>x.label.toLowerCase().includes(ev.target.value.toLowerCase()))
  if (n){ if(off.has(n.type)){ off.delete(n.type); chips.querySelector('[data-t="'+n.type+'"]').classList.add('on') } select(n); centerOn(n) }
})

// ---- physics (forces skip hidden nodes) ----
let alpha=1, drag=null, dragMoved=false, panning=null, view={x:0,y:0,k:1}
const warm=()=>{ alpha=Math.max(alpha,0.35) }
function step(){
  const act = nodes.filter(vis)
  for (let i=0;i<act.length;i++) for (let j=i+1;j<act.length;j++){
    const a=act[i], b=act[j]; let dx=b.x-a.x, dy=b.y-a.y; let d2=dx*dx+dy*dy||1
    const min=(a.r+b.r+10); if (d2<min*min){ d2=min*min }
    if (d2<52000){ const f=1400*alpha/d2; dx*=f; dy*=f; a.vx-=dx; a.vy-=dy; b.vx+=dx; b.vy+=dy } }
  for (const l of links){ if(!lVis(l)) continue
    const dx=l.t.x-l.s.x, dy=l.t.y-l.s.y; const d=Math.sqrt(dx*dx+dy*dy)||1
    const want=DIST[l.type]||85; const f=(d-want)/d*0.32*alpha
    l.s.vx+=dx*f; l.s.vy+=dy*f; l.t.vx-=dx*f; l.t.vy-=dy*f }
  for (const n of act){ n.vx+=(W/2-n.x)*0.004*alpha; n.vy+=(H/2-n.y)*0.004*alpha
    if(n!==drag){ n.x+=n.vx; n.y+=n.vy } n.vx*=0.58; n.vy*=0.58 }
}
let settled=false
function tick(){
  // a hidden iframe becoming visible is the resize the iframe never reports
  if (innerWidth > 0 && (innerWidth !== W || !hadRealSize)) { W=innerWidth; H=innerHeight; if(!hadRealSize){ hadRealSize=true; settled=false; warm() } }
  if (alpha>0.004){ alpha*=0.986; step(); if(!settled && alpha<=0.02){ settled=true; fitView() } }
  edgeEls.forEach((el,i)=>{ const l=links[i]; if(!lVis(l)) return
    el.setAttribute('x1',fx(l.s.x)); el.setAttribute('y1',fx(l.s.y)); el.setAttribute('x2',fx(l.t.x)); el.setAttribute('y2',fx(l.t.y)) })
  for (const n of nodes){ if(vis(n)) n._g.setAttribute('transform','translate('+fx(n.x)+','+fx(n.y)+')') }
  drawConstellation()
  gRoot.setAttribute('transform','translate('+fx(view.x)+','+fx(view.y)+') scale('+(Number.isFinite(view.k)&&view.k>0?view.k.toFixed(4):'1')+')')
  requestAnimationFrame(tick)
}
function fitView(){
  const act = nodes.filter(vis); if(!act.length) return
  const xs=act.map(n=>n.x), ys=act.map(n=>n.y)
  const x0=Math.min(...xs)-60, x1=Math.max(...xs)+140, y0=Math.min(...ys)-50, y1=Math.max(...ys)+50
  let k=Math.min(W/(x1-x0), H/(y1-y0), 1.6)
  if (!Number.isFinite(k) || k <= 0.02) k = 0.5   // degenerate geometry never poisons the view
  view.k=k; view.x=(W-(x0+x1)*k)/2; view.y=(H-(y0+y1)*k)/2
}
function centerOn(n){ view.x = W/2 - n.x*view.k; view.y = H/2 - n.y*view.k }
document.getElementById('fit').onclick=fitView
svg.addEventListener('pointermove',ev=>{
  if (drag){ dragMoved=true; drag.x=(ev.clientX-view.x)/view.k; drag.y=(ev.clientY-view.y)/view.k; warm() }
  else if (panning){ view.x+=ev.clientX-panning.x; view.y+=ev.clientY-panning.y; panning={x:ev.clientX,y:ev.clientY} } })
svg.addEventListener('pointerdown',ev=>{ panning={x:ev.clientX,y:ev.clientY}; stage.classList.add('grabbing') })
svg.addEventListener('pointerup',()=>{ drag=null; panning=null; stage.classList.remove('grabbing') })
svg.addEventListener('click',()=>{ if(sel && !dragMoved) select(sel) })
svg.addEventListener('wheel',ev=>{ ev.preventDefault()
  const k2=Math.min(3.2, Math.max(0.25, view.k*(ev.deltaY<0?1.13:0.885)))
  view.x = ev.clientX-(ev.clientX-view.x)*k2/view.k
  view.y = ev.clientY-(ev.clientY-view.y)*k2/view.k
  view.k = k2 },{passive:false})
addEventListener('resize',()=>{ if(innerWidth>0){ W=innerWidth; H=innerHeight } })

// ---- the constellation — track a path of nodes, forge it into an artefact --
// (spellweb's ceremony, workshop-grade: the selection is hashed canonically,
// signed with the bearer's roster key, and the artefact re-enters the graph
// on the next derivation as composed_of / forged_by edges.)
let conMode=false
const constellation=[]
const gC = document.createElementNS(NS,'g'); gRoot.insertBefore(gC, gN)
function drawConstellation(){
  gC.innerHTML=''
  const pts = constellation.map(id=>byId[id]).filter(n=>n&&vis(n))
  if (pts.length>1){
    const pl=document.createElementNS(NS,'polyline')
    pl.setAttribute('points', pts.map(n=>fx(n.x)+','+fx(n.y)).join(' '))
    pl.setAttribute('fill','none'); pl.setAttribute('stroke','#e0a526'); pl.setAttribute('stroke-width','1.6'); pl.setAttribute('stroke-dasharray','5 4'); pl.setAttribute('opacity','.8')
    gC.appendChild(pl)
  }
  pts.forEach((n,i)=>{
    const ring=document.createElementNS(NS,'circle')
    ring.setAttribute('cx',fx(n.x)); ring.setAttribute('cy',fx(n.y)); ring.setAttribute('r',n.r+6)
    ring.setAttribute('fill','none'); ring.setAttribute('stroke','#e0a526'); ring.setAttribute('stroke-width','1.6')
    gC.appendChild(ring)
    const num=document.createElementNS(NS,'text')
    num.setAttribute('x',fx(n.x-3)); num.setAttribute('y',fx(n.y-n.r-9)); num.setAttribute('font-size','9'); num.setAttribute('fill','#e0a526')
    num.textContent=String(i+1); gC.appendChild(num)
  })
}
function conToggle(id){
  const i=constellation.indexOf(id)
  if (i>=0) constellation.splice(i,1); else constellation.push(id)
  conTray()
}
function conTray(){
  const list=document.getElementById('con-list')
  if (!list) return
  list.innerHTML = constellation.length
    ? constellation.map((id,i)=>'<div class="con-item" data-id="'+id+'">'+(i+1)+' · '+(byId[id]?byId[id].label:id)+' ✕</div>').join('')
    : '<div style="color:#8b949e;font-size:11.5px">star nodes by clicking while ⭐ is on — order matters; the path is the meaning</div>'
  list.querySelectorAll('.con-item').forEach(el=>el.onclick=()=>conToggle(el.dataset.id))
  const fb=document.getElementById('con-forge'); if (fb) fb.disabled = constellation.length<2
}
// forging needs the Towel (a signer); on a static copy the tray hides itself
;(async()=>{
  try {
    const g = await (await fetch('/api/game/graph')).json()
    const tray=document.createElement('div')
    tray.className='hud'; tray.id='con-tray'
    tray.style.cssText='left:14px; bottom:40px; width:250px; padding:10px 12px'
    tray.innerHTML =
      '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">'+
      '<button id="con-mode">⭐ constellation</button><span id="con-n" style="color:#8b949e;font-size:11px"></span></div>'+
      '<div id="con-list" style="max-height:120px;overflow:auto;font-size:12px;line-height:1.7"></div>'+
      '<input id="con-name" placeholder="name the artefact…" style="width:100%;margin:6px 0 4px;background:#0b0e12;border:1px solid #2a3038;color:#d7dde6;border-radius:6px;padding:6px 8px;font:inherit">'+
      '<div style="display:flex;gap:6px"><select id="con-bearer" style="flex:1;background:#0b0e12;border:1px solid #2a3038;color:#d7dde6;border-radius:6px;padding:6px;font:inherit">'+
      g.nodes.map(n=>'<option value="'+n.slug+'">'+n.name+'</option>').join('')+
      '</select><button id="con-forge" disabled>forge</button></div>'+
      '<div id="con-out" style="color:#8b949e;font-size:11px;margin-top:6px;word-break:break-all"></div>'
    document.body.appendChild(tray)
    conTray()
    document.getElementById('con-mode').onclick=(e)=>{ conMode=!conMode; e.target.style.borderColor=conMode?'#e0a526':'#2a3038'; document.getElementById('con-n').textContent=conMode?'on — click nodes to star them':'' }
    document.getElementById('con-forge').onclick=async()=>{
      const out=document.getElementById('con-out')
      try {
        const r=await fetch('/api/constellation/forge',{method:'POST',headers:{'content-type':'application/json'},
          body:JSON.stringify({ bearer:document.getElementById('con-bearer').value, name:document.getElementById('con-name').value, nodeIds:constellation })})
        const j=await r.json()
        if(!r.ok) throw new Error(j.error||r.status)
        out.innerHTML='forged ✦ <b style="color:#e0a526">'+j.name+'</b><br>κ '+j.kappa.slice(0,30)+'…<br>signed by '+j.bearer+' — re-derive the web (the Towel) and the artefact takes its place in the graph'
        constellation.length=0; conTray()
      } catch(e){ out.textContent='REFUSED: '+e.message }
    }
  } catch { /* static copy — no signer, no tray */ }
})()

// ---- the tours UI: chips above the filters; first sight is a guided walk ----
if (TOURS.length){
  const tdiv = document.createElement('div')
  tdiv.innerHTML = '<div style="color:#8b949e; font-size:11px; letter-spacing:.05em; margin:2px 0 4px">THE TOURS — guided walks, derived</div>' +
    TOURS.map((t,i)=>'<span class="chip tour-chip" data-i="'+i+'">'+t.emoji+' '+t.name+'</span>').join('')
  chips.parentNode.insertBefore(tdiv, chips)
  tdiv.querySelectorAll('.tour-chip').forEach(el=>el.onclick=()=>tourStart(TOURS[+el.dataset.i]))
  // spellweb's known first-load weakness — the whole hairball at once — fixed
  // at the generative sibling: open ON a walk. ?tour=none opens the whole web.
  if (!location.search.includes('tour=none')) setTimeout(()=>tourStart(TOURS[0]), 500)
}

applyStyles(); tick()
</script></body></html>`
}
