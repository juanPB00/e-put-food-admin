import { Logo } from "./Shell";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="top"><Logo /><span className="grow" /><small>Butuh bantuan?</small></header>
      <div className="auth">
        <section className="hero">
          <small className="badge g">Dari dapur lokal, untuk kamu</small>
          <h1 style={{ marginTop: 14 }}>Rasa rumahan. Hangat di setiap perjalanan.</h1>
          <p style={{ color: "var(--green)" }}>Makanan favorit dari tetangga terbaik. Dipesan mudah, diantar dengan sepenuh hati.</p>
          <div className="plate" aria-hidden>🍗</div>
          <p className="mt"><b>1.200+ resto lokal, satu rasa percaya.</b><br /><small>Teman makan andalan warga Bandung.</small></p>
        </section>
        <section>{children}</section>
      </div>
      <footer className="foot"><span>© 2026 Rantang. Hangat sampai tujuan.</span><span>Privasi • Syarat & ketentuan</span></footer>
    </>
  );
}
