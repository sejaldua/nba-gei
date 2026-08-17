"use client";

import { useState } from "react";
import { TeamAggregate } from "@/lib/types";
import { GEI_CATEGORIES } from "@/lib/constants";

interface Props {
  teams: TeamAggregate[];
}

type SortKey = "team" | "season" | "games_played" | "median_gei" | "mean_gei" | "max_gei" | "heart_pounders" | "thrillers" | "average_games" | "duds";

export default function TeamRankings({ teams }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("median_gei");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...teams].sort((a, b) => {
    const mult = sortDir === "desc" ? -1 : 1;
    if (sortBy === "team") return mult * a.team.localeCompare(b.team);
    return mult * (a[sortBy] - b[sortBy]);
  });

  const handleSort = (col: SortKey) => {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir(col === "team" ? "asc" : "desc");
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
            <th className="py-2 pr-3 text-left font-medium cursor-pointer select-none" onClick={() => handleSort("team")}>
              Team<SortIndicator col="team" />
            </th>
            <th className="py-2 pr-3 text-left font-medium cursor-pointer select-none" onClick={() => handleSort("season")}>
              Season<SortIndicator col="season" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("games_played")}>
              GP<SortIndicator col="games_played" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("median_gei")}>
              Median<SortIndicator col="median_gei" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("mean_gei")}>
              Mean<SortIndicator col="mean_gei" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("max_gei")}>
              Max<SortIndicator col="max_gei" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("heart_pounders")}>
              HP<SortIndicator col="heart_pounders" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("thrillers")}>
              Thrillers<SortIndicator col="thrillers" />
            </th>
            <th className="py-2 pr-3 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("average_games")}>
              Avg<SortIndicator col="average_games" />
            </th>
            <th className="py-2 text-right font-medium cursor-pointer select-none" onClick={() => handleSort("duds")}>
              Duds<SortIndicator col="duds" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => (
            <tr
              key={`${team.team}-${team.season}`}
              className="border-b border-stone-200 hover:bg-white/50 transition-colors"
            >
              <td className="py-2 pr-3 text-stone-400 tabular-nums text-xs">{i + 1}</td>
              <td className="py-2 pr-3 font-medium text-stone-800">{team.team}</td>
              <td className="py-2 pr-3 text-stone-500 text-xs tabular-nums">{team.season}-{String(team.season + 1).slice(-2)}</td>
              <td className="py-2 pr-3 text-right text-stone-500 tabular-nums">{team.games_played}</td>
              <td className="py-2 pr-3 text-right font-semibold tabular-nums" style={{ color: getGEIColor(team.median_gei) }}>
                {team.median_gei.toFixed(2)}
              </td>
              <td className="py-2 pr-3 text-right text-stone-600 tabular-nums">
                {team.mean_gei.toFixed(2)}
              </td>
              <td className="py-2 pr-3 text-right text-stone-500 tabular-nums">
                {team.max_gei.toFixed(2)}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums" style={{ color: GEI_CATEGORIES.heart_pounder.color }}>
                {team.heart_pounders}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums" style={{ color: GEI_CATEGORIES.thriller.color }}>
                {team.thrillers}
              </td>
              <td className="py-2 pr-3 text-right text-stone-500 tabular-nums">
                {team.average_games}
              </td>
              <td className="py-2 text-right text-stone-400 tabular-nums">
                {team.duds}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getGEIColor(gei: number): string {
  if (gei > 8) return GEI_CATEGORIES.heart_pounder.color;
  if (gei > 4) return GEI_CATEGORIES.thriller.color;
  if (gei > 1) return GEI_CATEGORIES.average.color;
  return GEI_CATEGORIES.dud.color;
}
