import { motion } from 'framer-motion';
import type { POI } from '../../types/poi';

type Mode='all'|'history'|'food'|'local'|'nature';
export function ExplorePanel({pois,savedIds,onSelect,onClose}:{pois:POI[];savedIds:string[];onSelect:(p:POI)=>void;onClose:()=>void}){
 const [mode,setMode]=React.useState<Mode>('all');
 const shown=pois.filter(p=>mode==='all'||(mode==='history'&&['history','architecture','religion','landmark'].includes(p.category))||(mode==='food'&&p.category==='food')||(mode==='nature'&&p.category==='nature')||(mode==='local'&&['culture','food','landmark'].includes(p.category)));
 return <motion.section className="explore-panel" initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}>
  <header><div><small>EXPLORE</small><h2>Places around you</h2></div><button onClick={onClose}>×</button></header>
  <div className="explore-filters">{(['all','history','food','local','nature'] as Mode[]).map(m=><button className={mode===m?'active':''} onClick={()=>setMode(m)} key={m}>{m==='all'?'All':m[0].toUpperCase()+m.slice(1)}</button>)}</div>
  <div className="explore-list">{shown.map(p=><button key={p.id} onClick={()=>onSelect(p)}><span>{p.emoji}</span><div><strong>{p.name}</strong><small>{p.category}{savedIds.includes(p.id)?' · ★ saved':''}</small></div><b>→</b></button>)}</div>
 </motion.section>;
}
import React from 'react';
