"use client";

import { useEffect, useState } from "react";
import { TeamAggregate } from "@/lib/types";
import { BASE_PATH } from "@/lib/basePath";
import SeasonSelector from "@/components/SeasonSelector";
import TeamRankings from "@/components/TeamRankings";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamAggregate[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${BASE_PATH}/data/gei_by_team.json`)
      .then((r) => r.json())
      .then(setTeams);
  }, []);

  const filtered = selectedSeason
    ? teams.filter((t) => t.season === selectedSeason)
    : teams;

  return (
    <div className="space-y-8 pt-4">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
        <p className="text-sm text-stone-500 mt-1">
          Which teams produce the most exciting basketball?
        </p>
      </section>

      <SeasonSelector selected={selectedSeason} onChange={setSelectedSeason} />

      {filtered.length > 0 ? (
        <TeamRankings teams={filtered} />
      ) : (
        <p className="text-stone-400 py-12 text-center text-sm">Loading teams...</p>
      )}
    </div>
  );
}
