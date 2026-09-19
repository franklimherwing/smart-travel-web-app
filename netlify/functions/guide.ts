function extractText(data: any) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const chunks: string[] = [];
  for (const item of data?.output ?? []) {
    for (const part of item?.content ?? []) {
      if (typeof part?.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
}

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = Netlify.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return new Response('OPENAI_API_KEY is not configured.', { status: 503 });

  try {
    const { message, context = {} } = await req.json();
    const question = String(message ?? '').trim();
    if (!question) return new Response('A question is required.', { status: 400 });

    const prompt = [
      'You are Smart AI Travel, a warm, curious, concise local walking-tour guide.',
      'Answer like a knowledgeable local friend, never like a textbook.',
      'Give useful historical and cultural context. If uncertain, say so rather than inventing facts.',
      'Keep most answers under 180 words unless the traveler asks for more.',
      'You can build personalized walking-tour suggestions from the traveler’s time, interests, budget, family needs, and current coordinates.',
      'When asked about local life or food, favor authentic everyday experiences and clearly distinguish known facts from suggestions.',
      'Adapt explanations for children when requested, and answer in the traveler’s requested language.',
      `Destination: ${context.destination ?? 'unknown'}`,
      context.poiName ? `Current place: ${context.poiName}` : '',
      context.poiSummary ? `Known place summary: ${context.poiSummary}` : '',
      context.latitude && context.longitude ? `Current coordinates: ${context.latitude}, ${context.longitude}` : '',
      `Traveler question: ${question}`
    ].filter(Boolean).join('\n');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'gpt-5-mini', input: prompt, max_output_tokens: 500 }),
    });

    if (!response.ok) return new Response(await response.text(), { status: response.status });

    const data = await response.json();
    return Response.json({ text: extractText(data) });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'AI guide failed.', { status: 500 });
  }
};
