import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { POI } from '../../types/poi';
import type { UserPosition } from '../../hooks/useGeolocation';

function distanceMeters(aLat:number, aLng:number, bLat:number, bLng:number) {
  const R = 6371000;
  const toRad = (v:number) => v * Math.PI / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x = Math.sin(dLat/2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng/2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

function formatDistance(meters:number) {
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km away`;
}

export function POIBottomSheet({
  poi,
  position,
  onClose,
}: {
  poi: POI;
  position: UserPosition | null;
  onClose: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const distance = position ? distanceMeters(position.lat, position.lng, poi.lat, poi.lng) : null;
  const walkMinutes = distance !== null && distance < 50000 ? Math.max(1, Math.round(distance / 80)) : null;

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const listen = () => {
    if (!('speechSynthesis' in window)) {
      alert('Audio narration is not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const narration = new SpeechSynthesisUtterance(`${poi.name}. ${poi.shortDescription}`);
    narration.rate = 0.92;
    narration.onend = () => setSpeaking(false);
    narration.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(narration);
  };

  return (
    <motion.section
      className="poi-sheet"
      initial={{ y: '110%' }}
      animate={{ y: 0 }}
      exit={{ y: '110%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      aria-label={`Details for ${poi.name}`}
    >
      <div className="sheet-handle" />
      <button className="sheet-close" onClick={onClose} aria-label="Close place details">×</button>

      <div className="poi-title-row">
        <div className="poi-hero-icon" aria-hidden="true">{poi.emoji}</div>
        <div>
          <span className="poi-category">{poi.category}</span>
          <h2>{poi.name}</h2>
          <p className="poi-distance">
            {distance !== null ? formatDistance(distance) : 'Distance available with GPS'}
            {walkMinutes ? ` · about ${walkMinutes} min walk` : ''}
          </p>
        </div>
      </div>

      <p className="poi-description">{poi.shortDescription}</p>

      <div className="poi-actions">
        <button onClick={listen}>
          <span>{speaking ? '⏸' : '🎧'}</span>
          <strong>{speaking ? 'Stop' : 'Listen'}</strong>
        </button>
        <button onClick={() => alert('Full historical story is the next content step.')}>
          <span>📖</span>
          <strong>Read</strong>
        </button>
        <button onClick={() => alert('AI guide connection arrives in Phase 3.')}>
          <span>✦</span>
          <strong>Ask AI</strong>
        </button>
      </div>

      <div className="poi-meta">
        <span>📍 Trigger radius: {poi.triggerRadius} m</span>
        <span>🗺️ Demo content</span>
      </div>
    </motion.section>
  );
}
