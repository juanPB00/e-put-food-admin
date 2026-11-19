import "dotenv/config";
import fs from "node:fs";
import pg from "pg";
import bcrypt from "bcryptjs";

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
if (process.argv.includes("--reset")) {
  await db.query("DROP TABLE IF EXISTS complaints, ratings, messages, order_events, order_items, orders, products, restaurants, users CASCADE");
}
await db.query(fs.readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));

const { rows } = await db.query("SELECT count(*)::int AS n FROM users");
if (rows[0].n === 0) {
  const user = async (name, email, pass, role, status = "approved", phone = "0812 3456 7890", details = {}) =>
    (await db.query(
      "INSERT INTO users(name,email,phone,password_hash,role,status,details) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      [name, email, phone, bcrypt.hashSync(pass, 10), role, status, details]
    )).rows[0].id;
  const resto = async (owner, name, address, category, emoji, promo, products) => {
    const id = (await db.query(
      "INSERT INTO restaurants(owner_id,name,address,category,emoji,promo) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
      [owner, name, address, category, emoji, promo]
    )).rows[0].id;
    for (const [n, cat, price, desc, em, av = true] of products)
      await db.query("INSERT INTO products(resto_id,name,category,price,description,emoji,available) VALUES($1,$2,$3,$4,$5,$6,$7)", [id, n, cat, price, desc, em, av]);
  };

  await user("Alwa Pratama", "admin@eputfood.id", "admin123", "admin");
  await user("Juan Praba", "juan@email.com", "user1234", "user", "approved", "0812 3456 7890", { address: "Jl. Cihapit No. 18, Bandung. Pagar putih, titip di teras." });
  await user("Bian", "bian@email.com", "kurir1234", "kurir", "approved", "0813 1111 2222", { vehicle: "Honda Vario", plate: "D 4821 ACF", ktp: "3273••••", sim: "SIM C aktif", stnk: "Sesuai" });

  const o1 = await user("Ahmad Ibrahim", "mba.taza@email.com", "resto1234", "resto");
  await resto(o1, "Warung Mba Taza", "Jl. Riau No. 42, Bandung", "Masakan rumahan", "🍗", "Diskon Rp10.000", [
    ["Nasi Ayam Bakar", "Makanan", 28000, "Ayam bakar kecap, nasi hangat, lalap & sambal.", "🍗"],
    ["Soto Ayam Kampung", "Makanan", 24000, "Kuah kuning segar, suwiran ayam & telur.", "🍲"],
    ["Nasi Goreng Kampung", "Makanan", 24000, "Bumbu rumahan, telur mata sapi & kerupuk.", "🍳"],
    ["Es Teh Manis", "Minuman", 6000, "Teh melati pilihan, segar dengan gula asli.", "🍹"],
    ["Kerupuk Udang", "Camilan", 3000, "Renyah, gurih.", "🍤", false],
  ]);
  const o2 = await user("Pak Darto", "pak.darto@email.com", "resto1234", "resto");
  await resto(o2, "Soto Ayam Pak Darto", "Jl. Dipatiukur No. 10, Bandung", "Soto", "🍲", "Gratis ongkir", [
    ["Soto Ayam Bening", "Makanan", 22000, "Soto ayam kuah bening, bihun, koya.", "🍲"],
    ["Soto Betawi", "Makanan", 30000, "Kuah santan, daging sapi empuk.", "🍛"],
    ["Teh Botol Dingin", "Minuman", 5000, "Dingin segar.", "🍹"],
  ]);
  const o3 = await user("Bu Sore", "nasgor.sore@email.com", "resto1234", "resto");
  await resto(o3, "Nasi Goreng Sore", "Jl. Trunojoyo No. 24, Bandung", "Nasi goreng", "🍳", "Hemat 20%", [
    ["Nasi Goreng Spesial", "Makanan", 26000, "Telur, ayam suwir, acar.", "🍳"],
    ["Nasi Goreng Seafood", "Makanan", 32000, "Udang & cumi.", "🍤"],
  ]);
  const o4 = await user("Mang Ujang", "mang.ujang@email.com", "resto1234", "resto");
  await resto(o4, "Mie Ayam Mang Ujang", "Jl. Sukajadi No. 3, Bandung", "Mie & bakso", "🍜", "Mulai Rp18.000", [
    ["Mie Ayam Bakso", "Makanan", 18000, "Mie kenyal, ayam kecap, bakso.", "🍜"],
    ["Mie Ayam Ceker", "Makanan", 20000, "Dengan ceker empuk.", "🍜"],
  ]);

  // akun menunggu verifikasi admin
  const p1 = await user("Rina Marlina", "rina.marlina@email.com", "resto1234", "resto", "pending", "0813 7712 9021", { ktp: "Nama sesuai pendaftar", nib: "1293••••0461", sertifikat_halal: "Berlaku hingga Okt 2028" });
  await resto(p1, "Dapur Teh Rina", "Jl. Sukajadi No. 76, Bandung", "Masakan rumahan", "🥘", null, []);
  await user("Raka Saputra", "raka@email.com", "kurir1234", "kurir", "pending", "0813 5555 6666", { vehicle: "Honda Beat", plate: "D 3918 BZ", ktp: "Cocok", sim: "SIM C aktif", stnk: "Perlu diperbaiki" });
  await user("Asep Hidayat", "asep@email.com", "kurir1234", "kurir", "pending", "0813 7777 8888", { vehicle: "Yamaha Mio", plate: "D 5281 FX", ktp: "Cocok", sim: "SIM C aktif", stnk: "Sesuai" });
  console.log("Data contoh dibuat.");
}
console.log("Database siap.");
await db.end();
