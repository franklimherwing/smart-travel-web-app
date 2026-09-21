import { useEffect, useMemo, useRef, useState } from 'react';
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
import { romeExpansionPOIs, guatemalaExpansionPOIs, zacapaExpansionPOIs } from './data/expansion-pois';
import { getNarrationProgress, pauseNaturalNarration, resumeNaturalNarration, speakInstantNarration, stopNaturalNarration } from './services/naturalTTS';
import type { POI } from './types/poi';
import { withSpanishPOIs } from './data/spanish-pois';

type Demo = 'rome' | 'guatemala' | 'zacapa';
type MapFilter = 'history' | 'food' | 'stories' | 'facts' | 'all';

function narrationText(poi: POI, language:string) {
  if (language === 'es') { const name=poi.nameEs ?? poi.name; const short=poi.shortDescriptionEs ?? poi.shortDescription; const long=poi.longDescriptionEs ?? poi.longDescription; const facts=poi.factsEs ?? poi.facts; return `Bienvenido a ${name}. ${short} ${long} Datos interesantes: ${facts.join('. ')}. Disfruta explorando este lugar.`; }
  return `Welcome to ${poi.name}! ${poi.shortDescription} Here's what makes this place special. ${poi.longDescription} A few quick things to notice: ${poi.facts.join('. ')}. Enjoy exploring!`;
}

function browserFallback(text: string, onEnd?: () => void, language = 'en') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.08;
  const voices = window.speechSynthesis.getVoices();
  const preferred = language === 'es' ? voices.find(v => v.lang.startsWith('es')) : (voices.find(v => /Samantha|Google US English|Microsoft Aria|Karen|Daniel/i.test(v.name)) || voices.find(v => v.lang.startsWith('en')));
  if (preferred) utterance.voice = preferred;
  if (onEnd) { utterance.onend = onEnd; utterance.onerror = onEnd; }
  window.speechSynthesis.speak(utterance);
}

export default function App() {
  const { position, error } = useGeolocation();
  const allPOIs = useMemo(() => withSpanishPOIs([...romePOIs, ...romeExpansionPOIs, ...guatemalaCityPOIs, ...guatemalaExpansionPOIs, ...zacapaPOIs, ...zacapaExtraPOIs, ...zacapaExpansionPOIs]), []);
  const nearbyPOI = useNearbyPOI(position, allPOIs);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [demo, setDemo] = useState<Demo>('rome');
  const [demoFocusKey, setDemoFocusKey] = useState(0);
  const [dismissedNearbyId, setDismissedNearbyId] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState(false);
  const [speechState, setSpeechState] = useState({active:false,paused:false});
  const [language, setLanguage] = useState('en');
  const [voice, setVoice] = useState(() => localStorage.getItem('smarttravel-voice') || 'natural');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [autoNarratedId, setAutoNarratedId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapFilter, setMapFilter] = useState<MapFilter>('all');
  const [activeTour, setActiveTour] = useState<POI[]>([]);
  const [tourIndex, setTourIndex] = useState(-1);
  const tourIndexRef = useRef(-1);
  const [savedIds, setSavedIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('smarttravel-saved') || '[]'); } catch { return []; } });

  useEffect(() => { localStorage.setItem('smarttravel-saved', JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => { const handler=(event:Event)=>setSpeechState((event as CustomEvent).detail); window.addEventListener('smarttravel-speech-state',handler); return()=>window.removeEventListener('smarttravel-speech-state',handler); }, []);
  useEffect(() => { localStorage.setItem('smarttravel-voice', voice); }, [voice]);

  useEffect(() => {
    if (!position) return;
    const destinations:[Demo,number,number][] = [['rome',41.8986,12.4769],['guatemala',14.6418,-90.5137],['zacapa',14.985,-89.55]];
    const nearest = destinations.map(([id,lat,lng]) => ({id,d:Math.hypot(position.lat-lat, position.lng-lng)})).sort((a,b)=>a.d-b.d)[0];
    if (nearest && nearest.d < .65) setDemo(nearest.id);
  }, [position]);

  const activePOIs = demo === 'guatemala' ? allPOIs.filter(p=>p.id.startsWith('gt-')) : demo === 'zacapa' ? allPOIs.filter(p=>p.id.startsWith('zacapa-')||p.id.startsWith('zx-')) : allPOIs.filter(p=>p.id.startsWith('rome-')||['colosseum','forum','pantheon','trevi','spanish-steps','navona','castel-sant-angelo','st-peters'].includes(p.id));
  const destinationName = demo === 'guatemala' ? 'Guatemala City' : demo === 'zacapa' ? 'Zacapa, Guatemala' : 'Rome, Italy';
  const filteredPOIs = useMemo(() => {
    if (mapFilter === 'all') return activePOIs;
    if (mapFilter === 'food') return activePOIs.filter(p => p.category === 'food');
    if (mapFilter === 'history') return activePOIs.filter(p => ['history','architecture','religion'].includes(p.category));
    if (mapFilter === 'stories') return activePOIs.filter(p => {
      const text = `${p.id} ${p.name} ${p.nameEs ?? ''} ${p.shortDescription} ${p.shortDescriptionEs ?? ''}`;
      return p.category === 'culture' || /story|stories|tradition|legend|festival|fiesta|folklore|cuento|tradici|leyenda|oral|heritage/i.test(text);
    });
    return activePOIs.filter(p => {
      const text = `${p.id} ${p.name} ${p.nameEs ?? ''} ${p.shortDescription} ${p.longDescription}`;
      return /demograph|population|poblaci|demograf|census|censo|people|habitantes|municipality|municipio|department|departamento|founded|founded|elevation|climate|econom|geograph/i.test(text);
    });
  }, [activePOIs, mapFilter]);
  const selectedIndex = selectedPOI ? filteredPOIs.findIndex(p => p.id === selectedPOI.id) : -1;
  const previousPOI = selectedIndex > 0 ? filteredPOIs[selectedIndex - 1] : selectedIndex === 0 && filteredPOIs.length > 1 ? filteredPOIs[filteredPOIs.length - 1] : null;
  const nextPOI = selectedIndex >= 0 && filteredPOIs.length > 1 ? filteredPOIs[(selectedIndex + 1) % filteredPOIs.length] : null;

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

  const openTour = () => { setShowTour(true); };

  const startTour = () => {
    if (!tourStops.length) return;
    setShowTour(false);
    setActiveTour(tourStops);
    tourIndexRef.current = 0;
    setTourIndex(0);
    setSelectedPOI(tourStops[0]);
    setAudioMode(true);
  };
  const advanceTour = () => {
    const current = tourIndexRef.current;
    if (current < 0 || !activeTour.length) return;
    const next = current + 1;
    if (next >= activeTour.length) { tourIndexRef.current = -1; setTourIndex(-1); setActiveTour([]); return; }
    tourIndexRef.current = next;
    setTourIndex(next);
    setSelectedPOI(activeTour[next]);
  };

  const showNearby = nearbyPOI && !selectedPOI && dismissedNearbyId !== nearbyPOI.id;
  useEffect(() => { if (nearbyPOI?.id !== dismissedNearbyId && navigator.vibrate) navigator.vibrate(80); }, [nearbyPOI, dismissedNearbyId]);
  useEffect(() => {
    if (tourIndex < 0 || !activeTour[tourIndex]) return;
    const stop = activeTour[tourIndex];
    const text = narrationText(stop, language);
    const timer = window.setTimeout(() => {
      speakInstantNarration(text, advanceTour, language, getNarrationProgress());
    }, tourIndex === 0 ? 150 : 80);
    return () => window.clearTimeout(timer);
  }, [tourIndex, activeTour, language]);

  const switchLanguage = (nextLanguage:string) => {
    if (nextLanguage === language) return;
    setLanguage(nextLanguage);
  };

  useEffect(() => {
    if (!audioMode || !nearbyPOI || autoNarratedId === nearbyPOI.id) return;
    setAutoNarratedId(nearbyPOI.id);
    speakInstantNarration(narrationText(nearbyPOI, language), () => undefined, language);
  }, [audioMode, nearbyPOI, autoNarratedId, language]);

  const openDemo = (nextDemo: Demo) => {
    setDemo(nextDemo); setMapFilter('all'); setSelectedPOI(null); setShowChat(false); setShowTour(false); setShowSearch(false); setShowExplore(false); setShowCamera(false); setDemoFocusKey(k => k + 1);
  };

  return <main className="app-shell">
    <TravelMap position={position} onSelectPOI={setSelectedPOI} demo={demo} demoFocusKey={demoFocusKey} focusedPOI={selectedPOI} filteredPOIs={filteredPOIs} />
    <header className="top-bar" aria-label="Map tools">
      <button className="icon-button search-button" aria-label="Search" onClick={()=>setShowSearch(v=>!v)}>⌕</button><button className="icon-button" aria-label="Camera guide" onClick={()=>setShowCamera(true)}>📷</button>
      <div className="location-pill"><span className="eyebrow">EXPLORING</span><strong>{destinationName}</strong></div>
    </header>
    <div className="walk-pill language-pill" aria-label="Guide language"><button className={language==='en'?'active':''} onClick={()=>switchLanguage('en')}>English</button><button className={language==='es'?'active':''} onClick={()=>switchLanguage('es')}>Español</button></div>
    <nav className="demo-switcher" aria-label="Demo destinations">
      <button className={demo==='rome'?'active':''} onClick={()=>openDemo('rome')}>🏛️ Rome</button>
      <button className={demo==='guatemala'?'active':''} onClick={()=>openDemo('guatemala')}>🇬🇹 Guatemala City</button>
      <button className={demo==='zacapa'?'active':''} onClick={()=>openDemo('zacapa')}>🌄 Zacapa</button>
    </nav>
    <aside className="category-rail" aria-label={language === 'es' ? 'Filtros del mapa' : 'Map filters'}>
      <button className={mapFilter==='history'?'active':''} onClick={()=>setMapFilter('history')} title={language==='es'?'Historia':'History'}><span>🏛️</span><small>{language==='es'?'Historia':'History'}</small></button>
      <button className={mapFilter==='food'?'active':''} onClick={()=>setMapFilter('food')} title={language==='es'?'Comida local':'Local food'}><span>🍲</span><small>{language==='es'?'Comida':'Food'}</small></button>
      <button className={mapFilter==='stories'?'active':''} onClick={()=>setMapFilter('stories')} title={language==='es'?'Historias y tradiciones':'Stories & traditions'}><span>📖</span><small>{language==='es'?'Historias':'Stories'}</small></button>
      <button className={mapFilter==='facts'?'active':''} onClick={()=>setMapFilter('facts')} title={language==='es'?'Demografía y datos':'Demographics & facts'}><span>📊</span><small>{language==='es'?'Datos':'Facts'}</small></button>
      <button className={mapFilter==='all'?'active':''} onClick={()=>setMapFilter('all')} title={language==='es'?'Todas las categorías':'All categories'}><span>✦</span><small>{language==='es'?'Todo':'All'}</small></button>
    </aside>
    <aside className="map-controls">
      <button className={`round-button ${audioMode?'active-control':''}`} aria-label="Audio mode" onClick={()=>setAudioMode(v=>!v)}>🎧</button><button className="round-button" aria-label="Choose voice" onClick={()=>setShowVoiceMenu(v=>!v)}>🗣️</button>
    </aside>
    {showVoiceMenu && <div className="voice-menu"><strong>Guide voice</strong><button onClick={()=>{setVoice('natural');setShowVoiceMenu(false)}} className={voice==='natural'?'selected':''}>English · Natural Guide</button><button onClick={()=>{setVoice('warm');setShowVoiceMenu(false)}} className={voice==='warm'?'selected':''}>English · Warm Guide</button><button onClick={()=>{setVoice('bright');setShowVoiceMenu(false)}} className={voice==='bright'?'selected':''}>English · Bright Guide</button><button onClick={()=>{setVoice('spanish');setShowVoiceMenu(false)}} className={voice==='spanish'?'selected':''}>Español · Guía Latina</button><button onClick={()=>{setVoice('my-voice');setShowVoiceMenu(false)}} className={voice==='my-voice'?'selected':''}>My Voice*</button><small>*Uses your custom voice when OPENAI_CUSTOM_VOICE_ID is configured.</small></div>}
    {error && <div className="gps-note">Location unavailable — demo maps still work.</div>}
    <AnimatePresence>{showSearch && <SearchPanel pois={activePOIs} query={searchQuery} onQuery={setSearchQuery} onClose={()=>setShowSearch(false)} onSelect={poi=>{setSelectedPOI(poi);setShowSearch(false);}} />}</AnimatePresence>
    <AnimatePresence>{showNearby && <motion.section className="nearby-alert" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:18}}><button className="nearby-dismiss" onClick={()=>setDismissedNearbyId(nearbyPOI.id)}>×</button><span className="nearby-icon">{nearbyPOI.emoji}</span><div><small>YOU'RE NEARBY</small><strong>{nearbyPOI.name}</strong><p>{audioMode?'Audio mode will narrate this stop.':'Want to hear the story?'}</p></div><button className="nearby-open" onClick={()=>setSelectedPOI(nearbyPOI)}>Open</button></motion.section>}</AnimatePresence>
    {!selectedPOI && !showNearby && !showChat && !showTour && !showExplore && !showCamera && <section className="ai-dock"><button className="ai-bar compact-guide" onClick={()=>setShowChat(true)}><span className="agent-orb">✦</span><strong>{language==='es'?'Pregúntame':'Ask me'}</strong></button><div className="suggestions"><button onClick={()=>setShowExplore(true)}>📍 Explore</button><button onClick={openTour}>30-min tour</button><button onClick={()=>setShowCamera(true)}>📷 Camera AI</button><button onClick={()=>setShowChat(true)}>Tell me a story</button></div></section>}
    {speechState.active && <button className="global-speech-control" aria-label={speechState.paused ? (language==='es'?'Continuar narración':'Resume narration') : (language==='es'?'Pausar narración':'Pause narration')} onClick={()=>speechState.paused?resumeNaturalNarration():pauseNaturalNarration()}>{speechState.paused?'▶':'■'}</button>}
    <div className="app-signature"><span>Smart AI Travel by Franklim Herwing</span><span>v0.10.9</span></div>
    <AnimatePresence>{showExplore && <ExplorePanel pois={activePOIs} savedIds={savedIds} onClose={()=>setShowExplore(false)} onSelect={p=>{setSelectedPOI(p);setShowExplore(false)}} />}</AnimatePresence>
    <AnimatePresence>{showCamera && <CameraGuide onClose={()=>setShowCamera(false)} onAsk={()=>{setShowCamera(false);setShowChat(true)}} />}</AnimatePresence>
    <AnimatePresence>{selectedPOI && !showChat && <POIBottomSheet poi={selectedPOI} position={position} nextPOI={nextPOI} previousPOI={previousPOI} destinationName={destinationName} saved={savedIds.includes(selectedPOI.id)} onToggleSaved={()=>setSavedIds(ids=>ids.includes(selectedPOI.id)?ids.filter(id=>id!==selectedPOI.id):[...ids,selectedPOI.id])} onAskAI={()=>setShowChat(true)} onNextPOI={()=>tourIndex >= 0 ? advanceTour() : nextPOI&&setSelectedPOI(nextPOI)} onPreviousPOI={()=>previousPOI&&setSelectedPOI(previousPOI)} onClose={()=>setSelectedPOI(null)} tourActive={tourIndex >= 0} language={language} />}</AnimatePresence>
    <AnimatePresence>{showChat && <GuideChat context={{destination:destinationName,poiName:selectedPOI?.name,poiSummary:selectedPOI?.longDescription,latitude:position?.lat,longitude:position?.lng}} onClose={()=>setShowChat(false)} />}</AnimatePresence>
    <AnimatePresence>{showTour && <TourOverview stops={tourStops} onClose={()=>setShowTour(false)} onStart={startTour} />}</AnimatePresence>
  </main>;
}
