/* Generator QR sederhana (mode byte, koreksi level L, versi 1-10). Tanpa dependensi. */
(function (root) {
  const ECC = [7, 10, 15, 20, 26, 18, 20, 24, 30, 18];      // ecc codeword per blok, versi 1..10
  const BLK = [1, 1, 1, 1, 1, 2, 2, 2, 2, 4];               // jumlah blok, versi 1..10
  function mul(x, y) { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z & 255; }
  function rsDiv(d) { const r = []; for (let i = 0; i < d - 1; i++) r.push(0); r.push(1); let root = 1;
    for (let i = 0; i < d; i++) { for (let j = 0; j < r.length; j++) { r[j] = mul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; } root = mul(root, 2); } return r; }
  function rsRem(data, div) { const r = div.map(() => 0); for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => r[i] ^= mul(c, f)); } return r; }
  function rawModules(v) { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; }
  function bit(x, i) { return ((x >>> i) & 1) !== 0; }
  function make(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 1;
    for (; ver <= 10; ver++) { const cap = Math.floor(rawModules(ver) / 8) - ECC[ver - 1] * BLK[ver - 1]; if (bytes.length + 2 <= cap) break; }
    if (ver > 10) throw new Error('Teks QR terlalu panjang');
    const size = ver * 4 + 17, dataCw = Math.floor(rawModules(ver) / 8) - ECC[ver - 1] * BLK[ver - 1];
    const bits = []; const put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
    put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(b => put(b, 8));
    put(0, Math.min(4, dataCw * 8 - bits.length)); while (bits.length % 8) bits.push(0);
    const data = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
    for (let p = 0xec; data.length < dataCw; p ^= 0xec ^ 0x11) data.push(p);
    const nb = BLK[ver - 1], el = ECC[ver - 1], raw = Math.floor(rawModules(ver) / 8), ns = nb - raw % nb, sl = Math.floor(raw / nb), div = rsDiv(el);
    const blocks = []; for (let i = 0, k = 0; i < nb; i++) { const d = data.slice(k, k + sl - el + (i < ns ? 0 : 1)); k += d.length; const e = rsRem(d, div); if (i < ns) d.push(0); blocks.push(d.concat(e)); }
    const all = []; for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== sl - el || j >= ns) all.push(b[i]); });
    const m = [], fn = []; for (let y = 0; y < size; y++) { m.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    const setF = (x, y, v) => { if (x >= 0 && y >= 0 && x < size && y < size) { m[y][x] = v; fn[y][x] = true; } };
    for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    const finder = (x, y) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); setF(x + dx, y + dy, d !== 2 && d !== 4); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    if (ver > 1) { const n = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2; const pos = [6]; for (let p = size - 7; pos.length < n; p -= step) pos.splice(1, 0, p);
      for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { if ((a === 0 && b === 0) || (a === 0 && b === n - 1) || (a === n - 1 && b === 0)) continue;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(pos[a] + dx, pos[b] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); } }
    const fmt = (mask) => { const d = (1 << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); const bs = ((d << 10) | r) ^ 0x5412;
      for (let i = 0; i <= 5; i++) setF(8, i, bit(bs, i)); setF(8, 7, bit(bs, 6)); setF(8, 8, bit(bs, 7)); setF(7, 8, bit(bs, 8)); for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(bs, i));
      for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(bs, i)); for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(bs, i)); setF(8, size - 8, true); };
    fmt(0);
    if (ver >= 7) { let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25); const bs = (ver << 12) | r;
      for (let i = 0; i < 18; i++) { const b = bit(bs, i), a = size - 11 + i % 3, c = Math.floor(i / 3); setF(a, c, b); setF(c, a, b); } }
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) { if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) { const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && i < all.length * 8) { m[y][x] = bit(all[i >>> 3], 7 - (i & 7)); i++; } } }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && (x + y) % 2 === 0) m[y][x] = !m[y][x];
    fmt(0);
    return m;
  }
  function svg(text, opt) {
    opt = opt || {}; const m = make(text), n = m.length, q = 2, fg = opt.fg || '#2B1A14', bgc = opt.bg || '#ffffff';
    let d = ''; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) d += 'M' + (x + q) + ',' + (y + q) + 'h1v1h-1z';
    const s = n + q * 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + ' ' + s + '" shape-rendering="crispEdges"><rect width="' + s + '" height="' + s + '" fill="' + bgc + '"/><path d="' + d + '" fill="' + fg + '"/></svg>';
  }
  root.TandurQR = { svg, make };
})(window);
