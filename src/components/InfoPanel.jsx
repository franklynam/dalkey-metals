"use client";
import { useState } from "react";

export default function InfoPanel({ poi, onClose }) {
  const [activeImage, setActiveImage] = useState(null);

  return (
    <div
      className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-black/88 backdrop-blur border border-white/15 rounded-[10px] py-4 px-5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[100]"
      style={{ width: "min(420px, calc(100vw - 32px))" }}
    >
      <div className="flex justify-between items-start gap-3">
        <h2 className="m-0 text-base font-semibold text-gold">{poi.title}</h2>
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
      {poi.images?.length > 0 &&
        (activeImage !== null ? (
          <div className="mt-3">
            <button
              onClick={() => setActiveImage(null)}
              className="bg-transparent border-0 text-white/60 text-xs cursor-pointer p-0 flex items-center gap-1 hover:text-white/90"
              aria-label="Back to gallery"
            >
              ← Back
            </button>
            <img
              src={poi.images[activeImage].src}
              alt={poi.images[activeImage].title}
              className="rounded block object-cover w-full mt-2"
              style={{ height: 216 }}
            />
            <p className="mt-1 mb-0 text-[10px] text-white/50 text-center">
              {poi.images[activeImage].title}
            </p>
          </div>
        ) : (
          <div
            className="grid gap-2 mt-3"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            {poi.images.map((image, index) => (
              <figure
                key={image.src}
                className="m-0 cursor-pointer"
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="rounded block object-cover w-full hover:opacity-80 transition-opacity"
                  style={{ height: 72 }}
                />
                <figcaption className="mt-1 text-[10px] text-white/50 text-center">
                  {image.title}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
    </div>
  );
}
