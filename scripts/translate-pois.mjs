// One-time, idempotent POI translation helper.
// Usage: OPENAI_API_KEY=... node scripts/translate-pois.mjs
// It fills only missing *Es fields in TypeScript POI data files. Existing Spanish is never overwritten.
import fs from 'node:fs/promises';
const files=['src/data/rome-pois.ts','src/data/guatemala-pois.ts','src/data/zacapa-extra-pois.ts','src/data/expansion-pois.ts'];
const key=process.env.OPENAI_API_KEY;
if(!key) throw new Error('OPENAI_API_KEY is required');
async function translate(payload){
 for(let attempt=1;attempt<=3;attempt++){
  const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5-mini',input:[{role:'system',content:'Translate travel content into complete natural Spanish, preserving factual claims and numbers. Use established Spanish place names when they exist (for example Coliseo, Foro Romano, Fontana de Trevi, Plaza de San Pedro). Never truncate. Return only JSON with nameEs, shortDescriptionEs, longDescriptionEs, factsEs.'},{role:'user',content:JSON.stringify(payload)}],max_output_tokens:2200})});
  if(!res.ok) continue; const data=await res.json(); const raw=(data.output_text||data.output?.flatMap(x=>x.content??[]).map(x=>x.text??'').join('')||'').trim().replace(/^```(?:json)?\s*|\s*```$/g,'');
  try{const x=JSON.parse(raw);if(x.nameEs?.trim()&&x.shortDescriptionEs?.trim()&&x.longDescriptionEs?.trim()&&Array.isArray(x.factsEs)&&x.factsEs.length===payload.facts.length&&!/[,:;—-]\s*$/.test(x.longDescriptionEs))return x}catch{}
 }
 throw new Error('Translation was incomplete after retries');
}
function q(s){return JSON.stringify(s)}
for(const file of files){
 let src=await fs.readFile(file,'utf8'); const blocks=[...src.matchAll(/\{\s*id:\s*['"][^'"]+['"][\s\S]*?sources:\s*\[[\s\S]*?\]\s*\}/g)];
 for(const match of blocks){
  const block=match[0]; if(/shortDescriptionEs\s*:/.test(block)&&/longDescriptionEs\s*:/.test(block)&&/factsEs\s*:/.test(block))continue;
  const name=block.match(/name:\s*(['"])(.*?)\1/)?.[2], shortDescription=block.match(/shortDescription:\s*(['"])([\s\S]*?)\1\s*,/)?.[2], longDescription=block.match(/longDescription:\s*(['"])([\s\S]*?)\1\s*,/)?.[2];
  const factsRaw=block.match(/facts:\s*\[([\s\S]*?)\]\s*,/)?.[1]; if(!name||!shortDescription||!longDescription||factsRaw==null)continue;
  const facts=[...factsRaw.matchAll(/(['"])(.*?)\1/g)].map(x=>x[2]); const es=await translate({name,shortDescription,longDescription,facts});
  const insert=`\n    nameEs:${q(es.nameEs)},\n    shortDescriptionEs:${q(es.shortDescriptionEs)},\n    longDescriptionEs:${q(es.longDescriptionEs)},\n    factsEs:${JSON.stringify(es.factsEs)},`;
  src=src.replace(block,block.replace(/(facts:\s*\[[\s\S]*?\]\s*,)/,`$1${insert}`)); await fs.writeFile(file,src); console.log(file,name);
 }
}
console.log('Translation fill complete. Re-run to verify idempotence.');
