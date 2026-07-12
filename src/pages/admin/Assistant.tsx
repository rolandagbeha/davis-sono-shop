import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Loader2, BotMessageSquare, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { client } from '../../lib/neon';
import { useAuth } from '../../context/AuthContext';
import { aiAdminChat } from '../../lib/ai';
import type { ChatMessage } from '../../lib/ai';

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    "Bonjour ! Je suis votre assistant IA interne. Je peux analyser vos ventes, repondre a des questions sur vos chiffres, ou vous aider a rediger une reponse client. Que puis-je faire pour vous ?",
};

const SUGGESTIONS = [
  'Resume mes ventes du mois',
  'Quels produits sont en rupture de stock ?',
  'Redige une reponse pour un client qui demande un delai de livraison',
  'Comment ameliorer mes ventes ce mois-ci ?',
];

interface OrderStatRow { status: string; total: number | null; created_at: string; }
interface ProductStatRow { name: string; stock: number; stock_alert: number; }

export default function AdminAssistant() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statsContext, setStatsContext] = useState('Chargement des donnees...');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [ordersRes, productsRes, devisRes] = await Promise.all([
          client.from('orders').select('status, total, created_at'),
          client.from('products').select('name, stock, stock_alert, category, is_active').eq('is_active', true),
          client.from('devis').select('status').eq('status', 'new'),
        ]);

        const orders = (ordersRes.data ?? []) as OrderStatRow[];
        const products = (productsRes.data ?? []) as ProductStatRow[];
        const monthOrders = orders.filter((o) => o.status !== 'cancelled' && o.created_at >= monthStart);
        const revenueMonth = monthOrders.reduce((s, o) => s + (o.total ?? 0), 0);
        const outOfStock = products.filter((p) => p.stock === 0).map((p) => p.name);
        const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.stock_alert).map((p) => p.name);

        const context = [
          `Commandes totales : ${orders.length}`,
          `Commandes ce mois : ${monthOrders.length}`,
          `Chiffre d'affaires ce mois : ${revenueMonth} FCFA`,
          `Devis en attente : ${devisRes.data?.length ?? 0}`,
          `Produits en rupture de stock : ${outOfStock.length ? outOfStock.join(', ') : 'aucun'}`,
          `Produits a stock faible : ${lowStock.length ? lowStock.join(', ') : 'aucun'}`,
        ].join('\n');

        setStatsContext(context);
      } catch {
        setStatsContext('Donnees indisponibles pour le moment.');
      }
    };

    loadStats();
  }, []);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading || !session?.access_token) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const reply = await aiAdminChat(next, statsContext, session.access_token);
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(m => [
        ...m,
        { role: 'assistant', content: err instanceof Error ? err.message : "Erreur de l'assistant IA." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Genere un rapport structure via l'IA (a partir des vraies donnees de la
  // boutique) puis le convertit en PDF telechargeable, cote client (aucun
  // serveur/dependance supplementaire).
  const downloadReportPdf = async () => {
    if (!session?.access_token || generatingPdf) return;
    setGeneratingPdf(true);

    try {
      const reply = await aiAdminChat(
        [{
          role: 'user',
          content:
            "Genere un rapport structure et pret a imprimer (sections claires, sans markdown ni " +
            "asterisques) a partir de mes donnees : ventes, stock, devis en attente, puis 2 a 3 " +
            'recommandations concretes.',
        }],
        statsContext,
        session.access_token,
      );

      const doc = new jsPDF();
      const marginX = 15;
      let y = 20;

      doc.setFontSize(16);
      doc.text('Davis Sono Shop — Rapport', marginX, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, marginX, y);
      y += 10;

      doc.setTextColor(0);
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(reply, 180) as string[];
      for (const line of lines) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, marginX, y);
        y += 6;
      }

      doc.save(`rapport-davis-sono-shop-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur generation du rapport PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
            <BotMessageSquare size={24} className="text-gold" />
            Assistant IA
          </h1>
          <p className="text-muted text-sm mt-1">
            Analyse de vos ventes, aide a la redaction, conseils commerciaux — a partir des donnees reelles de votre boutique.
          </p>
        </div>
        <button
          onClick={downloadReportPdf}
          disabled={generatingPdf}
          className="btn-secondary shrink-0"
        >
          {generatingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          Rapport PDF
        </button>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden min-h-[500px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user' ? 'bg-gold text-bg-deep' : 'bg-bg-surface text-white'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-bg-surface rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-muted" />
                <span className="text-muted text-sm">Analyse en cours…</span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-muted hover:text-gold hover:border-gold/40 transition-colors flex items-center gap-1.5"
              >
                <Sparkles size={12} />
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-white/10 flex items-center gap-2">
          <input
            className="input flex-1"
            placeholder="Posez une question sur vos ventes, vos stocks, vos clients…"
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
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="btn-primary !py-2.5 !px-4"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
