/* ============================================================================
   Novixel — public site i18n engine + language switcher (EN / ES)
   - English is the default. Choice is remembered and ?lang=es works too.
   - Switching reloads the page so every part (including the live chat)
     renders cleanly in the chosen language.
   ============================================================================ */
(function(){
  "use strict";
  var lang = document.documentElement.lang === "es" ? "es" : "en";

  injectStyles();
  buildSwitcher(lang);
  if (lang === "es") translate();
  loadContent(lang).then(applyContent).catch(function(){});

  /* ---- editable content (promo bar, etc.) from admin / Supabase ---- */
  function loadContent(locale){
    var def = (window.NOVIXEL_SCHEMA && window.NOVIXEL_SCHEMA.defaults && window.NOVIXEL_SCHEMA.defaults[locale]) || {};
    var C = window.NOVIXEL_CONFIG || {};
    if (C.SUPABASE_URL && C.SUPABASE_ANON_KEY) {
      var u = C.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/site_content?locale=eq." + locale + "&select=content";
      return fetch(u, { headers: { apikey: C.SUPABASE_ANON_KEY, Authorization: "Bearer " + C.SUPABASE_ANON_KEY } })
        .then(function(r){ return r.json(); })
        .then(function(j){ return (j && j[0] && j[0].content) ? Object.assign({}, def, j[0].content) : def; })
        .catch(function(){ return def; });
    }
    return Promise.resolve(def);
  }
  function applyContent(c){
    if (!c) return;
    var on = c["promo.enabled"] === true || c["promo.enabled"] === "true";
    if (on && c["promo.text"]) renderPromo(c["promo.text"], c["promo.url"]);
  }
  function renderPromo(text, url){
    var bar = document.querySelector(".ticker");
    if (!bar) return;
    var dkey = "nx_promo_dismissed";
    try { if (localStorage.getItem(dkey) === text) return; } catch(e){}
    bar.classList.add("nx-promo");
    bar.innerHTML = "";
    var msg = document.createElement(url ? "a" : "span");
    if (url) { msg.href = url; msg.target = "_blank"; msg.rel = "noopener"; }
    msg.className = "nx-promo-msg";
    msg.textContent = text;
    var x = document.createElement("button");
    x.type = "button"; x.className = "nx-promo-x"; x.setAttribute("aria-label","Dismiss"); x.textContent = "✕";
    x.addEventListener("click", function(e){ e.preventDefault(); try{ localStorage.setItem(dkey, text); }catch(e2){} bar.style.display = "none"; });
    bar.appendChild(msg); bar.appendChild(x);
  }

  function translate(){
    var D = (window.NX_I18N && window.NX_I18N.es) || {};
    var T = D.text || {}, PH = D.ph || {};
    if (D.title) document.title = D.title;

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode; if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName.toLowerCase();
        if (tag === "script" || tag === "style" || tag === "noscript") return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest("[data-noi18n]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function(node){
      var raw = node.nodeValue, key = raw.trim();
      if (T[key] != null) node.nodeValue = raw.replace(key, T[key]);
    });

    document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(function(el){
      var v = el.getAttribute("placeholder");
      if (PH[v] != null) el.setAttribute("placeholder", PH[v]);
    });
    var md = document.querySelector('meta[name="description"]');
    if (md && D.metaDescription) md.setAttribute("content", D.metaDescription);
  }

  function buildSwitcher(cur){
    var nav = document.querySelector(".nav-links");
    if (!nav) return;
    var wrap = document.createElement("div");
    wrap.className = "nx-lang";
    [["en","EN"],["es","ES"]].forEach(function(p){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "nx-lt" + (cur === p[0] ? " on" : "");
      b.textContent = p[1];
      b.setAttribute("aria-label", p[0] === "en" ? "English" : "Español");
      b.addEventListener("click", function(){
        try { localStorage.setItem("nx_lang", p[0]); } catch(e){}
        var u = new URL(location.href); u.searchParams.delete("lang");
        location.href = u.pathname + u.search + u.hash;
        location.reload();
      });
      wrap.appendChild(b);
    });
    var cta = nav.querySelector(".nav-cta");
    nav.insertBefore(wrap, cta || null);
  }

  function injectStyles(){
    var s = document.createElement("style");
    s.textContent =
      ".nx-lang{display:inline-flex;gap:2px;background:rgba(243,241,234,.05);border-radius:999px;padding:3px;box-shadow:inset 0 0 0 1px rgba(243,241,234,.08)}" +
      ".nx-lt{font:600 .78rem/1 'Space Grotesk',sans-serif;color:#8A8B99;background:none;border:0;cursor:pointer;padding:.34rem .72rem;border-radius:999px;transition:.2s}" +
      ".nx-lt:hover{color:#F3F1EA}" +
      ".nx-lt.on{background:#F3F1EA;color:#0B0C10}" +
      ".ticker.nx-promo{background:linear-gradient(100deg,rgba(183,166,255,.22),rgba(127,224,255,.16),rgba(244,168,255,.2));backdrop-filter:blur(8px);gap:.6rem;padding:.5rem 1rem}" +
      ".nx-promo .nx-promo-msg{color:#F3F1EA;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:.82rem;letter-spacing:0;text-transform:none;text-decoration:none}" +
      ".nx-promo a.nx-promo-msg:hover{text-decoration:underline}" +
      ".nx-promo .nx-promo-x{color:#F3F1EA;background:rgba(0,0,0,.18);border:0;width:20px;height:20px;border-radius:50%;cursor:pointer;font-size:.6rem;line-height:1;flex:0 0 auto}";
    document.head.appendChild(s);
  }
})();
