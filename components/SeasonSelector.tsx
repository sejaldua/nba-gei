"use client";

import { SEASONS } from "@/lib/constants";

interface Props {
  selected: number | null;
  onChange: (season: number | null) => void;
}

export default function SeasonSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 text-sm">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-md transition-colors ${
          selected === null
            ? "bg-blue-600 text-white"
            : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        All
      </button>
      {SEASONS.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-3 py-1 rounded-md transition-colors ${
            selected === s.value
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
