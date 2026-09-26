# Buku Arus — Cashflow Pribadi

Aplikasi sederhana untuk mengatur arus kas bulanan: kebiasaan/tagihan rutin,
catatan pengeluaran, rencana pembelian dengan simulasi dampak, dan peringatan
kalau proyeksi sisa saldo mepet sebelum gajian berikutnya.

Aplikasi ini mendukung **banyak akun terpisah** (misalnya punya kamu dan
punya pacar) tanpa perlu deploy dua kali — lihat bagian "Akun terpisah" di
bawah. Tampilannya juga otomatis menyesuaikan device: di HP tampil seperti
app dengan menu di bawah, di tablet/laptop menu pindah jadi sidebar di kiri
dengan konten yang lebih lega.

## Cara pakai cepat (tanpa setup apa pun)

Buka `index.html` di browser mana pun — data langsung tersimpan otomatis di
`localStorage` browser itu. Ini cukup kalau kamu hanya pakai satu perangkat
dan tidak butuh sinkron.

## Deploy ke Cloudflare Pages (supaya bisa dibuka di device mana aja)

Ini alur lengkapnya dari nol:

1. **Buat repo GitHub.** Buat repo baru (bisa privat), lalu upload semua isi
   folder ini apa adanya — termasuk folder `functions/` (penting, itu yang
   bikin fitur sync jalan).
2. **Hubungkan ke Cloudflare Pages.**
   - Login ke [dash.cloudflare.com](https://dash.cloudflare.com).
   - Di sidebar kiri, buka **Workers & Pages**.
   - Klik **Create** → tab **Pages** → **Connect to Git**.
   - Pilih repo yang tadi kamu buat, lalu **Begin setup**.
   - Di bagian build settings: **kosongkan** "Build command", dan isi
     "Build output directory" dengan `/` (root).
   - Klik **Save and Deploy**. Tunggu sampai selesai — nanti kamu dapat URL
     seperti `https://buku-arus-xxxx.pages.dev`.
3. **Bikin KV namespace & sambungkan ke project.** Ini langkah yang bikin
   sync antar-device jalan. Tanpa ini, tombol "Sambungkan cloud" di app akan
   selalu gagal.
   - Di project Cloudflare Pages kamu (yang baru dibuat di langkah 2), buka
     tab **Settings**.
   - Scroll ke bagian **Functions** → **KV namespace bindings** → klik
     **Add binding**.
   - **Variable name**: ketik persis `BUKU_ARUS_KV`
   - **KV namespace**: klik dropdown → **Create a new namespace** → beri
     nama bebas, misal `buku-arus-kv` → simpan.
   - Klik **Save**.
4. **Redeploy.** Buka tab **Deployments** di project itu → pada deployment
   paling atas, klik menu titik tiga → **Retry deployment** (binding baru
   baru aktif setelah redeploy).
5. Selesai. Buka URL `.pages.dev` kamu di HP dan laptop.

**Tidak perlu** mengatur environment variable atau "PIN developer" apa pun
di dashboard Cloudflare — itu bedanya dari versi sebelumnya. PIN sekarang
sepenuhnya kamu tentukan langsung dari dalam aplikasi (lihat bagian
berikutnya).

## Menyambungkan sinkron cloud & akun terpisah

Di header aplikasi ada tombol **"Sambungkan cloud"**. Klik itu, lalu:

- Masukkan **kode akun bebas** (minimal 4 karakter) — anggap ini seperti
  gabungan username+password. Boleh kata apa saja yang cuma kamu tahu.
- Kode ini yang menentukan ruang data kamu di cloud. Di belakang layar,
  kode itu di-hash dan dipakai sebagai kunci penyimpanan — jadi tidak
  tersimpan sebagai teks biasa di server, dan setiap kode = ruang data yang
  benar-benar terpisah.

**Supaya arus kas kamu sinkron di semua device kamu sendiri:**
Pakai kode yang **sama persis** setiap kali klik "Sambungkan cloud", di HP
maupun laptop.

**Supaya pacar kamu punya akun sendiri (terpisah dari punya kamu):**
Dia buka URL `.pages.dev` yang sama di device-nya sendiri, klik "Sambungkan
cloud", lalu masukkan kode yang **berbeda** dari kodemu. Otomatis dia akan
punya arus kas, kebiasaan, dan rencana sendiri yang tidak akan tercampur
dengan punyamu — walaupun kalian berdua memakai situs `.pages.dev` yang
persis sama. Kalau suatu saat kalian mau punya satu ruang **bersama**
(misalnya untuk cashflow rumah tangga), tinggal pakai kode yang sama di
kedua device.

Kalau lupa kode akun atau ingin lepas dari cloud dan kembali ke penyimpanan
lokal saja: klik **"Sambungkan cloud"** lagi lalu kosongkan isiannya.

## Cadangan manual

Di tab **Atur**, tersedia tombol **Ekspor JSON** (unduh semua data sebagai
file) dan **Impor JSON** (memuat file cadangan itu kembali). Berguna sebagai
backup tambahan di luar sync cloud, atau untuk pindah data secara manual
antar perangkat / antar akun.

## Struktur file

```
index.html              → seluruh aplikasi (UI + logika)
functions/api/data.js   → endpoint sync (Cloudflare Pages Function)
```

## Catatan tentang data awal

Angka gaji dan kebiasaan (cicilan motor, cicilan mobil, transjakarta, gojek,
rokok, ngopi weekend) sudah diisi otomatis sebagai titik awal berdasarkan
rincian yang kamu berikan — semuanya bisa diedit atau dihapus kapan saja di
tab **Kebiasaan** dan **Atur**. Ini hanya nongol di data lokal awal /
akun baru yang belum pernah menyimpan apa pun ke cloud.

