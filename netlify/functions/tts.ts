const VOICE_INSTRUCTIONS = [
  'You are a friendly local guide speaking to one traveler beside you.',
  'Sound natural, warm, relaxed, conversational, and genuinely interested.',
  'Use normal human speaking speed with short natural pauses and varied intonation.',
  'Avoid announcer, audiobook, GPS, sales, customer-service, or overly theatrical delivery.',
  'Do not over-enunciate. Let sentences flow like ordinary conversation.',
  'Use subtle excitement for surprising facts and a calm tone for history.'
].join(' ');

const BUILT_IN_VOICES: Record<string,string> = {
  natural: 'marin',
  warm: 'cedar',
  bright: 'coral',
};

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  if (!apiKey) return new Response('OPENAI_API_KEY is not configured.', { status: 503 });

  try {
    const { text, voice = 'natural' } = await req.json();
    const narration = String(text ?? '').trim();
    if (!narration) return new Response('Narration text is required.', { status: 400 });

    const customVoiceId = Netlify.env.get('OPENAI_CUSTOM_VOICE_ID');
    const selectedVoice = voice === 'my-voice' && customVoiceId
      ? { id: customVoiceId }
      : (BUILT_IN_VOICES[voice] || BUILT_IN_VOICES.natural);

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: selectedVoice,
        input: narration.slice(0, 4000),
        instructions: VOICE_INSTRUCTIONS,
        response_format: 'mp3',
        speed: 1.0,
      }),
    });
    if (!response.ok) return new Response(await response.text(), { status: response.status });
    return new Response(await response.arrayBuffer(), { status: 200, headers: { 'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=3600' } });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Voice generation failed.', { status: 500 });
  }
};
