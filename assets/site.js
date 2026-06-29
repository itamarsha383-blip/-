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
      ".nx-lt.on{background:#F3F1EA;color:#0B0C10}";
    document.head.appendChild(s);
  }
})();
