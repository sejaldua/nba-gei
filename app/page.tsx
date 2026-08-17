"use client";

import { useEffect, useState } from "react";
import { Game } from "@/lib/types";
import { GEI_CATEGORIES } from "@/lib/constants";
import GEIHistogram from "@/components/GEIHistogram";
import SeasonSelector from "@/components/SeasonSelector";

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  useEffect(() => {
    fetch("/data/gei_by_game.json")
      .then((r) => r.json())
      .then(setGames);
  }, []);

  const filtered = selectedSeason
    ? games.filter((g) => g.season === selectedSeason)
    : games;

  const stats = {
    total: filtered.length,
    mean: filtered.length
      ? (filtered.reduce((s, g) => s + g.gei, 0) / filtered.length).toFixed(2)
      : "0",
    heartPounders: filtered.filter((g) => g.category === "heart_pounder").length,
    thrillers: filtered.filter((g) => g.category === "thriller").length,
    duds: filtered.filter((g) => g.category === "dud").length,
  };

  return (
    <div className="space-y-14">
      <section className="pt-8 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight text-stone-900">
          How exciting was every NBA game?
        </h1>
        <p className="text-[15px] text-stone-500 max-w-lg leading-relaxed">
          Measuring total win probability volatility across {filtered.length.toLocaleString()} games
          to find the ones worth rewatching.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-stone-400">Methodology</h2>
        <div className="text-sm text-stone-600 space-y-3 leading-relaxed">
          <p>
            GEI sums the absolute changes in win probability between consecutive
            plays, normalized to a standard 48-minute game:
          </p>
          <div className="bg-white/60 rounded-lg px-4 py-3 font-mono text-sm text-center border border-stone-200">
            GEI = (2880 / t) &times; &Sigma; |p<sub>i</sub> &minus; p<sub>i-1</sub>|
          </div>
          <div className="flex gap-2 pt-1 flex-wrap">
            {Object.entries(GEI_CATEGORIES).map(([key, cat]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/60 border border-stone-200 text-stone-600"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.label}
                <span className="text-stone-400">
                  {key === "dud" ? "<1" : `>${cat.threshold}`}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wide text-stone-400">Distribution</h2>
          <SeasonSelector selected={selectedSeason} onChange={setSelectedSeason} />
        </div>

        {filtered.length > 0 && <GEIHistogram games={filtered} />}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 pt-2">
          <Stat label="Games" value={stats.total.toLocaleString()} />
          <Stat label="Mean GEI" value={stats.mean} />
          <Stat label="Heart Pounders" value={stats.heartPounders} accent="#dc2626" />
          <Stat label="Thrillers" value={stats.thrillers} accent="#d97706" />
          <Stat label="Duds" value={stats.duds} />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">{label}</div>
      <div className="text-xl font-semibold tabular-nums" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
    </div>
  );
}
