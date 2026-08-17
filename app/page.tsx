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
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Game Excitement Index
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
          Quantifying how exciting NBA games are by measuring the total
          volatility in win probability throughout each game.
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <h2 className="text-xl font-semibold">Methodology</h2>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
          <p>
            Game Excitement Index (GEI) captures how much a game&apos;s outcome
            swung back and forth. It sums the absolute changes in win
            probability between consecutive plays, normalized to a standard
            48-minute game:
          </p>
          <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 font-mono text-center text-base">
            GEI = (2880 / t) &times; &Sigma; |p<sub>i</sub> &minus; p<sub>i-1</sub>|
          </div>
          <p>
            Where <span className="font-mono text-xs">t</span> is the game
            length in seconds,{" "}
            <span className="font-mono text-xs">p<sub>i</sub></span> is the
            home team&apos;s win probability at play{" "}
            <span className="font-mono text-xs">i</span>. Normalizing by game
            length prevents sloppy overtime games from ranking artificially
            high.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {Object.entries(GEI_CATEGORIES).map(([key, cat]) => (
              <div
                key={key}
                className="rounded-md border border-gray-200 dark:border-gray-800 p-3 text-center"
              >
                <div
                  className="text-xs font-semibold mb-1"
                  style={{ color: cat.color }}
                >
                  {cat.label}
                </div>
                <div className="text-xs text-gray-500">
                  GEI {key === "dud" ? "< 1" : `> ${cat.threshold}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">GEI Distribution</h2>
          <SeasonSelector
            selected={selectedSeason}
            onChange={setSelectedSeason}
          />
        </div>

        {filtered.length > 0 && <GEIHistogram games={filtered} />}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
          <StatCard label="Games" value={stats.total} />
          <StatCard label="Mean GEI" value={stats.mean} />
          <StatCard
            label="Heart Pounders"
            value={stats.heartPounders}
            color="#dc2626"
          />
          <StatCard
            label="Thrillers"
            value={stats.thrillers}
            color="#f59e0b"
          />
          <StatCard label="Duds" value={stats.duds} color="#374151" />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
