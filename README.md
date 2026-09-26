# Buku Arus — Cashflow Pribadi

Aplikasi sederhana untuk mengatur arus kas bulanan: kebiasaan/tagihan rutin,
catatan pengeluaran, rencana pembelian dengan simulasi dampak, dan peringatan
kalau proyeksi sisa saldo mepet sebelum gajian berikutnya.

Aplikasi ini mendukung **banyak akun terpisah** (misalnya punya kamu dan
punya pacar) tanpa perlu deploy dua kali. Tampilannya juga otomatis
menyesuaikan device: di HP tampil seperti app dengan menu di bawah, di
tablet/laptop menu pindah jadi sidebar di kiri.

## Cara pakai cepat (tanpa setup apa pun)

Buka `index.html` di browser mana pun — data langsung tersimpan otomatis di
`localStorage` browser itu. Cukup kalau kamu hanya pakai satu perangkat dan
tidak butuh sinkron.

## Struktur file

```
index.html       → seluruh aplikasi (UI + logika)
worker.js        → server kecil: melayani index.html + endpoint sinkron /api/data
wrangler.jsonc   → konfigurasi Cloudflare (nama, file statis, koneksi ke KV)
.assetsignore    → daftar file yang BUKAN bagian dari situs (jangan diutak-atik)
```

Catatan: sebelumnya proyek ini pakai folder `functions/api/data.js` (gaya
"Cloudflare Pages Functions" lama). Cloudflare sekarang menyatukan Pages ke
dalam platform Workers, dan folder `functions/` itu tidak lagi otomatis
terdeteksi di project baru — makanya diganti dengan `worker.js` +
`wrangler.jsonc` yang eksplisit. Efek ke penggunamu: nol, alurnya di
aplikasi tetap sama persis.

## Deploy ke Cloudflare (supaya bisa dibuka di device mana aja)

### 1. Buat KV namespace dulu

KV adalah tempat penyimpanan cloud-nya.

1. Login ke [dash.cloudflare.com](https://dash.cloudflare.com).
2. Di sidebar kiri, buka **Storage & Databases** → **KV**.
3. Klik **Create a namespace**, kasih nama bebas (misal `buku-arus-kv`) →
   **Add**.
4. Setelah dibuat, klik namespace itu dan **copy Namespace ID**-nya (deretan
   huruf-angka panjang).

### 2. Isi Namespace ID ke `wrangler.jsonc`

Buka file `wrangler.jsonc` di repo kamu, cari baris:

```jsonc
"id": "GANTI_DENGAN_NAMESPACE_ID_KAMU"
```

Ganti jadi Namespace ID yang kamu copy tadi. Simpan.

### 3. Buat repo GitHub & upload semua file

Upload apa adanya: `index.html`, `worker.js`, `wrangler.jsonc`,
`.assetsignore`, `README.md` — semuanya di root repo, tidak perlu folder
tambahan.

### 4. Hubungkan ke Cloudflare

1. Di dashboard Cloudflare → **Workers & Pages** → **Create** →
   **Connect to Git** (atau **Import an existing Git repository**).
2. Pilih repo tadi → **Begin setup** → **Save and Deploy**.
3. Karena repo sudah punya `wrangler.jsonc`, Cloudflare otomatis membaca
   konfigurasi itu (termasuk sambungan ke KV) — kamu **tidak perlu lagi**
   klik "Add binding" manual di dashboard.
4. Tunggu build selesai, kamu dapat URL seperti
   `https://buku-arus-xxxx.workers.dev` (atau `.pages.dev`, tergantung
   tampilan dashboard kamu).

### Kalau update di kemudian hari

Setiap kali push ke GitHub, Cloudflare seharusnya otomatis build ulang. Kalau
tidak muncul otomatis, buka project itu di dashboard → cari tombol
**"New deployment"** (biasanya di kanan atas, sebelah tombol Visit) → pilih
branch `main` → deploy.

## Menyambungkan sinkron cloud & akun terpisah

Di header aplikasi ada tombol **"Sambungkan cloud"**. Klik itu, lalu:

- Masukkan **kode akun bebas** (minimal 4 karakter) — anggap ini seperti
  gabungan username+password. Boleh kata apa saja yang cuma kamu tahu.
- Kode ini menentukan ruang data kamu di cloud. Di balik layar, kode itu
  di-hash dan dipakai sebagai kunci penyimpanan — setiap kode = ruang data
  yang benar-benar terpisah.

**Supaya arus kas kamu sinkron di semua device kamu sendiri:** pakai kode
yang **sama persis** di HP maupun laptop.

**Supaya pacar kamu punya akun sendiri:** dia buka URL yang sama di
device-nya, klik "Sambungkan cloud", masukkan kode yang **berbeda** dari
kodemu. Otomatis dia dapat ruang data sendiri, tidak tercampur dengan
punyamu. Kalau nanti mau punya satu ruang bersama, tinggal pakai kode yang
sama di kedua HP.

Kalau lupa kode akun atau ingin lepas dari cloud: klik "Sambungkan cloud"
lagi lalu kosongkan isiannya.

## Cadangan manual

Di tab **Atur**, tersedia tombol **Ekspor JSON** dan **Impor JSON** —
berguna sebagai backup tambahan di luar sync cloud.

## Catatan tentang data awal

Angka gaji dan kebiasaan (cicilan motor, cicilan mobil, transjakarta, gojek,
rokok, ngopi weekend) sudah diisi otomatis sebagai titik awal — semuanya
bisa diedit atau dihapus kapan saja di tab **Kebiasaan** dan **Atur**. Ini
hanya nongol di data lokal awal / akun baru yang belum pernah menyimpan apa
pun ke cloud.
