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
    body: null,
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
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[640px] bg-[rgba(12,12,12,0.96)] border border-white/15 rounded-xl px-7 pt-7 pb-8 text-white relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-0 text-white/50 text-[22px] leading-none cursor-pointer p-1"
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        <h1 className="m-0 mb-6 text-xl font-bold text-gold pr-8">
          Visualising the Metals
        </h1>

        {SECTIONS.map((section) => (
          <section key={section.heading} className="mb-6">
            <h2 className="m-0 mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-white/45">
              {section.heading}
            </h2>

            {section.body && section.body.split('\n\n').map((para, i) => (
              <p key={i} className="m-0 mb-2.5 text-sm leading-[1.7] text-white/85">
                {para}
              </p>
            ))}

            {section.references && (
              <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
                {section.references.map((ref) => (
                  <li key={ref.label} className="text-sm leading-relaxed text-white/85">
                    <span className="font-semibold">{ref.label}. </span>
                    <span className="text-white/60">{ref.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <button
          onClick={onClose}
          className="mt-2 w-full py-2.5 bg-white/8 border border-white/20 rounded-lg text-white text-sm cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
