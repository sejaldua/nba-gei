"use client";

import { useEffect, useState } from "react";
import { TeamAggregate } from "@/lib/types";
import SeasonSelector from "@/components/SeasonSelector";
import TeamRankings from "@/components/TeamRankings";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamAggregate[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  useEffect(() => {
    fetch("/data/gei_by_team.json")
      .then((r) => r.json())
      .then(setTeams);
  }, []);

  const filtered = selectedSeason
    ? teams.filter((t) => t.season === selectedSeason)
    : teams;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Team Rankings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Which teams produce the most exciting basketball? Ranked by median GEI.
        </p>
      </section>

      <SeasonSelector selected={selectedSeason} onChange={setSelectedSeason} />

      {filtered.length > 0 ? (
        <TeamRankings teams={filtered} />
      ) : (
        <p className="text-gray-500 py-8 text-center">No data loaded yet.</p>
      )}
    </div>
  );
}
