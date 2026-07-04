import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { participants } from "@/db/schema";
import { eq } from "drizzle-orm";

const db = () => getDb();

export async function POST(request: Request) {
  const body = await request.json();
  const { championship_id, names } = body;
  if (!championship_id || !names || !Array.isArray(names) || names.length === 0) {
    return NextResponse.json({ error: "championship_id and names[] required" }, { status: 400 });
  }

  const existing = await db().select().from(participants).where(eq(participants.championship_id, championship_id));
  const existingNames = new Set(existing.map((p) => p.name.toLowerCase().trim()));

  const cleaned = names
    .map((n: string) => n.trim())
    .filter((n: string) => n.length > 0 && !existingNames.has(n.toLowerCase()));

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "No new valid participants" }, { status: 400 });
  }

  const values = cleaned.map((name: string) => ({
    championship_id,
    name,
    status: "active" as const,
  }));

  const inserted = await db().insert(participants).values(values).returning();
  return NextResponse.json(inserted, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db().delete(participants).where(eq(participants.id, Number(id)));
  return NextResponse.json({ success: true });
}
