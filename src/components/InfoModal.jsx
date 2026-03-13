'use client';

const SECTIONS = [
  {
    heading: 'About this project',
    body: `This interactive visualisation places you inside a high-resolution LiDAR terrain model of the coastline between Dalkey Quarry and Dún Laoghaire Harbour — the route once followed by The Metals, one of Ireland's earliest railways. The project overlays georeferenced historical mapping, a reconstructed route path, and contextual points of interest to tell the story of how granite shaped this landscape.`,
  },
  {
    heading: 'A short history of The Metals',
    body: `Construction of Dún Laoghaire (then Kingstown) Harbour began in 1817, requiring enormous quantities of granite. To transport stone from Dalkey Quarry to the harbour — a descent of roughly 90 metres over 2.5 kilometres — a purpose-built wagonway was laid. Known locally as The Metals, it used three gravity-powered inclines separated by level horse-drawn sections.\n\nBlocks of granite were loaded onto cars at the quarry face and drawn by horse to the head of Incline No. 1. There the cars were attached to an endless chain and descended under gravity, their weight hauling empty cars back up on the other track. The same process was repeated at Inclines No. 2 and No. 3. At the foot of the third incline, horses took over again, drawing the loaded cars along a level section to the harbour.\n\nThe line operated from around 1817 until quarrying ceased in the 1850s. After closure it gradually passed into public use as a footpath and cycleway, and today forms part of a well-walked amenity route between Dalkey and Dún Laoghaire.`,
  },
  {
    heading: 'Technology & approach',
    body: `The terrain model is built from LiDAR (Light Detection and Ranging) data captured by aerial survey. The raw elevation data was processed into a 16-bit grayscale heightmap and rendered in the browser using a WebGL displacement mesh — a technique that produces smooth, GPU-accelerated terrain without transferring any 3D geometry from the server.\n\nThe route path was digitised from historical sources and georeferenced against Irish Transverse Mercator (ITM / EPSG:2157) coordinates. The 1837 Ordnance Survey of Ireland map layer was georectified to the same coordinate system and drapes precisely over the terrain surface.\n\nThe stack: Next.js 15 · React 19 · Three.js · React Three Fiber · React Three Drei.`,
  },
  {
    heading: 'Sources & references',
    body: null, // rendered separately as a list
    references: [
      {
        label: 'Rob Goodbody',
        detail: 'The Metals: from Dalkey to Dún Laoghaire. Dún Laoghaire Rathdown County Council, 2010.',
      },
      {
        label: 'Ordnance Survey Ireland',
        detail: '1837 six-inch map series. Georeferenced overlay reproduced for non-commercial educational purposes.',
      },
      {
        label: 'Google Satellite imagery',
        detail: 'Colour texture derived from Google Maps satellite layer.',
      },
      {
        label: 'Geological Survey Ireland / Tailte Éireann',
        detail: 'Airborne LiDAR terrain data, Irish Transverse Mercator projection (EPSG:2157).',
      },
    ],
  },
];

export default function InfoModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '24px 16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'rgba(12,12,12,0.96)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          padding: '28px 28px 32px',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 22,
            lineHeight: 1,
            cursor: 'pointer',
            padding: 4,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        <h1 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#e8c84a', paddingRight: 32 }}>
          Visualising the Metals
        </h1>

        {SECTIONS.map((section) => (
          <section key={section.heading} style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)' }}>
              {section.heading}
            </h2>

            {section.body && section.body.split('\n\n').map((para, i) => (
              <p key={i} style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>
                {para}
              </p>
            ))}

            {section.references && (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {section.references.map((ref) => (
                  <li key={ref.label} style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ fontWeight: 600 }}>{ref.label}. </span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{ref.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            width: '100%',
            padding: '10px 0',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
