/* ── 官網跑馬燈 ──
   訊息來源：Google 試算表「詮達官網跑馬燈訊息」（發布到網路的 CSV）
   欄位：A 訊息內容｜B 開始時間｜C 結束時間｜D 緊急（填 Y）｜E 連結（可空白）
   - 每一列一則訊息，各自有起訖時間；不在時間內的訊息不顯示
   - 開始時間空白＝立即顯示；結束時間空白＝一直顯示到刪除為止
   - 沒有任何有效訊息時，整條跑馬燈不出現
   - 時間一律以台灣時間判斷 */
(function(){
  var SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTP-tnVIltsL6ZNGZ8MCrmo9mYmZtSt8y5VUgSV3LPlxgaRVOVDG-vkn8jJ-fg07UXmSql7tVVbldvZ/pub?output=csv';
  if(SHEET.indexOf('http') !== 0) return;

  function parseCSV(t){
    var rows = [], row = [], f = '', q = false;
    for(var i = 0; i < t.length; i++){
      var c = t[i];
      if(q){
        if(c === '"' && t[i+1] === '"'){ f += '"'; i++; }
        else if(c === '"') q = false;
        else f += c;
      }else if(c === '"') q = true;
      else if(c === ','){ row.push(f); f = ''; }
      else if(c === '\n' || c === '\r'){
        if(c === '\r' && t[i+1] === '\n') i++;
        row.push(f); rows.push(row); row = []; f = '';
      }else f += c;
    }
    if(f !== '' || row.length){ row.push(f); rows.push(row); }
    return rows;
  }
  // 「2026/10/22 08:00」「2026-10-22」等格式，視為台灣時間（UTC+8）
  function toTime(s){
    var m = String(s || '').trim().match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})(?:\D+(\d{1,2})(?::(\d{2}))?)?/);
    if(!m) return null;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], (m[4] ? +m[4] : 0) - 8, m[5] ? +m[5] : 0);
  }
  function esc(s){ return s.replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  // 5 分鐘內重複瀏覽沿用同一份資料，減少讀取
  var bucket = Math.floor(Date.now() / 300000);
  fetch(SHEET + (SHEET.indexOf('?') < 0 ? '?' : '&') + 't=' + bucket, {cache: 'no-store'})
    .then(function(r){ if(!r.ok) throw r.status; return r.text(); })
    .then(function(t){
      var now = Date.now(), urgent = false, list = [];
      parseCSV(t).slice(1).forEach(function(r){
        var msg = (r[0] || '').trim();
        if(!msg) return;
        var s = toTime(r[1]), e = toTime(r[2]);
        if(r[2] && /^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/.test(String(r[2]).trim())) e += 86400000 - 60000; // 只填日期：到當天 23:59
        if(s !== null && now < s) return;
        if(e !== null && now > e) return;
        if(/^\s*y/i.test(r[3] || '')) urgent = true;
        var url = (r[4] || '').trim();
        list.push(/^https?:\/\//i.test(url) ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(msg) + ' →</a>' : esc(msg));
      });
      if(!list.length) return;
      var text = list.join('<span class="tk-sep">◆</span>');
      var bar = document.createElement('div');
      bar.className = 'ticker' + (urgent ? ' urgent' : '');
      bar.setAttribute('role', 'status');
      bar.innerHTML = '<span class="tk-ico" aria-hidden="true">' + (urgent ? '⚠️' : '📢') + '</span>' +
        '<div class="tk-view"><div class="tk-track"><span>' + text + '</span><span aria-hidden="true">' + text + '</span></div></div>';
      document.body.insertBefore(bar, document.body.firstChild);
      // 依文字長度調整速度：約每秒 70px
      var track = bar.querySelector('.tk-track'), w = track.firstChild.offsetWidth;
      track.style.animationDuration = Math.max(12, w / 70) + 's';
      window.dispatchEvent(new Event('resize'));  // 讓頁首高度重新計算
    })
    .catch(function(){});
})();
