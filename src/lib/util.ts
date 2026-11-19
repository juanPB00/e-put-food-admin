export const rp = (n: number) => "Rp" + Math.round(Number(n) || 0).toLocaleString("id-ID");
export const STATUS: Record<string, string> = {
  pending: "Menunggu resto", preparing: "Disiapkan", ready: "Siap diambil",
  delivering: "Diantar", arrived: "Tiba di tujuan", done: "Selesai", rejected: "Ditolak",
};
export const RANK: Record<string, number> = { rejected: -1, pending: 0, preparing: 1, ready: 2, delivering: 3, arrived: 4, done: 5 };
export const TITLE: Record<string, string> = {
  pending: "Menunggu konfirmasi resto.", preparing: "Makanan sedang disiapkan.", ready: "Menunggu kurir mengambil.",
  delivering: "Sebentar lagi, waktunya makan.", arrived: "Kurir sudah tiba.", done: "Pesanan selesai.", rejected: "Pesanan ditolak.",
};
export const jam = (d: string | Date) =>
  new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).replace(":", ".");
export const tgl = (d: string | Date) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
export const FEES = { shipping: 10000, service: 2000, voucher: { HANGAT10: 10000 } as Record<string, number> };
