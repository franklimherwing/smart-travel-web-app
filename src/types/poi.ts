export type POICategory = 'history' | 'architecture' | 'art' | 'religion' | 'landmark';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  emoji: string;
  lat: number;
  lng: number;
  triggerRadius: number;
  shortDescription: string;
}
