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
import { useTheme } from "./ThemeProvider";

interface Props {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
}

function getVisibleColor(color: string, theme: "light" | "dark"): string {
  if (theme === "dark") {
    const tooLight = ["#C4CED4", "#FFFFFF", "#EEE1C6", "#FFC72C", "#FDB927", "#FEC524", "#FDBB30"].map(c => c.toLowerCase());
    if (tooLight.includes(color.toLowerCase())) return "#9ca3af";
    const tooDark = ["#000000", "#0C2340", "#0E2240", "#002B5C", "#002B5E", "#002D62", "#041E42", "#12173F", "#1D1160"].map(c => c.toLowerCase());
    if (tooDark.includes(color.toLowerCase())) return "#60a5fa";
  } else {
    const tooLight = ["#C4CED4", "#FFFFFF", "#EEE1C6", "#FFC72C", "#FDB927", "#FEC524", "#FDBB30", "#F9A01B", "#F58426"].map(c => c.toLowerCase());
    if (tooLight.includes(color.toLowerCase())) return "#6b7280";
    const tooDark = ["#000000"].map(c => c.toLowerCase());
    if (tooDark.includes(color.toLowerCase())) return "#374151";
  }
  return color;
}

export default function WinProbChart({ gameId, homeTeam, awayTeam }: Props) {
  const [data, setData] = useState<WPPoint[] | null>(null);
  const [error, setError] = useState(false);
  const { theme } = useTheme();

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
      <div className="h-48 flex items-center justify-center text-sm text-gray-500">
        Win probability chart not available for this game.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500">
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
  const homeColor = getVisibleColor(rawHomeColor, theme);
  const awayColor = getVisibleColor(rawAwayColor, theme);

  const tickColor = theme === "dark" ? "#9ca3af" : "#6b7280";
  const refLineColor = theme === "dark" ? "#4b5563" : "#d1d5db";
  const tooltipBg = theme === "dark" ? "#1f2937" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#374151" : "#e5e7eb";

  const formatTime = (elapsed: number) => {
    if (elapsed <= 0) return "0'";
    if (elapsed <= 2880) {
      return `${Math.round(elapsed / 60)}'`;
    }
    const otElapsed = elapsed - 2880;
    return `OT ${Math.round(otElapsed / 60)}'`;
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={deduped} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis
            dataKey="elapsed"
            tick={{ fontSize: 10, fill: tickColor }}
            tickFormatter={formatTime}
            type="number"
            domain={[0, "dataMax"]}
            ticks={deduped.length > 0 && deduped[deduped.length - 1].elapsed > 2880
              ? [0, 720, 1440, 2160, 2880, deduped[deduped.length - 1].elapsed]
              : [0, 720, 1440, 2160, 2880]}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: tickColor }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "6px" }}
            labelStyle={{ color: tickColor }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, "Home Win %"]}
            labelFormatter={(elapsed) => {
              const mins = Math.round(Number(elapsed) / 60);
              return `${mins} min`;
            }}
          />
          <ReferenceLine y={50} stroke={refLineColor} strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="homeWinPct"
            stroke={homeColor}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-gray-500 px-2">
        <span style={{ color: awayColor }}>{awayTeam} favored &darr;</span>
        <span style={{ color: homeColor }}>{homeTeam} favored &uarr;</span>
      </div>
    </div>
  );
}
