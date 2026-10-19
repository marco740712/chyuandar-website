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
  header.querySelectorAll('.menu a').forEach(function(a){
    a.addEventListener('click', function(){
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
