/* 通用頁籤：<div role="tablist"> 內的 [role=tab][aria-controls] 切換對應 [role=tabpanel] */
(function(){
  document.querySelectorAll('[role="tablist"]').forEach(function(list){
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus){
      tabs.forEach(function(t){
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if(panel) panel.hidden = !on;
      });
      if(focus) tab.focus();
      list.dispatchEvent(new CustomEvent('tabchange', {detail: tab}));
    }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){
        select(t);
        if(list.hasAttribute('data-hash')) history.replaceState(null, '', '#' + t.getAttribute('aria-controls'));
      });
      t.addEventListener('keydown', function(e){
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if(d){ e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    // 網址帶 #panel-id 時直接開啟該頁籤
    var fromHash = location.hash && tabs.filter(function(t){ return '#' + t.getAttribute('aria-controls') === location.hash; })[0];
    select(fromHash || tabs.filter(function(t){ return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  });
})();
