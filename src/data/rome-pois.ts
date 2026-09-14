import type { POI } from '../types/poi';

export const romePOIs: POI[] = [
  {
    id:'colosseum', name:'Colosseum', category:'history', emoji:'🏛️',
    lat:41.8902, lng:12.4922, triggerRadius:90,
    shortDescription:'Rome’s monumental Flavian amphitheatre, opened in the 1st century CE.',
    longDescription:'Construction began under Emperor Vespasian and the amphitheatre was inaugurated under Titus. It hosted spectacles ranging from gladiatorial contests to public entertainments and could hold tens of thousands of spectators. Its scale, layered arches, and complex circulation system made it one of the engineering landmarks of the Roman world.',
    facts:['Also known as the Flavian Amphitheatre.','Its underground hypogeum held animals, scenery, and stage machinery.','It became one of the most recognizable symbols of ancient Rome.'],
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
    sources:[{label:'Parco archeologico del Colosseo',url:'https://colosseo.it/en/area/the-roman-forum/'}]
  },
  {
    id:'pantheon', name:'Pantheon', category:'architecture', emoji:'🏛️',
    lat:41.8986, lng:12.4769, triggerRadius:70,
    shortDescription:'An exceptionally preserved Roman monument famous for its vast concrete dome.',
    longDescription:'The present Pantheon was rebuilt during the reign of Emperor Hadrian in the 2nd century CE. Its circular rotunda is covered by a massive unreinforced concrete dome with a central oculus open to the sky. The building later became a Christian church, which helped preserve it through the centuries.',
    facts:['The oculus is the only direct source of natural light in the dome.','The height of the interior roughly matches the diameter of the rotunda.','The building has been used continuously for many centuries.'],
    sources:[{label:'Encyclopaedia Britannica',url:'https://www.britannica.com/topic/Pantheon-building-Rome-Italy'}]
  },
  {
    id:'trevi', name:'Trevi Fountain', category:'art', emoji:'⛲',
    lat:41.9009, lng:12.4833, triggerRadius:65,
    shortDescription:'Rome’s theatrical Baroque fountain, completed in the 18th century.',
    longDescription:'The Trevi Fountain forms a monumental stage of water, sculpture, and architecture at the end of the Acqua Vergine aqueduct. Nicola Salvi designed the fountain in the 18th century, and its dramatic central figure of Oceanus is framed by the facade of Palazzo Poli.',
    facts:['It marks the terminal point of an ancient Roman aqueduct route.','A famous tradition is to toss a coin into the fountain.','The fountain combines sculpture, architecture, and moving water into one composition.'],
    sources:[{label:'Turismo Roma',url:'https://www.turismoroma.it/en/places/trevi-fountain'}]
  },
  {
    id:'spanish-steps', name:'Spanish Steps', category:'landmark', emoji:'🪜',
    lat:41.9059, lng:12.4823, triggerRadius:75,
    shortDescription:'A monumental staircase connecting Piazza di Spagna with Trinità dei Monti.',
    longDescription:'Built in the 18th century, the Spanish Steps rise from Piazza di Spagna toward the church of Trinità dei Monti. Their terraces, curves, and changing viewpoints make the staircase feel more like an urban stage than a simple route uphill.',
    facts:['The staircase has more than 130 steps.','Its name comes from the nearby Spanish Embassy.','The Barcaccia fountain sits at the foot of the steps.'],
    sources:[{label:'Turismo Roma',url:'https://www.turismoroma.it/en/places/spanish-steps'}]
  },
  {
    id:'navona', name:'Piazza Navona', category:'art', emoji:'⛲',
    lat:41.8992, lng:12.4731, triggerRadius:100,
    shortDescription:'A Baroque square following the footprint of an ancient Roman stadium.',
    longDescription:'Piazza Navona preserves the long oval shape of the Stadium of Domitian beneath it. In the Baroque period, architects and artists transformed the space with fountains, palaces, and churches. Bernini’s Fountain of the Four Rivers became its visual centerpiece.',
    facts:['The shape of the square follows an ancient stadium.','Bernini designed the Fountain of the Four Rivers.','The square became one of Rome’s great Baroque public spaces.'],
    sources:[{label:'Turismo Roma',url:'https://www.turismoroma.it/en/places/piazza-navona'}]
  },
  {
    id:'castel-sant-angelo', name:"Castel Sant'Angelo", category:'history', emoji:'🏰',
    lat:41.9031, lng:12.4663, triggerRadius:100,
    shortDescription:'Built as Hadrian’s mausoleum and later transformed into a papal fortress.',
    longDescription:'The circular monument began as the mausoleum of Emperor Hadrian in the 2nd century CE. Over time it became a fortress, prison, and papal refuge. Its changing uses make it a compact summary of Rome’s transformation from imperial capital to medieval and papal city.',
    facts:['It began as Emperor Hadrian’s tomb.','A fortified passage connected it with the Vatican area.','Its military role grew during the Middle Ages and Renaissance.'],
    sources:[{label:'Museo Nazionale di Castel Sant’Angelo',url:'https://direzionemuseiroma.cultura.gov.it/en/castel-santangelo/'}]
  },
  {
    id:'st-peters', name:"St. Peter's Square", category:'religion', emoji:'⛪',
    lat:41.9022, lng:12.4572, triggerRadius:120,
    shortDescription:'Bernini’s grand elliptical piazza at the heart of Vatican City.',
    longDescription:'Gian Lorenzo Bernini designed the great colonnaded square in the 17th century. The curving rows of columns frame pilgrims approaching St. Peter’s Basilica and create a dramatic ceremonial space focused on the church facade and central obelisk.',
    facts:['Bernini designed the famous colonnades.','An ancient Egyptian obelisk stands at the center.','The square is a major gathering place for papal ceremonies.'],
    sources:[{label:'Vatican',url:'https://www.vatican.va/various/basiliche/san_pietro/index_it.html'}]
  }
];
