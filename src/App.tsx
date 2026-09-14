import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TravelMap } from './components/map/TravelMap';
import { POIBottomSheet } from './components/poi/POIBottomSheet';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyPOI } from './hooks/useNearbyPOI';
import type { POI } from './types/poi';
import { romePOIs } from './data/rome-pois';

export default function App() {
  const { position, error } = useGeolocation();
  const nearbyPOI = useNearbyPOI(position);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [romeFocusKey, setRomeFocusKey] = useState(0);
  const [dismissedNearbyId, setDismissedNearbyId] = useState<string | null>(null);

  useEffect(() => {
    if (nearbyPOI?.id !== dismissedNearbyId && navigator.vibrate) {
      navigator.vibrate(80);
    }
  }, [nearbyPOI, dismissedNearbyId]);

  const showNearby = nearbyPOI && !selectedPOI && dismissedNearbyId !== nearbyPOI.id;

  const nextPOI = selectedPOI
    ? romePOIs
        .filter(poi => poi.id !== selectedPOI.id)
        .map(poi => ({ poi, distance: Math.hypot(poi.lat - selectedPOI.lat, poi.lng - selectedPOI.lng) }))
        .sort((a, b) => a.distance - b.distance)[0]?.poi ?? null
    : null;

  return (
    <main className="app-shell">
      <TravelMap
        position={position}
        onSelectPOI={setSelectedPOI}
        romeFocusKey={romeFocusKey}
        focusedPOI={selectedPOI}
      />

      <header className="top-bar" aria-label="Map tools">
        <button className="icon-button" aria-label="Search">⌕</button>
        <div className="location-pill">
          <span className="eyebrow">EXPLORING</span>
          <strong>{position ? 'Around you' : 'Rome, Italy'}</strong>
        </div>
        <button className="icon-button" aria-label="Settings">⚙</button>
        <button className="icon-button" aria-label="Profile">●</button>
      </header>

      <div className="walk-pill" aria-live="polite">
        <span>🚶</span>
        <span>{position ? `GPS ±${Math.round(position.accuracy)}m` : 'Demo · Rome'}</span>
      </div>

      <button
        className="rome-demo-button"
        onClick={() => {
          setSelectedPOI(null);
          setRomeFocusKey(key => key + 1);
        }}
      >
        🏛️ Rome demo
      </button>

      <aside className="map-controls" aria-label="Map controls">
        <button className="round-button" aria-label="Zoom in">＋</button>
        <button className="round-button" aria-label="Audio mode">🎧</button>
        <button className="round-button" aria-label="Compass mode">🧭</button>
      </aside>

      {error && <div className="gps-note">Location unavailable — showing Rome demo.</div>}

      <AnimatePresence>
        {showNearby && (
          <motion.section
            className="nearby-alert"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ type:'spring', stiffness:360, damping:28 }}
            aria-live="polite"
          >
            <button
              className="nearby-dismiss"
              aria-label="Dismiss nearby place"
              onClick={() => setDismissedNearbyId(nearbyPOI.id)}
            >
              ×
            </button>
            <span className="nearby-icon">{nearbyPOI.emoji}</span>
            <div>
              <small>YOU'RE NEARBY</small>
              <strong>{nearbyPOI.name}</strong>
              <p>Want to hear the story?</p>
            </div>
            <button className="nearby-open" onClick={() => setSelectedPOI(nearbyPOI)}>
              Open
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {!selectedPOI && !showNearby && (
        <section className="ai-dock" aria-label="AI tour guide">
          <button className="ai-bar" onClick={() => alert('AI guide arrives in Phase 3.')}>
            <span className="agent-orb">✦</span>
            <span>
              <small>YOUR LOCAL GUIDE</small>
              <strong>Ask about this area</strong>
            </span>
            <span className="mic" aria-hidden="true">🎙️</span>
          </button>
          <div className="suggestions" aria-label="Quick suggestions">
            <button>30-min tour</button>
            <button>What’s nearby?</button>
            <button>Tell me a story</button>
          </div>
        </section>
      )}

      <div className="app-signature" aria-label="App identity and version"><span>Smart AI Travel by Franklim Herwing</span><span>v0.2.3</span></div>

      <AnimatePresence>
        {selectedPOI && (
          <POIBottomSheet
            poi={selectedPOI}
            position={position}
            nextPOI={nextPOI}
            onNextPOI={() => nextPOI && setSelectedPOI(nextPOI)}
            onClose={() => setSelectedPOI(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
