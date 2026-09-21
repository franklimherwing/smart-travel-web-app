let speechToken = 0;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentProgress = 0;

export function stopNaturalNarration() {
  speechToken += 1;
  currentUtterance = null;
  currentProgress = 0;
  window.speechSynthesis?.cancel();
}

function chooseBrowserVoice(language:string) {
  const voices = window.speechSynthesis?.getVoices() || [];
  if (language === 'es') return voices.find(v => /^es-(MX|US)/i.test(v.lang)) || voices.find(v => /^es-ES/i.test(v.lang)) || voices.find(v => v.lang.toLowerCase().startsWith('es'));
  return voices.find(v => /Samantha|Google US English|Microsoft Aria|Karen|Daniel/i.test(v.name)) || voices.find(v => v.lang.toLowerCase().startsWith('en'));
}

export function getNarrationProgress() { return currentProgress; }

export function speakInstantNarration(text:string,onEnd:()=>void,language=localStorage.getItem('smarttravel-language')||'en',startProgress=0) {
  speechToken += 1;
  const token = speechToken;
  window.speechSynthesis?.cancel();
  if (!('speechSynthesis' in window)) { onEnd(); return; }

  const safeProgress = Math.max(0, Math.min(.96, startProgress));
  const startIndex = Math.floor(text.length * safeProgress);
  const remaining = text.slice(startIndex).replace(/^\S*\s*/, '');
  const spokenText = remaining || text;
  const utterance = new SpeechSynthesisUtterance(spokenText);
  currentUtterance = utterance;
  currentProgress = safeProgress;
  utterance.lang = language === 'es' ? 'es-MX' : 'en-US';
  utterance.rate = language === 'es' ? 0.98 : 1.04;
  const preferred = chooseBrowserVoice(language);
  if (preferred) utterance.voice = preferred;
  utterance.onboundary = event => {
    if (token !== speechToken) return;
    const local = Math.max(0, event.charIndex || 0);
    currentProgress = Math.min(1, safeProgress + (local / Math.max(1, spokenText.length)) * (1 - safeProgress));
  };
  utterance.onend = () => {
    if (token !== speechToken) return;
    currentUtterance = null;
    currentProgress = 1;
    onEnd();
  };
  utterance.onerror = () => {
    if (token !== speechToken) return;
    currentUtterance = null;
    onEnd();
  };
  window.speechSynthesis.speak(utterance);
}