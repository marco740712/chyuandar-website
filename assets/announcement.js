/* 首頁限時公告：沿用跑馬燈的公開試算表，A–E 欄維持原樣。
   F 彈窗啟用（Y）｜G 彈窗標題｜H 彈窗說明｜I 彈窗圖片／影片
   J 彈窗開始時間｜K 彈窗結束時間（必填）；L、M 舊欄位保留但不顯示按鈕。
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

  // 一格放多張圖片：每行一個網址，不以逗號拆分（網址本身可能含逗號）。
  function parseImages(value){
    return value.split(/\r?\n/).map(function(line){ return safeURL(line.trim()); })
      .filter(function(url, index, urls){ return url && urls.indexOf(url) === index; });
  }

  function isVideo(url){ return /\.mp4$/i.test(new URL(url).pathname); }

  function buildVideo(dialog, notice){
    var section = document.createElement('section');
    section.className = 'ha-video-section';
    section.setAttribute('aria-label', '公告影片');
    var video = document.createElement('video');
    video.className = 'ha-video';
    video.controls = true;
    video.playsInline = true;
    video.muted = true;
    video.defaultMuted = true;
    video.preload = 'metadata';
    video.autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    video.setAttribute('aria-label', notice.title);
    if(notice.images.length) video.poster = notice.images[0];
    var hint = document.createElement('p');
    hint.className = 'ha-video-hint';
    hint.textContent = video.autoplay ? '影片自動靜音播放，可使用播放器暫停、重播或開啟聲音。' : '按播放觀看影片，可使用播放器開啟聲音。';
    section.appendChild(video); section.appendChild(hint);
    dialog.querySelector('.ha-content').prepend(section);
    var destroyed = false, destroyFallback = function(){};
    function pauseWhenHidden(){ if(document.hidden) video.pause(); }
    document.addEventListener('visibilitychange', pauseWhenHidden);
    video.addEventListener('error', function(){
      if(destroyed) return;
      video.hidden = true;
      hint.textContent = notice.images.length ? '影片暫時無法播放，請參考圖文說明。' : '影片暫時無法播放，請稍後重新載入。';
      destroyFallback = buildGallery(dialog, notice);
    }, {once:true});
    video.src = notice.video;
    // 中文字幕與 MP4 同檔名；僅為本站這支影片附加已上傳的字幕檔。
    var path = new URL(notice.video).pathname;
    if(/\/japan-tax-refund-2026\.mp4$/i.test(path)){
      var cover = new URL(notice.video); cover.pathname = path.replace(/\.mp4$/i, '-video-poster.jpg');
      video.poster = cover.href;
      var track = document.createElement('track');
      var captions = new URL(notice.video); captions.pathname = path.replace(/\.mp4$/i, '.vtt');
      track.kind = 'captions'; track.srclang = 'zh-Hant'; track.label = '繁體中文字幕'; track.src = captions.href;
      video.appendChild(track);
    }
    if(video.autoplay){
      var playing = video.play();
      if(playing) playing.catch(function(){
        if(!destroyed && !video.hidden) hint.textContent = '按播放觀看影片，可使用播放器開啟聲音。';
      });
    }
    return function(){
      destroyed = true; destroyFallback();
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      video.pause(); video.removeAttribute('src'); video.load();
    };
  }

  function buildGallery(dialog, notice){
    if(!notice.images.length) return function(){};
    var gallery = document.createElement('section');
    gallery.className = 'ha-gallery';
    gallery.setAttribute('aria-label', '公告圖片');
    gallery.setAttribute('aria-roledescription', '輪播');
    gallery.tabIndex = 0;
    gallery.innerHTML = '<div class="ha-stage"></div><p class="ha-image-hint">點圖片看大圖 ↗</p><div class="ha-gallery-controls">' +
      '<button type="button" class="ha-prev" aria-label="上一張圖片">‹</button>' +
      '<span class="ha-count" aria-live="off"></span>' +
      '<button type="button" class="ha-next" aria-label="下一張圖片">›</button>' +
      '<button type="button" class="ha-play"></button></div>';
    var stage = gallery.querySelector('.ha-stage');
    var controls = gallery.querySelector('.ha-gallery-controls');
    var count = gallery.querySelector('.ha-count'), play = gallery.querySelector('.ha-play');
    var slides = [], current = 0, rotationTimer, destroyed = false;
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var paused = motion.matches, hovered = false, focused = false;
    function schedule(){
      clearTimeout(rotationTimer);
      if(destroyed || paused || hovered || focused || document.hidden || slides.length < 2) return;
      rotationTimer = setTimeout(function(){ render(current + 1); }, 5000);
    }
    function render(index){
      current = slides.length ? (index + slides.length) % slides.length : 0;
      slides.forEach(function(img, i){
        img.hidden = i !== current;
        img.parentElement.hidden = i !== current;
        img.alt = notice.title + '（第 ' + (i + 1) + ' 張，共 ' + slides.length + ' 張）';
        img.parentElement.setAttribute('aria-label', img.alt + '，在新分頁開啟原圖');
        if(i === current || i === (current + 1) % slides.length) img.loading = 'eager';
      });
      gallery.classList.toggle('ha-multiple', slides.length > 1);
      controls.hidden = slides.length < 2;
      count.textContent = (current + 1) + ' / ' + slides.length;
      play.textContent = paused ? '播放輪播' : '暫停輪播';
      play.setAttribute('aria-label', paused ? '播放圖片輪播' : '暫停圖片輪播');
      gallery.hidden = !slides.length;
      schedule();
    }
    function move(step){ paused = true; render(current + step); }
    notice.images.forEach(function(url){
      var image = document.createElement('img');
      image.className = 'ha-image';
      image.loading = slides.length ? 'lazy' : 'eager';
      image.hidden = slides.length > 0;
      var fullImage = document.createElement('a');
      fullImage.className = 'ha-image-link';
      fullImage.href = url;
      fullImage.target = '_blank';
      fullImage.rel = 'noopener noreferrer';
      fullImage.hidden = image.hidden;
      fullImage.appendChild(image);
      image.addEventListener('error', function(){
        if(destroyed) return;
        var index = slides.indexOf(image);
        if(index < 0) return;
        slides.splice(index, 1); fullImage.remove();
        render(index < current ? current - 1 : Math.min(current, slides.length - 1));
      });
      slides.push(image); stage.appendChild(fullImage); image.src = url;
    });
    gallery.querySelector('.ha-prev').addEventListener('click', function(){ move(-1); });
    gallery.querySelector('.ha-next').addEventListener('click', function(){ move(1); });
    play.addEventListener('click', function(){
      paused = !paused;
      // 主動按播放時立即恢復；下一次移入或移動焦點才再次暫停。
      if(!paused){ hovered = false; focused = false; }
      render(current);
    });
    gallery.addEventListener('keydown', function(e){
      if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); move(e.key === 'ArrowLeft' ? -1 : 1);
    });
    gallery.addEventListener('mouseenter', function(){ hovered = true; schedule(); });
    gallery.addEventListener('mouseleave', function(){ hovered = false; schedule(); });
    gallery.addEventListener('focusin', function(){ focused = true; schedule(); });
    gallery.addEventListener('focusout', function(e){ focused = gallery.contains(e.relatedTarget); schedule(); });
    var swipe = null, swiped = false;
    stage.addEventListener('pointerdown', function(e){
      swiped = false;
      if(e.pointerType === 'touch') swipe = {x:e.clientX, y:e.clientY, id:e.pointerId};
    });
    stage.addEventListener('pointerup', function(e){
      if(!swipe || swipe.id !== e.pointerId) return;
      var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
      swipe = null;
      if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5){
        swiped = true; move(dx < 0 ? 1 : -1);
      }
    });
    stage.addEventListener('pointercancel', function(){ swipe = null; });
    stage.addEventListener('click', function(e){
      if(swiped){ e.preventDefault(); swiped = false; }
    });
    function onMotion(){ if(motion.matches){ paused = true; render(current); } }
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', onMotion);
    dialog.querySelector('.ha-content').prepend(gallery);
    render(0);
    return function(){
      destroyed = true; clearTimeout(rotationTimer);
      document.removeEventListener('visibilitychange', schedule);
      motion.removeEventListener('change', onMotion);
    };
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
      var media = parseImages(r[3] || '');
      var video = media.find(isVideo) || '';
      var images = media.filter(function(url){ return !isVideo(url); });
      if(!r[1] && !r[2] && !images.length && !video) continue;
      return {id: JSON.stringify(r.slice(0, 6)), title: r[1] || '最新公告', description: r[2] || '', images: images,
        video: video, end: end};
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
      '<div class="ha-content"><p class="ha-eyebrow">NOTICE</p><h2 id="homeAnnouncementTitle"></h2><p class="ha-description"></p></div></div>';
    dialog.querySelector('h2').textContent = notice.title;
    var description = dialog.querySelector('.ha-description');
    description.textContent = notice.description;
    description.hidden = !notice.description;
    var previousFocus = document.activeElement, timer, destroyGallery = function(){};
    function close(){ if(dialog.open) dialog.close(); }
    function checkExpiry(){
      clearTimeout(timer);
      if(Date.now() >= notice.end){ close(); return; }
      // 避免遠期日期超過瀏覽器的計時器上限；回到分頁時也重新檢查。
      timer = setTimeout(checkExpiry, Math.min(notice.end - Date.now(), 2147483647));
    }
    dialog.querySelector('.ha-close').addEventListener('click', close);
    var backdropDown = false;
    dialog.addEventListener('pointerdown', function(e){ backdropDown = e.target === dialog; });
    dialog.addEventListener('click', function(e){ if(backdropDown && e.target === dialog) close(); });
    dialog.addEventListener('close', function(){
      clearTimeout(timer);
      destroyGallery();
      document.removeEventListener('visibilitychange', checkExpiry);
      window.removeEventListener('pageshow', checkExpiry);
      document.documentElement.classList.remove('ha-lock');
      dialog.remove();
      if(previousFocus && previousFocus.isConnected) previousFocus.focus({preventScroll:true});
    }, {once:true});
    document.body.appendChild(dialog);
    if(Date.now() >= notice.end){ dialog.remove(); return; }
    dialog.showModal();
    destroyGallery = notice.video ? buildVideo(dialog, notice) : buildGallery(dialog, notice);
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
