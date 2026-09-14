const VOICE_INSTRUCTIONS = [
  'You are an enthusiastic, knowledgeable local walking-tour guide.',
  'Sound warm, spontaneous, conversational, curious, and genuinely excited.',
  'Use lively human pacing, natural pauses, emphasis, and varied intonation.',
  'Never sound like a GPS, announcer, audiobook, robot, or customer-service agent.',
  'Speak at normal friendly conversation speed, just slightly brisk.',
  'Smile in the voice around surprising facts and keep the delivery relaxed.'
].join(' ');

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  if (!apiKey) return new Response('OPENAI_API_KEY is not configured.', { status: 503 });

  try {
    const { text } = await req.json();
    const narration = String(text ?? '').trim();
    if (!narration) return new Response('Narration text is required.', { status: 400 });

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: 'marin',
        input: narration.slice(0, 4000),
        instructions: VOICE_INSTRUCTIONS,
        response_format: 'mp3',
        speed: 1.05,
      }),
    });

    if (!response.ok) return new Response(await response.text(), { status: response.status });

    return new Response(await response.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Voice generation failed.', { status: 500 });
  }
};
