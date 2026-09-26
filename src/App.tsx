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
import { pauseNaturalNarration, resumeNaturalNarration, speakInstantNarration, stopNaturalNarration } from './services/naturalTTS';
import type { POI } from './types/poi';
import { withSpanishPOIs } from './data/spanish-pois';
import { matchesCategory, type PlaceCategory } from './data/categories';
import { buildTour,bearingArrow,distanceKm,routeDistanceKm,walkingMinutes } from './utils/tour';
import { practicalInfo } from './data/practical-info';
import { t } from './i18n';

type Demo = 'rome' | 'guatemala' | 'zacapa';
type MapFilter = PlaceCategory | 'all';
type ResumeData={demo:Demo;ids:string[];index:number;minutes:number};

function narrationText(poi: POI, language:string) {
  if (language === 'es') { const name=poi.nameEs ?? poi.name; const short=poi.shortDescriptionEs ?? poi.shortDescription; const long=poi.longDescriptionEs ?? poi.longDescription; const facts=poi.factsEs ?? poi.facts; return `Bienvenido a ${name}. ${short} ${long} Datos interesantes: ${facts.join('. ')}. Disfruta explorando este lugar.`; }
  return `Welcome to ${poi.name}! ${poi.shortDescription} Here's what makes this place special. ${poi.longDescription} A few quick things to notice: ${poi.facts.join('. ')}. Enjoy exploring!`;
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem('smarttravel-welcomed') !== '1');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapFilter, setMapFilter] = useState<MapFilter>('all');
  const [tourMinutes,setTourMinutes]=useState(30);
  const [showPractical,setShowPractical]=useState(false);
  const [darkMode,setDarkMode]=useState(()=>{const saved=localStorage.getItem('smarttravel-theme');return saved?saved==='dark':window.matchMedia?.('(prefers-color-scheme: dark)').matches});
  const [kidMode,setKidMode]=useState(()=>localStorage.getItem('smarttravel-kid-mode')==='1');
  const [resumeData,setResumeData]=useState<ResumeData|null>(()=>{try{return JSON.parse(localStorage.getItem('smarttravel-active-tour')||'null')}catch{return null}});
  const [activeTour, setActiveTour] = useState<POI[]>([]);
  const [tourIndex, setTourIndex] = useState(-1);
  const tourIndexRef = useRef(-1);
  const [savedIds, setSavedIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('smarttravel-saved') || '[]'); } catch { return []; } });

  useEffect(() => { localStorage.setItem('smarttravel-saved', JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => { const handler=(event:Event)=>setSpeechState((event as CustomEvent).detail); window.addEventListener('smarttravel-speech-state',handler); return()=>window.removeEventListener('smarttravel-speech-state',handler); }, []);
  useEffect(() => { localStorage.setItem('smarttravel-voice', voice); }, [voice]);
  useEffect(()=>localStorage.setItem('smarttravel-theme',darkMode?'dark':'light'),[darkMode]);
  useEffect(()=>localStorage.setItem('smarttravel-kid-mode',kidMode?'1':'0'),[kidMode]);
  useEffect(()=>{if(activeTour.length&&tourIndex>=0)localStorage.setItem('smarttravel-active-tour',JSON.stringify({demo,ids:activeTour.map(p=>p.id),index:tourIndex,minutes:tourMinutes}))},[activeTour,tourIndex,demo,tourMinutes]);

  useEffect(() => {
    if (!position) return;
    const destinations:[Demo,number,number][] = [['rome',41.8986,12.4769],['guatemala',14.6418,-90.5137],['zacapa',14.985,-89.55]];
    const nearest = destinations.map(([id,lat,lng]) => ({id,d:Math.hypot(position.lat-lat, position.lng-lng)})).sort((a,b)=>a.d-b.d)[0];
    if (nearest && nearest.d < .65) setDemo(nearest.id);
  }, [position]);

  const activePOIs = demo === 'guatemala' ? allPOIs.filter(p=>p.id.startsWith('gt-')) : demo === 'zacapa' ? allPOIs.filter(p=>p.id.startsWith('zacapa-')||p.id.startsWith('zx-')) : allPOIs.filter(p=>p.id.startsWith('rome-')||['colosseum','forum','pantheon','trevi','spanish-steps','navona','castel-sant-angelo','st-peters'].includes(p.id));
  const destinationName = language==='es' ? (demo==='guatemala'?'Ciudad de Guatemala':demo==='zacapa'?'Zacapa, Guatemala':'Roma, Italia') : (demo==='guatemala'?'Guatemala City':demo==='zacapa'?'Zacapa, Guatemala':'Rome, Italy');
  const filteredPOIs = useMemo(() => activePOIs.filter(p => mapFilter === 'all' || matchesCategory(p, mapFilter)), [activePOIs, mapFilter]);
  const selectedIndex = selectedPOI ? filteredPOIs.findIndex(p => p.id === selectedPOI.id) : -1;
  const previousPOI = selectedIndex > 0 ? filteredPOIs[selectedIndex - 1] : selectedIndex === 0 && filteredPOIs.length > 1 ? filteredPOIs[filteredPOIs.length - 1] : null;
  const nextPOI = selectedIndex >= 0 && filteredPOIs.length > 1 ? filteredPOIs[(selectedIndex + 1) % filteredPOIs.length] : null;

  const tourStops = useMemo(() => buildTour(activePOIs,tourMinutes), [activePOIs,tourMinutes]);
  const routeKm=routeDistanceKm(activeTour.length?activeTour:tourStops);
  const routeWalk=walkingMinutes(routeKm);
  const info=practicalInfo[demo];

  const openTour = () => { stopNaturalNarration(); setSelectedPOI(null); setShowTour(true); };

  const startTour = () => {
    if (!tourStops.length) return;
    setShowTour(false);
    setActiveTour(tourStops);
    tourIndexRef.current = 0;
    setTourIndex(0);
    setSelectedPOI(tourStops[0]);
    setAudioMode(true);
    stopNaturalNarration();
    speakInstantNarration(narrationText(tourStops[0], language), () => undefined, language);
    setResumeData(null);
  };
  const advanceTour = () => {
    const current = tourIndexRef.current;
    if (current < 0 || !activeTour.length) return;
    const next = current + 1;
    if (next >= activeTour.length) { tourIndexRef.current = -1; setTourIndex(-1); setActiveTour([]); localStorage.removeItem('smarttravel-active-tour'); setSelectedPOI(null); return; }
    tourIndexRef.current = next;
    setTourIndex(next);
    setSelectedPOI(activeTour[next]);
    stopNaturalNarration();
    speakInstantNarration(narrationText(activeTour[next], language), () => undefined, language);
  };

  const resumeTour=()=>{if(!resumeData)return;const stops=resumeData.ids.map(id=>allPOIs.find(p=>p.id===id)).filter(Boolean) as POI[];if(!stops.length){localStorage.removeItem('smarttravel-active-tour');setResumeData(null);return}const index=Math.min(resumeData.index,stops.length-1);setDemo(resumeData.demo);setTourMinutes(resumeData.minutes);setActiveTour(stops);tourIndexRef.current=index;setTourIndex(index);setSelectedPOI(stops[index]);setResumeData(null);setDemoFocusKey(k=>k+1)};
  const dismissResume=()=>{localStorage.removeItem('smarttravel-active-tour');setResumeData(null)};
  const nextTourStop=tourIndex>=0?activeTour[Math.min(tourIndex+1,activeTour.length-1)]??null:null;
  const nextDistance=nextTourStop?(position?distanceKm(position,nextTourStop):(activeTour[tourIndex]?distanceKm(activeTour[tourIndex],nextTourStop):0)):0;
  const arrow=nextTourStop?(position?bearingArrow(position,nextTourStop):(activeTour[tourIndex]?bearingArrow(activeTour[tourIndex],nextTourStop):'→')):'→';

  const showNearby = nearbyPOI && !selectedPOI && dismissedNearbyId !== nearbyPOI.id;
  useEffect(() => { if (nearbyPOI?.id !== dismissedNearbyId && navigator.vibrate) navigator.vibrate(80); }, [nearbyPOI, dismissedNearbyId]);
  const switchLanguage = (nextLanguage:string) => {
    if (nextLanguage === language) return;
    setLanguage(nextLanguage);
  };
  useEffect(() => { document.documentElement.lang = language; }, [language]);

  useEffect(() => {
    if (!audioMode || !nearbyPOI || autoNarratedId === nearbyPOI.id) return;
    setAutoNarratedId(nearbyPOI.id);
    speakInstantNarration(narrationText(nearbyPOI, language), () => undefined, language);
  }, [audioMode, nearbyPOI, autoNarratedId, language]);

  const openDemo = (nextDemo: Demo) => {
    stopNaturalNarration(); tourIndexRef.current = -1; setTourIndex(-1); setActiveTour([]); localStorage.removeItem('smarttravel-active-tour');
    setDemo(nextDemo); setMapFilter('all'); setSelectedPOI(null); setShowChat(false); setShowTour(false); setShowSearch(false); setShowExplore(false); setShowCamera(false); setDemoFocusKey(k => k + 1);
  };

  return <main className={'app-shell '+(darkMode?'theme-dark':'')}>
    {showWelcome && <section className="welcome-card"><div className="welcome-icon">✦</div><h1>Smart AI Travel</h1><p>{language==='es'?'Tu guía para explorar a tu ritmo.':'Your guide for exploring at your own pace.'}</p><ul><li>{language==='es'?'Explora Roma, Ciudad de Guatemala y Zacapa.':'Explore Rome, Guatemala City, and Zacapa.'}</li><li>{language==='es'?'Toca un marcador para conocer su historia.':'Tap a marker to discover its story.'}</li><li>{language==='es'?'Pregunta al guía o inicia un tour de 30 minutos.':'Ask the guide or start a 30-minute tour.'}</li></ul><button onClick={()=>{localStorage.setItem('smarttravel-welcomed','1');setShowWelcome(false)}}>{language==='es'?'Comenzar a explorar':'Start exploring'}</button></section>}
    <TravelMap position={position} onSelectPOI={setSelectedPOI} demo={demo} demoFocusKey={demoFocusKey} focusedPOI={selectedPOI} filteredPOIs={filteredPOIs} activeTour={activeTour} darkMode={darkMode} />
    {resumeData&&<aside className="resume-banner"><span>{t(language,'resume',{name:t(language,'tourName',{city:destinationName}),n:resumeData.index+1})}</span><button onClick={resumeTour}>{t(language,'resumeAction')}</button><button onClick={dismissResume}>{t(language,'dismiss')}</button></aside>}
    <header className="top-bar" aria-label="Map tools">
      <button className="icon-button search-button" aria-label="Search" onClick={()=>setShowSearch(v=>!v)}>⌕</button><button className="icon-button" aria-label="Camera guide" onClick={()=>setShowCamera(true)}>📷</button>
      <div className="location-pill"><span className="eyebrow">{language==='es'?'EXPLORANDO':'EXPLORING'}</span><strong>{destinationName}</strong></div>
    </header>
    <div className="walk-pill language-pill" aria-label="Guide language"><button className={language==='en'?'active':''} onClick={()=>switchLanguage('en')}>English</button><button className={language==='es'?'active':''} onClick={()=>switchLanguage('es')}>Español</button></div>
    <nav className="demo-switcher" aria-label="Demo destinations">
      <button className={demo==='rome'?'active':''} onClick={()=>openDemo('rome')}>🏛️ {language==='es'?'Roma':'Rome'}</button>
      <button className={demo==='guatemala'?'active':''} onClick={()=>openDemo('guatemala')}>🇬🇹 {language==='es'?'Ciudad de Guatemala':'Guatemala City'}</button>
      <button className={demo==='zacapa'?'active':''} onClick={()=>openDemo('zacapa')}>🌄 Zacapa</button>
    <button className="practical-button" aria-label={t(language,'goodToKnow')} onClick={()=>setShowPractical(true)}>ⓘ</button></nav>
    <aside className="category-rail" aria-label={language === 'es' ? 'Filtros del mapa' : 'Map filters'}>
      <button className={mapFilter==='history'?'active':''} onClick={()=>setMapFilter('history')} title={language==='es'?'Historia':'History'}><span>🏛️</span><small>{language==='es'?'Historia':'History'}</small></button>
      <button className={mapFilter==='food'?'active':''} onClick={()=>setMapFilter('food')} title={language==='es'?'Comida local':'Local food'}><span>🍲</span><small>{language==='es'?'Comida':'Food'}</small></button>
      <button className={mapFilter==='stories'?'active':''} onClick={()=>setMapFilter('stories')} title={language==='es'?'Historias y tradiciones':'Stories & traditions'}><span>📖</span><small>{language==='es'?'Historias':'Stories'}</small></button>
      <button className={mapFilter==='facts'?'active':''} onClick={()=>setMapFilter('facts')} title={language==='es'?'Demografía y datos':'Demographics & facts'}><span>📊</span><small>{language==='es'?'Datos':'Facts'}</small></button>
      <button className={mapFilter==='nature'?'active':''} onClick={()=>setMapFilter('nature')} title={language==='es'?'Naturaleza':'Nature'}><span>🌿</span><small>{language==='es'?'Naturaleza':'Nature'}</small></button>
      <button className={mapFilter==='all'?'active':''} onClick={()=>setMapFilter('all')} title={language==='es'?'Todas las categorías':'All categories'}><span>✦</span><small>{language==='es'?'Todo':'All'}</small></button>
    </aside>
    <aside className="map-controls">
      <button className={`round-button ${audioMode?'active-control':''}`} aria-label="Audio mode" onClick={()=>setAudioMode(v=>!v)}>🎧</button><button className="round-button" aria-label="Choose voice" onClick={()=>setShowVoiceMenu(v=>!v)}>🗣️</button>
    </aside>
    {showVoiceMenu && <div className="voice-menu"><strong>{language==='es'?'Voz del guía':'Guide voice'}</strong><button onClick={()=>{setVoice('natural');setShowVoiceMenu(false)}} className={voice==='natural'?'selected':''}>English · Natural Guide</button><button onClick={()=>{setVoice('warm');setShowVoiceMenu(false)}} className={voice==='warm'?'selected':''}>English · Warm Guide</button><button onClick={()=>{setVoice('bright');setShowVoiceMenu(false)}} className={voice==='bright'?'selected':''}>English · Bright Guide</button><button onClick={()=>{setVoice('spanish');setShowVoiceMenu(false)}} className={voice==='spanish'?'selected':''}>Español · Guía Latina</button><button onClick={()=>{setVoice('my-voice');setShowVoiceMenu(false)}} className={voice==='my-voice'?'selected':''}>My Voice*</button><small>{language==='es'?'Usa tu voz personalizada cuando esté configurada.':'Uses your custom voice when configured in settings.'}</small></div>}
    {error && <div className="gps-note">{language==='es'?'Ubicación no disponible — los mapas de demostración siguen funcionando.':'Location unavailable — demo maps still work.'}</div>}
    <AnimatePresence>{showSearch && <SearchPanel pois={activePOIs} query={searchQuery} onQuery={setSearchQuery} language={language} onClose={()=>{setShowSearch(false);setSearchQuery('')}} onSelect={poi=>{setSelectedPOI(poi);setShowSearch(false);}} />}</AnimatePresence>
    <AnimatePresence>{showNearby && <motion.section className="nearby-alert" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:18}}><button className="nearby-dismiss" onClick={()=>setDismissedNearbyId(nearbyPOI.id)}>×</button><span className="nearby-icon">{nearbyPOI.emoji}</span><div><small>YOU'RE NEARBY</small><strong>{nearbyPOI.name}</strong><p>{audioMode?'Audio mode will narrate this stop.':'Want to hear the story?'}</p></div><button className="nearby-open" onClick={()=>setSelectedPOI(nearbyPOI)}>Open</button></motion.section>}</AnimatePresence>
    {!selectedPOI && !showNearby && !showChat && !showTour && !showExplore && !showCamera && <section className="ai-dock">
      <div className="bottom-primary-actions">
        <button className="ask-me-button" onClick={()=>setShowChat(true)}><span>✦</span><strong>{language==='es'?'Pregúntame':'Ask Me'}</strong></button>
        <button onClick={openTour}>⏱️ <strong>{tourMinutes} {t(language,'minutes')}</strong></button>
        <button onClick={()=>setShowExplore(true)}>📍 <strong>{language==='es'?'Explorar':'Explore'}</strong></button>
        <button className="more-button" onClick={()=>{setShowVoiceMenu(false);setShowMoreMenu(v=>!v)}}>•••</button>
      </div>
      <div className={`quick-more-menu ${showMoreMenu?'open':''}`}>
        <button onClick={()=>{setChatPrompt(language==='es'?'Cuéntame una historia sobre este lugar.':'Tell me a story about this place.');setShowChat(true);setShowMoreMenu(false)}}>📖 {language==='es'?'Cuéntame una historia':'Tell me a story'}</button>
        <button onClick={()=>setDarkMode(v=>!v)}>◐ {t(language,'darkMode')}: {darkMode?t(language,'yes'):t(language,'no')}</button><button onClick={()=>setKidMode(v=>!v)}>🧒 {t(language,'kidMode')}: {kidMode?t(language,'yes'):t(language,'no')}</button><button onClick={()=>{setShowCamera(true);setShowMoreMenu(false)}}>📷 Camera AI</button>
      </div>
    </section>}
    {speechState.active && <button className="global-speech-control" aria-label={speechState.paused ? (language==='es'?'Continuar narración':'Resume narration') : (language==='es'?'Pausar narración':'Pause narration')} onClick={()=>speechState.paused?resumeNaturalNarration():pauseNaturalNarration()}>{speechState.paused?'▶':'■'}</button>}
    {tourIndex>=0&&nextTourStop&&!showTour&&<aside className="next-stop-strip"><b>{arrow}</b><div><small>{t(language,'nextStop')} · {nextDistance.toFixed(1)} km · {t(language,'routeInfo')}: {routeKm.toFixed(1)} km · {t(language,'walkTime',{n:routeWalk})}</small><strong>{language==='es'?(nextTourStop.nameEs??nextTourStop.name):nextTourStop.name}</strong></div><button onClick={()=>setSelectedPOI(nextTourStop)}>{t(language,'details')}</button></aside>}
    <div className={`app-signature ${(selectedPOI||showChat||showTour||showExplore||showCamera||showPractical)?'panel-open':''}`}><span>Smart AI Travel by Franklim Herwing</span><span>v0.13.0</span></div>
    <AnimatePresence>{showExplore && <ExplorePanel pois={activePOIs} savedIds={savedIds} hasGps={!!position} destinationName={destinationName} language={language} onClose={()=>setShowExplore(false)} onSelect={p=>{setSelectedPOI(p);setShowExplore(false)}} />}</AnimatePresence>
    <AnimatePresence>{showPractical&&<motion.section className="practical-panel" initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}><header><div><small>{destinationName}</small><h2>{t(language,'goodToKnow')}</h2></div><button onClick={()=>setShowPractical(false)}>×</button></header><div className="practical-body"><p><b>☎ {t(language,'emergency')}:</b> {info.emergency}</p><p><b>⚕ {t(language,'health')}:</b> {language==='es'?info.health.es:info.health.en}</p><p><b>☕ {t(language,'comfort')}:</b> {language==='es'?info.comfort.es:info.comfort.en}</p></div></motion.section>}</AnimatePresence>
    <AnimatePresence>{showCamera && <CameraGuide language={language} onClose={()=>setShowCamera(false)} />}</AnimatePresence>
    <AnimatePresence>{selectedPOI && !showChat && <POIBottomSheet poi={selectedPOI} position={position} nextPOI={tourIndex>=0 ? activeTour[tourIndex+1] ?? null : nextPOI} previousPOI={tourIndex>=0 ? activeTour[tourIndex-1] ?? null : previousPOI} destinationName={destinationName} saved={savedIds.includes(selectedPOI.id)} onToggleSaved={()=>setSavedIds(ids=>ids.includes(selectedPOI.id)?ids.filter(id=>id!==selectedPOI.id):[...ids,selectedPOI.id])} onAskAI={()=>setShowChat(true)} onNextPOI={()=>tourIndex >= 0 ? advanceTour() : nextPOI&&setSelectedPOI(nextPOI)} onPreviousPOI={()=>{if (tourIndex > 0) { const prior=tourIndex-1; tourIndexRef.current=prior; setTourIndex(prior); setSelectedPOI(activeTour[prior]); stopNaturalNarration(); speakInstantNarration(narrationText(activeTour[prior],language),()=>undefined,language); } else if (tourIndex < 0 && previousPOI) setSelectedPOI(previousPOI);}} onClose={()=>{stopNaturalNarration();setSelectedPOI(null)}} tourActive={tourIndex >= 0} language={language} kidMode={kidMode} />}</AnimatePresence>
    <AnimatePresence>{showChat && <GuideChat language={language} initialPrompt={chatPrompt} kidMode={kidMode} context={{destination:destinationName,poiName:selectedPOI?.name,poiSummary:selectedPOI?.longDescription,latitude:position?.lat,longitude:position?.lng,language}} onClose={()=>{setShowChat(false);setChatPrompt('')}} />}</AnimatePresence>
    <AnimatePresence>{showTour && <TourOverview stops={tourStops} language={language} minutes={tourMinutes} onMinutes={setTourMinutes} elevation={info.elevation} onClose={()=>setShowTour(false)} onStart={startTour} />}</AnimatePresence>
  </main>;
}
