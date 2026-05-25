"use client";

import { useContentStore } from "../../stores/useContentStore";

export function EventCard() {
  const eventItem = useContentStore((s) => s.eventItem);

  if (!eventItem?.isActive) return null;

  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-5 py-3 bg-surface"
      style={{
        borderLeft: "3px solid var(--color-secondary)",
      }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-6 w-6"
          style={{ color: "var(--color-secondary)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
      </div>
      <div>
        <p className="font-semibold tracking-widest uppercase text-sm text-secondary">
          {eventItem.title || "Info Acara"}
        </p>
        <p className="mt-0.5 text-white/80 text-lg">{eventItem.description}</p>
      </div>
    </div>
  );
}
