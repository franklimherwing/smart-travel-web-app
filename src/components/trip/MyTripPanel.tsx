import { motion } from 'framer-motion';
import type { POI } from '../../types/poi';
export function MyTripPanel({pois,onSelect,onClose}:{pois:POI[];onSelect:(p:POI)=>void;onClose:()=>void}){
 return <motion.section className="explore-panel" initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}>
  <header><div><small>MY TRIP</small><h2>Saved places</h2></div><button onClick={onClose}>×</button></header>
  <div className="explore-list">{pois.length?pois.map(p=><button key={p.id} onClick={()=>onSelect(p)}><span>{p.emoji}</span><div><strong>{p.name}</strong><small>{p.category}</small></div><b>→</b></button>):<p className="empty-state">Save places you want to visit and they will appear here.</p>}</div>
 </motion.section>;
}
