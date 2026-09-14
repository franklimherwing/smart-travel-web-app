import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { askGuide, type GuideContext } from '../../services/guideAI';

export function GuideChat({
  context,
  onClose,
}: {
  context: GuideContext;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<{role:'user'|'guide'; text:string}[]>([
    { role:'guide', text: context.poiName ? `Ask me anything about ${context.poiName} or this area.` : 'Ask me anything about this area.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setMessages(items => [...items, {role:'user', text:question}]);
    setInput('');
    setLoading(true);
    try {
      const answer = await askGuide(question, context);
      setMessages(items => [...items, {role:'guide', text:answer}]);
    } catch {
      setMessages(items => [...items, {role:'guide', text:'The AI guide is not connected yet. Add your API key and try again.'}]);
    } finally {
      setLoading(false);
    }
  };

  const chips = ['Tell me the most interesting fact','What should I notice here?','Give me a 1-minute story'];

  return (
    <motion.section className="guide-chat" initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',stiffness:340,damping:34}}>
      <header><div><small>SMART AI TRAVEL</small><h2>Local Guide</h2></div><button onClick={onClose} aria-label="Close AI guide">×</button></header>
      <div className="guide-messages">
        {messages.map((m,i)=><div key={i} className={`guide-message ${m.role}`}>{m.text}</div>)}
        {loading && <div className="guide-message guide">Thinking…</div>}
      </div>
      <div className="guide-chips">
        {chips.map(chip=><button key={chip} onClick={()=>{setInput(chip);}}>{chip}</button>)}
      </div>
      <form onSubmit={send} className="guide-input">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about history, food, culture…" />
        <button type="submit">Send</button>
      </form>
    </motion.section>
  );
}
