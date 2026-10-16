/* Peran Koperasi (Bu Dewi): dasbor web */
(function () {
  const T = window.T, S = T.S;
  T.views.koperasi = { nav: [{ k: 'beranda', t: 'Beranda', i: 'home' }, { k: 'permintaan', t: 'Permintaan SPPG', i: 'doc' }, { k: 'kuota', t: 'Kuota dan Kontrak', i: 'list' }, { k: 'anggota', t: 'Anggota', i: 'users' }, { k: 'panen', t: 'Panen dan Mutu', i: 'camera' }, { k: 'uang', t: 'Keuangan', i: 'wallet' }] };

  T.acts['ch-comm'] = el => { S.sel = el.value; };
  T.acts['ch-res'] = el => { S.res = +el.value; };
  T.acts.sendk = () => { S.ck = S.sel; T.adv(1); T.adv(2); S.calc = true; T.toast('Kontrak tanam ' + T.COMM[S.ck].n.toLowerCase() + ' terkirim ke 9 anggota'); };
  T.acts.remind = () => T.toast('Pengingat WhatsApp terkirim ke Bu Sari dan Pak Heri (simulasi)');
  T.acts.shipk = () => { T.adv(5); T.toast('Kiriman diberangkatkan ke SPPG Pakis'); };
  T.acts.loan = () => T.toast('Pengajuan diteruskan ke bank mitra dengan data kontrak sebagai pendukung (simulasi)');

  T.views.koperasi.render = key => {
    const K = S.ck, C = T.COMM[K], web = (b, u) => T.web('koperasi', key, b, 'koperasi/' + u);
    if (key === 'beranda') {
      const steps = [['Permintaan SPPG masuk', 1], ['Kuota dibagi dan kontrak dikirim', 2], ['Petani menerima kontrak', 3], ['Panen dinilai (foto + QR)', 4], ['Kiriman ke SPPG', 5], ['Pembayaran diterima', 6]];
      const tgt = T.quotas(K).target;
      return web(`<h2>Selamat datang, Bu Dewi</h2><div class="sub">KDMP Sumber Makmur · Kec. Pakis, Kab. Malang</div>
        <div class="grid g4" style="margin-bottom:12px"><div class="card kpi"><small>Anggota aktif</small><b>9</b><span>petani terdaftar</span></div><div class="card kpi"><small>Lahan terdaftar</small><b>2,5 ha</b><span>hortikultura</span></div><div class="card kpi"><small>Permintaan aktif</small><b>${S.stage >= 1 ? 1 : 0}</b><span>dari SPPG Pakis</span></div><div class="card kpi"><small>Nilai kontrak minggu ini</small><b>${S.stage >= 2 ? T.rp(tgt * C.price).replace('Rp', 'Rp ') : '-'}</b><span>${S.stage >= 2 ? tgt + ' kg ' + C.n.toLowerCase() : 'belum ada'}</span></div></div>
        ${S.stage >= 3 && S.stage < 5 ? `<div class="alert" style="margin-bottom:12px">${T.ic('alert', 20, '#C98B1F')}<div><b>2 anggota tertinggal jadwal tanam</b>Bu Sari (3 hari) dan Pak Heri (5 hari). SPPG sudah ikut melihat peringatan ini.<div class="actions" style="margin-top:8px"><button class="btn sm" data-act="remind">Kirim pengingat WhatsApp</button></div></div></div>` : ''}
        <div class="card"><h3 style="margin-bottom:8px">Langkah minggu ini</h3><ul class="tl">${steps.map(s => `<li class="${S.stage >= s[1] ? 'done' : ''}"><i></i>${s[0]}</li>`).join('')}</ul></div>`, 'beranda');
    }
    if (key === 'permintaan') {
      let body;
      if (S.stage < 1) body = T.waiting('Belum ada permintaan baru dari SPPG. Peran SPPG mengirimnya dari menu Menu dan Kebutuhan.', 'Anggap SPPG sudah mengirim', 1);
      else body = `<div class="card"><div class="rowb"><div><b>SPPG Pakis</b><div class="legend" style="margin:2px 0 0">${S.porsi.toLocaleString('id-ID')} porsi × ${S.hari} hari · minggu depan</div></div><span class="chip ${S.stage >= 2 ? 'ok' : 'warn'}">${S.stage >= 2 ? 'Sudah dikontrakkan' : 'Menunggu rencana kuota'}</span></div>
        <table style="margin-top:10px"><tr><th>Komoditas</th><th class="num">Kebutuhan per minggu</th><th class="num">Harga referensi</th></tr>${Object.keys(T.COMM).map(k => `<tr><td>${T.COMM[k].n}</td><td class="num"><b>${T.fmt(T.need(k))} kg</b></td><td class="num">${T.rp(T.COMM[k].price)}/kg</td></tr>`).join('')}</table>
        <div class="actions"><button class="btn brown" data-nav="kuota">Buat rencana kuota</button></div></div><div class="legend">Komoditas dikontrakkan bergantian agar lahan tidak monokultur. Demo ini menjalankan satu komoditas.</div>`;
      return web(`<h2>Permintaan dari SPPG</h2><div class="sub">Kebutuhan dapur MBG yang dikirim terjadwal</div>${body}`, 'permintaan');
    }
    if (key === 'kuota') {
      const k = S.sel, { target, q } = T.quotas(k), tot = q.reduce((a, b) => a + b, 0), sp = T.sppgPrice(k), mg = sp - T.COMM[k].price;
      return web(`<h2>Pembagian kuota dan kontrak tanam</h2><div class="sub">Atur target tanam, lihat kuota tiap anggota, lalu kirim kontrak</div>
        <div class="grid g2" style="margin-bottom:12px"><div><label>Komoditas</label><select id="comm">${Object.keys(T.COMM).map(c => `<option value="${c}" ${c === k ? 'selected' : ''}>${T.COMM[c].n} (${T.fmt(T.need(c))} kg/minggu)</option>`).join('')}</select></div><div><label>Cadangan pasokan: <b id="reslab">${S.res}%</b></label><input type="range" id="res" min="0" max="30" value="${S.res}"></div></div>
        <div class="grid g4" style="margin-bottom:12px"><div class="card kpi"><small>Kebutuhan SPPG</small><b>${T.fmt(T.need(k))} kg</b><span>per minggu</span></div><div class="card kpi"><small>Cadangan</small><b>${S.res}%</b><span>untuk gagal panen kecil</span></div><div class="card kpi"><small>Target tanam</small><b>${target} kg</b><span>per minggu</span></div><div class="card kpi"><small>Harga ke petani</small><b>${T.rp(T.COMM[k].price)}</b><span>per kg, dikunci sebelum tanam</span></div></div>
        <div class="card nopad"><table><tr><th>Anggota</th><th>Lahan</th><th>Riwayat</th><th>Porsi kuota</th><th class="num">Kuota</th></tr>${T.MEMBERS.map((m, i) => `<tr><td><b>${m.n}</b></td><td>${String(m.ha).replace('.', ',')} ha</td><td class="mut">${m.h}</td><td style="width:30%"><div class="bar2"><i style="width:${q[i] / Math.max(...q) * 100}%"></i></div></td><td class="num"><b>${q[i]} kg</b></td></tr>`).join('')}<tr><td colspan="4"><b>Total kuota terbagi</b></td><td class="num"><b>${tot} kg</b></td></tr></table></div>
        <div class="card" style="margin-top:12px;background:var(--card2)"><b>Transparansi harga</b><div class="legend" style="margin:3px 0 0">Harga ke petani ${T.rp(T.COMM[k].price)}/kg, harga ke SPPG ${T.rp(sp)}/kg, selisih ${T.rp(mg)}/kg (${(mg / sp * 100).toFixed(1).replace('.', ',')}%) untuk sortir, angkut, dan operasional. Selisih ini tampil di aplikasi petani, sehingga koperasi tidak menjadi tengkulak baru.</div></div>
        <div class="actions"><button class="btn" data-act="sendk" ${S.stage >= 2 ? 'disabled' : ''}>${S.stage >= 2 ? 'Kontrak sudah terkirim' : 'Kirim Kontrak Tanam ke Petani'}</button>${S.stage >= 2 ? '<button class="btn ghost" data-act="go" data-r="petani" data-k="kontrak">Lihat dari sisi petani</button>' : ''}</div><div class="legend">Kuota dibagi menurut lahan dan riwayat panen. Data ilustrasi.</div>`, 'kuota');
    }
    if (key === 'anggota') {
      const { q } = T.quotas(K);
      return web(`<h2>Anggota</h2><div class="sub">Status kontrak dan progres tanam tiap anggota</div><div class="card nopad"><table><tr><th>Anggota</th><th>Lahan</th><th class="num">Kuota</th><th>Kontrak</th><th>Progres tanam</th></tr>${T.MEMBERS.map((m, i) => { const st = T.lotStatus(i); return `<tr><td><b>${m.n}</b></td><td>${String(m.ha).replace('.', ',')} ha</td><td class="num">${S.stage >= 2 ? q[i] + ' kg' : '-'}</td><td>${S.stage >= 3 ? '<span class="chip ok">Diterima</span>' : S.stage >= 2 ? '<span class="chip warn">Menunggu</span>' : '<span class="chip">Belum ada</span>'}</td><td><span class="chip ${st[1]}">${st[0]}</span></td></tr>`; }).join('')}</table></div>${S.stage >= 3 && S.stage < 5 ? '<div class="actions"><button class="btn sm" data-act="remind">Kirim pengingat ke yang tertinggal</button></div>' : ''}`, 'anggota');
    }
    if (key === 'panen') {
      let body;
      if (S.stage < 4) body = T.waiting('Menunggu petani memotret hasil panen. Foto dinilai AI (grade dan kesegaran), lalu tiap lot mendapat QR.', 'Anggap panen sudah dinilai', 4);
      else {
        const q = T.quotas(K).q, rdy = T.MEMBERS.map((m, i) => i).filter(i => T.gradeOf(i));
        body = `<div class="card nopad"><table><tr><th>Lot</th><th>Petani</th><th class="num">Jumlah</th><th>Mutu</th><th>QR</th><th>Status</th></tr>${T.MEMBERS.map((m, i) => { const g = T.gradeOf(i), st = T.lotStatus(i); return `<tr><td><b>${T.lotId(i)}</b></td><td>${m.n}</td><td class="num">${q[i]} kg</td><td>${g ? 'Grade ' + g[0] + ' · ' + g[1] + '%' : '<span class="mut">belum</span>'}</td><td>${g ? '<span class="chip ok">Ada</span>' : '-'}</td><td><span class="chip ${st[1]}">${st[0]}</span></td></tr>`; }).join('')}</table></div>
        <div class="actions">${S.stage >= 5 ? '<span class="chip ok">Kiriman sudah berangkat ke SPPG Pakis</span><button class="btn ghost" data-act="go" data-r="sppg" data-k="terima">Lihat dari sisi SPPG</button>' : `<button class="btn brown" data-act="shipk">Kirim ke SPPG (${rdy.length} lot siap)</button><span class="legend" style="margin:0">Lot lain menyusul saat panennya dinilai.</span>`}</div>`;
      }
      return web(`<h2>Panen dan mutu</h2><div class="sub">Hasil foto petani, grade, dan kode QR tiap lot</div>${body}`, 'panen');
    }
    const del = T.delivered(), sp = T.sppgPrice(K), val = del * sp, farmer = del * C.price, mg = val - farmer, fee = Math.round(val * 0.01);
    return web(`<h2>Keuangan koperasi</h2><div class="sub">Rincian kiriman, pembayaran, dan akses pembiayaan</div>
      <div class="card"><div class="rowb"><h3>Kiriman minggu ini</h3><span class="chip ${S.stage >= 6 ? 'ok' : 'warn'}">${S.stage >= 6 ? 'Sudah dibayar SPPG' : S.stage >= 5 ? 'Menunggu pembayaran' : 'Belum dikirim'}</span></div>
        <table style="margin-top:8px"><tr><td>Nilai kiriman (${del} kg × ${T.rp(sp)})</td><td class="num"><b>${S.stage >= 5 ? T.rp(val) : '-'}</b></td></tr><tr><td>Diteruskan ke petani (${del} kg × ${T.rp(C.price)})</td><td class="num">${S.stage >= 5 ? T.rp(farmer) : '-'}</td></tr><tr><td>Selisih koperasi (sortir, angkut, operasional)</td><td class="num">${S.stage >= 5 ? T.rp(mg) : '-'}</td></tr><tr><td>Biaya pasok TANDUR (1% dari nilai)</td><td class="num">${S.stage >= 5 ? T.rp(fee) : '-'}</td></tr></table></div>
      <div class="grid g2" style="margin-top:12px"><div class="card"><h3>Akses pembiayaan</h3><p class="legend">Riwayat kontrak dan kiriman di TANDUR menjadi data pendukung pengajuan modal kerja. TANDUR hanya merujuk, tidak meminjamkan uang.</p><div class="kbig">${T.rp(T.quotas(K).target * C.price * 0.3 * 4)}</div><span class="legend">perkiraan modal kerja yang bisa diajukan (30% nilai kontrak bulanan)</span><div class="actions"><button class="btn sm" data-act="loan">Ajukan lewat bank mitra</button></div></div>
      <div class="card"><h3>Langganan TANDUR</h3><p class="legend">Uji coba gratis 3 bulan. Setelah itu Rp350.000 per bulan. Petani dan SPPG memakai gratis.</p><div class="kbig">Bulan ke-1 dari 3</div><div class="bar2" style="margin-top:8px"><i style="width:33%"></i></div></div></div>`, 'uang');
  };
  T.notes.koperasi = {
    beranda: { t: 'Beranda Koperasi', what: 'Ringkasan anggota, permintaan, nilai kontrak, dan daftar langkah minggu ini yang ikut bergerak sesuai alur.', why: 'Banyak KDMP sudah berdiri tetapi belum punya pembeli tetap. Beranda ini menunjukkan apa yang sedang berjalan dan siapa yang perlu ditindaklanjuti.', look: ['Daftar langkah di bawah mencentang diri sendiri saat peran lain bertindak.', 'Peringatan tertinggal muncul setelah petani menerima kontrak.'], try: ['Buka Permintaan SPPG.'], link: 'Terhubung ke seluruh peran: SPPG, petani, dan Pemda.', tech: 'Ringkasan dari data transaksi bersama.' },
    permintaan: { t: 'Permintaan SPPG', what: 'Kebutuhan dapur MBG per komoditas, per minggu, yang dikirim dari menu SPPG.', why: 'Koperasi biasanya menebak berapa yang bisa dijual. Di sini angkanya datang dari dapur, sudah terjadwal.', try: ['Tekan Buat rencana kuota.'], link: 'Berasal dari Menu dan Kebutuhan milik SPPG.', tech: 'Data permintaan terjadwal. Bukan pesanan pembelian.' },
    kuota: { t: 'Kuota dan Kontrak', what: 'Koperasi menentukan cadangan, melihat pembagian kuota tiap anggota, mengecek harga, lalu mengirim kontrak tanam.', why: 'Petani menanam tanpa kepastian pembeli dan harga. Kontrak harga pasti sebelum tanam untuk sebagian lahan memberi kepastian, sisanya bebas dijual.', look: ['Geser cadangan, kuota tiap anggota ikut berubah.', 'Kartu Transparansi harga menunjukkan selisih koperasi secara terbuka (jawaban atas kritik koperasi menjadi tengkulak baru).'], try: ['Ganti komoditas dan cadangan.', 'Tekan Kirim Kontrak Tanam ke Petani.'], link: 'Kontrak muncul di aplikasi HP Pak Joko.', tech: 'Algoritma optimasi sederhana (proporsional lahan dan riwayat panen, dengan cadangan). Bukan AI.' },
    anggota: { t: 'Anggota', what: 'Status kontrak dan progres tanam tiap anggota.', why: 'Koperasi perlu tahu siapa yang tertinggal selagi masih ada waktu.', try: ['Selesaikan penerimaan kontrak lalu kirim pengingat.'], link: 'Progres yang sama dilihat SPPG sebagai peringatan dini.', tech: 'Kuota versus progres tanam. Tanpa AI.' },
    panen: { t: 'Panen dan Mutu', what: 'Daftar lot dengan grade, kesegaran, dan QR dari foto petani, siap dikirim ke SPPG.', why: 'Mutu dan asal bahan terdokumentasi, sehingga SPPG tidak perlu menilai ulang dan sengketa mutu berkurang.', try: ['Tekan Kirim ke SPPG.'], link: 'Foto dan grade berasal dari aplikasi Pak Joko. Kiriman tampil di SPPG.', tech: 'Penilaian grade dan kesegaran memakai AI (Gemini) dari foto HP. Bagian lain tidak memakai AI.' },
    uang: { t: 'Keuangan', what: 'Rincian kiriman, pembagian ke petani, selisih koperasi, biaya TANDUR, serta akses pembiayaan.', why: 'Koperasi sering kekurangan modal kerja. Riwayat kontrak yang tercatat membantu pengajuan ke bank mitra.', look: ['Biaya TANDUR hanya 1% dari nilai pasok.', 'Langganan gratis 3 bulan pertama.'], try: ['Tekan Ajukan lewat bank mitra.'], tech: 'Rujukan pembiayaan ke bank mitra (simulasi). TANDUR tidak memegang uang maupun meminjamkan.' }
  };
})();
