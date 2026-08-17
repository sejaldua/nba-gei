"use client";

import { SEASONS } from "@/lib/constants";

interface Props {
  selected: number | null;
  onChange: (season: number | null) => void;
}

export default function SeasonSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1 text-xs">
      <button
        onClick={() => onChange(null)}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          selected === null
            ? "bg-stone-800 text-white"
            : "text-stone-500 hover:text-stone-800"
        }`}
      >
        All
      </button>
      {SEASONS.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            selected === s.value
              ? "bg-stone-800 text-white"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
