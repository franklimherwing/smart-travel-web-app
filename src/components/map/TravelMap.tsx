import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { romePOIs } from '../../data/rome-pois';
import type { UserPosition } from '../../hooks/useGeolocation';

const ROME: [number, number] = [41.8986, 12.4769];

const poiIcon = (emoji: string) => L.divIcon({
  className: 'poi-marker',
  html: `<span aria-hidden="true">${emoji}</span>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

function FollowUser({ position }: { position: UserPosition | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 15), { duration: 1.2 });
  }, [position, map]);
  return null;
}

export function TravelMap({ position }: { position: UserPosition | null }) {
  return (
    <MapContainer center={ROME} zoom={14} zoomControl={false} attributionControl={false} className="travel-map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {romePOIs.map(poi => (
        <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={poiIcon(poi.emoji)}>
          <Popup>
            <strong>{poi.name}</strong><br />{poi.shortDescription}
          </Popup>
        </Marker>
      ))}
      {position && (
        <>
          <Circle center={[position.lat, position.lng]} radius={position.accuracy} pathOptions={{ color:'#0F766E', fillOpacity:0.08, weight:1 }} />
          <CircleMarker center={[position.lat, position.lng]} radius={9} pathOptions={{ color:'#fff', fillColor:'#0F766E', fillOpacity:1, weight:3 }} />
        </>
      )}
      <FollowUser position={position} />
    </MapContainer>
  );
}
