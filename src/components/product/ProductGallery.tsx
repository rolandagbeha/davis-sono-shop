import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name:   string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isZoomed,  setIsZoomed]  = useState(false);
  const [mousePos,  setMousePos]  = useState({ x: 50, y: 50 });

  const validImages = images.filter(Boolean);
  const hasImages   = validImages.length > 0;
  const current     = hasImages ? validImages[activeIdx] : '';

  const prev = () => setActiveIdx(i => (i - 1 + validImages.length) % validImages.length);
  const next = () => setActiveIdx(i => (i + 1) % validImages.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)  / rect.height) * 100;
    setMousePos({ x, y });
  };

  if (!hasImages) {
    return (
      <div className="aspect-square bg-bg-surface rounded-card flex items-center justify-center">
        <span className="text-muted text-sm">Aucune image disponible</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div
        className="relative aspect-square bg-bg-surface rounded-card overflow-hidden cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            src={current}
            alt={`${name} — vue ${activeIdx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover transition-transform duration-200"
            style={isZoomed ? {
              transform: 'scale(2)',
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            } : {}}
          />
        </AnimatePresence>

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
            <ZoomIn size={16} className="text-white" />
          </div>
        </div>

        {/* Flèches si plusieurs images */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Indicateur */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === activeIdx ? 'bg-gold' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniatures */}
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIdx
                  ? 'border-gold'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <img
                src={img}
                alt={`Miniature ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
