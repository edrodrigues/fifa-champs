import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { championships, matches } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const db = () => getDb();

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, score_home, score_away, score_home_penalty, score_away_penalty } = body;
  if (!id || score_home === undefined || score_away === undefined) {
    return NextResponse.json({ error: "id, score_home, score_away required" }, { status: 400 });
  }

  const [match] = await db().select().from(matches).where(eq(matches.id, id));
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  if (match.player_home_id === null || match.player_away_id === null) {
    return NextResponse.json({ error: "Match does not have both players" }, { status: 400 });
  }

  let winner_id = score_home > score_away ? match.player_home_id : match.player_away_id;
  let loser_id = score_home > score_away ? match.player_away_id : match.player_home_id;

  if (score_home === score_away) {
    if (score_home_penalty != null && score_away_penalty != null) {
      winner_id = score_home_penalty > score_away_penalty ? match.player_home_id : match.player_away_id;
      loser_id = score_home_penalty > score_away_penalty ? match.player_away_id : match.player_home_id;
    } else {
      return NextResponse.json({ error: "Draw requires penalty scores" }, { status: 400 });
    }
  }

  const [updated] = await db().update(matches).set({
    score_home,
    score_away,
    score_home_penalty: score_home_penalty ?? null,
    score_away_penalty: score_away_penalty ?? null,
    status: "completed",
    winner_id,
    loser_id,
  }).where(eq(matches.id, id)).returning();

  if (match.phase === "semifinal") {
    const [thirdPlaceMatch] = await db().select().from(matches).where(
      and(eq(matches.championship_id, match.championship_id), eq(matches.phase, "third_place"))
    );

    if (thirdPlaceMatch) {
      const isFirstSemifinal = match.bracket_position === 0;
      if (isFirstSemifinal) {
        await db().update(matches).set({ player_home_id: loser_id }).where(eq(matches.id, thirdPlaceMatch.id));
      } else {
        await db().update(matches).set({ player_away_id: loser_id }).where(eq(matches.id, thirdPlaceMatch.id));
      }
    }
  }

  if (match.phase !== "group" && match.round !== null && match.bracket_position !== null) {
    await advanceKnockoutWinner(match.championship_id, winner_id, match.round, match.bracket_position, match.phase);
  }

  const allMatches = await db().select().from(matches).where(eq(matches.championship_id, match.championship_id));
  const knockoutMatches = allMatches.filter((m) => m.phase !== "group");
  const requiredMatches = knockoutMatches.filter(
    (m) => m.phase !== "third_place" || (m.player_home_id !== null && m.player_away_id !== null),
  );
  const championshipFinished = requiredMatches.length > 0 && requiredMatches.every((m) => m.status === "completed");

  if (championshipFinished) {
    await db().update(championships).set({ status: "completed", updated_at: new Date() }).where(
      eq(championships.id, match.championship_id)
    );
  }

  return NextResponse.json(updated);
}

async function advanceKnockoutWinner(
  championship_id: number,
  winner_id: number,
  round: number,
  bracket_position: number,
  phase: string,
) {
  if (phase === "third_place" || phase === "final") return;

  const nextRound = round + 1;
  const nextPosition = Math.floor(bracket_position / 2);

  const [nextMatch] = await db().select().from(matches).where(
    and(
      eq(matches.championship_id, championship_id),
      eq(matches.round, nextRound),
      eq(matches.bracket_position, nextPosition),
    )
  );

  if (!nextMatch) return;

  const isHome = bracket_position % 2 === 0;
  if (isHome) {
    await db().update(matches).set({ player_home_id: winner_id }).where(eq(matches.id, nextMatch.id));
  } else {
    await db().update(matches).set({ player_away_id: winner_id }).where(eq(matches.id, nextMatch.id));
  }
}
