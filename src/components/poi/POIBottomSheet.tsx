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
  const [expanded, setExpanded] = useState(false);
  const distance = position ? distanceMeters(position.lat, position.lng, poi.lat, poi.lng) : null;
  const walkMinutes = distance !== null && distance < 50000 ? Math.max(1, Math.round(distance / 80)) : null;

  useEffect(() => {
    setExpanded(false);
    return () => window.speechSynthesis?.cancel();
  }, [poi.id]);

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
    const narration = new SpeechSynthesisUtterance(
      `${poi.name}. ${poi.shortDescription} ${poi.longDescription}`
    );
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

      {poi.imageUrl ? (
        <img className="poi-photo" src={poi.imageUrl} alt={poi.name} loading="lazy" />
      ) : (
        <div className="poi-photo-placeholder" aria-hidden="true">
          <span>{poi.emoji}</span>
          <small>Photo coming soon</small>
        </div>
      )}

      <p className="poi-description">{poi.shortDescription}</p>

      <div className="poi-actions">
        <button onClick={listen}>
          <span>{speaking ? '⏸' : '🎧'}</span>
          <strong>{speaking ? 'Stop' : 'Listen'}</strong>
        </button>
        <button onClick={() => setExpanded(value => !value)}>
          <span>📖</span>
          <strong>{expanded ? 'Less' : 'Read'}</strong>
        </button>
        <button onClick={() => alert('AI guide connection arrives in Phase 3.')}>
          <span>✦</span>
          <strong>Ask AI</strong>
        </button>
      </div>

      {expanded && (
        <motion.div
          className="poi-story"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>The story</h3>
          <p>{poi.longDescription}</p>

          <h3>Quick facts</h3>
          <ul>
            {poi.facts.map(fact => <li key={fact}>{fact}</li>)}
          </ul>

          <h3>Sources</h3>
          <div className="poi-sources">
            {poi.sources.map(source => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                {source.label} ↗
              </a>
            ))}
          </div>
        </motion.div>
      )}

      <div className="poi-meta">
        <span>📍 Trigger radius: {poi.triggerRadius} m</span>
        <span>🗺️ Rome demo</span>
      </div>
    </motion.section>
  );
}
