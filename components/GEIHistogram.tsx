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
import { useTheme } from "./ThemeProvider";

interface Props {
  games: Game[];
}

export default function GEIHistogram({ games }: Props) {
  const { theme } = useTheme();
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

  const tickColor = theme === "dark" ? "#9ca3af" : "#6b7280";
  const tooltipBg = theme === "dark" ? "#1f2937" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#374151" : "#e5e7eb";
  const tooltipLabel = theme === "dark" ? "#9ca3af" : "#6b7280";
  const tooltipItem = theme === "dark" ? "#e5e7eb" : "#1f2937";

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis
            dataKey="range"
            tick={{ fontSize: 10, fill: tickColor }}
            interval={3}
            label={{ value: "GEI", position: "bottom", offset: 0, fontSize: 12, fill: tickColor }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: tickColor }}
            label={{ value: "Games", angle: -90, position: "insideLeft", fontSize: 12, fill: tickColor }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "6px" }}
            labelStyle={{ color: tooltipLabel }}
            itemStyle={{ color: tooltipItem }}
            formatter={(value) => [String(value), "Games"]}
            labelFormatter={(label) => `GEI: ${label}`}
          />
          <ReferenceLine x="1.0" stroke="#6b7280" strokeDasharray="3 3" />
          <ReferenceLine x="4.0" stroke="#f59e0b" strokeDasharray="3 3" />
          <ReferenceLine x="8.0" stroke="#dc2626" strokeDasharray="3 3" />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {bins.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.midpoint)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
