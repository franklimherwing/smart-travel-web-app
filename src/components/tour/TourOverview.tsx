import type { POI } from '../../types/poi';

export function TourOverview({
  stops,
  onStart,
  onClose,
}: {
  stops: POI[];
  onStart: () => void;
  onClose: () => void;
}) {
  return <section className="tour-overview">
    <header><div><small>SMART WALK</small><h2>30-minute tour</h2></div><button onClick={onClose}>×</button></header>
    <p className="tour-summary">{stops.length} stops · about 30 minutes · self-paced</p>
    <ol>{stops.map((poi,i)=><li key={poi.id}><span>{i+1}</span><div><strong>{poi.emoji} {poi.name}</strong><small>{poi.category}</small></div></li>)}</ol>
    <button className="tour-start" onClick={onStart}>Start tour</button>
  </section>;
}
