"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Game } from "@/lib/types";

interface Props {
  games: Game[];
}

export default function GEIHistogram({ games }: Props) {
  const binSize = 0.5;
  const maxGEI = Math.min(Math.ceil(Math.max(...games.map((g) => g.gei))), 18);

  const games2024 = games.filter((g) => g.season === 2024);
  const games2025 = games.filter((g) => g.season === 2025);

  const bins: { gei: number; "2024-25": number; "2025-26": number }[] = [];

  for (let i = 0; i < maxGEI; i += binSize) {
    bins.push({
      gei: i + binSize / 2,
      "2024-25": games2024.filter((g) => g.gei >= i && g.gei < i + binSize).length,
      "2025-26": games2025.filter((g) => g.gei >= i && g.gei < i + binSize).length,
    });
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={bins} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
          <XAxis
            dataKey="gei"
            tick={{ fontSize: 9, fill: "#a8a29e" }}
            axisLine={{ stroke: "#d6d3d1", strokeWidth: 0.5 }}
            tickLine={false}
            type="number"
            domain={[0, maxGEI]}
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
            labelFormatter={(v) => `GEI: ${Number(v).toFixed(1)}`}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#78716c", paddingTop: "8px" }}
            iconType="plainline"
          />
          <Line
            type="monotone"
            dataKey="2024-25"
            stroke="#1c1917"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="2025-26"
            stroke="#a8a29e"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
