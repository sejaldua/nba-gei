"use client";

import { useEffect, useState } from "react";
import { Game } from "@/lib/types";
import { BASE_PATH } from "@/lib/basePath";
import SeasonSelector from "@/components/SeasonSelector";
import TopGamesTable from "@/components/TopGamesTable";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [teamFilter, setTeamFilter] = useState("");
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetch(`${BASE_PATH}/data/gei_by_game.json`)
      .then((r) => r.json())
      .then(setGames);
  }, []);

  const teams = [...new Set(games.flatMap((g) => [g.home_team, g.away_team]))].sort();

  const filtered = games
    .filter((g) => !selectedSeason || g.season === selectedSeason)
    .filter(
      (g) =>
        !teamFilter || g.home_team === teamFilter || g.away_team === teamFilter
    )
    .slice(0, limit);

  return (
    <div className="space-y-8 pt-4">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Games</h1>
        <p className="text-sm text-stone-500 mt-1">
          Click any row to see its win probability chart.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <SeasonSelector selected={selectedSeason} onChange={setSelectedSeason} />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white/60 text-stone-700"
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white/60 text-stone-700"
        >
          <option value={25}>Top 25</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
          <option value={250}>Top 250</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <TopGamesTable games={filtered} />
      ) : (
        <p className="text-stone-400 py-12 text-center text-sm">Loading games...</p>
      )}
    </div>
  );
}
