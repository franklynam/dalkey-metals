"use client";

const SECTIONS = [
  {
    heading: "About this project",
    body: `This interactive visualisation places you inside a high-resolution LiDAR terrain model of the coastline between Dalkey Quarry and Dun Laoghaire Harbour — the route followed by The Metals, one of Ireland's earliest railways. The project overlays georeferenced historical mapping, a reconstructed route path, and contextual points of interest to tell the story of how excavated granite was shipped from the quarry down to the port at Dun Laoghaire.`,
  },
  {
    heading: "How to use this visualisation",
    body: `On desktop: drag to orbit the terrain, scroll to move forward and back, right-click drag to pan.\n\nOn mobile: drag to orbit, pinch to zoom, two-finger drag to pan, double-tap to reset the view.\n\nClick the red pins to read about points of interest along the route. Use the layers button to switch between satellite imagery and the 1837 Ordnance Survey map.`,
  },
  {
    heading: "A short history of The Metals",
    body: `Construction of Dun Laoghaire (then Kingstown) Harbour began in 1817, requiring enormous quantities of granite. To transport stone from Dalkey Quarry to the harbour — a descent of roughly 90 metres over 2.5 kilometres — a purpose-built wagonway was laid. Known locally as The Metals, it used three gravity-powered inclines separated by level horse-drawn sections.\n\nBlocks of granite were loaded onto cars at the quarry face and drawn by horse to the head of a first incline stage. There the cars were attached to an endless chain and descended under gravity, their weight hauling empty cars back up on the other track. The same process was repeated at inclines 2 and 3. At the foot of the third incline, horses took over again, drawing the loaded cars along a relatively level section down to the harbour.\n\nThe line operated from around 1817 until quarrying ceased in the 1850s. After closure it gradually passed into public use as a footpath and cycleway, and today forms part of a well-walked amenity route between Dalkey and Dun Laoghaire.`,
  },
  {
    heading: "How was this made?",
    body: `The terrain model is built using LiDAR (Light Detection and Ranging) data captured by aerial survey. The raw elevation data was processed into a 16-bit grayscale heightmap and rendered in the browser using a WebGL displacement mesh — a technique that produces smooth, GPU-accelerated terrain without transferring any 3D geometry from the server.\n\nThe route path was digitised from historical sources and georeferenced against Irish Transverse Mercator (ITM / EPSG:2157) coordinates. The 1837 Ordnance Survey of Ireland map layer was georectified to the same coordinate system and drapes over the terrain surface.\n\nThe majority of this project was created by vibe coding with Claude Code and researching using Gemini. While I have built many React apps in the past, it's been a while since I've used GIS tools like QGIS or ArcGIS and so I was interested in finding out how LLMs might help with multi-tool pipelines such as this. I was really taken aback by how well Gemini 3 performed as a guide to using QGIS and to sourcing data such as the LiDAR terrain model. I remember from my days in academia how mastering these sorts of workflows could take days of frustrating trial and error. And now, an LLM can help shorten that learning cycle significantly.\n\nOne of the most talked about dangers of going all in on the AI hype train has been that the use of these tools will inevitably make us lazier and less creative and believe me I am seriously concerned about this having noticed big changes in the way that I do things over the last 6 months. But here is an example of how the use of LLMs allowed me to achieve a complex outcome in a realtively short space of time, while at the same time I think that my proficiency in the use of QGIS is now back to a reasonable level. OK, I could have done it the old way, made the mistakes and learnt the hard lessons but I honestly feel in this case that the outcome would have been similar, i.e. that I would have built something interesting, learnt a lot about QGIS, open data sources in this historical domain and React Three Fiber.\n\nTech stack: Next.js 15 · React 19 · Three.js · React Three Fiber · React Three Drei.\n\nCI/CD: AWS Amplify GitHub integration`,
  },
  {
    heading: "Sources & references",
    body: null,
    references: [
      {
        label: "Rob Goodbody",
        detail:
          "The Metals: from Dalkey to Dún Laoghaire. Dún Laoghaire Rathdown County Council, 2010.",
      },
      {
        label: "Joseph Brennan",
        detail:
          "The Atmospheric Road: Explorations in England, Ireland, and France. 2020.",
        url: "https://www.columbia.edu/~brennan/atmo/03_METALS.html",
      },
      {
        label: "National Library of Scotland",
        detail:
          "1837 six-inch map series. Georeferenced overlay reproduced with the permission of the National Library of Scotland.",
        url: "https://maps.nls.uk/view/246835538",
      },
      {
        label: "Google Satellite imagery",
        detail:
          "Imagery ©2026 Airbus, Landsat / Copernicus, Maxar Technologies, Map data ©2026 Google.",
      },
      {
        label: "Geological Survey Ireland",
        detail:
          "Airborne LiDAR terrain data, Irish Transverse Mercator projection (EPSG:2157).",
        url: "https://dcenr.maps.arcgis.com/apps/webappviewer",
      },
    ],
  },
  {
    heading: "Metadata",
    body: `Time invested: 1 day in total\n\nLast modified: __LAST_MODIFIED__\n\nStatus: alpha complete\n\nKeywords: Ireland, history, LiDAR, GIS, WebGL, React, Three.js, React Three Fiber, React Three Drei`,
  },
];

export default function InfoModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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
          <span className="ml-2 text-sm font-normal text-white/35">
            v{process.env.NEXT_PUBLIC_VERSION}
          </span>
        </h1>

        {SECTIONS.map((section) => (
          <section key={section.heading} className="mb-6">
            <h2 className="m-0 mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-white/45">
              {section.heading}
            </h2>

            {section.body &&
              (section.heading === "Metadata"
                ? section.body.replace(
                    "__LAST_MODIFIED__",
                    process.env.NEXT_PUBLIC_LAST_MODIFIED ?? "—",
                  )
                : section.body
              )
                .split("\n\n")
                .map((para, i) => (
                  <p
                    key={i}
                    className="m-0 mb-2.5 text-sm leading-[1.7] text-white/85"
                  >
                    {para}
                  </p>
                ))}

            {section.references && (
              <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
                {section.references.map((ref) => (
                  <li
                    key={ref.label}
                    className="text-sm leading-relaxed text-white/85"
                  >
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gold hover:underline"
                      >
                        {ref.label}
                      </a>
                    ) : (
                      <span className="font-semibold">{ref.label}</span>
                    )}
                    {". "}
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
