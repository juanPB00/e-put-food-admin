import Link from "next/link";
import Act from "@/components/Act";
import Shell from "@/components/Shell";
import { requireRole } from "@/lib/auth";
import { q, q1 } from "@/lib/db";
import { rp, STATUS, jam } from "@/lib/util";

export default async function Admin() {
  const s = await requireRole("admin");
  const jkt = "(o.created_at AT TIME ZONE 'Asia/Jakarta')::date = (now() AT TIME ZONE 'Asia/Jakarta')::date";
  const [st, pending, trend, complaints, tx] = await Promise.all([
    q1(`SELECT COALESCE(sum(total) FILTER (WHERE status<>'rejected'),0)::int AS value, count(*)::int AS n,
        count(*) FILTER (WHERE status='done')::int AS done, count(*) FILTER (WHERE status NOT IN ('done','rejected'))::int AS running FROM orders o WHERE ${jkt}`),
    q1("SELECT count(*)::int AS n FROM users WHERE role IN ('resto','kurir') AND status='pending'"),
    q(`SELECT to_char(d,'DD/MM') AS lbl, COALESCE(sum(o.total) FILTER (WHERE o.status<>'rejected'),0)::int AS v
       FROM generate_series((now() AT TIME ZONE 'Asia/Jakarta')::date - 6, (now() AT TIME ZONE 'Asia/Jakarta')::date, '1 day') d
       LEFT JOIN orders o ON (o.created_at AT TIME ZONE 'Asia/Jakarta')::date = d::date GROUP BY d ORDER BY d`),
    q(`SELECT c.*, o.code, o.total, u.name AS user_name, r.name AS resto FROM complaints c JOIN orders o ON o.id=c.order_id JOIN users u ON u.id=c.user_id
       JOIN restaurants r ON r.id=o.resto_id ORDER BY (c.status='open') DESC, c.id DESC LIMIT 6`),
    q("SELECT o.*, u.name AS user_name, r.name AS resto_name FROM orders o JOIN users u ON u.id=o.user_id JOIN restaurants r ON r.id=o.resto_id ORDER BY o.id DESC LIMIT 8"),
  ]);
  const open = complaints.filter((c) => c.status === "open").length;
  const max = Math.max(1, ...trend.map((t) => t.v));
  return (
    <Shell s={s} at="/admin">
      <div className="eyebrow">Pusat kendali Rantang</div><h1>Semua berjalan, semua terpantau.</h1><p className="muted">Pantau transaksi, kepercayaan mitra, dan pengalaman pelanggan.</p>
      <div className="g4 mt">
        <div className="card stat"><small>Nilai transaksi hari ini</small><b>{rp(st.value)}</b></div>
        <div className="card stat"><small>Total transaksi</small><b>{st.n}</b><small>{st.done} selesai • {st.running} berjalan</small></div>
        <div className="card stat"><small>Menunggu verifikasi</small><b>{pending.n} akun</b></div>
        <div className="card stat"><small>Komplain terbuka</small><b>{open}</b></div>
      </div>
      <div className="split mt">
        <div className="stack">
          <div className="card"><h2>Tren transaksi 7 hari</h2>
            <div className="bars">{trend.map((t) => (<div key={t.lbl}><i style={{ height: `${Math.max(4, (t.v / max) * 100)}px` }} />{t.lbl}<br /><b>{t.v ? Math.round(t.v / 1000) + "rb" : "0"}</b></div>))}</div></div>
          {pending.n > 0 && (<div className="card teal row"><div className="grow"><b>{pending.n} mitra baru menunggu persetujuan</b><br /><small>Tinjau dokumen dan bantu mereka mulai melayani.</small></div><Link className="btn ghost" href="/admin/verifikasi">Verifikasi akun</Link></div>)}
        </div>
        <div className="card"><div className="row"><h2 className="grow">Komplain</h2><span className="or">{open} terbuka</span></div>
          {complaints.length === 0 ? <div className="empty">Belum ada komplain.</div> : complaints.map((c) => (
            <div key={c.id} style={{ borderTop: "1px solid var(--line)", padding: "12px 0" }}>
              <div className="row"><span className={"badge" + (c.status === "open" ? "" : c.status === "refunded" ? " g" : " r")}>{c.status === "open" ? "Sedang ditinjau" : c.status === "refunded" ? "Refund disetujui" : "Ditolak"}</span><small>#{c.code}</small></div>
              <h3 style={{ marginTop: 6 }}>{c.title}</h3><small>{c.user_name} • {c.resto} • {rp(c.total)}</small>{c.body && <p className="muted">“{c.body}”</p>}
              {c.status === "open" && (<div className="row wrap2"><Act url="/api/admin/complaint" body={{ id: c.id, decision: "refunded" }}>Setujui refund</Act><Act url="/api/admin/complaint" body={{ id: c.id, decision: "rejected" }} cls="btn ghost">Tolak klaim</Act></div>)}
            </div>))}
        </div>
      </div>
      <div className="card mt"><h2>Transaksi terbaru</h2>
        {tx.length === 0 ? <div className="empty">Belum ada transaksi.</div> : (<table><thead><tr><th>ID pesanan</th><th>Pelanggan</th><th>Restoran</th><th>Total</th><th>Pembayaran</th><th>Status</th></tr></thead>
          <tbody>{tx.map((o) => (<tr key={o.id}><td className="b">#{o.code}</td><td>{o.user_name}</td><td>{o.resto_name}</td><td>{rp(o.total)}</td><td>{o.payment} • Lunas</td><td>{STATUS[o.status]} <small>{jam(o.created_at)}</small></td></tr>))}</tbody></table>)}
      </div>
    </Shell>
  );
}
