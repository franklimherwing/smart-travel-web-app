import type { POI } from '../types/poi';

export type PlaceCategory = 'history' | 'food' | 'stories' | 'facts' | 'nature';

// One public category per place, shared by map, Explore, and place badges.
export function categoryOf(poi: POI): PlaceCategory {
  const text = `${poi.id} ${poi.name} ${poi.nameEs ?? ''} ${poi.shortDescription} ${poi.shortDescriptionEs ?? ''}`;
  if (poi.category === 'food' || /food|market|trattoria|restaurant|cafe|bakery|bread|sweet|comida|mercado|gastronom|panes|🍝|🧺|🥖/i.test(`${text} ${poi.emoji}`)) return 'food';
  if (poi.category === 'nature') return 'nature';
  if (poi.category === 'culture' || /story|stories|tradition|legend|festival|fiesta|folklore|cuento|tradici|leyenda|oral|heritage/i.test(text)) return 'stories';
  if (/demograph|population|poblaci|demograf|census|censo|habitantes|municipality|municipio|department|departamento|economy|economía/i.test(text)) return 'facts';
  return 'history';
}

export const matchesCategory = (poi: POI, category: PlaceCategory) => categoryOf(poi) === category;

export function categoryLabel(category: PlaceCategory, language: string) {
  const labels = language === 'es'
    ? { history: 'Historia', food: 'Comida', stories: 'Historias', facts: 'Datos', nature: 'Naturaleza' }
    : { history: 'History', food: 'Food', stories: 'Stories', facts: 'Facts', nature: 'Nature' };
  return labels[category];
}
