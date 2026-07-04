export interface PodiumParticipant {
  id: number;
  name: string;
}

export interface PodiumMatch {
  phase: string;
  status: string;
  winner_id: number | null;
  loser_id: number | null;
}

export interface ChampionshipPodium {
  first: string | null;
  second: string | null;
  third: string | null;
}

export function deriveChampionshipPodium(
  participants: PodiumParticipant[],
  matches: PodiumMatch[],
): ChampionshipPodium {
  const getName = (id: number | null) => {
    if (!id) return null;
    return participants.find((participant) => participant.id === id)?.name ?? null;
  };

  const finalMatch = matches.find((match) => match.phase === "final");
  const thirdPlaceMatch = matches.find((match) => match.phase === "third_place");

  return {
    first: finalMatch?.winner_id ? getName(finalMatch.winner_id) : null,
    second: finalMatch?.loser_id ? getName(finalMatch.loser_id) : null,
    third: thirdPlaceMatch?.winner_id ? getName(thirdPlaceMatch.winner_id) : null,
  };
}