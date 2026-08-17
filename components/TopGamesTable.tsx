"use client";

import { Fragment, useState } from "react";
import { Game } from "@/lib/types";
import { GEI_CATEGORIES } from "@/lib/constants";
import WinProbChart from "./WinProbChart";

interface Props {
  games: Game[];
}

export default function TopGamesTable({ games }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"gei" | "date" | "margin">("gei");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...games].sort((a, b) => {
    const mult = sortDir === "desc" ? -1 : 1;
    if (sortBy === "gei") return mult * (a.gei - b.gei);
    if (sortBy === "date") return mult * a.date.localeCompare(b.date);
    return mult * (a.final_margin - b.final_margin);
  });

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const getCategoryColor = (category: string) => {
    return GEI_CATEGORIES[category as keyof typeof GEI_CATEGORIES]?.color || "#6b7280";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-500">
            <th className="py-2 pr-4">#</th>
            <th
              className="py-2 pr-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => handleSort("date")}
            >
              Date {sortBy === "date" && (sortDir === "desc" ? "↓" : "↑")}
            </th>
            <th className="py-2 pr-4">Matchup</th>
            <th className="py-2 pr-4">Score</th>
            <th
              className="py-2 pr-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => handleSort("gei")}
            >
              GEI {sortBy === "gei" && (sortDir === "desc" ? "↓" : "↑")}
            </th>
            <th
              className="py-2 pr-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => handleSort("margin")}
            >
              Margin {sortBy === "margin" && (sortDir === "desc" ? "↓" : "↑")}
            </th>
            <th className="py-2">Lead Changes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((game, i) => (
            <Fragment key={game.game_id}>
              <tr
                className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                onClick={() =>
                  setExpandedId(
                    expandedId === game.game_id ? null : game.game_id
                  )
                }
              >
                <td className="py-2 pr-4 text-gray-500">{i + 1}</td>
                <td className="py-2 pr-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                  {game.date}
                </td>
                <td className="py-2 pr-4 font-medium">
                  {game.away_team} @ {game.home_team}
                  {game.overtime && (
                    <span className="ml-2 text-xs text-yellow-500">OT</span>
                  )}
                </td>
                <td className="py-2 pr-4 font-mono">
                  {game.away_score}-{game.home_score}
                </td>
                <td className="py-2 pr-4 font-bold" style={{ color: getCategoryColor(game.category) }}>
                  {game.gei.toFixed(2)}
                </td>
                <td className="py-2 pr-4 font-mono text-gray-500 dark:text-gray-400">
                  {game.final_margin}
                </td>
                <td className="py-2 text-gray-500 dark:text-gray-400">{game.num_lead_changes}</td>
              </tr>
              {expandedId === game.game_id && (
                <tr>
                  <td colSpan={7} className="py-4 px-4 bg-gray-50 dark:bg-gray-900/50">
                    <WinProbChart
                      gameId={game.game_id}
                      homeTeam={game.home_team}
                      awayTeam={game.away_team}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
