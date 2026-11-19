import Link from "next/link";
import Act from "./Act";
import type { Session } from "@/lib/auth";
import { q1 } from "@/lib/db";

export const Logo = () => (<Link href="/" className="logo"><span className="logo-i">🍴</span>E-put Food</Link>);
const Foot = () => (<footer className="foot"><span>© 2026 Rantang. Hangat sampai tujuan.</span><span>Bantuan • Privasi • Syarat & ketentuan</span></footer>);

const NAV: Record<string, [string, string][]> = {
  user: [["/beranda", "Beranda"], ["/pesanan", "Pesanan saya"]],
  resto: [["/owner", "Ringkasan"], ["/owner/pesanan", "Pesanan"], ["/owner/produk", "Produk & menu"]],
  kurir: [["/kurir", "Ringkasan"], ["/kurir/aktif", "Pengantaran aktif"]],
  admin: [["/admin", "Ringkasan"], ["/admin/verifikasi", "Verifikasi akun"]],
};
const WHO: Record<string, string> = { resto: "Ruang pemilik resto", kurir: "Ruang kurir", admin: "Ruang admin" };

export default async function Shell({ s, at, children }: { s: Session; at: string; children: React.ReactNode }) {
  const links = NAV[s.role].map(([h, l]) => (<Link key={h} href={h} className={at === h ? "on" : ""}>{l}</Link>));
  if (s.role === "user")
    return (<><header className="top"><Logo /><nav className="tabs">{links}</nav><span className="grow" /><b>{s.name}</b><Act url="/api/auth/logout" cls="link">Logout</Act></header><main className="wrap">{children}</main><Foot /></>);
  let sub = s.name;
  if (s.role === "resto") sub = (await q1("SELECT name FROM restaurants WHERE owner_id=$1", [s.id]))?.name || s.name;
  return (
    <div className="shell">
      <aside className="side">
        <Logo /><small style={{ marginTop: 14 }}>{WHO[s.role]}</small><b>{sub}</b>
        <nav>{links}</nav><span className="grow" />
        <div className="who">{s.name}</div><div style={{ padding: "0 14px 8px" }}><Act url="/api/auth/logout" cls="link red">Logout</Act></div>
      </aside>
      <div><main className="main">{children}</main><Foot /></div>
    </div>
  );
}
