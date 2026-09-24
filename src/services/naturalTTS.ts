let speechToken = 0;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentProgress = 0;
let narrationActive = false;
let narrationPaused = false;
let narrationLoading = false;

function announce() {
  window.dispatchEvent(new CustomEvent('smarttravel-speech-state',{detail:{active:narrationActive,paused:narrationPaused,loading:narrationLoading}}));
}

export function stopNaturalNarration() {
  speechToken += 1;
  currentUtterance = null;
  currentProgress = 0;
  narrationActive = false;
  narrationPaused = false;
  narrationLoading = false;
  window.speechSynthesis?.cancel();
  announce();
}

export function pauseNaturalNarration() {
  if (!('speechSynthesis' in window) || !narrationActive) return;
  window.speechSynthesis.pause();
  narrationPaused = true;
  announce();
}

export function resumeNaturalNarration() {
  if (!('speechSynthesis' in window) || !narrationActive) return;
  window.speechSynthesis.resume();
  narrationPaused = false;
  announce();
}

function chooseBrowserVoice(language:string) {
  const voices = window.speechSynthesis?.getVoices() || [];
  if (language === 'es') {
    const spanish = voices.filter(v => /^es([_-]|$)/i.test(v.lang));
    return spanish.find(v => /Paulina/i.test(v.name))
      || spanish.find(v => /^es[_-]MX$/i.test(v.lang))
      || spanish.find(v => /^es[_-]US$/i.test(v.lang))
      || spanish.find(v => /^es[_-](GT|419)$/i.test(v.lang))
      || spanish.find(v => /^es[_-]/i.test(v.lang))
      || null;
  }
  return voices.find(v => /Samantha|Google US English|Microsoft Aria|Karen|Daniel/i.test(v.name))
    || voices.find(v => v.lang.toLowerCase().startsWith('en'))
    || null;
}

export function getNarrationProgress() { return currentProgress; }

export function speakInstantNarration(text:string,onEnd:()=>void,language=localStorage.getItem('smarttravel-language')||'en',startProgress=0,onError?:()=>void) {
  speechToken += 1;
  const token = speechToken;
  window.speechSynthesis?.cancel();
  if (!('speechSynthesis' in window)) { announce(); onError?.(); onEnd(); return; }

  const safeProgress = Math.max(0, Math.min(.96, startProgress));
  const startIndex = Math.floor(text.length * safeProgress);
  const remaining = text.slice(startIndex).replace(/^\S*\s*/, '');
  const spokenText = remaining || text;
  const utterance = new SpeechSynthesisUtterance(spokenText);
  currentUtterance = utterance;
  currentProgress = safeProgress;
  narrationActive = true;
  narrationPaused = false;
  narrationLoading = true;
  utterance.lang = language === 'es' ? 'es-MX' : 'en-US';
  utterance.rate = language === 'es' ? 0.9 : 1.04;
  utterance.pitch = 1;
  const preferred = chooseBrowserVoice(language);
  if (preferred) {
    utterance.voice = preferred;
    utterance.lang = preferred.lang || utterance.lang;
  }
  announce();
  const startupTimeout = window.setTimeout(() => { if (token !== speechToken || !narrationLoading) return; stopNaturalNarration(); onError?.(); onEnd(); }, 7000);
  utterance.onstart = () => { if (token !== speechToken) return; clearTimeout(startupTimeout); narrationLoading = false; announce(); };
  utterance.onboundary = event => {
    if (token !== speechToken) return;
    const local = Math.max(0, event.charIndex || 0);
    currentProgress = Math.min(1, safeProgress + (local / Math.max(1, spokenText.length)) * (1 - safeProgress));
  };
  utterance.onend = () => {
    if (token !== speechToken) return;
    clearTimeout(startupTimeout);
    currentUtterance = null;
    currentProgress = 1;
    narrationActive = false;
    narrationPaused = false;
    narrationLoading = false;
    announce();
    onEnd();
  };
  utterance.onerror = () => {
    if (token !== speechToken) return;
    clearTimeout(startupTimeout);
    currentUtterance = null;
    narrationActive = false;
    narrationPaused = false;
    narrationLoading = false;
    announce();
    onError?.();
    onEnd();
  };
  try { window.speechSynthesis.speak(utterance); } catch { clearTimeout(startupTimeout); stopNaturalNarration(); onError?.(); onEnd(); }
}
