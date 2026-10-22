/* 記錄頁首高度，讓黏在上方的區塊（打包進度、簽證搜尋列）剛好貼齊 */
(function(){
  var h = document.querySelector('header.site');
  if(!h) return;
  function set(){ document.documentElement.style.setProperty('--hdr', h.offsetHeight + 'px'); }
  set(); window.addEventListener('resize', set);
})();

/* 手機選單開關（所有頁面共用） */
(function(){
  var header = document.querySelector('header.site');
  var btn = document.querySelector('.nav-toggle');
  if(!header || !btn) return;
  btn.addEventListener('click', function(){
    var open = header.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  /* 手機選單裡的「旅遊指南」：點標題只展開／收合子選單，子選單第一項為總覽 */
  header.querySelectorAll('.menu-drop').forEach(function(drop){
    var top = drop.querySelector(':scope > a'), panel = drop.querySelector('.menu-drop-panel');
    if(!top || !panel) return;
    var all = document.createElement('a');
    all.href = top.getAttribute('href'); all.className = 'drop-all';
    all.innerHTML = '旅遊指南總覽<small>所有出國實用資訊</small>';
    panel.insertBefore(all, panel.firstChild);
    top.addEventListener('click', function(e){
      if(!header.classList.contains('nav-open')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var open = drop.classList.toggle('open');
      top.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  header.querySelectorAll('.menu a').forEach(function(a){
    a.addEventListener('click', function(){
      if(a.parentElement.classList.contains('menu-drop') && header.classList.contains('nav-open')) return;
      header.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* 頁尾年份自動更新（以看網頁當天的年份為準） */
(function(){
  var y = new Date().getFullYear();
  document.querySelectorAll('.cy').forEach(function(e){ e.textContent = y; });
})();

/* 右下角浮動按鈕「回頂端」（往下捲才出現） */
(function(){
  var box = document.createElement('div');
  box.className = 'fab';
  box.innerHTML = '<button type="button" class="fab-btn fab-top" aria-label="回到頁面頂端"><span>↑</span><small>頂端</small></button>';
  document.body.appendChild(box);
  box.querySelector('.fab-top').addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  function onScroll(){ box.classList.toggle('show', window.scrollY > 600); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

/* 點旅天下商品連結時，先提醒客人下單要指定詮達門市
   （旅天下網站禁止被嵌入，所以改在離開前提醒）
   - 按「我知道了，前往選購」：前往商品頁，本次瀏覽不再提醒
   - 沒有操作：3 秒後自動關閉並前往商品頁，下次點商品仍會提醒
   - 按 ✕ 或點旁邊空白處：取消，留在本站 */
(function(){
  var KEY = 'cdt-store-tip', WAIT = 3000, dlg = null, pending = '', timer = 0;
  function skip(){ try{ return sessionStorage.getItem(KEY) === '1'; }catch(e){ return false; } }
  function build(){
    dlg = document.createElement('div');
    dlg.className = 'store-tip';
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-labelledby', 'storeTipTitle');
    dlg.innerHTML =
      '<div class="store-tip-box">' +
        '<button type="button" class="store-tip-x" aria-label="關閉">✕</button>' +
        '<h3 id="storeTipTitle">📍 下單時請指定台南唯一三間門市的詮達旅行社</h3>' +
        '<p>前往旅天下官網選購選擇服務據點：</p>' +
        '<ol>' +
          '<li>服務地區選 <b>雲嘉南</b></li>' +
          '<li>門市選以下任一間：' +
            '<ul class="store-tip-list">' +
              '<li>台南水萍塭加盟店-詮達旅行社</li>' +
              '<li>台南歸仁加盟店-詮達旅行社</li>' +
              '<li>台南海佃加盟店-詮達旅行社</li>' +
            '</ul>' +
          '</li>' +
        '</ol>' +
        '<p class="store-tip-why">指定詮達門市，出發前後都由我們的小幫手一路服務您。</p>' +
        '<a class="store-tip-go" target="_blank" rel="noopener">我知道了，前往選購 →</a>' +
        '<span class="store-tip-bar" aria-hidden="true"></span>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function(e){ if(e.target === dlg || e.target.closest('.store-tip-x')) close(); });
    // 主動按下：照常開新分頁，並記住本次瀏覽不再提醒
    dlg.querySelector('.store-tip-go').addEventListener('click', function(){
      try{ sessionStorage.setItem(KEY, '1'); }catch(e){}
      close();
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && dlg.classList.contains('show')) close(); });
  }
  function open(url){
    if(!dlg) build();
    // 月曆的行程視窗是最上層彈窗，會蓋住提醒，先關掉
    document.querySelectorAll('dialog[open]').forEach(function(d){ if(d.close) d.close(); });
    pending = url;
    dlg.querySelector('.store-tip-go').href = url;
    dlg.classList.remove('show'); void dlg.offsetWidth;   // 讓倒數條重新開始
    dlg.classList.add('show');
    document.documentElement.classList.add('store-tip-lock');
    clearTimeout(timer);
    timer = setTimeout(function(){
      close();
      // 3 秒內仍可開新分頁；若被瀏覽器擋下，就在本頁前往
      var w = window.open(pending, '_blank');
      if(w){ try{ w.opener = null; }catch(e){} } else { location.href = pending; }
    }, WAIT);
  }
  function close(){
    clearTimeout(timer);
    dlg.classList.remove('show');
    document.documentElement.classList.remove('store-tip-lock');
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href*="gounitravel.com"]');
    if(!a || a.classList.contains('store-tip-go') || skip() || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    open(a.href);
  });
})();
