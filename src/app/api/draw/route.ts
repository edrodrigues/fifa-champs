import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { championships, participants, matches } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

const db = () => getDb();
import { drawGroups, generateRoundRobin, generateKnockoutBracket, getPhaseLabel, getAdvancingCount } from "@/lib/tournament-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const { championship_id } = body;
  if (!championship_id) {
    return NextResponse.json({ error: "championship_id required" }, { status: 400 });
  }

  const parts = await db().select().from(participants).where(
    and(eq(participants.championship_id, championship_id), eq(participants.status, "active"))
  );

  if (parts.length < 2) {
    return NextResponse.json({ error: "Need at least 2 participants" }, { status: 400 });
  }

  const existing = await db().select().from(matches).where(eq(matches.championship_id, championship_id));
  if (existing.length > 0) {
    return NextResponse.json({ error: "Draw already performed. Reset first." }, { status: 400 });
  }

  const groups = drawGroups(parts.map((p) => p.id));

  for (const group of groups) {
    await db().update(participants).set({ group_letter: group.letter }).where(
      and(eq(participants.championship_id, championship_id), inArray(participants.id, group.participantIds))
    );
  }

  let displayOrder = 0;

  for (const group of groups) {
    const rrMatches = generateRoundRobin(group.participantIds);
    for (const rr of rrMatches) {
      await db().insert(matches).values({
        championship_id,
        phase: "group",
        group_letter: group.letter,
        player_home_id: rr.playerHomeId,
        player_away_id: rr.playerAwayId,
        status: "pending",
        display_order: displayOrder++,
      });
    }
  }

  const advancingInGroup = getAdvancingCount(Math.max(...groups.map((g) => g.participantIds.length)));
  const totalAdvancing = groups.length * advancingInGroup;

  if (totalAdvancing >= 2) {
    const knockoutSlots = generateKnockoutBracket(Array.from({ length: totalAdvancing }, (_, i) => i));
    const totalRounds = knockoutSlots.length > 0
      ? Math.max(...knockoutSlots.map((s) => s.round)) + 1
      : 0;

    const now = new Date();
    for (let idx = 0; idx < knockoutSlots.length; idx++) {
      const slot = knockoutSlots[idx];
      const phase = getPhaseLabel(slot.round, totalRounds);
      const matchDate = new Date(now);
      matchDate.setDate(matchDate.getDate() + idx + 1);
      matchDate.setHours(17 + (idx % 3), (idx * 15) % 60, 0, 0);
      await db().insert(matches).values({
        championship_id,
        phase,
        round: slot.round,
        bracket_position: slot.position,
        player_home_id: null,
        player_away_id: null,
        scheduled_date: matchDate,
        status: "pending",
        display_order: displayOrder++,
      });
    }

    if (totalRounds >= 1) {
      const thirdDate = new Date(now);
      thirdDate.setDate(thirdDate.getDate() + knockoutSlots.length + 1);
      thirdDate.setHours(15, 0, 0, 0);
      await db().insert(matches).values({
        championship_id,
        phase: "third_place",
        round: totalRounds + 1,
        bracket_position: 0,
        player_home_id: null,
        player_away_id: null,
        scheduled_date: thirdDate,
        status: "pending",
        display_order: displayOrder++,
      });
    }
  }

  await db().update(championships).set({ status: "groups", updated_at: new Date() }).where(eq(championships.id, championship_id));

  return NextResponse.json({
    success: true,
    groups: groups.map((g) => ({ letter: g.letter, count: g.participantIds.length })),
  });
}
