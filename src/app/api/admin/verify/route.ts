import { NextResponse } from "next/server";
import { q1 } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Khusus admin." }, { status: 403 });
  const { id, decision, note } = await req.json();
  if (!["approved", "revision", "rejected"].includes(decision)) return NextResponse.json({ error: "Keputusan tidak valid." }, { status: 400 });
  if (decision !== "approved" && !String(note || "").trim()) return NextResponse.json({ error: "Penolakan dan permintaan revisi wajib disertai alasan." }, { status: 400 });
  await q1("UPDATE users SET status=$1, review_note=$2 WHERE id=$3 AND role IN ('resto','kurir')", [decision, note || null, Number(id)]);
  return NextResponse.json({ ok: true });
}
