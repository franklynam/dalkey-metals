"use client";

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 7v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="4.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export default function TitleCard({ onInfo }) {
  return (
    <div className="absolute top-5 left-5 flex items-center gap-2.5 bg-black/40 backdrop-blur border border-white/15 rounded-[10px] py-2.5 px-3.5 select-none">
      <img
        src="/metals-logo.png"
        alt="The Metals sign"
        className="h-8 w-auto rounded block border border-white"
      />

      <span className="text-white text-[15px] font-semibold tracking-[0.01em] whitespace-nowrap">
        Visualising the Metals
      </span>

      <button
        onClick={onInfo}
        className="bg-transparent border-0 text-white/60 cursor-pointer p-0 flex items-center shrink-0"
        aria-label="About"
      >
        <InfoIcon />
      </button>
    </div>
  );
}
