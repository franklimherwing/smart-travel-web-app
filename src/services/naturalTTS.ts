let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let speechToken = 0;

export function stopNaturalNarration() {
  speechToken += 1;
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
  window.speechSynthesis?.cancel();
}

function chooseBrowserVoice(language:string) {
  const voices = window.speechSynthesis?.getVoices() || [];
  if (language === 'es') return voices.find(v => /^es-(GT|MX|US|419)/i.test(v.lang)) || voices.find(v => v.lang.toLowerCase().startsWith('es'));
  return voices.find(v => /Samantha|Google US English|Microsoft Aria|Karen|Daniel/i.test(v.name)) || voices.find(v => v.lang.toLowerCase().startsWith('en'));
}

export function speakInstantNarration(text:string,onEnd:()=>void,language=localStorage.getItem('smarttravel-language')||'en') {
  stopNaturalNarration();
  const token = speechToken;
  if (!('speechSynthesis' in window)) { onEnd(); return; }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'es' ? 'es-GT' : 'en-US';
  utterance.rate = 1.04;
  const preferred = chooseBrowserVoice(language);
  if (preferred) utterance.voice = preferred;
  utterance.onend = () => { if (token === speechToken) onEnd(); };
  utterance.onerror = () => { if (token === speechToken) onEnd(); };
  window.speechSynthesis.speak(utterance);
}

export async function playNaturalNarration(text:string,onEnd:()=>void,voice=localStorage.getItem('smarttravel-voice')||'natural',language=localStorage.getItem('smarttravel-language')||'en'){
  stopNaturalNarration();
  const token = speechToken;
  const response = await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice,language})});
  if (!response.ok) throw new Error(await response.text() || 'Natural voice is unavailable.');
  const blob = await response.blob();
  if (token !== speechToken) return;
  currentUrl=URL.createObjectURL(blob);
  const audio=new Audio(currentUrl);
  currentAudio=audio;
  audio.onended=()=>{ if(currentAudio!==audio || token!==speechToken)return; currentAudio=null; if(currentUrl){URL.revokeObjectURL(currentUrl);currentUrl=null;} onEnd(); };
  audio.onerror=()=>{ if(currentAudio!==audio || token!==speechToken)return; currentAudio=null; if(currentUrl){URL.revokeObjectURL(currentUrl);currentUrl=null;} onEnd(); };
  await audio.play();
}