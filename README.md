# E-put Food (Rantang)

Aplikasi pesan-antar makanan dengan 4 peran: **User**, **Pemilik Resto**, **Kurir**, **Admin**.
Stack: Next.js 14 (App Router) + TypeScript + PostgreSQL (`pg`).

## Cara menjalankan

1. Buka **pgAdmin**, buat database baru bernama `eputfood`.
2. Salin `.env.example` menjadi `.env`, lalu sesuaikan user/password PostgreSQL kamu:
   ```
   DATABASE_URL=postgres://postgres:PASSWORD@localhost:5432/eputfood
   AUTH_SECRET=string-acak-panjang
   ```
3. Jalankan:
   ```bash
   npm install
   npm run db:setup     # membuat tabel + data contoh (npm run db:reset untuk mengulang dari nol)
   npm run dev          # http://localhost:3000
   ```

## Akun contoh

| Peran | Email | Kata sandi |
|---|---|---|
| Admin | admin@eputfood.id | admin123 |
| User | juan@email.com | user1234 |
| Pemilik resto | mba.taza@email.com | resto1234 |
| Kurir | bian@email.com | kurir1234 |

Akun resto/kurir yang baru mendaftar berstatus *menunggu* sampai admin menyetujuinya
(contoh: rina.marlina@email.com, raka@email.com, asep@email.com sudah menunggu di antrean admin).

## Alur uji cepat

1. Login **User** → pilih Warung Mba Taza → tambah menu → kode `HANGAT10` → **Pesan & bayar**.
2. Login **Pemilik resto** (jendela lain/incognito) → **Terima** → **Tandai siap diambil**.
3. Login **Kurir** → **Terima tawaran** → Ambil pesanan → Tiba di tujuan → Selesaikan.
4. User: beri rating atau ajukan komplain → Admin: setujui refund / tolak klaim.
Chat (user ↔ kurir ↔ resto) ada di **kolom kiri** halaman detail pesanan dan diperbarui otomatis tiap 3 detik.

## Struktur

- `db/schema.sql` — skema PostgreSQL (users, restaurants, products, orders, order_items, order_events, messages, ratings, complaints)
- `scripts/setup.mjs` — migrasi + seed
- `src/app/api/*` — REST API (auth, orders, messages, products, admin)
- `src/components/OrderView.tsx` — detail pesanan bersama untuk user/resto/kurir (chat di kiri)
- `src/lib/*` — koneksi DB, sesi (JWT cookie), helper

## Catatan

- Pembayaran QRIS dan peta adalah **simulasi** (pesanan langsung berstatus lunas; posisi kurir mengikuti status).
- Foto makanan diganti ikon emoji; ganti dengan gambar sendiri di `components/RestoMenu.tsx` bila perlu.
