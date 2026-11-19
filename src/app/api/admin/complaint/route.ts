import { NextResponse } from "next/server";
import { q1 } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Khusus admin." }, { status: 403 });
  const { id, decision } = await req.json();
  if (!["refunded", "rejected"].includes(decision)) return NextResponse.json({ error: "Keputusan tidak valid." }, { status: 400 });
  await q1("UPDATE complaints SET status=$1 WHERE id=$2", [decision, Number(id)]);
  return NextResponse.json({ ok: true });
}
