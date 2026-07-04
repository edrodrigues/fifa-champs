import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { championships, participants, matches } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const db = () => getDb();
import { calculateGroupStandings, getAdvancingCount } from "@/lib/tournament-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { championship_id } = body;
    if (!championship_id) {
      return NextResponse.json({ error: "championship_id required" }, { status: 400 });
    }

    const [champ] = await db().select().from(championships).where(eq(championships.id, championship_id));
    if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (champ.status !== "groups") return NextResponse.json({ error: "Championship is not in group phase" }, { status: 400 });

    const allMatches = await db().select().from(matches).where(eq(matches.championship_id, championship_id));
    const groupMatches = allMatches.filter((m) => m.phase === "group");
    const groupLetters = [...new Set(groupMatches.map((m) => m.group_letter).filter((l): l is string => l !== null))];

    const advancingIds: number[] = [];

    for (const letter of groupLetters) {
      const letterMatches = groupMatches.filter((m) => m.group_letter === letter);
      const allCompleted = letterMatches.every((m) => m.status === "completed");
      if (!allCompleted) {
        return NextResponse.json({ error: `Grupo ${letter} ainda tem partidas pendentes` }, { status: 400 });
      }

      const groupParts = await db().select().from(participants).where(
        and(eq(participants.championship_id, championship_id), eq(participants.group_letter, letter))
      );
      let groupPIds = groupParts.map((p) => p.id);

      if (groupPIds.length === 0) {
        groupPIds = [...new Set(letterMatches.flatMap((m) => [m.player_home_id, m.player_away_id].filter((id): id is number => id !== null)))];
      }

      const results = letterMatches.map((m) => ({
        playerHomeId: m.player_home_id!,
        playerAwayId: m.player_away_id!,
        scoreHome: m.score_home!,
        scoreAway: m.score_away!,
      }));

      const standings = calculateGroupStandings(groupPIds, results);
      const advCount = getAdvancingCount(groupPIds.length);
      const advancing = standings.slice(0, advCount).map((s) => s.participantId);
      advancingIds.push(...advancing);
    }

    const firstRoundMatches = allMatches
      .filter((m) => m.round === 0 && m.phase !== "group")
      .sort((a, b) => a.display_order - b.display_order);

    let teamIdx = 0;
    for (const match of firstRoundMatches) {
      if (teamIdx < advancingIds.length) {
        await db().update(matches).set({ player_home_id: advancingIds[teamIdx++] }).where(eq(matches.id, match.id));
      }
      if (teamIdx < advancingIds.length) {
        await db().update(matches).set({ player_away_id: advancingIds[teamIdx++] }).where(eq(matches.id, match.id));
      }
    }

    if (teamIdx < advancingIds.length) {
      const roundOneMatches = allMatches
        .filter((m) => m.phase !== "group" && m.round !== null && m.bracket_position !== null && m.round === 1)
        .sort((a, b) => a.display_order - b.display_order);

      const fedPositions = new Set(firstRoundMatches.map((m) => Math.floor(m.bracket_position! / 2)));

      for (const match of roundOneMatches) {
        if (fedPositions.has(match.bracket_position!)) continue;
        if (teamIdx >= advancingIds.length) break;
        if (teamIdx < advancingIds.length) {
          await db().update(matches).set({ player_home_id: advancingIds[teamIdx++] }).where(eq(matches.id, match.id));
        }
        if (teamIdx < advancingIds.length) {
          await db().update(matches).set({ player_away_id: advancingIds[teamIdx++] }).where(eq(matches.id, match.id));
        }
      }
    }

    await db().update(championships).set({ status: "knockout", updated_at: new Date() }).where(eq(championships.id, championship_id));

    return NextResponse.json({ success: true, advancingIds });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno ao avançar para o mata-mata" }, { status: 500 });
  }
}
