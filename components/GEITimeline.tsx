"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Game } from "@/lib/types";
import { GEI_CATEGORIES } from "@/lib/constants";

interface Props {
  games: Game[];
  season: number;
}

function getCategoryColor(gei: number): string {
  if (gei >= GEI_CATEGORIES.heart_pounder.threshold) return GEI_CATEGORIES.heart_pounder.color;
  if (gei >= GEI_CATEGORIES.thriller.threshold) return GEI_CATEGORIES.thriller.color;
  if (gei >= GEI_CATEGORIES.average.threshold) return GEI_CATEGORIES.average.color;
  return GEI_CATEGORIES.dud.color;
}

export default function GEITimeline({ games, season }: Props) {
  const seasonGames = games
    .filter((g) => g.season === season)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!seasonGames.length) return null;

  const data = seasonGames.map((g) => ({
    date: new Date(g.date).getTime(),
    gei: g.gei,
    label: `${g.away_team} @ ${g.home_team}`,
    dateStr: g.date,
    score: `${g.away_score}-${g.home_score}`,
    overtime: g.overtime,
  }));

  const mean = data.reduce((s, d) => s + d.gei, 0) / data.length;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short" });
  };

  const startDate = data[0].date;
  const endDate = data[data.length - 1].date;
  const ticks: number[] = [];
  const d = new Date(startDate);
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  while (d.getTime() < endDate) {
    ticks.push(d.getTime());
    d.setMonth(d.getMonth() + 1);
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 5 }}>
          <XAxis
            dataKey="date"
            type="number"
            domain={[startDate, endDate]}
            tick={{ fontSize: 9, fill: "#a8a29e" }}
            tickFormatter={formatDate}
            ticks={ticks}
            axisLine={{ stroke: "#d6d3d1", strokeWidth: 0.5 }}
            tickLine={false}
          />
          <YAxis
            dataKey="gei"
            tick={{ fontSize: 9, fill: "#a8a29e" }}
            axisLine={false}
            tickLine={false}
            width={30}
            domain={[0, "auto"]}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-stone-200 rounded px-3 py-2 text-xs shadow-sm">
                  <div className="font-medium text-stone-800">{d.label}{d.overtime ? " (OT)" : ""}</div>
                  <div className="text-stone-500">{d.dateStr} &middot; {d.score}</div>
                  <div className="font-semibold mt-0.5">GEI: {d.gei.toFixed(2)}</div>
                </div>
              );
            }}
          />
          <ReferenceLine
            y={GEI_CATEGORIES.heart_pounder.threshold}
            stroke={GEI_CATEGORIES.heart_pounder.color}
            strokeDasharray="4 3"
            strokeWidth={0.5}
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={GEI_CATEGORIES.thriller.threshold}
            stroke={GEI_CATEGORIES.thriller.color}
            strokeDasharray="4 3"
            strokeWidth={0.5}
            strokeOpacity={0.5}
          />
          <Scatter data={data} fillOpacity={0.4} r={2.5}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getCategoryColor(entry.gei)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
