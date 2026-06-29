import { useState } from 'react';
import { AlertTriangle, CheckCircle, TrendingDown, Edit3, Check, X } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { Skeleton } from '../../components/ui/Spinner';

export default function AdminInventory() {
  const { products, lowStockProducts, outOfStockProducts, isLoading, updateStock } = useInventory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock,  setNewStock]  = useState(0);
  const [reason,    setReason]    = useState('');

  const startEdit = (productId: string, currentStock: number) => {
    setEditingId(productId);
    setNewStock(currentStock);
    setReason('');
  };

  const confirmEdit = async (productId: string, currentStock: number) => {
    const type = newStock > currentStock ? 'in' : newStock < currentStock ? 'out' : 'adjustment';
    await updateStock(productId, newStock, reason || 'Mise à jour manuelle', type);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Gestion du stock</h1>
        <p className="text-muted text-sm">{products.length} produits</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 bg-green-500/5 border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-muted text-sm">En stock</span>
          </div>
          <div className="text-2xl font-heading font-bold text-green-400">
            {products.filter(p => p.stock > p.stock_alert).length}
          </div>
        </div>
        <div className="card p-4 bg-orange-500/5 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-orange-400" />
            <span className="text-muted text-sm">Stock faible</span>
          </div>
          <div className="text-2xl font-heading font-bold text-orange-400">
            {lowStockProducts.length}
          </div>
        </div>
        <div className="card p-4 bg-red-500/5 border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-400" />
            <span className="text-muted text-sm">Rupture</span>
          </div>
          <div className="text-2xl font-heading font-bold text-red-400">
            {outOfStockProducts.length}
          </div>
        </div>
      </div>

      {/* Alertes */}
      {outOfStockProducts.length > 0 && (
        <div className="card p-4 border-red-500/30 bg-red-500/5">
          <h3 className="font-heading font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} />
            Ruptures de stock ({outOfStockProducts.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {outOfStockProducts.map(p => (
              <span key={p.id} className="text-sm bg-red-500/20 text-red-300 px-3 py-1 rounded-full">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tableau stocks */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Produit', 'Catégorie', 'Stock actuel', 'Alerte min.', 'État', 'Mise à jour'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-muted font-medium text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
                : products.map(p => {
                  const isOOS = p.stock === 0;
                  const isLow = p.stock > 0 && p.stock <= p.stock_alert;
                  const isEditing = editingId === p.id;

                  return (
                    <tr key={p.id} className={`border-b border-white/5 hover:bg-bg-surface/50 ${isOOS ? 'bg-red-500/5' : isLow ? 'bg-orange-500/5' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <span className="text-white font-medium line-clamp-1 max-w-[200px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted capitalize">{p.category}</td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={newStock}
                            onChange={e => setNewStock(parseInt(e.target.value) || 0)}
                            title="Nouveau stock"
                            aria-label="Nouveau stock"
                            className="w-20 bg-bg-deep border border-gold/50 rounded px-2 py-1 text-white font-mono text-sm focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className={`font-mono font-semibold text-lg ${isOOS ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-green-400'}`}>
                            {p.stock}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted font-mono">{p.stock_alert}</td>
                      <td className="py-3 px-4">
                        {isOOS
                          ? <span className="badge bg-red-500/20 text-red-400">Rupture</span>
                          : isLow
                            ? <span className="badge bg-orange-500/20 text-orange-400">Faible</span>
                            : <span className="badge bg-green-500/20 text-green-400">OK</span>
                        }
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              className="input !py-1 !px-2 text-xs w-32"
                              placeholder="Raison…"
                              value={reason}
                              onChange={e => setReason(e.target.value)}
                            />
                            <button type="button" title="Confirmer" onClick={() => confirmEdit(p.id, p.stock)} className="text-green-400 hover:text-green-300 p-1">
                              <Check size={16} />
                            </button>
                            <button type="button" title="Annuler" onClick={() => setEditingId(null)} className="text-muted hover:text-red-400 p-1">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button type="button" title="Modifier le stock" onClick={() => startEdit(p.id, p.stock)} className="p-1.5 text-muted hover:text-gold transition-colors">
                            <Edit3 size={15} />
                          </button>
                        )}
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
