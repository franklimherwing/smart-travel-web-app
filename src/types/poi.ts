export type POICategory = 'history' | 'architecture' | 'art' | 'religion' | 'landmark' | 'nature' | 'food' | 'culture';

export interface POISource {
  label: string;
  url: string;
}

export interface POI {
  id: string;
  name: string;
  nameEs?: string;
  category: POICategory;
  emoji: string;
  lat: number;
  lng: number;
  triggerRadius: number;
  shortDescription: string;
  longDescription: string;
  facts: string[];
  shortDescriptionEs?: string;
  longDescriptionEs?: string;
  factsEs?: string[];
  imageUrl?: string;
  sources: POISource[];
}
