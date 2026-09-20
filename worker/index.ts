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

async function tts(req: Request, env: Env) {
  if (!env.OPENAI_API_KEY) return new Response('OPENAI_API_KEY is not configured.', { status: 503 });
  const { text, voice='natural' } = await req.json() as any;
  if (!String(text ?? '').trim()) return new Response('Text is required.', {status:400});
  const voices:Record<string,string>={natural:'marin',warm:'cedar',bright:'coral'};
  const selected = voice === 'my-voice' && env.OPENAI_CUSTOM_VOICE_ID ? {id:env.OPENAI_CUSTOM_VOICE_ID} : (voices[voice] || voices.natural);
  const response=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice:selected,input:String(text),instructions:'Speak like a warm, relaxed local guide at a natural conversational pace.',response_format:'mp3'})});
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
