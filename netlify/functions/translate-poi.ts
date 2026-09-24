function extractText(data: any): string {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  return (data?.output ?? []).flatMap((item: any) => item?.content ?? []).map((part: any) => part?.text ?? '').join('').trim();
}

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', {status: 405});
  const key = Netlify.env.get('OPENAI_API_KEY');
  if (!key) return new Response('Translation unavailable', {status: 503});
  try {
    const {name, shortDescription, longDescription, facts} = await req.json();
    if (typeof shortDescription !== 'string' || typeof longDescription !== 'string' || !Array.isArray(facts) || facts.length > 12 || longDescription.length > 5000) return new Response('Invalid place', {status: 400});
    const response = await fetch('https://api.openai.com/v1/responses', {method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5-mini',input:[{role:'system',content:'Translate the supplied travel place content into natural Spanish. Preserve all factual claims, uncertainty, names and numbers. Return only a JSON object with strings nameEs, shortDescriptionEs, longDescriptionEs and an array of strings factsEs. No markdown.'},{role:'user',content:JSON.stringify({name,shortDescription,longDescription,facts})}],max_output_tokens:1400})});
    if (!response.ok) return new Response('Translation unavailable', {status:502});
    const raw = extractText(await response.json()).replace(/^```(?:json)?\s*|\s*```$/g,'');
    const translated = JSON.parse(raw);
    if (typeof translated.shortDescriptionEs !== 'string' || typeof translated.longDescriptionEs !== 'string' || !Array.isArray(translated.factsEs) || translated.factsEs.length !== facts.length || !translated.factsEs.every((fact: unknown) => typeof fact === 'string')) return new Response('Invalid translation', {status:502});
    return Response.json(translated);
  } catch { return new Response('Translation unavailable', {status:502}); }
};
