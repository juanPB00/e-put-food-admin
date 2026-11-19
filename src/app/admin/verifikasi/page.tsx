import Link from "next/link";
import { ReviewBox } from "@/components/Forms";
import Shell from "@/components/Shell";
import { requireRole } from "@/lib/auth";
import { q } from "@/lib/db";
import { jam, tgl } from "@/lib/util";

const TABS: [string, string][] = [["pending", "Menunggu"], ["approved", "Disetujui"], ["revision", "Perlu revisi"], ["rejected", "Ditolak"]];

export default async function Verifikasi({ searchParams }: { searchParams: { s?: string; id?: string } }) {
  const s = await requireRole("admin");
  const tab = TABS.some((t) => t[0] === searchParams.s) ? searchParams.s! : "pending";
  const [rows, counts] = await Promise.all([
    q(`SELECT u.*, r.name AS resto_name, r.address AS resto_address FROM users u LEFT JOIN restaurants r ON r.owner_id=u.id
       WHERE u.role IN ('resto','kurir') AND u.status=$1 ORDER BY u.id`, [tab]),
    q("SELECT status, count(*)::int AS n FROM users WHERE role IN ('resto','kurir') GROUP BY status"),
  ]);
  const cnt = (k: string) => counts.find((c) => c.status === k)?.n ?? 0;
  const sel = rows.find((r) => String(r.id) === searchParams.id) ?? rows[0];
  const label = (u: any) => (u.role === "resto" ? u.resto_name : u.name);
  return (
    <Shell s={s} at="/admin/verifikasi">
      <div className="eyebrow">Kepercayaan dimulai dari sini</div><h1>Kenali mitra, jaga kualitas.</h1><p className="muted">Periksa kelengkapan dan kecocokan dokumen sebelum akun diaktifkan.</p>
      <div className="chips">{TABS.map(([k, l]) => (<Link key={k} href={`/admin/verifikasi?s=${k}`} className={"chip" + (tab === k ? " on" : "")}>{l} ({cnt(k)})</Link>))}</div>
      <div className="split">
        <div className="card"><h2>Antrean akun</h2>
          {rows.length === 0 ? <div className="empty">Tidak ada akun di tab ini.</div> : (<div className="stack" style={{ gap: 10 }}>{rows.map((u) => (
            <Link key={u.id} href={`/admin/verifikasi?s=${tab}&id=${u.id}`} className={"card" + (sel?.id === u.id ? " teal" : "")} style={{ padding: 12 }}>
              <div className="row"><span style={{ fontSize: 22 }}>{u.role === "resto" ? "🍴" : "🛵"}</span><div className="grow"><b>{label(u)}</b><br /><small>{u.role === "resto" ? `Pemilik: ${u.name}` : `${u.details.vehicle || ""} • ${u.details.plate || ""}`} • {tgl(u.created_at)} {jam(u.created_at)}</small></div><span className="badge">{u.role === "resto" ? "Resto" : "Kurir"}</span></div>
            </Link>))}</div>)}
        </div>
        <div className="card">
          {!sel ? <div className="empty">Pilih akun untuk ditinjau.</div> : (<>
            <div className="row"><h2 className="grow">{label(sel)}</h2><small>{sel.role === "resto" ? "RST" : "KUR"}-{String(sel.id).padStart(3, "0")}</small></div>
            <p className="muted">{sel.name} • {sel.email} • {sel.phone}{sel.resto_address ? <><br />{sel.resto_address}</> : null}</p>
            <h3>Dokumen persyaratan</h3>
            <div className="stack" style={{ gap: 8, margin: "10px 0" }}>{Object.entries(sel.details).map(([k, v]) => (<div key={k} className="card" style={{ padding: 10 }}><b>{k.replace(/_/g, " ")}</b><br /><small>{String(v)}</small></div>))}</div>
            {sel.review_note && <p className="muted">Catatan terakhir: {sel.review_note}</p>}
            <ReviewBox key={sel.id} id={sel.id} kind={sel.role === "resto" ? "resto" : "kurir"} />
          </>)}
        </div>
      </div>
    </Shell>
  );
}
