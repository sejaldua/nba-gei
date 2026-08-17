"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { WPPoint } from "@/lib/types";
import { TEAM_COLORS } from "@/lib/constants";

interface Props {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
}

function getVisibleColor(color: string): string {
  const c = color.toLowerCase();
  const tooLight = ["#c4ced4", "#ffffff", "#eee1c6", "#ffc72c", "#fdb927", "#fec524", "#fdbb30", "#f9a01b", "#f58426"];
  if (tooLight.includes(c)) return "#78716c";
  if (c === "#000000") return "#44403c";
  return color;
}

export default function WinProbChart({ gameId, homeTeam, awayTeam }: Props) {
  const [data, setData] = useState<WPPoint[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/data/wp_curves/${gameId}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [gameId]);

  if (error) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-stone-400">
        Win probability chart not available.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-stone-400">
        Loading...
      </div>
    );
  }

  const chartData = data.map((point) => ({
    elapsed: point.secondsElapsed,
    homeWinPct: point.homeWinPct * 100,
  }));

  const deduped = chartData.reduce<typeof chartData>((acc, point) => {
    if (acc.length === 0 || acc[acc.length - 1].elapsed !== point.elapsed) {
      acc.push(point);
    } else {
      acc[acc.length - 1] = point;
    }
    return acc;
  }, []);

  const rawHomeColor = TEAM_COLORS[homeTeam]?.primary || "#3b82f6";
  const rawAwayColor = TEAM_COLORS[awayTeam]?.primary || "#ef4444";
  const homeColor = getVisibleColor(rawHomeColor);
  const awayColor = getVisibleColor(rawAwayColor);

  const formatTime = (elapsed: number) => {
    if (elapsed <= 0) return "0'";
    if (elapsed <= 2880) return `${Math.round(elapsed / 60)}'`;
    const otElapsed = elapsed - 2880;
    return `OT ${Math.round(otElapsed / 60)}'`;
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={deduped} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis
            dataKey="elapsed"
            tick={{ fontSize: 9, fill: "#a8a29e" }}
            tickFormatter={formatTime}
            type="number"
            domain={[0, "dataMax"]}
            axisLine={{ stroke: "#d6d3d1", strokeWidth: 0.5 }}
            tickLine={false}
            ticks={deduped.length > 0 && deduped[deduped.length - 1].elapsed > 2880
              ? [0, 720, 1440, 2160, 2880, deduped[deduped.length - 1].elapsed]
              : [0, 720, 1440, 2160, 2880]}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: "#a8a29e" }}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#fafaf9", border: "1px solid #d6d3d1", borderRadius: "4px", fontSize: "11px" }}
            labelStyle={{ color: "#78716c" }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, "Home Win %"]}
            labelFormatter={(elapsed) => formatTime(Number(elapsed))}
          />
          <ReferenceLine y={50} stroke="#d6d3d1" strokeDasharray="3 3" strokeWidth={0.5} />
          <Line
            type="monotone"
            dataKey="homeWinPct"
            stroke={homeColor}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[10px] uppercase tracking-wide font-medium px-10">
        <span style={{ color: awayColor }}>{awayTeam} ↓</span>
        <span style={{ color: homeColor }}>{homeTeam} ↑</span>
      </div>
    </div>
  );
}
