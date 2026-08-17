export interface Game {
  game_id: string;
  season: number;
  date: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  final_margin: number;
  gei: number;
  num_lead_changes: number;
  largest_comeback: number;
  overtime: boolean;
  game_length_seconds: number;
  category: "heart_pounder" | "thriller" | "average" | "dud";
  wp_point_count: number;
}

export interface TeamAggregate {
  team: string;
  season: number;
  games_played: number;
  median_gei: number;
  mean_gei: number;
  max_gei: number;
  min_gei: number;
  heart_pounders: number;
  thrillers: number;
  average_games: number;
  duds: number;
}

export interface WPPoint {
  secondsElapsed: number;
  homeWinPct: number;
}
