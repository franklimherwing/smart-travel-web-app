import { Circle, CircleMarker, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { romePOIs } from '../../data/rome-pois';
import { guatemalaCityPOIs, zacapaPOIs } from '../../data/guatemala-pois';
import type { UserPosition } from '../../hooks/useGeolocation';
import type { POI } from '../../types/poi';

type Demo='rome'|'guatemala'|'zacapa';
const CENTERS:Record<Demo,{center:[number,number],zoom:number}> = {
 rome:{center:[41.8986,12.4769],zoom:14},
 guatemala:{center:[14.6418,-90.5137],zoom:13},
 zacapa:{center:[14.985,-89.55],zoom:12}
};

// Compact, clean map bubbles using each place's own simple pictogram.
const poiIcon=(poi:POI)=>L.divIcon({
 className:'poi-marker poi-marker--compact',
 html:`<span aria-hidden="true">${poi.emoji}</span>`,
 iconSize:[30,30],
 iconAnchor:[15,15]
});

function MapMotion({position,demo,demoFocusKey,focusedPOI}:{position:UserPosition|null;demo:Demo;demoFocusKey:number;focusedPOI:POI|null}) {
 const map=useMap();
 useEffect(()=>{ if(position && demoFocusKey===0) map.flyTo([position.lat,position.lng],Math.max(map.getZoom(),15),{duration:1.2}); },[position,map,demoFocusKey]);
 useEffect(()=>{ if(demoFocusKey>0){const d=CENTERS[demo];map.flyTo(d.center,d.zoom,{duration:1.2});}},[demo,demoFocusKey,map]);
 useEffect(()=>{if(focusedPOI)map.flyTo([focusedPOI.lat,focusedPOI.lng],16,{duration:1.1});},[focusedPOI,map]);
 return null;
}
export function TravelMap({position,onSelectPOI,demo,demoFocusKey,focusedPOI}:{position:UserPosition|null;onSelectPOI:(poi:POI)=>void;demo:Demo;demoFocusKey:number;focusedPOI:POI|null}) {
 const pois=demo==='guatemala'?guatemalaCityPOIs:demo==='zacapa'?zacapaPOIs:romePOIs;
 return <MapContainer center={CENTERS.rome.center} zoom={14} zoomControl={false} attributionControl={false} className="travel-map">
  <TileLayer attribution="&copy; CARTO &copy; OpenStreetMap contributors" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"/>
  {pois.map(p=><Marker key={p.id} position={[p.lat,p.lng]} icon={poiIcon(p)} eventHandlers={{click:()=>onSelectPOI(p)}}/>)}
  {position&&<><Circle center={[position.lat,position.lng]} radius={position.accuracy} pathOptions={{color:'#555',fillColor:'#777',fillOpacity:.05,weight:1}}/>
  <CircleMarker center={[position.lat,position.lng]} radius={8} pathOptions={{color:'#fff',fillColor:'#333',fillOpacity:1,weight:3}}/></>}
  <MapMotion position={position} demo={demo} demoFocusKey={demoFocusKey} focusedPOI={focusedPOI}/>
 </MapContainer>;
}
