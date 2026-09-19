let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

export function stopNaturalNarration() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
}

export async function playNaturalNarration(text: string, onEnd: () => void, voice = localStorage.getItem('smarttravel-voice') || 'natural') {
  stopNaturalNarration();

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) {
    throw new Error(await response.text() || 'Natural voice is unavailable.');
  }

  const blob = await response.blob();
  currentUrl = URL.createObjectURL(blob);
  currentAudio = new Audio(currentUrl);
  currentAudio.playbackRate = 1;
  currentAudio.onended = () => {
    stopNaturalNarration();
    onEnd();
  };
  currentAudio.onerror = () => {
    stopNaturalNarration();
    onEnd();
  };
  await currentAudio.play();
}
