interface Env { OPENAI_API_KEY?: string; OPENAI_CUSTOM_VOICE_ID?: string; ASSETS: { fetch(request: Request): Promise<Response> }; }

function extractText(data: any) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const chunks: string[] = [];
  for (const item of data?.output ?? []) for (const part of item?.content ?? []) if (typeof part?.text === 'string') chunks.push(part.text);
  return chunks.join('\n').trim();
}

async function guide(req: Request, env: Env) {
  if (!env.OPENAI_API_KEY) return new Response('OPENAI_API_KEY is not configured.', { status: 503 });
  const { message, context = {} } = await req.json() as any;
  const question = String(message ?? '').trim();
  if (!question) return new Response('A question is required.', { status: 400 });
  const prompt = [
    'You are Smart AI Travel, a warm, concise local walking-tour guide.',
    'Answer like a knowledgeable local friend. Never invent uncertain facts.',
    'Keep most answers under 180 words unless asked for more.',
    'For local life or food, favor authentic everyday experiences and distinguish facts from suggestions.',
    'When relevant, enrich answers with history, culture, demographics, statistics, economy/GDP context, everyday life, food, traditions, and memorable facts. Clearly distinguish city, department, and national statistics and state the year of statistics.',
    'Include light, family-friendly local humor or a short joke when the traveler asks for jokes; never present invented folklore or jokes as historical fact.',
    `Destination: ${context.destination ?? 'unknown'}`,
    context.poiName ? `Current place: ${context.poiName}` : '',
    context.poiSummary ? `Known place summary: ${context.poiSummary}` : '',
    context.latitude != null && context.longitude != null ? `Current coordinates: ${context.latitude}, ${context.longitude}` : '',
    `Traveler question: ${question}`
  ].filter(Boolean).join('\n');
  const response = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'}, body:JSON.stringify({model:'gpt-5-mini',input:prompt,max_output_tokens:800}) });
  if (!response.ok) return new Response(await response.text(), {status:response.status});
  const data:any = await response.json();
  const text = extractText(data);
  return text ? Response.json({text}) : new Response('OpenAI returned an empty answer.', {status:502});
}

async function translateNarration(text:string, language:string, env:Env) {
  if (language !== 'es') return text;
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5-mini',input:`Translate the following travel-guide narration completely into natural Latin American Spanish. Keep proper place names unchanged. Output Spanish only. Do not include English, notes, labels, or quotation marks.\n\n${text}`,max_output_tokens:1200})});
  if(!response.ok) throw new Error(await response.text());
  const data:any=await response.json();
  return extractText(data) || text;
}

async function tts(req: Request, env: Env) {
  if (!env.OPENAI_API_KEY) return new Response('OPENAI_API_KEY is not configured.', { status: 503 });
  const { text, voice='natural', language='en' } = await req.json() as any;
  if (!String(text ?? '').trim()) return new Response('Text is required.', {status:400});
  const voices:Record<string,string>={natural:'marin',warm:'cedar',bright:'coral',spanish:'marin'};
  const selected = voice === 'my-voice' && env.OPENAI_CUSTOM_VOICE_ID ? {id:env.OPENAI_CUSTOM_VOICE_ID} : (voices[voice] || voices.natural);
  const spokenText = await translateNarration(String(text), language, env);
  const response=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice:selected,input:spokenText,instructions: language === 'es' ? 'Habla únicamente en español latinoamericano claro, cálido y natural, como un guía local amigable. No uses palabras ni frases en inglés excepto nombres propios que oficialmente estén en inglés. Empieza a hablar de inmediato.' : 'Speak only in clear, warm, natural English like a friendly local guide. Do not switch into Spanish. Begin speaking immediately.',response_format:'mp3'})});
  if(!response.ok) return new Response(await response.text(),{status:response.status});
  return new Response(response.body,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store'}});
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url=new URL(request.url);
    try {
      if (url.pathname==='/api/guide') return request.method==='POST' ? guide(request,env) : new Response('Method not allowed',{status:405});
      if (url.pathname==='/api/tts') return request.method==='POST' ? tts(request,env) : new Response('Method not allowed',{status:405});
      return env.ASSETS.fetch(request);
    } catch (error) {
      return new Response(error instanceof Error ? error.message : 'Worker error',{status:500});
    }
  }
};
