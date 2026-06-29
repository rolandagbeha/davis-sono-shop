import { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, FileText, Package,
  AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { useOrders } from '../../hooks/useOrders';
import { useDevis } from '../../hooks/useDevis';
import { formatFCFA } from '../../utils/formatPrice';
import { StatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Spinner';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS: Record<string, string> = {
  enceintes:   '#F5C518',
  mixage:      '#00D4FF',
  micros:      '#A855F7',
  instruments: '#10B981',
  eclairage:   '#F97316',
  accessoires: '#EC4899',
};

const MONTH_LABELS: Record<number, string> = {
  1: 'Jan', 2: 'Fév', 3: 'Mar', 4: 'Avr', 5: 'Mai', 6: 'Juin',
  7: 'Juil', 8: 'Août', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Déc',
};

interface RevenuePoint  { month: string; revenue: number; orders: number; }
interface CategoryPoint { name: string;  value: number;   color: string;  }

interface KpiCardProps {
  label:    string;
  value:    string | number;
  icon:     React.ElementType;
  color:    string;
  trend?:   string;
  loading?: boolean;
}

function KpiCard({ label, value, icon: Icon, color, trend, loading }: KpiCardProps) {
  return (
    <div className="card-hover p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className="text-green-400 text-xs font-medium flex items-center gap-0.5">
            <ArrowUpRight size={12} />
            {trend}
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-7 w-24 mb-1" />
      ) : (
        <div className="text-2xl font-heading font-bold text-white mb-1">{value}</div>
      )}
      <div className="text-muted text-sm">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { orders,    isLoading: ordersLoading } = useOrders({ limit: 5 });
  const { devisList, isLoading: devisLoading  } = useDevis({ limit: 5 });

  const [stats, setStats] = useState({
    total_orders: 0, pending_orders: 0, out_of_stock: 0,
    pending_devis: 0, revenue_month: 0,
  });
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [revenueData,   setRevenueData]   = useState<RevenuePoint[]>([]);
  const [categoryData,  setCategoryData]  = useState<CategoryPoint[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, devisRes] = await Promise.all([
          supabase.from('orders').select('status, total, created_at', { count: 'exact' }),
          supabase.from('products').select('stock, stock_alert', { count: 'exact' }),
          supabase.from('devis').select('status', { count: 'exact' }).eq('status', 'new'),
        ]);

        const allOrders = ordersRes.data ?? [];
        const allProds  = productsRes.data ?? [];
        const now       = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const revenueMonth = allOrders
          .filter((o: any) => o.status !== 'cancelled' && o.created_at >= monthStart)
          .reduce((s: number, o: any) => s + (o.total ?? 0), 0);

        setStats({
          total_orders:   ordersRes.count ?? 0,
          pending_orders: allOrders.filter((o: any) => o.status === 'pending').length,
          out_of_stock:   allProds.filter((p: any) => p.stock === 0).length,
          pending_devis:  devisRes.count ?? 0,
          revenue_month:  revenueMonth,
        });
      } catch (_) {}
      setStatsLoading(false);
    };

    const fetchCharts = async () => {
      try {
        // ── Revenus 6 derniers mois ──
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const { data: ordersData } = await supabase
          .from('orders')
          .select('total, created_at')
          .neq('status', 'cancelled')
          .gte('created_at', sixMonthsAgo.toISOString());

        if (ordersData) {
          const byMonth: Record<string, RevenuePoint> = {};
          for (let i = 5; i >= 0; i--) {
            const d   = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            byMonth[key] = { month: MONTH_LABELS[d.getMonth() + 1], revenue: 0, orders: 0 };
          }
          ordersData.forEach((o: any) => {
            const d   = new Date(o.created_at);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (byMonth[key]) {
              byMonth[key].revenue += o.total ?? 0;
              byMonth[key].orders  += 1;
            }
          });
          setRevenueData(Object.values(byMonth));
        }

        // ── Répartition par catégorie (basée sur les vues produits) ──
        const { data: prodsData } = await supabase
          .from('products')
          .select('category, views')
          .eq('is_active', true);

        if (prodsData) {
          const catCount: Record<string, number> = {};
          prodsData.forEach((p: any) => {
            catCount[p.category] = (catCount[p.category] ?? 0) + (p.views ?? 0);
          });
          const total = Object.values(catCount).reduce((s, v) => s + v, 0) || 1;
          setCategoryData(
            Object.entries(catCount)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => ({
                name:  cat.charAt(0).toUpperCase() + cat.slice(1),
                value: Math.round((count / total) * 100),
                color: CATEGORY_COLORS[cat] ?? '#6B7599',
              }))
          );
        }
      } catch (_) {}
      setChartsLoading(false);
    };

    fetchStats();
    fetchCharts();
  }, []);

  const kpis = [
    { label: 'Total commandes',     value: stats.total_orders,              icon: ShoppingBag, color: 'bg-blue-500/30'   },
    { label: 'CA ce mois',          value: formatFCFA(stats.revenue_month), icon: TrendingUp,  color: 'bg-green-500/30'  },
    { label: 'Devis en attente',    value: stats.pending_devis,             icon: FileText,    color: 'bg-purple-500/30' },
    { label: 'Produits en rupture', value: stats.out_of_stock,              icon: Package,     color: 'bg-red-500/30'    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Vue d'ensemble de votre boutique</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <KpiCard key={kpi.label} {...kpi} loading={statsLoading} />
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenus 6 mois */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-heading font-semibold text-white mb-5">Revenus — 6 derniers mois</h3>
          {chartsLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6B7599', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#6B7599', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip
                  contentStyle={{ background: '#0F1535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                  formatter={(v) => [formatFCFA(Number(v ?? 0)), 'Revenus']}
                />
                <Bar dataKey="revenue" fill="#F5C518" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ventes par catégorie */}
        <div className="card p-5">
          <h3 className="font-heading font-semibold text-white mb-5">Popularité par catégorie</h3>
          {chartsLoading ? (
            <Skeleton className="h-[180px] w-full" />
          ) : categoryData.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">Aucune donnée disponible</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0F1535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                    formatter={(v) => [`${v ?? 0}%`, 'Part']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryData.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                      <span className="text-muted">{c.name}</span>
                    </div>
                    <span className="text-white font-mono">{c.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tableaux récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes récentes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-white">Commandes récentes</h3>
            <Link to="/admin/orders" className="text-gold hover:text-gold-dark text-sm font-medium">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {ordersLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : orders.length === 0
                ? <p className="text-muted text-sm">Aucune commande</p>
                : orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-mono text-gold text-sm font-semibold">{order.order_number}</p>
                      <p className="text-muted text-xs">{order.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="price text-sm">{formatFCFA(order.total)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Devis récents */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-white">Devis récents</h3>
            <Link to="/admin/devis" className="text-gold hover:text-gold-dark text-sm font-medium">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {devisLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : devisList.length === 0
                ? <p className="text-muted text-sm">Aucun devis</p>
                : devisList.slice(0, 5).map(devis => (
                  <div key={devis.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-mono text-cyan text-sm font-semibold">{devis.devis_number}</p>
                      <p className="text-muted text-xs">{devis.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs truncate max-w-[120px]">{devis.product_name || 'Sans produit'}</p>
                      <StatusBadge status={devis.status} />
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Alertes stock */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-orange-400" />
          <h3 className="font-heading font-semibold text-white">
            Alertes stock
            {stats.out_of_stock > 0 && (
              <span className="ml-2 text-sm font-normal text-red-400">
                ({stats.out_of_stock} rupture{stats.out_of_stock > 1 ? 's' : ''})
              </span>
            )}
          </h3>
        </div>
        <p className="text-muted text-sm">
          Consultez la page{' '}
          <Link to="/admin/inventory" className="text-gold hover:underline">
            Gestion du stock
          </Link>{' '}
          pour voir les produits en rupture ou à stock faible.
        </p>
      </div>
    </div>
  );
}
