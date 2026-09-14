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
const poiIcon=(emoji:string)=>L.divIcon({className:'poi-marker',html:`<span aria-hidden="true">${emoji}</span>`,iconSize:[44,44],iconAnchor:[22,22]});

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
  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
  {pois.map(p=><Marker key={p.id} position={[p.lat,p.lng]} icon={poiIcon(p.emoji)} eventHandlers={{click:()=>onSelectPOI(p)}}/>)}
  {position&&<><Circle center={[position.lat,position.lng]} radius={position.accuracy} pathOptions={{color:'#0F766E',fillOpacity:.08,weight:1}}/>
  <CircleMarker center={[position.lat,position.lng]} radius={9} pathOptions={{color:'#fff',fillColor:'#0F766E',fillOpacity:1,weight:3}}/></>}
  <MapMotion position={position} demo={demo} demoFocusKey={demoFocusKey} focusedPOI={focusedPOI}/>
 </MapContainer>;
}
