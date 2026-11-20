/* USCS Auto Generator — logika antarmuka */
(function () {
  'use strict';
  var $ = function (k) { return document.getElementById(k); };
  var NUM = ['g', 's', 'si', 'c', 'll', 'pl', 'pi', 'llod', 'd10', 'd30', 'd60', 'cu', 'cc', 'coh', 'phi'];
  var TXT = ['lab', 'proyek', 'lokasi', 'sid', 'depth', 'tgl', 'penguji', 'pemeriksa'];
  var KEY = 'uscs_samples_v2';
  var TITLE = 'DESKRIPSI DAN KLASIFIKASI TANAH';
  var SAMPLE = { g: 10.78, s: 68.14, si: 17.08, c: 4, ll: 32.77, pl: 20.13, d10: 0.02, d30: 0.18, d60: 1.5, coh: 0.06, phi: 29.37,
    lab: 'Laboratorium Mekanika Tanah', proyek: 'Contoh proyek', lokasi: 'Titik BH-01', sid: 'BH-01 / S-1', depth: '2,00 – 2,50', tgl: '' };

  /* ---------- util ---------- */
  function num(v) {
    if (v == null) return null;
    var t = String(v).trim().replace(',', '.');
    if (t === '') return null;
    var x = Number(t);
    return isFinite(x) ? x : null;
  }
  function fmt(x, dp) {
    if (x == null || isNaN(x)) return '-';
    var t = x.toFixed(dp == null ? 2 : dp);
    if (t.indexOf('.') >= 0) t = t.replace(/0+$/, '').replace(/\.$/, '');
    return t.replace('.', ',');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function rnd(x, n) { var p = Math.pow(10, n); return String(Math.round(x * p) / p); }

  /* ---------- baca / tulis form ---------- */
  function read() {
    var d = {};
    NUM.forEach(function (k) { d[k] = num($('f_' + k).value); });
    TXT.forEach(function (k) { d[k] = $('f_' + k).value.trim(); });
    d.np = $('f_np').checked; d.org = $('f_org').checked; d.peat = $('f_peat').checked;
    d.autoPI = $('f_autopi').checked; d.autoCu = $('f_autocu').checked;
    return d;
  }
  function write(d) {
    NUM.forEach(function (k) { $('f_' + k).value = d[k] == null ? '' : String(d[k]).replace('.', ','); });
    TXT.forEach(function (k) { $('f_' + k).value = d[k] || ''; });
    $('f_np').checked = !!d.np; $('f_org').checked = !!d.org; $('f_peat').checked = !!d.peat;
    $('f_autopi').checked = d.autoPI !== false; $('f_autocu').checked = d.autoCu !== false;
  }
  function syncAuto() {
    var d = read();
    $('f_pi').readOnly = d.autoPI || d.np;
    $('f_cu').readOnly = d.autoCu; $('f_cc').readOnly = d.autoCu;
    if (d.np) $('f_pi').value = '';
    else if (d.autoPI) $('f_pi').value = (d.ll != null && d.pl != null) ? rnd(d.ll - d.pl, 2).replace('.', ',') : '';
    if (d.autoCu) {
      var ok = d.d10 > 0 && d.d30 > 0 && d.d60 > 0;
      $('f_cu').value = ok ? rnd(d.d60 / d.d10, 3).replace('.', ',') : '';
      $('f_cc').value = ok ? rnd(d.d30 * d.d30 / (d.d10 * d.d60), 3).replace('.', ',') : '';
    }
  }

  /* ---------- validasi ---------- */
  function validate(d, r) {
    var m = [], sum = d.g + d.s + d.si + d.c;
    if (Math.abs(sum - 100) > 0.5) m.push(['err', 'Total komposisi ' + fmt(sum) + '% (harus 100%). Periksa data saringan/hidrometer.']);
    else if (Math.abs(sum - 100) > 0.05) m.push(['warn', 'Total komposisi ' + fmt(sum) + '%: ada selisih pembulatan.']);
    ['g', 's', 'si', 'c'].forEach(function (k) { if (d[k] < 0) m.push(['err', 'Nilai ' + k + ' tidak boleh negatif.']); });
    if (d.ll != null && d.pl != null) {
      if (d.pl > d.ll) m.push(['err', 'PL lebih besar dari LL: periksa data Atterberg.']);
      if (!d.autoPI && !d.np && d.pi != null && Math.abs(d.pi - (d.ll - d.pl)) > 0.1)
        m.push(['warn', 'PI (' + fmt(d.pi) + ') berbeda dari LL − PL (' + fmt(d.ll - d.pl) + ').']);
    }
    if (d.np && (d.pi != null)) m.push(['warn', 'NP dicentang tetapi PI terisi; PI diabaikan.']);
    if (d.llod != null && d.ll > 0) {
      var ratio = d.llod / d.ll;
      m.push([ratio < 0.75 ? 'warn' : 'ok', 'Rasio LL kering oven / LL = ' + fmt(ratio, 2) + (ratio < 0.75 ? ' (< 0,75 → organik).' : ' (≥ 0,75 → non-organik).')]);
    }
    if (d.d10 != null && d.d30 != null && d.d60 != null && !(d.d10 <= d.d30 && d.d30 <= d.d60))
      m.push(['err', 'Urutan diameter salah: harus D10 ≤ D30 ≤ D60.']);
    if (!d.autoCu && d.d10 > 0 && d.d60 > 0 && d.cu != null && Math.abs(d.cu - d.d60 / d.d10) / (d.d60 / d.d10) > 0.02)
      m.push(['warn', 'Cu input (' + fmt(d.cu) + ') ≠ D60/D10 (' + fmt(d.d60 / d.d10) + ').']);
    if (!d.autoCu && d.d10 > 0 && d.d30 > 0 && d.d60 > 0 && d.cc != null) {
      var cc = d.d30 * d.d30 / (d.d10 * d.d60);
      if (Math.abs(d.cc - cc) / cc > 0.02) m.push(['warn', 'Cc input (' + fmt(d.cc) + ') ≠ D30²/(D10×D60) (' + fmt(cc) + ').']);
    }
    if (r.fines >= 50 && (d.d10 != null || d.cu != null)) m.push(['ok', 'Tanah berbutir halus: nilai gradasi tidak dipakai untuk klasifikasi.']);
    if (d.phi != null && (d.phi < 0 || d.phi > 60)) m.push(['warn', 'Sudut geser φ di luar rentang wajar (0–60°).']);
    if (d.coh != null && d.coh < 0) m.push(['err', 'Kohesi tidak boleh negatif.']);
    if (r.pred === 'S' && d.coh != null && d.coh > 0.5 && r.fines < 12) m.push(['warn', 'Kohesi besar untuk pasir bersih: periksa sampel atau pengujian.']);
    if (r.fine && d.phi != null && d.phi > 35 && d.ll != null && d.ll >= 50) m.push(['warn', 'φ tinggi untuk tanah plastis tinggi: periksa data direct shear.']);
    r.warns.forEach(function (w) { m.push(['err', w]); });
    r.notes.forEach(function (w) { m.push(['warn', w]); });
    if (!m.some(function (x) { return x[0] === 'err' || x[0] === 'warn'; }) && r.symbol !== '?') m.push(['ok', 'Data konsisten.']);
    return m;
  }

  /* ---------- deskripsi ---------- */
  function describe(d, r) {
    var P = [TITLE];
    P.push('Berdasarkan hasil pengujian analisis saringan dan hidrometer, sampel tanah memiliki komposisi kerikil sebesar ' + fmt(d.g) +
      '%, pasir sebesar ' + fmt(d.s) + '%, lanau sebesar ' + fmt(d.si) + '%, dan lempung sebesar ' + fmt(d.c) +
      '%. Total fraksi halus (lolos saringan No. 200) sebesar ' + fmt(r.fines) + '%.');
    if (d.peat) {
      P.push('Tanah bersifat sangat organik (berserat, berwarna gelap, dan berbau) sehingga diklasifikasikan sebagai gambut (Pt).');
    } else if (d.np) {
      P.push('Hasil pengujian batas Atterberg menunjukkan bahwa tanah bersifat non-plastis (NP)' + (d.ll != null ? ', dengan Liquid Limit (LL) sebesar ' + fmt(d.ll) + '%' : '') + '.');
    } else if (d.ll != null && d.pl != null) {
      var pi = d.pi != null ? d.pi : d.ll - d.pl;
      var a = r.aLine, pos = Math.abs(pi - a) < 0.05 ? 'tepat pada' : (pi > a ? 'di atas' : 'di bawah');
      var t = 'Hasil pengujian batas Atterberg menunjukkan Liquid Limit (LL) sebesar ' + fmt(d.ll) + '%, Plastic Limit (PL) sebesar ' +
        fmt(d.pl) + '%, dan Plasticity Index (PI) sebesar ' + fmt(pi) + '%. Berdasarkan diagram plastisitas USCS, nilai PI berada ' + pos +
        ' A-line (PI A-line = ' + fmt(a) + '%).';
      if (d.llod != null && d.ll > 0) t += ' Rasio LL kering oven terhadap LL tidak dikeringkan sebesar ' + fmt(d.llod / d.ll) + (d.llod / d.ll < 0.75 ? ', sehingga tanah dikategorikan organik.' : ', sehingga tanah dikategorikan non-organik.');
      P.push(t);
    }
    P.push('Berdasarkan sistem klasifikasi tanah Unified Soil Classification System (USCS), tanah termasuk kelompok ' + r.symbol + ' (' +
      r.name + '), yaitu tanah berbutir ' + (r.fine ? 'halus' : 'kasar') + '.');
    if (d.d10 != null && d.d30 != null && d.d60 != null) {
      var g = 'Hasil analisis gradasi menunjukkan D10 sebesar ' + fmt(d.d10, 3) + ' mm, D30 sebesar ' + fmt(d.d30, 3) + ' mm, D60 sebesar ' +
        fmt(d.d60, 3) + ' mm, koefisien keseragaman (Cu) sebesar ' + fmt(d.cu) + ', dan koefisien kelengkungan (Cc) sebesar ' + fmt(d.cc) + '.';
      if (r.grad) g += ' Berdasarkan kriteria USCS, tanah tergolong ' + (r.grad === 'W' ? 'bergradasi baik (well graded)' : 'bergradasi buruk (poorly graded)') + '.';
      P.push(g);
    }
    if (d.coh != null || d.phi != null) {
      var parts = [];
      if (d.coh != null) parts.push('nilai kohesi sebesar ' + fmt(d.coh) + ' kg/cm²');
      if (d.phi != null) parts.push('sudut geser dalam sebesar ' + fmt(d.phi) + '°');
      P.push('Hasil pengujian Direct Shear menunjukkan ' + parts.join(' dan ') + '.');
    }
    return P.join('\n\n');
  }

  /* ---------- tampilan hasil ---------- */
  var COLORS = ['--c-g', '--c-s', '--c-si', '--c-c'];
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  function renderBar(d) {
    var vals = [d.g, d.s, d.si, d.c], names = ['Kerikil', 'Pasir', 'Lanau', 'Lempung'], bar = '', leg = '';
    vals.forEach(function (v, i) {
      var w = Math.max(0, v || 0);
      bar += '<i style="width:' + w + '%;background:var(' + COLORS[i] + ')" title="' + names[i] + ' ' + fmt(v) + '%"></i>';
      leg += '<span><b style="background:var(' + COLORS[i] + ')"></b>' + names[i] + ' ' + fmt(v) + '%</span>';
    });
    $('compBar').innerHTML = bar; $('compLegend').innerHTML = leg;
  }

  function drawChart(d, r) {
    var cv = $('chart'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var m = { l: 44, r: 12, t: 12, b: 36 }, xm = 100, ym = 60;
    var X = function (v) { return m.l + v / xm * (W - m.l - m.r); };
    var Y = function (v) { return H - m.b - v / ym * (H - m.t - m.b); };
    var ink = css('--ink'), mute = css('--mute'), grid = css('--grid'), acc = css('--acc'), soil = css('--soil');
    ctx.clearRect(0, 0, W, H);
    ctx.font = '13px sans-serif'; ctx.lineWidth = 1;
    var v;
    for (v = 0; v <= xm; v += 10) {
      ctx.strokeStyle = grid; ctx.beginPath(); ctx.moveTo(X(v), Y(0)); ctx.lineTo(X(v), Y(ym)); ctx.stroke();
      ctx.fillStyle = mute; ctx.textAlign = 'center'; ctx.fillText(v, X(v), H - m.b + 16);
    }
    for (v = 0; v <= ym; v += 10) {
      ctx.strokeStyle = grid; ctx.beginPath(); ctx.moveTo(X(0), Y(v)); ctx.lineTo(X(xm), Y(v)); ctx.stroke();
      ctx.fillStyle = mute; ctx.textAlign = 'right'; ctx.fillText(v, m.l - 6, Y(v) + 4);
    }
    ctx.fillStyle = mute; ctx.textAlign = 'center'; ctx.fillText('Liquid Limit, LL (%)', (m.l + W - m.r) / 2, H - 6);
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('Plasticity Index, PI (%)', 0, 0); ctx.restore();
    /* zona CL-ML */
    ctx.fillStyle = css('--zone'); ctx.beginPath();
    ctx.moveTo(X(10), Y(4)); ctx.lineTo(X(20 + 4 / 0.73), Y(4)); ctx.lineTo(X(20 + 7 / 0.73), Y(7)); ctx.lineTo(X(10), Y(7)); ctx.closePath(); ctx.fill();
    /* garis A, U, LL=50 */
    ctx.lineWidth = 2; ctx.strokeStyle = ink;
    ctx.beginPath(); ctx.moveTo(X(20), Y(0)); ctx.lineTo(X(100), Y(USCS.aLine(100))); ctx.stroke();
    ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(X(16), Y(7.2)); ctx.lineTo(X(8 + ym / 0.9), Y(ym)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(50), Y(0)); ctx.lineTo(X(50), Y(ym)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = mute; ctx.textAlign = 'left';
    ctx.fillText('A-line', X(78), Y(52) + 24); ctx.fillText('U-line', X(58), Y(55));
    ctx.fillText('CL-ML', X(11), Y(5.4) + 2);
    ctx.fillText('CL / OL', X(33), Y(18)); ctx.fillText('CH', X(70), Y(46)); ctx.fillText('ML / OL', X(30), Y(2.6)); ctx.fillText('MH / OH', X(70), Y(14));
    /* titik sampel */
    var pi = d.np ? 0 : (d.pi != null ? d.pi : null);
    if (d.ll != null && pi != null && !d.peat) {
      var px = X(Math.min(d.ll, xm)), py = Y(Math.min(Math.max(pi, 0), ym));
      ctx.fillStyle = soil; ctx.strokeStyle = ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ink; ctx.textAlign = px > W - 120 ? 'right' : 'left';
      ctx.fillText('LL ' + fmt(d.ll) + ' · PI ' + fmt(pi), px + (px > W - 120 ? -12 : 12), py - 10);
    }
  }

  var cur = { d: null, r: null };
  function compute() {
    syncAuto();
    var d = read();
    if (d.llod != null && d.ll > 0 && d.llod / d.ll < 0.75 && !d.org) { $('f_org').checked = true; d.org = true; }
    var sum = (d.g || 0) + (d.s || 0) + (d.si || 0) + (d.c || 0);
    $('total').textContent = fmt(sum) + '%';
    $('totalBox').className = 'total ' + (Math.abs(sum - 100) <= 0.5 ? 'ok' : 'bad');
    var full = ['g', 's', 'si', 'c'].every(function (k) { return d[k] != null; });
    renderBar({ g: d.g || 0, s: d.s || 0, si: d.si || 0, c: d.c || 0 });
    if (!full) {
      $('rSym').textContent = '—'; $('rName').textContent = 'Isi gravel, sand, silt, dan clay untuk memulai.';
      $('rMeta').textContent = ''; $('rMsgs').innerHTML = ''; drawChart(d, { aLine: null });
      cur = { d: null, r: null }; return null;
    }
    var r = USCS.classify(d);
    $('rSym').textContent = r.symbol; $('rName').textContent = r.name;
    $('rMeta').textContent = 'Fines: ' + fmt(r.fines) + '% · Plus No. 200: ' + fmt(r.plus) + '%' + (r.aLine != null ? ' · A-line: ' + fmt(r.aLine) + '%' : '');
    $('rMsgs').innerHTML = validate(d, r).map(function (x) { return '<li class="' + x[0] + '">' + esc(x[1]) + '</li>'; }).join('');
    drawChart(d, r);
    cur = { d: d, r: r };
    return cur;
  }
  function generate() {
    var c = compute();
    if (!c) { alert('Lengkapi komposisi gravel, sand, silt, dan clay terlebih dahulu.'); return; }
    $('desc').value = describe(c.d, c.r);
  }

  /* ---------- salin & ekspor ---------- */
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function (ok, no) {
      var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? ok() : no(); } catch (e) { no(e); } document.body.removeChild(ta);
    });
  }
  function toast(btn, txt) { var o = btn.textContent; btn.textContent = txt; setTimeout(function () { btn.textContent = o; }, 1400); }
  function download(name, mime, content) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  var REPORT_CSS = '@page{size:A4;margin:10mm 12mm}body{font-family:Arial,sans-serif;font-size:10pt;color:#000;margin:0}h1{font-size:14pt;text-align:center;margin:0}h2{font-size:11pt;margin:8px 0 4px}h3{font-size:10.5pt;margin:8px 0 4px}' +
    'p{margin:0 0 4px;text-align:justify;line-height:1.35}.c{text-align:center;margin:1px 0 8px;font-size:10pt}table{border-collapse:collapse;width:100%;margin-bottom:4px}td,th{border:1px solid #000;padding:3px 5px;font-size:9.5pt;text-align:left}' +
    'td.k{width:38%;background:#eee;-webkit-print-color-adjust:exact;print-color-adjust:exact}.g th{background:#eee;text-align:center;font-size:9pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}.g th.gt{background:#d9d9d9;font-size:9.5pt}.g td{text-align:center}' +
    '.sp{margin:0;font-size:3pt;line-height:3pt}.sig td{border:none;text-align:center;width:50%;padding-top:2px}.nt{font-size:8pt;color:#444;margin-top:6px}' +
    '@media print{table,tr{page-break-inside:avoid}}' +
    /* ---- tata letak 2 kolom: kiri = hasil uji, kanan = klasifikasi & grafik ---- */
    'table.lay{border:none;margin:0 0 4px;table-layout:fixed}table.lay td.lc,table.lay td.rc{border:none;padding:0;vertical-align:top}table.lay td.lc{width:52%;padding-right:8px}table.lay td.rc{width:48%}' +
    '.rp .lbl{font-size:9pt;color:#5b6e72;margin:0 0 1px}.rp .sym2{font-size:34pt;font-weight:800;color:#0e6a6e;line-height:1.05;margin:0;text-align:left}' +
    '.rp .nm2{font-size:12pt;font-weight:700;margin:1px 0 3px;text-align:left}.rp .meta2{font-size:9pt;color:#5b6e72;margin:0 0 5px;text-align:left}' +
    '.rp .msgs2{list-style:none;padding:0;margin:0 0 6px}.rp .msgs2 li{font-size:9pt;padding:3px 6px;margin-bottom:3px;border-left:3px solid #5b6e72;background:#f2f2f2;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.rp .msgs2 li.err{border-color:#b3261e}.rp .msgs2 li.warn{border-color:#9a6700}.rp .msgs2 li.ok{border-color:#1e7a46}' +
    '.rp .cap2{font-size:8.5pt;color:#5b6e72;text-align:center;margin-top:2px}';

  /* ---------- kop laporan ---------- */
  var KOPKEY = 'uscs_kop_v1', kopLogo = null;
  function getKop() { try { return JSON.parse(localStorage.getItem(KOPKEY)) || {}; } catch (e) { return {}; } }
  function saveKop() {
    var k = { nama: $('k_nama').value.trim(), alamat: $('k_alamat').value.trim(), logo: kopLogo, show: $('k_show').checked };
    try { localStorage.setItem(KOPKEY, JSON.stringify(k)); } catch (e) { alert('Penyimpanan browser penuh/diblokir; pengaturan kop tidak tersimpan.'); }
    renderKopPrev();
  }
  function renderKopPrev() {
    var p = $('k_prev'), del = $('k_del');
    if (kopLogo && kopLogo.src) { p.src = kopLogo.src; p.hidden = false; del.hidden = false; }
    else { p.removeAttribute('src'); p.hidden = true; del.hidden = true; }
  }
  function loadKop() {
    var k = getKop();
    $('k_nama').value = k.nama || ''; $('k_alamat').value = k.alamat || ''; $('k_show').checked = k.show !== false;
    kopLogo = k.logo || null; renderKopPrev();
  }
  function handleLogo(file) {
    if (!file) return;
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var iw = img.naturalWidth || img.width || 1, ih = img.naturalHeight || img.height || 1;
        var s = Math.min(1, 300 / Math.max(iw, ih)), cw = Math.max(1, Math.round(iw * s)), ch = Math.max(1, Math.round(ih * s));
        var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
        var dh = 70; /* tinggi logo di laporan (px) */
        kopLogo = { src: cv.toDataURL('image/png'), w: Math.round(dh * cw / ch), h: dh };
        saveKop();
      };
      img.onerror = function () { alert('Logo tidak dapat dibaca. Gunakan file PNG, JPG, atau SVG.'); };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  }
  function kopHtml() {
    var k = getKop();
    if (k.show === false || (!k.nama && !(k.logo && k.logo.src))) return '';
    var bd = 'border:none;border-bottom:3px double #000;padding:2px 4px;vertical-align:middle;';
    var lg = k.logo && k.logo.src;
    var side = lg ? '<td style="' + bd + 'width:' + (k.logo.w + 12) + 'px;text-align:left">' + '<img src="' + k.logo.src + '" width="' + k.logo.w + '" height="' + k.logo.h + '" alt="Logo"></td>' : '';
    var pad = lg ? '<td style="' + bd + 'width:' + (k.logo.w + 12) + 'px"></td>' : '';
    var mid = '<td style="' + bd + 'text-align:center">' +
      (k.nama ? '<div style="font-size:12.5pt;font-weight:bold;text-transform:uppercase">' + esc(k.nama) + '</div>' : '') +
      (k.alamat ? '<div style="font-size:8pt">' + esc(k.alamat).replace(/\n/g, '<br>') + '</div>' : '') + '</td>';
    return '<table style="width:100%;border-collapse:collapse;border:none;margin-bottom:6px"><tr>' + side + mid + pad + '</tr></table>';
  }
  function head(d) { return kopHtml() + '<h1>LAPORAN KLASIFIKASI TANAH (USCS)</h1><p class="c">' + esc(d.lab || 'Laboratorium Mekanika Tanah') + '</p>'; }
  function wrap(title, body) {
    return '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="id"><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>' + REPORT_CSS + '</style></head><body>' + body + '</body></html>';
  }
  /* tabel berkotak: setiap nilai dalam selnya sendiri (tanpa garis miring) */
  function grid(title, heads, vals) {
    return '<table class="g"><tr><th class="gt" colspan="' + heads.length + '">' + title + '</th></tr><tr>' +
      heads.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr><tr>' +
      vals.map(function (v) { return '<td>' + (esc(v) || '-') + '</td>'; }).join('') + '</tr></table><p class="sp">&nbsp;</p>';
  }
  /* ---------- grafik untuk laporan (statis, warna tetap agar aman dicetak) ---------- */
  var PCOL = { g: '#8a6d3b', s: '#d9a441', si: '#6f8f8a', c: '#34595f' };
  function reportCompBar(d) {
    var vals = [d.g, d.s, d.si, d.c], keys = ['g', 's', 'si', 'c'], names = ['Kerikil', 'Pasir', 'Lanau', 'Lempung'];
    var bar = '<div style="display:flex;width:100%;height:14px;border:1px solid #000;overflow:hidden">';
    vals.forEach(function (v, i) {
      var w = Math.max(0, v || 0);
      if (w > 0) bar += '<div style="width:' + w + '%;background:' + PCOL[keys[i]] + '" title="' + names[i] + ' ' + fmt(v) + '%"></div>';
    });
    bar += '</div>';
    var leg = '<p style="font-size:9pt;margin:4px 0 0;text-align:left">' + vals.map(function (v, i) {
      return '<span style="display:inline-block;width:9px;height:9px;background:' + PCOL[keys[i]] + ';margin-right:4px;vertical-align:middle"></span>' +
        names[i] + ' ' + fmt(v) + '%' + (i < 3 ? '&nbsp;&nbsp;&nbsp;' : '');
    }).join('') + '</p>';
    return bar + leg;
  }
  function reportChartImg() {
    try {
      var cv = $('chart');
      if (!cv || !cv.toDataURL) return '';
      return '<img src="' + cv.toDataURL('image/png') + '" alt="Diagram plastisitas (LL vs PI)" width="320" style="width:100%;max-width:100%;display:block;margin:2px auto">';
    } catch (e) { return ''; }
  }
  /* ---- panel kanan: klasifikasi USCS + komposisi + diagram plastisitas ---- */
  function buildResultPage(d, r) {
    var row = function (a, b) { return '<tr><td class="k">' + a + '</td><td>' + (esc(b) || '-') + '</td></tr>'; };
    var msgs = validate(d, r).map(function (x) { return '<li class="' + x[0] + '">' + esc(x[1]) + '</li>'; }).join('');
    var chartImg = reportChartImg();
    return '<div class="rp">' +
      '<h2 style="margin-top:0">Hasil klasifikasi</h2><table>' + row('Simbol USCS', r.symbol) + row('Nama kelompok', r.name) + '</table>' +
      '<p class="lbl">Klasifikasi USCS</p>' +
      '<p class="sym2">' + esc(r.symbol) + '</p>' +
      '<p class="nm2">' + esc(r.name) + '</p>' +
      '<p class="meta2">Fines: ' + fmt(r.fines) + '% · Plus No. 200: ' + fmt(r.plus) + '%' + (r.aLine != null ? ' · A-line: ' + fmt(r.aLine) + '%' : '') + '</p>' +
      (msgs ? '<ul class="msgs2">' + msgs + '</ul>' : '') +
      reportCompBar(d) +
      (chartImg ? '<div style="margin-top:6px;page-break-inside:avoid">' + chartImg + '<p class="cap2">Diagram plastisitas Casagrande: garis A, garis U, dan LL = 50.</p></div>' : '') +
      '</div>';
  }
  function buildReport(d, r, desc) {
    var row = function (a, b) { return '<tr><td class="k">' + a + '</td><td>' + (esc(b) || '-') + '</td></tr>'; };
    var paras = String(desc || '').split(/\n\s*\n/).map(function (p) {
      return p.trim() === TITLE ? '<h3>' + TITLE + '</h3>' : '<p>' + esc(p.trim()).replace(/\n/g, '<br>') + '</p>';
    }).join('');
    /* kolom kiri: identitas + seluruh tabel hasil uji */
    var left = '<h2 style="margin-top:0">Identitas sampel</h2><table>' + row('Proyek', d.proyek) + row('Lokasi / titik bor', d.lokasi) + row('No. sampel', d.sid) +
      row('Kedalaman (m)', d.depth) + row('Tanggal uji', d.tgl) + '</table>' +
      '<h2>Data pengujian</h2>' +
      grid('Komposisi butiran (%)', ['Kerikil', 'Pasir', 'Lanau', 'Lempung', 'Fines (No. 200)'], [fmt(d.g), fmt(d.s), fmt(d.si), fmt(d.c), fmt(r.fines)]) +
      grid('Batas Atterberg (%)', ['LL', 'PL', 'PI'], d.np ? [d.ll != null ? fmt(d.ll) : 'NP', 'NP', 'NP'] : [fmt(d.ll), fmt(d.pl), fmt(d.pi)]) +
      grid('Analisis gradasi', ['D10 (mm)', 'D30 (mm)', 'D60 (mm)', 'Cu', 'Cc'], [fmt(d.d10, 3), fmt(d.d30, 3), fmt(d.d60, 3), fmt(d.cu), fmt(d.cc)]) +
      grid('Direct shear', ['Kohesi (kg/cm²)', 'Sudut geser (°)'], [fmt(d.coh), fmt(d.phi)]);
    var b = head(d) +
      '<table class="lay"><tr><td class="lc">' + left + '</td><td class="rc">' + buildResultPage(d, r) + '</td></tr></table>' +
      paras +
      '<table class="sig"><tr><td>Penguji<br><br><br><u>' + esc(d.penguji || '..................') + '</u></td><td>Pemeriksa<br><br><br><u>' + esc(d.pemeriksa || '..................') + '</u></td></tr></table>' +
      '<p class="nt">Catatan: alat bantu klasifikasi awal USCS; hasil final perlu pemeriksaan kesesuaian metode pengujian dan standar ASTM D2487/SNI yang berlaku.</p>';
    return wrap('Laporan USCS ' + (d.sid || ''), b);
  }
  function currentReport() {
    var c = cur.d ? cur : compute();
    if (!c || !c.d) { alert('Lengkapi data komposisi terlebih dahulu.'); return null; }
    if (!$('desc').value.trim()) $('desc').value = describe(c.d, c.r);
    return buildReport(c.d, c.r, $('desc').value);
  }
  function safeName(s) { return String(s || 'sampel').replace(/[^\w\-]+/g, '_'); }

  /* ---------- database ---------- */
  function getDB() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function setDB(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { alert('Penyimpanan browser penuh/diblokir. Gunakan Cadangkan JSON.'); } }
  function enrich(e) { var r = USCS.classify(e.data); return { e: e, r: r }; }
  function renderDB() {
    var q = $('q').value.trim().toLowerCase(), db = getDB().sort(function (a, b) { return b.saved - a.saved; });
    var rows = db.map(enrich).filter(function (x) {
      var s = [x.e.data.sid, x.e.data.proyek, x.e.data.lokasi, x.r.symbol, x.r.name].join(' ').toLowerCase();
      return !q || s.indexOf(q) >= 0;
    });
    $('dbTable').querySelector('tbody').innerHTML = rows.map(function (x, i) {
      var d = x.e.data;
      return '<tr><td>' + esc(d.sid) + '</td><td>' + esc([d.proyek, d.lokasi].filter(Boolean).join(' / ')) + '</td><td>' + esc(d.depth) + '</td><td>' + esc(d.tgl) +
        '</td><td class="sy">' + esc(x.r.symbol) + '</td><td>' + esc(x.r.name) + '</td><td><button class="small" data-act="load" data-id="' + esc(d.sid) + '">Muat</button> ' +
        '<button class="small danger" data-act="del" data-id="' + esc(d.sid) + '">Hapus</button></td></tr>';
    }).join('');
    $('dbEmpty').style.display = rows.length ? 'none' : 'block';
    $('dbEmpty').textContent = db.length ? 'Tidak ada sampel yang cocok dengan pencarian.' : 'Belum ada sampel tersimpan. Data disimpan di browser perangkat ini (localStorage); gunakan Cadangkan JSON untuk memindahkan data.';
  }
  function saveCurrent() {
    var c = compute();
    if (!c) { alert('Lengkapi komposisi terlebih dahulu.'); return; }
    if (!c.d.sid) { alert('Isi No. sampel terlebih dahulu agar sampel dapat disimpan.'); $('f_sid').focus(); return; }
    var db = getDB(), i = db.findIndex(function (x) { return x.data.sid === c.d.sid; });
    if (i >= 0 && !confirm('Sampel "' + c.d.sid + '" sudah ada. Timpa data lama?')) return;
    var entry = { saved: Date.now(), data: c.d };
    if (i >= 0) db[i] = entry; else db.push(entry);
    setDB(db); renderDB();
  }
  function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  function exportCsv() {
    var db = getDB(); if (!db.length) { alert('Database kosong.'); return; }
    var cols = ['No. sampel', 'Proyek', 'Lokasi', 'Kedalaman', 'Tanggal', 'Gravel', 'Sand', 'Silt', 'Clay', 'Fines', 'LL', 'PL', 'PI', 'D10', 'D30', 'D60', 'Cu', 'Cc', 'Kohesi', 'Phi', 'USCS', 'Nama tanah'];
    var lines = [cols.map(csvCell).join(';')];
    db.forEach(function (e) {
      var d = e.data, r = USCS.classify(d);
      lines.push([d.sid, d.proyek, d.lokasi, d.depth, d.tgl, d.g, d.s, d.si, d.c, r.fines, d.np ? 'NP' : d.ll, d.np ? 'NP' : d.pl, d.np ? 'NP' : d.pi, d.d10, d.d30, d.d60, d.cu, d.cc, d.coh, d.phi, r.symbol, r.name]
        .map(function (v) { return csvCell(typeof v === 'number' ? String(v).replace('.', ',') : v); }).join(';'));
    });
    download('rekap_uscs.csv', 'text/csv;charset=utf-8', '\ufeff' + lines.join('\r\n'));
  }
  function exportRekap() {
    var db = getDB(); if (!db.length) { alert('Database kosong.'); return; }
    var h = '<tr><th>No. sampel</th><th>Lokasi</th><th>Kedalaman</th><th>Kerikil</th><th>Pasir</th><th>Fines</th><th>LL</th><th>PI</th><th>c</th><th>φ</th><th>USCS</th></tr>';
    var rows = db.map(function (e) {
      var d = e.data, r = USCS.classify(d);
      return '<tr><td>' + esc(d.sid) + '</td><td>' + esc(d.lokasi) + '</td><td>' + esc(d.depth) + '</td><td>' + fmt(d.g) + '</td><td>' + fmt(d.s) + '</td><td>' + fmt(r.fines) +
        '</td><td>' + (d.np ? 'NP' : fmt(d.ll)) + '</td><td>' + (d.np ? 'NP' : fmt(d.pi)) + '</td><td>' + fmt(d.coh) + '</td><td>' + fmt(d.phi) + '</td><td><b>' + esc(r.symbol) + '</b></td></tr>';
    }).join('');
    var d0 = db[0].data;
    download('rekap_uscs.doc', 'application/msword', '\ufeff' + wrap('Rekap USCS', head(d0) + '<h2>Rekapitulasi klasifikasi sampel</h2><table>' + h + rows + '</table>'));
  }

  /* ---------- event ---------- */
  function init() {
    var saved = null; try { saved = localStorage.getItem('uscs_theme'); } catch (e) { }
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
    $('btnTheme').onclick = function () {
      var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('uscs_theme', t); } catch (e) { }
      compute();
    };
    document.querySelectorAll('input[id^="f_"]').forEach(function (el) { el.addEventListener('input', compute); el.addEventListener('change', compute); });
    $('btnGen').onclick = generate;
    $('btnSample').onclick = function () { var s = {}; for (var k in SAMPLE) s[k] = SAMPLE[k]; s.tgl = new Date().toISOString().slice(0, 10); write(s); generate(); };
    $('btnReset').onclick = function () {
      if (!confirm('Hapus semua isian pada form?')) return;
      write({ lab: 'Laboratorium Mekanika Tanah' }); $('desc').value = ''; compute();
    };
    $('btnCopy').onclick = function () {
      if (!$('desc').value.trim()) generate();
      var t = $('desc').value; if (!t) return;
      copyText(t).then(function () { toast($('btnCopy'), 'Tersalin'); }, function () { $('desc').select(); alert('Salin otomatis gagal. Teks sudah dipilih; tekan Ctrl+C.'); });
    };
    $('btnWord').onclick = function () { var h = currentReport(); if (h) download('Laporan_USCS_' + safeName(cur.d.sid) + '.doc', 'application/msword', '\ufeff' + h); };
    $('btnPdf').onclick = function () {
      var h = currentReport(); if (!h) return;
      var w = window.open('', '_blank'); if (!w) { alert('Pop-up diblokir. Izinkan pop-up untuk mencetak, atau gunakan Ekspor Word.'); return; }
      w.document.open(); w.document.write(h); w.document.close(); w.focus(); setTimeout(function () { w.print(); }, 600);
    };
    $('btnSave').onclick = saveCurrent; $('btnCsv').onclick = exportCsv; $('btnRekap').onclick = exportRekap;
    $('btnJson').onclick = function () { download('uscs_sampel_backup.json', 'application/json', JSON.stringify(getDB(), null, 1)); };
    $('btnImport').onclick = function () { $('fileImport').click(); };
    $('fileImport').onchange = function (ev) {
      var f = ev.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var inc = JSON.parse(rd.result); if (!Array.isArray(inc)) throw 0;
          var db = getDB();
          inc.forEach(function (e) {
            if (!e || !e.data || !e.data.sid) return;
            var i = db.findIndex(function (x) { return x.data.sid === e.data.sid; });
            if (i >= 0) db[i] = e; else db.push(e);
          });
          setDB(db); renderDB(); alert('Impor selesai.');
        } catch (x) { alert('File JSON tidak valid.'); }
        ev.target.value = '';
      };
      rd.readAsText(f);
    };
    $('q').addEventListener('input', renderDB);
    $('dbTable').addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      var id = b.getAttribute('data-id'), db = getDB();
      if (b.getAttribute('data-act') === 'del') {
        if (confirm('Hapus sampel "' + id + '"?')) { setDB(db.filter(function (x) { return x.data.sid !== id; })); renderDB(); }
      } else {
        var e = db.find(function (x) { return x.data.sid === id; });
        if (e) { write(e.data); generate(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      }
    });
    loadKop();
    ['k_nama', 'k_alamat', 'k_show'].forEach(function (id) { $(id).addEventListener('input', saveKop); $(id).addEventListener('change', saveKop); });
    $('k_logo').onchange = function (ev) { handleLogo(ev.target.files[0]); ev.target.value = ''; };
    $('k_del').onclick = function () { kopLogo = null; saveKop(); };
    compute(); renderDB();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
