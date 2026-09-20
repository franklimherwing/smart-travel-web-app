import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TravelMap } from './components/map/TravelMap';
import { POIBottomSheet } from './components/poi/POIBottomSheet';
import { GuideChat } from './components/ai/GuideChat';
import { TourOverview } from './components/tour/TourOverview';
import { SearchPanel } from './components/search/SearchPanel';
import { ExplorePanel } from './components/explore/ExplorePanel';
import { CameraGuide } from './components/camera/CameraGuide';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyPOI } from './hooks/useNearbyPOI';
import { romePOIs } from './data/rome-pois';
import { guatemalaCityPOIs, zacapaPOIs } from './data/guatemala-pois';
import { zacapaExtraPOIs } from './data/zacapa-extra-pois';
import { playNaturalNarration } from './services/naturalTTS';
import type { POI } from './types/poi';

type Demo = 'rome' | 'guatemala' | 'zacapa';

function narrationText(poi: POI, language = localStorage.getItem('smarttravel-language') || 'en') {
  if (language === 'es') return `Bienvenido a ${poi.name}. ${poi.shortDescription} ${poi.longDescription} Datos rápidos: ${poi.facts.join('. ')}.`;
  return `Welcome to ${poi.name}! ${poi.shortDescription} Here's what makes this place special. ${poi.longDescription} A few quick things to notice: ${poi.facts.join('. ')}. Enjoy exploring!`;
}

function browserFallback(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.08;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /Samantha|Google US English|Microsoft Aria|Karen|Daniel/i.test(v.name)) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

export default function App() {
  const { position, error } = useGeolocation();
  const allPOIs = useMemo(() => [...romePOIs, ...guatemalaCityPOIs, ...zacapaPOIs, ...zacapaExtraPOIs], []);
  const nearbyPOI = useNearbyPOI(position, allPOIs);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [demo, setDemo] = useState<Demo>('rome');
  const [demoFocusKey, setDemoFocusKey] = useState(0);
  const [dismissedNearbyId, setDismissedNearbyId] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('smarttravel-language') || 'en');
  const [voice, setVoice] = useState(() => localStorage.getItem('smarttravel-voice') || 'natural');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [autoNarratedId, setAutoNarratedId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTour, setActiveTour] = useState<POI[]>([]);
  const [tourIndex, setTourIndex] = useState(-1);
  const [savedIds, setSavedIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('smarttravel-saved') || '[]'); } catch { return []; } });

  useEffect(() => { localStorage.setItem('smarttravel-saved', JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => { localStorage.setItem('smarttravel-voice', voice); }, [voice]);
  useEffect(() => { localStorage.setItem('smarttravel-language', language); }, [language]);
  useEffect(() => {
    if (!position) return;
    const destinations:[Demo,number,number][] = [['rome',41.8986,12.4769],['guatemala',14.6418,-90.5137],['zacapa',14.985,-89.55]];
    const nearest = destinations.map(([id,lat,lng]) => ({id,d:Math.hypot(position.lat-lat, position.lng-lng)})).sort((a,b)=>a.d-b.d)[0];
    if (nearest && nearest.d < .65) setDemo(nearest.id);
  }, [position]);

  const activePOIs = demo === 'guatemala' ? guatemalaCityPOIs : demo === 'zacapa' ? [...zacapaPOIs, ...zacapaExtraPOIs] : romePOIs;
  const destinationName = demo === 'guatemala' ? 'Guatemala City' : demo === 'zacapa' ? 'Zacapa, Guatemala' : 'Rome, Italy';
  const nextPOI = selectedPOI ? activePOIs.filter(p => p.id !== selectedPOI.id).map(p => ({ poi:p, distance:Math.hypot(p.lat-selectedPOI.lat,p.lng-selectedPOI.lng) })).sort((a,b)=>a.distance-b.distance)[0]?.poi ?? null : null;

  const tourStops = useMemo(() => {
    if (!activePOIs.length) return [];
    const start = selectedPOI && activePOIs.some(p => p.id === selectedPOI.id) ? selectedPOI : activePOIs[0];
    const remaining = activePOIs.filter(p => p.id !== start.id);
    const ordered = [start];
    while (remaining.length && ordered.length < 4) {
      const last = ordered[ordered.length - 1];
      remaining.sort((a,b) => Math.hypot(a.lat-last.lat,a.lng-last.lng) - Math.hypot(b.lat-last.lat,b.lng-last.lng));
      ordered.push(remaining.shift()!);
    }
    return ordered;
  }, [activePOIs, selectedPOI]);

  const startTour = () => {
    if (!tourStops.length) return;
    setShowTour(false);
    setActiveTour(tourStops);
    setTourIndex(0);
    setSelectedPOI(tourStops[0]);
    setAudioMode(true);
  };
  const advanceTour = () => {
    if (tourIndex < 0 || !activeTour.length) return;
    const next = tourIndex + 1;
    if (next >= activeTour.length) { setTourIndex(-1); setActiveTour([]); return; }
    setTourIndex(next);
    setSelectedPOI(activeTour[next]);
  };

  const showNearby = nearbyPOI && !selectedPOI && dismissedNearbyId !== nearbyPOI.id;
  useEffect(() => { if (nearbyPOI?.id !== dismissedNearbyId && navigator.vibrate) navigator.vibrate(80); }, [nearbyPOI, dismissedNearbyId]);
  useEffect(() => {
    if (tourIndex < 0 || !activeTour[tourIndex]) return;
    const stop = activeTour[tourIndex];
    const text = narrationText(stop, language);
    const narrationVoice = language === 'es' ? 'spanish' : (voice === 'spanish' ? 'natural' : voice);
    playNaturalNarration(text, advanceTour, narrationVoice, language).catch(() => browserFallback(text));
  }, [tourIndex, activeTour]);

  useEffect(() => {
    if (!audioMode || !nearbyPOI || autoNarratedId === nearbyPOI.id) return;
    setAutoNarratedId(nearbyPOI.id);
    playNaturalNarration(narrationText(nearbyPOI, language), () => undefined, language === 'es' ? 'spanish' : (voice === 'spanish' ? 'natural' : voice), language).catch(() => browserFallback(narrationText(nearbyPOI, language)));
  }, [audioMode, nearbyPOI, autoNarratedId]);

  const openDemo = (nextDemo: Demo) => {
    setDemo(nextDemo); setSelectedPOI(null); setShowChat(false); setShowTour(false); setShowSearch(false); setShowExplore(false); setShowCamera(false); setDemoFocusKey(k => k + 1);
  };

  return <main className="app-shell">
    <TravelMap position={position} onSelectPOI={setSelectedPOI} demo={demo} demoFocusKey={demoFocusKey} focusedPOI={selectedPOI} />
    <header className="top-bar" aria-label="Map tools">
      <button className="icon-button search-button" aria-label="Search" onClick={()=>setShowSearch(v=>!v)}>⌕</button><button className="icon-button" aria-label="Camera guide" onClick={()=>setShowCamera(true)}>📷</button>
      <div className="location-pill"><span className="eyebrow">EXPLORING</span><strong>{destinationName}</strong></div>
    </header>
    <div className="walk-pill"><span>🚶</span><span>{position ? `GPS ±${Math.round(position.accuracy)}m` : 'Demo mode'}</span></div>
    <nav className="demo-switcher" aria-label="Demo destinations">
      <button className={demo==='rome'?'active':''} onClick={()=>openDemo('rome')}>🏛️ Rome</button>
      <button className={demo==='guatemala'?'active':''} onClick={()=>openDemo('guatemala')}>🇬🇹 Guatemala City</button>
      <button className={demo==='zacapa'?'active':''} onClick={()=>openDemo('zacapa')}>🌄 Zacapa</button>
    </nav>
    <div className="language-switcher" aria-label="Guide language"><button className={language==='en'?'active':''} onClick={()=>setLanguage('en')}>English</button><button className={language==='es'?'active':''} onClick={()=>setLanguage('es')}>Español</button></div>
    <aside className="map-controls">
      <button className={`round-button ${audioMode?'active-control':''}`} aria-label="Audio mode" onClick={()=>setAudioMode(v=>!v)}>🎧</button><button className="round-button" aria-label="Choose voice" onClick={()=>setShowVoiceMenu(v=>!v)}>🗣️</button>
    </aside>
    {showVoiceMenu && <div className="voice-menu"><strong>Guide voice</strong><button onClick={()=>{setVoice('natural');setShowVoiceMenu(false)}} className={voice==='natural'?'selected':''}>English · Natural Guide</button><button onClick={()=>{setVoice('warm');setShowVoiceMenu(false)}} className={voice==='warm'?'selected':''}>English · Warm Guide</button><button onClick={()=>{setVoice('bright');setShowVoiceMenu(false)}} className={voice==='bright'?'selected':''}>English · Bright Guide</button><button onClick={()=>{setVoice('spanish');setShowVoiceMenu(false)}} className={voice==='spanish'?'selected':''}>Español · Guía Latina</button><button onClick={()=>{setVoice('my-voice');setShowVoiceMenu(false)}} className={voice==='my-voice'?'selected':''}>My Voice*</button><small>*Uses your custom voice when OPENAI_CUSTOM_VOICE_ID is configured.</small></div>}
    {error && <div className="gps-note">Location unavailable — demo maps still work.</div>}
    <AnimatePresence>{showSearch && <SearchPanel pois={activePOIs} query={searchQuery} onQuery={setSearchQuery} onClose={()=>setShowSearch(false)} onSelect={poi=>{setSelectedPOI(poi);setShowSearch(false);}} />}</AnimatePresence>
    <AnimatePresence>{showNearby && <motion.section className="nearby-alert" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:18}}><button className="nearby-dismiss" onClick={()=>setDismissedNearbyId(nearbyPOI.id)}>×</button><span className="nearby-icon">{nearbyPOI.emoji}</span><div><small>YOU'RE NEARBY</small><strong>{nearbyPOI.name}</strong><p>{audioMode?'Audio mode will narrate this stop.':'Want to hear the story?'}</p></div><button className="nearby-open" onClick={()=>setSelectedPOI(nearbyPOI)}>Open</button></motion.section>}</AnimatePresence>
    {!selectedPOI && !showNearby && !showChat && !showTour && !showExplore && !showCamera && <section className="ai-dock"><button className="ai-bar" onClick={()=>setShowChat(true)}><span className="agent-orb">✦</span><span><small>YOUR LOCAL GUIDE</small><strong>{position ? 'Ask what’s around me' : 'Ask about this area'}</strong></span><span className="mic">🎙️</span></button><div className="suggestions"><button onClick={()=>setShowExplore(true)}>📍 Explore</button><button onClick={()=>setShowTour(true)}>30-min tour</button><button onClick={()=>setShowCamera(true)}>📷 Camera AI</button><button onClick={()=>setShowChat(true)}>Tell me a story</button></div></section>}
    <div className="app-signature"><span>Smart AI Travel by Franklim Herwing</span><span>v0.8.3</span></div>
    <AnimatePresence>{showExplore && <ExplorePanel pois={activePOIs} savedIds={savedIds} onClose={()=>setShowExplore(false)} onSelect={p=>{setSelectedPOI(p);setShowExplore(false)}} />}</AnimatePresence>
    <AnimatePresence>{showCamera && <CameraGuide onClose={()=>setShowCamera(false)} onAsk={()=>{setShowCamera(false);setShowChat(true)}} />}</AnimatePresence>
    <AnimatePresence>{selectedPOI && !showChat && <POIBottomSheet poi={selectedPOI} position={position} nextPOI={nextPOI} destinationName={destinationName} saved={savedIds.includes(selectedPOI.id)} onToggleSaved={()=>setSavedIds(ids=>ids.includes(selectedPOI.id)?ids.filter(id=>id!==selectedPOI.id):[...ids,selectedPOI.id])} onAskAI={()=>setShowChat(true)} onNextPOI={()=>tourIndex >= 0 ? advanceTour() : nextPOI&&setSelectedPOI(nextPOI)} onClose={()=>setSelectedPOI(null)} />}</AnimatePresence>
    <AnimatePresence>{showChat && <GuideChat context={{destination:destinationName,poiName:selectedPOI?.name,poiSummary:selectedPOI?.longDescription,latitude:position?.lat,longitude:position?.lng}} onClose={()=>setShowChat(false)} />}</AnimatePresence>
    <AnimatePresence>{showTour && <TourOverview stops={tourStops} onClose={()=>setShowTour(false)} onStart={startTour} />}</AnimatePresence>
  </main>;
}
