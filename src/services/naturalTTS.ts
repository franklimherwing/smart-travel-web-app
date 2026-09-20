let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
const audioCache = new Map<string, Blob>();
const pendingCache = new Map<string, Promise<Blob>>();

function cacheKey(text:string, voice:string, language:string){ return `${language}|${voice}|${text}`; }

async function fetchNarration(text:string, voice:string, language:string) {
  const key=cacheKey(text,voice,language);
  const cached=audioCache.get(key);
  if(cached) return cached;
  const pending=pendingCache.get(key);
  if(pending) return pending;
  const request=fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice,language})})
    .then(async response=>{ if(!response.ok) throw new Error(await response.text() || 'Natural voice is unavailable.'); return response.blob(); })
    .then(blob=>{ audioCache.set(key,blob); pendingCache.delete(key); return blob; })
    .catch(error=>{ pendingCache.delete(key); throw error; });
  pendingCache.set(key,request);
  return request;
}

export function stopNaturalNarration() {
  if(currentAudio){ currentAudio.onended=null; currentAudio.onerror=null; currentAudio.pause(); currentAudio.currentTime=0; currentAudio=null; }
  if(currentUrl){ URL.revokeObjectURL(currentUrl); currentUrl=null; }
}

export async function preloadNaturalNarration(text:string, voice=localStorage.getItem('smarttravel-voice')||'natural', language=localStorage.getItem('smarttravel-language')||'en'){
  await fetchNarration(text,voice,language);
}

export async function playNaturalNarration(text:string,onEnd:()=>void,voice=localStorage.getItem('smarttravel-voice')||'natural',language=localStorage.getItem('smarttravel-language')||'en'){
  stopNaturalNarration();
  const blob=await fetchNarration(text,voice,language);
  stopNaturalNarration();
  currentUrl=URL.createObjectURL(blob);
  const audio=new Audio(currentUrl);
  currentAudio=audio;
  audio.playbackRate=1;
  audio.onended=()=>{ if(currentAudio!==audio)return; stopNaturalNarration(); onEnd(); };
  audio.onerror=()=>{ if(currentAudio!==audio)return; stopNaturalNarration(); onEnd(); };
  await audio.play();
}