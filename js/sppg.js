/* Peran SPPG (Pak Bayu): dasbor web */
(function () {
  const T = window.T, S = T.S;
  const MENU = [
    ['Senin', ['Nasi', 'Ayam suwir cabai merah', 'Tumis sawi', 'Jeruk']],
    ['Selasa', ['Nasi', 'Telur balado', 'Sup wortel tomat', 'Pisang']],
    ['Rabu', ['Nasi', 'Ikan goreng', 'Sawi bawang merah', 'Melon']],
    ['Kamis', ['Nasi', 'Tempe orek', 'Sayur bening wortel', 'Semangka']],
    ['Jumat', ['Nasi', 'Semur ayam wortel', 'Lalapan tomat', 'Pepaya']]
  ];
  T.views.sppg = { nav: [{ k: 'menu', t: 'Menu dan Kebutuhan', i: 'utensils' }, { k: 'pasokan', t: 'Pasokan Minggu Ini', i: 'truck' }, { k: 'terima', t: 'Penerimaan dan Bayar', i: 'wallet' }, { k: 'lokal', t: 'Sumber Lokal', i: 'chart' }] };

  T.acts.calc = () => { S.porsi = Math.max(100, +T.$('#porsi').value || 3000); S.hari = Math.min(7, Math.max(1, +T.$('#hari').value || 5)); S.calc = true; };
  T.acts.sendreq = () => { T.adv(1); T.toast('Permintaan terkirim ke KDMP Sumber Makmur'); };
  T.acts.backup = () => T.toast('Marketplace MBG: ' + T.fmt(Math.max(0, T.need(S.ck) - T.delivered())) + ' kg ' + T.COMM[S.ck].n.toLowerCase() + ' tersedia dari pemasok terdekat (simulasi)');
  T.acts.lot = el => { const i = +el.dataset.i, m = T.MEMBERS[i], g = T.gradeOf(i), q = T.quotas(S.ck).q[i], st = T.lotStatus(i); T.modalHTML(`<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h3>Asal-usul lot ${T.lotId(i)}</h3><button class="btn ghost sm" data-act="close">Tutup</button></div>
    <div style="display:flex;gap:14px;margin-top:12px;align-items:center"><div class="qr">${g ? T.lotQR(i) : '<div class="noqr">QR dibuat saat panen dinilai</div>'}</div>
    <dl class="kv"><dt>Petani</dt><dd>${m.n}</dd><dt>Koperasi</dt><dd>KDMP Sumber Makmur</dd><dt>Komoditas</dt><dd>${T.COMM[S.ck].n}</dd><dt>Jumlah</dt><dd>${q} kg</dd><dt>Mutu</dt><dd>${g ? 'Grade ' + g[0] + ', kesegaran ' + g[1] + '%' : 'Belum dinilai'}</dd><dt>Status</dt><dd>${st[0]}</dd></dl></div>
    <p class="legend">Data ilustrasi. QR dapat dipindai dengan kamera HP dan berisi asal serta mutu lot.</p></div>`); return false; };
  T.acts.receive = () => { T.adv(6); T.toast('Barang diterima. Pembayaran diteruskan ke koperasi dan petani'); };

  T.views.sppg.render = key => {
    const K = S.ck, C = T.COMM[K];
    if (key === 'menu') {
      const rows = Object.keys(T.COMM).map(k => `<tr><td>${T.COMM[k].n}</td><td class="num">${T.COMM[k].g} g</td><td class="num"><b>${T.fmt(T.need(k))} kg</b></td></tr>`).join('');
      const total = Object.keys(T.COMM).reduce((a, k) => a + T.need(k), 0);
      return T.web('sppg', key, `<h2>Menu mingguan dan kebutuhan bahan</h2><div class="sub">SPPG Pakis · minggu depan · pemasok lokal: KDMP Sumber Makmur (6 km)</div>
        <div class="grid g3" style="margin-bottom:12px"><div><label>Porsi per hari</label><input type="number" id="porsi" value="${S.porsi}" min="100" step="100"></div><div><label>Hari operasional</label><input type="number" id="hari" value="${S.hari}" min="1" max="7"></div><div style="display:flex;align-items:end"><button class="btn" data-act="calc" style="width:100%">Hitung Kebutuhan</button></div></div>
        <div class="card nopad" style="margin-bottom:12px"><table><tr><th style="width:80px">Hari</th><th>Menu</th></tr>${MENU.map(d => `<tr><td><b>${d[0]}</b></td><td>${d[1].map(c => `<span class="chip">${c}</span>`).join('')}</td></tr>`).join('')}</table></div>
        ${S.calc ? `<div class="card"><div class="rowb"><h3>Kebutuhan bahan per minggu</h3><span class="chip ok">${S.porsi.toLocaleString('id-ID')} porsi × ${S.hari} hari</span></div><table><tr><th>Bahan</th><th class="num">Gramasi per porsi</th><th class="num">Kebutuhan</th></tr>${rows}<tr><td><b>Total 5 bahan</b></td><td></td><td class="num"><b>${T.fmt(total)} kg</b></td></tr></table>
          <div class="actions">${S.stage >= 1 ? '<span class="chip ok">Permintaan sudah terkirim ke KDMP Sumber Makmur</span><button class="btn ghost" data-nav="pasokan">Lihat pasokan</button>' : '<button class="btn brown" data-act="sendreq">Kirim Permintaan ke Koperasi</button><span class="legend" style="margin:0">Dikirim sebagai permintaan jadwal, bukan pesanan beli.</span>'}</div></div>`
        : '<div class="card" style="text-align:center;color:var(--mute)">Tekan <b>Hitung Kebutuhan</b> untuk mengubah menu menjadi kilogram per bahan.</div>'}`, 'sppg/menu');
    }
    if (key === 'pasokan') {
      const { q, target } = T.quotas(K), risk = T.risk(), need = T.need(K);
      let body;
      if (S.stage < 1) body = T.waiting('Belum ada permintaan terkirim. Kirim dulu dari menu Menu dan Kebutuhan.', 'Anggap permintaan sudah terkirim', 1);
      else if (S.stage < 3) body = `<div class="card"><span class="chip warn">${S.stage < 2 ? 'Menunggu koperasi membagi kuota' : 'Kontrak sudah dikirim ke petani, menunggu persetujuan'}</span><p class="legend">Begitu petani menerima kontrak, jadwal tanam dan pantauan pasokan muncul di sini.</p><button class="btn ghost" data-act="skip" data-n="3">Percepat sampai petani menerima</button></div>`;
      else {
        const short = Math.max(0, need - T.delivered());
        body = `<div class="grid g3" style="margin-bottom:12px"><div class="card kpi"><small>Kebutuhan ${C.n.toLowerCase()}</small><b>${T.fmt(need)} kg</b><span>per minggu</span></div><div class="card kpi"><small>Target tanam (cadangan ${S.res}%)</small><b>${target} kg</b><span>dibagi ke 9 anggota</span></div><div class="card kpi"><small>Sesuai jadwal</small><b>${target - risk} kg</b><span>${Math.round((target - risk) / target * 100)}% dari target</span></div></div>
        ${S.stage < 6 ? `<div class="alert">${T.ic('alert', 20, '#C98B1F')}<div><b>Peringatan dini pasokan</b>${T.MEMBERS.filter(m => m.late).map(m => `${m.n} tertinggal ${m.late} hari`).join(', ')}. Kuota ${risk} kg berisiko. Yang masuk jalur ${target - risk} kg, kebutuhan dapur ${T.fmt(need)} kg, kemungkinan kurang ${T.fmt(short)} kg. Kamu tahu ini sekarang, bukan saat dapur sudah kosong.<div class="actions" style="margin-top:8px"><button class="btn sm" data-act="backup">Cari pemasok cadangan</button></div></div></div>` : ''}
        <div class="card nopad" style="margin-top:12px"><table><tr><th>Lot</th><th>Petani</th><th class="num">Kuota</th><th>Mutu</th><th>Status</th></tr>${T.MEMBERS.map((m, i) => { const g = T.gradeOf(i), st = T.lotStatus(i); return `<tr class="click" data-act="lot" data-i="${i}"><td><b>${T.lotId(i)}</b></td><td>${m.n}</td><td class="num">${q[i]} kg</td><td>${g ? 'Grade ' + g[0] + ' · ' + g[1] + '%' : '<span style="color:var(--mute)">belum</span>'}</td><td><span class="chip ${st[1]}">${st[0]}</span></td></tr>`; }).join('')}</table></div><div class="legend">Klik baris untuk melihat asal-usul lot dan QR.</div>`;
      }
      return T.web('sppg', key, `<h2>Pasokan ${C.n.toLowerCase()} minggu ini</h2><div class="sub">Dapur SPPG Pakis · KDMP Sumber Makmur</div>${body}`, 'sppg/pasokan');
    }
    if (key === 'terima') {
      let body;
      const need = T.need(K), del = T.delivered(), sp = T.sppgPrice(K);
      if (S.stage < 5) body = T.waiting('Belum ada kiriman dari koperasi. Panen perlu dinilai dan dikirim dulu.', 'Anggap koperasi sudah mengirim', 5);
      else {
        const rows = T.MEMBERS.map((m, i) => ({ m, i, g: T.gradeOf(i) })).filter(x => !x.m.late);
        body = `<div class="grid g3" style="margin-bottom:12px"><div class="card kpi"><small>Dipesan</small><b>${T.fmt(need)} kg</b><span>${C.n.toLowerCase()}</span></div><div class="card kpi"><small>Diterima</small><b>${del} kg</b><span>dari ${rows.length} petani</span></div><div class="card kpi"><small>Selisih</small><b style="color:${del < need ? 'var(--warn)' : 'var(--ok)'}">${del >= need ? '0' : '-' + T.fmt(need - del)} kg</b><span>${del < need ? 'ditutup cadangan Marketplace MBG' : 'terpenuhi'}</span></div></div>
        <div class="card nopad"><table><tr><th>Lot</th><th>Petani</th><th class="num">Jumlah</th><th>Mutu (hasil foto)</th><th>Pemindaian QR</th></tr>${rows.map(x => `<tr><td><b>${T.lotId(x.i)}</b></td><td>${x.m.n}</td><td class="num">${T.quotas(K).q[x.i]} kg</td><td>Grade ${x.g[0]} · ${x.g[1]}%</td><td><span class="chip ok">Sesuai</span></td></tr>`).join('')}</table></div>
        <div class="card" style="margin-top:12px">${S.stage >= 6 ? `<div class="rowb"><div><h3>Pembayaran disetujui</h3><p class="legend" style="margin:4px 0 0">${del} kg × ${T.rp(sp)} = <b>${T.rp(del * sp)}</b> diteruskan lewat bank mitra ke rekening koperasi, lalu petani.</p></div><span class="chip ok">Selesai</span></div>`
          : `<div class="rowb"><div><b>Nilai penerimaan</b><div class="kbig">${T.rp(del * sp)}</div><span class="legend">${del} kg × ${T.rp(sp)} per kg (harga disepakati di awal)</span></div><button class="btn" data-act="receive">Terima Barang dan Setujui Pembayaran</button></div>`}</div>`;
      }
      return T.web('sppg', key, `<h2>Penerimaan dan pembayaran</h2><div class="sub">Cek jumlah, mutu, dan asal sebelum membayar</div>${body}`, 'sppg/penerimaan');
    }
    const loc = [['Cabai merah', S.stage >= 2 && S.ck === 'cabai' ? 100 : 60], ['Sawi hijau', 82], ['Tomat', 55], ['Bawang merah', 38], ['Wortel', 70]];
    return T.web('sppg', key, `<h2>Pemenuhan sumber lokal</h2><div class="sub">Peraturan BGN 10/2026 mengarahkan SPPG melibatkan usaha lokal</div>
      <div class="grid g3" style="margin-bottom:12px"><div class="card kpi"><small>Bahan dari pemasok lokal</small><b>${Math.round(loc.reduce((a, b) => a + b[1], 0) / loc.length)}%</b><span>rata-rata 5 bahan (ilustrasi)</span></div><div class="card kpi"><small>Pemasok koperasi desa</small><b>1</b><span>KDMP Sumber Makmur</span></div><div class="card kpi"><small>Lot dengan QR</small><b>${S.stage >= 4 ? (S.stage >= 5 ? 7 : 1) : 0}</b><span>bisa ditelusuri asalnya</span></div></div>
      <div class="card"><h3 style="margin-bottom:8px">Porsi bahan dari desa sekitar</h3>${loc.map(l => `<div class="vil"><span>${l[0]}</span><div class="bar2"><i style="width:${l[1]}%"></i></div><b>${l[1]}%</b></div>`).join('')}</div><div class="legend">Angka ilustrasi. Cabai merah naik menjadi 100% lokal setelah kontrak tanam berjalan.</div>`, 'sppg/lokal');
  };
  T.notes.sppg = {
    menu: { t: 'Menu dan Kebutuhan', what: 'Ahli gizi memasukkan jumlah porsi dan menu mingguan. TANDUR menerjemahkannya menjadi kilogram per bahan memakai gramasi per porsi, lalu mengirimnya ke koperasi sebagai permintaan terjadwal.', why: 'Hari ini koperasi dan petani menebak apa yang dibutuhkan dapur. Dengan angka kebutuhan yang pasti dan terjadwal, petani bisa menanam untuk pembeli yang sudah ada.', look: ['Kebutuhan berubah langsung bila porsi diubah.', 'Yang dikirim adalah permintaan jadwal, bukan pesanan pembelian.'], try: ['Ubah porsi lalu tekan Hitung Kebutuhan.', 'Tekan Kirim Permintaan ke Koperasi.'], link: 'Permintaan ini muncul di dasbor Koperasi (Permintaan SPPG).', tech: 'Aturan pasti (gramasi per porsi). Bukan AI, sehingga hasilnya bisa dijelaskan dan diaudit.' },
    pasokan: { t: 'Pasokan Minggu Ini', what: 'Pantauan pasokan per lot dari koperasi: berapa kg yang sesuai jadwal, siapa yang tertinggal, dan mutu tiap lot.', why: 'Masalah SPPG menurut Kepala BGN berkaitan dengan kontinuitas pasokan. Peringatan dini memberi waktu mencari cadangan, bukan kejutan saat dapur sudah kosong.', look: ['Banner kuning muncul setelah petani menerima kontrak.', 'Klik lot untuk melihat asal dan QR.'], try: ['Tekan Cari pemasok cadangan.', 'Klik satu baris lot.'], link: 'Data berasal dari kuota Koperasi dan progres petani. Cadangan terhubung ke Marketplace MBG lewat API.', tech: 'Peringatan dini dihitung dari kuota versus progres tanam (tanpa AI). Integrasi Marketplace MBG lewat API.' },
    terima: { t: 'Penerimaan dan Bayar', what: 'Saat kiriman tiba, SPPG mencocokkan jumlah, mutu hasil foto, dan QR, lalu menyetujui pembayaran.', why: 'Mutu dan asal bahan bisa dibuktikan, dan petani dibayar sesuai harga yang sudah disepakati sebelum tanam.', look: ['Selisih jumlah ditampilkan apa adanya.', 'Harga per kg sama dengan yang disepakati di awal.'], try: ['Tekan Terima Barang dan Setujui Pembayaran.'], link: 'Setelah disetujui, saldo petani di aplikasi HP berubah dan koperasi melihat rincian di Keuangan.', tech: 'Pembayaran diteruskan bank mitra (simulasi). TANDUR tidak memegang uang maupun barang.' },
    lokal: { t: 'Sumber Lokal', what: 'Ringkasan seberapa besar bahan berasal dari pemasok lokal dan seberapa banyak lot yang bisa ditelusuri.', why: 'Peraturan BGN 10/2026 mengarahkan SPPG melibatkan usaha lokal. Dasbor ini membantu SPPG membuktikannya.', try: ['Selesaikan alur lalu lihat angka berubah.'], tech: 'Agregasi data pasokan. Angka ilustrasi.' }
  };
})();
