"use client";

import { useEffect, useState } from "react";
import { Game } from "@/lib/types";
import { BASE_PATH } from "@/lib/basePath";
import GEIHistogram from "@/components/GEIHistogram";
import GEITimeline from "@/components/GEITimeline";
import { SEASONS } from "@/lib/constants";

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetch(`${BASE_PATH}/data/gei_by_game.json`)
      .then((r) => r.json())
      .then(setGames);
  }, []);

  const mean = games.length
    ? (games.reduce((s, g) => s + g.gei, 0) / games.length).toFixed(2)
    : "0";
  const sorted = [...games].sort((a, b) => a.gei - b.gei);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)].gei.toFixed(2) : "0";

  return (
    <div className="space-y-14">
      <section className="pt-8 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight text-stone-900">
          How exciting was every NBA game?
        </h1>
        <div className="text-[15px] text-stone-600 max-w-2xl leading-relaxed space-y-3">
          <p>
            The Game Excitement Index (GEI) quantifies how thrilling a basketball game
            was by tracking how much the win probability swung back and forth throughout
            the contest. A game where the lead changes hands repeatedly and the outcome
            stays in doubt until the final possession scores much higher than a wire-to-wire
            blowout.
          </p>
          <p>
            Originally developed by{" "}
            <a href="https://lukebenz.com/post/gei/" className="underline underline-offset-2 text-stone-800 hover:text-stone-950 transition-colors">Luke Benz</a>
            {" "}for college basketball, this adaptation applies the same framework to the
            NBA using ESPN&apos;s play-by-play win probability estimates across {games.length.toLocaleString()} games.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-stone-400">Methodology</h2>
        <div className="text-sm text-stone-600 space-y-3 leading-relaxed">
          <p>
            Imagine taking the win probability curve and
            stretching it out flat like a piece of string. The longer the string, the
            more the game&apos;s outcome swung back and forth, and the more exciting it was
            to watch. A blowout produces a short, flat string; a back-and-forth thriller
            produces a long, tangled one.
          </p>
          <p>
            Formally, GEI sums the absolute changes in win probability between
            consecutive plays, normalized to a standard 48-minute game:
          </p>
          <div className="bg-white/60 rounded-lg px-4 py-3 font-mono text-sm text-center border border-stone-200">
            GEI = (2880 / t) &times; &Sigma; |p<sub>i</sub> &minus; p<sub>i-1</sub>|
          </div>
          <p className="text-stone-500 text-xs">
            The normalization by game length (t, in seconds) prevents overtime games
            from ranking artificially high simply for having more plays.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-stone-400">Distribution</h2>

        {games.length > 0 && <GEIHistogram games={games} />}

        <div className="grid grid-cols-3 gap-6 pt-2">
          <Stat label="Games" value={games.length.toLocaleString()} />
          <Stat label="Mean GEI" value={mean} />
          <Stat label="Median GEI" value={median} />
        </div>
      </section>

      {games.length > 0 && (
        <TimelineSection games={games} />
      )}
    </div>
  );
}

function TimelineSection({ games }: { games: Game[] }) {
  const [season, setSeason] = useState(SEASONS[0].value);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-stone-400">Excitement by Date</h2>
        <select
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
          className="text-xs bg-transparent border border-stone-300 rounded px-2 py-1 text-stone-600 focus:outline-none focus:border-stone-400"
        >
          {SEASONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <GEITimeline games={games} season={season} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
