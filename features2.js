/* ============================================================
   KIN — feature module (Wave 2): social cloud, coach mode,
   barcode nutrition, streak freeze. Registers into the same
   FEATURE_SCREENS registry as features.js.
   ============================================================ */
(function () {
  'use strict';
  if (typeof S === 'undefined' || typeof window.FEATURE_SCREENS !== 'object') return;

  if (!Array.isArray(S.managed)) S.managed = []; // coach-mode member plans on this device
  save();

  const today = () => new Date().toISOString().slice(0, 10);
  const T = (k) => (typeof t === 'function' ? t(k) : k);
  const backBtn = (to) => `<button class="back" data-fx="nav" data-to="${to || 'tools'}">›  ${T('back')}</button>`;

  // ---------------- Streak freeze ----------------
  function ScreenFreeze() {
    const tokens = S.freezeTokens || 0, used = (S.freezeDays || []).length;
    const trainedToday = S.lastWorkout === today();
    const frozenToday = (S.freezeDays || []).includes(today());
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:6px">❄️ הקפאת רצף</h2>
      <p class="muted" style="margin:0 0 14px">יום מנוחה מתוכנן לא צריך לשבור לך את הרצף. השתמש באסימון הקפאה כדי לשמור עליו.</p>
      <div class="card center"><div class="h-xl" style="color:#4AA8FF">${tokens}</div><div class="muted">אסימונים זמינים · השתמשת ב-${used}</div></div>
      ${frozenToday ? `<div class="card center" style="border-color:#4AA8FF">היום כבר מוקפא ❄️ — הרצף מוגן.</div>`
        : trainedToday ? `<div class="card center">כבר התאמנת היום 💪 אין צורך בהקפאה.</div>`
          : `<button class="btn" data-fx="freeze-use" ${tokens <= 0 ? 'disabled' : ''}>❄️ הקפא את היום (${today().slice(5)})</button>`}
      <p class="muted" style="font-size:12px;margin-top:10px">מקבלים אסימונים חדשים כשמתמידים. השתמש בחוכמה — לא כתירוץ קבוע 😉</p>
    </div>`;
  }

  // ---------------- Coach / parent mode ----------------
  function ScreenParent() {
    const list = S.managed || [];
    const card = (m, i) => {
      const plan = buildSession(m, 0, {});
      const nut = nutritionPlan(m);
      return `<div class="card"><div class="between"><div><div class="ex-name">${esc(m.name)}</div><div class="ex-meta">גיל ${m.age} · רמה ${['', 'מתחיל', 'בינוני', 'מתקדם'][m.level]} · ${m.days} ימים</div></div><button class="react-btn" data-fx="mm-del" data-i="${i}">✕</button></div>
        <div class="ex-meta" style="margin-top:8px"><b style="color:var(--text)">אימון מומלץ:</b> ${plan.main.map((e) => e.name).join(' · ')}</div>
        <div class="ex-meta"><b style="color:var(--text)">תזונה:</b> ${nut.kcal} קל׳ · ${nut.protein}ג׳ חלבון</div></div>`;
    };
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:6px">👨‍👧 מצב מאמן / הורה</h2>
      <p class="muted" style="margin:0 0 12px">בנה תוכניות עבור בני משפחה נוספים על המכשיר הזה — בלי לגעת בנתונים שלך.</p>
      ${list.map(card).join('') || '<p class="muted center" style="padding:10px">עדיין לא הוספת מתאמנים.</p>'}
      <div class="section-title">הוסף מתאמן</div>
      <div class="card">
        <input class="input" id="mm-name" placeholder="שם" style="margin-bottom:8px">
        <div class="row3"><label class="fld">גיל<input class="input" id="mm-age" type="number" inputmode="numeric"></label>
          <label class="fld">מין<select class="select" id="mm-gender"><option value="m">זכר</option><option value="f">נקבה</option></select></label>
          <label class="fld">ימים<select class="select" id="mm-days"><option>3</option><option>4</option><option>5</option></select></label></div>
        <div class="row2" style="margin-top:8px"><label class="fld">רמה<select class="select" id="mm-level"><option value="1">מתחיל</option><option value="2">בינוני</option><option value="3">מתקדם</option></select></label>
          <label class="fld">מטרה<select class="select" id="mm-goal">${GOALS.map((g) => `<option value="${g.id}">${g.label}</option>`).join('')}</select></label></div>
        <button class="btn" style="margin-top:12px" data-fx="mm-add">➕ הוסף מתאמן</button>
      </div>
    </div>`;
  }

  // ---------------- Barcode nutrition scanner ----------------
  let scanStream = null, scanLoop = null;
  function ScreenScan() {
    const supported = ('BarcodeDetector' in window);
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:6px">📷 סריקת מזון (ברקוד)</h2>
      <p class="muted" style="margin:0 0 12px">סרוק ברקוד של מוצר וקבל ערכים תזונתיים ממאגר Open Food Facts.</p>
      ${supported ? `<div class="scan-wrap"><video id="scan-video" playsinline muted></video><div class="scan-line"></div></div>
        <div class="row2"><button class="btn" data-fx="scan-start">▶ הפעל מצלמה</button><button class="btn ghost" data-fx="scan-stop">■ עצור</button></div>`
        : `<div class="card"><p class="muted" style="font-size:13px">הדפדפן הזה לא תומך בסריקה אוטומטית — הזן את מספר הברקוד ידנית.</p></div>`}
      <div class="section-title">או הזנה ידנית</div>
      <div class="card"><div class="row2"><input class="input" id="scan-code" inputmode="numeric" placeholder="מספר ברקוד"><button class="btn sm" data-fx="scan-lookup">חפש</button></div></div>
      <div id="scan-result"></div>
    </div>`;
  }
  async function startScan() {
    const v = document.getElementById('scan-video'); if (!v) return;
    try {
      scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      v.srcObject = scanStream; await v.play();
      const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
      scanLoop = setInterval(async () => {
        try { const codes = await det.detect(v); if (codes && codes.length) { const c = codes[0].rawValue; stopScan(); lookupFood(c); } } catch {}
      }, 600);
    } catch (e) { toast('אין גישה למצלמה — הזן ידנית'); }
  }
  function stopScan() {
    if (scanLoop) clearInterval(scanLoop); scanLoop = null;
    if (scanStream) { scanStream.getTracks().forEach((t) => t.stop()); scanStream = null; }
  }
  async function lookupFood(code) {
    const box = document.getElementById('scan-result'); if (box) box.innerHTML = '<div class="card center muted">מחפש…</div>';
    try {
      const res = await fetch('https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(code) + '.json?fields=product_name,nutriments,image_small_url');
      const j = await res.json();
      if (!j || j.status === 0 || !j.product) { if (box) box.innerHTML = '<div class="card center muted">לא נמצא מוצר. נסה ידנית.</div>'; return; }
      const p = j.product, n = p.nutriments || {};
      const per100 = { name: p.product_name || 'מוצר', kcal: Math.round(n['energy-kcal_100g'] || 0), p: Math.round(n.proteins_100g || 0), c: Math.round(n.carbohydrates_100g || 0), f: Math.round(n.fat_100g || 0) };
      lastScan = per100;
      if (box) box.innerHTML = `<div class="card"><div class="flex">${p.image_small_url ? `<img src="${p.image_small_url}" style="width:56px;height:56px;object-fit:cover;border-radius:10px">` : ''}<div class="grow"><div class="ex-name">${esc(per100.name)}</div><div class="ex-meta">ל-100ג׳: ${per100.kcal} קל׳ · ${per100.p}ח ${per100.c}פ ${per100.f}ש</div></div></div>
        <div class="row2" style="margin-top:10px"><input class="input" id="scan-grams" type="number" inputmode="numeric" value="100" placeholder="גרם"><button class="btn sm" data-fx="scan-log">רשום ליומן</button></div></div>`;
    } catch { if (box) box.innerHTML = '<div class="card center muted">שגיאת רשת. נסה שוב.</div>'; }
  }
  let lastScan = null;
  function logScanned() {
    if (!lastScan) return;
    const g = parseFloat((document.getElementById('scan-grams') || {}).value) || 100;
    const f = g / 100;
    const item = { name: lastScan.name, kcal: Math.round(lastScan.kcal * f), p: Math.round(lastScan.p * f), c: Math.round(lastScan.c * f), fat: Math.round(lastScan.f * f) };
    const d = today(); S.nutrition[d] = S.nutrition[d] || [];
    S.nutrition[d].push({ name: item.name, kcal: item.kcal, p: item.p, c: item.c, f: item.fat });
    if (!S.recentFoods.includes(item.name)) S.recentFoods.unshift(item.name);
    save(); toast('נרשם ליומן ✓'); go('nutrition');
  }

  // ---------------- Family feed + kudos + head-to-head ----------------
  let feedLoading = false;
  const EVENTS_SQL = `create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  family text not null,
  device_id text,
  name text,
  kind text,
  text text,
  created_at timestamptz default now()
);
alter table public.events enable row level security;
create policy events_all on public.events for all using (true) with check (true);`;

  function ScreenFeed() {
    if (!Cloud.enabled()) {
      return `<div class="screen">${backBtn('family')}
        <h2 class="h-lg" style="margin-bottom:6px">📣 פיד המשפחה</h2>
        <div class="card center"><p class="muted">חבר קודם את המשפחה בענן כדי לראות פעילות חיה.</p><button class="btn" data-nav="cloud">חבר את המשפחה</button></div></div>`;
    }
    const members = Cloud.members || [];
    const ranked = members.slice().sort((a, b) => (b.streak - a.streak) || (b.workouts - a.workouts));
    const leader = ranked[0];
    const feed = Cloud.feed;
    let feedHTML;
    if (feed === null || feed === undefined) feedHTML = `<div class="card center muted">טוען פיד…</div>`;
    else if (!feed.length) feedHTML = `<div class="card center muted">עדיין אין פעילות. סיים אימון כדי לפתוח את הפיד! 🔥</div>`;
    else feedHTML = `<div class="card">${feed.map((e) => `<div class="ex-item"><div class="ex-emoji">${e.kind === 'kudos' ? '👏' : e.kind === 'pr' ? '🏆' : '🔥'}</div>
      <div class="grow"><div class="ex-name" style="font-size:14px">${esc(e.name || 'מישהו')}</div><div class="ex-meta">${esc(e.text || '')} · ${timeAgo(e.created_at)}</div></div>
      ${e.kind !== 'kudos' ? `<button class="react-btn" data-fx="kudo" data-name="${esc(e.name || '')}">👏</button>` : ''}</div>`).join('')}</div>`;

    return `<div class="screen">${backBtn('family')}
      <h2 class="h-lg" style="margin-bottom:6px">📣 פיד המשפחה</h2>
      ${leader ? `<div class="card" style="border-color:var(--accent)"><div class="between"><span class="ex-name">👑 מוביל השבוע</span><span class="pill accent">${esc(leader.name)} · רצף ${leader.streak}</span></div></div>` : ''}
      <div class="section-title">ראש בראש 🥊</div>
      <div class="card">${ranked.length ? ranked.map((m, i) => `<div class="ex-item"><div class="ex-emoji">${['🥇', '🥈', '🥉'][i] || (i + 1)}</div><div class="grow"><div class="ex-name">${esc(m.name)}</div><div class="ex-meta">${m.workouts} אימונים · רצף ${m.streak}</div></div></div>`).join('') : '<p class="muted center">אין עדיין חברים.</p>'}</div>
      <div class="section-title">פעילות אחרונה</div>
      ${feedHTML}
      <div id="feed-sql"></div>
    </div>`;
  }
  function timeAgo(iso) {
    try { const s = (Date.now() - new Date(iso).getTime()) / 1000; if (s < 60) return 'עכשיו'; if (s < 3600) return Math.floor(s / 60) + ' דק׳'; if (s < 86400) return Math.floor(s / 3600) + ' שע׳'; return Math.floor(s / 86400) + ' ימ׳'; } catch { return ''; }
  }
  async function refreshFeed() {
    if (!Cloud.enabled() || feedLoading) return;
    feedLoading = true;
    const rows = await Cloud.loadFeed();
    feedLoading = false;
    if (route.name === 'feed') {
      render();
      if (rows === null) { const box = document.getElementById('feed-sql'); if (box) box.innerHTML = `<div class="card"><p class="muted" style="font-size:12.5px;margin:0 0 8px">כדי להפעיל את הפיד, צור טבלת <b>events</b> ב-Supabase (SQL Editor):</p><pre class="sqlbox">${esc(EVENTS_SQL)}</pre><button class="btn ghost sm" data-fx="copy-events-sql">📋 העתק SQL</button></div>`; }
    }
  }

  // ---------------- register actions ----------------
  const add = (map) => Object.assign(window._FX2 = (window._FX2 || {}), map);
  const FX2 = {
    'freeze-use': () => {
      if ((S.freezeTokens || 0) <= 0) return toast('אין אסימונים');
      const d = today(); if (S.lastWorkout === d) return toast('כבר התאמנת היום');
      S.freezeDays = S.freezeDays || []; if (!S.freezeDays.includes(d)) S.freezeDays.push(d);
      S.freezeTokens--; if (typeof refreshStreak === 'function') refreshStreak(); save(); toast('היום מוקפא ❄️'); render();
    },
    'mm-add': () => {
      const name = ((document.getElementById('mm-name') || {}).value || '').trim(); if (!name) return toast('הזן שם');
      const g = document.getElementById('mm-goal').value;
      S.managed.push({ name, age: +document.getElementById('mm-age').value || 30, gender: document.getElementById('mm-gender').value, days: +document.getElementById('mm-days').value || 3, level: +document.getElementById('mm-level').value || 1, goals: [g], equip: S.profile.equip || 'none', injuries: [] });
      save(); render();
    },
    'mm-del': (t2) => { S.managed.splice(+t2.dataset.i, 1); save(); render(); },
    'scan-start': () => startScan(),
    'scan-stop': () => stopScan(),
    'scan-lookup': () => { const c = ((document.getElementById('scan-code') || {}).value || '').trim(); if (c) lookupFood(c); },
    'scan-log': () => logScanned(),
    'kudo': (t2) => { if (Cloud.postEvent) { Cloud.postEvent('kudos', 'עודד את ' + (t2.dataset.name || 'המשפחה') + ' 👏').then(() => refreshFeed()); toast('שלחת עידוד 👏'); } },
    'copy-events-sql': () => { try { navigator.clipboard.writeText(EVENTS_SQL); toast('הועתק ✓'); } catch {} }
  };
  document.addEventListener('click', (ev) => {
    const t2 = ev.target.closest('[data-fx]'); if (!t2) return;
    const fn = FX2[t2.dataset.fx]; if (fn) { ev.preventDefault(); ev.stopPropagation(); try { fn(t2, ev); } catch (e) { console.error('fx2', t2.dataset.fx, e); } }
  });

  // when leaving a scan screen, stop the camera
  const _origGo = window.go;
  window.go = function (name, params) { if (route.name === 'scan' && name !== 'scan') stopScan(); _origGo(name, params); if (name === 'feed') refreshFeed(); };

  // register screens
  Object.assign(window.FEATURE_SCREENS, { freeze: ScreenFreeze, parent: ScreenParent, scan: ScreenScan, feed: ScreenFeed });
  window.FEATURE_ROUTES = Object.keys(window.FEATURE_SCREENS);
})();
