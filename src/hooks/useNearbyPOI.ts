import { useMemo } from 'react';
import type { UserPosition } from './useGeolocation';
import type { POI } from '../types/poi';
function distanceMeters(aLat:number,aLng:number,bLat:number,bLng:number){const R=6371000,toRad=(v:number)=>v*Math.PI/180,dLat=toRad(bLat-aLat),dLng=toRad(bLng-aLng),x=Math.sin(dLat/2)**2+Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2;return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
export function useNearbyPOI(position:UserPosition|null,pois:POI[]):POI|null{return useMemo(()=>{if(!position)return null;let nearest:{poi:POI;distance:number}|null=null;for(const poi of pois){const distance=distanceMeters(position.lat,position.lng,poi.lat,poi.lng);if(distance<=poi.triggerRadius&&(!nearest||distance<nearest.distance))nearest={poi,distance};}return nearest?.poi??null;},[position,pois]);}
