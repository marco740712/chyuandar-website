/* ── 目的地即時天氣與當地時間 ──
   當地時間：用瀏覽器內建的時區資料計算，每 30 秒更新，不需任何外部服務。
   天氣：挪威氣象局 MET Norway 公開資料（CC BY 4.0，可商用，需標示來源）。
   只在切換到該國家時才查詢，同一次瀏覽 30 分鐘內重複使用，減少請求。 */
(function(){
  const CITIES = {
    tokyo:   {n:"東京",   lat:35.6895, lon:139.6917, tz:"Asia/Tokyo"},
    sapporo: {n:"札幌",   lat:43.0618, lon:141.3545, tz:"Asia/Tokyo"},
    seoul:   {n:"首爾",   lat:37.5665, lon:126.9780, tz:"Asia/Seoul"},
    busan:   {n:"釜山",   lat:35.1796, lon:129.0756, tz:"Asia/Seoul"},
    bangkok: {n:"曼谷",   lat:13.7563, lon:100.5018, tz:"Asia/Bangkok"},
    chiangmai:{n:"清邁",  lat:18.7883, lon:98.9853,  tz:"Asia/Bangkok"},
    hanoi:   {n:"河內",   lat:21.0278, lon:105.8342, tz:"Asia/Ho_Chi_Minh"},
    hcmc:    {n:"胡志明市", lat:10.8231, lon:106.6297, tz:"Asia/Ho_Chi_Minh"},
    paris:   {n:"巴黎",   lat:48.8566, lon:2.3522,   tz:"Europe/Paris"},
    rome:    {n:"羅馬",   lat:41.9028, lon:12.4964,  tz:"Europe/Rome"}
  };

  /* 天氣代碼 → 圖示與中文 */
  function sky(code, isDay){
    const c = (code || "").replace(/_(day|night|polartwilight)$/, "");
    if(/thunder/.test(c)) return ["⛈", "雷雨"];
    if(/sleet/.test(c))   return ["🌨", "雨夾雪"];
    if(/snow/.test(c))    return ["❄️", "下雪"];
    if(/rain|drizzle/.test(c)) return ["🌧", "下雨"];
    if(c === "fog")       return ["🌫", "有霧"];
    if(c === "cloudy")    return ["☁️", "陰天"];
    if(c === "partlycloudy") return [isDay ? "⛅" : "☁️", "多雲"];
    if(c === "fair")      return [isDay ? "🌤" : "🌙", "晴時多雲"];
    if(c === "clearsky")  return [isDay ? "☀️" : "🌙", "晴朗"];
    return ["🌡", ""];
  }

  /* 當地時間與台灣時差 */
  const fmt = {};
  function localTime(tz){
    fmt[tz] = fmt[tz] || new Intl.DateTimeFormat("zh-TW", {timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false});
    return fmt[tz].format(new Date());
  }
  function diffText(tz){
    const now = new Date();
    const at = z => new Date(now.toLocaleString("en-US", {timeZone: z}));
    const h = Math.round((at(tz) - at("Asia/Taipei")) / 36e5 * 2) / 2;
    if(h === 0) return "與台灣同時";
    return h > 0 ? `比台灣快 ${h} 小時` : `比台灣慢 ${-h} 小時`;
  }
  function hourIn(tz){ return +new Intl.DateTimeFormat("en-US", {timeZone: tz, hour: "numeric", hour12: false}).format(new Date()) % 24; }

  function chipHTML(key){
    const c = CITIES[key];
    return `<div class="live-city" data-city="${key}">
      <b>📍 ${c.n}</b>
      <span class="lt"><span class="lt-time">${localTime(c.tz)}</span><small>${diffText(c.tz)}</small></span>
      <span class="lw">天氣載入中…</span>
    </div>`;
  }

  async function weather(key){
    const c = CITIES[key], ck = "cdt-wx-" + key;
    try{
      const hit = JSON.parse(sessionStorage.getItem(ck) || "null");
      if(hit && Date.now() - hit.at < 30 * 60e3) return hit;
    }catch(e){}
    const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${c.lat}&lon=${c.lon}`);
    if(!r.ok) throw new Error(r.status);
    const d = await r.json();
    const now = Date.now();
    const ts = d.properties.timeseries.find(t => new Date(t.time).getTime() >= now - 30 * 60e3) || d.properties.timeseries[0];
    const out = {
      at: now,
      temp: Math.round(ts.data.instant.details.air_temperature),
      code: (ts.data.next_1_hours || ts.data.next_6_hours || {summary:{}}).summary.symbol_code
    };
    try{ sessionStorage.setItem(ck, JSON.stringify(out)); }catch(e){}
    return out;
  }

  function fill(box){
    if(box.dataset.loaded) return;
    box.dataset.loaded = "1";
    box.querySelectorAll(".live-city").forEach(async el => {
      const key = el.dataset.city, w = el.querySelector(".lw");
      try{
        const x = await weather(key);
        const h = hourIn(CITIES[key].tz), [ico, txt] = sky(x.code, h >= 6 && h < 18);
        w.innerHTML = `<span class="ico">${ico}</span><span class="tp">${x.temp}°C</span><small>${txt}</small>`;
      }catch(e){
        w.innerHTML = `<small>天氣暫時無法取得</small>`;
      }
    });
  }

  const boxes = document.querySelectorAll(".live[data-cities]");
  boxes.forEach(b => { b.innerHTML = b.dataset.cities.split(",").map(chipHTML).join(""); });

  // 每 30 秒更新當地時間
  setInterval(() => {
    document.querySelectorAll(".live-city").forEach(el => {
      el.querySelector(".lt-time").textContent = localTime(CITIES[el.dataset.city].tz);
    });
  }, 30e3);

  // 只查詢目前看得到的國家；切換國家時再查
  function loadVisible(){ boxes.forEach(b => { if(b.offsetParent !== null) fill(b); }); }
  loadVisible();
  document.querySelectorAll('[role="tablist"]').forEach(l => l.addEventListener("tabchange", () => setTimeout(loadVisible, 0)));
})();
