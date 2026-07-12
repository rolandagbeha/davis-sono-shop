import { useState, useEffect } from 'react';
import { MessageCircle, Crown, User, Star } from 'lucide-react';
import { client } from '../../lib/neon';
import { formatFCFA } from '../../utils/formatPrice';
import { Skeleton } from '../../components/ui/Spinner';

interface ClientProfile {
  phone:           string;
  name:            string;
  email?:          string;
  order_count:     number;
  total_spent:     number;
  last_order_date: string;
}

interface OrderClientRow {
  client_name:  string;
  client_phone: string;
  client_email: string | null;
  total:        number | null;
  created_at:   string;
}

function getSegment(totalSpent: number): { label: string; icon: React.ElementType; color: string } {
  if (totalSpent >= 500000) return { label: 'VIP',        icon: Crown,  color: 'text-gold' };
  if (totalSpent >= 100000) return { label: 'Regulier',   icon: Star,   color: 'text-cyan' };
  return                           { label: 'Nouveau',    icon: User,   color: 'text-muted' };
}

export default function AdminClients() {
  const [clients,   setClients]   = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data } = await client
          .from('orders')
          .select('client_name, client_phone, client_email, total, created_at');

        if (!data) return;

        // Agrege par telephone
        const map = new Map<string, ClientProfile>();
        (data as OrderClientRow[]).forEach((o) => {
          const key = o.client_phone;
          if (map.has(key)) {
            const existing = map.get(key)!;
            map.set(key, {
              ...existing,
              order_count:     existing.order_count + 1,
              total_spent:     existing.total_spent + (o.total ?? 0),
              last_order_date: o.created_at > existing.last_order_date ? o.created_at : existing.last_order_date,
            });
          } else {
            map.set(key, {
              phone:           o.client_phone,
              name:            o.client_name,
              email:           o.client_email ?? undefined,
              order_count:     1,
              total_spent:     o.total ?? 0,
              last_order_date: o.created_at,
            });
          }
        });

        setClients(
          Array.from(map.values()).sort((a, b) => b.total_spent - a.total_spent),
        );
      } catch {}
      setIsLoading(false);
    };
    fetchClients();
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Clients</h1>
        <p className="text-muted text-sm">{clients.length} client{clients.length > 1 ? 's' : ''} enregistres</p>
      </div>

      {/* Stats segment */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'VIP (>500k)', count: clients.filter(c => c.total_spent >= 500000).length, color: 'text-gold', bg: 'bg-gold/10' },
          { label: 'Reguliers', count: clients.filter(c => c.total_spent >= 100000 && c.total_spent < 500000).length, color: 'text-cyan', bg: 'bg-cyan/10' },
          { label: 'Nouveaux', count: clients.filter(c => c.total_spent < 100000).length, color: 'text-muted', bg: 'bg-white/5' },
        ].map(seg => (
          <div key={seg.label} className={`card p-4 text-center ${seg.bg}`}>
            <div className={`text-2xl font-heading font-bold ${seg.color}`}>{seg.count}</div>
            <div className="text-muted text-sm">{seg.label}</div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <input
        className="input"
        placeholder="Rechercher un client (nom ou telephone)…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Tableau */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Client', 'Telephone', 'Commandes', 'Total depense', 'Segment', 'Derniere commande', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-muted font-medium text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
                : filtered.map(client => {
                  const seg = getSegment(client.total_spent);
                  return (
                    <tr key={client.phone} className="border-b border-white/5 hover:bg-bg-surface/50">
                      <td className="py-3 px-4 text-white font-medium">{client.name}</td>
                      <td className="py-3 px-4 text-muted font-mono">{client.phone}</td>
                      <td className="py-3 px-4 text-white font-mono text-center">{client.order_count}</td>
                      <td className="py-3 px-4 price">{formatFCFA(client.total_spent)}</td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-1.5 ${seg.color}`}>
                          <seg.icon size={14} />
                          <span className="text-xs font-medium">{seg.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted text-xs">
                        {new Date(client.last_order_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-muted hover:text-whatsapp transition-colors inline-block"
                          title="Contacter sur WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
