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
