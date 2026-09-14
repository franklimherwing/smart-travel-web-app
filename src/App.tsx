import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TravelMap } from './components/map/TravelMap';
import { POIBottomSheet } from './components/poi/POIBottomSheet';
import { useGeolocation } from './hooks/useGeolocation';
import type { POI } from './types/poi';

export default function App() {
  const { position, error } = useGeolocation();
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [romeFocusKey, setRomeFocusKey] = useState(0);

  return (
    <main className="app-shell">
      <TravelMap
        position={position}
        onSelectPOI={setSelectedPOI}
        romeFocusKey={romeFocusKey}
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

      {!selectedPOI && (
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

      <AnimatePresence>
        {selectedPOI && (
          <POIBottomSheet
            poi={selectedPOI}
            position={position}
            onClose={() => setSelectedPOI(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
