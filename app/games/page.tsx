"use client";

import { useEffect, useState } from "react";
import { Game } from "@/lib/types";
import { SEASONS } from "@/lib/constants";
import SeasonSelector from "@/components/SeasonSelector";
import TopGamesTable from "@/components/TopGamesTable";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [teamFilter, setTeamFilter] = useState("");
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetch("/data/gei_by_game.json")
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
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Most Exciting Games</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Click any game to see its win probability chart.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <SeasonSelector selected={selectedSeason} onChange={setSelectedSeason} />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-md px-3 py-1.5 border border-gray-200 dark:border-gray-700"
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-md px-3 py-1.5 border border-gray-200 dark:border-gray-700"
        >
          <option value={25}>Top 25</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <TopGamesTable games={filtered} />
      ) : (
        <p className="text-gray-500 py-8 text-center">No games loaded yet.</p>
      )}
    </div>
  );
}
