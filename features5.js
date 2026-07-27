/* ============================================================
   KIN — feature module (Wave 5): rare achievements, season
   leagues + live presence, shared family goal + recipe sharing.
   ============================================================ */
(function () {
  'use strict';
  if (typeof S === 'undefined' || typeof window.FEATURE_SCREENS !== 'object') return;

  if (!Array.isArray(S.recipes)) S.recipes = [];               // local cache of shared recipes
  if (typeof S.familyGoalTarget !== 'number') S.familyGoalTarget = 40;
  save();

  const backBtn = (to) => `<button class="back" data-fx="nav" data-to="${to || 'tools'}">›  חזרה</button>`;
  const monthName = () => ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'][new Date().getMonth()];
  const daysLeftInMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate(); };
  const pct = (n) => (typeof window._skillPct === 'function') ? window._skillPct(n) : 0;

  // ======================================================
  //  Rare achievements
  // ======================================================
  const RARE = [
    { id: 'r_century', emoji: '💯', name: 'מאה!', desc: '100 אימונים', test: () => S.workoutsLog.length >= 100 },
    { id: 'r_skill', emoji: '🎓', name: 'מאסטר סקיל', desc: 'השלמת מיומנות ראשונה', test: () => (window.SKILLS || []).some((s) => pct(s) === 100) },
    { id: 'r_scholar', emoji: '📋', name: 'מדע מדויק', desc: 'השלמת מבחן הערכה', test: () => !!S.assessment },
    { id: 'r_measure', emoji: '📏', name: 'עוקב גוף', desc: '5 מדידות גוף', test: () => (S.measurements || []).length >= 5 },
    { id: 'r_challenger', emoji: '🏁', name: 'לוחם אתגרים', desc: '4 אתגרים שבועיים', test: () => (S.weeklyChallengeDone || []).length >= 4 },
    { id: 'r_builder', emoji: '🏗️', name: 'אדריכל', desc: 'בנית אימון מותאם', test: () => (S.customWorkouts || []).length >= 1 },
    { id: 'r_stepper', emoji: '👟', name: '10K', desc: '10,000 צעדים ביום', test: () => Object.values(S.steps || {}).some((v) => v >= 10000) },
    { id: 'r_freeze', emoji: '❄️', name: 'שומר רצף', desc: 'השתמשת בהקפאת רצף', test: () => (S.freezeDays || []).length >= 1 },
    { id: 'r_chef', emoji: '🍳', name: 'שף המשפחה', desc: 'שיתפת מתכון', test: () => (S.recipes || []).some((r) => r.mine) },
    { id: 'r_legend', emoji: '👑', name: 'אגדה', desc: 'רצף שיא 30 יום', test: () => (S.maxStreak || 0) >= 30 }
  ];
  function checkRare() {
    let changed = false;
    RARE.forEach((b) => { try { if (!S.badges.includes(b.id) && b.test()) { S.badges.push(b.id); changed = true; if (typeof awardXP === 'function') awardXP(40, 'הישג נדיר'); setTimeout(() => toast(`${b.emoji} הישג נדיר: ${b.name}!`), 500); } } catch {} });
    if (changed) save();
  }
  function ScreenAchievements() {
    checkRare();
    const core = (typeof BADGES !== 'undefined') ? BADGES : [];
    const all = [...core, ...RARE];
    const unlocked = all.filter((b) => S.badges.includes(b.id));
    const locked = all.filter((b) => !S.badges.includes(b.id));
    const cell = (b, on) => `<div class="ach ${on ? '' : 'locked'}"><div class="ach-e">${on ? b.emoji : '🔒'}</div><div class="ach-n">${b.name}</div><div class="ach-d">${b.desc}</div></div>`;
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:4px">🏅 הישגים</h2>
      <p class="muted" style="margin:0 0 12px">${unlocked.length}/${all.length} נפתחו</p>
      <div class="ach-grid">${unlocked.map((b) => cell(b, true)).join('')}${locked.map((b) => cell(b, false)).join('')}</div>`;
  }

  // ======================================================
  //  Season / league (from family members)
  // ======================================================
  function ScreenSeason() {
    if (!Cloud.enabled()) return `<div class="screen">${backBtn('tools')}<h2 class="h-lg">🏆 ליגת המשפחה</h2><div class="card center"><p class="muted">חבר את המשפחה בענן כדי להשתתף בליגה.</p><button class="btn" data-nav="cloud">חבר משפחה</button></div></div>`;
    const members = (Cloud.members || []).slice();
    const now = Date.now();
    const ranked = members.map((m) => ({ ...m, pts: (m.workouts | 0) + (m.streak | 0) * 2, live: m.updated_at && (now - new Date(m.updated_at).getTime()) < 20 * 60000 })).sort((a, b) => b.pts - a.pts);
    const liveNow = ranked.filter((m) => m.live);
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:4px">🏆 ליגת המשפחה</h2>
      <p class="muted" style="margin:0 0 12px">עונת ${monthName()} · נסגרת בעוד ${daysLeftInMonth()} ימים · ניקוד = אימונים + רצף×2</p>
      ${liveNow.length ? `<div class="card" style="border-color:var(--accent)"><div class="ex-name" style="margin-bottom:4px">🟢 פעילים עכשיו</div><div class="ex-meta">${liveNow.map((m) => esc(m.name)).join(' · ')}</div></div>` : ''}
      ${ranked.length ? ranked.map((m, i) => `<div class="card"><div class="between"><span class="flex"><span style="font-size:22px">${['🥇', '🥈', '🥉'][i] || '🏅'}</span><span class="ex-name">${esc(m.name)} ${m.live ? '🟢' : ''}</span></span><span class="pill accent">${m.pts} נק׳</span></div><div class="ex-meta" style="margin-top:4px">${m.workouts} אימונים · רצף ${m.streak}</div></div>`).join('') : '<p class="muted center">אין עדיין חברים בליגה.</p>'}
      <button class="btn ghost" data-fx="season-refresh">🔄 רענן</button>`;
  }

  // ======================================================
  //  Shared family goal + recipe sharing
  // ======================================================
  function ScreenFamilyGoal() {
    if (!Cloud.enabled()) return `<div class="screen">${backBtn('tools')}<h2 class="h-lg">🎯 יעד משפחתי</h2><div class="card center"><p class="muted">חבר את המשפחה בענן כדי להגדיר יעד משותף ולשתף מתכונים.</p><button class="btn" data-nav="cloud">חבר משפחה</button></div></div>`;
    const members = Cloud.members || [];
    const total = members.reduce((a, m) => a + (m.workouts | 0), 0);
    const target = S.familyGoalTarget || 40;
    const p = Math.min(100, Math.round(total / target * 100));
    const recipes = (S.recipes || []).slice(-10).reverse();
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:4px">🎯 יעד משפחתי</h2>
      <div class="card center" style="border-color:var(--accent)"><div class="h-xl" style="color:var(--accent)">${total}/${target}</div><div class="muted">אימונים משותפים</div>
        <div class="mtrack" style="margin:10px 0 6px"><div class="mfill" style="width:${p}%"></div></div>
        <div class="row2"><input class="input" id="fg-target" type="number" inputmode="numeric" placeholder="יעד חדש" value="${target}"><button class="btn sm" data-fx="fg-set">עדכן יעד</button></div>
        ${p >= 100 ? '<p style="color:var(--accent);font-weight:800;margin-top:8px">היעד הושג! 🎉</p>' : ''}</div>
      <div class="section-title">🍳 מתכוני המשפחה</div>
      <div class="card">
        <input class="input" id="rc-name" placeholder="שם המתכון" style="margin-bottom:8px">
        <input class="input" id="rc-body" placeholder="מרכיבים / הכנה בקצרה" style="margin-bottom:8px">
        <button class="btn sm" data-fx="recipe-share">📤 שתף עם המשפחה</button>
      </div>
      ${recipes.length ? recipes.map((r) => `<div class="card"><div class="ex-name">${esc(r.name)} ${r.mine ? '· שלי' : ''}</div><div class="ex-meta" style="margin-top:4px">${esc(r.body || '')}</div></div>`).join('') : '<p class="muted center" style="font-size:12px;padding:8px">עדיין אין מתכונים. שתף את הראשון!</p>'}
      <button class="btn ghost" data-fx="recipes-refresh">🔄 טען מתכונים</button>`;
  }

  // ---------------- actions ----------------
  const FX5 = {
    'season-refresh': () => { if (Cloud.enabled()) { Cloud.refresh({ workouts: S.workoutsLog.length, streak: S.streak }).then(() => render()); } },
    'fg-set': () => { const v = parseInt((document.getElementById('fg-target') || {}).value, 10); if (v > 0) { S.familyGoalTarget = v; save(); render(); } },
    'recipe-share': () => {
      const name = ((document.getElementById('rc-name') || {}).value || '').trim();
      const body = ((document.getElementById('rc-body') || {}).value || '').trim();
      if (!name) return toast('הזן שם מתכון');
      S.recipes.push({ name, body, mine: true, ts: Date.now() }); save();
      if (Cloud.enabled() && Cloud.postEvent) Cloud.postEvent('recipe', name + ' :: ' + body).then(() => loadRecipes());
      checkRare(); toast('שותף ✓'); render();
    },
    'recipes-refresh': () => loadRecipes()
  };
  async function loadRecipes() {
    if (!Cloud.enabled() || !Cloud.loadFeed) return;
    const feed = await Cloud.loadFeed();
    if (!feed) return;
    const remote = feed.filter((e) => e.kind === 'recipe').map((e) => { const [name, body] = (e.text || '').split(' :: '); return { name: name || 'מתכון', body: body || '', by: e.name, ts: new Date(e.created_at).getTime() }; });
    // merge remote into local (dedupe by name+ts-ish)
    const seen = new Set(S.recipes.map((r) => r.name + (r.body || '')));
    remote.forEach((r) => { if (!seen.has(r.name + (r.body || ''))) S.recipes.push(r); });
    save(); if (route.name === 'familygoal') render();
  }
  document.addEventListener('click', (ev) => {
    const t2 = ev.target.closest('[data-fx]'); if (!t2) return;
    const fn = FX5[t2.dataset.fx]; if (fn) { ev.preventDefault(); ev.stopPropagation(); try { fn(t2, ev); } catch (e) { console.error('fx5', t2.dataset.fx, e); } }
  });

  checkRare(); // catch up on any already-earned rare badges

  Object.assign(window.FEATURE_SCREENS, { achievements: ScreenAchievements, season: ScreenSeason, familygoal: ScreenFamilyGoal });
  window.FEATURE_ROUTES = Object.keys(window.FEATURE_SCREENS);
})();
