import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { championships, participants, matches } from "@/db/schema";
import { eq } from "drizzle-orm";

const db = () => getDb();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const champId = Number(id);
  const [champ] = await db().select().from(championships).where(eq(championships.id, champId));
  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parts = await db().select().from(participants).where(eq(participants.championship_id, champId)).orderBy(participants.id);
  const matchList = await db().select().from(matches).where(eq(matches.championship_id, champId)).orderBy(matches.display_order);

  return NextResponse.json({ championship: champ, participants: parts, matches: matchList });
}
