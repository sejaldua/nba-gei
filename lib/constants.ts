export const SEASONS = [
  { value: 2025, label: "2025-26" },
  { value: 2024, label: "2024-25" },
];

export const GEI_CATEGORIES = {
  heart_pounder: { label: "Heart Pounder", threshold: 8, color: "#dc2626" },
  thriller: { label: "Thriller", threshold: 4, color: "#f59e0b" },
  average: { label: "Average", threshold: 1, color: "#6b7280" },
  dud: { label: "Dud", threshold: 0, color: "#374151" },
} as const;

export const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  ATL: { primary: "#E03A3E", secondary: "#C1D32F" },
  BOS: { primary: "#007A33", secondary: "#BA9653" },
  BKN: { primary: "#000000", secondary: "#FFFFFF" },
  CHA: { primary: "#1D1160", secondary: "#00788C" },
  CHI: { primary: "#CE1141", secondary: "#000000" },
  CLE: { primary: "#860038", secondary: "#041E42" },
  DAL: { primary: "#00538C", secondary: "#002B5E" },
  DEN: { primary: "#0E2240", secondary: "#FEC524" },
  DET: { primary: "#C8102E", secondary: "#1D42BA" },
  GSW: { primary: "#1D428A", secondary: "#FFC72C" },
  HOU: { primary: "#CE1141", secondary: "#000000" },
  IND: { primary: "#002D62", secondary: "#FDBB30" },
  LAC: { primary: "#C8102E", secondary: "#1D428A" },
  LAL: { primary: "#552583", secondary: "#FDB927" },
  MEM: { primary: "#5D76A9", secondary: "#12173F" },
  MIA: { primary: "#98002E", secondary: "#F9A01B" },
  MIL: { primary: "#00471B", secondary: "#EEE1C6" },
  MIN: { primary: "#0C2340", secondary: "#236192" },
  NOP: { primary: "#0C2340", secondary: "#C8102E" },
  NYK: { primary: "#006BB6", secondary: "#F58426" },
  OKC: { primary: "#007AC1", secondary: "#EF6100" },
  ORL: { primary: "#0077C0", secondary: "#C4CED4" },
  PHI: { primary: "#006BB6", secondary: "#ED174C" },
  PHX: { primary: "#1D1160", secondary: "#E56020" },
  POR: { primary: "#E03A3E", secondary: "#000000" },
  SAS: { primary: "#C4CED4", secondary: "#000000" },
  SAC: { primary: "#5A2D81", secondary: "#63727A" },
  TOR: { primary: "#CE1141", secondary: "#000000" },
  UTA: { primary: "#002B5C", secondary: "#00471B" },
  WAS: { primary: "#002B5C", secondary: "#E31837" },
};

export const SEASON_LABELS: Record<number, string> = {
  2021: "2021-22",
  2022: "2022-23",
  2023: "2023-24",
  2024: "2024-25",
  2025: "2025-26",
};
