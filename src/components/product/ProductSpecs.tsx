import type { ProductSpec } from '../../types';

interface ProductSpecsProps {
  specs: ProductSpec[];
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || specs.length === 0) {
    return <p className="text-muted text-sm">Aucune spécification technique disponible.</p>;
  }

  return (
    <div className="overflow-hidden rounded-card border border-white/10">
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec, i) => (
            <tr
              key={i}
              className={`border-b border-white/5 last:border-0 ${
                i % 2 === 0 ? 'bg-bg-surface/50' : 'bg-transparent'
              }`}
            >
              <td className="py-3 px-4 text-muted font-medium w-1/3">{spec.label}</td>
              <td className="py-3 px-4 text-white">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
