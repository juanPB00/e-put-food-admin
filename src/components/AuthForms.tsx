"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function post(url: string, body: any) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, d: await r.json().catch(() => ({})) };
}

export function LoginForm() {
  const r = useRouter();
  const ROLES: [string, string][] = [["user", "User"], ["resto", "Pemilik Resto"], ["kurir", "Kurir"], ["admin", "Admin"]];
  const [role, setRole] = useState("user"), [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const { ok, d } = await post("/api/auth/login", { email, password, role });
    setBusy(false);
    if (!ok) return setErr(d.error || "Gagal masuk.");
    r.push(d.redirect); r.refresh();
  }
  return (
    <form onSubmit={submit}>
      <div className="eyebrow">Selamat datang di Rantang</div>
      <h1>Senang bertemu lagi!</h1>
      <p className="muted">Masuk dan lanjutkan hal baik hari ini.</p>
      <label>Masuk sebagai</label>
      <div className="chips">{ROLES.map(([k, l]) => (<button type="button" key={k} className={"chip" + (role === k ? " on" : "")} onClick={() => setRole(k)}>{l}</button>))}</div>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan.praba@email.com" required />
      <label htmlFor="pw">Kata sandi</label>
      <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
      <div className="mt"><button className="btn full" disabled={busy}>Masuk sebagai {ROLES.find((x) => x[0] === role)![1]}</button></div>
      {err && <small className="err">{err}</small>}
      <div className="note">Akun Pemilik Resto dan Kurir hanya dapat digunakan setelah diverifikasi. Pilih Admin untuk akses pengelolaan.</div>
      <p className="mt right muted" style={{ textAlign: "center" }}>Belum punya akun? <Link href="/register" className="or">Daftar sekarang</Link></p>
      <p style={{ textAlign: "center" }}><small>Ingin membawa restomu ke Rantang? <Link href="/register?as=resto" className="or">Daftar mitra resto</Link></small></p>
    </form>
  );
}

export function RegisterForm({ initial }: { initial: string }) {
  const r = useRouter();
  const [role, setRole] = useState(["kurir", "resto"].includes(initial) ? initial : "user");
  const [f, setF] = useState<Record<string, any>>({ category: "Masakan rumahan" });
  const [err, setErr] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF((x) => ({ ...x, [k]: v }));
  const inp = (k: string, label: string, ph = "", type = "text") => (
    <div><label htmlFor={k}>{label}</label><input id={k} type={type} placeholder={ph} value={f[k] || ""} onChange={(e) => set(k, e.target.value)} /></div>);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const { ok, d } = await post("/api/auth/register", { ...f, role });
    setBusy(false);
    if (!ok) return setErr(d.error || "Gagal mendaftar.");
    if (d.redirect) { r.push(d.redirect); r.refresh(); } else setMsg(d.message);
  }
  if (msg) return (<div><h1>Terima kasih!</h1><p>{msg}</p><Link className="btn" href="/login">Ke halaman masuk</Link></div>);
  return (
    <form onSubmit={submit}>
      <div className="eyebrow">Mulai cerita baikmu</div>
      <h1>Yuk, jadi bagian Rantang.</h1>
      <p className="muted">Satu langkah lebih dekat ke rasa favoritmu.</p>
      <div className="chips">{[["user", "User"], ["kurir", "Kurir"], ["resto", "Mitra Resto"]].map(([k, l]) => (<button type="button" key={k} className={"chip" + (role === k ? " on" : "")} onClick={() => setRole(k)}>{l}</button>))}</div>
      {inp("name", "Nama lengkap", "Juan Praba")}
      <div className="g2">{inp("email", "Email", "juan@email.com", "email")}{inp("phone", "Nomor WhatsApp", "0812 3456 7890")}</div>
      {inp("password", "Kata sandi", "Buat kata sandi", "password")}
      <small className="muted">Minimal 8 karakter, gabungkan huruf dan angka.</small>
      {inp("confirm", "Konfirmasi kata sandi", "Ulangi kata sandi", "password")}
      {role === "kurir" && (<><div className="g2">{inp("vehicle", "Kendaraan", "Honda Vario")}{inp("plate", "Plat nomor", "D 1234 AB")}</div><div className="g3">{inp("ktp", "No. KTP")}{inp("sim", "No. SIM C")}{inp("stnk", "No. STNK")}</div></>)}
      {role === "resto" && (<>{inp("resto_name", "Nama resto", "Warung Mba Taza")}{inp("address", "Alamat resto", "Jl. Riau No. 42, Bandung")}
        <div><label>Kategori</label><select value={f.category} onChange={(e) => set("category", e.target.value)}><option>Masakan rumahan</option><option>Soto</option><option>Nasi goreng</option><option>Mie & bakso</option><option>Camilan</option><option>Minuman</option></select></div>
        <div className="g2">{inp("ktp", "No. KTP pemilik")}{inp("nib", "NIB usaha")}</div></>)}
      <label style={{ fontWeight: 400 }}><input type="checkbox" style={{ width: "auto", marginRight: 8 }} checked={!!f.agree} onChange={(e) => set("agree", e.target.checked)} />Saya menyetujui Syarat & Ketentuan dan Kebijakan Privasi Rantang.</label>
      <div className="mt"><button className="btn full" disabled={busy}>Buat akun {role === "user" ? "User" : role === "kurir" ? "Kurir" : "Mitra Resto"}</button></div>
      {err && <small className="err">{err}</small>}
      {role !== "user" && <div className="note">Akun {role === "kurir" ? "Kurir" : "Mitra Resto"} ditinjau admin dalam 1–2 hari kerja sebelum bisa dipakai.</div>}
      <p className="mt muted" style={{ textAlign: "center" }}>Sudah bergabung? <Link href="/login" className="or">Masuk ke akun</Link></p>
    </form>
  );
}
