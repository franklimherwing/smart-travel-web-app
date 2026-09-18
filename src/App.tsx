import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TravelMap } from './components/map/TravelMap';
import { POIBottomSheet } from './components/poi/POIBottomSheet';
import { GuideChat } from './components/ai/GuideChat';
import { TourOverview } from './components/tour/TourOverview';
import { SearchPanel } from './components/search/SearchPanel';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyPOI } from './hooks/useNearbyPOI';
import { romePOIs } from './data/rome-pois';
import { guatemalaCityPOIs, zacapaPOIs } from './data/guatemala-pois';
import { zacapaExtraPOIs } from './data/zacapa-extra-pois';
import { playNaturalNarration } from './services/naturalTTS';
import type { POI } from './types/poi';

type Demo = 'rome' | 'guatemala' | 'zacapa';

function narrationText(poi: POI) {
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
  const [autoNarratedId, setAutoNarratedId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const showNearby = nearbyPOI && !selectedPOI && dismissedNearbyId !== nearbyPOI.id;
  useEffect(() => { if (nearbyPOI?.id !== dismissedNearbyId && navigator.vibrate) navigator.vibrate(80); }, [nearbyPOI, dismissedNearbyId]);
  useEffect(() => {
    if (!audioMode || !nearbyPOI || autoNarratedId === nearbyPOI.id) return;
    setAutoNarratedId(nearbyPOI.id);
    playNaturalNarration(narrationText(nearbyPOI), () => undefined).catch(() => browserFallback(narrationText(nearbyPOI)));
  }, [audioMode, nearbyPOI, autoNarratedId]);

  const openDemo = (nextDemo: Demo) => {
    setDemo(nextDemo); setSelectedPOI(null); setShowChat(false); setShowTour(false); setShowSearch(false); setDemoFocusKey(k => k + 1);
  };

  return <main className="app-shell">
    <TravelMap position={position} onSelectPOI={setSelectedPOI} demo={demo} demoFocusKey={demoFocusKey} focusedPOI={selectedPOI} />
    <header className="top-bar" aria-label="Map tools">
      <button className="icon-button" aria-label="Search" onClick={()=>setShowSearch(v=>!v)}>⌕</button>
      <div className="location-pill"><span className="eyebrow">EXPLORING</span><strong>{destinationName}</strong></div>
    </header>
    <div className="walk-pill"><span>🚶</span><span>{position ? `GPS ±${Math.round(position.accuracy)}m` : 'Demo mode'}</span></div>
    <nav className="demo-switcher" aria-label="Demo destinations">
      <button className={demo==='rome'?'active':''} onClick={()=>openDemo('rome')}>🏛️ Rome</button>
      <button className={demo==='guatemala'?'active':''} onClick={()=>openDemo('guatemala')}>🇬🇹 Guatemala City</button>
      <button className={demo==='zacapa'?'active':''} onClick={()=>openDemo('zacapa')}>🌄 Zacapa</button>
    </nav>
    <aside className="map-controls">
      <button className={`round-button ${audioMode?'active-control':''}`} aria-label="Audio mode" onClick={()=>setAudioMode(v=>!v)}>🎧</button>
    </aside>
    {error && <div className="gps-note">Location unavailable — demo maps still work.</div>}
    <AnimatePresence>{showSearch && <SearchPanel pois={activePOIs} query={searchQuery} onQuery={setSearchQuery} onClose={()=>setShowSearch(false)} onSelect={poi=>{setSelectedPOI(poi);setShowSearch(false);}} />}</AnimatePresence>
    <AnimatePresence>{showNearby && <motion.section className="nearby-alert" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:18}}><button className="nearby-dismiss" onClick={()=>setDismissedNearbyId(nearbyPOI.id)}>×</button><span className="nearby-icon">{nearbyPOI.emoji}</span><div><small>YOU'RE NEARBY</small><strong>{nearbyPOI.name}</strong><p>{audioMode?'Audio mode will narrate this stop.':'Want to hear the story?'}</p></div><button className="nearby-open" onClick={()=>setSelectedPOI(nearbyPOI)}>Open</button></motion.section>}</AnimatePresence>
    {!selectedPOI && !showNearby && !showChat && !showTour && <section className="ai-dock"><button className="ai-bar" onClick={()=>setShowChat(true)}><span className="agent-orb">✦</span><span><small>YOUR LOCAL GUIDE</small><strong>Ask about this area</strong></span><span className="mic">🎙️</span></button><div className="suggestions"><button onClick={()=>setShowTour(true)}>30-min tour</button><button onClick={()=>{setSearchQuery('');setShowSearch(true);}}>What’s nearby?</button><button onClick={()=>setShowChat(true)}>Tell me a story</button></div></section>}
    <div className="app-signature"><span>Smart AI Travel by Franklim Herwing</span><span>v0.4.4</span></div>
    <AnimatePresence>{selectedPOI && !showChat && <POIBottomSheet poi={selectedPOI} position={position} nextPOI={nextPOI} destinationName={destinationName} onAskAI={()=>setShowChat(true)} onNextPOI={()=>nextPOI&&setSelectedPOI(nextPOI)} onClose={()=>setSelectedPOI(null)} />}</AnimatePresence>
    <AnimatePresence>{showChat && <GuideChat context={{destination:destinationName,poiName:selectedPOI?.name,poiSummary:selectedPOI?.longDescription,latitude:position?.lat,longitude:position?.lng}} onClose={()=>setShowChat(false)} />}</AnimatePresence>
    <AnimatePresence>{showTour && <TourOverview stops={tourStops} onClose={()=>setShowTour(false)} onStart={()=>{setShowTour(false); if(tourStops[0]) setSelectedPOI(tourStops[0]);}} />}</AnimatePresence>
  </main>;
}
