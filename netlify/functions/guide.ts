function extractText(data: any) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const chunks: string[] = [];
  for (const item of data?.output ?? []) for (const part of item?.content ?? []) {
    if (typeof part?.text === 'string') chunks.push(part.text);
  }
  return chunks.join('\n').trim();
}

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  if (!apiKey) return new Response('AI setup error: OPENAI_API_KEY is missing in Netlify.', { status: 503 });

  try {
    const { message, context = {} } = await req.json();
    const question = String(message ?? '').trim();
    if (!question) return new Response('A question is required.', { status: 400 });

    const prompt = [
      'You are Smart AI Travel, a warm, concise local walking-tour guide.',
      'Answer like a knowledgeable local friend. Never invent uncertain facts.',
      'Keep most answers under 180 words unless asked for more.',
      'You can suggest personalized walking tours using time, interests, budget, family needs, and current coordinates.',
      'For local life or food, favor authentic everyday experiences and distinguish facts from suggestions.',
      'Adapt for children and answer in the traveler’s requested language.',
      `Destination: ${context.destination ?? 'unknown'}`,
      context.poiName ? `Current place: ${context.poiName}` : '',
      context.poiSummary ? `Known place summary: ${context.poiSummary}` : '',
      context.latitude != null && context.longitude != null ? `Current coordinates: ${context.latitude}, ${context.longitude}` : '',
      `Traveler question: ${question}`
    ].filter(Boolean).join('\n');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5-mini', input: prompt, max_output_tokens: 800 }),
    });

    if (!response.ok) {
      let detail = await response.text();
      try { detail = JSON.parse(detail)?.error?.message || detail; } catch {}
      return new Response(`OpenAI API error (${response.status}): ${detail}`, { status: response.status });
    }

    const data = await response.json();
    const text = extractText(data);
    if (!text) return new Response('OpenAI returned an empty answer. Please try again.', { status: 502 });
    return Response.json({ text });
  } catch (error) {
    return new Response(`AI guide error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
};
