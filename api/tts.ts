const VOICE_INSTRUCTIONS = [
  'You are an enthusiastic, knowledgeable local walking-tour guide.',
  'Sound warm, spontaneous, conversational, curious, and genuinely excited to share the place.',
  'Use lively human pacing with subtle pauses, emphasis, and varied intonation.',
  'Do not sound like an announcer, audiobook narrator, GPS, robot, or customer-service agent.',
  'Speak slightly faster than an average museum audio guide, around normal friendly conversation speed.',
  'Smile in the voice when introducing a surprising or delightful fact.',
  'Keep proper names clear and never over-dramatize.'
].join(' ');

async function createSpeech(text: string, apiKey: string) {
  return fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: 'marin',
      input: text,
      instructions: VOICE_INSTRUCTIONS,
      response_format: 'mp3',
      speed: 1.05,
    }),
  });
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
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text) {
      res.statusCode = 400;
      res.end('Narration text is required.');
      return;
    }

    const speech = await createSpeech(text.slice(0, 4000), apiKey);
    if (!speech.ok) {
      res.statusCode = speech.status;
      res.end(await speech.text());
      return;
    }

    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.statusCode = 200;
    res.end(buffer);
  } catch (error) {
    res.statusCode = 500;
    res.end(error instanceof Error ? error.message : 'Voice generation failed.');
  }
}
