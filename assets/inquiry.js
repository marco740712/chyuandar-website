/* ── 客製旅遊線上詢價單 ──
   送出方式：把資料送到 Google 表單（回覆會存進 Google 試算表，並可設定 Email 通知）。
   設定步驟：建立 Google 表單後，把表單的 formResponse 網址填入 action，
   並把每個欄位對應的 entry 編號填入 fields。
   尚未設定時，送出會改為開啟 Email 程式，寄到詮達信箱。 */
const INQUIRY = {
  action: "",   // 例："https://docs.google.com/forms/d/e/xxxxxxxx/formResponse"
  fields: {     // 例：name: "entry.123456789"
    name: "", phone: "", line: "", email: "", contactTime: "",
    type: "", people: "", date: "", days: "", budget: "", dest: "", note: ""
  },
  mailto: "chyuan.dar@msa.hinet.net"
};

(function(){
  const form = document.getElementById("inquiryForm");
  if(!form) return;
  const msg = document.getElementById("inquiryMsg");
  const btn = form.querySelector("button[type=submit]");
  const LABEL = {
    name:"姓名", phone:"聯絡電話", line:"LINE ID", email:"Email", contactTime:"方便聯絡時段",
    type:"團體類型", people:"人數", date:"預計出發", days:"旅遊天數", budget:"每人預算", dest:"想去的地方", note:"其他需求"
  };

  function show(text, ok){
    msg.textContent = text;
    msg.className = "form-msg " + (ok ? "ok" : "err");
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    if(d.website) return;                       // 防機器人欄位，真人看不到
    if(!d.name.trim()) return show("請填寫您的姓名。", false);
    if(!d.phone.trim() && !d.line.trim()) return show("請至少留下「聯絡電話」或「LINE ID」其中一項，方便我們聯繫您。", false);
    if(d.phone && !/^[0-9+\-()# ]{8,20}$/.test(d.phone.trim())) return show("聯絡電話格式好像不太對，請再確認一下。", false);
    if(!form.querySelector("#agree").checked) return show("請勾選同意個人資料蒐集說明。", false);

    btn.disabled = true; btn.textContent = "送出中…";
    try{
      if(INQUIRY.action){
        const body = new FormData();
        Object.entries(INQUIRY.fields).forEach(([k, entry]) => { if(entry) body.append(entry, (d[k] || "").trim()); });
        await fetch(INQUIRY.action, {method:"POST", mode:"no-cors", body});
        form.reset();
        form.hidden = true;
        document.getElementById("inquiryDone").hidden = false;
      }else{
        const lines = Object.keys(LABEL).filter(k => d[k]).map(k => `${LABEL[k]}：${d[k]}`);
        location.href = `mailto:${INQUIRY.mailto}?subject=${encodeURIComponent("【網站詢價】" + d.name)}&body=${encodeURIComponent(lines.join("\n"))}`;
        show("已為您開啟 Email，請按「傳送」完成詢價。若沒有自動開啟，也可以直接加 LINE 詢問。", true);
      }
    }catch(err){
      show("送出失敗，請稍後再試，或直接加 LINE 詢問。", false);
    }finally{
      btn.disabled = false; btn.textContent = "送出詢價單";
    }
  });
})();
