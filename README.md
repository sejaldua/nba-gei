# NBA Game Excitement Index

**How exciting was every NBA game?**

GEI quantifies game excitement by measuring total win probability volatility — how much the outcome swung back and forth throughout a contest. Inspired by [Luke Benz's college basketball GEI](https://lukebenz.com/post/gei/), adapted for the NBA using ESPN's play-by-play win probability data.

**[Live Site](https://sejaldua.com/nba-gei/)**

---

## How It Works

Imagine taking the win probability curve and stretching it out flat like a piece of string. The longer the string, the more exciting the game.

```
GEI = (2880 / t) × Σ |pᵢ - pᵢ₋₁|
```

Where `t` is game length in seconds and `pᵢ` is the home team's win probability at play `i`. Normalizing by game length prevents overtime games from ranking artificially high.

## Coverage

| Season | Games |
|--------|-------|
| 2024-25 | 1,320 |
| 2025-26 | 1,321 |

## Data Pipeline

1. **`data/fetch_espn_win_prob.py`** — Fetches win probability + play-by-play clock data from ESPN for every game in a season. Paginates to capture all plays (some games have 500+). Supports resume on interruption.

2. **`data/compute_gei.py`** — Computes GEI from raw WP series, generates team aggregates, and copies output to `public/data/` for the frontend.

```bash
python3 data/fetch_espn_win_prob.py --season 2025
python3 data/compute_gei.py --all
```

## Frontend

Next.js static site with Recharts. All data is pre-computed JSON — no runtime API calls.

- **Overview** — methodology, GEI distribution overlay (season-over-season), timeline scatter
- **Games** — sortable table of all games, expandable win probability charts
- **Teams** — team rankings by median GEI

## Development

```bash
npm install
npm run dev
# App runs at http://localhost:3000/nba-gei
```

## Deployment

Static export to GitHub Pages via Actions. Push to `main` triggers build + deploy.

```bash
npx next build   # outputs to /out
```
