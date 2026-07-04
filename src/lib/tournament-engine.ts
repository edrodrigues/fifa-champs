function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface GroupInfo {
  letter: string;
  participantIds: number[];
}

export function drawGroups(participantIds: number[]): GroupInfo[] {
  const shuffled = shuffle(participantIds);
  const total = shuffled.length;
  const minGroupSize = 2;
  const maxGroupSize = 6;

  let numGroups = Math.ceil(total / maxGroupSize);
  if (total / numGroups < minGroupSize) {
    numGroups = Math.floor(total / minGroupSize);
  }
  if (numGroups < 1) numGroups = 1;

  const baseSize = Math.floor(total / numGroups);
  let remainder = total % numGroups;

  const groups: GroupInfo[] = [];
  let idx = 0;
  for (let i = 0; i < numGroups; i++) {
    const size = baseSize + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    groups.push({
      letter: String.fromCharCode(65 + i),
      participantIds: shuffled.slice(idx, idx + size),
    });
    idx += size;
  }
  return groups;
}

export interface RoundRobinMatch {
  playerHomeId: number;
  playerAwayId: number;
}

export function generateRoundRobin(participantIds: number[]): RoundRobinMatch[] {
  const matches: RoundRobinMatch[] = [];
  for (let i = 0; i < participantIds.length; i++) {
    for (let j = i + 1; j < participantIds.length; j++) {
      matches.push({ playerHomeId: participantIds[i], playerAwayId: participantIds[j] });
    }
  }
  return shuffle(matches);
}

export interface MatchResult {
  playerHomeId: number;
  playerAwayId: number;
  scoreHome: number;
  scoreAway: number;
}

export interface GroupStanding {
  participantId: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function calculateGroupStandings(
  participantIds: number[],
  results: MatchResult[],
): GroupStanding[] {
  const map = new Map<number, GroupStanding>();
  for (const pid of participantIds) {
    map.set(pid, { participantId: pid, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 });
  }
  for (const r of results) {
    const home = map.get(r.playerHomeId)!;
    const away = map.get(r.playerAwayId)!;
    home.goalsFor += r.scoreHome;
    home.goalsAgainst += r.scoreAway;
    away.goalsFor += r.scoreAway;
    away.goalsAgainst += r.scoreHome;
    if (r.scoreHome > r.scoreAway) {
      home.wins++; away.losses++; home.points += 3;
    } else if (r.scoreHome < r.scoreAway) {
      away.wins++; home.losses++; away.points += 3;
    } else {
      home.draws++; away.draws++; home.points++; away.points++;
    }
  }
  for (const s of map.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }
  return [...map.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    const h2h = getHeadToHead(a.participantId, b.participantId, results);
    if (h2h !== 0) return h2h;
    return 0;
  });
}

function getHeadToHead(a: number, b: number, results: MatchResult[]): number {
  for (const r of results) {
    if (r.playerHomeId === a && r.playerAwayId === b) {
      if (r.scoreHome > r.scoreAway) return -1;
      if (r.scoreHome < r.scoreAway) return 1;
    }
    if (r.playerHomeId === b && r.playerAwayId === a) {
      if (r.scoreHome > r.scoreAway) return 1;
      if (r.scoreHome < r.scoreAway) return -1;
    }
  }
  return 0;
}

export function getAdvancingCount(participantCount: number): number {
  return Math.floor(participantCount / 2);
}

export interface BracketSlot {
  round: number;
  position: number;
  label: string;
}

export function generateKnockoutBracket(advancingIds: number[]): BracketSlot[] {
  const shuffled = shuffle(advancingIds);
  const slots: BracketSlot[] = [];
  const totalRounds = Math.ceil(Math.log2(shuffled.length));
  const slotsInFirstRound = Math.pow(2, totalRounds - 1);

  for (let i = 0; i < slotsInFirstRound; i++) {
    const homeIdx = i * 2;
    if (homeIdx < shuffled.length) {
      slots.push({ round: 0, position: i, label: `KO-${i + 1}` });
    }
  }
  for (let r = 1; r <= totalRounds; r++) {
    const matchesInRound = Math.pow(2, totalRounds - r - 1);
    for (let p = 0; p < matchesInRound; p++) {
      slots.push({ round: r, position: p, label: getRoundLabel(r, totalRounds) });
    }
  }
  return slots;
}

function getRoundLabel(round: number, totalRounds: number): string {
  if (round === totalRounds) return "Final";
  if (round === totalRounds - 1) return "Semifinal";
  if (round === totalRounds - 2) return "Quarterfinal";
  return `Round ${round + 1}`;
}

export function getPhaseLabel(round: number, totalRounds: number): "quarterfinal" | "semifinal" | "final" | "group" {
  if (round === totalRounds) return "final";
  if (round === totalRounds - 1) return "semifinal";
  if (round === totalRounds - 2) return "quarterfinal";
  return "group";
}
