/**
 * Base88 App Studio: a deterministic, client-only working prototype.
 * This is intentionally not presented as an AI coding engine or hosted database.
 * Templates are fixed and all user text is HTML-escaped before interpolation.
 */
export type StudioKind = 'tasks' | 'clients' | 'bookings'
type Field = { key:string; label:string; input?:'text'|'date'|'select'; options?:string[]; required?:boolean }
const TEMPLATES: Record<StudioKind,{label:string; fields:Field[]; empty:string}> = {
  tasks:{label:'Task tracker',empty:'No tasks yet. Create your first task.',fields:[
    {key:'title',label:'Task',required:true},
    {key:'owner',label:'Assigned to'},
    {key:'status',label:'Status',input:'select',options:['To do','In progress','Done']},
  ]},
  clients:{label:'Customer tracker',empty:'No customers yet. Add your first customer.',fields:[
    {key:'name',label:'Customer name',required:true},
    {key:'contact',label:'Contact information'},
    {key:'stage',label:'Pipeline stage',input:'select',options:['New','Contacted','Won','Closed']},
  ]},
  bookings:{label:'Booking tracker',empty:'No bookings yet. Add your first booking.',fields:[
    {key:'customer',label:'Customer',required:true},
    {key:'date',label:'Appointment date',input:'date',required:true},
    {key:'service',label:'Service'},
  ]},
}
function escapeHtml(value:string):string {
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}
export function suggestStudioKind(goal:string):StudioKind {
  const q=goal.toLowerCase()
  if(/book|appoint|reserv|schedul|salon|session/.test(q))return 'bookings'
  if(/crm|client|customer|lead|sales|contact/.test(q))return 'clients'
  return 'tasks'
}
export function buildStudioDocument(input:{name:string;goal:string;kind:StudioKind}):string {
  const name=input.name.trim().slice(0,80)
  const goal=input.goal.trim().slice(0,1200)
  if(name.length<2||goal.length<8||!Object.hasOwn(TEMPLATES,input.kind))
    throw new Error('Enter an app name, a clear goal and a supported starter type.')
  const schema=JSON.stringify(TEMPLATES[input.kind])
  const safeName=escapeHtml(name)
  const safeGoal=escapeHtml(goal)
  const safeKind=escapeHtml(TEMPLATES[input.kind].label)
  const slug=name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'').slice(0,35)||'workspace'
  const storageKey=JSON.stringify('base88-studio-'+input.kind+'-'+slug)
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/><title>${safeName} — Base88 local prototype</title>
<style>
:root{font:15px/1.5 system-ui,-apple-system,sans-serif;color-scheme:dark;background:#080d19;color:#e9edf8}
*{box-sizing:border-box}body{margin:0}header{padding:30px max(22px,calc((100% - 1030px)/2));border-bottom:1px solid #273049}
main{max-width:1030px;margin:auto;padding:38px 22px}h1{font-size:clamp(30px,5vw,46px);margin:8px 0;letter-spacing:-1px}
p{color:#aebbd0}.tag{display:inline-block;padding:5px 12px;border-radius:99px;background:#20284c;color:#bdb4ff;font-size:12px;font-weight:700}
.grid{display:grid;grid-template-columns:minmax(260px,360px) 1fr;gap:20px;align-items:start}
.panel{border:1px solid #26314c;border-radius:20px;background:#10182a;padding:24px}
label{font-weight:650;display:block;margin:15px 0 7px;font-size:13px;color:#c7d3e8}
input,select{display:block;width:100%;border:1px solid #3b4965;border-radius:10px;background:#0a1120;color:#f3f6ff;padding:12px;font:inherit}
button{border:0;border-radius:10px;background:#7967f2;color:white;padding:11px 16px;font:inherit;font-weight:750;cursor:pointer}
button:hover{background:#927dfc}.secondary{background:#24324b}.secondary:hover{background:#384964}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
.item{padding:14px;border:1px solid #29364c;border-radius:12px;margin-top:10px;background:#111e30;display:flex;justify-content:space-between;gap:12px;align-items:center}
.item strong{font-size:15px;overflow-wrap:anywhere}.item small{display:block;color:#a6b7ca;overflow-wrap:anywhere}
.danger{background:#453041;font-size:12px;padding:7px 10px}.danger:hover{background:#674259}
.note{font-size:12px;color:#aab8cd;margin:15px 0}.count{font-variant-numeric:tabular-nums}
@media(max-width:690px){.grid{grid-template-columns:1fr}header{padding:24px}main{padding:26px 16px}}
</style></head><body>
<header><span class="tag">Base88 Studio · functional local prototype</span><h1>${safeName}</h1>
<p>${safeGoal}</p></header><main><p class="tag">${safeKind}</p>
<p class="note">This prototype saves to this browser when storage is available. It has no shared database, login, payments or hosting.</p>
<div class="grid"><section class="panel"><h2>Add a record</h2><form id="recordForm"></form>
<p id="saveNote" class="note" role="status" aria-live="polite"></p></section>
<section class="panel"><h2>Records <span id="count" class="count">0</span></h2><div id="records"></div>
<div class="actions"><button id="exportButton" class="secondary" type="button">Export JSON backup</button></div></section></div>
</main><script>
(function(){
'use strict';
const schema=${schema};
const storageKey=${storageKey};
const form=document.getElementById('recordForm');
const records=document.getElementById('records');
const count=document.getElementById('count');
const saveNote=document.getElementById('saveNote');
let items=[];
try {
  const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
  if(Array.isArray(saved)) items=saved.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)).slice(0,500);
} catch { saveNote.textContent='This preview cannot access browser storage; data will last only until it closes.'; }
function make(tag,text,cls){
  const el=document.createElement(tag);
  if(typeof text==='string')el.textContent=text;
  if(cls)el.className=cls;
  return el;
}
function save(){
  try { localStorage.setItem(storageKey,JSON.stringify(items)); saveNote.textContent='Saved in this browser.'; }
  catch { saveNote.textContent='Local storage is unavailable in this preview. Export a JSON backup instead.'; }
}
for(const field of schema.fields){
  const label=make('label',field.label);
  label.htmlFor='f_'+field.key;
  const input=document.createElement(field.input==='select'?'select':'input');
  input.id='f_'+field.key;
  input.name=field.key;
  input.required=Boolean(field.required);
  if(input.tagName==='SELECT'){
    for(const choice of field.options||[]){
      const option=make('option',choice); option.value=choice; input.append(option);
    }
  } else {input.type=field.input==='date'?'date':'text'; input.maxLength=140;}
  form.append(label,input);
}
const add=make('button','Add '+schema.label.replace(' tracker',''));add.type='submit';add.className='actions';
form.append(add);
function render(){
  records.replaceChildren();
  count.textContent=String(items.length);
  if(!items.length){records.append(make('p',schema.empty));return}
  for(const item of items){
    const row=make('article',undefined,'item');
    const info=make('div');
    const primary=schema.fields.find(f=>f.required)||schema.fields[0];
    info.append(make('strong',String(item[primary.key]||'Untitled')));
    for(const field of schema.fields){
      if(field.key===primary.key)continue;
      info.append(make('small',field.label+': '+String(item[field.key]||'—')));
    }
    const remove=make('button','Delete','danger');remove.type='button';
    remove.addEventListener('click',()=>{
      items=items.filter(x=>x.id!==item.id);save();render();
    });
    row.append(info,remove);records.append(row);
  }
}
form.addEventListener('submit',(event)=>{
  event.preventDefault();
  if(!form.reportValidity()||items.length>=500)return;
  const item={id:String(Date.now())+'-'+Math.random().toString(36).slice(2)};
  for(const field of schema.fields){
    const input=form.elements.namedItem(field.key);
    if(!input)return;
    item[field.key]=String(input.value).trim().slice(0,140);
    if(field.required&&!item[field.key])return;
  }
  items.unshift(item);save();render();form.reset();
});
document.getElementById('exportButton').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(items,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='base88-local-records.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
render();
})();
</script></body></html>`
}