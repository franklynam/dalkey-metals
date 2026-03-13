'use client';

import { useState } from 'react';

export const LAYERS = [
  {
    id: 'satellite',
    label: 'Satellite',
    // CSS gradient standing in for a satellite preview swatch
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
    <div style={{ position: 'relative', userSelect: 'none' }}>
      {/* Layer cards — shown above the button when open */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            display: 'flex',
            gap: 8,
            background: 'rgba(10,10,10,0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {LAYERS.map((layer) => {
            const active = layer.id === activeLayer;
            return (
              <button
                key={layer.id}
                onClick={() => handleSelect(layer.id)}
                style={{
                  background: 'none',
                  border: `2px solid ${active ? '#e8c84a' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 8,
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  overflow: 'hidden',
                  width: 72,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 52,
                    background: layer.preview,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: active ? '#e8c84a' : 'rgba(255,255,255,0.8)',
                    fontFamily: 'system-ui, sans-serif',
                    paddingBottom: 6,
                    fontWeight: active ? 600 : 400,
                  }}
                >
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
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background: open ? 'rgba(232,200,74,0.9)' : 'rgba(0,0,0,0.55)',
          color: open ? '#1a1a1a' : '#fff',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 8,
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
        }}
        aria-label="Layers"
        title="Layers"
      >
        <LayersIcon />
        {window.innerWidth >= 768 && (
          <span style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.02em' }}>
            Layers
          </span>
        )}
      </button>
    </div>
  );
}
