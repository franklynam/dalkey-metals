'use client';

export default function InfoPanel({ poi, onClose }) {
  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/88 backdrop-blur border border-white/15 rounded-[10px] py-4 px-5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[100]"
      style={{ width: 'min(420px, calc(100vw - 32px))' }}
    >
      <div className="flex justify-between items-start gap-3">
        <h2 className="m-0 text-base font-semibold text-gold">
          {poi.title}
        </h2>
        <button
          onClick={onClose}
          className="bg-transparent border-0 text-white/60 text-xl cursor-pointer p-0 leading-none shrink-0"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <p className="mt-2.5 mb-0 text-sm leading-relaxed text-white/85">
        {poi.body}
      </p>
    </div>
  );
}
