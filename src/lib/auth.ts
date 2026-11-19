import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "user" | "resto" | "kurir" | "admin";
export type Session = { id: number; name: string; role: Role };

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-ganti-di-produksi");
export const home: Record<Role, string> = { user: "/beranda", resto: "/owner", kurir: "/kurir", admin: "/admin" };

export async function createSession(s: Session) {
  const token = await new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key());
  cookies().set("sid", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession(): Promise<Session | null> {
  const t = cookies().get("sid")?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return { id: Number(payload.id), name: String(payload.name), role: payload.role as Role };
  } catch {
    return null;
  }
}
export async function requireRole(role: Role): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role !== role) redirect(home[s.role]);
  return s;
}
