import { Circle, CircleMarker, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { romePOIs } from '../../data/rome-pois';
import type { UserPosition } from '../../hooks/useGeolocation';
import type { POI } from '../../types/poi';

const ROME: [number, number] = [41.8986, 12.4769];

const poiIcon = (emoji: string) => L.divIcon({
  className: 'poi-marker',
  html: `<span aria-hidden="true">${emoji}</span>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

function MapMotion({
  position,
  romeFocusKey,
  focusedPOI,
}: {
  position: UserPosition | null;
  romeFocusKey: number;
  focusedPOI: POI | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position && romeFocusKey === 0) {
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 15), { duration: 1.2 });
    }
  }, [position, map, romeFocusKey]);

  useEffect(() => {
    if (romeFocusKey > 0) {
      map.flyTo(ROME, 14, { duration: 1.2 });
    }
  }, [romeFocusKey, map]);

  useEffect(() => {
    if (focusedPOI) {
      map.flyTo([focusedPOI.lat, focusedPOI.lng], 16, { duration: 1.1 });
    }
  }, [focusedPOI, map]);

  return null;
}

export function TravelMap({
  position,
  onSelectPOI,
  romeFocusKey,
  focusedPOI,
}: {
  position: UserPosition | null;
  onSelectPOI: (poi: POI) => void;
  romeFocusKey: number;
  focusedPOI: POI | null;
}) {
  return (
    <MapContainer center={ROME} zoom={14} zoomControl={false} attributionControl={false} className="travel-map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {romePOIs.map(poi => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lng]}
          icon={poiIcon(poi.emoji)}
          eventHandlers={{ click: () => onSelectPOI(poi) }}
        />
      ))}
      {position && (
        <>
          <Circle center={[position.lat, position.lng]} radius={position.accuracy} pathOptions={{ color:'#0F766E', fillOpacity:0.08, weight:1 }} />
          <CircleMarker center={[position.lat, position.lng]} radius={9} pathOptions={{ color:'#fff', fillColor:'#0F766E', fillOpacity:1, weight:3 }} />
        </>
      )}
      <MapMotion position={position} romeFocusKey={romeFocusKey} focusedPOI={focusedPOI} />
    </MapContainer>
  );
}
