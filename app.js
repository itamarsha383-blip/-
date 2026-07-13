/* ============================================================
   KIN — application logic (vanilla JS SPA, no build step)
   State lives in localStorage so the app works fully offline.
   ============================================================ */

const KEY = 'kin_state_v1';
const todayStr = () => new Date().toISOString().slice(0, 10);

const DEFAULT_STATE = {
  profile: null,               // set after onboarding
  weights: [],                 // [{date, kg}]
  nutrition: {},               // { 'YYYY-MM-DD': [{name,kcal,p,c,f}] }
  workoutsLog: [],             // [{date, name, exercises}]
  streak: 0,
  lastWorkout: null,
  onboardStep: 0,
  draft: {}                    // onboarding in progress
};

let S = load();
let route = { name: S.profile ? 'home' : 'onboard', params: {} };
let active = null;             // active-workout runtime state

function load() {
  try { return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return structuredClone(DEFAULT_STATE); }
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
function go(name, params = {}) { route = { name, params }; window.scrollTo(0, 0); render(); }

// ---------- helpers ----------
const el = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}
function initials(name) { return (name || 'א').trim().slice(0, 1); }

// Animated SVG movement demonstrations, keyed by movement pattern.
// Honest stand-in for filmed video: real motion, offline, no assets.
function demoSVG(pattern) {
  const type = {
    horiz_push: 'push', vert_push: 'push',
    horiz_pull: 'pull', vert_pull: 'pull',
    squat: 'squat', hinge: 'hinge', core: 'core', cardio: 'cardio'
  }[pattern] || 'core';
  const S = {
    push: `<svg class="anim push" viewBox="0 0 200 150">
      <line class="ground" x1="20" y1="128" x2="180" y2="128"/>
      <g class="body">
        <circle class="head" cx="152" cy="78" r="12"/>
        <line x1="142" y1="86" x2="62" y2="96"/>
        <line x1="62" y1="96" x2="38" y2="120"/>
      </g>
      <line x1="140" y1="86" x2="140" y2="126"/>
    </svg>`,
    pull: `<svg class="anim pull" viewBox="0 0 200 150">
      <line class="ground" x1="34" y1="26" x2="166" y2="26"/>
      <g class="body">
        <line x1="82" y1="30" x2="88" y2="72"/>
        <line x1="118" y1="30" x2="112" y2="72"/>
        <circle class="head" cx="100" cy="82" r="12"/>
        <line x1="100" y1="94" x2="100" y2="120"/>
        <line x1="100" y1="120" x2="86" y2="140"/>
        <line x1="100" y1="120" x2="114" y2="140"/>
      </g>
    </svg>`,
    squat: `<svg class="anim squat" viewBox="0 0 200 150">
      <line class="ground" x1="30" y1="140" x2="170" y2="140"/>
      <g class="body">
        <circle class="head" cx="100" cy="34" r="12"/>
        <line x1="100" y1="46" x2="100" y2="86"/>
        <line x1="78" y1="66" x2="122" y2="66"/>
        <line x1="100" y1="86" x2="80" y2="140"/>
        <line x1="100" y1="86" x2="120" y2="140"/>
      </g>
    </svg>`,
    hinge: `<svg class="anim hinge" viewBox="0 0 200 150">
      <line class="ground" x1="20" y1="130" x2="180" y2="130"/>
      <circle class="head" cx="158" cy="118" r="10"/>
      <polygon class="bridge lift" points="55,130 150,130 105,86"/>
      <line x1="55" y1="130" x2="45" y2="130"/>
    </svg>`,
    core: `<svg class="anim core" viewBox="0 0 200 150">
      <line class="ground" x1="20" y1="122" x2="180" y2="122"/>
      <g class="body">
        <circle class="head" cx="158" cy="86" r="11"/>
        <line x1="148" y1="92" x2="58" y2="100"/>
        <line x1="58" y1="100" x2="38" y2="122"/>
        <line x1="150" y1="92" x2="150" y2="122"/>
        <line x1="150" y1="122" x2="128" y2="122"/>
      </g>
    </svg>`,
    cardio: `<svg class="anim cardio" viewBox="0 0 200 150">
      <line class="ground" x1="30" y1="140" x2="170" y2="140"/>
      <g class="body">
        <circle class="head" cx="100" cy="36" r="12"/>
        <line x1="100" y1="48" x2="100" y2="92"/>
        <line x1="100" y1="60" x2="128" y2="74"/>
        <line x1="100" y1="60" x2="74" y2="70"/>
        <line x1="100" y1="92" x2="86" y2="120"/>
        <line x1="100" y1="92" x2="116" y2="118"/>
      </g>
      <circle class="head footA" cx="86" cy="128" r="6"/>
      <circle class="head footB" cx="116" cy="126" r="6"/>
    </svg>`
  };
  return S[type];
}

// Coach-style nutrition targets live in data.js (nutritionPlan).
function macroTargets(p) { return nutritionPlan(p); }
// Today's session rotates through the weekly split (progressive, not repetitive).
function todaysSession() { return buildSession(S.profile, S.workoutsLog.length); }
function fmtRest(sec) {
  if (sec < 120) return `${sec} שנ׳`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}:${String(s).padStart(2, '0')} דק׳` : `${m} דק׳`;
}

function streakBump() {
  const t = todayStr();
  if (S.lastWorkout === t) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  S.streak = S.lastWorkout === y ? S.streak + 1 : 1;
  S.lastWorkout = t;
}

/* ============================================================
   ROUTER
   ============================================================ */
function render() {
  const app = el('app');
  const showNav = S.profile && ['home', 'workouts', 'library', 'progress', 'nutrition', 'family', 'exercise', 'profile'].includes(route.name);
  let html = '';
  switch (route.name) {
    case 'onboard': html = ScreenOnboard(); break;
    case 'home': html = ScreenHome(); break;
    case 'workouts': html = ScreenWorkouts(); break;
    case 'active': html = ScreenActive(); break;
    case 'library': html = ScreenLibrary(); break;
    case 'exercise': html = ScreenExercise(route.params.id); break;
    case 'progress': html = ScreenProgress(); break;
    case 'nutrition': html = ScreenNutrition(); break;
    case 'family': html = ScreenFamily(); break;
    case 'profile': html = ScreenProfile(); break;
    default: html = ScreenHome();
  }
  app.innerHTML = html + (showNav ? Nav() : '');
  bind();
}

function Nav() {
  const items = [
    ['home', '🏠', 'בית'],
    ['workouts', '🔥', 'אימון'],
    ['library', '📚', 'תרגילים'],
    ['nutrition', '🍎', 'תזונה'],
    ['family', '👨‍👩‍👧', 'משפחה']
  ];
  return `<div class="nav">${items.map(([r, ic, lab]) =>
    `<button data-nav="${r}" class="${route.name === r ? 'active' : ''}"><span class="ic">${ic}</span>${lab}</button>`
  ).join('')}</div>`;
}

/* ============================================================
   ONBOARDING
   ============================================================ */
function ScreenOnboard() {
  const step = S.onboardStep || 0;
  const d = S.draft || {};
  const steps = [
    // 0 — welcome
    `<div class="screen center" style="padding-top:14vh">
      <div style="font-size:66px">🏋️‍♂️</div>
      <div class="brand" style="margin:14px 0 6px">KI<b>N</b></div>
      <h1 class="h-xl">האימון של המשפחה<br>מתחיל כאן</h1>
      <p class="muted" style="margin:14px 0 26px">אימונים מותאמים אישית, מעקב אמיתי, ותחרות ידידותית — כולם ביחד.</p>
      <button class="btn" data-next>יאללה, בואו נתחיל</button>
    </div>`,
    // 1 — name
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">איך קוראים לך?</h2>
      <p class="muted" style="margin:6px 0 20px">כדי שנדע איך לפנות אליך ולהציג אותך בטבלה המשפחתית.</p>
      <div class="field"><input class="input" id="f-name" placeholder="השם שלך" value="${esc(d.name || '')}"></div>
      <button class="btn" data-save-name>המשך</button>
    </div>`,
    // 2 — age/gender
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">קצת עליך</h2>
      <p class="muted" style="margin:6px 0 20px">זה מה שיאפשר להתאים לך אימון ותזונה מדויקים — לא גנריים.</p>
      <div class="field"><label>גיל</label><input class="input" id="f-age" type="number" inputmode="numeric" placeholder="לדוגמה 32" value="${d.age || ''}"></div>
      <div class="field"><label>מין</label>
        <div class="chips">
          <button class="chip ${d.gender === 'm' ? 'sel' : ''}" data-g="m"><div class="t">👨 גבר</div></button>
          <button class="chip ${d.gender === 'f' ? 'sel' : ''}" data-g="f"><div class="t">👩 אישה</div></button>
        </div>
      </div>
      <div class="row2">
        <div class="field"><label>משקל (ק״ג)</label><input class="input" id="f-weight" type="number" inputmode="decimal" placeholder="70" value="${d.weight || ''}"></div>
        <div class="field"><label>גובה (ס״מ)</label><input class="input" id="f-height" type="number" inputmode="numeric" placeholder="175" value="${d.height || ''}"></div>
      </div>
      <button class="btn" data-save-body>המשך</button>
    </div>`,
    // 3 — level
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">מה הרמה שלך?</h2>
      <p class="muted" style="margin:6px 0 20px">נתחיל בדיוק מהמקום הנכון בשבילך.</p>
      <div class="chips" style="flex-direction:column">
        ${LEVELS.map((l) => `<button class="chip ${d.level === l.id ? 'sel' : ''}" data-level="${l.id}" style="flex:1 1 100%">
          <div class="t">${l.label}</div><div class="s">${l.desc}</div></button>`).join('')}
      </div>
      <div class="spacer"></div>
      <button class="btn" data-next-level>המשך</button>
    </div>`,
    // 4 — goal
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">מה המטרה?</h2>
      <p class="muted" style="margin:6px 0 20px">התוכנית והתזונה ייבנו סביב זה.</p>
      <div class="chips">
        ${GOALS.map((g) => `<button class="chip ${d.goal === g.id ? 'sel' : ''}" data-goal="${g.id}">
          <div class="emoji">${g.emoji}</div><div class="t">${g.label}</div></button>`).join('')}
      </div>
      <div class="spacer"></div>
      <button class="btn" data-next-goal>המשך</button>
    </div>`,
    // 5 — equipment
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">מה יש לך בבית?</h2>
      <p class="muted" style="margin:6px 0 20px">נתאים את התרגילים לציוד שזמין לך.</p>
      <div class="chips">
        ${EQUIP.map((e) => `<button class="chip ${d.equip === e.id ? 'sel' : ''}" data-equip="${e.id}">
          <div class="emoji">${e.emoji}</div><div class="t">${e.label}</div></button>`).join('')}
      </div>
      <div class="spacer"></div>
      <button class="btn" data-finish>בונים לי תוכנית 🚀</button>
    </div>`
  ];
  return steps[step] || steps[0];
}

/* ============================================================
   HOME
   ============================================================ */
function ScreenHome() {
  const p = S.profile;
  const sess = todaysSession();
  const mt = macroTargets(p);
  const eatenToday = (S.nutrition[todayStr()] || []).reduce((a, f) => a + f.kcal, 0);
  const lastW = S.weights.length ? S.weights[S.weights.length - 1].kg : p.weight;
  return `<div class="screen">
    <div class="top">
      <div class="brand">KI<b>N</b></div>
      <div class="avatar" data-nav="profile">${esc(initials(p.name))}</div>
    </div>

    <div class="hero">
      <span class="pill accent">🔥 רצף ${S.streak} ${S.streak === 1 ? 'יום' : 'ימים'}</span>
      <h1 class="h-xl" style="margin:14px 0 4px">${greet()}, ${esc(p.name)}</h1>
      <p class="muted">היום: <b style="color:var(--text)">${sess.name}</b> · חימום + ${sess.main.length} תרגילים · כ־${estMinutes(sess)} דק׳</p>
      <div class="spacer"></div>
      <button class="btn" data-start-workout>התחל אימון היום ›</button>
    </div>

    <div class="stats">
      <div class="stat"><div class="num accent">${S.workoutsLog.length}</div><div class="lab">אימונים סה״כ</div></div>
      <div class="stat"><div class="num">${lastW}<span style="font-size:13px"> ק״ג</span></div><div class="lab">משקל נוכחי</div></div>
      <div class="stat"><div class="num">${eatenToday}</div><div class="lab">/ ${mt.kcal} קל׳</div></div>
    </div>

    <div class="section-title">האימון שנבנה עבורך · ${sess.splitLabel}</div>
    <div class="card">
      ${sess.main.map((e) => `<div class="ex-item" data-ex="${e.id}">
        <div class="ex-emoji">${e.emoji}</div>
        <div class="grow"><div class="ex-name">${e.name}</div><div class="ex-meta">${e.sets} × ${e.reps} · מנוחה ${fmtRest(e.rest)}</div></div>
        <span class="badge l${e.level}">${['','קל','בינוני','מתקדם'][e.level]}</span>
      </div>`).join('')}
    </div>

    <div class="section-title">המשפחה השבוע</div>
    <div class="card" data-nav="family">
      ${familyRanked().slice(0, 3).map((m, i) => `<div class="lb-row ${m.you ? 'you' : ''}">
        <div class="lb-rank">${['🥇','🥈','🥉'][i] || i + 1}</div>
        <div class="avatar" style="width:32px;height:32px;font-size:13px">${esc(initials(m.name))}</div>
        <div class="lb-name">${esc(m.name)}</div>
        <div class="lb-metric">🔥 ${m.streak} · ${m.workouts} אימונים</div>
      </div>`).join('')}
    </div>
  </div>`;
}
function greet() { const h = new Date().getHours(); return h < 12 ? 'בוקר טוב' : h < 18 ? 'צהריים טובים' : 'ערב טוב'; }
function estMinutes(sess) {
  const warm = sess.warmup.length * 0.7;
  const cool = sess.cooldown.length * 0.7;
  const work = sess.main.reduce((a, e) => a + e.sets * (0.6 + e.rest / 60), 0);
  return Math.max(12, Math.round(warm + cool + work));
}

/* ============================================================
   WORKOUTS (today's plan preview → start)
   ============================================================ */
function ScreenWorkouts() {
  const p = S.profile;
  const sess = todaysSession();
  return `<div class="screen">
    <div class="between" style="margin-bottom:6px"><h2 class="h-lg">${sess.name}</h2><span class="pill">${GOALS.find(g=>g.id===p.goal)?.emoji||''} ${GOALS.find(g=>g.id===p.goal)?.label||''}</span></div>
    <p class="muted" style="margin:0 0 4px">${sess.splitLabel} · ${sess.days} אימונים בשבוע · כ־${estMinutes(sess)} דק׳</p>
    <p class="muted" style="margin:0 0 16px;font-size:13px">📋 ${sess.goalStyle} · ${sess.rx.sets} סטים · מנוחה ${fmtRest(sess.rx.rest)} · ${sess.rx.rpe}</p>

    <div class="section-title">🔥 חימום (${sess.warmup.length} תרגילים)</div>
    <div class="card">
      ${sess.warmup.map((wu) => `<div class="ex-item">
        <div class="ex-emoji">${wu.emoji}</div>
        <div class="grow"><div class="ex-name">${wu.name}</div><div class="ex-meta">${wu.sec} שנ׳ · ${wu.note}</div></div>
      </div>`).join('')}
    </div>

    <div class="section-title">💪 האימון עצמו</div>
    <div class="card">
      ${sess.main.map((e) => `<div class="ex-item" data-ex="${e.id}">
        <div class="ex-emoji">${e.emoji}</div>
        <div class="grow"><div class="ex-name">${e.name}</div>
          <div class="ex-meta">${e.sets} × ${e.reps} · מנוחה ${fmtRest(e.rest)} · טמפו ${e.tempo}</div>
          <div class="ex-meta" style="color:var(--muted)">${e.muscles.primary.join(', ')}</div></div>
        <span class="badge l${e.level}">›</span>
      </div>`).join('')}
    </div>

    <div class="section-title">🧘 שחרור ומתיחות</div>
    <div class="card">
      ${sess.cooldown.map((cd) => `<div class="ex-item">
        <div class="ex-emoji">${cd.emoji}</div>
        <div class="grow"><div class="ex-name">${cd.name}</div><div class="ex-meta">${cd.sec} שנ׳ · ${cd.note}</div></div>
      </div>`).join('')}
    </div>

    <button class="btn" data-start-workout>התחל אימון 🔥</button>
    <div class="spacer"></div>
    <button class="btn ghost" data-nav="library">עיין בכל התרגילים</button>
  </div>`;
}

/* ============================================================
   ACTIVE WORKOUT
   ============================================================ */
function startWorkout() {
  const sess = todaysSession();
  active = { sess, phase: 'warmup', wi: 0, ci: 0, i: 0, set: 0, resting: false, restLeft: 0, timer: null };
  go('active');
}
function ScreenActive() {
  if (!active) { go('workouts'); return ''; }
  const s = active.sess;

  // ----- WARM-UP phase -----
  if (active.phase === 'warmup') {
    const wu = s.warmup[active.wi];
    const pct = Math.round((active.wi / s.warmup.length) * 100);
    return `<div class="screen aw-wrap">
      <div class="between"><button class="back" data-quit-workout>✕ יציאה</button><span class="pill">🔥 חימום ${active.wi + 1}/${s.warmup.length}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="demo"><span class="fig">${wu.emoji}</span><span class="tag">הכנת הגוף לאימון</span></div>
      <h2 class="h-lg">${esc(wu.name)}</h2>
      <div class="h-xl" style="margin:10px 0 2px">${wu.sec} שנ׳</div>
      <p class="muted">${esc(wu.note)}</p>
      <div class="spacer"></div>
      <button class="btn" data-warm-next>סיימתי ✓</button>
    </div>`;
  }

  // ----- COOLDOWN phase -----
  if (active.phase === 'cooldown') {
    const cd = s.cooldown[active.ci];
    const pct = Math.round((active.ci / s.cooldown.length) * 100);
    return `<div class="screen aw-wrap">
      <div class="between"><button class="back" data-quit-workout>✕ יציאה</button><span class="pill">🧘 שחרור ${active.ci + 1}/${s.cooldown.length}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="demo"><span class="fig">${cd.emoji}</span><span class="tag">שחרור ומתיחה</span></div>
      <h2 class="h-lg">${esc(cd.name)}</h2>
      <div class="h-xl" style="margin:10px 0 2px">${cd.sec} שנ׳</div>
      <p class="muted">${esc(cd.note)}</p>
      <div class="spacer"></div>
      <button class="btn" data-cool-next>סיימתי ✓</button>
    </div>`;
  }

  // ----- MAIN phase -----
  const e = s.main[active.i];
  const totalSets = e.sets;
  const overallDone = s.main.slice(0, active.i).reduce((a, x) => a + x.sets, 0) + active.set;
  const overallTotal = s.main.reduce((a, x) => a + x.sets, 0);
  const pct = Math.round((overallDone / overallTotal) * 100);

  if (active.resting) {
    return `<div class="screen aw-wrap">
      <p class="muted" style="margin-top:8vh">מנוחה</p>
      <div class="timer">${active.restLeft}</div>
      <p class="muted">הבא: ${esc(e.name)} · סט ${active.set + 1}/${totalSets}</p>
      <p class="muted" style="font-size:13px;margin-top:6px">💡 ${esc(e.cues[0])}</p>
      <div class="spacer"></div>
      <button class="btn" data-skip-rest>דלג על המנוחה ›</button>
    </div>`;
  }
  return `<div class="screen aw-wrap">
    <div class="between"><button class="back" data-quit-workout>✕ יציאה</button><span class="pill">💪 ${active.i + 1}/${s.main.length}</span></div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="demo">${demoSVG(e.pattern)}<span class="tag">הדגמת תנועה · טמפו ${e.tempo}</span></div>
    <h2 class="h-lg">${esc(e.name)}</h2>
    <p class="muted" style="margin:6px 0 2px">${e.muscles.primary.join(' · ')}</p>
    <div class="setdots">
      ${Array.from({ length: totalSets }).map((_, i) =>
        `<div class="setdot ${i < active.set ? 'done' : i === active.set ? 'cur' : ''}">${i + 1}</div>`).join('')}
    </div>
    <div class="h-xl" style="margin:6px 0">${e.reps}</div>
    <p class="muted">סט ${active.set + 1}/${totalSets} · מנוחה ${fmtRest(e.rest)} · ${e.rpe}</p>
    <div class="spacer"></div>
    <button class="btn" data-complete-set>סיימתי את הסט ✓</button>
    <div class="spacer"></div>
    <button class="btn ghost" data-ex="${e.id}">איך עושים? טכניקה וטעויות</button>
  </div>`;
}
function warmNext() {
  active.wi++;
  if (active.wi >= active.sess.warmup.length) { active.phase = 'main'; }
  render();
}
function coolNext() {
  active.ci++;
  if (active.ci >= active.sess.cooldown.length) return finishWorkout();
  render();
}
function completeSet() {
  const e = active.sess.main[active.i];
  active.set++;
  const lastExercise = active.i >= active.sess.main.length - 1;
  if (active.set >= e.sets) {
    active.set = 0; active.i++;
    if (active.i >= active.sess.main.length) { active.phase = 'cooldown'; return render(); }
  }
  // prescribed rest between sets
  active.resting = true; active.restLeft = e.rest;
  render();
  active.timer = setInterval(() => {
    active.restLeft--;
    if (active.restLeft <= 0) { clearInterval(active.timer); active.resting = false; render(); }
    else { const t = document.querySelector('.timer'); if (t) t.textContent = active.restLeft; }
  }, 1000);
}
function finishWorkout() {
  if (active?.timer) clearInterval(active.timer);
  S.workoutsLog.push({ date: todayStr(), name: active.sess.name, exercises: active.sess.main.map((e) => e.id) });
  streakBump(); save();
  active = null;
  go('home');
  setTimeout(() => toast('כל הכבוד! אימון הושלם 🔥'), 250);
}

/* ============================================================
   LIBRARY + EXERCISE DETAIL
   ============================================================ */
function ScreenLibrary() {
  const types = [['all','הכל'],['push','דחיפה'],['pull','משיכה'],['squat','רגליים'],['core','ליבה'],['cardio','קרדיו']];
  const grp = { push: ['horiz_push','vert_push'], pull: ['horiz_pull','vert_pull'], squat: ['squat','hinge'], core: ['core'], cardio: ['cardio'] };
  const filter = route.params.filter || 'all';
  const list = EXERCISES.filter((e) => filter === 'all' || (grp[filter] || []).includes(e.pattern));
  return `<div class="screen">
    <h2 class="h-lg" style="margin-bottom:12px">ספריית התרגילים</h2>
    <div class="chips" style="margin-bottom:14px">
      ${types.map(([t, lab]) => `<button class="chip ${filter === t ? 'sel' : ''}" data-filter="${t}" style="flex:0 0 auto;padding:8px 14px"><div class="t">${lab}</div></button>`).join('')}
    </div>
    <div class="card">
      ${list.map((e) => `<div class="ex-item" data-ex="${e.id}">
        <div class="ex-emoji">${e.emoji}</div>
        <div class="grow"><div class="ex-name">${e.name}</div><div class="ex-meta">${e.muscles.primary.join(', ')}</div></div>
        <span class="badge l${e.level}">${['','קל','בינוני','מתקדם'][e.level]}</span>
      </div>`).join('')}
    </div>
  </div>`;
}
function ScreenExercise(id) {
  const e = EXERCISES.find((x) => x.id === id);
  if (!e) { go('library'); return ''; }
  const curLevel = S.profile?.level || 1;
  return `<div class="screen">
    <button class="back" data-back>›  חזרה</button>
    <div class="demo">${demoSVG(e.pattern)}<span class="tag">הדגמת תנועה · טמפו ${e.tempo}</span></div>
    <h2 class="h-lg">${esc(e.name)}</h2>
    <div class="flex" style="margin:8px 0 4px;flex-wrap:wrap"><span class="badge l${e.level}">${['','מתחיל','בינוני','מתקדם'][e.level]}</span>
      ${e.muscles.primary.map((m) => `<span class="pill accent" style="font-size:11px">${m}</span>`).join('')}
      ${e.muscles.secondary.map((m) => `<span class="pill" style="font-size:11px">${m}</span>`).join('')}</div>

    <div class="card" style="margin-top:12px">
      <div class="between" style="padding:5px 0"><span class="muted">טמפו</span><span>${e.tempo} — ${esc(e.tempoNote)}</span></div>
      <div class="between" style="padding:5px 0;border-top:1px solid var(--line)"><span class="muted">נשימה</span><span>${esc(e.breathing)}</span></div>
    </div>

    <div class="section-title">נקודות מפתח (Cues) 🎯</div>
    <div class="card">${e.cues.map((c) => `<div class="flex" style="padding:5px 0"><span style="color:var(--accent)">✓</span><span>${esc(c)}</span></div>`).join('')}</div>

    <div class="section-title">איך מבצעים</div>
    <div class="card"><ol class="list-num">${e.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>

    <div class="section-title">טעויות נפוצות ותיקונן ⚠️</div>
    <div class="card">${e.mistakes.map((m) => `<div style="padding:8px 0;border-top:1px solid var(--line)">
      <div class="mistake">✕ <span>${esc(m.err)}</span></div>
      <div class="flex" style="color:var(--accent-2);font-size:13.5px;margin-top:2px"><span>➜</span><span>${esc(m.fix)}</span></div>
    </div>`).join('')}</div>

    <div class="section-title">סולם התקדמות (Progressions) 📈</div>
    <div class="card">
      ${e.progressions.map((pr) => `<div class="ex-item" style="cursor:default">
        <div class="ex-emoji" style="font-size:15px;background:${pr.level <= curLevel ? 'var(--card-2)' : 'transparent'}">${pr.level <= curLevel ? '✓' : '🔒'}</div>
        <div class="grow"><div class="ex-name" style="font-size:14.5px">${esc(pr.name)}</div></div>
        <span class="badge l${pr.level || 1}">${['בסיס','קל','בינוני','מתקדם'][pr.level] || 'מתקדם'}</span>
      </div>`).join('')}
      <p class="muted" style="font-size:12px;margin:8px 2px 0">💡 עלה שלב רק כשאתה שולט בטכניקה עם טווח מלא.</p>
    </div>
  </div>`;
}

/* ============================================================
   PROGRESS
   ============================================================ */
function ScreenProgress() {
  const pts = S.weights.slice(-12);
  return `<div class="screen">
    <h2 class="h-lg" style="margin-bottom:14px">ההתקדמות שלך</h2>
    <div class="stats">
      <div class="stat"><div class="num accent">${S.streak}</div><div class="lab">רצף ימים</div></div>
      <div class="stat"><div class="num">${S.workoutsLog.length}</div><div class="lab">אימונים</div></div>
      <div class="stat"><div class="num">${S.weights.length}</div><div class="lab">שקילות</div></div>
    </div>

    <div class="section-title">מעקב משקל</div>
    <div class="card">
      ${pts.length >= 2 ? weightChart(pts) : `<p class="muted center" style="padding:10px">הוסף שקילה כדי לראות גרף התקדמות</p>`}
      <div class="flex" style="margin-top:12px">
        <input class="input" id="w-input" type="number" inputmode="decimal" placeholder="משקל היום (ק״ג)">
        <button class="btn sm" data-add-weight>הוסף</button>
      </div>
    </div>

    <div class="section-title">היסטוריית אימונים</div>
    <div class="card">
      ${S.workoutsLog.length ? S.workoutsLog.slice().reverse().slice(0, 8).map((w) =>
        `<div class="ex-item"><div class="ex-emoji">✅</div><div class="grow"><div class="ex-name">${esc(w.name)}</div><div class="ex-meta">${w.exercises.length} תרגילים</div></div><span class="lb-metric">${w.date}</span></div>`
      ).join('') : `<p class="muted center" style="padding:10px">עוד לא הושלמו אימונים — האימון הראשון מחכה לך 💪</p>`}
    </div>
  </div>`;
}
function weightChart(pts) {
  const W = 320, H = 130, pad = 10;
  const min = Math.min(...pts.map((p) => p.kg)) - 1;
  const max = Math.max(...pts.map((p) => p.kg)) + 1;
  const x = (i) => pad + (i * (W - pad * 2)) / (pts.length - 1);
  const y = (v) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  const poly = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.kg).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <line class="grid" x1="0" y1="${H/2}" x2="${W}" y2="${H/2}"/>
    <polyline points="${poly}"/>
    ${pts.map((p, i) => `<circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(p.kg).toFixed(1)}" r="3.5"/>`).join('')}
  </svg>
  <div class="between muted" style="font-size:12px"><span>${pts[0].kg} ק״ג</span><span>עכשיו: ${pts[pts.length-1].kg} ק״ג</span></div>`;
}

/* ============================================================
   NUTRITION
   ============================================================ */
function ScreenNutrition() {
  const p = S.profile, mt = macroTargets(p);
  const today = S.nutrition[todayStr()] || [];
  const sum = today.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
  const q = (route.params.q || '').trim();
  const results = q ? FOODS.filter((f) => f.name.includes(q)).slice(0, 6) : [];
  const bar = (val, tgt, cls) => `<div class="macro"><div class="top"><span>${cls === 'p' ? 'חלבון' : cls === 'c' ? 'פחמימות' : 'שומן'}</span><span class="muted">${Math.round(val)} / ${tgt} ג׳</span></div><div class="mtrack"><div class="mfill ${cls}" style="width:${Math.min(100, (val / tgt) * 100)}%"></div></div></div>`;
  return `<div class="screen">
    <h2 class="h-lg" style="margin-bottom:12px">תזונה היום</h2>
    <div class="hero">
      <div class="between"><span class="muted">קלוריות</span><span class="pill accent">יעד ${mt.kcal}</span></div>
      <div class="h-xl" style="margin:8px 0 2px">${Math.round(sum.kcal)} <span style="font-size:16px" class="muted">/ ${mt.kcal} קל׳</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,(sum.kcal/mt.kcal)*100)}%"></div></div>
      <div style="margin-top:12px">
        ${bar(sum.p, mt.protein, 'p')}${bar(sum.c, mt.carbs, 'c')}${bar(sum.f, mt.fat, 'f')}
      </div>
      <div class="between" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)"><span class="muted">💧 יעד מים</span><span>${mt.water} ליטר ביום</span></div>
    </div>

    <div class="section-title">הוסף מזון</div>
    <div class="card">
      <input class="input" id="food-q" placeholder="חפש מזון (עוף, אורז, בננה...)" value="${esc(q)}">
      ${results.length ? results.map((f, i) => `<div class="ex-item" data-food="${i}">
        <div class="ex-emoji">🍽️</div><div class="grow"><div class="ex-name">${esc(f.name)}</div><div class="ex-meta">${f.kcal} קל׳ · ${f.p}ח/${f.c}פ/${f.f}ש · ${f.unit}</div></div><span class="badge">+</span></div>`).join('')
      : q ? `<p class="muted center" style="padding:8px">לא נמצא — נרחיב את המאגר עם API אמיתי בהמשך</p>` : ''}
    </div>

    ${today.length ? `<div class="section-title">מה אכלת היום</div><div class="card">
      ${today.map((f, i) => `<div class="ex-item"><div class="ex-emoji">•</div><div class="grow"><div class="ex-name">${esc(f.name)}</div><div class="ex-meta">${f.kcal} קל׳</div></div><button class="badge" data-del-food="${i}">מחק</button></div>`).join('')}
    </div>` : ''}
    <p class="muted center" style="font-size:11.5px;margin-top:14px;line-height:1.5">היעדים מחושבים לפי נוסחת Mifflin-St Jeor ורמת הפעילות שלך.<br>מידע כללי בלבד — לא ייעוץ תזונתי/רפואי. להתאמה אישית פנה לאיש מקצוע.</p>
  </div>`;
}

/* ============================================================
   FAMILY
   ============================================================ */
function familyRanked() {
  const you = { ...DEMO_FAMILY[0], workouts: S.workoutsLog.length, streak: S.streak, you: true };
  const list = [you, ...DEMO_FAMILY.filter((m) => !m.you)];
  return list.sort((a, b) => b.streak - a.streak || b.workouts - a.workouts);
}
function ScreenFamily() {
  const ranked = familyRanked();
  return `<div class="screen">
    <h2 class="h-lg" style="margin-bottom:4px">המשפחה 👨‍👩‍👧‍👦</h2>
    <p class="muted" style="margin:0 0 16px">מי מוביל השבוע? הרצף הכי ארוך מנצח.</p>

    <div class="hero">
      <div class="between"><span class="pill accent">🏆 אתגר השבוע</span><span class="muted">5 ימים</span></div>
      <h3 class="h-lg" style="margin:12px 0 4px">4 אימונים השבוע</h3>
      <p class="muted">מי שישלים — נכנס להגרלה המשפחתית 🎁</p>
    </div>

    <div class="section-title">טבלת ליגה</div>
    <div class="card">
      ${ranked.map((m, i) => `<div class="lb-row ${m.you ? 'you' : ''}">
        <div class="lb-rank">${['🥇','🥈','🥉'][i] || i + 1}</div>
        <div class="avatar" style="width:34px;height:34px;font-size:14px">${esc(initials(m.name))}</div>
        <div class="lb-name">${esc(m.name)}${m.you ? ' <span class="muted">(את/ה)</span>' : ''}</div>
        <div class="lb-metric">🔥 ${m.streak} · ${m.workouts} אימונים</div>
      </div>`).join('')}
    </div>

    <button class="btn violet" data-invite>הזמן בן משפחה 📲</button>
    <p class="muted center" style="font-size:12px;margin-top:10px">בגרסה הבאה: חשבונות אמיתיים, ריאקציות ועידוד הדדי.</p>
  </div>`;
}

/* ============================================================
   PROFILE
   ============================================================ */
function ScreenProfile() {
  const p = S.profile, mt = macroTargets(p);
  return `<div class="screen">
    <button class="back" data-nav="home">›  חזרה</button>
    <div class="center" style="margin:10px 0 20px">
      <div class="avatar" style="width:76px;height:76px;font-size:30px;margin:0 auto">${esc(initials(p.name))}</div>
      <h2 class="h-lg" style="margin-top:12px">${esc(p.name)}</h2>
      <p class="muted">${GOALS.find(g=>g.id===p.goal)?.label} · רמה ${['','מתחיל','בינוני','מתקדם'][p.level]}</p>
    </div>
    <div class="card">
      <div class="between" style="padding:8px 0"><span class="muted">גיל</span><span>${p.age}</span></div>
      <div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="muted">משקל / גובה</span><span>${p.weight} ק״ג · ${p.height} ס״מ</span></div>
      <div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="muted">ציוד</span><span>${EQUIP.find(e=>e.id===p.equip)?.label}</span></div>
      <div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="muted">יעד קלורי יומי</span><span>${mt.kcal} קל׳</span></div>
    </div>
    <button class="btn ghost" data-edit-profile>ערוך פרופיל מחדש</button>
    <div class="spacer"></div>
    <button class="btn ghost" data-reset style="color:var(--danger);border-color:var(--danger)">אפס הכל</button>
  </div>`;
}

/* ============================================================
   EVENT BINDING
   ============================================================ */
function bind() {
  // nav + generic navigation
  document.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => go(b.dataset.nav));
  document.querySelectorAll('[data-ex]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); go('exercise', { id: b.dataset.ex }); });
  const back = document.querySelector('[data-back]'); if (back) back.onclick = () => history.back ? go('library') : go('library');

  // ---- onboarding ----
  const d = S.draft;
  const nx = document.querySelector('[data-next]'); if (nx) nx.onclick = () => { S.onboardStep = 1; save(); render(); };
  const pv = document.querySelector('[data-prev]'); if (pv) pv.onclick = () => { S.onboardStep = Math.max(0, (S.onboardStep || 0) - 1); save(); render(); };
  const sn = document.querySelector('[data-save-name]'); if (sn) sn.onclick = () => {
    const v = el('f-name').value.trim(); if (!v) return toast('נשמח לדעת איך קוראים לך 🙂');
    d.name = v; S.onboardStep = 2; save(); render();
  };
  document.querySelectorAll('[data-g]').forEach((b) => b.onclick = () => {
    // Snapshot text inputs before re-render so typed values aren't lost.
    if (el('f-age')) d.age = +el('f-age').value || d.age || null;
    if (el('f-weight')) d.weight = +el('f-weight').value || d.weight || null;
    if (el('f-height')) d.height = +el('f-height').value || d.height || null;
    d.gender = b.dataset.g; save(); render();
  });
  const sb = document.querySelector('[data-save-body]'); if (sb) sb.onclick = () => {
    d.age = +el('f-age').value || null; d.weight = +el('f-weight').value || null; d.height = +el('f-height').value || null;
    if (!d.age || !d.weight || !d.height || !d.gender) return toast('מלא גיל, מין, משקל וגובה');
    S.onboardStep = 3; save(); render();
  };
  document.querySelectorAll('[data-level]').forEach((b) => b.onclick = () => { d.level = +b.dataset.level; save(); render(); });
  const nl = document.querySelector('[data-next-level]'); if (nl) nl.onclick = () => { if (!d.level) return toast('בחר רמה'); S.onboardStep = 4; save(); render(); };
  document.querySelectorAll('[data-goal]').forEach((b) => b.onclick = () => { d.goal = b.dataset.goal; save(); render(); });
  const ng = document.querySelector('[data-next-goal]'); if (ng) ng.onclick = () => { if (!d.goal) return toast('בחר מטרה'); S.onboardStep = 5; save(); render(); };
  document.querySelectorAll('[data-equip]').forEach((b) => b.onclick = () => { d.equip = b.dataset.equip; save(); render(); });
  const fin = document.querySelector('[data-finish]'); if (fin) fin.onclick = () => {
    if (!d.equip) return toast('בחר ציוד');
    S.profile = { ...d }; if (d.weight) S.weights = [{ date: todayStr(), kg: d.weight }]; S.draft = {}; save();
    go('home'); setTimeout(() => toast(`התוכנית של ${S.profile.name} מוכנה! 🚀`), 250);
  };

  // ---- workout ----
  document.querySelectorAll('[data-start-workout]').forEach((b) => b.onclick = startWorkout);
  const cs = document.querySelector('[data-complete-set]'); if (cs) cs.onclick = completeSet;
  const wn = document.querySelector('[data-warm-next]'); if (wn) wn.onclick = warmNext;
  const cn = document.querySelector('[data-cool-next]'); if (cn) cn.onclick = coolNext;
  const sr = document.querySelector('[data-skip-rest]'); if (sr) sr.onclick = () => { if (active.timer) clearInterval(active.timer); active.resting = false; render(); };
  const qw = document.querySelector('[data-quit-workout]'); if (qw) qw.onclick = () => { if (active?.timer) clearInterval(active.timer); active = null; go('workouts'); };

  // ---- library filter ----
  document.querySelectorAll('[data-filter]').forEach((b) => b.onclick = () => go('library', { filter: b.dataset.filter }));

  // ---- progress ----
  const aw = document.querySelector('[data-add-weight]'); if (aw) aw.onclick = () => {
    const v = +el('w-input').value; if (!v) return toast('הכנס משקל');
    S.weights.push({ date: todayStr(), kg: v }); save(); render(); toast('נשמר ✓');
  };

  // ---- nutrition ----
  const fq = el('food-q'); if (fq) {
    fq.oninput = () => { route.params.q = fq.value; const c = fq.selectionStart; render(); const n = el('food-q'); if (n) { n.focus(); try { n.setSelectionRange(c, c); } catch {} } };
  }
  document.querySelectorAll('[data-food]').forEach((b) => b.onclick = () => {
    const q = (route.params.q || '').trim();
    const results = FOODS.filter((f) => f.name.includes(q));
    const f = results[+b.dataset.food]; if (!f) return;
    const t = todayStr(); (S.nutrition[t] ||= []).push({ name: f.name, kcal: f.kcal, p: f.p, c: f.c, f: f.f });
    route.params.q = ''; save(); render(); toast(`${f.name} נוסף ✓`);
  });
  document.querySelectorAll('[data-del-food]').forEach((b) => b.onclick = () => {
    S.nutrition[todayStr()].splice(+b.dataset.delFood, 1); save(); render();
  });

  // ---- family ----
  const inv = document.querySelector('[data-invite]'); if (inv) inv.onclick = async () => {
    const url = location.href;
    if (navigator.share) { try { await navigator.share({ title: 'KIN', text: 'בוא נתאמן יחד ב-KIN 💪', url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); toast('הקישור הועתק — שלח למשפחה 📲'); } catch { toast(url); } }
  };

  // ---- profile ----
  const ep = document.querySelector('[data-edit-profile]'); if (ep) ep.onclick = () => { S.draft = { ...S.profile }; S.onboardStep = 1; save(); go('onboard'); };
  const rs = document.querySelector('[data-reset]'); if (rs) rs.onclick = () => {
    if (confirm('לאפס את כל הנתונים ולהתחיל מחדש?')) { localStorage.removeItem(KEY); S = load(); go('onboard'); }
  };
}

/* ============================================================
   BOOT
   ============================================================ */
render();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
