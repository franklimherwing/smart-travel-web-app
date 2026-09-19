import { motion } from 'framer-motion';
export function CameraGuide({onClose,onAsk}:{onClose:()=>void;onAsk:(q:string)=>void}){
 return <motion.section className="camera-guide" initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}>
  <header><div><small>CAMERA AI</small><h2>What am I looking at?</h2></div><button onClick={onClose}>×</button></header>
  <div className="camera-body"><div className="camera-icon">📷</div><p>Take a photo with your iPhone, then ask Smart AI Travel about the building, artwork, monument, menu, or object.</p><label className="camera-button">Take or choose photo<input type="file" accept="image/*" capture="environment"/></label><button className="secondary-action" onClick={()=>onAsk('Help me identify and understand what I am looking at. Use my current location as context, and tell me what details I should look for.')}>Ask with location context</button><small>Photo understanding is being prepared; this release adds the camera workflow and location-aware guide entry point.</small></div>
 </motion.section>;
}
