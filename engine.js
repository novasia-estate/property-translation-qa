/* Local bilingual release checks. No network, automatic approval or translation. */
(function(root){
  'use strict';
  function number(s){
    s=s.replace(/[\s\u00a0\u202f]/g,'');
    if(/^\d{1,3}([,.]\d{3})+$/.test(s))s=s.replace(/[,.]/g,'');
    else if(s.includes(',')&&s.includes('.')){const last=Math.max(s.lastIndexOf(','),s.lastIndexOf('.'));s=s.slice(0,last).replace(/[,.]/g,'')+'.'+s.slice(last+1);}
    else s=s.replace(',','.');
    const value=Number(s);return Number.isFinite(value)?String(value):s;
  }
  function unique(values){return [...new Set(values)].sort();}
  function inspect(text,language){
    const t=String(text||'').normalize('NFKC');
    const numericText=t.replace(/[мm]2(?![a-zа-я0-9])/gi,' sqm ');
    const nums=unique([...numericText.matchAll(/\d+(?:[\s\u00a0\u202f.,]\d+)*/g)].map(m=>number(m[0])));
    const currency=unique([...t.matchAll(/\b(?:USD|THB|IDR|KHR|EUR)\b|[$฿€]/gi)].map(m=>({'$':'USD','฿':'THB','€':'EUR'}[m[0]]||m[0].toUpperCase())));
    const area=unique([...t.matchAll(/(\d+(?:[\s.,]\d+)*)\s*(?:м2|m2|sq\.?\s*m|sqm)(?![a-zа-я])/gi)].map(m=>number(m[1])));
    const from=language==='ru'?/(?:^|\s)(?:от|начиная\s+с)\s*(?:USD|THB|IDR|KHR|EUR|[$€฿])?\s*\d/i.test(t):/\b(?:from|starting\s+(?:at|from))\s*(?:USD|THB|IDR|KHR|EUR|[$€฿])?\s*\d/i.test(t);
    const statuses=language==='ru'?{sold:/продан[аоы]?/i,reserved:/забронирован/i,available:/в\s+продаже|доступн[аоы]?\b/i}:{sold:/\bsold\b/i,reserved:/\breserved\b/i,available:/\bavailable\b|\bfor sale\b/i};
    return {numbers:nums,currencies:currency,areas:area,from,statuses:Object.keys(statuses).filter(k=>statuses[k].test(t))};
  }
  function check(record){
    const a=inspect(record.ru,'ru'),b=inspect(record.en,'en'),issues=[];
    if(!String(record.ru||'').trim()||!String(record.en||'').trim())issues.push({code:'empty_language',message:'One language is empty.'});
    for(const [field,code] of [['numbers','numeric_mismatch'],['currencies','currency_mismatch'],['areas','area_mismatch']]){
      if(JSON.stringify(a[field])!==JSON.stringify(b[field]))issues.push({code,message:field+': RU '+a[field].join(', ')+' / EN '+b[field].join(', ')});
    }
    if(a.from!==b.from)issues.push({code:'price_qualifier_mismatch',message:'A from/starting-price qualifier differs.'});
    if(a.statuses.length&&b.statuses.length&&JSON.stringify(a.statuses)!==JSON.stringify(b.statuses))issues.push({code:'status_mismatch',message:'Recognised availability statuses differ.'});
    return {issues,ru:a,en:b};
  }
  function snapshot(record){return JSON.stringify({id:record.id,ru:record.ru,en:record.en});}
  function approvalCurrent(record){return !!record.approval&&record.approval.snapshot===snapshot(record);}
  function validate(data){
    if(!data||data.schema_version!==1||!Array.isArray(data.records))throw Error('Expected schema_version:1 and records array.');
    if(data.records.length>2000)throw Error('At most 2000 records per local review.');
    const ids=new Set();
    for(const r of data.records){
      if(!r||typeof r.id!=='string'||!r.id.trim()||ids.has(r.id))throw Error('Each record needs a unique nonempty string id.');
      if(typeof r.ru!=='string'||typeof r.en!=='string')throw Error('ru and en must be strings.');
      if(r.ru.length>50000||r.en.length>50000)throw Error('A language text exceeds 50000 characters.');
      ids.add(r.id);
    }
    return data;
  }
  const api={inspect,check,snapshot,approvalCurrent,validate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TranslationQA=api;
})(typeof window==='undefined'?{}:window);
