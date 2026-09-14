import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

async function readJson(req: any) {
  return await new Promise<any>((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => body += chunk.toString());
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
}

function extractResponseText(data: any) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const chunks: string[] = [];
  for (const item of data?.output ?? []) {
    for (const part of item?.content ?? []) {
      if (typeof part?.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'smart-travel-local-api',
        configureServer(server) {
          server.middlewares.use('/api/tts', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405; res.end('Method not allowed'); return;
            }
            if (!env.OPENAI_API_KEY) {
              res.statusCode = 503; res.end('OPENAI_API_KEY is not configured.'); return;
            }

            try {
              const { text } = await readJson(req);
              const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${env.OPENAI_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini-tts',
                  voice: 'marin',
                  input: String(text ?? '').slice(0, 4000),
                  instructions: [
                    'You are an enthusiastic, knowledgeable local walking-tour guide.',
                    'Sound warm, spontaneous, conversational, curious, and genuinely excited.',
                    'Use lively human pacing, natural pauses, emphasis, and varied intonation.',
                    'Never sound like a GPS, announcer, audiobook, robot, or customer-service agent.',
                    'Speak at normal friendly conversation speed, just slightly brisk.',
                    'Smile in the voice around surprising facts and keep the delivery relaxed.'
                  ].join(' '),
                  response_format: 'mp3',
                  speed: 1.05,
                }),
              });

              if (!response.ok) {
                res.statusCode = response.status;
                res.end(await response.text());
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'audio/mpeg');
              res.end(Buffer.from(await response.arrayBuffer()));
            } catch (error) {
              res.statusCode = 500;
              res.end(error instanceof Error ? error.message : 'Voice generation failed.');
            }
          });

          server.middlewares.use('/api/guide', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405; res.end('Method not allowed'); return;
            }
            if (!env.OPENAI_API_KEY) {
              res.statusCode = 503; res.end('OPENAI_API_KEY is not configured.'); return;
            }

            try {
              const { message, context = {} } = await readJson(req);
              const prompt = [
                'You are Smart AI Travel, a warm, curious, concise local walking-tour guide.',
                'Answer like a knowledgeable local friend, never like a textbook.',
                'Give useful historical and cultural context. If uncertain, say so rather than inventing facts.',
                'Keep most answers under 180 words unless the traveler asks for more.',
                `Destination: ${context.destination ?? 'unknown'}`,
                context.poiName ? `Current place: ${context.poiName}` : '',
                context.poiSummary ? `Known place summary: ${context.poiSummary}` : '',
                context.latitude && context.longitude ? `Current coordinates: ${context.latitude}, ${context.longitude}` : '',
                `Traveler question: ${String(message ?? '')}`
              ].filter(Boolean).join('\n');

              const response = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${env.OPENAI_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ model: 'gpt-5-mini', input: prompt }),
              });

              if (!response.ok) {
                res.statusCode = response.status;
                res.end(await response.text());
                return;
              }

              const data = await response.json();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: extractResponseText(data) }));
            } catch (error) {
              res.statusCode = 500;
              res.end(error instanceof Error ? error.message : 'AI guide failed.');
            }
          });
        },
      },
    ],
  };
});
