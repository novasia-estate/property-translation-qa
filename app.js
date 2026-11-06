/* Plain scripts also work when index.html is opened directly from disk. */
'use strict';
const qa=window.TranslationQA;
let data={schema_version:1,records:[]},selected=null;
const $=id=>document.getElementById(id);
const demo={schema_version:1,records:[
  {id:'SYNTHETIC-A12',ru:'От 120 000 USD. Площадь 42 м². В продаже.',en:'USD 120,000. Area 42 sqm. For sale.'},
  {id:'SYNTHETIC-B04',ru:'Цена 145 000 USD. Площадь 65 м². Забронировано.',en:'Price USD 154,000. Area 65 sqm. Available.'},
  {id:'SYNTHETIC-C08',ru:'От 200 000 USD. Площадь 80 м². В продаже.',en:'From USD 200,000. Area 80 sqm. For sale.'}
]};
function message(text){$('message').textContent=text;}
function load(value){data=qa.validate(value);selected=data.records[0]?.id;message('Loaded '+data.records.length+' records. Export regularly; closing the tab discards unsaved changes.');renderQueue();renderEditor();}
function visible(r){const f=$('filter').value;return f==='all'||f==='issues'&&qa.check(r).issues.length>0||f==='pending'&&!qa.approvalCurrent(r)||f==='approved'&&qa.approvalCurrent(r);}
function renderQueue(){
  $('queue').replaceChildren();const pending=data.records.filter(r=>!qa.approvalCurrent(r)).length;
  $('counts').textContent=`${data.records.length} records · ${pending} awaiting review`;
  for(const r of data.records.filter(visible)){
    const button=document.createElement('button');button.className='queue-item'+(r.id===selected?' selected':'');button.textContent=r.id;
    const badge=document.createElement('span');badge.className='badge';badge.textContent=qa.check(r).issues.length+' detected differences · '+(qa.approvalCurrent(r)?'review current':'review pending');button.append(badge);
    button.addEventListener('click',()=>{selected=r.id;renderQueue();renderEditor();});$('queue').append(button);
  }
}
function renderFindings(r){
  const box=$('findings');box.replaceChildren();const {issues}=qa.check(r);
  if(!issues.length){const p=document.createElement('p');p.className='ok';p.textContent='No configured differences detected. Human review is still required.';box.append(p);}
  for(const issue of issues){const p=document.createElement('p');p.className='issue';p.textContent=issue.code+': '+issue.message;box.append(p);}
  $('review-state').textContent=qa.approvalCurrent(r)?'Reviewed by '+r.approval.reviewer+' at '+r.approval.at:(r.approval?'Text changed since the recorded review. Review again.':'No human review recorded.');
  $('review-state').className=qa.approvalCurrent(r)?'':'stale';
}
function renderEditor(){
  const r=data.records.find(r=>r.id===selected);$('editor').replaceChildren();if(!r)return;
  const h=document.createElement('h2');h.textContent=r.id;$('editor').append(h);
  const pair=document.createElement('div');pair.className='language-pair';
  for(const [key,title] of [['ru','Русский'],['en','English']]){
    const label=document.createElement('label');label.textContent=title;const text=document.createElement('textarea');text.value=r[key];text.lang=key;text.setAttribute('aria-label',title);
    text.addEventListener('input',()=>{r[key]=text.value;renderFindings(r);renderQueue();});label.append(text);pair.append(label);
  }
  $('editor').append(pair);const findings=document.createElement('div');findings.id='findings';$('editor').append(findings);
  const review=document.createElement('div');review.className='review';
  const input=document.createElement('input');input.id='reviewer';input.placeholder='Reviewer name';input.setAttribute('aria-label','Reviewer name');
  const button=document.createElement('button');button.textContent='Record human review';button.addEventListener('click',()=>{
    if(!input.value.trim()){message('Enter the actual reviewer name.');return;}
    r.approval={reviewer:input.value.trim(),at:new Date().toISOString(),snapshot:qa.snapshot(r)};renderFindings(r);renderQueue();message('Review recorded for this exact text pair. Remaining differences stay visible.');
  });const state=document.createElement('p');state.id='review-state';review.append(input,button,state);$('editor').append(review);renderFindings(r);
}
$('demo').addEventListener('click',()=>load(JSON.parse(JSON.stringify(demo))));
$('filter').addEventListener('change',renderQueue);
$('file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;if(file.size>5_000_000){message('File exceeds 5 MB.');return;}
  try{load(JSON.parse(await file.text()));}catch(error){message(error.message);}e.target.value='';
});
$('export').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download='translation-review.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Export created. Store it with your source texts.');
});
