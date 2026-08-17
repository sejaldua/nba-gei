"""
Batch fetch ESPN in-game win probability for NBA games.

Usage:
    python3 data/fetch_espn_win_prob.py --season 2024
    python3 data/fetch_espn_win_prob.py --season 2024 --start 2024-10-22 --end 2024-11-01

Output: JSON lines file at data/output/raw_wp_{season}.jsonl
Each line: {"game_id", "date", "home_team", "away_team", "home_score", "away_score", "wp_series": [{secondsLeft, homeWinPct}]}
"""

import argparse
import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

import requests

SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
PROBABILITIES_URL = "https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/events/{game_id}/competitions/{game_id}/probabilities?limit=500"
SUMMARY_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={game_id}"

# ESPN abbreviation -> NBA tricode mapping
ESPN_TO_NBA_TRICODE = {
    "GS": "GSW",
    "NY": "NYK",
    "NO": "NOP",
    "SA": "SAS",
    "UTAH": "UTA",
    "WSH": "WAS",
    "PHX": "PHX",
    "CHA": "CHA",
}


def to_nba_tricode(espn_abbr: str) -> str:
    return ESPN_TO_NBA_TRICODE.get(espn_abbr, espn_abbr)

SEASON_DATES = {
    2021: ("2021-10-19", "2022-06-20"),
    2022: ("2022-10-18", "2023-06-15"),
    2023: ("2023-10-24", "2024-06-18"),
    2024: ("2024-10-22", "2025-06-20"),
    2025: ("2025-10-21", "2026-06-20"),
}

OUTPUT_DIR = Path(__file__).parent / "output"


def get_completed_games(date_str: str) -> list[dict]:
    """Fetch all completed NBA games on a given date."""
    resp = requests.get(SCOREBOARD_URL, params={"dates": date_str}, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    games = []
    for event in data.get("events", []):
        competition = event["competitions"][0]
        status = competition["status"]["type"]["name"]
        if status != "STATUS_FINAL":
            continue

        competitors = competition["competitors"]
        home = next(c for c in competitors if c["homeAway"] == "home")
        away = next(c for c in competitors if c["homeAway"] == "away")

        games.append({
            "game_id": event["id"],
            "date": date_str[:4] + "-" + date_str[4:6] + "-" + date_str[6:8] if len(date_str) == 8 else date_str,
            "home_team": to_nba_tricode(home["team"]["abbreviation"]),
            "away_team": to_nba_tricode(away["team"]["abbreviation"]),
            "home_score": int(home.get("score", 0)),
            "away_score": int(away.get("score", 0)),
        })

    return games


def parse_clock_to_seconds(clock_str: str, period: int) -> int:
    """Convert clock display + period to total seconds elapsed from game start.

    Returns seconds elapsed (0 = tip-off, 2880 = end of regulation, >2880 = OT).
    This ensures monotonically increasing values throughout the game.
    """
    try:
        parts = clock_str.split(":")
        minutes = int(parts[0])
        seconds = int(parts[1]) if len(parts) > 1 else 0
        clock_seconds = minutes * 60 + seconds
    except (ValueError, IndexError):
        clock_seconds = 0

    if period <= 4:
        # Regulation: each period is 12 min (720s)
        elapsed_full_periods = (period - 1) * 720
        elapsed_in_period = 720 - clock_seconds
        return elapsed_full_periods + elapsed_in_period
    else:
        # Overtime: each OT is 5 min (300s)
        ot_number = period - 4
        elapsed_regulation = 2880
        elapsed_prior_ots = (ot_number - 1) * 300
        elapsed_in_period = 300 - clock_seconds
        return elapsed_regulation + elapsed_prior_ots + elapsed_in_period


def fetch_play_clock_map(game_id: str) -> dict[str, int]:
    """Fetch play-by-play to get seconds elapsed keyed by sequenceNumber."""
    try:
        resp = requests.get(SUMMARY_URL.format(game_id=game_id), timeout=30)
        if resp.status_code in (400, 404):
            return {}
        resp.raise_for_status()
        data = resp.json()

        clock_map = {}
        for play in data.get("plays", []):
            seq = play.get("sequenceNumber", "")
            period = play.get("period", {}).get("number", 1)
            clock_str = play.get("clock", {}).get("displayValue", "12:00")
            clock_map[seq] = parse_clock_to_seconds(clock_str, period)

        return clock_map
    except Exception:
        return {}


def fetch_win_probability(game_id: str) -> list[dict] | None:
    """Fetch the full in-game win probability series with clock data."""
    try:
        resp = requests.get(PROBABILITIES_URL.format(game_id=game_id), timeout=30)
        if resp.status_code in (400, 404):
            return None
        resp.raise_for_status()
        data = resp.json()

        items = data.get("items", [])
        if not items:
            return None

        # Fetch clock data from play-by-play
        clock_map = fetch_play_clock_map(game_id)

        wp_series = []
        for item in items:
            seq = item.get("sequenceNumber", "")
            seconds_elapsed = clock_map.get(seq, -1)
            wp_series.append({
                "secondsElapsed": seconds_elapsed,
                "homeWinPct": item.get("homeWinPercentage", 0.5),
            })

        return wp_series if len(wp_series) >= 10 else None
    except Exception as e:
        print(f"    Error fetching WP for {game_id}: {e}")
        return None


def load_existing_game_ids(output_path: Path) -> set:
    """Load game IDs already fetched to support resuming."""
    if not output_path.exists():
        return set()
    ids = set()
    with open(output_path) as f:
        for line in f:
            if line.strip():
                ids.add(json.loads(line)["game_id"])
    return ids


def main():
    parser = argparse.ArgumentParser(description="Fetch ESPN NBA in-game win probability")
    parser.add_argument("--season", required=True, type=int, help="Season start year (e.g., 2024 for 2024-25)")
    parser.add_argument("--start", default=None, help="Override start date (YYYY-MM-DD)")
    parser.add_argument("--end", default=None, help="Override end date (YYYY-MM-DD)")
    args = parser.parse_args()

    if args.season not in SEASON_DATES:
        print(f"Unknown season {args.season}. Known: {list(SEASON_DATES.keys())}")
        return

    season_start, season_end = SEASON_DATES[args.season]
    start_date = args.start or season_start
    end_date = args.end or season_end

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"raw_wp_{args.season}.jsonl"

    existing_ids = load_existing_game_ids(output_path)
    if existing_ids:
        print(f"Resuming: {len(existing_ids)} games already fetched.")

    current = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    total_fetched = 0
    total_skipped = 0
    total_no_data = 0

    with open(output_path, "a") as f:
        while current <= end:
            date_str = current.strftime("%Y%m%d")
            display_date = current.strftime("%Y-%m-%d")

            games = get_completed_games(date_str)
            new_games = [g for g in games if g["game_id"] not in existing_ids]

            if new_games:
                print(f"{display_date}: {len(games)} games, {len(new_games)} new")

            for game in new_games:
                wp = fetch_win_probability(game["game_id"])
                if wp:
                    game["wp_series"] = wp
                    f.write(json.dumps(game) + "\n")
                    f.flush()
                    existing_ids.add(game["game_id"])
                    total_fetched += 1
                    print(f"  {game['away_team']} @ {game['home_team']}: {len(wp)} WP points")
                else:
                    total_no_data += 1
                    print(f"  {game['away_team']} @ {game['home_team']}: no WP data")
                time.sleep(0.5)

            total_skipped += len(games) - len(new_games)
            current += timedelta(days=1)
            time.sleep(0.3)

    print(f"\nDone! Fetched: {total_fetched}, Skipped (already had): {total_skipped}, No data: {total_no_data}")
    print(f"Output: {output_path}")


if __name__ == "__main__":
    main()
