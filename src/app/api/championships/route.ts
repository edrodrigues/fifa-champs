import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { championships } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const db = () => getDb();

export async function GET() {
  try {
    const list = await db().select().from(championships).orderBy(desc(championships.created_at));
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, notes } = body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const [champ] = await db().insert(championships).values({ name: name.trim(), notes: notes || null }).returning();
    return NextResponse.json(champ, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, notes, status } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (name) updates.name = name;
    if (notes !== undefined) updates.notes = notes;
    if (status) updates.status = status;
    const [champ] = await db().update(championships).set(updates).where(eq(championships.id, id)).returning();
    if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(champ);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await db().delete(championships).where(eq(championships.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
