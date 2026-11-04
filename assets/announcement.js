/* 首頁限時公告：沿用跑馬燈的公開試算表，A–E 欄維持原樣。
   F 彈窗啟用（Y）｜G 彈窗標題｜H 彈窗說明｜I 彈窗圖片
   J 彈窗開始時間｜K 彈窗結束時間（必填）｜L 彈窗連結｜M 彈窗按鈕文字
   設定方式與範例見「首頁彈窗使用說明.md」。 */
(function(){
  'use strict';
  var SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTP-tnVIltsL6ZNGZ8MCrmo9mYmZtSt8y5VUgSV3LPlxgaRVOVDG-vkn8jJ-fg07UXmSql7tVVbldvZ/pub?output=csv';
  var KEY = 'cdt-home-announcement';

  function parseCSV(text){
    var rows = [], row = [], field = '', quoted = false;
    text = text.replace(/^\uFEFF/, '');
    for(var i = 0; i < text.length; i++){
      var c = text[i];
      if(quoted){
        if(c === '"' && text[i + 1] === '"'){ field += '"'; i++; }
        else if(c === '"') quoted = false;
        else field += c;
      }else if(c === '"') quoted = true;
      else if(c === ','){ row.push(field); field = ''; }
      else if(c === '\n' || c === '\r'){
        if(c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      }else field += c;
    }
    if(field || row.length){ row.push(field); rows.push(row); }
    return rows;
  }

  // 不依訪客所在時區：試算表內的日期時間一律視為台灣時間。
  // 結束欄只填日期時，顯示到當天結束（隔天 00:00 停用）。
  function toTime(value, end){
    var text = value.trim();
    if(!text) return end ? NaN : -Infinity;
    var m = text.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})(?:[ T]+(?:(上午|下午|AM|PM)\s*)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(上午|下午|AM|PM)?)?$/i);
    if(!m) return NaN;
    var y = +m[1], month = +m[2], day = +m[3];
    var h = +(m[5] || 0), minute = +(m[6] || 0), second = +(m[7] || 0);
    var ap = (m[4] || m[8] || '').toUpperCase();
    if(ap && (h < 1 || h > 12)) return NaN;
    if((ap === '下午' || ap === 'PM') && h < 12) h += 12;
    if((ap === '上午' || ap === 'AM') && h === 12) h = 0;
    if(h > 23 || minute > 59 || second > 59) return NaN;
    var calendar = new Date(Date.UTC(y, month - 1, day));
    if(calendar.getUTCFullYear() !== y || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return NaN;
    return Date.UTC(y, month - 1, day, h - 8, minute, second) + (end && !m[5] ? 86400000 : 0);
  }

  function safeURL(value){
    if(!value) return '';
    try{
      var url = new URL(value, document.baseURI);
      return /^https?:$/.test(url.protocol) ? url.href : '';
    }catch(e){ return ''; }
  }

  function selectAnnouncement(rows){
    // 未新增彈窗專用表頭時保持關閉，不把其他資料誤認為公告。
    if(!rows.length || (rows[0][5] || '').trim() !== '彈窗啟用') return null;
    var now = Date.now();
    for(var i = 1; i < rows.length; i++){
      var r = rows[i].slice(5, 13).map(function(v){ return v.trim(); });
      if(!/^y$/i.test(r[0] || '')) continue;
      var start = toTime(r[4] || '', false), end = toTime(r[5] || '', true);
      if(Number.isNaN(start) || !Number.isFinite(end) || start >= end || now < start || now >= end) continue;
      var image = safeURL(r[3] || '');
      if(!r[1] && !r[2] && !image) continue;
      return {id: JSON.stringify(r), title: r[1] || '最新公告', description: r[2] || '', image: image,
        end: end, link: safeURL(r[6] || ''), button: r[7] || '了解更多'};
    }
    return null;
  }

  function show(notice){
    try{ if(sessionStorage.getItem(KEY) === notice.id) return; }catch(e){}
    // 避免資料載入較慢時，打斷訪客已經開啟的行程視窗。
    if(document.querySelector('dialog[open], .store-tip.show')) return;
    var dialog = document.createElement('dialog');
    if(typeof dialog.showModal !== 'function') return;
    dialog.className = 'home-announcement';
    dialog.setAttribute('aria-labelledby', 'homeAnnouncementTitle');
    dialog.innerHTML = '<div class="ha-card">' +
      '<div class="ha-top"><span>詮達旅行社 · 最新消息</span><button type="button" class="ha-close" aria-label="關閉公告" autofocus>✕</button></div>' +
      '<div class="ha-content"><p class="ha-eyebrow">NOTICE</p><h2 id="homeAnnouncementTitle"></h2><p class="ha-description"></p>' +
      '<div class="ha-actions"><a class="ha-link" target="_blank" rel="noopener noreferrer"></a><button type="button" class="ha-dismiss">關閉公告</button></div></div></div>';
    dialog.querySelector('h2').textContent = notice.title;
    var description = dialog.querySelector('.ha-description');
    description.textContent = notice.description;
    description.hidden = !notice.description;
    if(notice.image){
      var image = document.createElement('img');
      image.className = 'ha-image';
      image.alt = notice.title;
      image.addEventListener('error', function(){ image.remove(); });
      image.src = notice.image;
      dialog.querySelector('.ha-content').prepend(image);
    }
    var link = dialog.querySelector('.ha-link');
    if(notice.link){ link.href = notice.link; link.textContent = notice.button + ' →'; }
    else link.remove();

    var previousFocus = document.activeElement, timer;
    function close(){ if(dialog.open) dialog.close(); }
    function checkExpiry(){
      clearTimeout(timer);
      if(Date.now() >= notice.end){ close(); return; }
      // 避免遠期日期超過瀏覽器的計時器上限；回到分頁時也重新檢查。
      timer = setTimeout(checkExpiry, Math.min(notice.end - Date.now(), 2147483647));
    }
    dialog.querySelector('.ha-close').addEventListener('click', close);
    dialog.querySelector('.ha-dismiss').addEventListener('click', close);
    var backdropDown = false;
    dialog.addEventListener('pointerdown', function(e){ backdropDown = e.target === dialog; });
    dialog.addEventListener('click', function(e){ if(backdropDown && e.target === dialog) close(); });
    dialog.addEventListener('close', function(){
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', checkExpiry);
      window.removeEventListener('pageshow', checkExpiry);
      document.documentElement.classList.remove('ha-lock');
      dialog.remove();
      if(previousFocus && previousFocus.isConnected) previousFocus.focus({preventScroll:true});
    }, {once:true});
    document.body.appendChild(dialog);
    if(Date.now() >= notice.end){ dialog.remove(); return; }
    dialog.showModal();
    document.documentElement.classList.add('ha-lock');
    try{ sessionStorage.setItem(KEY, notice.id); }catch(e){}
    document.addEventListener('visibilitychange', checkExpiry);
    window.addEventListener('pageshow', checkExpiry);
    checkExpiry();
  }

  // 每次進首頁讀取；Google 的公開試算表更新可能仍有短暫延遲。
  fetch(SHEET + '&t=' + Math.floor(Date.now() / 300000), {cache:'no-store'})
    .then(function(response){ if(!response.ok) throw new Error('Announcement unavailable'); return response.text(); })
    .then(function(csv){ var notice = selectAnnouncement(parseCSV(csv)); if(notice) show(notice); })
    .catch(function(){ /* 沒有資料或連線失敗時，照常瀏覽首頁。 */ });
})();
