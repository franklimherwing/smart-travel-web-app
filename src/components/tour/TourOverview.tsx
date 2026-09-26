import type { POI } from '../../types/poi';
import { categoryLabel, categoryOf } from '../../data/categories';
import { routeDistanceKm,walkingMinutes } from '../../utils/tour';
import { t } from '../../i18n';
export function TourOverview({stops,onStart,onClose,language='en',minutes,onMinutes,elevation='flat'}:{stops:POI[];onStart:()=>void;onClose:()=>void;language?:string;minutes:number;onMinutes:(n:number)=>void;elevation?:'flat'|'hilly'}) {
 const km=routeDistanceKm(stops), walk=walkingMinutes(km), estimated=Math.max(minutes,stops.length*8);
 return <section className="tour-overview"><header><div><small>{t(language,'smartWalk').toUpperCase()}</small><h2>{t(language,'tourName',{city:language==='es'?'tu destino':'your destination'})}</h2></div><button onClick={onClose}>×</button></header>
 <div className="tour-time-picker"><strong>{t(language,'timeAvailable')}</strong><div>{[15,30,45,60,90].map(n=><button key={n} className={minutes===n?'active':''} onClick={()=>onMinutes(n)}>{n} {t(language,'minutes')}</button>)}</div></div>
 <p className="tour-summary">{stops.length} {language==='es'?'paradas':'stops'} · {t(language,'fitsIn',{n:estimated})}</p>
 <div className="tour-metrics"><span>📏 {t(language,'distance',{n:km.toFixed(1)})}</span><span>🚶 {t(language,'walkTime',{n:walk})}</span><span>↕ {t(language,'elevation')}: {t(language,elevation)}</span><span>♿ {t(language,'stepFree')}: {t(language,'unknown')}</span></div>
 <ol>{stops.map((p,i)=><li key={p.id}><span>{i+1}</span><div><strong>{p.emoji} {language==='es'?(p.nameEs??p.name):p.name}</strong><small>{categoryLabel(categoryOf(p),language)}</small></div></li>)}</ol><button className="tour-start" onClick={onStart}>{language==='es'?'Comenzar tour':'Start tour'}</button></section>;
}