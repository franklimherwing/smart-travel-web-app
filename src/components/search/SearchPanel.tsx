import type { POI } from '../../types/poi';

export function SearchPanel({
  pois,
  query,
  onQuery,
  onSelect,
  onClose,
}: {
  pois: POI[];
  query: string;
  onQuery: (value:string)=>void;
  onSelect: (poi:POI)=>void;
  onClose: ()=>void;
}) {
  const results = pois.filter(p => (p.name+' '+p.category+' '+p.shortDescription).toLowerCase().includes(query.toLowerCase())).slice(0,8);
  return <section className="search-panel">
    <div className="search-row"><input autoFocus value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search places…" /><button onClick={onClose}>×</button></div>
    <div className="search-results">{results.map(p=><button key={p.id} onClick={()=>onSelect(p)}><span>{p.emoji}</span><div><strong>{p.name}</strong><small>{p.category}</small></div></button>)}</div>
  </section>;
}
