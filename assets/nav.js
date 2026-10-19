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
