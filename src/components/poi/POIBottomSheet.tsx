import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { POI } from '../../types/poi';
import type { UserPosition } from '../../hooks/useGeolocation';
import { getNarrationProgress, speakInstantNarration, stopNaturalNarration } from '../../services/naturalTTS';

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

function spanishText(text:string) {
  const dictionary:Record<string,string> = {
    'history':'historia','architecture':'arquitectura','art':'arte','religion':'religión','landmark':'lugar emblemático','nature':'naturaleza','food':'comida','culture':'cultura'
  };
  return dictionary[text.toLowerCase()] || text;
}
function buildNarration(poi: POI, language:string) {
  if (language === 'es') return `Bienvenido a ${poi.name}. ${poi.shortDescription} ${poi.longDescription} Datos interesantes: ${poi.facts.join('. ')}. Disfruta explorando este lugar.`;
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
  language = 'en',
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
  language?: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [spanish, setSpanish] = useState<{shortDescription:string;longDescription:string;facts:string[]}|null>(null);
  useEffect(() => {
    if (poi.shortDescriptionEs && poi.longDescriptionEs && poi.factsEs) {
      setSpanish({shortDescription:poi.shortDescriptionEs,longDescription:poi.longDescriptionEs,facts:poi.factsEs});
      return;
    }
    const cacheKey = `smarttravel-es-${poi.id}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setSpanish(JSON.parse(cached)); return; }
    } catch {}
    setSpanish(null);
    fetch('/api/translate-poi',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:poi.name,shortDescription:poi.shortDescription,longDescription:poi.longDescription,facts:poi.facts})})
      .then(async res => { if(!res.ok) throw new Error(await res.text()); return res.json(); })
      .then(data => { setSpanish(data); try { localStorage.setItem(cacheKey,JSON.stringify(data)); } catch {} })
      .catch(() => setSpanish(null));
  }, [poi.id]);

  const displayName = language === 'es' && poi.nameEs ? poi.nameEs : poi.name;
  const displayShort = language === 'es' && spanish ? spanish.shortDescription : poi.shortDescription;
  const displayLong = language === 'es' && spanish ? spanish.longDescription : poi.longDescription;
  const displayFacts = language === 'es' && spanish ? spanish.facts : poi.facts;
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

  useEffect(() => {
    if (!speaking) return;
    const progress = getNarrationProgress();
    const narrationPOI = language === 'es' && spanish ? {...poi, shortDescription: spanish.shortDescription, longDescription: spanish.longDescription, facts: spanish.facts} : poi;
    const text = buildNarration(narrationPOI, language);
    speakInstantNarration(text, () => setSpeaking(false), language, progress);
  }, [language]);

  const listen = async () => {
    if (speaking) {
      stopNaturalNarration();
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }

    const narrationPOI = language === 'es' && spanish ? {...poi, shortDescription: spanish.shortDescription, longDescription: spanish.longDescription, facts: spanish.facts} : poi;
    const text = buildNarration(narrationPOI, language);
    setSpeaking(true);

    speakInstantNarration(text, () => setSpeaking(false), language);
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
          <span className="poi-category">{language === 'es' ? spanishText(poi.category) : poi.category}</span>
          <h2>{displayName}</h2>
          <p className="poi-distance">
            {distance !== null ? formatDistance(distance) : (language === 'es' ? 'Distancia disponible con GPS' : 'Distance available with GPS')}
            {walkMinutes ? (language === 'es' ? ` · aprox. ${walkMinutes} min caminando` : ` · about ${walkMinutes} min walk`) : ''}
          </p>
        </div>
      </div>

      {poi.imageUrl ? (
        <img className="poi-photo" src={poi.imageUrl} alt={poi.name} loading="lazy" />
      ) : (
        <div className="poi-photo-placeholder" aria-hidden="true">
          <span>{poi.emoji}</span>
          <small>{language === 'es' ? 'Foto próximamente' : 'Photo coming soon'}</small>
        </div>
      )}

      <p className="poi-description">{language === 'es' && !spanish ? 'Traduciendo…' : displayShort}</p>

      <div className="poi-actions four">
        <button onClick={listen}>
          <span>{speaking ? '⏸' : '🎧'}</span>
          <strong>{speaking ? (language === 'es' ? 'Detener' : 'Stop') : (language === 'es' ? 'Escuchar' : 'Listen')}</strong>
        </button>
        <button onClick={() => setExpanded(value => !value)}>
          <span>📖</span>
          <strong>{expanded ? (language === 'es' ? 'Menos' : 'Less') : (language === 'es' ? 'Historia' : 'Full Story')}</strong>
        </button>
        <button onClick={onAskAI}>
          <span>✦</span>
          <strong>{language === 'es' ? 'Preguntar IA' : 'Ask AI'}</strong>
        </button>
        <button onClick={directions}>
          <span>↗</span>
          <strong>{language === 'es' ? 'Cómo llegar' : 'Directions'}</strong>
        </button>
      </div>

      {expanded && (
        <motion.div className="poi-story" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3>{language === 'es' ? 'La historia' : 'The story'}</h3>
          <p>{language === 'es' && !spanish ? 'Traduciendo…' : displayLong}</p>
          <h3>{language === 'es' ? 'Datos interesantes' : 'Quick facts'}</h3>
          <ul>{(language === 'es' && !spanish ? [] : displayFacts).map(fact => <li key={fact}>{fact}</li>)}</ul>
          <h3>{language === 'es' ? 'Fuentes' : 'Sources'}</h3>
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
            <small>{language === 'es' ? 'PRÓXIMA PARADA CERCANA' : 'NEXT NEARBY STOP'}</small>
            <strong>{nextPOI.emoji} {language === 'es' && nextPOI.nameEs ? nextPOI.nameEs : nextPOI.name}</strong>
            <em>{language === 'es' ? 'Toca para ir allí y abrir su historia' : 'Tap to fly there and open its story'}</em>
          </div>
          <b>→</b>
        </button>
      )}

      <div className="poi-meta">
        <span>📍 {language === 'es' ? 'Radio de aviso' : 'Trigger radius'}: {poi.triggerRadius} m</span>
        <span>🗺️ {destinationName}</span>
      </div>
    </motion.section>
  );
}
