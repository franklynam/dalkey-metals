'use client';

import { useState } from 'react';
import clsx from 'clsx';

export const LAYERS = [
  {
    id: 'satellite',
    label: 'Satellite',
    preview: 'linear-gradient(135deg, #3d5a3e 0%, #6b8c5a 40%, #4a7a6b 70%, #2d4a5e 100%)',
  },
  {
    id: '1837-oss',
    label: '1837 OSS',
    preview: 'linear-gradient(135deg, #d4c5a9 0%, #c8b89a 40%, #b8a882 70%, #a89870 100%)',
  },
];

function LayersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L2 6.5l8 4.5 8-4.5L10 2z" fill="currentColor" opacity="0.6" />
      <path d="M2 10l8 4.5L18 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 13.5l8 4.5 8-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function LayerPicker({ activeLayer, onLayerChange }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (id) => {
    onLayerChange(id);
    setOpen(false);
  };

  return (
    <div className="relative select-none">
      {/* Layer cards — shown above the button when open */}
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] right-0 flex gap-2 bg-black/88 backdrop-blur border border-white/15 rounded-[10px] p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          {LAYERS.map((layer) => {
            const active = layer.id === activeLayer;
            return (
              <button
                key={layer.id}
                onClick={() => handleSelect(layer.id)}
                className={clsx(
                  'bg-transparent p-0 cursor-pointer flex flex-col items-center gap-1.5 overflow-hidden w-[72px] rounded-lg border-2',
                  active ? 'border-gold' : 'border-white/20'
                )}
              >
                <div className="w-full h-[52px]" style={{ background: layer.preview }} />
                <span className={clsx(
                  'text-[11px] pb-1.5',
                  active ? 'text-gold font-semibold' : 'text-white/80 font-normal'
                )}>
                  {layer.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Layers button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'w-10 h-10 flex flex-col items-center justify-center gap-0.5 border border-white/25 rounded-lg cursor-pointer backdrop-blur-sm',
          open ? 'bg-gold/90 text-[#1a1a1a]' : 'bg-black/55 text-white'
        )}
        aria-label="Layers"
        title="Layers"
      >
        <LayersIcon />
        <span className="hidden md:inline text-[9px] tracking-[0.02em]">Layers</span>
      </button>
    </div>
  );
}
