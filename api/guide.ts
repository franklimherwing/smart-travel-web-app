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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.statusCode = 503;
    res.end('OPENAI_API_KEY is not configured.');
    return;
  }

  try {
    const message = String(req.body?.message ?? '').trim();
    const context = req.body?.context ?? {};
    if (!message) {
      res.statusCode = 400;
      res.end('A question is required.');
      return;
    }

    const prompt = [
      'You are Smart AI Travel, a warm, curious, concise local walking-tour guide.',
      'Answer like a knowledgeable local friend, not a textbook.',
      'Prefer short paragraphs and useful historical or cultural details.',
      'If you are uncertain, say so. Do not invent facts.',
      'Keep most answers under 180 words unless the user asks for more.',
      `Destination: ${context.destination ?? 'unknown'}`,
      context.poiName ? `Current place: ${context.poiName}` : '',
      context.poiSummary ? `Known place summary: ${context.poiSummary}` : '',
      context.latitude && context.longitude ? `Current coordinates: ${context.latitude}, ${context.longitude}` : '',
      `Traveler question: ${message}`
    ].filter(Boolean).join('\n');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: prompt,
      }),
    });

    if (!response.ok) {
      res.statusCode = response.status;
      res.end(await response.text());
      return;
    }

    const data = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ text: extractText(data) }));
  } catch (error) {
    res.statusCode = 500;
    res.end(error instanceof Error ? error.message : 'AI guide failed.');
  }
}
