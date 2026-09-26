export type Language = 'en' | 'es';
const strings = {
  en: {
    fitsIn:'Fits in ~{n} min', distance:'{n} km', walkTime:'~{n} min walking', flat:'Flat', hilly:'Hilly', unknown:'Unknown',
    stepFree:'Step-free', yes:'Yes', no:'No', timeAvailable:'Time available', minutes:'min', nextStop:'Next stop', details:'Details',
    resume:'Resume your {name} at stop {n}?', resumeAction:'Resume', dismiss:'Dismiss', goodToKnow:'Good to know', emergency:'Emergency',
    health:'Pharmacy / hospital', comfort:'Restroom / café tip', surprise:'Surprise me', storyHelpful:'Was this story helpful?',
    thanksFeedback:'Thanks for the feedback', darkMode:'Dark mode', kidMode:'Kid mode', settings:'Settings', kidFact:'Fun fact',
    englishOnly:'English only', mapTools:'Map tools', search:'Search', cameraGuide:'Camera guide', audioMode:'Audio mode', chooseVoice:'Choose voice', guideLanguage:'Guide language', demoDestinations:'Demo destinations', nearby:'YOU’RE NEARBY', hearStory:'Want to hear the story?', open:'Open', cameraAI:'Camera AI',
    smartWalk:'Smart walk', tourName:'{city} walk', routeInfo:'Route', elevation:'Walking difficulty', access:'Accessibility'
  },
  es: {
    fitsIn:'Cabe en ~{n} min', distance:'{n} km', walkTime:'~{n} min caminando', flat:'Plano', hilly:'Con cuestas', unknown:'Desconocido',
    stepFree:'Sin escalones', yes:'Sí', no:'No', timeAvailable:'Tiempo disponible', minutes:'min', nextStop:'Próxima parada', details:'Detalles',
    resume:'¿Continuar tu {name} en la parada {n}?', resumeAction:'Continuar', dismiss:'Descartar', goodToKnow:'Información útil', emergency:'Emergencias',
    health:'Farmacia / hospital', comfort:'Consejo de baño / café', surprise:'Sorpréndeme', storyHelpful:'¿Te ayudó esta historia?',
    thanksFeedback:'Gracias por tu opinión', darkMode:'Modo oscuro', kidMode:'Modo niños', settings:'Ajustes', kidFact:'Dato divertido',
    englishOnly:'Solo en inglés', mapTools:'Herramientas del mapa', search:'Buscar', cameraGuide:'Guía con cámara', audioMode:'Modo de audio', chooseVoice:'Elegir voz', guideLanguage:'Idioma del guía', demoDestinations:'Destinos de demostración', nearby:'ESTÁS CERCA', hearStory:'¿Quieres escuchar la historia?', open:'Abrir', cameraAI:'Cámara IA',
    smartWalk:'Paseo inteligente', tourName:'Paseo por {city}', routeInfo:'Ruta', elevation:'Dificultad al caminar', access:'Accesibilidad'
  }
} as const;
export type I18nKey = keyof typeof strings.en;
export function t(language:string,key:I18nKey,vars:Record<string,string|number>={}) {
  let value:string=(language==='es'?strings.es:strings.en)[key];
  for (const [name,replacement] of Object.entries(vars)) value=value.replace('{'+name+'}',String(replacement));
  return value;
}
