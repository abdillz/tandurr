/* Peran Pemda (Bu Rina): dasbor web */
(function () {
  const T = window.T, S = T.S;
  T.views.pemda = { nav: [{ k: 'ringkasan', t: 'Ringkasan', i: 'chart' }, { k: 'peta', t: 'Peta Desa', i: 'map' }, { k: 'rencana', t: 'Rencana Tanam', i: 'leaf' }, { k: 'dampak', t: 'Dampak', i: 'bank' }] };
  const smProg = () => [30, 36, 44, 60, 78, 88, 100][S.stage];
  const vil = () => [['Pakis Aji', 91, 14, 190, 70], ['Sumber Makmur', smProg(), 9, 220, 170], ['Banjarejo', 64, 11, 90, 235], ['Saptorenggo', 58, 8, 260, 230], ['Sukodadi', 52, 7, 85, 165], ['Ngebruk', 35, 6, 300, 90]];
  const col = p => p >= 70 ? 'var(--green2)' : p >= 55 ? 'var(--warn)' : 'var(--bad)';
  T.acts.vil = el => { S.vil = el.dataset.v; };
  T.acts.vilgo = () => T.toast('Daftar koperasi desa binaan dikirim ke Dinas Koperasi (simulasi)');

  T.views.pemda.render = key => {
    const V = vil(), web = (b, u) => T.web('pemda', key, b, 'pemda/' + u), weak = V.filter(v => v[1] < 55).length;
    if (key === 'ringkasan') {
      const tot = Object.keys(T.COMM).reduce((a, k) => a + T.need(k), 0);
      return web(`<h2>Pantauan Ketahanan Pangan</h2><div class="sub">Kabupaten Malang · desa binaan KDMP · pasokan MBG SPPG Pakis</div>
        <div class="grid g4" style="margin-bottom:12px"><div class="card kpi"><small>Kebutuhan MBG (5 komoditas)</small><b>${T.fmt(tot)} kg</b><span>per minggu, SPPG Pakis</span></div><div class="card kpi"><small>Desa terpantau</small><b>${V.length}</b><span>koperasi aktif</span></div><div class="card kpi"><small>Kontrak tanam berjalan</small><b>${S.stage >= 2 ? 1 : 0}</b><span>KDMP Sumber Makmur</span></div><div class="card kpi"><small>Perlu pembinaan</small><b style="color:var(--warn)">${weak}</b><span>progres di bawah 55%</span></div></div>
        <div class="card"><h3 style="margin-bottom:6px">Progres tanam sesuai kuota, per desa</h3>${V.map(v => `<div class="vil"><span>${v[0]}</span><div class="bar2 ${v[1] < 55 ? 'warn' : ''}"><i style="width:${v[1]}%"></i></div><b>${v[1]}%</b></div>`).join('')}</div><div class="legend">Progres hari ini, bukan laporan sebulan kemudian. Hanya Sumber Makmur yang bergerak mengikuti alur demo. Desa lain angka ilustrasi.</div>`, 'ringkasan');
    }
    if (key === 'peta') {
      const sel = V.find(v => v[0] === S.vil) || V[1];
      return web(`<h2>Peta desa binaan</h2><div class="sub">Skema lokasi, ukuran lingkaran menurut jumlah anggota, warna menurut progres</div>
        <div class="card"><svg viewBox="0 0 360 320" class="map"><path d="M20 60 C60 20 150 10 220 30 C300 40 345 90 335 160 C325 240 270 300 190 305 C110 310 40 270 25 200 C15 150 10 100 20 60z" fill="#EEF3D2" stroke="#CBD5A6" stroke-width="2"/><path d="M60 110 C120 90 170 150 230 130 S320 120 330 150" fill="none" stroke="#C5D7E6" stroke-width="6" stroke-linecap="round"/>
        ${V.map(v => `<g data-act="vil" data-v="${v[0]}" style="cursor:pointer"><circle cx="${v[3]}" cy="${v[4]}" r="${10 + v[2]}" fill="${col(v[1])}" opacity="${v[0] === sel[0] ? 1 : .78}" stroke="${v[0] === sel[0] ? '#2B1A14' : '#fff'}" stroke-width="3"/><text x="${v[3]}" y="${v[4] + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${v[1]}%</text><text x="${v[3]}" y="${v[4] + 28 + v[2] * 0.4}" text-anchor="middle" font-size="10.5" fill="#42281F">${v[0]}</text></g>`).join('')}</svg>
        <div class="maplg"><span><i style="background:var(--green2)"></i>70% ke atas</span><span><i style="background:var(--warn)"></i>55 sampai 69%</span><span><i style="background:var(--bad)"></i>di bawah 55%</span><em>Peta skematis, bukan peta sebenarnya</em></div></div>
        <div class="card" style="margin-top:12px"><div class="rowb"><div><h3>${sel[0]}</h3><div class="legend" style="margin:2px 0 0">${sel[2]} anggota · progres tanam ${sel[1]}%</div></div><span class="chip ${sel[1] >= 70 ? 'ok' : sel[1] >= 55 ? 'warn' : 'bad'}">${sel[1] >= 70 ? 'Sesuai jalur' : sel[1] >= 55 ? 'Perlu dipantau' : 'Perlu pembinaan'}</span></div>${sel[1] < 55 ? '<div class="actions"><button class="btn sm" data-act="vilgo">Teruskan ke Dinas Koperasi untuk dibina</button></div>' : ''}</div>`, 'peta');
    }
    if (key === 'rencana') {
      const rows = Object.keys(T.COMM).map(k => { const nd = T.need(k), tg = Math.round(nd * (100 + S.res) / 100), con = S.stage >= 2 && S.ck === k; const pr = con ? smProg() : 0; return `<tr><td>${T.COMM[k].n}</td><td class="num">${T.fmt(nd)} kg</td><td class="num">${tg} kg</td><td>${con ? '<span class="chip ok">Terkontrak</span>' : '<span class="chip">Belum</span>'}</td><td style="width:26%"><div class="bar2"><i style="width:${pr}%"></i></div></td><td class="num">${pr}%</td></tr>`; }).join('');
      return web(`<h2>Rencana tanam versus kebutuhan</h2><div class="sub">Apakah yang ditanam desa cukup untuk dapur MBG?</div><div class="card nopad"><table><tr><th>Komoditas</th><th class="num">Kebutuhan MBG/minggu</th><th class="num">Target tanam</th><th>Kontrak</th><th>Progres</th><th class="num"></th></tr>${rows}</table></div><div class="legend">Komoditas dikontrakkan bergantian. Demo ini menjalankan satu komoditas.</div>`, 'rencana');
    }
    const del = S.stage >= 5 ? T.delivered() : 0, val = del * T.sppgPrice(S.ck);
    return web(`<h2>Dampak minggu ini</h2><div class="sub">Dihitung dari transaksi di TANDUR, bukan estimasi luar</div><div class="grid g3" style="margin-bottom:12px"><div class="card kpi"><small>Hasil panen terserap MBG</small><b>${del} kg</b><span>${S.stage >= 5 ? T.COMM[S.ck].n.toLowerCase() + ' minggu ini' : 'menunggu kiriman'}</span></div><div class="card kpi"><small>Petani dengan harga pasti</small><b>${S.stage >= 3 ? 9 : 0}</b><span>harga dikunci sebelum tanam</span></div><div class="card kpi"><small>Nilai transaksi tercatat</small><b>${S.stage >= 6 ? T.rp(val) : '-'}</b><span>${S.stage >= 6 ? 'sudah dibayar' : 'belum dibayar'}</span></div></div>
      <div class="card"><h3 style="margin-bottom:6px">Mengapa Pemda perlu ini</h3><ul class="plain"><li>Melihat rencana tanam dan progres sebelum musim panen, bukan laporan bulanan.</li><li>Menentukan koperasi yang dibina lebih dulu memakai data, bukan perkiraan.</li><li>Memastikan program MBG menyerap hasil petani lokal, sejalan dengan Peraturan BGN 10/2026.</li></ul><div class="legend">Lisensi dasbor Pemda: Rp75 juta per tahun (model bisnis). Angka pada layar ilustrasi.</div></div>`, 'dampak');
  };
  T.notes.pemda = {
    ringkasan: { t: 'Ringkasan Pantauan', what: 'Dasbor untuk Dinas: kebutuhan MBG, jumlah desa terpantau, kontrak berjalan, dan progres tanam per desa.', why: 'Laporan progres biasanya datang sebulan kemudian. Dinas ingin melihat progres tanam sekarang untuk menentukan desa mana yang dibantu.', look: ['Progres Sumber Makmur bergerak mengikuti alur demo.', 'Kotak Perlu pembinaan menghitung desa di bawah 55%.'], try: ['Selesaikan alur peran lain lalu kembali ke sini.'], link: 'Progres berasal dari kuota Koperasi dan kemajuan petani.', tech: 'Agregasi data. Tanpa AI.' },
    peta: { t: 'Peta Desa', what: 'Gambaran skematis desa binaan dengan warna menurut progres tanam.', why: 'Peta membuat prioritas pembinaan terlihat sekilas.', look: ['Klik lingkaran desa untuk detailnya.'], try: ['Klik Ngebruk lalu tekan Teruskan ke Dinas Koperasi.'], tech: 'Visual skematis dari data progres. Bukan peta sebenarnya.' },
    rencana: { t: 'Rencana Tanam', what: 'Kebutuhan MBG per komoditas dibandingkan target tanam dan progresnya.', why: 'Menjawab pertanyaan kunci: apakah yang ditanam desa cukup untuk dapur?', try: ['Kembali setelah koperasi mengirim kontrak.'], tech: 'Perbandingan kebutuhan dan rencana. Aturan pasti.' },
    dampak: { t: 'Dampak', what: 'Ukuran dampak yang dihitung dari transaksi: panen terserap, petani berharga pasti, nilai transaksi tercatat.', why: 'Pemda membutuhkan bukti dampak program, bukan klaim.', try: ['Selesaikan alur sampai pembayaran lalu lihat angka terisi.'], link: 'Angka terisi saat SPPG menyetujui pembayaran.', tech: 'Agregasi transaksi. Angka ilustrasi.' }
  };
})();
