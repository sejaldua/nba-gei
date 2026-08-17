"""
Compute Game Excitement Index from raw ESPN win probability data.

Usage:
    python3 data/compute_gei.py --season 2024
    python3 data/compute_gei.py --all

Reads: data/output/raw_wp_{season}.jsonl
Writes:
  - data/output/gei_by_game.json (all games with GEI scores)
  - data/output/gei_by_team.json (team-level aggregates per season)
  - data/output/wp_curves/{game_id}.json (top 200 games get full WP curve saved)
  - public/data/ (copies for the frontend)
"""

import argparse
import json
import shutil
import statistics
from collections import defaultdict
from pathlib import Path

REGULATION_SECONDS = 2880  # 48 minutes
OVERTIME_SECONDS = 300  # 5 minutes per OT

OUTPUT_DIR = Path(__file__).parent / "output"
PUBLIC_DIR = Path(__file__).parent.parent / "public" / "data"

GEI_THRESHOLDS = {
    "heart_pounder": 8,
    "thriller": 4,
    "average": 1,
}


def classify_game(gei: float) -> str:
    if gei > GEI_THRESHOLDS["heart_pounder"]:
        return "heart_pounder"
    elif gei > GEI_THRESHOLDS["thriller"]:
        return "thriller"
    elif gei > GEI_THRESHOLDS["average"]:
        return "average"
    else:
        return "dud"


def compute_gei_for_game(wp_series: list[dict]) -> dict:
    """Compute GEI and related stats from a win probability series."""
    if len(wp_series) < 2:
        return {"gei": 0, "num_lead_changes": 0, "largest_comeback": 0, "overtime": False}

    # Sort by ascending secondsElapsed (game start first)
    sorted_series = sorted(wp_series, key=lambda x: x.get("secondsElapsed", x.get("secondsLeft", 0)))

    total_swing = 0
    num_lead_changes = 0
    prev_leader = None
    min_wp = 1.0
    max_wp = 0.0

    for i in range(1, len(sorted_series)):
        p_curr = sorted_series[i]["homeWinPct"]
        p_prev = sorted_series[i - 1]["homeWinPct"]
        total_swing += abs(p_curr - p_prev)

        curr_leader = "home" if p_curr > 0.5 else "away" if p_curr < 0.5 else None
        if curr_leader and prev_leader and curr_leader != prev_leader:
            num_lead_changes += 1
        if curr_leader:
            prev_leader = curr_leader

        min_wp = min(min_wp, p_curr)
        max_wp = max(max_wp, p_curr)

    # Determine game length from elapsed seconds
    elapsed_values = [p.get("secondsElapsed", p.get("secondsLeft", 0)) for p in sorted_series]
    game_length_seconds = max(elapsed_values) - min(elapsed_values) if elapsed_values else REGULATION_SECONDS

    # Fallback if clock data is missing or broken
    if game_length_seconds < REGULATION_SECONDS * 0.5:
        game_length_seconds = REGULATION_SECONDS

    overtime = game_length_seconds > REGULATION_SECONDS + 30

    gei = (REGULATION_SECONDS / game_length_seconds) * total_swing

    largest_comeback = max(max_wp - 0.5, 0.5 - min_wp)

    return {
        "gei": round(gei, 2),
        "num_lead_changes": num_lead_changes,
        "largest_comeback": round(largest_comeback, 2),
        "overtime": overtime,
        "game_length_seconds": int(game_length_seconds),
    }


def process_season(season: int) -> list[dict]:
    """Process a single season's raw WP data into GEI scores."""
    input_path = OUTPUT_DIR / f"raw_wp_{season}.jsonl"
    if not input_path.exists():
        print(f"  No data file for season {season}: {input_path}")
        return []

    games = []
    with open(input_path) as f:
        for line in f:
            if not line.strip():
                continue
            raw = json.loads(line)
            wp_series = raw.get("wp_series", [])
            stats = compute_gei_for_game(wp_series)

            game = {
                "game_id": raw["game_id"],
                "season": season,
                "date": raw["date"],
                "home_team": raw["home_team"],
                "away_team": raw["away_team"],
                "home_score": raw.get("home_score", 0),
                "away_score": raw.get("away_score", 0),
                "final_margin": abs(raw.get("home_score", 0) - raw.get("away_score", 0)),
                **stats,
                "category": classify_game(stats["gei"]),
                "wp_point_count": len(wp_series),
            }
            games.append(game)

    print(f"  Season {season}-{str(season+1)[-2:]}: {len(games)} games processed")
    return games


def compute_team_aggregates(all_games: list[dict]) -> list[dict]:
    """Compute per-team, per-season aggregates."""
    team_season_games = defaultdict(list)

    for game in all_games:
        team_season_games[(game["home_team"], game["season"])].append(game)
        team_season_games[(game["away_team"], game["season"])].append(game)

    aggregates = []
    for (team, season), games in sorted(team_season_games.items()):
        geis = [g["gei"] for g in games]
        categories = [g["category"] for g in games]

        aggregates.append({
            "team": team,
            "season": season,
            "games_played": len(games),
            "median_gei": round(statistics.median(geis), 2),
            "mean_gei": round(statistics.mean(geis), 2),
            "max_gei": round(max(geis), 2),
            "min_gei": round(min(geis), 2),
            "heart_pounders": categories.count("heart_pounder"),
            "thrillers": categories.count("thriller"),
            "average_games": categories.count("average"),
            "duds": categories.count("dud"),
        })

    return aggregates


def save_wp_curves(all_games: list[dict]):
    """Save full WP curves for all games."""
    wp_dir = OUTPUT_DIR / "wp_curves"
    wp_dir.mkdir(parents=True, exist_ok=True)

    all_game_ids = {g["game_id"] for g in all_games}
    saved = 0

    for season_file in OUTPUT_DIR.glob("raw_wp_*.jsonl"):
        with open(season_file) as f:
            for line in f:
                if not line.strip():
                    continue
                raw = json.loads(line)
                if raw["game_id"] in all_game_ids:
                    wp_data = sorted(raw["wp_series"], key=lambda x: x.get("secondsElapsed", x.get("secondsLeft", 0)))
                    curve_path = wp_dir / f"{raw['game_id']}.json"
                    with open(curve_path, "w") as wf:
                        json.dump(wp_data, wf)
                    saved += 1

    print(f"  Saved WP curves for {saved} games")


def main():
    parser = argparse.ArgumentParser(description="Compute NBA Game Excitement Index")
    parser.add_argument("--season", type=int, help="Single season to process")
    parser.add_argument("--all", action="store_true", help="Process all available seasons")
    args = parser.parse_args()

    if not args.season and not args.all:
        parser.error("Specify --season YEAR or --all")

    seasons = [args.season] if args.season else [2021, 2022, 2023, 2024, 2025]

    print("Computing GEI...")
    all_games = []
    for season in seasons:
        all_games.extend(process_season(season))

    if not all_games:
        print("No games found. Run fetch_espn_win_prob.py first.")
        return

    all_games.sort(key=lambda g: g["gei"], reverse=True)
    team_aggregates = compute_team_aggregates(all_games)

    games_path = OUTPUT_DIR / "gei_by_game.json"
    with open(games_path, "w") as f:
        json.dump(all_games, f, indent=2)
    print(f"  Wrote {len(all_games)} games to {games_path}")

    teams_path = OUTPUT_DIR / "gei_by_team.json"
    with open(teams_path, "w") as f:
        json.dump(team_aggregates, f, indent=2)
    print(f"  Wrote {len(team_aggregates)} team-season records to {teams_path}")

    save_wp_curves(all_games)

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy(games_path, PUBLIC_DIR / "gei_by_game.json")
    shutil.copy(teams_path, PUBLIC_DIR / "gei_by_team.json")

    wp_curves_public = PUBLIC_DIR / "wp_curves"
    if wp_curves_public.exists():
        shutil.rmtree(wp_curves_public)
    wp_src = OUTPUT_DIR / "wp_curves"
    if wp_src.exists():
        shutil.copytree(wp_src, wp_curves_public)

    print(f"\nPublic data copied to {PUBLIC_DIR}")

    print(f"\n--- Summary ---")
    print(f"Total games: {len(all_games)}")
    print(f"Mean GEI: {statistics.mean(g['gei'] for g in all_games):.2f}")
    print(f"Median GEI: {statistics.median(g['gei'] for g in all_games):.2f}")
    cats = [g["category"] for g in all_games]
    print(f"Heart Pounders: {cats.count('heart_pounder')} ({cats.count('heart_pounder')/len(cats)*100:.1f}%)")
    print(f"Thrillers: {cats.count('thriller')} ({cats.count('thriller')/len(cats)*100:.1f}%)")
    print(f"Average: {cats.count('average')} ({cats.count('average')/len(cats)*100:.1f}%)")
    print(f"Duds: {cats.count('dud')} ({cats.count('dud')/len(cats)*100:.1f}%)")
    print(f"\nTop 10 most exciting games:")
    for g in all_games[:10]:
        print(f"  {g['gei']:6.2f}  {g['away_team']} @ {g['home_team']} ({g['date']}) - {g['away_score']}-{g['home_score']}")


if __name__ == "__main__":
    main()
