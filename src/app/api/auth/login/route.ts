import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { q1 } from "@/lib/db";
import { createSession, home, Role } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password, role } = await req.json();
  const u = await q1("SELECT * FROM users WHERE lower(email)=lower($1)", [String(email || "")]);
  if (!u || !(await bcrypt.compare(String(password || ""), u.password_hash)))
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  if (u.role !== role) return NextResponse.json({ error: "Akun ini terdaftar dengan peran lain. Pilih peran yang sesuai." }, { status: 403 });
  if (u.status === "pending") return NextResponse.json({ error: "Akun masih menunggu verifikasi admin (1–2 hari kerja)." }, { status: 403 });
  if (u.status === "revision") return NextResponse.json({ error: `Akun perlu revisi: ${u.review_note || "cek email dari admin."}` }, { status: 403 });
  if (u.status === "rejected") return NextResponse.json({ error: `Akun ditolak: ${u.review_note || "hubungi admin."}` }, { status: 403 });
  await createSession({ id: u.id, name: u.name, role: u.role });
  return NextResponse.json({ redirect: home[u.role as Role] });
}
