import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TravelMap } from './components/map/TravelMap';
import { POIBottomSheet } from './components/poi/POIBottomSheet';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyPOI } from './hooks/useNearbyPOI';
import { romePOIs } from './data/rome-pois';
import { guatemalaCityPOIs, zacapaPOIs } from './data/guatemala-pois';
import type { POI } from './types/poi';

type Demo = 'rome' | 'guatemala' | 'zacapa';

export default function App() {
  const { position, error } = useGeolocation();
  const allPOIs = useMemo(() => [...romePOIs, ...guatemalaCityPOIs, ...zacapaPOIs], []);
  const nearbyPOI = useNearbyPOI(position, allPOIs);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [demo, setDemo] = useState<Demo>('rome');
  const [demoFocusKey, setDemoFocusKey] = useState(0);
  const [dismissedNearbyId, setDismissedNearbyId] = useState<string | null>(null);

  useEffect(() => {
    if (nearbyPOI?.id !== dismissedNearbyId && navigator.vibrate) navigator.vibrate(80);
  }, [nearbyPOI, dismissedNearbyId]);

  const activePOIs = demo === 'guatemala' ? guatemalaCityPOIs : demo === 'zacapa' ? zacapaPOIs : romePOIs;
  const nextPOI = selectedPOI
    ? activePOIs.filter(p => p.id !== selectedPOI.id)
        .map(p => ({ poi:p, distance:Math.hypot(p.lat-selectedPOI.lat,p.lng-selectedPOI.lng) }))
        .sort((a,b)=>a.distance-b.distance)[0]?.poi ?? null
    : null;
  const showNearby = nearbyPOI && !selectedPOI && dismissedNearbyId !== nearbyPOI.id;

  const openDemo = (nextDemo: Demo) => {
    setDemo(nextDemo);
    setSelectedPOI(null);
    setDemoFocusKey(k => k + 1);
  };

  return (
    <main className="app-shell">
      <TravelMap position={position} onSelectPOI={setSelectedPOI} demo={demo}
        demoFocusKey={demoFocusKey} focusedPOI={selectedPOI} />

      <header className="top-bar" aria-label="Map tools">
        <button className="icon-button" aria-label="Search">⌕</button>
        <div className="location-pill"><span className="eyebrow">EXPLORING</span>
          <strong>{demo==='guatemala'?'Guatemala City':demo==='zacapa'?'Zacapa, Guatemala':position?'Around you':'Rome, Italy'}</strong>
        </div>
        <button className="icon-button" aria-label="Settings">⚙</button>
        <button className="icon-button" aria-label="Profile">●</button>
      </header>

      <div className="walk-pill"><span>🚶</span><span>{position ? `GPS ±${Math.round(position.accuracy)}m` : 'Demo mode'}</span></div>

      <nav className="demo-switcher" aria-label="Demo destinations">
        <button className={demo==='rome'?'active':''} onClick={()=>openDemo('rome')}>🏛️ Rome</button>
        <button className={demo==='guatemala'?'active':''} onClick={()=>openDemo('guatemala')}>🇬🇹 Guatemala City</button>
        <button className={demo==='zacapa'?'active':''} onClick={()=>openDemo('zacapa')}>🌄 Zacapa</button>
      </nav>

      <aside className="map-controls"><button className="round-button">＋</button><button className="round-button">🎧</button><button className="round-button">🧭</button></aside>
      {error && <div className="gps-note">Location unavailable — demo maps still work.</div>}

      <AnimatePresence>{showNearby && <motion.section className="nearby-alert" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:18}}>
        <button className="nearby-dismiss" onClick={()=>setDismissedNearbyId(nearbyPOI.id)}>×</button>
        <span className="nearby-icon">{nearbyPOI.emoji}</span><div><small>YOU'RE NEARBY</small><strong>{nearbyPOI.name}</strong><p>Want to hear the story?</p></div>
        <button className="nearby-open" onClick={()=>setSelectedPOI(nearbyPOI)}>Open</button>
      </motion.section>}</AnimatePresence>

      {!selectedPOI && !showNearby && <section className="ai-dock"><button className="ai-bar" onClick={()=>alert('Conversational AI guide is coming next.')}>
        <span className="agent-orb">✦</span><span><small>YOUR LOCAL GUIDE</small><strong>Ask about this area</strong></span><span className="mic">🎙️</span>
      </button><div className="suggestions"><button>30-min tour</button><button>What’s nearby?</button><button>Tell me a story</button></div></section>}

      <div className="app-signature"><span>Smart AI Travel by Franklim Herwing</span><span>v0.3.0</span></div>

      <AnimatePresence>{selectedPOI && <POIBottomSheet poi={selectedPOI} position={position} nextPOI={nextPOI}
        onNextPOI={()=>nextPOI&&setSelectedPOI(nextPOI)} onClose={()=>setSelectedPOI(null)} />}</AnimatePresence>
    </main>
  );
}
