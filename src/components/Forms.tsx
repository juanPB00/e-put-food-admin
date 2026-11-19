"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Act from "./Act";

async function call(url: string, body: any, method = "POST") {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, d: await r.json().catch(() => ({})) };
}

export function Stars({ v, set, label }: { v: number; set: (n: number) => void; label: string }) {
  return (<div><b>{label}</b><div className="stars">{[1, 2, 3, 4, 5].map((n) => (<button key={n} type="button" className={n <= v ? "on" : ""} onClick={() => set(n)} aria-label={`${n} bintang`}>★</button>))}</div></div>);
}

export function RatingForm({ orderId }: { orderId: number }) {
  const r = useRouter();
  const [food, setFood] = useState(0), [courier, setCourier] = useState(0), [comment, setComment] = useState(""), [err, setErr] = useState("");
  async function send() {
    const { ok, d } = await call(`/api/orders/${orderId}`, { action: "rate", food, courier, comment });
    ok ? r.refresh() : setErr(d.error);
  }
  return (
    <div className="card">
      <h2>Sudah makan? Ceritakan rasanya.</h2>
      <div className="g2"><Stars v={food} set={setFood} label="Rasa makanan" /><Stars v={courier} set={setCourier} label="Layanan kurir" /></div>
      <textarea rows={2} placeholder="Tulis ulasan singkat…" value={comment} onChange={(e) => setComment(e.target.value)} />
      <div className="mt"><button className="btn" onClick={send}>Kirim rating</button></div>
      {err && <small className="err">{err}</small>}
    </div>
  );
}

export function ComplaintForm({ orderId }: { orderId: number }) {
  const r = useRouter();
  const [open, setOpen] = useState(false), [title, setTitle] = useState(""), [body, setBody] = useState(""), [err, setErr] = useState("");
  if (!open) return <button className="btn ghost" onClick={() => setOpen(true)}>Ada masalah? Ajukan komplain</button>;
  async function send() {
    const { ok, d } = await call(`/api/orders/${orderId}`, { action: "complaint", title, body });
    ok ? r.refresh() : setErr(d.error);
  }
  return (
    <div className="card">
      <h2>Ajukan komplain</h2>
      <input placeholder="Judul, misalnya: Minuman tumpah saat diterima" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea rows={3} placeholder="Ceritakan kejadiannya" value={body} onChange={(e) => setBody(e.target.value)} style={{ marginTop: 8 }} />
      <div className="mt row"><button className="btn" onClick={send}>Kirim komplain</button><button className="btn ghost" onClick={() => setOpen(false)}>Batal</button></div>
      {err && <small className="err">{err}</small>}
    </div>
  );
}

export function RejectBox({ orderId }: { orderId: number }) {
  const [reason, setReason] = useState("");
  return (
    <div className="stack" style={{ gap: 8 }}>
      <Act url={`/api/orders/${orderId}`} body={{ action: "accept" }}>Terima pesanan</Act>
      <select value={reason} onChange={(e) => setReason(e.target.value)}>
        <option value="">Alasan jika menolak…</option>
        <option>Stok habis</option><option>Dapur penuh</option><option>Resto tutup</option>
      </select>
      <Act url={`/api/orders/${orderId}`} body={{ action: "reject", reason }} cls="btn danger" ask="Tolak pesanan ini?">Tolak pesanan</Act>
    </div>
  );
}

const EMOJI = ["🍗", "🍲", "🍳", "🍜", "🍛", "🍤", "🥗", "🍢", "🍹", "☕"];
export function ProductForm({ p }: { p?: any }) {
  const r = useRouter();
  const blank = { name: "", category: "Makanan", price: "", description: "", emoji: "🍛", available: true };
  const [f, setF] = useState<any>(p ? { ...p, price: String(p.price), description: p.description || "" } : blank);
  const [err, setErr] = useState("");
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));
  async function save() {
    const body = { ...f, price: Number(f.price) };
    const { ok, d } = p ? await call(`/api/products/${p.id}`, body, "PATCH") : await call("/api/products", body);
    if (!ok) return setErr(d.error);
    p ? r.push("/owner/produk") : (setF(blank), r.refresh());
    r.refresh();
  }
  return (
    <div className="card">
      <div className="row"><h2 className="grow">{p ? "Ubah produk" : "Tambah produk"}</h2></div>
      <label>Nama produk</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Tahu Cabe Garam" />
      <div className="g2">
        <div><label>Kategori</label><select value={f.category} onChange={(e) => set("category", e.target.value)}><option>Makanan</option><option>Minuman</option><option>Camilan</option></select></div>
        <div><label>Harga (Rp)</label><input type="number" min={0} value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="18000" /></div>
      </div>
      <label>Deskripsi</label><textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} />
      <label>Ikon</label>
      <div className="chips">{EMOJI.map((e) => (<button type="button" key={e} className={"chip" + (f.emoji === e ? " on" : "")} onClick={() => set("emoji", e)}>{e}</button>))}</div>
      <label><input type="checkbox" checked={f.available} onChange={(e) => set("available", e.target.checked)} style={{ width: "auto", marginRight: 8 }} />Langsung tersedia</label>
      <div className="mt stack" style={{ gap: 8 }}>
        <button className="btn" onClick={save}>{p ? "Simpan perubahan" : "Simpan & terbitkan"}</button>
        {p && <a className="btn ghost" href="/owner/produk">Batal</a>}
      </div>
      {err && <small className="err">{err}</small>}
    </div>
  );
}

export function ReviewBox({ id, kind }: { id: number; kind: string }) {
  const r = useRouter();
  const [note, setNote] = useState(""), [err, setErr] = useState("");
  async function decide(decision: string) {
    const { ok, d } = await call("/api/admin/verify", { id, decision, note });
    if (ok) { r.push("/admin/verifikasi"); r.refresh(); } else setErr(d.error);
  }
  return (
    <div>
      <label>Catatan peninjauan</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Identitas dan dokumen sesuai." />
      <div className="mt stack" style={{ gap: 8 }}>
        <button className="btn" onClick={() => decide("approved")}>Setujui & aktifkan akun {kind}</button>
        <div className="g2"><button className="btn ghost" onClick={() => decide("revision")}>Minta revisi</button><button className="btn danger" onClick={() => decide("rejected")}>Tolak akun</button></div>
      </div>
      <small className="muted">Penolakan dan permintaan revisi wajib disertai alasan.</small>
      {err && <small className="err">{err}</small>}
    </div>
  );
}
