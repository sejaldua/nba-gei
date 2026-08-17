"use client";

import { useState } from "react";
import { TeamAggregate } from "@/lib/types";
import { GEI_CATEGORIES } from "@/lib/constants";

interface Props {
  teams: TeamAggregate[];
}

type SortKey = "median_gei" | "mean_gei" | "max_gei" | "heart_pounders" | "duds" | "games_played";

export default function TeamRankings({ teams }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("median_gei");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...teams].sort((a, b) => {
    const mult = sortDir === "desc" ? -1 : 1;
    return mult * (a[sortBy] - b[sortBy]);
  });

  const handleSort = (col: SortKey) => {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className="py-2 pr-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 text-right"
      onClick={() => handleSort(col)}
    >
      {label} {sortBy === col && (sortDir === "desc" ? "↓" : "↑")}
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-500">
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Team</th>
            <SortHeader col="games_played" label="GP" />
            <SortHeader col="median_gei" label="Median" />
            <SortHeader col="mean_gei" label="Mean" />
            <SortHeader col="max_gei" label="Max" />
            <SortHeader col="heart_pounders" label="HP" />
            <th className="py-2 pr-4 text-right text-xs">Thrillers</th>
            <th className="py-2 pr-4 text-right text-xs">Average</th>
            <SortHeader col="duds" label="Duds" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => (
            <tr
              key={`${team.team}-${team.season}`}
              className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <td className="py-2 pr-4 text-gray-500">{i + 1}</td>
              <td className="py-2 pr-4 font-medium">{team.team}</td>
              <td className="py-2 pr-4 text-right text-gray-500 dark:text-gray-400">{team.games_played}</td>
              <td className="py-2 pr-4 text-right font-bold" style={{ color: getGEIColor(team.median_gei) }}>
                {team.median_gei.toFixed(2)}
              </td>
              <td className="py-2 pr-4 text-right text-gray-700 dark:text-gray-300">
                {team.mean_gei.toFixed(2)}
              </td>
              <td className="py-2 pr-4 text-right text-gray-500 dark:text-gray-400">
                {team.max_gei.toFixed(2)}
              </td>
              <td className="py-2 pr-4 text-right" style={{ color: GEI_CATEGORIES.heart_pounder.color }}>
                {team.heart_pounders}
              </td>
              <td className="py-2 pr-4 text-right" style={{ color: GEI_CATEGORIES.thriller.color }}>
                {team.thrillers}
              </td>
              <td className="py-2 pr-4 text-right text-gray-500 dark:text-gray-400">
                {team.average_games}
              </td>
              <td className="py-2 pr-4 text-right text-gray-500">
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
