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
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(10,10,10,0.4)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "10px 14px",
        userSelect: "none",
      }}
    >
      <img
        src="/metals-logo.png"
        alt="The Metals sign"
        style={{
          height: 32,
          width: "auto",
          borderRadius: 4,
          display: "block",
          border: "1px solid rgba(255,255,255,1)",
        }}
      />

      <span
        style={{
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        }}
      >
        Visualising the Metals
      </span>

      <button
        onClick={onInfo}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.6)",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
        aria-label="About"
      >
        <InfoIcon />
      </button>
    </div>
  );
}
