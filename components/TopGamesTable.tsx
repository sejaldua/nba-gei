"use client";

import { Fragment, useState } from "react";
import { Game } from "@/lib/types";
import WinProbChart from "./WinProbChart";

interface Props {
  games: Game[];
}

type SortKey = "gei" | "date" | "margin" | "lead_changes" | "matchup" | "score";

export default function TopGamesTable({ games }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("gei");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...games].sort((a, b) => {
    const mult = sortDir === "desc" ? -1 : 1;
    switch (sortBy) {
      case "gei": return mult * (a.gei - b.gei);
      case "date": return mult * a.date.localeCompare(b.date);
      case "margin": return mult * (a.final_margin - b.final_margin);
      case "lead_changes": return mult * (a.num_lead_changes - b.num_lead_changes);
      case "matchup": return mult * `${a.away_team}${a.home_team}`.localeCompare(`${b.away_team}${b.home_team}`);
      case "score": return mult * ((a.home_score + a.away_score) - (b.home_score + b.away_score));
      default: return 0;
    }
  });

  const handleSort = (col: SortKey) => {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir(col === "date" || col === "matchup" ? "asc" : "desc");
    }
  };

  const SortIndicator = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return <span className="text-stone-300 ml-0.5">&#8597;</span>;
    return <span className="text-stone-700 ml-0.5">{sortDir === "desc" ? "↓" : "↑"}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-stone-400 border-b border-stone-300">
            <th className="py-2 pr-3 text-left font-medium w-8">#</th>
            <th className="py-2 pr-3 text-left font-medium cursor-pointer select-none" onClick={() => handleSort("date")}>
              Date<SortIndicator col="date" />
            </th>
            <th className="py-2 pr-3 text-left font-medium cursor-pointer select-none" onClick={() => handleSort("matchup")}>
              Matchup<SortIndicator col="matchup" />
            </th>
            <th className="py-2 pr-3 text-left font-medium cursor-pointer select-none" onClick={() => handleSort("score")}>
              Score<SortIndicator col="score" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("gei")}>
              GEI<SortIndicator col="gei" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("margin")}>
              Margin<SortIndicator col="margin" />
            </th>
            <th className="py-2 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("lead_changes")}>
              Leads<SortIndicator col="lead_changes" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((game, i) => (
            <Fragment key={game.game_id}>
              <tr
                className="border-b border-stone-200 hover:bg-white/50 cursor-pointer transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === game.game_id ? null : game.game_id)
                }
              >
                <td className="py-2 pr-3 text-stone-400 tabular-nums text-xs">{i + 1}</td>
                <td className="py-2 pr-3 text-stone-500 font-mono text-xs tabular-nums">
                  {game.date}
                </td>
                <td className="py-2 pr-3 font-medium text-stone-800">
                  {game.away_team} @ {game.home_team}
                  {game.overtime && (
                    <span className="ml-1.5 text-[10px] font-medium text-stone-400">OT</span>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-xs tabular-nums text-stone-600">
                  {game.away_score}-{game.home_score}
                </td>
                <td className="py-2 pr-3 text-right font-semibold tabular-nums text-stone-900">
                  {game.gei.toFixed(2)}
                </td>
                <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-stone-500">
                  {game.final_margin}
                </td>
                <td className="py-2 text-right tabular-nums text-stone-500">
                  {game.num_lead_changes}
                </td>
              </tr>
              {expandedId === game.game_id && (
                <tr>
                  <td colSpan={7} className="py-4 bg-white/40 border-b border-stone-200">
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
