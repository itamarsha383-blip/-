/* ============================================================
   KIN — feature module (Wave 1)
   Self-contained add-ons that plug into the core app via a screen
   registry (FEATURE_SCREENS) and one delegated click handler.
   Nothing here edits core state shape destructively — new fields are
   created lazily and persisted through the app's own save().
   ============================================================ */
(function () {
  'use strict';
  if (typeof S === 'undefined') return; // core not loaded

  // ---- lazily add the fields these features use ----
  function initState() {
    if (!Array.isArray(S.measurements)) S.measurements = []; // [{date,weight,waist,chest,arm,thigh,hips}]
    if (typeof S.readiness !== 'object' || !S.readiness) S.readiness = {}; // {date:{sleep,energy,soreness,score,rec}}
    if (!Array.isArray(S.customWorkouts)) S.customWorkouts = []; // [{id,name,ids:[]}]
    if (!Array.isArray(S.favorites)) S.favorites = [];          // exercise ids
    if (typeof S.steps !== 'object' || !S.steps) S.steps = {};  // {date:count}
    if (typeof S.stepGoal !== 'number') S.stepGoal = 8000;
    if (typeof S.reminder !== 'object' || !S.reminder) S.reminder = { on: false, hour: 18, last: '' };
    if (typeof S.lang !== 'string') S.lang = 'he';
    if (typeof S.voice !== 'boolean') S.voice = false;
    if (typeof S.freezeTokens !== 'number') S.freezeTokens = 3;
    if (!Array.isArray(S.freezeDays)) S.freezeDays = [];
    save();
  }
  initState();

  // ---------- i18n (feature strings) ----------
  // Hebrew + English are complete; Arabic/Russian fall back to English where a
  // key is missing. The picker sets the app-wide direction for these screens.
  const I18N = {
    he: {
      tools: 'כלים ותוספות', builder: 'בונה אימונים', timers: 'טיימרים', measure: 'מדידות גוף',
      strength: 'תקני כוח', readiness: 'מוכנות יומית', restday: 'יום מנוחה פעיל', weekly: 'סיכום שבועי',
      steps: 'צעדים', reminders: 'תזכורות', language: 'שפה', coach: 'למה התוכנית הזו?',
      exportData: 'ייצוא נתונים', favorites: 'מועדפים', back: 'חזרה', save: 'שמור', start: 'התחל',
      add: 'הוסף', delete: 'מחק', today: 'היום', search: 'חיפוש תרגיל…', voiceCoach: 'מאמן קולי'
    },
    en: {
      tools: 'Tools & Extras', builder: 'Workout Builder', timers: 'Timers', measure: 'Body Measurements',
      strength: 'Strength Standards', readiness: 'Daily Readiness', restday: 'Active Rest Day', weekly: 'Weekly Summary',
      steps: 'Steps', reminders: 'Reminders', language: 'Language', coach: 'Why this plan?',
      exportData: 'Export Data', favorites: 'Favorites', back: 'Back', save: 'Save', start: 'Start',
      add: 'Add', delete: 'Delete', today: 'Today', search: 'Search exercise…', voiceCoach: 'Voice Coach'
    },
    ar: { tools: 'الأدوات', builder: 'منشئ التمارين', timers: 'المؤقتات', measure: 'قياسات الجسم', strength: 'معايير القوة', readiness: 'الجاهزية اليومية', restday: 'يوم راحة نشط', weekly: 'ملخص أسبوعي', steps: 'الخطوات', reminders: 'تذكيرات', language: 'اللغة', coach: 'لماذا هذه الخطة؟', exportData: 'تصدير البيانات', favorites: 'المفضلة', back: 'رجوع', save: 'حفظ', start: 'ابدأ', add: 'أضف', delete: 'حذف', today: 'اليوم', search: 'ابحث عن تمرين…', voiceCoach: 'مدرب صوتي' },
    ru: { tools: 'Инструменты', builder: 'Конструктор', timers: 'Таймеры', measure: 'Замеры тела', strength: 'Нормативы силы', readiness: 'Готовность', restday: 'День отдыха', weekly: 'Итоги недели', steps: 'Шаги', reminders: 'Напоминания', language: 'Язык', coach: 'Почему этот план?', exportData: 'Экспорт данных', favorites: 'Избранное', back: 'Назад', save: 'Сохранить', start: 'Старт', add: 'Добавить', delete: 'Удалить', today: 'Сегодня', search: 'Поиск упражнения…', voiceCoach: 'Голосовой тренер' }
  };
  function t(k) { const l = S.lang || 'he'; return (I18N[l] && I18N[l][k]) || I18N.en[k] || I18N.he[k] || k; }
  window.t = t;

  const today = () => new Date().toISOString().slice(0, 10);
  const num = (id) => { const v = parseFloat((document.getElementById(id) || {}).value); return Number.isFinite(v) ? v : null; };
  const val = (id) => ((document.getElementById(id) || {}).value || '').trim();

  // ---------- voice coach ----------
  function speak(text) {
    if (!S.voice) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = S.lang === 'en' ? 'en-US' : S.lang === 'ru' ? 'ru-RU' : S.lang === 'ar' ? 'ar-SA' : 'he-IL';
      u.rate = 1; speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch {}
  }
  window.speakCue = speak; // core active-workout can call this if present

  // ======================================================
  //  SCREENS
  // ======================================================
  const wrap = (title, bodyHTML, backTo) => `<div class="screen">
    <button class="back" data-fx="nav" data-to="${backTo || 'tools'}">›  ${t('back')}</button>
    <h2 class="h-lg" style="margin-bottom:14px">${title}</h2>${bodyHTML}</div>`;

  // --- Tools hub ---
  function ScreenTools() {
    const items = [
      ['builder', '🏗️', t('builder'), 'בנה אימון משלך מתרגילים לבחירתך'],
      ['timers', '⏱️', t('timers'), 'EMOM · AMRAP · Tabata · אינטרוולים'],
      ['readiness', '🧭', t('readiness'), 'צ׳ק-אין יומי שמתאים את העומס'],
      ['restday', '🧘', t('restday'), 'זרימת ניידות ומתיחות ליום מנוחה'],
      ['strength', '🏅', t('strength'), 'איפה אתה עומד מול הנורמות'],
      ['measure', '📏', t('measure'), 'היקפים + השוואת תמונות'],
      ['steps', '👟', t('steps'), 'מעקב צעדים יומי'],
      ['weekly', '📊', t('weekly'), 'הסיכום השבועי שלך'],
      ['coach', '🎓', t('coach'), 'שקיפות מלאה על התוכנית'],
      ['favorites', '⭐', t('favorites'), 'התרגילים השמורים שלך'],
      ['reminders', '🔔', t('reminders'), 'תזכורת אימון יומית'],
      ['feed', '📣', 'פיד המשפחה', 'פעילות חיה, עידודים וראש-בראש'],
      ['scan', '📷', 'סריקת מזון', 'ברקוד → ערכים תזונתיים'],
      ['parent', '👨‍👧', 'מצב מאמן', 'תוכניות לבני משפחה נוספים'],
      ['freeze', '❄️', 'הקפאת רצף', 'הגן על הרצף ביום מנוחה'],
      ['language', '🌍', t('language'), 'עברית · English · العربية · Русский'],
      ['exportdata', '📤', t('exportData'), 'CSV ליומן ולגיבוי']
    ];
    const voice = `<div class="card"><div class="between" style="padding:6px 0"><span>🎙️ ${t('voiceCoach')}</span>
      <button class="react-btn" data-fx="toggle-voice">${S.voice ? 'פעיל' : 'כבוי'}</button></div>
      <p class="muted" style="font-size:12px;margin:6px 0 0">הכרזה קולית בזמן מנוחה והחזקות באימון.</p></div>`;
    return `<div class="screen">
      <button class="back" data-nav="profile">›  ${t('back')}</button>
      <h2 class="h-lg" style="margin-bottom:4px">🧰 ${t('tools')}</h2>
      <p class="muted" style="margin:0 0 14px">כל מה שהוספנו — פתוח לשימוש.</p>
      ${voice}
      <div class="tool-grid">${items.map((i) => `<button class="tool-card" data-fx="nav" data-to="${i[0]}">
        <span class="te">${i[1]}</span><span class="tt">${i[2]}</span><span class="td">${i[3]}</span></button>`).join('')}</div>
    </div>`;
  }

  // --- Custom workout builder + library search + favorites ---
  function ScreenBuilder(params) {
    const q = (params && params.q) || '';
    const sel = builderSel;
    const list = EXERCISES.filter((e) => !q || e.name.includes(q) || (e.muscles.primary.join(' ').includes(q)));
    return wrap('🏗️ ' + t('builder'), `
      <p class="muted" style="margin:0 0 10px">בחר תרגילים לפי הסדר, ואז התחל — האימון ירוץ במנוע הרגיל עם טיימרים ומעקב.</p>
      <input class="input" id="b-q" placeholder="${t('search')}" value="${esc(q)}" data-fx-input="builder-search" style="margin-bottom:10px">
      ${sel.length ? `<div class="card"><div class="section-title" style="margin-top:0">נבחרו (${sel.length})</div>
        ${sel.map((id, i) => { const e = EXERCISES.find((x) => x.id === id); return `<div class="ex-item"><div class="ex-emoji">${e.emoji}</div><div class="grow"><div class="ex-name">${e.name}</div></div><button class="react-btn" data-fx="b-remove" data-i="${i}">✕</button></div>`; }).join('')}
        <div class="row2" style="margin-top:10px"><button class="btn" data-fx="b-start">▶ ${t('start')}</button><button class="btn ghost" data-fx="b-save">💾 ${t('save')}</button></div></div>` : ''}
      <div class="card">${list.map((e) => `<div class="ex-item">
        <div class="ex-emoji">${e.emoji}</div>
        <div class="grow" data-fx="nav-ex" data-id="${e.id}" style="cursor:pointer"><div class="ex-name">${e.name}</div><div class="ex-meta">${e.muscles.primary.join(', ')}</div></div>
        <button class="react-btn" data-fx="fav" data-id="${e.id}">${S.favorites.includes(e.id) ? '⭐' : '☆'}</button>
        <button class="btn sm" data-fx="b-add" data-id="${e.id}">＋</button>
      </div>`).join('')}</div>
      ${S.customWorkouts.length ? `<div class="section-title">אימונים שמורים</div><div class="card">${S.customWorkouts.map((w, i) => `<div class="ex-item"><div class="grow"><div class="ex-name">${esc(w.name)}</div><div class="ex-meta">${w.ids.length} תרגילים</div></div><button class="btn sm" data-fx="b-run" data-i="${i}">▶</button><button class="react-btn" data-fx="b-del" data-i="${i}">✕</button></div>`).join('')}</div>` : ''}
    `);
  }
  let builderSel = [];

  // --- Favorites ---
  function ScreenFavorites() {
    const favs = S.favorites.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean);
    return wrap('⭐ ' + t('favorites'), favs.length ? `<div class="card">${favs.map((e) => `<div class="ex-item"><div class="ex-emoji">${e.emoji}</div><div class="grow" data-fx="nav-ex" data-id="${e.id}" style="cursor:pointer"><div class="ex-name">${e.name}</div><div class="ex-meta">${e.muscles.primary.join(', ')}</div></div><button class="react-btn" data-fx="fav" data-id="${e.id}">⭐</button></div>`).join('')}</div>` : `<p class="muted center" style="padding:20px">עדיין אין מועדפים. הוסף מ⭐ בבונה האימונים.</p>`);
  }

  // --- Interval timers: EMOM / AMRAP / Tabata / custom ---
  function ScreenTimers() {
    const presets = [
      ['tabata', '🔥 Tabata', '20 שנ׳ עבודה · 10 מנוחה · 8 סבבים'],
      ['emom', '⏱️ EMOM', 'כל דקה, על הדקה · 10 סבבים'],
      ['amrap', '💥 AMRAP', 'כמה שיותר · 10 דקות'],
      ['circuit', '🔄 מעגל', '40 שנ׳ עבודה · 20 מנוחה · 5 תרגילים']
    ];
    return wrap('⏱️ ' + t('timers'), `
      <div class="tool-grid">${presets.map((p) => `<button class="tool-card" data-fx="timer-start" data-kind="${p[0]}"><span class="tt">${p[1]}</span><span class="td">${p[2]}</span></button>`).join('')}</div>
      <div class="section-title">מותאם אישית</div>
      <div class="card">
        <div class="row2"><label class="fld">עבודה (שנ׳)<input class="input" id="t-work" type="number" value="30" inputmode="numeric"></label><label class="fld">מנוחה (שנ׳)<input class="input" id="t-rest" type="number" value="15" inputmode="numeric"></label></div>
        <div class="row2" style="margin-top:8px"><label class="fld">סבבים<input class="input" id="t-rounds" type="number" value="8" inputmode="numeric"></label><label class="fld">הכנה (שנ׳)<input class="input" id="t-prep" type="number" value="5" inputmode="numeric"></label></div>
        <button class="btn" style="margin-top:12px" data-fx="timer-start" data-kind="custom">▶ ${t('start')}</button>
      </div>
      <div id="timer-stage"></div>`);
  }

  // --- Daily readiness check-in ---
  function ScreenReadiness() {
    const r = S.readiness[today()];
    const scale = (id, label) => `<div class="card"><div class="section-title" style="margin-top:0">${label}</div>
      <div class="chips">${[1, 2, 3, 4, 5].map((n) => `<button class="chip ${r && r[id] === n ? 'sel' : ''}" data-fx="ready-set" data-k="${id}" data-v="${n}" style="flex:1"><div class="t">${n}</div></button>`).join('')}</div></div>`;
    let result = '';
    if (r && r.score) {
      const rec = r.score >= 12 ? ['💪 מצוין — לך על אימון מלא, אפשר אפילו להוסיף סט.', 'full']
        : r.score >= 8 ? ['👍 סביר — אימון רגיל לפי התוכנית.', 'normal']
          : ['🧘 עייף — עדיף אימון מהיר או יום מנוחה פעיל.', 'light'];
      result = `<div class="card" style="border-color:var(--accent)"><div class="ex-name" style="margin-bottom:6px">הציון שלך: ${r.score}/15</div><p class="muted" style="font-size:14px;color:var(--text)">${rec[0]}</p>
        <div class="row2" style="margin-top:10px">${rec[1] === 'light' ? `<button class="btn" data-fx="nav" data-to="restday">🧘 מנוחה פעילה</button><button class="btn ghost" data-fx="go-quick">⚡ אימון מהיר</button>` : `<button class="btn" data-fx="go-workout">🔥 לאימון</button>`}</div></div>`;
    }
    return wrap('🧭 ' + t('readiness'), `<p class="muted" style="margin:0 0 12px">דרג 1–5 (1=גרוע, 5=מעולה) ונתאים לך את היום.</p>
      ${scale('sleep', '😴 שינה')}${scale('energy', '⚡ אנרגיה')}${scale('soreness', '💢 כאב שרירים (5=אין כאב)')}${result}`);
  }

  // --- Active rest day: guided mobility flow ---
  function ScreenRestDay() {
    const flow = [...WARMUPS, ...COOLDOWNS].filter((x) => x.sec).slice(0, 8);
    return wrap('🧘 ' + t('restday'), `<p class="muted" style="margin:0 0 12px">זרימת ניידות ומתיחות מודרכת — התאוששות פעילה בלי עומס.</p>
      <div class="card">${flow.map((x) => `<div class="ex-item"><div class="ex-emoji">${x.emoji}</div><div class="grow"><div class="ex-name">${x.name}</div><div class="ex-meta">${x.sec} שנ׳ · ${x.note || ''}</div></div></div>`).join('')}</div>
      <button class="btn" data-fx="rest-start">▶ התחל זרימה מודרכת (${flow.reduce((a, x) => a + x.sec, 0)} שנ׳)</button>
      <div id="timer-stage"></div>`);
  }

  // --- Strength standards (calisthenics benchmarks) ---
  // Approximate reference rep/second targets by movement, gender and age band.
  const STANDARDS = {
    pushup: { label: 'שכיבות סמיכה', unit: 'חזרות', m: [20, 35, 50, 70], f: [12, 22, 35, 50] },
    pullup: { label: 'מתח', unit: 'חזרות', m: [3, 8, 15, 22], f: [1, 3, 8, 13] },
    squat: { label: 'סקוואט משקל גוף', unit: 'חזרות', m: [30, 50, 75, 100], f: [25, 45, 65, 90] },
    dip: { label: 'מקבילים (Dips)', unit: 'חזרות', m: [8, 18, 30, 45], f: [3, 8, 18, 30] },
    plank: { label: 'פלאנק', unit: 'שנ׳', m: [45, 90, 150, 240], f: [40, 80, 140, 220] }
  };
  function ageBand(a) { return a < 30 ? 1 : a < 45 ? 0.92 : a < 60 ? 0.82 : 0.7; } // scale targets by age
  function ScreenStrength() {
    const p = S.profile, g = p.gender === 'f' ? 'f' : 'm', k = ageBand(p.age || 30);
    const tiers = ['מתחיל', 'בינוני', 'מתקדם', 'אלית'];
    const rows = Object.entries(STANDARDS).map(([id, s]) => {
      const targets = s[g].map((v) => Math.round(v * k));
      const best = (S.prs[id] && S.prs[id].best) || 0;
      let tier = -1; targets.forEach((tg, i) => { if (best >= tg) tier = i; });
      const pct = Math.min(100, Math.round((best / targets[3]) * 100));
      return `<div class="card"><div class="between"><span class="ex-name">${s.label}</span><span class="pill ${tier >= 2 ? 'accent' : ''}">${tier >= 0 ? tiers[tier] : 'טרם נמדד'}</span></div>
        <div class="mtrack" style="margin:8px 0"><div class="mfill p" style="width:${pct}%"></div></div>
        <div class="ex-meta">השיא שלך: <b style="color:var(--text)">${best} ${s.unit}</b> · יעדים: ${targets.join(' · ')}</div></div>`;
    }).join('');
    return wrap('🏅 ' + t('strength'), `<p class="muted" style="margin:0 0 12px">היכן אתה עומד מול נורמות מקובלות (מותאם לגיל ${p.age} ולמין). מספרים ייחוס — לא אבחון.</p>${rows}
      <p class="muted center" style="font-size:12px;margin-top:8px">השיאים מתעדכנים אוטומטית כשאתה שובר שיא באימון.</p>`);
  }

  // --- Body measurements + progress photo compare ---
  function ScreenMeasure() {
    const list = (S.measurements || []).slice().sort((a, b) => a.date < b.date ? 1 : -1);
    const last = list[0], prev = list[1];
    const fld = (id, lab, unit) => `<label class="fld">${lab}<input class="input" id="m-${id}" type="number" inputmode="decimal" placeholder="${unit}"></label>`;
    const delta = (k) => { if (!last || !prev || last[k] == null || prev[k] == null) return ''; const d = (last[k] - prev[k]).toFixed(1); return `<span class="pill ${d <= 0 ? 'accent' : ''}" style="font-size:11px">${d > 0 ? '+' : ''}${d}</span>`; };
    const photos = (typeof loadPhotos === 'function') ? loadPhotos() : [];
    const compare = photos.length >= 2 ? `<div class="section-title">השוואת לפני / אחרי 📸</div>
      <div class="ba-grid">
        <figure class="ba"><img src="${photos[0].dataUrl}" alt="לפני"><figcaption>לפני · ${photos[0].date}</figcaption></figure>
        <figure class="ba"><img src="${photos[photos.length - 1].dataUrl}" alt="אחרי"><figcaption>אחרי · ${photos[photos.length - 1].date}</figcaption></figure>
      </div>` :
      `<p class="muted center" style="font-size:12px;padding:10px">הוסף תמונות התקדמות (במסך ההתקדמות) כדי לראות השוואת לפני/אחרי.</p>`;
    return wrap('📏 ' + t('measure'), `
      <div class="card">
        <div class="row3">${fld('weight', 'משקל', 'ק״ג')}${fld('waist', 'מותן', 'ס״מ')}${fld('chest', 'חזה', 'ס״מ')}</div>
        <div class="row3" style="margin-top:8px">${fld('arm', 'זרוע', 'ס״מ')}${fld('thigh', 'ירך', 'ס״מ')}${fld('hips', 'אגן', 'ס״מ')}</div>
        <button class="btn" style="margin-top:12px" data-fx="m-save">💾 ${t('save')} (${t('today')})</button>
      </div>
      ${last ? `<div class="section-title">אחרון · ${last.date}</div><div class="card"><div class="mrow">
        ${['weight', 'waist', 'chest', 'arm', 'thigh', 'hips'].map((k) => last[k] != null ? `<div class="mcell"><div class="mk">${{ weight: 'משקל', waist: 'מותן', chest: 'חזה', arm: 'זרוע', thigh: 'ירך', hips: 'אגן' }[k]}</div><div class="mv">${last[k]} ${delta(k)}</div></div>` : '').join('')}
      </div></div>` : ''}
      ${compare}`);
  }

  // --- Steps ---
  function ScreenSteps() {
    const c = S.steps[today()] || 0, goal = S.stepGoal, pct = Math.min(100, Math.round(c / goal * 100));
    const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().slice(0, 10); return { ds, v: S.steps[ds] || 0 }; }).reverse();
    const mx = Math.max(goal, ...last7.map((x) => x.v));
    return wrap('👟 ' + t('steps'), `
      <div class="card center"><div class="h-xl" style="color:var(--accent)">${c.toLocaleString()}</div><div class="muted">מתוך ${goal.toLocaleString()} · ${pct}%</div>
        <div class="mtrack" style="margin:10px 0"><div class="mfill" style="width:${pct}%"></div></div>
        <div class="row2"><input class="input" id="st-add" type="number" inputmode="numeric" placeholder="הוסף צעדים"><button class="btn sm" data-fx="steps-add">＋</button></div>
      </div>
      <div class="section-title">7 ימים אחרונים</div>
      <div class="card"><div class="bars">${last7.map((x) => `<div class="bar"><div class="bfill" style="height:${Math.round(x.v / mx * 100)}%"></div><span class="bl">${x.ds.slice(8)}</span></div>`).join('')}</div></div>
      <button class="btn ghost" data-fx="steps-goal">🎯 שנה יעד</button>
      <p class="muted center" style="font-size:12px;margin-top:8px">סנכרון אוטומטי מ-Apple Health / Google Fit דורש אפליקציה נייטיב — בשלב הזה מזינים ידנית.</p>`);
  }

  // --- Weekly summary ---
  function ScreenWeekly() {
    const wk = (d) => { const x = new Date(); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); };
    const from = wk(7);
    const workouts = S.workoutsLog.filter((w) => w.date >= from);
    const kcalDays = Object.entries(S.nutrition).filter(([d]) => d >= from);
    const waterDays = Object.entries(S.water || {}).filter(([d]) => d >= from);
    const steps7 = Object.entries(S.steps || {}).filter(([d]) => d >= from).reduce((a, [, v]) => a + v, 0);
    const prsWk = Object.values(S.prs).filter((p) => p.date >= from).length;
    const rows = [
      ['🔥 אימונים', workouts.length], ['📈 רצף נוכחי', S.streak + ' ימים'], ['🏆 שיאים חדשים', prsWk],
      ['🍎 ימים שתועדה תזונה', kcalDays.length], ['💧 ימים עם מים', waterDays.length], ['👟 צעדים', steps7.toLocaleString()]
    ];
    const msg = workouts.length >= (S.profile.days || 3) ? 'עמדת ביעד השבועי — כל הכבוד! 🎉' : `עוד ${(S.profile.days || 3) - workouts.length} אימונים ליעד השבועי 💪`;
    return wrap('📊 ' + t('weekly'), `<div class="card center" style="border-color:var(--accent)"><p style="color:var(--text);font-size:15px;margin:0">${msg}</p></div>
      <div class="card">${rows.map(([l, v], i) => `<div class="between" style="padding:9px 0;${i ? 'border-top:1px solid var(--line)' : ''}"><span class="muted">${l}</span><span class="ex-name">${v}</span></div>`).join('')}</div>
      <button class="btn ghost" data-fx="share-week">📤 שתף סיכום</button>`);
  }

  // --- Coach: why this plan + sample week ---
  function ScreenCoach() {
    const p = S.profile;
    const goals = goalList(p).map((id) => GOALS.find((g) => g.id === id)?.label).filter(Boolean).join(' + ');
    const rx = prescription(primaryTrainingGoal(p), p.level);
    const week = [];
    for (let i = 0; i < (p.days || 3); i++) { const s = buildSession(p, i, S.exState); week.push({ name: s.name, moves: s.main.map((m) => m.name) }); }
    return wrap('🎓 ' + t('coach'), `
      <div class="card"><div class="ex-name" style="margin-bottom:6px">התוכנית נבנתה עבורך כך:</div>
        <p class="muted" style="font-size:14px;line-height:1.7;color:var(--text)">
        🎯 <b>מטרות:</b> ${goals} — לכן קבענו ${rx.sets} סטים, ${rx.rep || rx.rpe}, ומנוחה ${fmtRest(rx.rest)}.<br>
        📊 <b>רמה:</b> ${['', 'מתחיל', 'בינוני', 'מתקדם'][p.level]} — בחרנו את הווריאציה הקשה ביותר שאתה שולט בה, ומעלים אוטומטית כשמתרגלים.<br>
        📅 <b>תדירות:</b> ${p.days} ימים — פיצול שמאזן דחיפה/משיכה/רגליים לכל הגוף.<br>
        ${(p.injuries && p.injuries.length) ? `🩹 <b>התאמות:</b> הוצאנו תרגילים שעלולים להעמיס על ${p.injuries.map((i) => INJURIES.find((x) => x.id === i)?.label).join(', ')}.<br>` : ''}
        🔄 <b>התאוששות:</b> כל אימון רביעי מופחת (deload) למניעת שחיקה.</p></div>
      <div class="section-title">שבוע לדוגמה</div>
      ${week.map((d, i) => `<div class="card"><div class="ex-name" style="margin-bottom:4px">אימון ${i + 1} · ${esc(d.name)}</div><div class="ex-meta">${d.moves.join(' · ')}</div></div>`).join('')}`);
  }

  // --- Reminders ---
  function ScreenReminders() {
    const r = S.reminder;
    return wrap('🔔 ' + t('reminders'), `
      <div class="card"><div class="between" style="padding:6px 0"><span>תזכורת אימון יומית</span><button class="react-btn" data-fx="rem-toggle">${r.on ? 'פעיל' : 'כבוי'}</button></div>
      <label class="fld" style="margin-top:10px">שעה<input class="input" id="rem-hour" type="number" min="0" max="23" value="${r.hour}"></label>
      <button class="btn ghost sm" style="margin-top:10px" data-fx="rem-save">💾 ${t('save')}</button></div>
      <p class="muted" style="font-size:12px">התראות עובדות כשהאפליקציה מותקנת. באייפון התמיכה מוגבלת — נשלח תזכורת כשנפתחת האפליקציה בסמוך לשעה שבחרת.</p>`);
  }

  // --- Language picker ---
  function ScreenLang() {
    const langs = [['he', '🇮🇱 עברית'], ['en', '🇬🇧 English'], ['ar', '🇸🇦 العربية'], ['ru', '🇷🇺 Русский']];
    return wrap('🌍 ' + t('language'), `<div class="card">${langs.map((l) => `<button class="ex-item" data-fx="set-lang" data-l="${l[0]}" style="width:100%;background:none;border:none;font-family:inherit;text-align:start"><div class="grow"><div class="ex-name">${l[1]}</div></div>${S.lang === l[0] ? '<span class="pill accent">✓</span>' : ''}</button>`).join('')}</div>
      <p class="muted" style="font-size:12px">כרגע מתורגמים מסכי הכלים. אנגלית מלאה; ערבית ורוסית משלימות לאנגלית במקום שחסר. תרגום מלא של כל האפליקציה — בהמשך.</p>`);
  }

  // --- Data export ---
  function ScreenExport() {
    return wrap('📤 ' + t('exportData'), `<div class="card"><p class="muted" style="font-size:13px;margin:2px 0 12px">ייצא את הנתונים שלך לגיליון (CSV) או הוסף את האימונים ליומן שלך (.ics).</p>
      <button class="btn ghost" data-fx="export-csv">⬇ ייצוא ל-CSV (אימונים, שקילות, מדידות)</button>
      <div class="spacer"></div>
      <button class="btn ghost" data-fx="export-ics">📅 ייצוא אימונים ליומן (.ics)</button></div>`);
  }

  // ======================================================
  //  ACTIONS (delegated)
  // ======================================================
  const FX = {
    'nav': (t2) => go(t2.dataset.to),
    'nav-ex': (t2) => { exerciseReturn = route.name; go('exercise', { id: t2.dataset.id }); },
    'toggle-voice': () => { S.voice = !S.voice; save(); if (S.voice) speak('מאמן קולי מופעל'); render(); },

    // builder
    'b-add': (t2) => { builderSel.push(t2.dataset.id); render(); },
    'b-remove': (t2) => { builderSel.splice(+t2.dataset.i, 1); render(); },
    'fav': (t2) => { const id = t2.dataset.id; const i = S.favorites.indexOf(id); if (i >= 0) S.favorites.splice(i, 1); else S.favorites.push(id); save(); render(); },
    'b-start': () => { if (!builderSel.length) return toast('בחר לפחות תרגיל אחד'); window.startSession(window.buildCustomSession(builderSel.slice())); },
    'b-save': () => { if (!builderSel.length) return toast('בחר תרגילים'); const name = prompt('שם לאימון:', 'האימון שלי'); if (!name) return; S.customWorkouts.push({ id: 'c' + Date.now(), name, ids: builderSel.slice() }); save(); toast('נשמר ✓'); render(); },
    'b-run': (t2) => { const w = S.customWorkouts[+t2.dataset.i]; if (w) window.startSession(window.buildCustomSession(w.ids.slice(), w.name)); },
    'b-del': (t2) => { S.customWorkouts.splice(+t2.dataset.i, 1); save(); render(); },

    // readiness
    'ready-set': (t2) => {
      const d = today(); const r = S.readiness[d] || {}; r[t2.dataset.k] = +t2.dataset.v;
      if (r.sleep && r.energy && r.soreness) r.score = r.sleep + r.energy + r.soreness;
      S.readiness[d] = r; save(); render();
    },
    'go-workout': () => go('workouts'),
    'go-quick': () => { if (typeof startQuickWorkout === 'function') startQuickWorkout(); },

    // timers
    'timer-start': (t2) => startTimer(t2.dataset.kind),
    'rest-start': () => startRestFlow(),

    // measurements
    'm-save': () => {
      const rec = { date: today() };
      ['weight', 'waist', 'chest', 'arm', 'thigh', 'hips'].forEach((k) => { const v = num('m-' + k); if (v != null) rec[k] = v; });
      if (Object.keys(rec).length === 1) return toast('הזן לפחות מדד אחד');
      S.measurements = (S.measurements || []).filter((m) => m.date !== rec.date); S.measurements.push(rec);
      if (rec.weight) { S.weights = S.weights || []; S.weights.push({ date: rec.date, kg: rec.weight }); }
      save(); toast('נשמר ✓'); render();
    },

    // steps
    'steps-add': () => { const v = num('st-add'); if (!v) return; S.steps[today()] = (S.steps[today()] || 0) + Math.round(v); save(); render(); },
    'steps-goal': () => { const g = prompt('יעד צעדים יומי:', S.stepGoal); const n = parseInt(g, 10); if (n > 0) { S.stepGoal = n; save(); render(); } },

    // reminders
    'rem-toggle': () => { S.reminder.on = !S.reminder.on; save(); if (S.reminder.on) requestReminders(); render(); },
    'rem-save': () => { const h = num('rem-hour'); if (h != null) S.reminder.hour = Math.max(0, Math.min(23, Math.round(h))); save(); toast('נשמר ✓'); if (S.reminder.on) requestReminders(); },

    // language
    'set-lang': (t2) => { S.lang = t2.dataset.l; save(); document.documentElement.dir = (S.lang === 'ar' || S.lang === 'he') ? 'rtl' : 'ltr'; render(); },

    // export
    'export-csv': () => exportCSV(),
    'export-ics': () => exportICS(),
    'share-week': () => { if (typeof shareReport === 'function') shareReport(); }
  };

  document.addEventListener('click', (ev) => {
    const t2 = ev.target.closest('[data-fx]');
    if (!t2) return;
    const fn = FX[t2.dataset.fx];
    if (fn) { ev.preventDefault(); ev.stopPropagation(); try { fn(t2, ev); } catch (e) { console.error('fx', t2.dataset.fx, e); } }
  });
  // live inputs (search, compare slider)
  document.addEventListener('input', (ev) => {
    const t2 = ev.target.closest('[data-fx-input]');
    if (!t2) return;
    const kind = t2.dataset.fxInput;
    if (kind === 'builder-search') { route.params = { ...route.params, q: t2.value }; const list = document.querySelector('#b-q'); /* re-render preserving focus */ debouncedBuilder(t2.value); }
    else if (kind === 'cmp-slide') { const b = document.querySelector('.cmp-b'); if (b) b.style.width = t2.value + '%'; }
  });
  let _bt; function debouncedBuilder(q) { clearTimeout(_bt); _bt = setTimeout(() => { route.params = { q }; render(); const i = document.getElementById('b-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); }

  // ---------- interval timer engine ----------
  let timerState = null;
  function timerConfig(kind) {
    if (kind === 'tabata') return { work: 20, rest: 10, rounds: 8, prep: 5, label: 'Tabata' };
    if (kind === 'emom') return { work: 60, rest: 0, rounds: 10, prep: 5, label: 'EMOM' };
    if (kind === 'amrap') return { work: 600, rest: 0, rounds: 1, prep: 5, label: 'AMRAP' };
    if (kind === 'circuit') return { work: 40, rest: 20, rounds: 5, prep: 5, label: 'מעגל' };
    return { work: num('t-work') || 30, rest: num('t-rest') || 15, rounds: num('t-rounds') || 8, prep: num('t-prep') || 5, label: 'טיימר' };
  }
  function startTimer(kind) {
    const cfg = timerConfig(kind);
    timerState = { cfg, round: 1, phase: 'prep', left: cfg.prep };
    runTimer();
  }
  function runTimer() {
    const stage = document.getElementById('timer-stage'); if (!stage) return;
    if (timerState.timer) clearInterval(timerState.timer);
    const tick = () => {
      const ts = timerState, cfg = ts.cfg;
      renderTimer();
      if (ts.left <= 0) {
        if (ts.phase === 'prep') { ts.phase = 'work'; ts.left = cfg.work; if (typeof beep === 'function') beep(880); speak('התחל'); }
        else if (ts.phase === 'work') {
          if (cfg.rest > 0 && ts.round < cfg.rounds + 1) { ts.phase = 'rest'; ts.left = cfg.rest; if (typeof beep === 'function') beep(440); speak('מנוחה'); }
          else { ts.round++; if (ts.round > cfg.rounds) return finishTimer(); ts.left = cfg.work; if (typeof beep === 'function') beep(880); speak('סבב ' + ts.round); }
        } else if (ts.phase === 'rest') { ts.round++; if (ts.round > cfg.rounds) return finishTimer(); ts.phase = 'work'; ts.left = cfg.work; if (typeof beep === 'function') beep(880); speak('סבב ' + ts.round); }
        renderTimer();
      }
      ts.left--;
    };
    timerState.timer = setInterval(tick, 1000);
    tick();
  }
  function renderTimer() {
    const stage = document.getElementById('timer-stage'); if (!stage || !timerState) return;
    const ts = timerState, cfg = ts.cfg;
    const ph = ts.phase === 'prep' ? 'הכנה' : ts.phase === 'work' ? 'עבודה 💪' : 'מנוחה 🌬️';
    stage.innerHTML = `<div class="card center timer-live ${ts.phase}">
      <div class="muted">${cfg.label} · סבב ${Math.min(ts.round, cfg.rounds)}/${cfg.rounds}</div>
      <div class="timer-big">${Math.max(0, ts.left)}</div>
      <div class="ex-name">${ph}</div>
      <button class="btn ghost sm" style="margin-top:12px" data-fx="timer-stop">■ עצור</button></div>`;
  }
  function finishTimer() { if (timerState && timerState.timer) clearInterval(timerState.timer); timerState = null; if (typeof confetti === 'function') confetti(); speak('סיימת, כל הכבוד'); const stage = document.getElementById('timer-stage'); if (stage) stage.innerHTML = `<div class="card center" style="border-color:var(--accent)"><div class="h-lg">סיימת! 🎉</div></div>`; }
  FX['timer-stop'] = () => { if (timerState && timerState.timer) clearInterval(timerState.timer); timerState = null; const stage = document.getElementById('timer-stage'); if (stage) stage.innerHTML = ''; };

  // rest-day guided flow → sequential timed steps
  function startRestFlow() {
    const flow = [...WARMUPS, ...COOLDOWNS].filter((x) => x.sec).slice(0, 8);
    let idx = 0;
    const stage = document.getElementById('timer-stage'); if (!stage) return;
    const step = () => {
      if (idx >= flow.length) { stage.innerHTML = `<div class="card center" style="border-color:var(--accent)"><div class="h-lg">מעולה! התאוששת 🧘</div></div>`; if (typeof confetti === 'function') confetti(); speak('סיימת'); return; }
      const x = flow[idx]; let left = x.sec;
      speak(x.name);
      const draw = () => { stage.innerHTML = `<div class="card center rest-live"><div class="muted">${idx + 1}/${flow.length}</div><div class="ex-name" style="font-size:20px;margin:6px 0">${x.emoji} ${x.name}</div><div class="timer-big">${left}</div><div class="muted">${x.note || ''}</div><button class="btn ghost sm" style="margin-top:10px" data-fx="rest-skip">דלג ›</button></div>`; };
      draw();
      restTimer = setInterval(() => { left--; if (left <= 0) { clearInterval(restTimer); if (typeof beep === 'function') beep(660); idx++; step(); } else draw(); }, 1000);
    };
    FX['rest-skip'] = () => { clearInterval(restTimer); idx++; step(); };
    step();
  }
  let restTimer = null;

  // ---------- reminders ----------
  function requestReminders() { try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch {} }
  function checkReminder() {
    try {
      const r = S.reminder; if (!r || !r.on) return;
      const now = new Date(); const d = today();
      if (now.getHours() >= r.hour && r.last !== d && S.lastWorkout !== d) {
        r.last = d; save();
        if ('Notification' in window && Notification.permission === 'granted') new Notification('KIN 💪', { body: 'זמן לאימון היומי שלך!' });
        else toast('⏰ זמן לאימון היומי שלך!');
      }
    } catch {}
  }
  setInterval(checkReminder, 60000); setTimeout(checkReminder, 3000);

  // ---------- CSV / ICS ----------
  function download(name, text, mime) {
    try { const b = new Blob([text], { type: mime }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); } catch {}
  }
  function exportCSV() {
    let csv = 'type,date,detail\n';
    S.workoutsLog.forEach((w) => { csv += `workout,${w.date},"${(w.name || '').replace(/"/g, '')}"\n`; });
    (S.weights || []).forEach((w) => { csv += `weight,${w.date},${w.kg}\n`; });
    (S.measurements || []).forEach((m) => { csv += `measure,${m.date},"${['waist', 'chest', 'arm', 'thigh', 'hips'].map((k) => m[k] != null ? k + '=' + m[k] : '').filter(Boolean).join(' ')}"\n`; });
    download(`kin-data-${today()}.csv`, csv, 'text/csv');
    toast('CSV ירד ✓');
  }
  function exportICS() {
    const p = S.profile; const days = p.days || 3;
    // schedule the next `days` workouts on upcoming non-consecutive-ish days
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//KIN//HE\n';
    const base = new Date(); const picks = days >= 5 ? [1, 2, 3, 4, 5] : days === 4 ? [1, 2, 4, 5] : [1, 3, 5];
    picks.forEach((off, i) => {
      const d = new Date(base); d.setDate(d.getDate() + off);
      const ds = d.toISOString().slice(0, 10).replace(/-/g, '');
      ics += `BEGIN:VEVENT\nUID:kin-${ds}-${i}@kin\nDTSTART;VALUE=DATE:${ds}\nSUMMARY:אימון KIN 💪\nDESCRIPTION:האימון היומי שלך\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';
    download('kin-workouts.ics', ics, 'text/calendar');
    toast('יומן ירד ✓');
  }

  // ======================================================
  //  REGISTER
  // ======================================================
  window.FEATURE_SCREENS = {
    tools: ScreenTools, builder: ScreenBuilder, favorites: ScreenFavorites, timers: ScreenTimers,
    readiness: ScreenReadiness, restday: ScreenRestDay, strength: ScreenStrength, measure: ScreenMeasure,
    steps: ScreenSteps, weekly: ScreenWeekly, coach: ScreenCoach, reminders: ScreenReminders,
    language: ScreenLang, exportdata: ScreenExport
  };
  window.FEATURE_ROUTES = Object.keys(window.FEATURE_SCREENS);

  // apply saved language direction on boot
  try { document.documentElement.dir = (S.lang === 'ar' || S.lang === 'he') ? 'rtl' : 'ltr'; } catch {}
})();
