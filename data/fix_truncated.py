"""
Re-fetch games that were truncated at 500 WP points due to missing pagination.
"""
import json
import sys
import time
from pathlib import Path

import requests

from fetch_espn_win_prob import (
    PROBABILITIES_URL,
    fetch_play_clock_map,
    parse_clock_to_seconds,
)

OUTPUT_DIR = Path(__file__).parent / "output"


def fetch_full_wp(game_id: str) -> list[dict] | None:
    items = []
    page = 1
    while True:
        url = PROBABILITIES_URL.format(game_id=game_id) + f"&page={page}"
        resp = requests.get(url, timeout=30)
        if resp.status_code in (400, 404):
            return None
        resp.raise_for_status()
        data = resp.json()

        page_items = data.get("items", [])
        if not page_items:
            break
        items.extend(page_items)

        if page >= data.get("pageCount", 1):
            break
        page += 1
        time.sleep(0.2)

    if len(items) <= 500:
        return None

    clock_map = fetch_play_clock_map(game_id)

    wp_series = []
    for item in items:
        seq = item.get("sequenceNumber", "")
        seconds_elapsed = clock_map.get(seq, -1)
        wp_series.append({
            "secondsElapsed": seconds_elapsed,
            "homeWinPct": item.get("homeWinPercentage", 0.5),
        })

    return wp_series


def fix_season(season: int):
    path = OUTPUT_DIR / f"raw_wp_{season}.jsonl"
    if not path.exists():
        print(f"No file for season {season}")
        return

    games = []
    truncated_indices = []
    with open(path) as f:
        for i, line in enumerate(f):
            g = json.loads(line)
            games.append(g)
            if len(g["wp_series"]) == 500:
                truncated_indices.append(i)

    print(f"Season {season}: {len(truncated_indices)} truncated games to fix")

    fixed = 0
    for idx in truncated_indices:
        game = games[idx]
        game_id = game["game_id"]
        wp = fetch_full_wp(game_id)
        if wp:
            games[idx]["wp_series"] = wp
            fixed += 1
            print(f"  Fixed {game['away_team']} @ {game['home_team']} ({game['date']}): {len(wp)} points")
        time.sleep(0.5)

    with open(path, "w") as f:
        for g in games:
            f.write(json.dumps(g) + "\n")

    print(f"  Fixed {fixed}/{len(truncated_indices)} games")


if __name__ == "__main__":
    seasons = [int(s) for s in sys.argv[1:]] if len(sys.argv) > 1 else [2024, 2025]
    for season in seasons:
        fix_season(season)
