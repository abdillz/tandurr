/* TANDUR prototipe v2 - inti: data bersama, kerangka, splash, pemilih peran, pemandu alur, panel penjelasan */
(function () {
  'use strict';
  const T = window.T = { views: {}, acts: {}, notes: {} };

  /* ---------- data contoh (ilustrasi) ---------- */
  T.COMM = {
    cabai: { n: 'Cabai merah', g: 6, price: 32000 },
    sawi: { n: 'Sawi hijau', g: 20, price: 9000 },
    tomat: { n: 'Tomat', g: 12, price: 11000 },
    bawang: { n: 'Bawang merah', g: 9, price: 30000 },
    wortel: { n: 'Wortel', g: 10, price: 10000 }
  };
  T.MEMBERS = [
    { n: 'Pak Joko', ha: 0.7, h: 'Panen stabil 8 musim', w: 36 },
    { n: 'Pak Anton', ha: 0.5, h: 'Panen stabil 6 musim', w: 28 },
    { n: 'Bu Sari', ha: 0.3, h: 'Panen 4 musim', w: 14, late: 3 },
    { n: 'Pak Slamet', ha: 0.2, h: 'Panen 3 musim', w: 5 },
    { n: 'Bu Wati', ha: 0.2, h: 'Panen 3 musim', w: 5 },
    { n: 'Pak Heri', ha: 0.15, h: 'Baru 1 musim', w: 4, late: 5 },
    { n: 'Bu Lastri', ha: 0.15, h: 'Panen 2 musim', w: 4 },
    { n: 'Pak Yusuf', ha: 0.15, h: 'Panen 2 musim', w: 4 },
    { n: 'Pak Rudi', ha: 0.15, h: 'Baru 1 musim', w: 4 }
  ];
  T.SHOTS = [
    { g: 'A', f: 92, tip: 'Pisahkan 3 butir yang kulitnya mulai keriput.' },
    { g: 'B', f: 78, tip: 'Sortir butir yang lembek. Sisanya tetap layak dikirim.' },
    { g: 'A', f: 88, tip: 'Kemas dalam wadah berlubang dan kirim maksimal 24 jam.' }
  ];
  T.OTHER_GRADE = [null, ['A', 90], null, ['A', 88], ['B', 81], null, ['A', 89], ['A', 87], ['B', 80]];
  T.ROLES = {
    petani: { name: 'Pak Joko', title: 'Petani anggota KDMP', dev: 'HP', icon: 'leaf', blurb: 'Menerima kuota dan harga pasti sebelum tanam, memotret panen, melihat saldo.' },
    koperasi: { name: 'Bu Dewi', title: 'Manajer KDMP Sumber Makmur', dev: 'Dasbor web', icon: 'store', blurb: 'Membagi kuota tanam ke anggota, mengirim kontrak, mengirim panen ke dapur.' },
    sppg: { name: 'Pak Bayu', title: 'Kepala SPPG Pakis', dev: 'Dasbor web', icon: 'utensils', blurb: 'Mengubah menu menjadi kebutuhan, memantau pasokan, menerima dan membayar.' },
    pemda: { name: 'Bu Rina', title: 'Kabid Ketahanan Pangan, Pemkab Malang', dev: 'Dasbor web', icon: 'building', blurb: 'Memantau progres tanam per desa dan memilih koperasi yang perlu dibina.' }
  };
  T.FLOW = [
    { r: 'sppg', k: 'menu', t: 'SPPG kirim permintaan' },
    { r: 'koperasi', k: 'kuota', t: 'Koperasi bagi kuota' },
    { r: 'petani', k: 'kontrak', t: 'Petani terima kontrak' },
    { r: 'petani', k: 'panen', t: 'Foto mutu dan QR' },
    { r: 'koperasi', k: 'panen', t: 'Koperasi kirim ke SPPG' },
    { r: 'sppg', k: 'terima', t: 'SPPG terima dan bayar' }
  ];

  /* ---------- state ---------- */
  const S = T.S = { screen: 'splash', role: null, nav: { petani: 'beranda', koperasi: 'beranda', sppg: 'menu', pemda: 'ringkasan' }, stage: 0, porsi: 3000, hari: 5, calc: false, ck: 'cabai', sel: 'cabai', res: 15, wa: false, shot: 0, phase: 'idle', qrDone: false, adv: false, vil: 'Sumber Makmur', modal: null };
  T.initial = JSON.stringify(S);
  T.adv = n => { if (S.stage < n) S.stage = n; };

  /* ---------- helper ---------- */
  const $ = T.$ = s => document.querySelector(s);
  T.rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
  T.fmt = n => (Math.round(n * 10) / 10).toLocaleString('id-ID');
  T.need = k => S.porsi * S.hari * T.COMM[k].g / 1000;
  T.quotas = k => {
    const target = Math.round(T.need(k) * (100 + S.res) / 100 + 1e-9), W = T.MEMBERS.reduce((a, m) => a + m.w, 0);
    const raw = T.MEMBERS.map(m => m.w / W * target), fl = raw.map(Math.floor);
    let left = target - fl.reduce((a, b) => a + b, 0);
    raw.map((r, i) => [r - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { fl[i]++; left--; } });
    return { target, q: fl };
  };
  T.sppgPrice = k => { const p = T.COMM[k].price; return p + Math.max(500, Math.round(p * 0.06 / 500) * 500); };
  T.delivered = () => { const { q } = T.quotas(S.ck); return T.MEMBERS.reduce((a, m, i) => a + (m.late ? 0 : q[i]), 0); };
  T.risk = () => { const { q } = T.quotas(S.ck); return T.MEMBERS.reduce((a, m, i) => a + (m.late ? q[i] : 0), 0); };
  T.gradeOf = i => i === 0 ? (S.stage >= 4 ? [T.SHOTS[S.shot].g, T.SHOTS[S.shot].f] : null) : (S.stage >= 5 ? T.OTHER_GRADE[i] : null);
  T.lotStatus = i => {
    const m = T.MEMBERS[i];
    if (S.stage >= 6 && !m.late) return ['Diterima', 'ok'];
    if (S.stage >= 5 && !m.late) return ['Dikirim', 'ok'];
    if (m.late && S.stage >= 3) return ['Tertinggal ' + m.late + ' hari', 'warn'];
    if (i === 0 && S.stage >= 4) return ['Siap kirim', 'ok'];
    if (S.stage >= 3) return ['Tumbuh', ''];
    return ['Belum mulai', ''];
  };
  T.qr = (text, o) => TandurQR.svg(text, o);
  T.lotQR = i => { const g = T.gradeOf(i); return T.qr('TANDUR|LOT:CBR-' + String(14 - i).padStart(3, '0') + '|' + T.MEMBERS[i].n + '|KDMP Sumber Makmur|' + T.COMM[S.ck].n + ' ' + T.quotas(S.ck).q[i] + ' kg|' + (g ? 'Grade ' + g[0] + ' Kesegaran ' + g[1] + '%' : 'Belum dinilai') + '|Data ilustrasi'); };
  T.lotId = i => 'CBR-' + String(14 - i).padStart(3, '0');
  T.toast = t => { const e = $('#toast'); e.textContent = t; e.classList.add('show'); clearTimeout(T.toast.t); T.toast.t = setTimeout(() => e.classList.remove('show'), 2600); };

  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/>',
    camera: '<path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2.2.6 3.5 2.6 3.5 5.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    truck: '<path d="M2 6h11v10H2zM13 9h5l3 3v4h-8z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
    leaf: '<path d="M5 19C5 10 10 4 20 4c0 10-6 15-15 15z"/><path d="M5 19 13 11"/>',
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
    utensils: '<path d="M6 3v8a2 2 0 0 0 2 2v8M10 3v8M6 7h4M18 3c-2 2-3 5-3 8h3v10"/>',
    building: '<path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-5h6v5M9 11h.01M15 11h.01"/>',
    qr: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/>',
    bank: '<path d="M3 10 12 4l9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  T.ic = (n, s, c) => `<svg width="${s || 18}" height="${s || 18}" viewBox="0 0 24 24" fill="none" stroke="${c || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${(P[n] || '')}</svg>`;
  T.avatar = (name, bg) => `<span class="av" style="background:${bg || 'var(--green)'}">${name.replace(/^(Pak|Bu) /, '').slice(0, 1)}</span>`;
  T.waiting = (msg, label, n) => `<div class="card wait"><div class="spinring"></div><p>${msg}</p><button class="btn ghost" data-act="skip" data-n="${n}">${label}</button><small>Mode demo: melompati langkah yang seharusnya dikerjakan peran lain.</small></div>`;
  T.acts.skip = el => { T.adv(+el.dataset.n); if (+el.dataset.n >= 1) S.calc = true; if (+el.dataset.n >= 4) { S.qrDone = true; S.phase = 'done'; } T.toast('Langkah sebelumnya dianggap selesai (mode demo)'); };

  /* ---------- kerangka tampilan ---------- */
  T.web = (role, key, body, url) => {
    const v = T.views[role], r = T.ROLES[role];
    return `<div class="browser"><div class="bar"><span></span><span></span><span></span><em>tandur.app/${url}</em></div><div class="app"><div class="side"><img src="assets/logo.png" alt="TANDUR">${v.nav.map(n => `<a data-nav="${n.k}" class="${n.k === key ? 'on' : ''}">${T.ic(n.i, 15)}<span>${n.t}</span></a>`).join('')}<div class="whoami">${T.avatar(r.name, 'var(--green3)')}<div><b>${r.name}</b><small>${r.title}</small></div></div></div><div class="main">${body}</div></div></div>`;
  };
  T.phone = (role, key, body, extra) => {
    const v = T.views[role];
    return `<div class="phonewrap">${extra || ''}<div class="phone"><div class="screen"><div class="sbar"><span>9:41</span><span>●●● 100%</span></div>${body}<div class="pnav">${v.nav.map(n => `<a data-nav="${n.k}" class="${n.k === key ? 'on' : ''}">${T.ic(n.i, 20)}<span>${n.t}</span></a>`).join('')}</div></div></div></div>`;
  };

  /* ---------- splash dan pemilih peran ---------- */
  function splash() {
    return `<div class="splash"><div class="splash-in">
      <img class="slogo" src="assets/logo.png" alt="TANDUR">
      <h1>Tanam yang Dimasak,<br>Panen yang Terserap</h1>
      <p>Platform perencanaan produksi berbasis permintaan untuk Koperasi Desa Merah Putih. Dari menu dapur MBG sampai rencana tanam di desa.</p>
      <div class="load"><i></i></div>
      <button class="btn big-btn" data-act="start" id="startBtn">Mulai Demo ${T.ic('arrow', 18)}</button>
      <small>Prototipe Lomba BMC AGFESPORA 2026 · Tim Pangpang · Universitas Brawijaya<br>Seluruh data pada prototipe ini adalah data ilustrasi.</small>
    </div></div>`;
  }
  function picker() {
    return `<div class="wrap pick"><header class="top"><img src="assets/logo.png" alt="TANDUR"><div class="sp"></div><span class="pill warn">Data ilustrasi, bukan data sebenarnya</span></header>
      <h2 class="ph">Lihat TANDUR sebagai siapa?</h2>
      <p class="pp">Satu alur, empat pelaku. Pilih salah satu. Tampilan menyesuaikan perangkat yang dipakai peran itu: HP untuk petani, dasbor web untuk yang lain. Perubahan di satu peran terlihat di peran lain.</p>
      <div class="cards4">${Object.keys(T.ROLES).map(k => { const r = T.ROLES[k]; return `<button class="rcard" data-act="pick" data-r="${k}"><span class="rico">${T.ic(r.icon, 30)}</span><b>${r.name}</b><em>${r.title}</em><span>${r.blurb}</span><span class="devtag">${r.dev === 'HP' ? 'Tampil di HP' : 'Tampil di dasbor web'}</span></button>`; }).join('')}</div>
      <div class="tour"><button class="btn brown" data-act="tour">Mulai tur urut alur dari dapur MBG ${T.ic('arrow', 16)}</button><span>Disarankan untuk pertama kali: 6 langkah, berpindah peran otomatis.</span></div>
      <div class="foot">Kamu bisa berganti peran kapan saja lewat tombol Ganti peran.</div></div>`;
  }
  T.acts.start = () => { S.screen = 'pick'; };
  T.acts.pick = el => { S.role = el.dataset.r; S.screen = 'role'; };
  T.acts.tour = () => { S.role = 'sppg'; S.nav.sppg = 'menu'; S.screen = 'role'; };
  T.acts.swap = () => { S.screen = 'pick'; };
  T.acts.reset = () => { Object.assign(S, JSON.parse(T.initial), { screen: 'pick' }); T.toast('Demo diulang dari awal'); };
  T.acts.go = el => { S.role = el.dataset.r; S.nav[S.role] = el.dataset.k; S.screen = 'role'; };

  /* ---------- pemandu alur ---------- */
  function guide() {
    const cur = T.FLOW.findIndex((f, i) => S.stage < i + 1);
    const nextF = cur >= 0 ? T.FLOW[cur] : null;
    return `<div class="flow"><div class="fl-steps">${T.FLOW.map((f, i) => {
      const done = S.stage >= i + 1, on = i === cur;
      return `<button class="fs ${done ? 'done' : ''} ${on ? 'on' : ''}" data-act="go" data-r="${f.r}" data-k="${f.k}" title="Buka sebagai ${T.ROLES[f.r].name}"><i>${done ? T.ic('check', 13) : i + 1}</i><b>${f.t}</b><small>${T.ROLES[f.r].name}</small></button>`;
    }).join('')}</div>${nextF ? `<div class="fl-next"><span>Langkah berikutnya: <b>${T.ROLES[nextF.r].name}</b>: ${nextF.t}.</span>${S.role === nextF.r ? '<em>Kamu sudah di peran ini. Ikuti penjelasan di kanan.</em>' : `<button class="btn" data-act="go" data-r="${nextF.r}" data-k="${nextF.k}">Pindah ke ${T.ROLES[nextF.r].name} ${T.ic('arrow', 15)}</button>`}</div>` : `<div class="fl-next ok"><span><b>Alur selesai.</b> Panen terserap, petani dibayar sesuai harga yang disepakati sebelum tanam.</span><button class="btn" data-act="go" data-r="pemda" data-k="ringkasan">Lihat dampak di dasbor Pemda ${T.ic('arrow', 15)}</button></div>`}</div>`;
  }

  /* ---------- panel penjelasan ---------- */
  function notePanel(role, key) {
    const n = (T.notes[role] || {})[key]; if (!n) return '';
    const li = a => a.map(x => `<li>${x}</li>`).join('');
    return `<aside class="note"><span class="pill role">${T.ic(T.ROLES[role].icon, 14)} ${T.ROLES[role].name} · ${T.ROLES[role].title}</span>
      <h3>${n.t}</h3><p>${n.what}</p>
      <h4>Masalah yang diselesaikan</h4><p>${n.why}</p>
      ${n.look ? `<h4>Perhatikan</h4><ul>${li(n.look)}</ul>` : ''}
      <h4>Coba ini</h4><ul>${li(n.try)}</ul>
      ${n.link ? `<h4>Terhubung ke peran lain</h4><p>${n.link}</p>` : ''}
      <div class="tech"><b>Teknologi:</b> ${n.tech}</div></aside>`;
  }

  /* ---------- render ---------- */
  function render(keep) {
    const app = $('#app');
    const sc = { pb: ($('.pbody') || {}).scrollTop || 0, mn: ($('.main') || {}).scrollTop || 0 };
    if (S.screen === 'splash') { app.innerHTML = splash(); document.body.className = 'is-splash'; return; }
    document.body.className = '';
    if (S.screen === 'pick') { app.innerHTML = picker(); window.scrollTo(0, 0); return; }
    const role = S.role, key = S.nav[role], r = T.ROLES[role];
    app.innerHTML = `<div class="wrap"><header class="top"><img src="assets/logo.png" alt="TANDUR"><div class="who">${T.avatar(r.name)}<div><b>${r.name}</b><small>${r.title}</small></div></div><div class="sp"></div>
      <button class="btn ghost sm" data-act="swap">Ganti peran</button><button class="btn ghost sm" data-act="reset">Ulangi demo</button><span class="pill warn hide-s">Data ilustrasi</span></header>
      ${guide()}<div class="stage2"><div class="dev">${T.views[role].render(key)}</div>${notePanel(role, key)}</div>
      <div class="foot">TANDUR · Tim Pangpang · Universitas Brawijaya · Nama, harga, dan angka hanya contoh untuk memperagakan alur.</div></div>`;
    if (keep) { const pb = $('.pbody'); if (pb) pb.scrollTop = sc.pb; }
  }
  T.render = render;
  T.modalHTML = html => { $('#modal').innerHTML = html; $('#modal').classList.add('show'); };

  document.addEventListener('click', e => {
    if (e.target.id === 'modal') { $('#modal').classList.remove('show'); return; }
    const nav = e.target.closest('[data-nav]');
    if (nav) { S.nav[S.role] = nav.dataset.nav; render(); window.scrollTo({ top: 0 }); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    const name = a.dataset.act;
    if (name === 'close') { $('#modal').classList.remove('show'); return; }
    const fn = T.acts[name]; if (!fn) return;
    const before = S.nav[S.role] + S.role + S.screen;
    const res = fn(a);
    if (res === false) return;
    render(before === S.nav[S.role] + S.role + S.screen);
    if (S.screen !== 'role' || before !== S.nav[S.role] + S.role + S.screen) window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.addEventListener('change', e => { const f = T.acts['ch-' + e.target.id]; if (f) { f(e.target); render(true); } });
  document.addEventListener('input', e => { if (e.target.id === 'res') { const l = $('#reslab'); if (l) l.textContent = e.target.value + '%'; } });
  window.addEventListener('DOMContentLoaded', () => { render(); });
})();
