export interface GuideContext {
  destination: string;
  poiName?: string;
  poiSummary?: string;
  latitude?: number;
  longitude?: number;
}

export async function askGuide(message: string, context: GuideContext): Promise<string> {
  const response = await fetch('/api/guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    throw new Error(await response.text() || 'The AI guide is unavailable.');
  }

  const data = await response.json();
  return data.text || 'I could not generate a response.';
}
