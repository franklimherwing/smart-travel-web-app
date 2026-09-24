import { categoryLabel, categoryOf } from '../../data/categories';
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

function formatDistance(meters:number,language:string) {
  if (meters < 1000) return language==='es' ? `${Math.round(meters)} m` : `${Math.round(meters)} m away`;
  const value=(meters/1000).toFixed(meters<10000?1:0);
  return language==='es' ? `${value} km` : `${value} km away`;
}

function buildNarration(poi: POI, language:string) {
  if (language === 'es') return `Bienvenido a ${poi.nameEs ?? poi.name}. ${poi.shortDescriptionEs ?? poi.shortDescription} ${poi.longDescriptionEs ?? poi.longDescription} Datos interesantes: ${(poi.factsEs ?? poi.facts).join('. ')}. Disfruta explorando este lugar.`;
  return `Welcome to ${poi.name}! ${poi.shortDescription} Here's what makes this place special. ${poi.longDescription} A few quick things to notice: ${poi.facts.join('. ')}. Enjoy exploring!`;
}

export function POIBottomSheet({
  poi,
  position,
  nextPOI,
  previousPOI,
  destinationName,
  saved,
  onToggleSaved,
  onAskAI,
  onNextPOI,
  onPreviousPOI,
  onClose,
  tourActive = false,
  language = 'en',
}: {
  poi: POI;
  position: UserPosition | null;
  nextPOI: POI | null;
  previousPOI: POI | null;
  destinationName: string;
  saved: boolean;
  onToggleSaved: () => void;
  onAskAI: () => void;
  onNextPOI: () => void;
  onPreviousPOI: () => void;
  onClose: () => void;
  tourActive?: boolean;
  language?: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [loadingSpeech, setLoadingSpeech] = useState(false);
  const [notice, setNotice] = useState('');
  const [expanded, setExpanded] = useState(false);
  const spanish = poi.shortDescriptionEs && poi.longDescriptionEs && poi.factsEs ? {shortDescription:poi.shortDescriptionEs,longDescription:poi.longDescriptionEs,facts:poi.factsEs} : null;

  const displayName = language === 'es' && poi.nameEs ? poi.nameEs : poi.name;
  const displayShort = language === 'es' ? (spanish?.shortDescription ?? poi.shortDescription) : poi.shortDescription;
  const displayLong = language === 'es' ? (spanish?.longDescription ?? poi.longDescription) : poi.longDescription;
  const displayFacts = language === 'es' ? (spanish?.facts ?? poi.facts) : poi.facts;
  const distance = position ? distanceMeters(position.lat, position.lng, poi.lat, poi.lng) : null;
  const walkMinutes = distance !== null && distance < 50000 ? Math.max(1, Math.round(distance / 80)) : null;

  useEffect(() => {
    const handler = (event: Event) => {
      const state = (event as CustomEvent<{active:boolean;loading:boolean}>).detail;
      setSpeaking(state.active);
      setLoadingSpeech(state.active && state.loading);
    };
    window.addEventListener('smarttravel-speech-state', handler);
    return () => window.removeEventListener('smarttravel-speech-state', handler);
  }, []);

  useEffect(() => {
    setNotice('');
    setExpanded(false);
  }, [poi.id]);

  useEffect(() => {
    if (!speaking) return;
    const progress = getNarrationProgress();
    const narrationPOI = language === 'es' && spanish ? {...poi, shortDescription: spanish.shortDescription, longDescription: spanish.longDescription, facts: spanish.facts} : poi;
    const text = buildNarration(narrationPOI, language);
    speakInstantNarration(text, () => setSpeaking(false), language, progress);
  }, [language]);

  useEffect(() => {
    if (!speaking || tourActive) return;
    const text = buildNarration(poi, language);
    speakInstantNarration(text, () => setSpeaking(false), language);
  }, [poi.id]);

  const listen = async () => {
    if (speaking) {
      stopNaturalNarration();
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }

    const narrationPOI = language === 'es' && spanish ? {...poi, shortDescription: spanish.shortDescription, longDescription: spanish.longDescription, facts: spanish.facts} : poi;
    const text = buildNarration(narrationPOI, language);
    if (!('speechSynthesis' in window)) { setNotice(language==='es'?'Audio no disponible en este navegador.':'Audio is unavailable in this browser.'); return; }
    setNotice('');
    setSpeaking(true);
    setLoadingSpeech(true);
    speakInstantNarration(text, () => setSpeaking(false), language);
  };

  const directions = () => {
    if (!position) {
      setNotice(language==='es'?'GPS no disponible — necesitas tu ubicación para obtener indicaciones.':'GPS unavailable — directions need your location.');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}&travelmode=walking`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) setNotice(language==='es'?'Permite ventanas emergentes para abrir las indicaciones.':'Allow pop-ups to open directions.');
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
          <span className="poi-category">{categoryLabel(categoryOf(poi), language)}</span>
          <h2>{displayName}</h2>
          <p className="poi-distance">
            {distance !== null ? formatDistance(distance, language) : (language === 'es' ? 'Distancia disponible con GPS' : 'Distance available with GPS')}
            {walkMinutes ? (language === 'es' ? ` · aprox. ${walkMinutes} min caminando` : ` · about ${walkMinutes} min walk`) : ''}
          </p>
        </div>
      </div>


      {(previousPOI || nextPOI) && <div className="poi-skip-nav">
        <button onClick={onPreviousPOI} disabled={!previousPOI} aria-label={language==='es'?'Lugar anterior':'Previous place'}>←</button>
        <span>{language==='es'?'Cambiar lugar':'Switch place'}</span>
        <button onClick={onNextPOI} disabled={!nextPOI} aria-label={language==='es'?'Siguiente lugar':'Next place'}>→</button>
      </div>}

      <p className="poi-description">{displayShort}</p>

      <div className="poi-actions four">
        <button onClick={listen} aria-live="polite">
          <span>{speaking ? '⏸' : '🎧'}</span>
          <strong>{loadingSpeech ? (language === 'es' ? 'Cargando…' : 'Loading…') : speaking ? (language === 'es' ? 'Detener' : 'Stop') : (language === 'es' ? 'Escuchar' : 'Listen')}</strong>
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

      {notice && <p className="poi-notice" role="status">{notice}</p>}

      {expanded && (
        <motion.div className="poi-story" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3>{language === 'es' ? 'La historia' : 'The story'}</h3>
          <p>{displayLong}</p>
          <h3>{language === 'es' ? 'Datos interesantes' : 'Quick facts'}</h3>
          <ul>{displayFacts.map(fact => <li key={fact}>{fact}</li>)}</ul>
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
        {position && <span>📍 {language === 'es' ? 'Radio de aviso' : 'Trigger radius'}: {poi.triggerRadius} m</span>}
        <span>🗺️ {destinationName}</span>
      </div>
    </motion.section>
  );
}
