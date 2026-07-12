import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap, X, Send, Loader2 } from 'lucide-react';
import { aiChat } from '../../lib/ai';
import type { ChatMessage } from '../../lib/ai';

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    "Bonjour ! Je suis l'assistant Davis Sono Shop. Je peux vous conseiller sur nos enceintes, mixeurs, instruments et plus encore. Que recherchez-vous ?",
};

const FALLBACK_ERROR =
  "Desole, je n'arrive pas a repondre pour le moment. Contactez-nous directement sur WhatsApp : 98 42 32 32.";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const reply = await aiChat(next);
      setMessages(m => [...m, { role: 'assistant', content: reply || FALLBACK_ERROR }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: FALLBACK_ERROR }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        title="Assistant Davis Sono"
        aria-label={open ? 'Fermer l\'assistant' : 'Ouvrir l\'assistant'}
        className={`fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-gold text-bg-deep shadow-lg shadow-gold/30 flex items-center justify-center hover:scale-105 transition-transform overflow-visible ${
          !open ? 'animate-pulse-gold' : ''
        }`}
      >
        {open ? (
          <X size={24} className="relative" />
        ) : (
          <>
            <Bot size={28} strokeWidth={2.25} className="relative" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bg-deep border-2 border-gold flex items-center justify-center">
              <Zap size={11} className="text-gold fill-gold" />
            </span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-5 z-40 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-bg-card border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-bg-surface flex-shrink-0">
              <div className="relative w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-gold" />
              </div>
              <div>
                <div className="text-sm font-heading font-semibold text-white">Assistant Davis Sono</div>
                <div className="text-xs text-muted">Repond en quelques secondes</div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                      m.role === 'user' ? 'bg-gold text-bg-deep' : 'bg-bg-surface text-white'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-bg-surface rounded-2xl px-3 py-2">
                    <Loader2 size={16} className="animate-spin text-muted" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex items-center gap-2 flex-shrink-0">
              <input
                className="input flex-1 !py-2 text-sm"
                placeholder="Ecrivez votre question…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                title="Envoyer"
                aria-label="Envoyer le message"
                className="w-9 h-9 rounded-full bg-gold text-bg-deep flex items-center justify-center disabled:opacity-40 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
