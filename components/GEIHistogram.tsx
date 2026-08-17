"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Game } from "@/lib/types";
import { GEI_CATEGORIES } from "@/lib/constants";

interface Props {
  games: Game[];
}

export default function GEIHistogram({ games }: Props) {
  const binSize = 0.5;
  const maxGEI = Math.min(Math.ceil(Math.max(...games.map((g) => g.gei))), 20);
  const bins: { range: string; count: number; midpoint: number }[] = [];

  for (let i = 0; i < maxGEI; i += binSize) {
    const count = games.filter(
      (g) => g.gei >= i && g.gei < i + binSize
    ).length;
    bins.push({
      range: `${i.toFixed(1)}`,
      count,
      midpoint: i + binSize / 2,
    });
  }

  const getBarColor = (midpoint: number) => {
    if (midpoint > GEI_CATEGORIES.heart_pounder.threshold)
      return GEI_CATEGORIES.heart_pounder.color;
    if (midpoint > GEI_CATEGORIES.thriller.threshold)
      return GEI_CATEGORIES.thriller.color;
    if (midpoint > GEI_CATEGORIES.average.threshold)
      return GEI_CATEGORIES.average.color;
    return GEI_CATEGORIES.dud.color;
  };

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
          <XAxis
            dataKey="range"
            tick={{ fontSize: 9, fill: "#a8a29e" }}
            interval={3}
            axisLine={{ stroke: "#d6d3d1", strokeWidth: 0.5 }}
            tickLine={false}
            label={{ value: "GEI", position: "bottom", offset: 2, fontSize: 10, fill: "#a8a29e" }}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#a8a29e" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#fafaf9", border: "1px solid #d6d3d1", borderRadius: "4px", fontSize: "12px" }}
            labelStyle={{ color: "#78716c" }}
            formatter={(value) => [String(value), "Games"]}
            labelFormatter={(label) => `GEI: ${label}`}
          />
          <ReferenceLine x="1.0" stroke="#d6d3d1" strokeDasharray="2 2" strokeWidth={0.5} />
          <ReferenceLine x="4.0" stroke="#d97706" strokeDasharray="2 2" strokeWidth={0.5} />
          <ReferenceLine x="8.0" stroke="#dc2626" strokeDasharray="2 2" strokeWidth={0.5} />
          <Bar dataKey="count" radius={[1, 1, 0, 0]}>
            {bins.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.midpoint)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
