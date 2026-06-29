/* ============================================================================
   Novixel — admin panel logic
   ============================================================================ */
(function(){
  "use strict";
  const SCHEMA = window.NOVIXEL_SCHEMA;
  const CFG = window.NOVIXEL_CONFIG || {};
  const LIVE = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  let sb = null;
  if (LIVE && window.supabase) {
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  }

  // ---- state ----
  let uiLang = localStorage.getItem("nx_admin_uilang") || "he";
  let contentLang = "en";
  let tab = "content";
  const T = () => SCHEMA.ui[uiLang];

  // ---- helpers ----
  const $ = (s, r=document) => r.querySelector(s);
  const el = (tag, props={}, kids=[]) => {
    const n = document.createElement(tag);
    Object.entries(props).forEach(([k,v])=>{
      if (k==="class") n.className=v;
      else if (k==="text") n.textContent=v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (Array.isArray(kids)?kids:[kids]).forEach(c=> c && n.appendChild(typeof c==="string"?document.createTextNode(c):c));
    return n;
  };
  const applyDir = () => { document.documentElement.dir = uiLang==="he" ? "rtl" : "ltr"; document.documentElement.lang = uiLang; };

  // ---- content storage (Supabase or localStorage preview) ----
  async function loadContent(lang){
    const defaults = SCHEMA.defaults[lang] || {};
    if (LIVE) {
      const { data } = await sb.from("site_content").select("content").eq("locale", lang).single();
      return Object.assign({}, defaults, (data && data.content) || {});
    }
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("nx_content_"+lang) || "{}"); } catch(e){}
    return Object.assign({}, defaults, saved);
  }
  async function saveContent(lang, obj){
    if (LIVE) {
      const { error } = await sb.from("site_content").upsert({ locale: lang, content: obj });
      if (error) throw error;
    } else {
      localStorage.setItem("nx_content_"+lang, JSON.stringify(obj));
    }
  }

  // ---- leads storage ----
  const SAMPLE_LEADS = [
    { id:"s1", created_at:new Date().toISOString(), full_name:"Jordan Rivera", business_email:"jordan@acme-roofing.com", business_type:"Roofing / Contractor", monthly_lead_volume:"50–200", status:"new" },
    { id:"s2", created_at:new Date(Date.now()-86400000).toISOString(), full_name:"María González", business_email:"maria@bellaspa.com", business_type:"Med-spa / Salon", monthly_lead_volume:"200–500", status:"contacted" }
  ];
  async function loadLeads(){
    if (LIVE){
      const { data, error } = await sb.from("leads").select("*").order("created_at",{ascending:false});
      if (error) throw error; return data || [];
    }
    try { return JSON.parse(localStorage.getItem("nx_leads") || "null") || SAMPLE_LEADS; } catch(e){ return SAMPLE_LEADS; }
  }
  async function updateLead(id, patch){
    if (LIVE){ await sb.from("leads").update(patch).eq("id", id); }
    else { const all = await loadLeads(); const i=all.findIndex(l=>l.id===id); if(i>=0){Object.assign(all[i],patch); localStorage.setItem("nx_leads", JSON.stringify(all));} }
  }
  async function deleteLead(id){
    if (LIVE){ await sb.from("leads").delete().eq("id", id); }
    else { let all = await loadLeads(); all = all.filter(l=>l.id!==id); localStorage.setItem("nx_leads", JSON.stringify(all)); }
  }

  // ---- auth ----
  async function currentUser(){ if(!LIVE) return {preview:true}; const {data}=await sb.auth.getSession(); return data.session ? data.session.user : null; }
  async function isAdmin(){ if(!LIVE) return true; const {data}=await sb.from("admins").select("user_id").limit(1); return !!(data && data.length); }

  // ============================ RENDER ============================
  const root = () => $("#app");

  function topbar(){
    return el("div",{class:"bar"},[
      el("div",{class:"brand"},[ logoSvg(), el("span",{class:"bt",text:T().title}) ]),
      el("div",{class:"barright"},[
        el("div",{class:"langtoggle"},[
          el("button",{class:"lt"+(uiLang==="he"?" on":""), onclick:()=>{uiLang="he";localStorage.setItem("nx_admin_uilang","he");render();}, text:"עברית"}),
          el("button",{class:"lt"+(uiLang==="en"?" on":""), onclick:()=>{uiLang="en";localStorage.setItem("nx_admin_uilang","en");render();}, text:"EN"})
        ]),
        el("button",{class:"btn ghost", onclick:logout, text:T().logout})
      ])
    ]);
  }
  function tabs(){
    const mk=(id,label)=>el("button",{class:"tabbtn"+(tab===id?" on":""), onclick:()=>{tab=id;render();}, text:label});
    return el("div",{class:"tabs"},[ mk("content",T().content), mk("leads",T().leads) ]);
  }

  async function viewContent(){
    const wrap = el("div",{class:"panel"});
    // content language selector
    wrap.appendChild(el("div",{class:"row"},[
      el("label",{class:"lbl",text:T().contentLang}),
      el("div",{class:"langtoggle"},[
        el("button",{class:"lt"+(contentLang==="en"?" on":""), onclick:()=>{contentLang="en";render();}, text:"English"}),
        el("button",{class:"lt"+(contentLang==="es"?" on":""), onclick:()=>{contentLang="es";render();}, text:"Español"})
      ])
    ]));
    const data = await loadContent(contentLang);
    const inputs = {};
    SCHEMA.groups.forEach(g=>{
      wrap.appendChild(el("h3",{class:"grp",text:g[uiLang]}));
      g.fields.forEach(f=>{
        const id="f_"+f.key.replace(/\W/g,"_");
        if (f.type==="checkbox"){
          const cb = el("input",{id, type:"checkbox"});
          cb.checked = data[f.key]===true || data[f.key]==="true";
          cb.style.width="auto"; cb.style.height="20px";
          inputs[f.key]=cb;
          wrap.appendChild(el("div",{class:"field cbfield"},[ cb, el("label",{class:"flbl cb",for:id,text:f[uiLang]}) ]));
          return;
        }
        const input = f.type==="textarea"
          ? el("textarea",{id, dir:"ltr", rows:"2"})
          : el("input",{id, type: f.type==="url"?"url":"text", dir:"ltr"});
        input.value = data[f.key]!=null ? data[f.key] : "";
        inputs[f.key]=input;
        wrap.appendChild(el("div",{class:"field"},[ el("label",{class:"flbl",for:id,text:f[uiLang]}), input ]));
      });
    });
    const status = el("span",{class:"savemsg"});
    const saveBtn = el("button",{class:"btn", text:T().save, onclick:async()=>{
      saveBtn.disabled=true; status.textContent=T().saving;
      const obj={}; Object.entries(inputs).forEach(([k,inp])=>obj[k]= inp.type==="checkbox" ? inp.checked : inp.value);
      try { await saveContent(contentLang, obj); status.textContent=T().saved; }
      catch(e){ status.textContent="⚠ "+(e.message||e); }
      saveBtn.disabled=false; setTimeout(()=>status.textContent="",2500);
    }});
    wrap.appendChild(el("div",{class:"actions"},[ saveBtn, status ]));
    return wrap;
  }

  async function viewLeads(){
    const wrap = el("div",{class:"panel"});
    const leads = await loadLeads();
    if(!leads.length){ wrap.appendChild(el("div",{class:"empty",text:T().noLeads})); return wrap; }
    const statuses=["new","contacted","booked","archived"];
    const table = el("table",{class:"leads"});
    table.appendChild(el("thead",{},el("tr",{},[
      el("th",{text:T().date}), el("th",{text:T().name}), el("th",{text:T().emailCol}),
      el("th",{text:T().type}), el("th",{text:T().volume}), el("th",{text:T().status}), el("th",{text:""})
    ])));
    const tb = el("tbody");
    leads.forEach(L=>{
      const sel = el("select",{class:"stsel", onchange:e=>updateLead(L.id,{status:e.target.value})});
      statuses.forEach(s=> sel.appendChild(el("option",{value:s, text:T()["st_"+s], ...(L.status===s?{selected:"selected"}:{})})));
      const d = new Date(L.created_at);
      tb.appendChild(el("tr",{},[
        el("td",{class:"mono",text:d.toLocaleDateString()}),
        el("td",{text:L.full_name||"—"}),
        el("td",{class:"mono"},el("a",{href:"mailto:"+(L.business_email||""),text:L.business_email||"—"})),
        el("td",{text:L.business_type||"—"}),
        el("td",{text:L.monthly_lead_volume||"—"}),
        el("td",{},sel),
        el("td",{},el("button",{class:"del", title:T().del, text:"✕", onclick:async()=>{ if(confirm(T().confirmDel)){ await deleteLead(L.id); render(); } }}))
      ]));
    });
    table.appendChild(tb);
    wrap.appendChild(table);
    return wrap;
  }

  function loginView(){
    const email = el("input",{type:"email", placeholder:T().email, dir:"ltr"});
    const pass  = el("input",{type:"password", placeholder:T().password, dir:"ltr"});
    const err   = el("div",{class:"err"});
    const card = el("div",{class:"logincard"},[
      el("div",{class:"loginbrand"},[ logoSvg(54), el("span",{class:"lt2",text:T().title}) ]),
      el("label",{class:"flbl",text:T().email}), email,
      el("label",{class:"flbl",text:T().password}), pass, err,
      el("button",{class:"btn full", text:T().login, onclick:async()=>{
        err.textContent="";
        const { error } = await sb.auth.signInWithPassword({ email:email.value.trim(), password:pass.value });
        if (error){ err.textContent=T().loginErr; return; }
        if (!(await isAdmin())){ err.textContent=T().notAdmin; await sb.auth.signOut(); return; }
        render();
      }}),
      el("div",{class:"langtoggle center"},[
        el("button",{class:"lt"+(uiLang==="he"?" on":""), onclick:()=>{uiLang="he";render();}, text:"עברית"}),
        el("button",{class:"lt"+(uiLang==="en"?" on":""), onclick:()=>{uiLang="en";render();}, text:"EN"})
      ])
    ]);
    return el("div",{class:"loginwrap"}, card);
  }

  async function logout(){ if(LIVE){ await sb.auth.signOut(); } render(); }

  function logoSvg(size=30){
    const ns="http://www.w3.org/2000/svg";
    const s=document.createElementNS(ns,"svg"); s.setAttribute("viewBox","0 0 120 120"); s.setAttribute("width",size); s.setAttribute("height",size);
    s.innerHTML='<defs><linearGradient id="ac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#a9afbd"/><stop offset=".86" stop-color="#f4f6fa"/><stop offset="1" stop-color="#9aa0ad"/></linearGradient><linearGradient id="ai" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7A6FF"/><stop offset=".5" stop-color="#7FE0FF"/><stop offset="1" stop-color="#F4A8FF"/></linearGradient></defs><rect x="3" y="3" width="114" height="114" rx="30" fill="#15161D"/><rect x="3.6" y="3.6" width="112.8" height="112.8" rx="29.5" fill="none" stroke="url(#ai)" stroke-width="1.3" opacity=".85"/><path d="M42 84V40L78 84V40" fill="none" stroke="url(#ac)" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="78" cy="34" r="3.4" fill="url(#ai)"/>';
    return s;
  }

  async function render(){
    applyDir();
    const r = root(); r.innerHTML="";
    if (LIVE && !sb){
      r.appendChild(el("div",{class:"preview",text: uiLang==="he"
        ? "⚠ לא הצלחנו לטעון את ספריית ההתחברות. בדוק חיבור אינטרנט ורענן את העמוד."
        : "⚠ Couldn't load the auth library. Check your connection and refresh."}));
      return;
    }
    const user = await currentUser();
    if (LIVE && !user){ r.appendChild(loginView()); return; }
    r.appendChild(topbar());
    if (!LIVE) r.appendChild(el("div",{class:"preview",text:T().preview}));
    r.appendChild(tabs());
    const holder = el("div",{class:"holder"});
    r.appendChild(holder);
    holder.appendChild(await (tab==="content"?viewContent():viewLeads()));
  }

  document.addEventListener("DOMContentLoaded", render);
})();
