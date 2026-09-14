import type { POI } from '../types/poi';

export const romePOIs: POI[] = [
  { id:'colosseum', name:'Colosseum', category:'history', emoji:'🏛️', lat:41.8902, lng:12.4922, triggerRadius:90, shortDescription:'Rome’s monumental Flavian amphitheatre, opened in the 1st century CE.' },
  { id:'forum', name:'Roman Forum', category:'history', emoji:'🏺', lat:41.8925, lng:12.4853, triggerRadius:100, shortDescription:'The political, religious, and commercial heart of ancient Rome.' },
  { id:'pantheon', name:'Pantheon', category:'architecture', emoji:'🏛️', lat:41.8986, lng:12.4769, triggerRadius:70, shortDescription:'An exceptionally preserved Roman monument famous for its vast concrete dome.' },
  { id:'trevi', name:'Trevi Fountain', category:'art', emoji:'⛲', lat:41.9009, lng:12.4833, triggerRadius:65, shortDescription:'Rome’s theatrical Baroque fountain, completed in the 18th century.' },
  { id:'spanish-steps', name:'Spanish Steps', category:'landmark', emoji:'🪜', lat:41.9059, lng:12.4823, triggerRadius:75, shortDescription:'A monumental staircase connecting Piazza di Spagna with Trinità dei Monti.' },
  { id:'navona', name:'Piazza Navona', category:'art', emoji:'⛲', lat:41.8992, lng:12.4731, triggerRadius:100, shortDescription:'A Baroque square following the footprint of an ancient Roman stadium.' },
  { id:'castel-sant-angelo', name:"Castel Sant'Angelo", category:'history', emoji:'🏰', lat:41.9031, lng:12.4663, triggerRadius:100, shortDescription:'Built as Hadrian’s mausoleum and later transformed into a papal fortress.' },
  { id:'st-peters', name:"St. Peter's Square", category:'religion', emoji:'⛪', lat:41.9022, lng:12.4572, triggerRadius:120, shortDescription:'Bernini’s grand elliptical piazza at the heart of Vatican City.' }
];
