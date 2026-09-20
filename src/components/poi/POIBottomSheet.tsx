import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { POI } from '../../types/poi';
import type { UserPosition } from '../../hooks/useGeolocation';
import { playNaturalNarration, stopNaturalNarration } from '../../services/naturalTTS';

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

function buildNarration(poi: POI) {
  return `Welcome to ${poi.name}! ${poi.shortDescription} Here's what makes this place special. ${poi.longDescription} A few quick things to notice: ${poi.facts.join('. ')}. Enjoy exploring!`;
}

function browserFallback(text:string, onEnd:()=>void) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const narration = new SpeechSynthesisUtterance(text);
  narration.rate = 1.08;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /Samantha|Google US English|Microsoft Aria|Karen|Daniel/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en'));
  if (preferred) narration.voice = preferred;
  narration.onend = onEnd;
  narration.onerror = onEnd;
  window.speechSynthesis.speak(narration);
}

export function POIBottomSheet({
  poi,
  position,
  nextPOI,
  destinationName,
  saved,
  onToggleSaved,
  onAskAI,
  onNextPOI,
  onClose,
  tourActive = false,
}: {
  poi: POI;
  position: UserPosition | null;
  nextPOI: POI | null;
  destinationName: string;
  saved: boolean;
  onToggleSaved: () => void;
  onAskAI: () => void;
  onNextPOI: () => void;
  onClose: () => void;
  tourActive?: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const distance = position ? distanceMeters(position.lat, position.lng, poi.lat, poi.lng) : null;
  const walkMinutes = distance !== null && distance < 50000 ? Math.max(1, Math.round(distance / 80)) : null;

  useEffect(() => {
    setExpanded(false);
    return () => {
      if (!tourActive) {
        stopNaturalNarration();
        window.speechSynthesis?.cancel();
      }
    };
  }, [poi.id, tourActive]);

  const listen = async () => {
    if (speaking) {
      stopNaturalNarration();
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }

    const text = buildNarration(poi);
    setSpeaking(true);

    try {
      await playNaturalNarration(text, () => setSpeaking(false));
    } catch {
      browserFallback(text, () => setSpeaking(false));
    }
  };

  const directions = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}&travelmode=walking`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
      <button className={`favorite-corner ${saved ? "saved" : ""}`} onClick={onToggleSaved} aria-label={saved ? "Remove from favorites" : "Add to favorites"}>{saved ? "★" : "☆"}</button>
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

      <div className="poi-actions four">
        <button onClick={listen}>
          <span>{speaking ? '⏸' : '🎧'}</span>
          <strong>{speaking ? 'Stop' : 'Listen'}</strong>
        </button>
        <button onClick={() => setExpanded(value => !value)}>
          <span>📖</span>
          <strong>{expanded ? 'Less' : 'Full Story'}</strong>
        </button>
        <button onClick={onAskAI}>
          <span>✦</span>
          <strong>Ask AI</strong>
        </button>
        <button onClick={directions}>
          <span>↗</span>
          <strong>Directions</strong>
        </button>
      </div>

      {expanded && (
        <motion.div className="poi-story" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3>The story</h3>
          <p>{poi.longDescription}</p>
          <h3>Quick facts</h3>
          <ul>{poi.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>
          <h3>Sources</h3>
          <div className="poi-sources">
            {poi.sources.map(source => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
            ))}
          </div>
        </motion.div>
      )}

      {nextPOI && (
        <button className="next-stop-card next-stop-button" onClick={onNextPOI}>
          <span>🧭</span>
          <div>
            <small>NEXT NEARBY STOP</small>
            <strong>{nextPOI.emoji} {nextPOI.name}</strong>
            <em>Tap to fly there and open its story</em>
          </div>
          <b>→</b>
        </button>
      )}

      <div className="poi-meta">
        <span>📍 Trigger radius: {poi.triggerRadius} m</span>
        <span>🗺️ {destinationName}</span>
      </div>
    </motion.section>
  );
}
