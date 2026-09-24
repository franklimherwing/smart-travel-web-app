export default async function handler(req:any,res:any) {
  if (req.method !== 'POST') return res.status(405).end();
  const original = globalThis.fetch;
  // The Netlify handler uses Netlify.env; Vercel reads its own environment directly.
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).end('Translation unavailable');
  try {
    const {name,shortDescription,longDescription,facts} = req.body ?? {};
    if (typeof shortDescription !== 'string' || typeof longDescription !== 'string' || !Array.isArray(facts) || facts.length > 12 || longDescription.length > 5000) return res.status(400).end('Invalid place');
    const response = await original('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5-mini',input:[{role:'system',content:'Translate this travel place into natural Spanish. Preserve factual claims, uncertainty, names and numbers. Return only a JSON object with strings nameEs, shortDescriptionEs, longDescriptionEs and an array of strings factsEs. No markdown.'},{role:'user',content:JSON.stringify({name,shortDescription,longDescription,facts})}],max_output_tokens:1400})});
    if (!response.ok) return res.status(502).end('Translation unavailable');
    const data = await response.json();
    const raw = (data.output_text || data.output?.flatMap((x:any)=>x.content??[]).map((x:any)=>x.text??'').join('') || '').trim().replace(/^```(?:json)?\s*|\s*```$/g,'');
    const translated = JSON.parse(raw);
    if (typeof translated.shortDescriptionEs !== 'string' || typeof translated.longDescriptionEs !== 'string' || !Array.isArray(translated.factsEs) || translated.factsEs.length !== facts.length) return res.status(502).end('Invalid translation');
    return res.status(200).json(translated);
  } catch { return res.status(502).end('Translation unavailable'); }
}
