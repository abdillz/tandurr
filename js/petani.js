/* Peran Petani (Pak Joko): aplikasi HP + tampilan WhatsApp */
(function () {
  const T = window.T, S = T.S;
  T.views.petani = { nav: [{ k: 'beranda', t: 'Beranda', i: 'home' }, { k: 'kontrak', t: 'Kontrak', i: 'doc' }, { k: 'panen', t: 'Panen', i: 'camera' }, { k: 'saldo', t: 'Saldo', i: 'wallet' }] };

  T.acts.accept = () => { T.adv(2); T.adv(3); S.calc = true; T.toast('Kontrak diterima. Terima kasih Pak Joko'); };
  T.acts.ask = () => { T.toast('Pertanyaan diteruskan ke Bu Dewi (simulasi)'); return false; };
  T.acts.wa0 = () => { S.wa = false; };
  T.acts.wa1 = () => { S.wa = true; };
  T.acts.shoot = () => { S.phase = 'wait'; setTimeout(() => { S.phase = 'done'; T.render(true); }, 1300); };
  T.acts.mkqr = () => { S.qrDone = true; T.adv(3); T.adv(4); T.toast('QR lot ' + T.lotId(0) + ' dibuat'); };
  T.acts.again = () => { S.shot = (S.shot + 1) % T.SHOTS.length; S.phase = 'idle'; };
  T.acts.shootwa = () => { T.adv(3); S.phase = 'wait'; setTimeout(() => { S.phase = 'done'; S.qrDone = true; T.adv(4); T.render(true); }, 1300); };
  T.acts.adv = () => { S.adv = true; T.toast('Pencairan dipercepat diajukan ke bank mitra (simulasi)'); };

  const chili = '<svg class="ch" viewBox="0 0 300 150"><g fill="#C0392B" stroke="#8E2A20" stroke-width="2"><path d="M30 80c40-30 120-40 190-10 20 8 40 5 55-6-3 22-30 42-60 42-70 8-150 8-185-26z"/><path d="M45 105c50-18 110-22 170-4 22 6 42 2 56-8-6 20-32 36-60 36-60 6-130-4-166-24z" fill="#D14B3A"/></g><g fill="#3E4C21"><path d="M26 78c-8-8-8-20 2-26 6 6 10 14 8 24z"/><path d="M40 104c-9-6-12-18-4-26 6 4 12 12 12 22z"/></g></svg>';
  const head = (a, b) => `<div class="phead"><img src="assets/logo.png" alt=""><div class="hi">${a}<b>${b}</b></div></div>`;

  function photoBlock() {
    const sh = T.SHOTS[S.shot];
    if (S.qrDone && S.phase !== 'wait') return `<div class="card"><div class="grade"><div class="g ${sh.g === 'B' ? 'b' : ''}">${sh.g}</div><div style="flex:1"><b>Grade ${sh.g}</b><div class="legend" style="margin:0">Kesegaran ${sh.f}%</div><div class="bar2" style="margin-top:6px"><i style="width:${sh.f}%"></i></div></div></div>
      <div class="qrbox"><div class="q">${T.lotQR(0)}</div><div style="font-size:12px"><b>Lot ${T.lotId(0)}</b><br>QR siap ditempel di kemasan.<br><span class="chip ok">QR dibuat</span></div></div>
      ${S.stage >= 5 ? '<span class="chip ok" style="margin-top:8px">Sudah dikirim koperasi</span>' : '<div class="legend">Berikutnya: antar hasil panen ke koperasi.</div>'}</div>`;
    if (S.phase === 'idle') return `<div class="view">${chili}<div class="guide"></div><div class="gtxt">Letakkan cabai di dalam bingkai</div></div><button class="shutter" data-act="shoot" aria-label="Ambil foto"></button><p class="legend" style="text-align:center">Foto contoh. Hasil penilaian adalah simulasi.</p>`;
    if (S.phase === 'wait') return `<div class="view">${chili}<div class="guide"></div></div><div style="text-align:center;margin-top:16px"><div class="spin"></div><p style="font-size:13px;color:var(--green);margin-top:8px">AI menilai mutu panen...</p></div>`;
    return `<div class="card"><div class="grade"><div class="g ${sh.g === 'B' ? 'b' : ''}">${sh.g}</div><div style="flex:1"><b>Grade ${sh.g}</b><div class="legend" style="margin:0">Kesegaran ${sh.f}%</div><div class="bar2" style="margin-top:6px"><i style="width:${sh.f}%"></i></div></div></div>
      <div class="alert" style="margin-top:10px;font-size:12px"><div><b>Saran</b>${sh.tip}</div></div>
      <div class="actions" style="margin-top:10px"><button class="btn" style="flex:1" data-act="mkqr">Buat QR</button><button class="btn ghost" style="flex:1" data-act="again">Foto lain</button></div></div><div class="legend" style="text-align:center">AI hanya menilai grade dan kesegaran. Simulasi.</div>`;
  }

  function wa() {
    const C = T.COMM[S.ck], kg = T.quotas(S.ck).q[0], sh = T.SHOTS[S.shot];
    const m = [];
    if (S.stage < 2) m.push('<div class="m">Selamat pagi Pak Joko. Belum ada kontrak baru minggu ini. Kami kabari begitu koperasi mengirimnya.<small>07.00</small></div>');
    else {
      m.push(`<div class="m">Selamat pagi Pak Joko. Ada kontrak tanam baru dari KDMP Sumber Makmur.<br><br><b>${C.n} ${kg} kg per minggu</b><br>Tanam: minggu ini<br>Panen: sekitar minggu ke-12<br>Harga: <b>${T.rp(C.price)}/kg</b><br><br>Sisa hasil panen bebas Bapak jual ke mana saja.<small>07.12</small></div>`);
      if (S.stage < 3) m.push('<div class="qr"><button data-act="accept">1 Terima</button><button data-act="ask">2 Tanya koperasi</button></div>');
      else m.push('<div class="m me">1<small>07.15</small></div><div class="m">Terima kasih Pak. Kontrak diterima. Pengingat tanam dikirim besok pagi.<small>07.15</small></div>');
    }
    if (S.stage >= 3) {
      m.push('<div class="m">Saat panen, kirim foto hasilnya ke chat ini. AI menilai grade dan kesegaran, lalu kami buatkan QR untuk kemasan.<small>Minggu ke-12</small></div>');
      if (S.stage < 4 && S.phase !== 'wait') m.push('<div class="qr"><button data-act="shootwa">Kirim foto contoh</button></div>');
      if (S.phase === 'wait') m.push('<div class="m me">[foto cabai]<small>09.30</small></div><div class="m">Sedang menilai foto...</div>');
      if (S.stage >= 4) m.push(`<div class="m me">[foto cabai]<small>09.30</small></div><div class="m"><b>Grade ${sh.g}</b>, kesegaran ${sh.f}%.<br>Saran: ${sh.tip}<br>QR lot ${T.lotId(0)} sudah dibuat dan dikirim sebagai gambar.<small>09.31</small></div>`);
    }
    if (S.stage >= 5) m.push('<div class="m">Hasil panen Bapak sudah dikirim koperasi ke dapur SPPG Pakis.<small>13.05</small></div>');
    if (S.stage >= 6) m.push(`<div class="m">Pembayaran masuk: <b>${T.rp(kg * C.price)}</b> (${kg} kg × ${T.rp(C.price)}). Terima kasih Pak Joko.<small>15.40</small></div>`);
    return `<div class="phead"><img src="assets/logo.png" alt=""><div class="hi"><b>TANDUR</b>bot WhatsApp</div></div><div class="pbody"><div class="wa">${m.join('')}</div></div>`;
  }

  T.views.petani.render = key => {
    const C = T.COMM[S.ck], kg = T.quotas(S.ck).q[0];
    const tab = `<div class="seg"><button class="${!S.wa ? 'on' : ''}" data-act="wa0">Aplikasi</button><button class="${S.wa ? 'on' : ''}" data-act="wa1">WhatsApp</button></div>`;
    if (S.wa) return T.phone('petani', key, wa(), tab);
    let b;
    if (key === 'beranda') {
      const task = S.stage < 2 ? ['Belum ada kontrak baru', 'Koperasi akan mengirim kontrak setelah SPPG meminta.', ''] : S.stage < 3 ? ['Kontrak baru menunggu Bapak', C.n + ' ' + kg + ' kg per minggu, harga ' + T.rp(C.price) + '/kg.', '<button class="btn sm" data-nav="kontrak">Buka kontrak</button>'] : S.stage < 4 ? ['Tanam dan rawat ' + C.n.toLowerCase(), 'Setelah panen, foto hasilnya untuk dinilai.', '<button class="btn sm" data-nav="panen">Ke Panen</button>'] : S.stage < 5 ? ['Antar hasil panen ke koperasi', 'Lot ' + T.lotId(0) + ' sudah punya QR.', ''] : S.stage < 6 ? ['Menunggu pembayaran SPPG', 'Koperasi sudah mengirim hasil panen Bapak.', '<button class="btn sm" data-nav="saldo">Lihat saldo</button>'] : ['Pembayaran sudah masuk', T.rp(kg * C.price) + ' ke rekening Bapak.', '<button class="btn sm" data-nav="saldo">Lihat saldo</button>'];
      b = `${head('Selamat pagi,', 'Pak Joko')}<div class="pbody"><div class="weather">${T.ic('cloud', 26, '#fff')}<div><b>Hujan ringan 3 hari ke depan</b><small>Data cuaca BMKG (contoh). Tunda pemupukan sampai Jumat.</small></div></div>
        <div class="card" style="margin-top:10px"><small class="mut">Tugas minggu ini</small><h3 style="font-size:15px;margin:2px 0 4px">${task[0]}</h3><p class="legend" style="margin:0 0 8px">${task[1]}</p>${task[2]}</div>
        <div class="grid g2" style="margin-top:10px;gap:8px"><div class="card kpi sm"><small>Lahan</small><b>0,7 ha</b><span>KDMP Sumber Makmur</span></div><div class="card kpi sm"><small>Kuota aktif</small><b>${S.stage >= 2 ? kg + ' kg' : '-'}</b><span>${S.stage >= 2 ? C.n.toLowerCase() : 'belum ada'}</span></div></div>
        <div class="legend" style="text-align:center;margin-top:10px">Data ilustrasi.</div></div>`;
    } else if (key === 'kontrak') {
      if (S.stage < 2) b = `${head('Kontrak', 'Tanam')}<div class="pbody">${T.waiting('Belum ada kontrak baru. Koperasi mengirim kontrak setelah menerima permintaan SPPG.', 'Anggap kontrak sudah dikirim', 2)}</div>`;
      else b = `${head('Kontrak tanam', 'KDMP Sumber Makmur')}<div class="pbody"><div class="big"><small>Kontrak baru</small><h3>${C.n}</h3>
        <div class="row"><span>Kuota</span><b>${kg} kg per minggu</b></div><div class="row"><span>Tanam</span><b>Minggu ini</b></div><div class="row"><span>Panen</span><b>Sekitar minggu ke-12</b></div><div class="row"><span>Harga pasti</span><b>${T.rp(C.price)}/kg</b></div><div class="row"><span>Nilai per minggu</span><b>${T.rp(kg * C.price)}</b></div></div>
        <div class="alert" style="margin-top:10px;font-size:12px"><div><b>Sisa panen bebas dijual</b>Hanya kuota ini yang terikat kontrak. Sisanya boleh Bapak jual ke mana saja.</div></div>
        <div class="card" style="margin-top:10px;background:var(--card2)"><b style="font-size:12px">Transparansi harga</b><div class="legend" style="margin:2px 0 0">Koperasi menjual ke SPPG ${T.rp(T.sppgPrice(S.ck))}/kg. Selisih ${T.rp(T.sppgPrice(S.ck) - C.price)}/kg untuk sortir dan angkut.</div></div>
        ${S.stage >= 3 ? `<div class="card" style="margin-top:10px"><span class="chip ok">Kontrak diterima</span><ul class="tl"><li class="done"><i></i>Kontrak diterima hari ini</li><li class="${S.stage >= 4 ? 'done' : ''}"><i></i>Tanam dan rawat (pengingat cuaca BMKG)</li><li class="${S.stage >= 4 ? 'done' : ''}"><i></i>Panen, sekitar minggu ke-12</li><li class="${S.stage >= 5 ? 'done' : ''}"><i></i>Hasil dikirim koperasi</li><li class="${S.stage >= 6 ? 'done' : ''}"><i></i>Pembayaran diterima</li></ul>${S.stage < 4 ? '<button class="btn" style="width:100%;margin-top:6px" data-nav="panen">Lanjut: foto hasil panen</button>' : ''}</div>` : `<div class="actions" style="margin-top:12px"><button class="btn" style="flex:1" data-act="accept">Terima Kontrak</button><button class="btn ghost" style="flex:1" data-act="ask">Tanya</button></div>`}</div>`;
    } else if (key === 'panen') {
      if (S.stage < 3) b = `${head('Foto mutu', 'Panen')}<div class="pbody">${T.waiting('Terima kontrak dulu. Setelah panen, Bapak memotret hasilnya di sini.', 'Anggap kontrak sudah diterima', 3)}</div>`;
      else b = `${head('Foto mutu panen', C.n)}<div class="pbody">${photoBlock()}</div>`;
    } else {
      const val = kg * C.price;
      b = `${head('Saldo', 'Pak Joko')}<div class="pbody"><div class="big"><small>${S.stage >= 6 ? 'Pembayaran diterima' : 'Perkiraan pembayaran'}</small><h3>${S.stage >= 2 ? T.rp(val) : 'Rp0'}</h3><small>${kg} kg × ${T.rp(C.price)}${S.stage >= 2 ? '' : ' (belum ada kontrak)'}</small></div>
        <div class="card" style="margin-top:10px"><ul class="tl"><li class="${S.stage >= 5 ? 'done' : ''}"><i></i>Hasil panen dikirim koperasi</li><li class="${S.stage >= 6 ? 'done' : ''}"><i></i>SPPG menerima dan menyetujui</li><li class="${S.stage >= 6 ? 'done' : ''}"><i></i>Dana masuk ke rekening</li></ul></div>
        ${S.stage >= 5 && S.stage < 6 ? `<div class="card" style="margin-top:10px">${S.adv ? '<span class="chip ok">Pencairan dipercepat diajukan</span><p class="legend">Data kontrak dan kiriman TANDUR dipakai bank mitra sebagai bukti.</p>' : '<b style="font-size:13px">Butuh dana lebih cepat?</b><p class="legend">Ajukan pencairan dipercepat ke bank mitra memakai data kontrak.</p><button class="btn sm" data-act="adv">Ajukan lewat bank mitra</button>'}</div>` : ''}
        <div class="alert" style="margin-top:10px;font-size:12px"><div><b>Hasil di luar kontrak</b>Sisa panen yang tidak masuk kontrak bebas dijual ke pembeli lain. Itu tidak melalui TANDUR.</div></div></div>`;
    }
    return T.phone('petani', key, b, tab);
  };
  T.notes.petani = {
    beranda: { t: 'Beranda Petani (HP)', what: 'Layar sederhana untuk petani: tugas minggu ini, cuaca, lahan, dan kuota aktif. Petani yang tidak memasang aplikasi bisa memakai tampilan WhatsApp lewat tombol di atas HP.', why: 'Petani hortikultura biasanya tidak punya waktu untuk aplikasi rumit. Cukup satu tugas jelas per hari, plus jalur WhatsApp yang sudah mereka pakai.', look: ['Kartu Tugas berubah sesuai posisi alur.', 'Peringatan cuaca BMKG membantu menjadwal pupuk.'], try: ['Pindah ke tab WhatsApp.', 'Ikuti pemandu di atas bila kartu tugas masih kosong.'], link: 'Tugas muncul setelah Koperasi mengirim kontrak.', tech: 'Aplikasi mobile mode luring dan bot WhatsApp Business. Cuaca dari BMKG (contoh).' },
    kontrak: { t: 'Kontrak Tanam', what: 'Kuota, jadwal, dan harga pasti sebelum tanam. Hanya sebagian hasil panen yang terikat. Sisanya bebas dijual ke mana saja.', why: 'Petani menanam tanpa tahu pembelinya, lalu harga jatuh saat panen. Di sini harga dan pembeli sudah jelas sebelum bibit ditanam.', look: ['Kartu Sisa panen bebas dijual.', 'Kartu Transparansi harga menunjukkan selisih koperasi.'], try: ['Tekan Terima Kontrak.'], link: 'Persetujuan dilihat Koperasi (Anggota) dan SPPG (Pasokan).', tech: 'Kontrak digital sederhana. Pembagian kuota memakai algoritma optimasi, bukan AI.' },
    panen: { t: 'Foto Mutu Panen', what: 'Petani memotret hasil panen. AI menilai grade dan kesegaran, memberi saran, lalu membuat QR untuk kemasan.', why: 'Penilaian mutu manual sering memicu sengketa harga. Penilaian objektif dari foto membuat mutu dan asal bisa dibuktikan.', look: ['Hanya grade dan kesegaran, bukan ukuran.', 'Tekan Foto lain untuk melihat hasil berbeda.'], try: ['Tekan tombol rana.', 'Lalu Buat QR.'], link: 'Hasil dan QR tampil di Koperasi (Panen dan Mutu) dan SPPG (Penerimaan).', tech: 'AI (Gemini) hanya di langkah ini. Di prototipe hasilnya simulasi.' },
    saldo: { t: 'Saldo', what: 'Perkiraan dan status pembayaran, serta opsi pencairan dipercepat lewat bank mitra.', why: 'Petani sering menunggu pembayaran dan tidak tahu statusnya. Di sini tiap tahap terlihat.', try: ['Selesaikan alur sampai SPPG menyetujui, lalu lihat saldo berubah.'], link: 'Berubah saat SPPG menyetujui pembayaran.', tech: 'Pembayaran lewat bank mitra (simulasi). TANDUR tidak memegang uang.' }
  };
})();
