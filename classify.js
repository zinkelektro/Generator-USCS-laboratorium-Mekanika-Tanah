/* USCS classification engine — ASTM D2487 (versi terjemahan Indonesia)
   Logika murni tanpa DOM sehingga dapat diuji terpisah. */
(function (root) {
  'use strict';

  var NAMES = {
    'CL': 'Lempung berplastisitas rendah',
    'CH': 'Lempung berplastisitas tinggi',
    'ML': 'Lanau berplastisitas rendah',
    'MH': 'Lanau berplastisitas tinggi',
    'CL-ML': 'Lempung berlanau',
    'OL': 'Lanau/lempung organik berplastisitas rendah',
    'OH': 'Lanau/lempung organik berplastisitas tinggi'
  };

  function aLine(ll) { return 0.73 * (ll - 20); }
  function uLine(ll) { return 0.9 * (ll - 8); }

  /* Kelompok fraksi halus berdasarkan LL & PI (diagram plastisitas) */
  function fineGroup(d) {
    var ll = d.ll, pi = d.pi;
    if (d.np) {
      if (d.org) return (ll != null && ll >= 50) ? 'OH' : 'OL';
      return (ll != null && ll >= 50) ? 'MH' : 'ML';
    }
    if (ll == null || pi == null) return null;
    var a = aLine(ll);
    if (d.org) return ll < 50 ? 'OL' : 'OH';
    if (ll < 50) {
      if (pi < 4 || pi < a) return 'ML';
      return pi > 7 ? 'CL' : 'CL-ML';
    }
    return pi >= a ? 'CH' : 'MH';
  }

  function incomplete(res, msg) {
    res.symbol = '?';
    res.name = 'Data belum lengkap';
    res.warns.push(msg);
    return res;
  }

  function classify(d) {
    var fines = d.si + d.c, plus = d.g + d.s;
    var res = {
      fines: fines, plus: plus, fine: fines >= 50,
      aLine: (d.ll != null && !d.np) ? aLine(d.ll) : null,
      symbol: null, name: '', pred: null, grad: null, fineSym: null,
      warns: [], notes: []
    };

    if (d.peat) {
      res.symbol = 'Pt';
      res.name = 'Gambut (tanah sangat organik)';
      res.notes.push('Gambut/tanah sangat organik diklasifikasikan secara visual (berserat, berbau, berwarna gelap) dan tidak memerlukan analisis butiran.');
      return res;
    }

    var fg = fineGroup(d);
    res.fineSym = fg;

    /* ---------- Tanah berbutir halus (fines >= 50%) ---------- */
    if (fines >= 50) {
      if (!fg) return incomplete(res, 'LL dan PI diperlukan untuk tanah berbutir halus (atau centang NP bila non-plastis).');
      var nm = NAMES[fg];
      res.symbol = fg;
      if (plus >= 30) nm += (d.g > d.s) ? ' berkerikil' : ' berpasir';
      else if (plus >= 15) nm += ' dengan ' + ((d.g > d.s) ? 'kerikil' : 'pasir');
      res.name = nm;
      if (fg === 'CL-ML') res.notes.push('CL-ML: zona batas, PI 4–7 pada atau di atas A-line (lempung berlanau).');
      if (fg === 'OL' || fg === 'OH') res.notes.push('Klasifikasi organik berdasarkan rasio LL kering oven / LL tidak dikeringkan < 0,75 (ASTM D2487).');
      return res;
    }

    /* ---------- Tanah berbutir kasar (fines < 50%) ---------- */
    var pred = d.g > d.s ? 'G' : 'S';
    var other = pred === 'G' ? d.s : d.g;
    var base = pred === 'G' ? 'Kerikil' : 'Pasir';
    var gname = { W: 'bergradasi baik', P: 'bergradasi buruk' };
    res.pred = pred;

    var grad = null;
    if (fines < 12) {
      if (d.cu == null || d.cc == null) {
        res.warns.push('Cu dan Cc (atau D10, D30, D60) diperlukan untuk menentukan gradasi.');
      } else {
        var cuMin = pred === 'G' ? 4 : 6;
        grad = (d.cu >= cuMin && d.cc >= 1 && d.cc <= 3) ? 'W' : 'P';
        res.grad = grad;
      }
    }

    var sym, nm2;
    if (fines < 5) {
      if (!grad) return incomplete(res, 'Data gradasi belum lengkap.');
      sym = pred + grad;
      nm2 = base + ' ' + gname[grad];
    } else if (fines <= 12) {
      if (!grad) return incomplete(res, 'Data gradasi belum lengkap (diperlukan untuk simbol ganda, fines 5–12%).');
      if (!fg) return incomplete(res, 'LL dan PI diperlukan untuk simbol ganda (atau centang NP).');
      var c = (fg === 'CL' || fg === 'CH' || fg === 'CL-ML') ? 'C' : 'M';
      sym = pred + grad + '-' + pred + c;
      nm2 = base + ' ' + gname[grad] + ' dengan ' + (c === 'C' ? 'lempung' : 'lanau');
      res.notes.push('Fines 5–12%: simbol ganda (gradasi + jenis fines) sesuai ASTM D2487.');
    } else {
      if (!fg) return incomplete(res, 'LL dan PI diperlukan untuk fines > 12% (atau centang NP).');
      var t = fg === 'CL-ML' ? 'CM' : ((fg === 'CL' || fg === 'CH') ? 'C' : 'M');
      sym = t === 'CM' ? (pred + 'C-' + pred + 'M') : (pred + t);
      nm2 = base + ' ' + (t === 'C' ? 'berlempung' : (t === 'M' ? 'berlanau' : 'berlempung-lanau'));
      if (fg === 'OL' || fg === 'OH') res.notes.push('Fines bersifat organik: tambahkan keterangan "dengan fines organik" pada deskripsi.');
    }
    if (other >= 15) nm2 += (nm2.indexOf(' dengan ') >= 0 ? ' serta ' : ' dengan ') + (pred === 'G' ? 'pasir' : 'kerikil');

    res.symbol = sym;
    res.name = nm2;

    if (Math.abs(fines - 5) <= 1 || Math.abs(fines - 12) <= 1)
      res.notes.push('Fraksi halus dekat batas klasifikasi (5% atau 12%): periksa ulang ketelitian saringan/hidrometer.');
    if (Math.abs(d.g - d.s) <= 2)
      res.notes.push('Kerikil dan pasir hampir sama: pastikan fraksi dominan (G vs S) sudah benar.');
    return res;
  }

  var api = { classify: classify, fineGroup: fineGroup, aLine: aLine, uLine: uLine, NAMES: NAMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.USCS = api;
})(typeof window !== 'undefined' ? window : this);
