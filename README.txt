USCS AUTO GENERATOR v2.0 (SoilLab · USCS)
=========================================
Klasifikasi tanah USCS otomatis (ASTM D2487) + pembuat deskripsi & laporan laboratorium.
Berjalan OFFLINE di browser (Chrome/Edge/Firefox). Tidak perlu instal, tidak perlu internet.

CARA PAKAI
1. Ekstrak ZIP, lalu buka index.html (klik dua kali).
2. Isi identitas sampel, komposisi (gravel, sand, silt, clay), Atterberg, gradasi, direct shear.
   - PI = LL - PL, Cu = D60/D10, Cc = D30^2/(D10 x D60) dihitung otomatis (bisa dimatikan).
   - Centang NP bila non-plastis; centang Organik / Gambut bila perlu.
3. Hasil tampil langsung. Tekan "Generate klasifikasi & deskripsi" untuk membuat teks laporan.
   Kop laporan: isi nama instansi, alamat, dan unggah logo pada kartu "Kop laporan" (tersimpan di browser).
4. Teks dapat diedit, lalu "Salin deskripsi lengkap", "Ekspor Word (.doc)", atau "Cetak / simpan PDF".
5. "Simpan sampel ini" memasukkan ke database (tersimpan di browser). Ekspor CSV, Rekap Word,
   Cadangkan/Impor JSON untuk pindah perangkat.

CAKUPAN KLASIFIKASI
- Berbutir kasar: GW, GP, GM, GC, GC-GM, SW, SP, SM, SC, SC-SM, simbol ganda (fines 5-12%),
  modifier "dengan kerikil/pasir" (>=15%).
- Berbutir halus: CL, ML, CL-ML, OL, CH, MH, OH, modifier "berpasir/berkerikil" (>=30%) dan
  "dengan pasir/kerikil" (15-29%).
- Gambut: Pt (centang manual).

BATASAN
- Fraksi cobble/boulder tidak diperhitungkan (data input = fraksi lolos 75 mm).
- Organik ditentukan dari centang atau rasio LL kering oven / LL < 0,75.
- Alat bantu klasifikasi awal; hasil final perlu pemeriksaan metode uji dan standar ASTM D2487/SNI.

LAPORAN PDF / WORD: 1 lembar A4. Kiri = identitas & tabel hasil uji; kanan = klasifikasi USCS,
komposisi, dan diagram plastisitas; bawah = deskripsi & tanda tangan.

FILE: index.html, style.css, classify.js (mesin klasifikasi), app.js (antarmuka), README.txt
