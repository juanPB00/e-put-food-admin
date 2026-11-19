"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Tombol generik: kirim request ke API, lalu refresh halaman / pindah halaman. */
export default function Act({ url, body = {}, method = "POST", cls = "btn", ask, children }: {
  url: string; body?: any; method?: string; cls?: string; ask?: string; children: React.ReactNode;
}) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function go() {
    if (ask && !confirm(ask)) return;
    setBusy(true); setErr("");
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: method === "DELETE" ? undefined : JSON.stringify(body) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Terjadi kesalahan.");
    if (d.redirect) r.push(d.redirect); else r.refresh();
  }
  return (<><button className={cls} disabled={busy} onClick={go}>{children}</button>{err && <small className="err">{err}</small>}</>);
}
