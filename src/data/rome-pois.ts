import type { POI } from '../types/poi';

export const romePOIs: POI[] = [
  {
    id:'colosseum', name:'Colosseum', category:'history', emoji:'🏛️',
    lat:41.8902, lng:12.4922, triggerRadius:90,
    shortDescription:'Rome’s monumental Flavian amphitheatre, opened in the 1st century CE.',
    longDescription:'Construction began under Emperor Vespasian and the amphitheatre was inaugurated under Titus. It hosted spectacles ranging from gladiatorial contests to public entertainments and could hold tens of thousands of spectators. Its scale, layered arches, and complex circulation system made it one of the engineering landmarks of the Roman world.',
    facts:['Also known as the Flavian Amphitheatre.','Its underground hypogeum held animals, scenery, and stage machinery.','It became one of the most recognizable symbols of ancient Rome.'],
    nameEs:"Coliseo", shortDescriptionEs:"El monumental anfiteatro Flavio de Roma, inaugurado en el siglo I d. C.", longDescriptionEs:"La construcción comenzó bajo el emperador Vespasiano y el anfiteatro fue inaugurado bajo Tito. Allí se celebraban espectáculos, desde combates de gladiadores hasta entretenimientos públicos, y podía recibir a decenas de miles de espectadores. Su escala, sus arcos superpuestos y su complejo sistema de circulación lo convirtieron en una de las grandes obras de ingeniería del mundo romano.", factsEs:["También se conoce como Anfiteatro Flavio.","Su hipogeo subterráneo albergaba animales, decorados y maquinaria escénica.","Se convirtió en uno de los símbolos más reconocibles de la antigua Roma."],
    imageUrl:'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    sources:[
      {label:'Parco archeologico del Colosseo',url:'https://colosseo.it/en/'},
      {label:'Encyclopaedia Britannica',url:'https://www.britannica.com/topic/Colosseum'}
    ]
  },
  {
    id:'forum', name:'Roman Forum', category:'history', emoji:'🏺',
    lat:41.8925, lng:12.4853, triggerRadius:100,
    shortDescription:'The political, religious, and commercial heart of ancient Rome.',
    longDescription:'For centuries the Forum was the center of Roman public life. Temples, basilicas, triumphal monuments, and government buildings crowded this valley between the Palatine and Capitoline hills. Walking through it today means moving through layers of Roman political power, religion, law, and memory.',
    facts:['The Via Sacra, or Sacred Way, crossed the Forum.','Roman triumphal processions passed through this area.','Many surviving ruins belong to different centuries of Roman history.'],
    nameEs:"Foro Romano", shortDescriptionEs:"El corazón político, religioso y comercial de la antigua Roma.", longDescriptionEs:"Durante siglos, el Foro fue el centro de la vida pública romana. Templos, basílicas, monumentos triunfales y edificios gubernamentales llenaban este valle entre las colinas Palatina y Capitolina. Recorrerlo hoy permite atravesar capas de poder político, religión, derecho y memoria de Roma.", factsEs:["La Vía Sacra atravesaba el Foro.","Las procesiones triunfales romanas pasaban por esta zona.","Muchas ruinas conservadas pertenecen a distintos siglos de la historia romana."],
    sources:[{label:'Parco archeologico del Colosseo',url:'https://colosseo.it/en/area/the-roman-forum/'}]
  },
  {
    id:'pantheon', name:'Pantheon', category:'architecture', emoji:'🏛️',
    lat:41.8986, lng:12.4769, triggerRadius:70,
    shortDescription:'An exceptionally preserved Roman monument famous for its vast concrete dome.',
    longDescription:'The present Pantheon was rebuilt during the reign of Emperor Hadrian in the 2nd century CE. Its circular rotunda is covered by a massive unreinforced concrete dome with a central oculus open to the sky. The building later became a Christian church, which helped preserve it through the centuries.',
    facts:['The oculus is the only direct source of natural light in the dome.','The height of the interior roughly matches the diameter of the rotunda.','The building has been used continuously for many centuries.'],
    nameEs:"Panteón", shortDescriptionEs:"Un monumento romano excepcionalmente conservado, famoso por su enorme cúpula de hormigón.", longDescriptionEs:"El Panteón actual fue reconstruido durante el reinado del emperador Adriano en el siglo II d. C. Su rotonda circular está cubierta por una enorme cúpula de hormigón no reforzado con un óculo central abierto al cielo. Más tarde se convirtió en iglesia cristiana, lo que ayudó a conservarlo durante siglos.", factsEs:["El óculo es la única fuente directa de luz natural de la cúpula.","La altura interior es aproximadamente igual al diámetro de la rotonda.","El edificio ha permanecido en uso durante muchos siglos."],
    sources:[{label:'Encyclopaedia Britannica',url:'https://www.britannica.com/topic/Pantheon-building-Rome-Italy'}]
  },
  {
    id:'trevi', name:'Trevi Fountain', category:'art', emoji:'⛲',
    lat:41.9009, lng:12.4833, triggerRadius:65,
    shortDescription:'Rome’s theatrical Baroque fountain, completed in the 18th century.',
    longDescription:'The Trevi Fountain forms a monumental stage of water, sculpture, and architecture at the end of the Acqua Vergine aqueduct. Nicola Salvi designed the fountain in the 18th century, and its dramatic central figure of Oceanus is framed by the facade of Palazzo Poli.',
    facts:['It marks the terminal point of an ancient Roman aqueduct route.','A famous tradition is to toss a coin into the fountain.','The fountain combines sculpture, architecture, and moving water into one composition.'],
    nameEs:"Fontana de Trevi", shortDescriptionEs:"La teatral fuente barroca de Roma, terminada en el siglo XVIII.", longDescriptionEs:"La Fontana de Trevi forma un escenario monumental de agua, escultura y arquitectura al final del acueducto Acqua Vergine. Nicola Salvi diseñó la fuente en el siglo XVIII, y la figura central de Océano está enmarcada por la fachada del Palazzo Poli.", factsEs:["Marca el punto final de la ruta de un antiguo acueducto romano.","Una famosa tradición consiste en lanzar una moneda a la fuente.","La fuente combina escultura, arquitectura y agua en movimiento en una sola composición."],
    sources:[{label:'Turismo Roma',url:'https://www.turismoroma.it/en/places/trevi-fountain'}]
  },
  {
    id:'spanish-steps', name:'Spanish Steps', category:'landmark', emoji:'🪜',
    lat:41.9059, lng:12.4823, triggerRadius:75,
    shortDescription:'A monumental staircase connecting Piazza di Spagna with Trinità dei Monti.',
    longDescription:'Built in the 18th century, the Spanish Steps rise from Piazza di Spagna toward the church of Trinità dei Monti. Their terraces, curves, and changing viewpoints make the staircase feel more like an urban stage than a simple route uphill.',
    facts:['The staircase has more than 130 steps.','Its name comes from the nearby Spanish Embassy.','The Barcaccia fountain sits at the foot of the steps.'],
    nameEs:"Escalinata de la Plaza de España", shortDescriptionEs:"Una escalinata monumental que conecta la Piazza di Spagna con Trinità dei Monti.", longDescriptionEs:"Construida en el siglo XVIII, la escalinata asciende desde la Piazza di Spagna hacia la iglesia de Trinità dei Monti. Sus terrazas, curvas y vistas cambiantes hacen que parezca más un escenario urbano que una simple subida.", factsEs:["La escalinata tiene más de 130 peldaños.","Su nombre proviene de la cercana Embajada de España.","La fuente de la Barcaccia se encuentra al pie de la escalinata."],
    sources:[{label:'Turismo Roma',url:'https://www.turismoroma.it/en/places/spanish-steps'}]
  },
  {
    id:'navona', name:'Piazza Navona', category:'art', emoji:'⛲',
    lat:41.8992, lng:12.4731, triggerRadius:100,
    shortDescription:'A Baroque square following the footprint of an ancient Roman stadium.',
    longDescription:'Piazza Navona preserves the long oval shape of the Stadium of Domitian beneath it. In the Baroque period, architects and artists transformed the space with fountains, palaces, and churches. Bernini’s Fountain of the Four Rivers became its visual centerpiece.',
    facts:['The shape of the square follows an ancient stadium.','Bernini designed the Fountain of the Four Rivers.','The square became one of Rome’s great Baroque public spaces.'],
    nameEs:"Piazza Navona", shortDescriptionEs:"Una plaza barroca que sigue la huella de un antiguo estadio romano.", longDescriptionEs:"Piazza Navona conserva la forma ovalada del Estadio de Domiciano que se encuentra debajo. En el período barroco, arquitectos y artistas transformaron el espacio con fuentes, palacios e iglesias. La Fuente de los Cuatro Ríos de Bernini se convirtió en su centro visual.", factsEs:["La forma de la plaza sigue la de un antiguo estadio.","Bernini diseñó la Fuente de los Cuatro Ríos.","La plaza se convirtió en uno de los grandes espacios públicos barrocos de Roma."],
    sources:[{label:'Turismo Roma',url:'https://www.turismoroma.it/en/places/piazza-navona'}]
  },
  {
    id:'castel-sant-angelo', name:"Castel Sant'Angelo", category:'history', emoji:'🏰',
    lat:41.9031, lng:12.4663, triggerRadius:100,
    shortDescription:'Built as Hadrian’s mausoleum and later transformed into a papal fortress.',
    longDescription:'The circular monument began as the mausoleum of Emperor Hadrian in the 2nd century CE. Over time it became a fortress, prison, and papal refuge. Its changing uses make it a compact summary of Rome’s transformation from imperial capital to medieval and papal city.',
    facts:['It began as Emperor Hadrian’s tomb.','A fortified passage connected it with the Vatican area.','Its military role grew during the Middle Ages and Renaissance.'],
    nameEs:"Castel Sant'Angelo", shortDescriptionEs:"Construido como mausoleo de Adriano y posteriormente transformado en fortaleza papal.", longDescriptionEs:"El monumento circular comenzó como mausoleo del emperador Adriano en el siglo II d. C. Con el tiempo se convirtió en fortaleza, prisión y refugio papal. Sus distintos usos resumen la transformación de Roma desde capital imperial hasta ciudad medieval y papal.", factsEs:["Comenzó como tumba del emperador Adriano.","Un pasadizo fortificado lo conectaba con la zona del Vaticano.","Su función militar aumentó durante la Edad Media y el Renacimiento."],
    sources:[{label:'Museo Nazionale di Castel Sant’Angelo',url:'https://direzionemuseiroma.cultura.gov.it/en/castel-santangelo/'}]
  },
  {
    id:'st-peters', name:"St. Peter's Square", category:'religion', emoji:'⛪',
    lat:41.9022, lng:12.4572, triggerRadius:120,
    shortDescription:'Bernini’s grand elliptical piazza at the heart of Vatican City.',
    longDescription:'Gian Lorenzo Bernini designed the great colonnaded square in the 17th century. The curving rows of columns frame pilgrims approaching St. Peter’s Basilica and create a dramatic ceremonial space focused on the church facade and central obelisk.',
    facts:['Bernini designed the famous colonnades.','An ancient Egyptian obelisk stands at the center.','The square is a major gathering place for papal ceremonies.'],
    nameEs:"Plaza de San Pedro", shortDescriptionEs:"La gran plaza elíptica de Bernini en el corazón de la Ciudad del Vaticano.", longDescriptionEs:"Gian Lorenzo Bernini diseñó la gran plaza con columnatas en el siglo XVII. Las filas curvas de columnas enmarcan a los peregrinos que se acercan a la Basílica de San Pedro y crean un espacio ceremonial centrado en la fachada de la iglesia y el obelisco central.", factsEs:["Bernini diseñó las famosas columnatas.","Un antiguo obelisco egipcio se alza en el centro.","La plaza es un importante punto de reunión para ceremonias papales."],
    sources:[{label:'Vatican',url:'https://www.vatican.va/various/basiliche/san_pietro/index_it.html'}]
  }
];
