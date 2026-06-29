import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Copy, Search, X, Loader2, Check, Upload, ImagePlus } from 'lucide-react';
import { useProducts, productService } from '../../hooks/useProducts';
import type { Product, ProductCategory, ProductBadge } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';
import { formatFCFA } from '../../utils/formatPrice';
import { generateSlug } from '../../utils/orderNumber';
import toast from 'react-hot-toast';

const CATEGORIES: ProductCategory[] = ['enceintes', 'mixage', 'micros', 'instruments', 'eclairage', 'accessoires'];
const BADGES: { value: ProductBadge; label: string }[] = [
  { value: null,   label: 'Aucun' },
  { value: 'new',  label: 'Nouveau' },
  { value: 'hot',  label: 'Populaire' },
  { value: 'sale', label: 'Promotion' },
];

const EMPTY_PRODUCT: Partial<Product> = {
  name: '', category: 'enceintes', short_description: '', description: '',
  price: 0, stock: 0, stock_alert: 5, is_active: true, is_rentable: false,
  badge: null, specs: [], images: [], rental_price_day: undefined,
};

export default function AdminProducts() {
  const [search,  setSearch]  = useState('');
  const [isModal, setIsModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(EMPTY_PRODUCT);
  const [saving,  setSaving]  = useState(false);
  const [specKey,    setSpecKey]    = useState('');
  const [specVal,    setSpecVal]    = useState('');
  const [uploading,  setUploading]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const [urlInput,   setUrlInput]   = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tempIdRef    = useRef(`temp-${Date.now()}`);

  const { products, isLoading, refetch } = useProducts({
    search: search || undefined,
    isActive: undefined,
  });

  const openNew = () => {
    setEditing(EMPTY_PRODUCT);
    setIsModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setIsModal(true);
  };

  const handleSave = async () => {
    if (!editing.name?.trim())  { toast.error('Nom requis');      return; }
    if (!editing.category)      { toast.error('Catégorie requise'); return; }
    if ((editing.price ?? 0) <= 0) { toast.error('Prix requis'); return; }

    setSaving(true);
    try {
      const slug = generateSlug(editing.name!);
      if (editing.id) {
        await productService.update(editing.id, { ...editing, slug });
        toast.success('Produit mis à jour');
      } else {
        await productService.create({ ...editing, slug });
        toast.success('Produit créé');
      }
      setIsModal(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    try {
      await productService.delete(id);
      toast.success('Produit supprimé');
      refetch();
    } catch { toast.error('Erreur suppression'); }
  };

  const handleDuplicate = async (p: Product) => {
    await productService.duplicate(p);
    refetch();
  };

  const addSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setEditing(e => ({ ...e, specs: [...(e.specs || []), { label: specKey, value: specVal }] }));
    setSpecKey(''); setSpecVal('');
  };

  const removeSpec = (i: number) => {
    setEditing(e => ({ ...e, specs: (e.specs || []).filter((_, idx) => idx !== i) }));
  };

  const set = (key: keyof Product, value: any) =>
    setEditing(e => ({ ...e, [key]: value }));

  const removeImage = (idx: number) =>
    setEditing(e => ({ ...e, images: (e.images ?? []).filter((_, i) => i !== idx) }));

  const addImageUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setEditing(e => ({ ...e, images: [...(e.images ?? []), url] }));
    setUrlInput('');
  };

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const id = editing.id ?? tempIdRef.current;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await productService.uploadImage(file, id);
        uploaded.push(url);
      } catch { /* ignore individual failures */ }
    }
    if (uploaded.length) {
      setEditing(e => ({ ...e, images: [...(e.images ?? []), ...uploaded] }));
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Produits</h1>
          <p className="text-muted text-sm">{products.length} produit{products.length > 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus size={18} />
          Nouveau produit
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input pl-10"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tableau produits */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Produit', 'Catégorie', 'Prix', 'Stock', 'Badge', 'Statut', 'Actions'].map(h => (
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
                : products.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-bg-surface/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.images[0] && (
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <span className="font-medium text-white line-clamp-1 max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted capitalize">{p.category}</td>
                    <td className="py-3 px-4 price text-sm">{formatFCFA(p.price)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono text-sm ${p.stock === 0 ? 'text-red-400' : p.stock <= p.stock_alert ? 'text-orange-400' : 'text-green-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4"><Badge badge={p.badge} /></td>
                    <td className="py-3 px-4">
                      <span className={`badge ${p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted'}`}>
                        {p.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openEdit(p)} className="p-1.5 text-muted hover:text-gold transition-colors" title="Modifier">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => handleDuplicate(p)} className="p-1.5 text-muted hover:text-cyan transition-colors" title="Dupliquer">
                          <Copy size={15} />
                        </button>
                        <button type="button" onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-muted hover:text-red-400 transition-colors" title="Supprimer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal produit */}
      <Modal
        isOpen={isModal}
        onClose={() => setIsModal(false)}
        title={editing.id ? 'Modifier le produit' : 'Nouveau produit'}
        size="xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-muted mb-2">Nom du produit *</label>
              <input className="input" value={editing.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="Ex : Enceinte JBL PRX815" />
            </div>
            <div>
              <label htmlFor="prod-category" className="block text-sm text-muted mb-2">Catégorie *</label>
              <select id="prod-category" className="input" value={editing.category} onChange={e => set('category', e.target.value as ProductCategory)}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="prod-badge" className="block text-sm text-muted mb-2">Badge</label>
              <select id="prod-badge" className="input" value={editing.badge ?? ''} onChange={e => set('badge', e.target.value || null)}>
                {BADGES.map(b => <option key={String(b.value)} value={b.value ?? ''}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="prod-price" className="block text-sm text-muted mb-2">Prix FCFA *</label>
              <input id="prod-price" className="input" type="number" min={0} value={editing.price ?? 0} onChange={e => set('price', parseInt(e.target.value) || 0)} placeholder="Ex : 285000" />
            </div>
            <div>
              <label htmlFor="prod-rental" className="block text-sm text-muted mb-2">Prix location / jour (optionnel)</label>
              <input id="prod-rental" className="input" type="number" min={0} value={editing.rental_price_day ?? ''} onChange={e => set('rental_price_day', e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Ex : 15000" />
            </div>
            <div>
              <label htmlFor="prod-stock" className="block text-sm text-muted mb-2">Stock actuel</label>
              <input id="prod-stock" className="input" type="number" min={0} value={editing.stock ?? 0} onChange={e => set('stock', parseInt(e.target.value) || 0)} placeholder="0" />
            </div>
            <div>
              <label htmlFor="prod-stock-alert" className="block text-sm text-muted mb-2">Alerte stock minimum</label>
              <input id="prod-stock-alert" className="input" type="number" min={0} value={editing.stock_alert ?? 5} onChange={e => set('stock_alert', parseInt(e.target.value) || 5)} placeholder="5" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-muted mb-2">Description courte</label>
              <input className="input" value={editing.short_description ?? ''} onChange={e => set('short_description', e.target.value)} placeholder="Résumé en une phrase" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-muted mb-2">Description complète</label>
              <textarea className="input min-h-[100px] resize-none" value={editing.description ?? ''} onChange={e => set('description', e.target.value)} />
            </div>
            {/* ── Images ── */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-muted mb-2">Images du produit</label>

              {/* Prévisualisations */}
              {(editing.images ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editing.images ?? []).map((img, i) => (
                    <div key={i} className="relative group w-20 h-20">
                      <img src={img} alt="" className="w-full h-full rounded-lg object-cover border border-white/10" />
                      <button
                        type="button"
                        title="Supprimer cette image"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex"
                      >
                        <X size={11} className="text-white" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[9px] bg-gold text-bg-deep px-1 rounded font-bold leading-tight">1er</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Zone drag & drop */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                aria-label="Choisir des images"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-btn p-5 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-gold bg-gold/5' : 'border-white/20 hover:border-gold/40'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-muted">
                    <Loader2 size={16} className="animate-spin text-gold" />
                    <span className="text-sm">Téléchargement…</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="text-muted mx-auto mb-1.5" />
                    <p className="text-muted text-sm">
                      Glissez des images ici ou{' '}
                      <span className="text-gold">cliquez pour choisir</span>
                    </p>
                    <p className="text-muted text-xs mt-0.5">JPG, PNG, WebP — max 5 Mo</p>
                  </>
                )}
              </div>

              {/* URL externe fallback */}
              <div className="flex gap-2 mt-2">
                <input
                  className="input flex-1 !py-2 text-xs"
                  placeholder="Ou collez une URL d'image et appuyez sur Entrée…"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                />
                <button
                  type="button"
                  title="Ajouter l'URL"
                  onClick={addImageUrl}
                  className="btn-secondary !py-2 !px-3"
                >
                  <ImagePlus size={16} />
                </button>
              </div>
            </div>

            {/* Spécifications techniques */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-muted mb-3">Spécifications techniques</label>
              <div className="space-y-2 mb-3">
                {(editing.specs ?? []).map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 bg-bg-surface rounded-btn px-3 py-2">
                    <span className="text-muted text-sm w-1/3">{spec.label}</span>
                    <span className="text-white text-sm flex-1">{spec.value}</span>
                    <button type="button" title="Supprimer cette spec" onClick={() => removeSpec(i)} className="text-muted hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input aria-label="Label de la spec" className="input flex-1 !py-2 text-sm" placeholder="Label (ex: Puissance)" value={specKey} onChange={e => setSpecKey(e.target.value)} />
                <input aria-label="Valeur de la spec" className="input flex-1 !py-2 text-sm" placeholder="Valeur (ex: 2000W)" value={specVal} onChange={e => setSpecVal(e.target.value)} />
                <button type="button" title="Ajouter cette spécification" onClick={addSpec} className="btn-secondary !py-2 !px-4">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={e => set('is_active', e.target.checked)} className="accent-gold" />
                <span className="text-sm text-muted">Produit actif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_rentable ?? false} onChange={e => set('is_rentable', e.target.checked)} className="accent-gold" />
                <span className="text-sm text-muted">Disponible à la location</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setIsModal(false)} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
