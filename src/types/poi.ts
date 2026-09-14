export type POICategory = 'history' | 'architecture' | 'art' | 'religion' | 'landmark';

export interface POISource {
  label: string;
  url: string;
}

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  emoji: string;
  lat: number;
  lng: number;
  triggerRadius: number;
  shortDescription: string;
  longDescription: string;
  facts: string[];
  imageUrl?: string;
  sources: POISource[];
}
