import type { POI } from '../types/poi';

const categoryEs:Record<string,string>={history:'historia',architecture:'arquitectura',art:'arte',religion:'religión',landmark:'lugar emblemático',nature:'naturaleza',food:'gastronomía',culture:'cultura'};

const phraseRules:[RegExp,string][]=[
[/Rome/gi,'Roma'],[/Guatemala City/gi,'Ciudad de Guatemala'],[/Zacapa Department/gi,'departamento de Zacapa'],[/Zacapa/gi,'Zacapa'],
[/ancient/gi,'antiguo'],[/historic/gi,'histórico'],[/history/gi,'historia'],[/museum/gi,'museo'],[/church/gi,'iglesia'],[/cathedral/gi,'catedral'],[/square/gi,'plaza'],[/market/gi,'mercado'],[/river/gi,'río'],[/valley/gi,'valle'],[/mountain/gi,'montaña'],[/park/gi,'parque'],[/food/gi,'comida'],[/culture/gi,'cultura'],[/local/gi,'local'],[/traditional/gi,'tradicional'],[/tradition/gi,'tradición'],[/people/gi,'personas'],[/city/gi,'ciudad'],[/village/gi,'aldea'],[/railway/gi,'ferrocarril'],[/water/gi,'agua'],[/view/gi,'vista'],[/art/gi,'arte'],[/story/gi,'historia'],[/stories/gi,'historias'],[/natural/gi,'natural'],[/family/gi,'familia'],[/families/gi,'familias'],[/religious/gi,'religioso'],[/public/gi,'público'],[/center/gi,'centro'],[/central/gi,'central']
];

function instantSpanish(text:string){
  let out=text;
  for(const [pattern,replacement] of phraseRules) out=out.replace(pattern,replacement);
  return out;
}

/**
 * Guarantees every bundled POI has immediate offline Spanish fields.
 * Hand-written Spanish already stored on a POI always wins. The fallback
 * keeps Español instant while remaining legacy records are curated.
 */
export function withSpanish(poi:POI):POI{
  return {
    ...poi,
    nameEs:poi.nameEs ?? instantSpanish(poi.name),
    shortDescriptionEs:poi.shortDescriptionEs ?? instantSpanish(poi.shortDescription),
    longDescriptionEs:poi.longDescriptionEs ?? instantSpanish(poi.longDescription),
    factsEs:poi.factsEs ?? poi.facts.map(instantSpanish),
  };
}
export function withSpanishPOIs(pois:POI[]):POI[]{ return pois.map(withSpanish); }
