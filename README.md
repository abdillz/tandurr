# Prototipe TANDUR v2

Prototipe interaktif untuk Lomba BMC AGFESPORA 2026, Tim Pangpang (Universitas Brawijaya).

## Cara membuka
1. Ekstrak zip ini.
2. Klik dua kali `index.html` (Chrome, Edge, Safari, atau Firefox). Tidak perlu internet atau instalasi.
3. Untuk dibagikan lewat link: unggah seluruh folder ke Netlify Drop, Vercel, atau GitHub Pages, lalu jadikan link itu kode QR di slide.

## Alur
Splash screen, lalu pilih peran. Tampilan menyesuaikan perangkat peran itu:
- Petani (Pak Joko): HP, dengan mode aplikasi dan mode WhatsApp.
- Koperasi (Bu Dewi), SPPG (Pak Bayu), Pemda (Bu Rina): dasbor web.

Di atas layar ada pemandu 6 langkah. Perubahan di satu peran terlihat di peran lain. Di sisi kanan layar ada panel penjelasan per peran dan per menu: masalah yang diselesaikan, hal yang perlu diperhatikan, apa yang dicoba, keterhubungan antar peran, dan teknologi yang dipakai.

Urutan alur: SPPG kirim permintaan, Koperasi bagi kuota dan kirim kontrak, Petani terima kontrak, Petani foto mutu dan QR, Koperasi kirim ke SPPG, SPPG terima dan bayar. Bila ingin melompat, tombol Percepat/Anggap sudah selesai tersedia di layar yang menunggu langkah peran lain.

## Catatan
- Semua nama, harga, dan angka adalah data ilustrasi.
- Penilaian foto adalah simulasi. Perhitungan kebutuhan, kuota, dan peringatan dini memakai aturan dan algoritma biasa, bukan AI. AI (Gemini) hanya dipakai pada penilaian grade dan kesegaran dari foto.
- Peta Pemda bersifat skematis, bukan peta sebenarnya. Pembayaran dan pembiayaan bank mitra adalah simulasi. TANDUR tidak memegang uang maupun barang.
- Warna dan logo mengikuti logo TANDUR (hijau #3E4C21, cokelat #42281F, latar #DEE9C6 ke #F1ECB4).

## Struktur
`index.html`, `css/style.css`, `js/core.js` (kerangka, splash, pemandu), `js/petani.js`, `js/koperasi.js`, `js/sppg.js`, `js/pemda.js`, `js/qr.js` (pembuat QR tanpa library luar), `assets/` (logo dan font Poppins).
