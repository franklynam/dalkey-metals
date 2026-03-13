'use client';

export default function InfoPanel({ poi, onClose }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(420px, calc(100vw - 32px))',
        background: 'rgba(10, 10, 10, 0.88)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: '16px 20px',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#e8c84a' }}>
          {poi.title}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 20,
            cursor: 'pointer',
            padding: '0 0 0 8px',
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
        {poi.body}
      </p>
    </div>
  );
}
