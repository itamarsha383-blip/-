/* ============================================================
   KIN — application logic (vanilla JS SPA, no build step)
   State lives in localStorage so the app works fully offline.
   ============================================================ */

const KEY = 'kin_state_v1';
const SCHEMA_VERSION = 3;
// Visible build stamp — bumped on each deploy so you can confirm at a glance
// (in Settings, bottom) that the live site really updated.
const APP_VERSION = '6.0 · 2026-07-26';
const todayStr = () => new Date().toISOString().slice(0, 10);

const DEFAULT_STATE = {
  profile: null,               // set after onboarding
  weights: [],                 // [{date, kg}]
  nutrition: {},               // { 'YYYY-MM-DD': [{name,kcal,p,c,f}] }
  workoutsLog: [],             // [{date, name, exercises}]
  streak: 0,
  lastWorkout: null,
  onboardStep: 0,
  draft: {},                   // onboarding in progress
  exState: {},                 // { exId: {adjust, easy, hard, best} } — adaptive engine
  badges: [],                  // unlocked achievement ids
  reactions: {},               // { memberName: count } — family kudos (local demo)
  recentFoods: [],             // recently logged food names (fast re-log)
  water: {},                   // { 'YYYY-MM-DD': ml }
  prs: {},                     // { exId: {best, date} } — personal records (max reps)
  repHistory: {},              // { exId: [{date, reps}] } — for strength trend
  startDate: null,             // first day (for deload cycle)
  goals: [],                   // personal goals: {type:'weight'|'reps', ...}
  challenges: {},              // { 'YYYY-MM-DD': true } daily challenge done
  mealTemplates: [],           // [{name, items:[...]}]
  maxStreak: 0,                // longest streak ever
  theme: 'dark',               // 'dark' | 'light'
  activeProgram: null,         // {id, start} — focused 30-day program
  sound: true,                 // audio cues on/off
  vibrate: true,               // haptics on/off
  version: 5
};

let S = load();
let route = { name: S.profile ? 'home' : 'onboard', params: {} };
let active = null;             // active-workout runtime state
let exerciseReturn = null;     // where to go 'back' from an exercise detail
// derived streak is recomputed from dates on boot (fixes stale/incorrect streaks)
setTimeout(() => { if (typeof refreshStreak === 'function') { refreshStreak(); } }, 0);

function load() {
  let raw;
  try { raw = { ...structuredClone(DEFAULT_STATE), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { raw = structuredClone(DEFAULT_STATE); }
  return migrate(raw);
}
// Forward-compatible migration: fills missing fields so old saves never break.
function migrate(s) {
  s.exState ||= {}; s.badges ||= []; s.reactions ||= {}; s.recentFoods ||= []; s.water ||= {};
  s.prs ||= {}; s.repHistory ||= {}; if (s.startDate === undefined) s.startDate = null; s.goals ||= [];
  s.challenges ||= {}; s.mealTemplates ||= []; s.maxStreak ||= 0; s.theme ||= 'dark'; if (s.activeProgram === undefined) s.activeProgram = null;
  if (s.sound === undefined) s.sound = true; if (s.vibrate === undefined) s.vibrate = true;
  if (s.profile && s.profile.injuries === undefined) s.profile.injuries = [];
  s.version = SCHEMA_VERSION;
  return s;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn('save failed', e); } }
const clampNum = (v, lo, hi) => { const n = +v; return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null; };
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

// audio + haptic cue (end of rest / end of a timed hold)
let _audio;
function beep(freq = 880, dur = 0.14) {
  if (S && S.sound === false) return;
  try {
    _audio = _audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = _audio.createOscillator(), g = _audio.createGain();
    o.frequency.value = freq; o.type = 'sine'; o.connect(g); g.connect(_audio.destination);
    g.gain.setValueAtTime(0.0001, _audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, _audio.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, _audio.currentTime + dur);
    o.start(); o.stop(_audio.currentTime + dur);
  } catch {}
}
function cue() { beep(); try { if (S.vibrate !== false && navigator.vibrate) navigator.vibrate(180); } catch {} }

// Shareable progress report image (canvas → share/download).
async function shareReport() {
  const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
  const ctx = cv.getContext('2d'); ctx.textAlign = 'center'; ctx.direction = 'rtl';
  const g = ctx.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, '#12181f'); g.addColorStop(1, '#0B0E11');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = '#C6FF3D'; ctx.font = '900 90px sans-serif'; ctx.fillText('KIN', 540, 150);
  ctx.fillStyle = '#EDF1F5'; ctx.font = 'bold 46px sans-serif'; ctx.fillText('דוח התקדמות · ' + (S.profile?.name || ''), 540, 240);
  const stats = [
    ['אימונים סה״כ', S.workoutsLog.length],
    ['רצף נוכחי', S.streak + ' ימים'],
    ['רצף שיא', (S.maxStreak || 0) + ' ימים'],
    ['שיאים אישיים', Object.keys(S.prs).length],
    ['שקילות', S.weights.length]
  ];
  let y = 400;
  stats.forEach(([lab, val]) => {
    ctx.fillStyle = '#151A21'; roundRect(ctx, 120, y, 840, 130, 24); ctx.fill();
    ctx.fillStyle = '#8A97A6'; ctx.font = '36px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(lab, 900, y + 82);
    ctx.fillStyle = '#C6FF3D'; ctx.font = 'bold 64px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(String(val), 180, y + 90);
    y += 158;
  });
  ctx.textAlign = 'center'; ctx.fillStyle = '#EDF1F5'; ctx.font = 'italic 38px sans-serif';
  wrapText(ctx, quoteOfDay(), 540, y + 40, 900, 50);
  try {
    const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
    const file = new File([blob], 'kin-report.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: 'ההתקדמות שלי ב-KIN 💪' });
    else { const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'kin-report.png'; a.click(); }
  } catch {}
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function wrapText(ctx, text, x, y, maxW, lh) { const words = text.split(' '); let line = ''; for (const w of words) { const t = line + w + ' '; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line.trim(), x, y); line = w + ' '; y += lh; } else line = t; } ctx.fillText(line.trim(), x, y); }
function tap(ms = 8) { try { if (S.vibrate !== false && navigator.vibrate) navigator.vibrate(ms); } catch {} }

// Celebratory confetti burst (workout complete, PR, badge).
function confetti() {
  try {
    const cv = document.createElement('canvas'); cv.id = 'confetti';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    const colors = ['#C6FF3D', '#7CFF6B', '#8B7CFF', '#FFD24A', '#FF7C6B', '#4aa8ff'];
    const parts = Array.from({ length: 130 }, (_, i) => ({
      x: W / 2 + (Math.random() * 2 - 1) * 40, y: H * 0.34,
      vx: (Math.random() * 2 - 1) * 7, vy: Math.random() * -9 - 3, g: 0.3,
      s: Math.random() * 6 + 4, c: colors[i % colors.length], rot: Math.random() * 6, vr: (Math.random() * 2 - 1) * 0.35
    }));
    const start = performance.now();
    const tick = (t) => {
      const el = t - start;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - el / 1700); ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx.restore();
      });
      if (el < 1700) requestAnimationFrame(tick); else cv.remove();
    };
    requestAnimationFrame(tick);
  } catch {}
}

// Apple-Fitness-style activity rings: Move (workout) · Fuel (calories) · Water.
function activityRings() {
  const p = S.profile, mt = macroTargets(p);
  const size = 132, c = size / 2, sw = 11;
  const trained = S.lastWorkout === todayStr() ? 1 : 0;
  const kcal = (S.nutrition[todayStr()] || []).reduce((a, f) => a + f.kcal, 0);
  const water = S.water[todayStr()] || 0;
  const rings = [
    { r: 52, color: '#C6FF3D', pct: trained },
    { r: 36, color: '#FFA23D', pct: Math.min(1, mt.kcal ? kcal / mt.kcal : 0) },
    { r: 20, color: '#4AA8FF', pct: Math.min(1, water / (mt.water * 1000)) }
  ];
  const arcs = rings.map((rg) => {
    const C = 2 * Math.PI * rg.r, off = C * (1 - rg.pct);
    return `<circle class="track" cx="${c}" cy="${c}" r="${rg.r}" stroke="${rg.color}" stroke-width="${sw}"/>
      <circle class="ring" cx="${c}" cy="${c}" r="${rg.r}" stroke="${rg.color}" stroke-width="${sw}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>`;
  }).join('');
  return `<div class="rings-wrap">
    <svg class="rings" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${arcs}
      <text x="${c}" y="${c + 6}" text-anchor="middle" class="rings-center" fill="#EDF1F5">🔥${S.streak}</text>
    </svg>
    <div class="ring-legend">
      <div class="rl"><span class="dot" style="background:#C6FF3D"></span>אימון<span class="rv">${trained ? 'הושלם ✓' : 'ממתין'}</span></div>
      <div class="rl"><span class="dot" style="background:#FFA23D"></span>תזונה<span class="rv">${Math.round(kcal)}/${mt.kcal}</span></div>
      <div class="rl"><span class="dot" style="background:#4AA8FF"></span>מים<span class="rv">${(water / 1000).toFixed(1)}/${mt.water}ל׳</span></div>
    </div>
  </div>`;
}

// Demonstration media: real photo (start↔end crossfade) when available,
// animated SVG / emoji fallback offline or if the image fails to load.
function photoDemo(id, fallbackHTML, tag) {
  const ph = PHOTOS[id];
  let inner;
  if (VIDEO_CLIPS.includes(id)) {
    // Primary: bundled short demo clip (works offline, correct form). Falls back
    // to photo/SVG if the video fails to load.
    // <source> order = priority: drop an AI-generated ./videos/<id>.mp4 in and it
    // automatically replaces the generated .webm clip — no code change needed.
    inner = `<div class="demo-media">
         <video class="pf-video" autoplay muted loop playsinline preload="auto"
           onerror="this.closest('.demo-media').classList.add('novideo')">
           <source src="./videos/${id}.mp4" type="video/mp4">
           <source src="./videos/${id}.webm" type="video/webm">
         </video>
         <div class="pf-fallback">${fallbackHTML}</div>
       </div>`;
  } else if (ph) {
    inner = `<div class="demo-photos">
         <img class="pf pf0" src="${PHOTO_BASE}${encodeURI(ph[0])}" alt="" loading="lazy" onload="this.closest('.demo-photos').classList.add('loaded')">
         <img class="pf pf1" src="${PHOTO_BASE}${encodeURI(ph[1])}" alt="" loading="lazy">
         <div class="pf-fallback">${fallbackHTML}</div>
       </div>`;
  } else {
    inner = fallbackHTML;
  }
  return `<div class="demo">${inner}<span class="tag">${tag}</span></div>`;
}

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

// weight units (stored internally in kg; displayed in the user's unit)
function wUnit() { return S.profile && S.profile.units === 'lb' ? 'lb' : 'ק״ג'; }
function toDisp(kg) { return S.profile && S.profile.units === 'lb' ? +(kg / 0.453592).toFixed(1) : +(+kg).toFixed(1); }
function fromDisp(v) { return S.profile && S.profile.units === 'lb' ? v * 0.453592 : v; }
// Every 4th week is a lighter deload week for recovery (real coaching practice).
function isDeload() {
  if (!S.startDate) return false;
  const weeks = Math.floor((Date.now() - new Date(S.startDate + 'T00:00:00').getTime()) / (7 * 864e5));
  return weeks > 0 && weeks % 4 === 3;
}
// Today's session rotates through the weekly split (progressive, not repetitive),
// with the adaptive engine (exState) feeding rep targets back in.
function activeProgram() { return S.activeProgram ? PROGRAMS.find((p) => p.id === S.activeProgram.id) : null; }
function programDay() {
  if (!S.activeProgram) return 0;
  return new Set(S.workoutsLog.filter((w) => w.date >= S.activeProgram.start).map((w) => w.date)).size;
}
function todaysSession() {
  const prog = activeProgram();
  const opts = prog ? { patterns: prog.session, name: `${prog.name} · יום ${Math.min(prog.days, programDay() + 1)}`, splitLabel: 'תוכנית ממוקדת' } : {};
  const sess = buildSession(S.profile, S.workoutsLog.length, S.exState, opts);
  if (isDeload()) {
    sess.deload = true;
    sess.main = sess.main.map((e) => ({ ...e, sets: Math.max(2, e.sets - 1) }));
  }
  return sess;
}

// ---------- achievements ----------
const BADGES = [
  { id: 'first', emoji: '🌱', name: 'הצעד הראשון', desc: 'השלמת אימון ראשון', test: () => S.workoutsLog.length >= 1 },
  { id: 'w5', emoji: '💪', name: 'נכנסים לכושר', desc: '5 אימונים', test: () => S.workoutsLog.length >= 5 },
  { id: 'w10', emoji: '🏆', name: 'מכור/ה', desc: '10 אימונים', test: () => S.workoutsLog.length >= 10 },
  { id: 's3', emoji: '🔥', name: 'רצף 3', desc: '3 ימים ברצף', test: () => S.streak >= 3 },
  { id: 's7', emoji: '⚡', name: 'שבוע מושלם', desc: 'רצף של 7 ימים', test: () => S.streak >= 7 },
  { id: 's14', emoji: '👑', name: 'בלתי ניתן לעצירה', desc: 'רצף שיא של 14 ימים', test: () => (S.maxStreak || 0) >= 14 },
  { id: 'level', emoji: '📈', name: 'מתקדמים', desc: 'עלית עומס בתרגיל', test: () => Object.values(S.exState).some((x) => (x.adjust || 0) >= 2) },
  { id: 'pr', emoji: '🏆', name: 'שובר שיאים', desc: 'קבעת שיא אישי', test: () => Object.keys(S.prs).length >= 1 },
  { id: 'log', emoji: '⚖️', name: 'עוקב/ת', desc: 'רשמת 3 שקילות', test: () => S.weights.length >= 3 },
  { id: 'eat', emoji: '🥗', name: 'תזונה בשליטה', desc: 'רשמת יום אכילה מלא', test: () => Object.values(S.nutrition).some((d) => d.length >= 3) }
];
function checkBadges() {
  const newly = [];
  for (const b of BADGES) {
    if (!S.badges.includes(b.id) && b.test()) { S.badges.push(b.id); newly.push(b); }
  }
  if (newly.length) { save(); confetti(); newly.forEach((b, i) => setTimeout(() => toast(`${b.emoji} הישג נפתח: ${b.name}!`), 400 + i * 1600)); }
  return newly;
}

// --- streak: derived from real workout dates, rest-day aware, 1-day grace ---
const DAYMS = 864e5;
const dayNum = (s) => Math.floor(new Date(s + 'T00:00:00').getTime() / DAYMS);
// A gap of up to 2 days (i.e. one rest/skip day) keeps the chain alive.
function computeStreak() {
  const days = [...new Set(S.workoutsLog.map((w) => w.date))].sort(); // asc
  if (!days.length) return 0;
  const today = Math.floor(Date.now() / DAYMS);
  const last = dayNum(days[days.length - 1]);
  if (today - last > 2) return 0;              // chain broken (missed >1 full day)
  let streak = 1;
  for (let i = days.length - 1; i > 0; i--) {
    if (dayNum(days[i]) - dayNum(days[i - 1]) <= 2) streak++; else break;
  }
  return streak;
}
// Recompute derived streak state (call on load + after every workout).
function refreshStreak() { S.streak = computeStreak(); S.lastWorkout = S.workoutsLog.length ? S.workoutsLog[S.workoutsLog.length - 1].date : null; S.maxStreak = Math.max(S.maxStreak || 0, S.streak); }
// Alive chain, but not trained yet today → nudge before it breaks.
function streakAtRisk() {
  if (!S.workoutsLog.length || S.lastWorkout === todayStr()) return false;
  return computeStreak() > 0;
}
function fmtRest(sec) {
  if (sec < 120) return `${sec} שנ׳`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}:${String(s).padStart(2, '0')} דק׳` : `${m} דק׳`;
}

/* ============================================================
   ROUTER
   ============================================================ */
function render() {
  document.body.classList.toggle('light', S.theme === 'light');
  const app = el('app');
  const showNav = S.profile && ['home', 'workouts', 'library', 'progress', 'nutrition', 'family', 'exercise', 'profile', 'privacy', 'cloud', 'settings', 'goals', 'programs'].includes(route.name) && route.name !== 'firstweek';
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
    case 'privacy': html = ScreenPrivacy(); break;
    case 'cloud': html = ScreenCloud(); break;
    case 'settings': html = ScreenSettings(); break;
    case 'goals': html = ScreenGoals(); break;
    case 'firstweek': html = ScreenFirstWeek(); break;
    case 'programs': html = ScreenPrograms(); break;
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
      <p class="muted" style="margin:14px 0 20px">אימונים מותאמים אישית, מעקב אמיתי, ותחרות ידידותית — כולם ביחד.</p>
      <button class="btn" data-next>יאללה, בואו נתחיל</button>
      <p class="muted" style="font-size:12px;margin-top:16px">🔒 המידע שלך נשמר במכשירך בלבד. אין מעקב, אין פרסומות.</p>
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
    // 3 — level (single choice → tap advances)
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">מה הרמה שלך?</h2>
      <p class="muted" style="margin:6px 0 20px">נתחיל בדיוק מהמקום הנכון בשבילך. (לחיצה ממשיכה)</p>
      <div class="chips" style="flex-direction:column">
        ${LEVELS.map((l) => `<button class="chip ${d.level === l.id ? 'sel' : ''}" data-level="${l.id}" style="flex:1 1 100%">
          <div class="t">${l.label}</div><div class="s">${l.desc}</div></button>`).join('')}
      </div>
    </div>`,
    // 4 — goals (MULTIPLE choice → keep continue)
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">מה המטרות שלך?</h2>
      <p class="muted" style="margin:6px 0 20px">אפשר לבחור כמה — התוכנית והתזונה יתאימו לשילוב.</p>
      <div class="chips">
        ${GOALS.map((g) => `<button class="chip ${(d.goals || []).includes(g.id) ? 'sel' : ''}" data-goal="${g.id}">
          <div class="emoji">${g.emoji}</div><div class="t">${g.label}</div></button>`).join('')}
      </div>
      <div class="spacer"></div>
      <button class="btn" data-next-goal>המשך</button>
    </div>`,
    // 5 — training days per week (single choice → tap advances)
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">כמה ימים בשבוע?</h2>
      <p class="muted" style="margin:6px 0 20px">זה קובע את מבנה התוכנית. (לחיצה ממשיכה)</p>
      <div class="chips" style="flex-direction:column">
        ${[3, 4, 5].map((n) => `<button class="chip ${d.days === n ? 'sel' : ''}" data-days="${n}" style="flex:1 1 100%">
          <div class="t">${n} ימים בשבוע</div>
          <div class="s">${n === 3 ? 'גוף מלא — מומלץ להתחלה' : n === 4 ? 'עליון / תחתון' : 'דחיפה / משיכה / רגליים'}</div></button>`).join('')}
      </div>
    </div>`,
    // 6 — injuries / limitations
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">יש מגבלות או כאבים?</h2>
      <p class="muted" style="margin:6px 0 20px">נחליף אוטומטית תרגילים שעלולים להעמיס. אפשר לבחור כמה.</p>
      <div class="chips">
        ${INJURIES.map((inj) => `<button class="chip ${(d.injuries || ['none']).includes(inj.id) ? 'sel' : ''}" data-injury="${inj.id}">
          <div class="emoji">${inj.emoji}</div><div class="t">${inj.label}</div></button>`).join('')}
      </div>
      <div class="spacer"></div>
      <button class="btn" data-next-injuries>המשך</button>
    </div>`,
    // 7 — equipment (single choice → tap builds the plan)
    `<div class="screen">
      <button class="back" data-prev>›  חזרה</button>
      <h2 class="h-lg">מה יש לך בבית?</h2>
      <p class="muted" style="margin:6px 0 20px">נתאים את התרגילים לציוד שזמין לך. (לחיצה בונה את התוכנית)</p>
      <div class="chips">
        ${EQUIP.map((e) => `<button class="chip ${d.equip === e.id ? 'sel' : ''}" data-equip="${e.id}">
          <div class="emoji">${e.emoji}</div><div class="t">${e.label}</div></button>`).join('')}
      </div>
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

    ${streakAtRisk() ? `<div class="nudge"><span class="ne">🔥</span><div class="grow"><b>הרצף שלך בסכנה!</b><div class="muted" style="font-size:13px">אימון קצר היום ישמור על ${S.streak} הימים שצברת.</div></div><button class="btn sm" data-quick-workout>10 דק׳</button></div>` : ''}
    ${sess.deload ? `<div class="nudge" style="background:linear-gradient(160deg,#141d2b,#0f1620);border-color:#28394d"><span class="ne">🌙</span><div class="grow"><b>שבוע דילואד</b><div class="muted" style="font-size:13px">עומס מופחת להתאוששות — ככה גדלים חזק יותר.</div></div></div>` : ''}

    <div class="hero">
      <h1 class="h-xl" style="margin-bottom:2px">${greet()}, ${esc(p.name)}</h1>
      <p class="muted" style="margin-bottom:16px">היום: <b style="color:var(--text)">${sess.name}</b> · ${sess.main.length} תרגילים · כ־${estMinutes(sess)} דק׳</p>
      ${activityRings()}
      <div class="spacer"></div>
      <button class="btn" data-start-workout>${S.lastWorkout === todayStr() ? 'אימון נוסף' : 'התחל אימון היום'} ›</button>
      <div class="spacer"></div>
      <button class="btn ghost" data-quick-workout>⚡ אימון מהיר · 10 דק׳</button>
    </div>

    <div class="card" style="text-align:center;font-style:italic;color:var(--text)"><span style="color:var(--accent);font-size:18px">❝</span> ${esc(quoteOfDay())} <span style="color:var(--accent);font-size:18px">❞</span></div>

    ${activeProgram() ? (() => { const a = activeProgram(); const day = Math.min(a.days, programDay()); const pct = Math.round((day / a.days) * 100); return `<div class="card" data-nav="programs" style="cursor:pointer"><div class="between" style="margin-bottom:8px"><span class="ex-name">${a.emoji} ${esc(a.name)}</span><span class="muted" style="font-size:13px">יום ${day}/${a.days}</span></div><div class="mtrack"><div class="mfill p" style="width:${pct}%"></div></div></div>`; })() : ''}

    <div class="between" style="margin:2px 2px 8px"><span class="section-title" style="margin:0">היעדים שלי 🎯</span><button class="react-btn" data-nav="goals">${S.goals.length ? 'ערוך ›' : 'הגדר יעד ›'}</button></div>
    <div class="card" data-nav="goals" style="cursor:pointer">
      ${S.goals.length ? S.goals.slice(0, 2).map((g) => { const gp = goalProgress(g); return `<div style="padding:6px 0"><div class="between" style="margin-bottom:5px;font-size:13px"><span>${gp.title}</span><span class="muted">${Math.round(gp.pct)}%</span></div><div class="mtrack"><div class="mfill p" style="width:${gp.pct}%"></div></div></div>`; }).join('') : `<p class="muted center" style="padding:6px;font-size:13px">הגדר יעד ותראה את ההתקדמות אליו כאן 🎯</p>`}
    </div>

    ${(() => { const ch = dailyChallenge(); const done = !!S.challenges[todayStr()]; return `<div class="section-title">אתגר יומי ${done ? '✅' : '🔥'}</div>
    <div class="card"><div class="between"><div class="flex"><span style="font-size:26px">${ch.emoji}</span><span class="ex-name" style="font-size:14px">${esc(ch.text)}</span></div>${done ? '<span class="pill accent">בוצע!</span>' : '<button class="btn sm" data-challenge-done>סיימתי</button>'}</div></div>`; })()}

    <div class="between" style="margin:2px 2px 8px"><span class="section-title" style="margin:0">הנתונים שלך</span><button class="react-btn" data-nav="progress">התקדמות והישגים ›</button></div>
    <div class="stats" data-nav="progress" style="cursor:pointer">
      <div class="stat"><div class="num accent">${S.workoutsLog.length}</div><div class="lab">אימונים סה״כ</div></div>
      <div class="stat"><div class="num">${toDisp(lastW)}<span style="font-size:13px"> ${wUnit()}</span></div><div class="lab">משקל נוכחי</div></div>
      <div class="stat"><div class="num">${S.badges.length}</div><div class="lab">הישגים</div></div>
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
function quoteOfDay() { return QUOTES[Math.floor(Date.now() / 864e5) % QUOTES.length]; }
function dailyChallenge() { return DAILY_CHALLENGES[Math.floor(Date.now() / 864e5) % DAILY_CHALLENGES.length]; }

// ---------- progress photos: PRIVATE, local-only, explicit share ----------
const PHOTOS_KEY = 'kin_photos';
let photoView = null;   // id of a photo open in the viewer
function loadPhotos() { try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]'); } catch { return []; } }
function savePhotos(a) { try { localStorage.setItem(PHOTOS_KEY, JSON.stringify(a)); return true; } catch { toast('אין מספיק מקום — מחק תמונה ישנה'); return false; } }
function addPhotoFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 720; let w = img.width, h = img.height;
      const scale = Math.min(1, max / Math.max(w, h)); w = Math.round(w * scale); h = Math.round(h * scale);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = cv.toDataURL('image/jpeg', 0.65);
      const arr = loadPhotos();
      arr.push({ id: 'p' + new Date().getTime(), date: todayStr(), dataUrl, shared: false });
      while (arr.length > 30) arr.shift();
      if (savePhotos(arr)) { render(); toast('נשמר פרטית 🔒'); }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
async function sharePhoto(id) {
  const arr = loadPhotos(); const ph = arr.find((x) => x.id === id); if (!ph) return;
  try {
    const blob = await (await fetch(ph.dataUrl)).blob();
    const file = new File([blob], 'kin-progress.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: 'ההתקדמות שלי ב-KIN 💪' });
      ph.shared = true; savePhotos(arr);
    } else {
      const a = document.createElement('a'); a.href = ph.dataUrl; a.download = 'kin-progress.jpg'; a.click();
    }
  } catch {}
}
function deletePhoto(id) { savePhotos(loadPhotos().filter((x) => x.id !== id)); photoView = null; render(); }
function randomQuote() { return QUOTES[Math.floor(Math.random() * QUOTES.length)]; }
function weekStrip() {
  const names = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  const trainMap = { 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5] };
  const days = S.profile.days || chooseSplit(S.profile).days || 3;
  const train = trainMap[days] || trainMap[3];
  const today = new Date().getDay();
  const doneDows = new Set(S.workoutsLog.filter((w) => (Date.now() - new Date(w.date)) / 864e5 < 7).map((w) => new Date(w.date).getDay()));
  return `<div class="week">${names.map((nm, i) => {
    const isTrain = train.includes(i), done = doneDows.has(i);
    return `<div class="wday ${i === today ? 'today' : ''} ${isTrain ? 'train' : 'rest'} ${done ? 'done' : ''}">
      <span class="wl">${nm}</span><span class="wd">${done ? '✓' : isTrain ? '💪' : '·'}</span></div>`;
  }).join('')}</div>`;
}
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
    <div class="between" style="margin-bottom:6px"><h2 class="h-lg">${sess.name}</h2><span class="pill">${goalList(p).map(id=>GOALS.find(g=>g.id===id)?.emoji||'').join('')} ${goalList(p).map(id=>GOALS.find(g=>g.id===id)?.label).filter(Boolean).join(' + ')}</span></div>
    <p class="muted" style="margin:0 0 4px">${sess.splitLabel} · ${sess.days} אימונים בשבוע · כ־${estMinutes(sess)} דק׳</p>
    <p class="muted" style="margin:0 0 14px;font-size:13px">📋 ${sess.goalStyle} · ${sess.rx.sets} סטים · מנוחה ${fmtRest(sess.rx.rest)} · ${sess.rx.rpe}</p>
    ${weekStrip()}

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
    <div class="row2">
      <button class="btn ghost" data-nav="programs">🎯 תוכניות</button>
      <button class="btn ghost" data-nav="library">📚 תרגילים</button>
    </div>
  </div>`;
}

/* ============================================================
   ACTIVE WORKOUT
   ============================================================ */
let wakeSentinel = null;
function requestWake() { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then((w) => { wakeSentinel = w; }).catch(() => {}); } catch {} }
function releaseWake() { try { if (wakeSentinel && wakeSentinel.release) wakeSentinel.release(); wakeSentinel = null; } catch {} }

function startWorkout() {
  const sess = todaysSession();
  active = { sess, phase: 'warmup', wi: 0, ci: 0, i: 0, set: 0, resting: false, restLeft: 0, timer: null, prsThisSession: [] };
  requestWake();
  go('active');
  startWarmTimer();
}
// Express ~10-minute session: fewer drills, 3 moves, one less set each.
function startQuickWorkout() {
  const full = todaysSession();
  const sess = {
    ...full, name: full.name + ' · מהיר ⚡',
    warmup: full.warmup.slice(0, 2),
    main: full.main.slice(0, 3).map((e) => ({ ...e, sets: Math.max(2, e.sets - 1), rest: Math.min(e.rest, 45) })),
    cooldown: full.cooldown.slice(0, 1)
  };
  active = { sess, phase: 'warmup', wi: 0, ci: 0, i: 0, set: 0, resting: false, restLeft: 0, timer: null, prsThisSession: [] };
  requestWake();
  go('active');
  startWarmTimer();
}
function ScreenActive() {
  if (!active) { go('workouts'); return ''; }
  const s = active.sess;

  // ----- SUMMARY phase -----
  if (active.phase === 'summary') return summaryScreen();

  // ----- WARM-UP phase -----
  if (active.phase === 'warmup') {
    const wu = s.warmup[active.wi];
    const pct = Math.round((active.wi / s.warmup.length) * 100);
    return `<div class="screen aw-wrap">
      <div class="between"><button class="back" data-quit-workout>✕ יציאה</button><span class="pill">🔥 חימום ${active.wi + 1}/${s.warmup.length}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      ${photoDemo(wu.id, `<span class="fig">${wu.emoji}</span>`, 'הכנת הגוף לאימון')}
      <h2 class="h-lg">${esc(wu.name)}</h2>
      <div class="timer" style="font-size:52px">${active.warmLeft != null ? active.warmLeft : wu.sec}</div>
      <p class="muted">${esc(wu.note)}</p>
      <div class="spacer"></div>
      <button class="btn" data-warm-next>דלג ›</button>
    </div>`;
  }

  // ----- COOLDOWN phase -----
  if (active.phase === 'cooldown') {
    const cd = s.cooldown[active.ci];
    const pct = Math.round((active.ci / s.cooldown.length) * 100);
    return `<div class="screen aw-wrap">
      <div class="between"><button class="back" data-quit-workout>✕ יציאה</button><span class="pill">🧘 שחרור ${active.ci + 1}/${s.cooldown.length}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      ${photoDemo(cd.id, `<span class="fig">${cd.emoji}</span>`, 'שחרור ומתיחה')}
      <h2 class="h-lg">${esc(cd.name)}</h2>
      <div class="timer" style="font-size:52px">${active.coolLeft != null ? active.coolLeft : cd.sec}</div>
      <p class="muted">${esc(cd.note)}</p>
      <div class="spacer"></div>
      <button class="btn" data-cool-next>דלג ›</button>
    </div>`;
  }

  // ----- adaptive feedback (after an exercise's last set) -----
  if (active.feedbackFor) {
    const fe = active.feedbackFor;
    return `<div class="screen aw-wrap">
      <p class="muted" style="margin-top:9vh">איך היה <b style="color:var(--text)">${esc(fe.name)}</b>?</p>
      <div class="demo" style="height:120px;margin-top:12px">${demoSVG(fe.pattern)}</div>
      <h2 class="h-lg" style="margin:6px 0 4px">המשוב מכוון את האימון הבא 🎯</h2>
      <p class="muted" style="margin-bottom:18px">כך האפליקציה לומדת בדיוק את הרמה שלך.</p>
      <div class="chips">
        <button class="chip" data-fb="easy"><div class="emoji">😎</div><div class="t">היה קל</div><div class="s">נעלה עומס</div></button>
        <button class="chip" data-fb="right"><div class="emoji">💪</div><div class="t">בול</div><div class="s">נשמור קצב</div></button>
        <button class="chip" data-fb="hard"><div class="emoji">🥵</div><div class="t">היה קשה</div><div class="s">נוריד מעט</div></button>
      </div>
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
      <p style="font-size:14px;margin-top:10px;font-style:italic;color:var(--accent)">${esc(active.restQuote || quoteOfDay())}</p>
      <div class="flex" style="justify-content:center;gap:12px;margin-top:16px">
        <button class="btn ghost sm" data-rest-sub>−15 שנ׳</button>
        <button class="btn ghost sm" data-rest-add>+15 שנ׳</button>
      </div>
      <div class="spacer"></div>
      <button class="btn" data-skip-rest>דלג על המנוחה ›</button>
    </div>`;
  }
  // timed exercise → live countdown for the hold itself
  if (active.working) {
    return `<div class="screen aw-wrap">
      <p class="muted" style="margin-top:8vh">${esc(e.name)} · סט ${active.set + 1}/${totalSets}</p>
      <div class="timer" style="color:var(--accent)">${active.workLeft}</div>
      <p class="muted">החזק! 💪 ${esc(e.cues[0])}</p>
      <div class="spacer"></div>
      <button class="btn ghost" data-stop-hold>עצור וסיים סט</button>
    </div>`;
  }
  const adjBadge = e.graduated ? ' <span class="pill accent" style="font-size:12px;vertical-align:middle">🎉 עלית שלב!</span>'
    : e.adjusted > 0 ? ' <span class="pill accent" style="font-size:12px;vertical-align:middle">⬆ הותאם אליך</span>'
    : e.adjusted < 0 ? ' <span class="pill" style="font-size:12px;vertical-align:middle">⬇ הותאם אליך</span>' : '';
  return `<div class="screen aw-wrap">
    <div class="between"><button class="back" data-quit-workout>✕ יציאה</button><span class="pill">💪 ${active.i + 1}/${s.main.length}</span></div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    ${photoDemo(e.id, demoSVG(e.pattern), `הדגמת תנועה · טמפו ${e.tempo}`)}
    <h2 class="h-lg">${esc(e.name)}</h2>
    <p class="muted" style="margin:6px 0 2px">${e.muscles.primary.join(' · ')}</p>
    <div class="setdots">
      ${Array.from({ length: totalSets }).map((_, i) =>
        `<div class="setdot ${i < active.set ? 'done' : i === active.set ? 'cur' : ''}">${i + 1}</div>`).join('')}
    </div>
    ${e.timed ? `
    <div class="h-xl" style="margin:6px 0">${e.reps}${adjBadge}</div>
    <p class="muted">סט ${active.set + 1}/${totalSets} · מנוחה ${fmtRest(e.rest)} · ${e.rpe}</p>
    <div class="spacer"></div>
    <button class="btn" data-start-hold>התחל טיימר (${e.holdSec} שנ׳) ▶</button>` : `
    <p class="muted" style="margin:6px 0 0">יעד: <b style="color:var(--text)">${e.reps}</b>${adjBadge} · סט ${active.set + 1}/${totalSets}</p>
    <div class="flex" style="justify-content:center;gap:16px;margin:12px 0 6px">
      <button class="setdot" data-rep-dec style="width:48px;height:48px;font-size:26px">−</button>
      <div style="min-width:96px"><div class="h-xl" style="margin:0">${active.repInput != null ? active.repInput : (e.repsTarget || 8)}</div><div class="muted" style="font-size:11px">חזרות שביצעת</div></div>
      <button class="setdot" data-rep-inc style="width:48px;height:48px;font-size:26px">＋</button>
    </div>
    <p class="muted" style="font-size:12.5px">מנוחה ${fmtRest(e.rest)} · ${e.rpe}${S.prs[e.id] ? ` · 🏆 שיא: ${S.prs[e.id].best}` : ''}</p>
    <div class="spacer"></div>
    <button class="btn" data-complete-set>סיימתי את הסט ✓</button>`}
    <div class="spacer"></div>
    <div class="row2">
      <button class="btn ghost" data-ex="${e.id}">טכניקה</button>
      <button class="btn ghost" data-swap-ex>🔄 החלף תרגיל</button>
    </div>
  </div>`;
}
function summaryScreen() {
  const s = active.sess;
  const totalSets = s.main.reduce((a, e) => a + e.sets, 0);
  const prs = active.prsThisSession || [];
  return `<div class="screen aw-wrap">
    <div style="font-size:56px;margin-top:6vh">🎉</div>
    <h1 class="h-xl" style="margin:8px 0 2px">אימון הושלם!</h1>
    <p class="muted" style="margin-bottom:18px">${esc(s.name)}</p>
    <div class="stats" style="margin-bottom:14px">
      <div class="stat"><div class="num accent">${s.main.length}</div><div class="lab">תרגילים</div></div>
      <div class="stat"><div class="num">${totalSets}</div><div class="lab">סטים</div></div>
      <div class="stat"><div class="num">${estMinutes(s)}</div><div class="lab">דקות</div></div>
    </div>
    ${prs.length ? `<div class="card"><div class="section-title" style="margin-top:0">שיאים חדשים 🏆</div>${prs.map((p) => `<div class="ex-item"><div class="ex-emoji">🏆</div><div class="grow"><div class="ex-name">${esc(p.name)}</div></div><span class="pill accent">${p.reps} חזרות</span></div>`).join('')}</div>` : ''}
    <p style="font-style:italic;color:var(--accent);margin:8px 0 4px">${esc(randomQuote())}</p>
    <div class="spacer"></div>
    <button class="btn" data-finish-summary>סיום 🔥</button>
  </div>`;
}
function startWarmTimer() {
  if (!active || active.phase !== 'warmup') return;
  if (active.timer) clearInterval(active.timer);
  active.warmLeft = active.sess.warmup[active.wi].sec;
  render();
  active.timer = setInterval(() => {
    active.warmLeft--;
    if (active.warmLeft <= 3 && active.warmLeft > 0) beep(1200, 0.07);
    if (active.warmLeft <= 0) { clearInterval(active.timer); cue(); warmNext(); }
    else { const t = document.querySelector('.timer'); if (t) t.textContent = active.warmLeft; }
  }, 1000);
}
function warmNext() {
  if (active.timer) clearInterval(active.timer);
  active.wi++;
  if (active.wi >= active.sess.warmup.length) { active.phase = 'main'; render(); }
  else startWarmTimer();
}
function startCoolTimer() {
  if (!active || active.phase !== 'cooldown') return;
  if (active.timer) clearInterval(active.timer);
  active.coolLeft = active.sess.cooldown[active.ci].sec;
  render();
  active.timer = setInterval(() => {
    active.coolLeft--;
    if (active.coolLeft <= 3 && active.coolLeft > 0) beep(1200, 0.07);
    if (active.coolLeft <= 0) { clearInterval(active.timer); cue(); coolNext(); }
    else { const t = document.querySelector('.timer'); if (t) t.textContent = active.coolLeft; }
  }, 1000);
}
function coolNext() {
  if (active.timer) clearInterval(active.timer);
  active.ci++;
  if (active.ci >= active.sess.cooldown.length) { active.phase = 'summary'; render(); }
  else startCoolTimer();
}
function startRest(sec) {
  active.resting = true; active.restLeft = sec; active.restQuote = randomQuote();
  render();
  active.timer = setInterval(() => {
    active.restLeft--;
    if (active.restLeft <= 3 && active.restLeft > 0) beep(1200, 0.07);
    if (active.restLeft <= 0) { clearInterval(active.timer); active.resting = false; cue(); render(); }
    else { const t = document.querySelector('.timer'); if (t) t.textContent = active.restLeft; }
  }, 1000);
}
// timed hold (plank etc.): counts down the work interval, then auto-completes the set.
function startHold() {
  const e = active.sess.main[active.i];
  active.working = true; active.workLeft = e.holdSec || 30;
  render();
  active.timer = setInterval(() => {
    active.workLeft--;
    if (active.workLeft <= 3 && active.workLeft > 0) beep(1200, 0.07);
    if (active.workLeft <= 0) { clearInterval(active.timer); active.working = false; cue(); completeSet(); }
    else { const t = document.querySelector('.timer'); if (t) t.textContent = active.workLeft; }
  }, 1000);
}
function stopHold() { if (active.timer) clearInterval(active.timer); active.working = false; completeSet(); }
function swapExercise() {
  const s = active.sess, cur = s.main[active.i], p = S.profile;
  const used = new Set(s.main.map((x) => x.id));
  const hasBar = p.equip === 'bar' || p.equip === 'weights';
  const avoid = new Set(); (p.injuries || []).forEach((id) => (INJURIES.find((x) => x.id === id)?.avoid || []).forEach((x) => avoid.add(x)));
  const cands = EXERCISES.filter((e) => e.pattern === cur.pattern && e.id !== cur.id && !used.has(e.id) && e.level <= p.level && (hasBar || (e.equip !== 'bar' && e.equip !== 'bars')) && !avoid.has(e.id));
  if (!cands.length) return toast('אין חלופה זמינה לתרגיל הזה');
  const ne = cands[Math.floor(Math.random() * cands.length)];
  s.main[active.i] = { ...ne, sets: cur.sets, reps: ne.timed ? `${cur.holdSec || 30} שנ׳` : cur.reps, repsTarget: ne.timed ? null : cur.repsTarget, holdSec: ne.timed ? (cur.holdSec || 30) : null, rest: cur.rest, rpe: cur.rpe, adjusted: 0, graduated: false, timed: ne.timed };
  active.set = 0; active.repInput = null; render(); toast('הוחלף ל' + ne.name);
}
function completeSet() {
  tap(12);
  const e = active.sess.main[active.i];
  // record reps + detect a personal record (non-timed exercises)
  if (!e.timed) {
    const reps = active.repInput != null ? active.repInput : (e.repsTarget || 0);
    active.sessionBest = Math.max(active.sessionBest || 0, reps);
    if (reps > (S.prs[e.id]?.best || 0)) { S.prs[e.id] = { best: reps, date: todayStr() }; active.gotPR = true; }
    active.repInput = null;
  }
  active.set++;
  if (active.set >= e.sets) {
    if (!e.timed && active.sessionBest) {
      (S.repHistory[e.id] ||= []).push({ date: todayStr(), reps: active.sessionBest });
      if (S.repHistory[e.id].length > 60) S.repHistory[e.id].shift();
    }
    save();
    if (active.gotPR) { (active.prsThisSession ||= []).push({ name: e.name, reps: S.prs[e.id].best }); confetti(); tap(30); setTimeout(() => toast(`🏆 שיא חדש ב${e.name}!`), 200); }
    active.gotPR = false; active.sessionBest = 0;
    if (active.timer) clearInterval(active.timer);
    active.resting = false;
    active.feedbackFor = e;
    return render();
  }
  startRest(e.rest);  // rest between sets
}
// Adaptive learning: the feedback nudges next session's load for THIS exercise.
function applyFeedback(kind) {
  const e = active.feedbackFor;
  const st = (S.exState[e.id] ||= { adjust: 0, easy: 0, hard: 0 });
  if (kind === 'easy') { st.easy = (st.easy || 0) + 1; st.adjust = Math.min(4, (st.adjust || 0) + 1); }
  else if (kind === 'hard') { st.hard = (st.hard || 0) + 1; st.adjust = Math.max(-2, (st.adjust || 0) - 1); }
  save();
  active.feedbackFor = null;
  active.set = 0; active.i++;
  if (active.i >= active.sess.main.length) { active.phase = 'cooldown'; active.ci = 0; startCoolTimer(); return; }
  startRest(active.sess.main[active.i].rest);  // rest before next exercise
}
function finishWorkout() {
  if (active?.timer) clearInterval(active.timer);
  releaseWake();
  S.workoutsLog.push({ date: todayStr(), name: active.sess.name, exercises: active.sess.main.map((e) => e.id) });
  refreshStreak(); S.maxStreak = Math.max(S.maxStreak || 0, S.streak); save();
  active = null;
  go('home');
  confetti(); tap(30);
  checkBadges();
  if (Cloud.enabled()) { Cloud.resetCache(); Cloud.syncSelf({ workouts: S.workoutsLog.length, streak: S.streak }).catch(() => {}); }
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
    ${photoDemo(e.id, demoSVG(e.pattern), `הדגמת תנועה · טמפו ${e.tempo}`)}
    <h2 class="h-lg">${esc(e.name)}</h2>
    <div class="flex" style="margin:8px 0 4px;flex-wrap:wrap"><span class="badge l${e.level}">${['','מתחיל','בינוני','מתקדם'][e.level]}</span>
      ${e.muscles.primary.map((m) => `<span class="pill accent" style="font-size:11px">${m}</span>`).join('')}
      ${e.muscles.secondary.map((m) => `<span class="pill" style="font-size:11px">${m}</span>`).join('')}</div>

    <div class="card" style="margin-top:12px">
      <div class="between" style="padding:5px 0"><span class="muted">טמפו</span><span>${e.tempo} — ${esc(e.tempoNote)}</span></div>
      <div class="between" style="padding:5px 0;border-top:1px solid var(--line)"><span class="muted">נשימה</span><span>${esc(e.breathing)}</span></div>
    </div>

    <div class="section-title">סרטון הדרכה 🎬</div>
    ${VIDEOS[e.id]
      ? `<div class="card" style="padding:0;overflow:hidden"><div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${VIDEOS[e.id]}?rel=0" title="${esc(e.name)}" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div>`
      : `<div class="card">
          <p class="muted" style="font-size:13px;margin:0 0 10px">סרטוני הדגמה מקצועיים עם טכניקה נכונה — נפתחים ב-YouTube.</p>
          <button class="btn" data-yt="${esc(e.name)}">▶ צפה בסרטון הדגמה</button>
        </div>`}

    ${S.prs[e.id] ? `<div class="section-title">השיא שלך 🏆</div>
    <div class="card">
      <div class="between"><span class="h-lg">${S.prs[e.id].best} <span style="font-size:14px" class="muted">חזרות</span></span><span class="muted" style="font-size:12px">${S.prs[e.id].date}</span></div>
      ${(S.repHistory[e.id] || []).length >= 2 ? repSparkline(S.repHistory[e.id]) : ''}
    </div>` : ''}

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
  const pv = photoView ? loadPhotos().find((x) => x.id === photoView) : null;
  return `<div class="screen">
    ${pv ? `<div class="photo-overlay" data-photo-close>
      <div style="text-align:center" onclick="event.stopPropagation()">
        <img src="${pv.dataUrl}" alt="">
        <div class="pacts">
          <button class="btn" data-photo-share="${pv.id}">שתף 📤</button>
          <button class="btn ghost" data-photo-del="${pv.id}" style="color:var(--danger);border-color:var(--danger)">מחק</button>
        </div>
        <p class="muted" style="margin-top:12px;font-size:12px">🔒 פרטי — שיתוף רק בבחירתך</p>
      </div>
    </div>` : ''}
    <div class="between" style="margin-bottom:14px"><h2 class="h-lg">ההתקדמות שלך</h2><button class="react-btn" data-share-report>📤 שתף דוח</button></div>
    <div class="stats">
      <div class="stat"><div class="num accent">${S.streak}</div><div class="lab">רצף ימים</div></div>
      <div class="stat"><div class="num">${S.workoutsLog.length}</div><div class="lab">אימונים</div></div>
      <div class="stat"><div class="num">${S.weights.length}</div><div class="lab">שקילות</div></div>
    </div>

    ${weeklyInsights()}

    <div class="section-title">נפח אימונים שבועי 📊${S.maxStreak ? ` · רצף שיא 🔥${S.maxStreak}` : ''}</div>
    <div class="card">${S.workoutsLog.length ? weeklyVolumeChart() : `<p class="muted center" style="padding:10px">כאן תראה כמה התאמנת כל שבוע</p>`}</div>

    <div class="section-title">5 השבועות האחרונים 🗓️</div>
    <div class="card">${historyHeatmap()}</div>

    ${Object.keys(S.prs).length ? `<div class="section-title">שיאים אישיים 🏆</div>
    <div class="card">
      ${Object.entries(S.prs).map(([id, pr]) => { const ex = EXERCISES.find((e) => e.id === id); return ex ? `<div class="ex-item"><div class="ex-emoji">${ex.emoji}</div><div class="grow"><div class="ex-name">${esc(ex.name)}</div><div class="ex-meta">${pr.date}</div></div><span class="pill accent">${pr.best} חזרות</span></div>` : ''; }).join('')}
    </div>` : ''}

    <div class="section-title">הישגים · ${S.badges.length}/${BADGES.length}</div>
    <div class="card">
      <div class="badges">
        ${BADGES.map((b) => { const got = S.badges.includes(b.id); return `<div class="badge-item ${got ? '' : 'locked'}">
          <div class="be">${got ? b.emoji : '🔒'}</div><div class="bn">${esc(b.name)}</div><div class="bd">${esc(b.desc)}</div></div>`; }).join('')}
      </div>
    </div>

    <div class="section-title">מעקב משקל</div>
    <div class="card">
      ${pts.length >= 2 ? weightChart(pts) : `<p class="muted center" style="padding:10px">הוסף שקילה כדי לראות גרף התקדמות</p>`}
      <div class="flex" style="margin-top:12px">
        <input class="input" id="w-input" type="number" inputmode="decimal" placeholder="משקל היום (${wUnit()})">
        <button class="btn sm" data-add-weight>הוסף</button>
      </div>
    </div>

    ${(() => {
      const photos = loadPhotos();
      return `<div class="section-title">📸 תמונות התקדמות · פרטי</div>
      <div class="card">
        <p class="muted" style="font-size:12.5px;margin:0 0 12px">🔒 נשמרות <b style="color:var(--text)">רק במכשיר שלך</b>. אף אחד לא רואה אותן — אתה בוחר ידנית מה לשתף.</p>
        <div class="photo-grid">
          <label class="photo-add">＋<input type="file" accept="image/*" capture="environment" hidden data-photo-input></label>
          ${photos.slice().reverse().map((ph) => `<div class="photo-cell" data-photo="${ph.id}"><img src="${ph.dataUrl}" alt=""><span class="photo-date">${ph.date}${ph.shared ? ' · שותף' : ''}</span></div>`).join('')}
        </div>
      </div>`;
    })()}

    <div class="section-title">היסטוריית אימונים</div>
    <div class="card">
      ${S.workoutsLog.length ? S.workoutsLog.slice().reverse().slice(0, 8).map((w) =>
        `<div class="ex-item"><div class="ex-emoji">✅</div><div class="grow"><div class="ex-name">${esc(w.name)}</div><div class="ex-meta">${w.exercises.length} תרגילים</div></div><span class="lb-metric">${w.date}</span></div>`
      ).join('') : `<p class="muted center" style="padding:10px">עוד לא הושלמו אימונים — האימון הראשון מחכה לך 💪</p>`}
    </div>
  </div>`;
}
// Smart weekly summary — turns raw logs into a coach-style readout.
function weeklyInsights() {
  const now = Date.now();
  const within = (d, days) => (now - new Date(d).getTime()) / 864e5 < days;
  const wkWorkouts = S.workoutsLog.filter((w) => within(w.date, 7));
  const wkExercises = wkWorkouts.reduce((a, w) => a + w.exercises.length, 0);
  const mins = wkWorkouts.length * 22;
  const target = S.profile.days || 3;
  const progressed = Object.values(S.exState).filter((x) => (x.adjust || 0) >= 1).length;
  // weight trend over the last 30 days
  const recentW = S.weights.filter((w) => within(w.date, 30));
  let wDelta = null;
  if (recentW.length >= 2) wDelta = +(recentW[recentW.length - 1].kg - recentW[0].kg).toFixed(1);

  const headline = wkWorkouts.length >= target ? '🔥 שבוע מנצח — עמדת ביעד!'
    : wkWorkouts.length > 0 ? `💪 ${wkWorkouts.length}/${target} אימונים השבוע — ממשיכים!`
    : '👋 בוא נתחיל את השבוע — אימון אחד זה הכל';

  const chips = [
    { n: wkWorkouts.length, l: 'אימונים השבוע', a: true },
    { n: mins, l: 'דקות אימון' },
    { n: progressed, l: 'תרגילים שהתקדמו' }
  ];
  return `<div class="section-title">סיכום שבועי 🧠</div>
    <div class="hero">
      <h3 class="h-lg" style="margin-bottom:12px">${headline}</h3>
      <div class="stats" style="margin-bottom:0">
        ${chips.map((c) => `<div class="stat" style="background:rgba(255,255,255,.03)"><div class="num ${c.a ? 'accent' : ''}">${c.n}</div><div class="lab">${c.l}</div></div>`).join('')}
      </div>
      ${wDelta !== null ? `<div class="between" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)"><span class="muted">מגמת משקל (30 יום)</span><span>${wDelta > 0 ? '▲' : wDelta < 0 ? '▼' : '■'} ${Math.abs(wDelta)} ק״ג</span></div>` : ''}
    </div>`;
}
function historyHeatmap() {
  const days = 35, set = new Set(S.workoutsLog.map((w) => w.date)), today = Math.floor(Date.now() / 864e5);
  let cells = '';
  for (let i = days - 1; i >= 0; i--) { const dnum = today - i; const date = new Date(dnum * 864e5).toISOString().slice(0, 10); cells += `<div class="hm-cell ${set.has(date) ? 'on' : ''} ${i === 0 ? 'today' : ''}" title="${date}"></div>`; }
  return `<div class="heatmap">${cells}</div><div class="between muted" style="font-size:11px;margin-top:8px"><span>לפני 5 שבועות</span><span>היום</span></div>`;
}
function weeklyVolumeChart() {
  const weeks = 6, buckets = new Array(weeks).fill(0), now = Date.now();
  S.workoutsLog.forEach((w) => { const d = Math.floor((now - new Date(w.date + 'T00:00:00').getTime()) / (7 * 864e5)); if (d >= 0 && d < weeks) buckets[weeks - 1 - d]++; });
  const max = Math.max(1, ...buckets), W = 300, H = 110, bw = (W - 16) / weeks;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" style="height:110px">
    ${buckets.map((v, i) => { const h = (v / max) * (H - 30); const x = 8 + i * bw; return `<rect x="${(x + 4).toFixed(1)}" y="${(H - 18 - h).toFixed(1)}" width="${(bw - 8).toFixed(1)}" height="${Math.max(2, h).toFixed(1)}" rx="4" fill="var(--accent)" opacity="${v ? 1 : .22}"/>${v ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(H - 22 - h).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--text)">${v}</text>` : ''}<text x="${(x + bw / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle" font-size="9" fill="var(--muted)">${i === weeks - 1 ? 'השבוע' : (weeks - 1 - i) + 'ש׳'}</text>`; }).join('')}
  </svg>`;
}
function repSparkline(hist) {
  const pts = hist.slice(-14);
  const W = 300, H = 60, pad = 6;
  const vals = pts.map((p) => p.reps);
  const min = Math.min(...vals), max = Math.max(...vals);
  const x = (i) => pad + (i * (W - pad * 2)) / Math.max(1, pts.length - 1);
  const y = (v) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  const poly = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.reps).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:60px;margin-top:8px">
    <polyline points="${poly}"/>
    ${pts.map((p, i) => `<circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(p.reps).toFixed(1)}" r="3"/>`).join('')}
  </svg>`;
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
  <div class="between muted" style="font-size:12px"><span>${toDisp(pts[0].kg)} ${wUnit()}</span><span>עכשיו: ${toDisp(pts[pts.length-1].kg)} ${wUnit()}</span></div>`;
}

/* ============================================================
   NUTRITION
   ============================================================ */
let pendingFood = null;   // food awaiting a quantity choice
function mealForNow() { const h = new Date().getHours(); return h < 11 ? 'בוקר' : h < 16 ? 'צהריים' : h < 22 ? 'ערב' : 'נשנוש'; }
const MEAL_EMOJI = { 'בוקר': '🌅', 'צהריים': '☀️', 'ערב': '🌙', 'נשנוש': '🍿' };
function addFood(f, qty) {
  if (!f) return;
  const q = qty > 0 ? qty : 1;
  const label = q === 1 ? f.name : `${f.name} ×${q}`;
  const t = todayStr();
  (S.nutrition[t] ||= []).push({ name: label, kcal: Math.round(f.kcal * q), p: +(f.p * q).toFixed(1), c: +(f.c * q).toFixed(1), f: +(f.f * q).toFixed(1), meal: mealForNow() });
  S.recentFoods = [f.name, ...(S.recentFoods || []).filter((n) => n !== f.name)].slice(0, 8);
  pendingFood = null; route.params.q = ''; save(); render(); toast(`${label} נוסף ✓`); checkBadges();
}
function ScreenNutrition() {
  const p = S.profile, mt = macroTargets(p);
  const today = S.nutrition[todayStr()] || [];
  const sum = today.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
  const q = (route.params.q || '').trim();
  const results = q ? FOODS.filter((f) => f.name.includes(q)).slice(0, 6) : [];
  const over = sum.kcal > mt.kcal;
  const bar = (val, tgt, cls) => `<div class="macro"><div class="top"><span>${cls === 'p' ? 'חלבון' : cls === 'c' ? 'פחמימות' : 'שומן'}</span><span class="muted">${Math.round(val)} / ${tgt} ג׳</span></div><div class="mtrack"><div class="mfill ${cls}" style="width:${Math.min(100, (val / tgt) * 100)}%"></div></div></div>`;
  const recent = (S.recentFoods || []).map((n) => FOODS.find((f) => f.name === n)).filter(Boolean).slice(0, 6);
  return `<div class="screen">
    <h2 class="h-lg" style="margin-bottom:12px">תזונה היום</h2>
    <div class="hero">
      <div class="between"><span class="muted">קלוריות</span><span class="pill ${over ? '' : 'accent'}" ${over ? 'style="background:var(--danger);color:#0B0E11;border-color:transparent"' : ''}>${over ? `חריגה ${Math.round(sum.kcal - mt.kcal)}` : `יעד ${mt.kcal}`}</span></div>
      <div class="h-xl" style="margin:8px 0 2px">${Math.round(sum.kcal)} <span style="font-size:16px" class="muted">/ ${mt.kcal} קל׳</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,(sum.kcal/mt.kcal)*100)}%${over ? ';background:var(--danger)' : ''}"></div></div>
      <div style="margin-top:12px">
        ${bar(sum.p, mt.protein, 'p')}${bar(sum.c, mt.carbs, 'c')}${bar(sum.f, mt.fat, 'f')}
      </div>
    </div>

    <div class="section-title">💧 מים</div>
    <div class="card">
      ${(() => {
        const targetMl = Math.round(mt.water * 1000);
        const ml = S.water[todayStr()] || 0;
        const cups = Math.round(ml / 250);
        const pct = Math.min(100, (ml / targetMl) * 100);
        return `<div class="between"><span class="h-lg">${(ml / 1000).toFixed(2)} <span style="font-size:14px" class="muted">/ ${mt.water} ליטר</span></span><span class="pill ${ml >= targetMl ? 'accent' : ''}">${cups} כוסות</span></div>
        <div class="mtrack" style="height:12px;margin:12px 0"><div class="mfill" style="width:${pct}%;background:linear-gradient(90deg,#4aa8ff,#7cd4ff)"></div></div>
        <div class="chips">
          <button class="chip" data-water="250" style="flex:1;padding:12px"><div class="t">＋ כוס</div><div class="s">250 מ״ל</div></button>
          <button class="chip" data-water="500" style="flex:1;padding:12px"><div class="t">＋ בקבוק</div><div class="s">500 מ״ל</div></button>
          <button class="chip" data-water="-250" style="flex:0 0 auto;padding:12px"><div class="t">－</div></button>
        </div>`;
      })()}
    </div>

    ${pendingFood ? `<div class="section-title">כמה ${esc(pendingFood.name)}?</div>
    <div class="card">
      <p class="muted" style="font-size:13px;margin:0 0 10px">מנה בסיסית: ${esc(pendingFood.unit)} · ${pendingFood.kcal} קל׳</p>
      <div class="chips" style="margin-bottom:12px">
        ${[0.5, 1, 1.5, 2, 3].map((m) => `<button class="chip" data-qty="${m}" style="flex:0 0 auto;padding:10px 16px"><div class="t">×${m}</div></button>`).join('')}
      </div>
      <div class="flex">
        <input class="input" id="qty-input" type="number" inputmode="decimal" step="0.1" placeholder="כמות מדויקת (למשל 1.5)">
        <button class="btn sm" data-qty-add>הוסף</button>
      </div>
      <button class="btn sm ghost" data-qty-cancel style="margin-top:10px">ביטול</button>
    </div>` : `
    <div class="section-title">הוסף מזון</div>
    <div class="card">
      <input class="input" id="food-q" placeholder="חפש מזון (עוף, אורז, בננה...)" value="${esc(q)}">
      ${!q && recent.length ? `<div class="chips" style="margin-top:10px">${recent.map((f) => `<button class="chip" data-recent="${esc(f.name)}" style="flex:0 0 auto;padding:8px 14px"><div class="t">${esc(f.name)}</div></button>`).join('')}</div>` : ''}
      ${results.length ? results.map((f, i) => `<div class="ex-item" data-food="${i}">
        <div class="ex-emoji">🍽️</div><div class="grow"><div class="ex-name">${esc(f.name)}</div><div class="ex-meta">${f.kcal} קל׳ · ${f.p}ח/${f.c}פ/${f.f}ש · ${f.unit}</div></div><span class="badge">+</span></div>`).join('')
      : q ? `<p class="muted center" style="padding:8px">לא נמצא — נרחיב את המאגר עם API אמיתי בהמשך</p>` : ''}
    </div>`}

    ${!pendingFood ? `<div class="section-title">תבניות ארוחה ⚡</div>
    <div class="card">
      ${S.mealTemplates.length ? `<div class="chips" style="margin-bottom:10px">${S.mealTemplates.map((t, i) => `<button class="chip" data-apply-tmpl="${i}" style="flex:0 0 auto;padding:8px 14px"><div class="t">${esc(t.name)}</div><div class="s">${t.items.length} פריטים</div></button>`).join('')}</div>` : `<p class="muted" style="font-size:13px;margin:0 0 10px">שמור ארוחה קבועה (כמו הבוקר שלך) והוסף אותה בלחיצה אחת.</p>`}
      ${today.length ? `<button class="btn sm ghost" data-save-tmpl>💾 שמור את ארוחת היום כתבנית</button>` : ''}
      ${S.mealTemplates.length ? `<button class="btn sm ghost" data-del-tmpl style="margin-top:8px;color:var(--danger);border-color:var(--danger)">מחק תבנית אחרונה</button>` : ''}
    </div>` : ''}

    ${!pendingFood && (mt.protein - sum.p) > 15 ? `<div class="section-title">רעיונות להשלמת חלבון 💡</div>
    <div class="card">
      <p class="muted" style="font-size:12.5px;margin:0 0 10px">נשארו ${Math.round(mt.protein - sum.p)} ג׳ חלבון להיום — הצעות עשירות בחלבון:</p>
      <div class="chips">${FOODS.filter((f) => f.p >= 10).sort((a, b) => b.p - a.p).slice(0, 4).map((f) => `<button class="chip" data-idea="${esc(f.name)}" style="flex:0 0 auto;padding:8px 12px"><div class="t">${esc(f.name)}</div><div class="s">${f.p}ג׳ חלבון</div></button>`).join('')}</div>
    </div>` : ''}

    ${today.length ? `<div class="section-title">מה אכלת היום</div><div class="card">
      ${['בוקר', 'צהריים', 'ערב', 'נשנוש'].map((meal) => {
        const items = today.map((f, i) => ({ f, i })).filter(({ f }) => (f.meal || 'נשנוש') === meal);
        if (!items.length) return '';
        const mkcal = items.reduce((a, { f }) => a + f.kcal, 0);
        return `<div class="between" style="padding:8px 2px 4px"><span class="muted" style="font-size:12px;font-weight:700">${MEAL_EMOJI[meal]} ${meal}</span><span class="muted" style="font-size:12px">${mkcal} קל׳</span></div>
        ${items.map(({ f, i }) => `<div class="ex-item"><div class="ex-emoji" style="font-size:15px">•</div><div class="grow"><div class="ex-name">${esc(f.name)}</div><div class="ex-meta">${f.kcal} קל׳ · ${Math.round(f.p)}ח/${Math.round(f.c)}פ/${Math.round(f.f)}ש</div></div><button class="badge" data-del-food="${i}">מחק</button></div>`).join('')}`;
      }).join('')}
    </div>` : ''}
    <p class="muted center" style="font-size:11.5px;margin-top:14px;line-height:1.6">יעדים לפי נוסחת Mifflin-St Jeor · ערכי מזון לפי ${FOOD_SOURCE}.<br>מידע כללי בלבד — לא ייעוץ תזונתי/רפואי. להתאמה אישית פנה לאיש מקצוע.</p>
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
  return Cloud.enabled() ? familyCloud() : familyLocal();
}
// Real, shared family via the cloud.
function familyCloud() {
  const st = Cloud.status, mem = Cloud.members;
  const me = Cloud.deviceId();
  let body;
  if (st === 'loading' && !mem) body = `<p class="muted center" style="padding:20px">טוען את המשפחה…</p>`;
  else if (st === 'error') body = `<p class="muted center" style="padding:16px">😕 לא הצלחתי להתחבר.<br>${esc(Cloud.lastError)}</p><button class="btn ghost" data-cloud-refresh>נסה שוב</button>`;
  else if (mem && mem.length) {
    body = mem.map((m, i) => `<div class="lb-row ${m.device_id === me ? 'you' : ''}">
        <div class="lb-rank">${['🥇','🥈','🥉'][i] || i + 1}</div>
        <div class="avatar" style="width:34px;height:34px;font-size:14px">${esc(initials(m.name))}</div>
        <div class="grow"><div class="lb-name">${esc(m.name)}${m.device_id === me ? ' <span class="muted">(את/ה)</span>' : ''}</div>
          <div class="lb-metric">🔥 ${m.streak} · ${m.workouts} אימונים</div></div>
      </div>`).join('');
  } else body = `<p class="muted center" style="padding:16px">עדיין אין חברי משפחה. שתף את הקוד <b style="color:var(--text)">${esc(Cloud.familyCode())}</b> כדי שיצטרפו!</p>`;

  return `<div class="screen">
    <div class="between" style="margin-bottom:4px"><h2 class="h-lg">המשפחה 👨‍👩‍👧‍👦</h2><span class="pill accent">☁️ מחובר</span></div>
    <p class="muted" style="margin:0 0 16px">משפחה: <b style="color:var(--text)">${esc(Cloud.familyCode())}</b> · חי מכל המכשירים.</p>

    ${mem && mem.length ? `<div class="nudge" style="background:linear-gradient(160deg,#2a2410,#1a1608);border-color:#4a3f1a"><span class="ne">🏅</span><div class="grow"><b>אלוף השבוע: ${esc(mem[0].name)}</b><div class="muted" style="font-size:13px">🔥 ${mem[0].streak} · ${mem[0].workouts} אימונים</div></div></div>` : ''}
    <div class="section-title">טבלת ליגה חיה</div>
    <div class="card">${body}</div>

    <button class="btn violet" data-share-code>שתף קוד משפחה 📲</button>
    <div class="spacer"></div>
    <div class="row2">
      <button class="btn sm ghost" data-cloud-refresh>🔄 רענן</button>
      <button class="btn sm ghost" data-nav="cloud">⚙️ הגדרות ענן</button>
    </div>
  </div>`;
}
// Local demo family + a prompt to connect the real thing.
function familyLocal() {
  const ranked = familyRanked();
  return `<div class="screen">
    <h2 class="h-lg" style="margin-bottom:4px">המשפחה 👨‍👩‍👧‍👦</h2>
    <p class="muted" style="margin:0 0 16px">מי מוביל השבוע? הרצף הכי ארוך מנצח.</p>

    <div class="hero">
      <div class="between"><span class="pill accent">☁️ חדש</span></div>
      <h3 class="h-lg" style="margin:12px 0 4px">חבר משפחה אמיתית</h3>
      <p class="muted" style="margin-bottom:14px">שכל בן משפחה יתחבר מהטלפון שלו ותראו אחד את השני בזמן אמת.</p>
      <button class="btn" data-nav="cloud">חבר את המשפחה בענן ›</button>
    </div>

    <div class="nudge" style="background:linear-gradient(160deg,#2a2410,#1a1608);border-color:#4a3f1a"><span class="ne">🏅</span><div class="grow"><b>אלוף השבוע: ${esc(ranked[0].name)}</b><div class="muted" style="font-size:13px">🔥 ${ranked[0].streak} · ${ranked[0].workouts} אימונים</div></div></div>
    <div class="section-title">טבלת ליגה (דוגמה)</div>
    <div class="card">
      ${ranked.map((m, i) => `<div class="lb-row ${m.you ? 'you' : ''}">
        <div class="lb-rank">${['🥇','🥈','🥉'][i] || i + 1}</div>
        <div class="avatar" style="width:34px;height:34px;font-size:14px">${esc(initials(m.name))}</div>
        <div class="grow"><div class="lb-name">${esc(m.name)}${m.you ? ' <span class="muted">(את/ה)</span>' : ''}</div>
          <div class="lb-metric">🔥 ${m.streak} · ${m.workouts} אימונים${S.reactions[m.name] ? ` · ${S.reactions[m.name]} 🔥` : ''}</div></div>
        ${m.you ? '' : `<button class="react-btn" data-react="${esc(m.name)}">🔥 עודד</button>`}
      </div>`).join('')}
    </div>
    <p class="muted center" style="font-size:12px;margin-top:10px">הטבלה למעלה היא דמו — חבר את הענן כדי שתהיה אמיתית.</p>
  </div>`;
}

/* ============================================================
   CLOUD SETUP
   ============================================================ */
function ScreenCloud() {
  const c = Cloud.cfg || {};
  const connected = Cloud.enabled();
  const sql = `create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  family text not null,
  name text not null,
  workouts int default 0,
  streak int default 0,
  updated_at timestamptz default now(),
  unique(device_id, family)
);
alter table members enable row level security;
create policy "family rw" on members for all using (true) with check (true);`;
  return `<div class="screen">
    <button class="back" data-nav="family">›  חזרה</button>
    <h2 class="h-lg" style="margin-bottom:6px">משפחה בענן ☁️</h2>
    <p class="muted" style="margin:0 0 16px">${connected ? 'מחובר ✓ — המשפחה חיה.' : 'חיבור חד-פעמי. חינם, דרך Supabase.'}</p>

    <div class="section-title">שלב 1 · צור טבלה ב-Supabase</div>
    <div class="card">
      <p class="muted" style="font-size:13px;margin:0 0 10px">ב-Supabase → SQL Editor → הדבק והרץ פעם אחת:</p>
      <pre style="background:var(--bg-2);border:1px solid var(--line);border-radius:10px;padding:12px;overflow:auto;font-size:11px;direction:ltr;text-align:left;white-space:pre;color:var(--text)">${esc(sql)}</pre>
      <button class="btn sm ghost" data-copy-sql>העתק SQL</button>
    </div>

    <div class="section-title">שלב 2 · הדבק מפתחות</div>
    <div class="card">
      <div class="field"><label>Project URL</label><input class="input" id="c-url" placeholder="https://xxxx.supabase.co" value="${esc(c.url || '')}" style="direction:ltr;text-align:left"></div>
      <div class="field"><label>anon public key</label><input class="input" id="c-key" placeholder="eyJhbGci..." value="${esc(c.key || '')}" style="direction:ltr;text-align:left"></div>
      <div class="field"><label>שם התצוגה שלך</label><input class="input" id="c-name" placeholder="איתמר" value="${esc(c.name || S.profile?.name || '')}"></div>
      <div class="field"><label>קוד משפחה (זהה לכולם)</label>
        <div class="flex"><input class="input" id="c-family" placeholder="למשל SHARON1" value="${esc(c.family || '')}" style="direction:ltr;text-align:left"><button class="btn sm" data-gen-code>צור קוד</button></div>
      </div>
      <button class="btn" data-cloud-connect>${connected ? 'עדכן חיבור' : 'התחבר'} ☁️</button>
      ${connected ? `<div class="spacer"></div><button class="btn ghost" data-cloud-disconnect style="color:var(--danger);border-color:var(--danger)">התנתק</button>` : ''}
    </div>
    <p class="muted center" style="font-size:11.5px;margin-top:6px;line-height:1.6">שתף את <b style="color:var(--text)">קוד המשפחה + ה-URL + ה-key</b> עם בני המשפחה — כולם מזינים אותם ומצטרפים. ה-anon key מיועד לצד-לקוח ובטוח לשיתוף בקבוצה.</p>
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
      <p class="muted">${goalList(p).map(id=>GOALS.find(g=>g.id===id)?.label).filter(Boolean).join(' + ')} · רמה ${['','מתחיל','בינוני','מתקדם'][p.level]}</p>
    </div>
    <div class="card">
      <div class="between" style="padding:8px 0"><span class="muted">גיל</span><span>${p.age}</span></div>
      <div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="muted">משקל / גובה</span><span>${toDisp(p.weight)} ${wUnit()} · ${p.height} ס״מ</span></div>
      <div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="muted">תדירות</span><span>${p.days || '—'} ימים בשבוע</span></div>
      <div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="muted">ציוד</span><span>${EQUIP.find(e=>e.id===p.equip)?.label}</span></div>
      ${p.injuries && p.injuries.length ? `<div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="muted">מגבלות</span><span>${p.injuries.map((i) => INJURIES.find((x) => x.id === i)?.label).join(', ')}</span></div>` : ''}
      <div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="muted">יעד קלורי יומי</span><span>${mt.kcal} קל׳</span></div>
    </div>
    <button class="btn ghost" data-nav="settings">⚙️ הגדרות (מטרה, תדירות, יחידות)</button>
    <div class="spacer"></div>
    <button class="btn ghost" data-edit-profile>ערוך פרטים אישיים</button>

    <div class="section-title">גיבוי ושחזור מידע</div>
    <div class="card">
      <p class="muted" style="font-size:13px;margin:2px 0 12px">המידע נשמר במכשיר. גבה אותו לקובץ כדי לא לאבד — ובקרוב: סנכרון ענן אוטומטי.</p>
      <div class="row2">
        <button class="btn sm ghost" data-export>⬇ גבה לקובץ</button>
        <button class="btn sm ghost" data-import>⬆ שחזר מקובץ</button>
      </div>
    </div>

    <div class="spacer"></div>
    <button class="btn ghost" data-nav="privacy">🔒 פרטיות ואבטחת מידע</button>
    <div class="spacer"></div>
    <button class="btn ghost" data-reset style="color:var(--danger);border-color:var(--danger)">אפס הכל</button>
  </div>`;
}

/* ============================================================
   FOCUSED PROGRAMS
   ============================================================ */
function ScreenPrograms() {
  const active = activeProgram();
  return `<div class="screen">
    <button class="back" data-nav="home">›  חזרה</button>
    <h2 class="h-lg" style="margin-bottom:6px">תוכניות ממוקדות 🎯</h2>
    <p class="muted" style="margin:0 0 16px">מסלול ברור למטרה — האימונים היומיים יתאימו את עצמם לתוכנית.</p>

    ${active ? (() => { const day = Math.min(active.days, programDay()); const pct = Math.round((day / active.days) * 100); return `<div class="hero">
      <div class="between"><span class="pill accent">${active.emoji} פעיל</span><span class="muted">יום ${day}/${active.days}</span></div>
      <h3 class="h-lg" style="margin:12px 0 6px">${esc(active.name)}</h3>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <p class="muted" style="margin:10px 0 12px">${pct >= 100 ? '🎉 סיימת את התוכנית! כל הכבוד.' : `נותרו ${active.days - day} ימי אימון`}</p>
      <button class="btn ghost" data-stop-program style="color:var(--danger);border-color:var(--danger)">עצור תוכנית</button>
    </div>`; })() : ''}

    <div class="section-title">${active ? 'תוכניות נוספות' : 'בחר תוכנית'}</div>
    ${PROGRAMS.filter((p) => !active || p.id !== active.id).map((p) => `<div class="card">
      <div class="flex" style="margin-bottom:8px"><span style="font-size:30px">${p.emoji}</span><div class="grow"><div class="ex-name">${esc(p.name)}</div><div class="ex-meta">${p.days} ימים</div></div></div>
      <p class="muted" style="font-size:13.5px;margin:0 0 12px">${esc(p.desc)}</p>
      <button class="btn sm" data-start-program="${p.id}">התחל תוכנית ›</button>
    </div>`).join('')}
  </div>`;
}

/* ============================================================
   FIRST-WEEK PREVIEW (shown right after onboarding)
   ============================================================ */
function ScreenFirstWeek() {
  const split = chooseSplit(S.profile);
  const sess = todaysSession();
  return `<div class="screen">
    <div class="center" style="margin-top:5vh">
      <div style="font-size:56px">🎯</div>
      <h1 class="h-xl" style="margin:10px 0 4px">התוכנית שלך מוכנה, ${esc(S.profile.name)}!</h1>
      <p class="muted" style="margin-bottom:20px">${split.label} · ${split.days} אימונים בשבוע</p>
    </div>
    <div class="section-title">השבוע הראשון שלך</div>
    <div class="card">
      ${split.sessions.map((ss, i) => `<div class="ex-item"><div class="ex-emoji">${['💪', '🔥', '⚡', '🌟', '🏆'][i] || '✅'}</div><div class="grow"><div class="ex-name">${esc(ss.name)}</div><div class="ex-meta">${ss.patterns.length} תרגילים</div></div></div>`).join('')}
    </div>
    <div class="section-title">האימון הראשון</div>
    <div class="card">${sess.main.slice(0, 4).map((e) => `<div class="ex-item"><div class="ex-emoji">${e.emoji}</div><div class="grow"><div class="ex-name">${esc(e.name)}</div><div class="ex-meta">${e.sets} × ${e.reps}</div></div></div>`).join('')}</div>
    <button class="btn" data-nav="home">בוא נתחיל 🚀</button>
  </div>`;
}

/* ============================================================
   GOALS
   ============================================================ */
function goalProgress(g) {
  if (g.type === 'weight') {
    const cur = S.weights.length ? S.weights[S.weights.length - 1].kg : S.profile.weight;
    const denom = (g.start - g.target) || 1;
    const pct = Math.max(0, Math.min(100, ((g.start - cur) / denom) * 100));
    return { pct, label: `${toDisp(cur)} → ${toDisp(g.target)} ${wUnit()}`, title: '⚖️ משקל יעד' };
  }
  const best = S.prs[g.exId]?.best || 0;
  const ex = EXERCISES.find((e) => e.id === g.exId);
  return { pct: Math.max(0, Math.min(100, (best / g.target) * 100)), label: `${best}/${g.target} חזרות`, title: '💪 ' + (ex ? ex.name : '') };
}
function goalRow(g, i) {
  const gp = goalProgress(g); const done = gp.pct >= 100;
  return `<div style="padding:11px 2px;border-top:${i ? '1px solid var(--line)' : 'none'}">
    <div class="between" style="margin-bottom:7px"><span class="ex-name">${gp.title}${done ? ' 🎉' : ''}</span><button class="badge" data-del-goal="${i}">מחק</button></div>
    <div class="mtrack"><div class="mfill ${done ? '' : 'p'}" style="width:${gp.pct}%${done ? ';background:var(--accent)' : ''}"></div></div>
    <div class="muted" style="font-size:12px;margin-top:5px">${gp.label} · ${Math.round(gp.pct)}%${done ? ' · הושלם!' : ''}</div>
  </div>`;
}
function ScreenGoals() {
  return `<div class="screen">
    <button class="back" data-nav="home">›  חזרה</button>
    <h2 class="h-lg" style="margin-bottom:12px">היעדים שלי 🎯</h2>

    ${S.goals.length ? `<div class="section-title">יעדים פעילים</div><div class="card">${S.goals.map((g, i) => goalRow(g, i)).join('')}</div>` : `<p class="muted center" style="padding:10px">עדיין אין יעדים — הגדר אחד למטה 👇</p>`}

    <div class="section-title">יעד משקל</div>
    <div class="card"><div class="flex"><input class="input" id="g-weight" type="number" inputmode="decimal" placeholder="משקל יעד (${wUnit()})"><button class="btn sm" data-add-weight-goal>הוסף</button></div></div>

    <div class="section-title">יעד חזרות בתרגיל</div>
    <div class="card">
      <div class="field"><select class="select" id="g-ex">${EXERCISES.filter((e) => !e.timed).map((e) => `<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
      <div class="flex"><input class="input" id="g-reps" type="number" inputmode="numeric" placeholder="יעד (למשל 20)"><button class="btn sm" data-add-reps-goal>הוסף</button></div>
    </div>
  </div>`;
}

/* ============================================================
   SETTINGS (quick-edit plan without redoing onboarding)
   ============================================================ */
function ScreenSettings() {
  const p = S.profile;
  return `<div class="screen">
    <button class="back" data-nav="profile">›  חזרה</button>
    <h2 class="h-lg" style="margin-bottom:16px">הגדרות ⚙️</h2>

    <div class="section-title">מטרות (אפשר כמה)</div>
    <div class="chips">
      ${GOALS.map((g) => `<button class="chip ${goalList(p).includes(g.id) ? 'sel' : ''}" data-set-goal="${g.id}"><div class="emoji">${g.emoji}</div><div class="t">${g.label}</div></button>`).join('')}
    </div>

    <div class="section-title">ימים בשבוע</div>
    <div class="chips">
      ${[3, 4, 5].map((n) => `<button class="chip ${p.days === n ? 'sel' : ''}" data-set-days="${n}" style="flex:1"><div class="t">${n} ימים</div></button>`).join('')}
    </div>

    <div class="section-title">רמה</div>
    <div class="chips">
      ${LEVELS.map((l) => `<button class="chip ${p.level === l.id ? 'sel' : ''}" data-set-level="${l.id}" style="flex:1"><div class="t">${l.label}</div></button>`).join('')}
    </div>

    <div class="section-title">מגבלות / פציעות</div>
    <div class="chips">
      ${INJURIES.map((inj) => `<button class="chip ${(p.injuries && p.injuries.length ? p.injuries : ['none']).includes(inj.id) ? 'sel' : ''}" data-set-injury="${inj.id}"><div class="emoji">${inj.emoji}</div><div class="t">${inj.label}</div></button>`).join('')}
    </div>

    <div class="section-title">יחידות משקל</div>
    <div class="chips">
      <button class="chip ${p.units !== 'lb' ? 'sel' : ''}" data-set-units="kg" style="flex:1"><div class="t">קילוגרם (ק״ג)</div></button>
      <button class="chip ${p.units === 'lb' ? 'sel' : ''}" data-set-units="lb" style="flex:1"><div class="t">פאונד (lb)</div></button>
    </div>

    <div class="section-title">מראה</div>
    <div class="chips">
      <button class="chip ${S.theme !== 'light' ? 'sel' : ''}" data-set-theme="dark" style="flex:1"><div class="t">🌙 כהה</div></button>
      <button class="chip ${S.theme === 'light' ? 'sel' : ''}" data-set-theme="light" style="flex:1"><div class="t">☀️ בהיר</div></button>
    </div>

    <div class="section-title">צליל ורטט</div>
    <div class="card">
      <div class="between" style="padding:8px 0"><span>🔊 צלילי טיימר</span><button class="react-btn" data-toggle-sound>${S.sound !== false ? 'פעיל' : 'כבוי'}</button></div>
      <div class="between" style="padding:8px 0;border-top:1px solid var(--line)"><span>📳 רטט</span><button class="react-btn" data-toggle-vibrate>${S.vibrate !== false ? 'פעיל' : 'כבוי'}</button></div>
    </div>

    <div class="spacer"></div>
    <p class="muted center" style="font-size:12px">השינויים נשמרים מיד ומעדכנים את התוכנית שלך.</p>
    <p class="muted center" style="font-size:11px;opacity:.6;margin-top:10px">גרסה ${APP_VERSION}</p>
  </div>`;
}

/* ============================================================
   PRIVACY
   ============================================================ */
function ScreenPrivacy() {
  return `<div class="screen">
    <button class="back" data-nav="profile">›  חזרה</button>
    <h2 class="h-lg" style="margin-bottom:6px">פרטיות ואבטחת מידע 🔒</h2>
    <p class="muted" style="margin:0 0 16px">שקיפות מלאה — איך המידע שלך מטופל.</p>

    <div class="card">
      <div class="ex-name" style="margin-bottom:4px">📱 המידע נשמר אצלך בלבד</div>
      <p class="muted" style="font-size:13.5px">כל הנתונים — פרופיל, אימונים, משקל, תזונה ומים — נשמרים <b style="color:var(--text)">מקומית במכשיר שלך</b>. הם לא נשלחים לשום שרת ולא נצפים על ידינו.</p>
    </div>
    <div class="card">
      <div class="ex-name" style="margin-bottom:4px">🚫 אין מעקב ואין פרסומות</div>
      <p class="muted" style="font-size:13.5px">איננו אוספים, מוכרים או משתפים מידע. אין קוקיז של צד שלישי ואין כלי אנליטיקה.</p>
    </div>
    <div class="card">
      <div class="ex-name" style="margin-bottom:4px">🌐 בקשות רשת</div>
      <p class="muted" style="font-size:13.5px">היחידות שמתבצעות הן להורדת תמונות וסרטוני הדגמה של תרגילים (מ-GitHub, נחלת הכלל). <b style="color:var(--text)">שום מידע אישי לא נשלח</b> בבקשות אלה.</p>
    </div>
    <div class="card">
      <div class="ex-name" style="margin-bottom:4px">❤️ נתוני בריאות</div>
      <p class="muted" style="font-size:13.5px">מידע בריאותי נחשב רגיש. הוא נשאר על המכשיר ובאחריותך — מומלץ לנעול את המכשיר בקוד.</p>
    </div>
    <div class="card">
      <div class="ex-name" style="margin-bottom:8px">⚖️ הזכויות שלך</div>
      <p class="muted" style="font-size:13.5px;margin:0 0 12px">בהתאם לעקרונות GDPR וחוק הגנת הפרטיות: גישה, ניוד ומחיקה של המידע שלך — בכל רגע.</p>
      <div class="row2">
        <button class="btn sm ghost" data-export>⬇ ייצוא המידע</button>
        <button class="btn sm ghost" data-reset style="color:var(--danger);border-color:var(--danger)">🗑 מחיקת הכל</button>
      </div>
    </div>
    <p class="muted center" style="font-size:11.5px;margin-top:6px;line-height:1.6">מקורות נתונים: ערכי תזונה — ${FOOD_SOURCE}; חישוב קלוריות — Mifflin-St Jeor; הדגמות — free-exercise-db (נחלת הכלל).<br>האפליקציה מספקת מידע כללי בלבד ואינה תחליף לייעוץ רפואי.</p>
  </div>`;
}

/* ============================================================
   EVENT BINDING
   ============================================================ */
function bind() {
  // nav + generic navigation
  document.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => { tap(); go(b.dataset.nav); });
  document.querySelectorAll('[data-ex]').forEach((b) => b.onclick = (ev) => {
    ev.stopPropagation();
    if (route.name !== 'exercise') exerciseReturn = route.name;   // remember where we came from
    go('exercise', { id: b.dataset.ex });
  });
  const back = document.querySelector('[data-back]'); if (back) back.onclick = () => {
    let dest = exerciseReturn || 'library';
    if (dest === 'active' && !active) dest = 'workouts';           // workout ended meanwhile
    go(dest);
  };
  document.querySelectorAll('[data-yt]').forEach((b) => b.onclick = () => {
    const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(b.dataset.yt + ' exercise proper form tutorial');
    window.open(url, '_blank', 'noopener');
  });

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
    d.age = clampNum(el('f-age').value, 10, 100);
    d.weight = clampNum(el('f-weight').value, 20, 300);
    d.height = clampNum(el('f-height').value, 100, 250);
    if (!d.age || !d.weight || !d.height || !d.gender) return toast('מלא גיל, מין, משקל וגובה (ערכים סבירים)');
    S.onboardStep = 3; save(); render();
  };
  document.querySelectorAll('[data-level]').forEach((b) => b.onclick = () => { d.level = +b.dataset.level; S.onboardStep = 4; save(); render(); });
  document.querySelectorAll('[data-goal]').forEach((b) => b.onclick = () => {
    const id = b.dataset.goal; d.goals = d.goals || [];
    d.goals = d.goals.includes(id) ? d.goals.filter((x) => x !== id) : [...d.goals, id];
    save(); render();
  });
  const ng = document.querySelector('[data-next-goal]'); if (ng) ng.onclick = () => { if (!(d.goals && d.goals.length)) return toast('בחר לפחות מטרה אחת'); S.onboardStep = 5; save(); render(); };
  document.querySelectorAll('[data-days]').forEach((b) => b.onclick = () => { d.days = +b.dataset.days; S.onboardStep = 6; save(); render(); });
  document.querySelectorAll('[data-injury]').forEach((b) => b.onclick = () => {
    const id = b.dataset.injury; let inj = d.injuries || [];
    if (id === 'none') inj = ['none'];
    else { inj = inj.filter((x) => x !== 'none'); inj = inj.includes(id) ? inj.filter((x) => x !== id) : [...inj, id]; if (!inj.length) inj = ['none']; }
    d.injuries = inj; save(); render();
  });
  const nj = document.querySelector('[data-next-injuries]'); if (nj) nj.onclick = () => { d.injuries = (d.injuries || ['none']).filter((x) => x !== 'none'); S.onboardStep = 7; save(); render(); };
  document.querySelectorAll('[data-equip]').forEach((b) => b.onclick = () => {
    d.equip = b.dataset.equip;                       // single choice → build the plan
    const goals = (d.goals && d.goals.length) ? d.goals : ['muscle'];
    S.profile = { ...d, goals, goal: goals[0] };
    if (d.weight) S.weights = [{ date: todayStr(), kg: d.weight }];
    S.draft = {}; S.startDate = S.startDate || todayStr(); save();
    go('firstweek');
  });

  // ---- workout ----
  document.querySelectorAll('[data-start-workout]').forEach((b) => b.onclick = startWorkout);
  document.querySelectorAll('[data-quick-workout]').forEach((b) => b.onclick = startQuickWorkout);
  const cs = document.querySelector('[data-complete-set]'); if (cs) cs.onclick = completeSet;
  const wn = document.querySelector('[data-warm-next]'); if (wn) wn.onclick = warmNext;
  const cn = document.querySelector('[data-cool-next]'); if (cn) cn.onclick = coolNext;
  document.querySelectorAll('[data-fb]').forEach((b) => b.onclick = () => applyFeedback(b.dataset.fb));
  const sh = document.querySelector('[data-start-hold]'); if (sh) sh.onclick = startHold;
  const st = document.querySelector('[data-stop-hold]'); if (st) st.onclick = stopHold;
  const rInc = document.querySelector('[data-rep-inc]'); if (rInc) rInc.onclick = () => { const e = active.sess.main[active.i]; const v = active.repInput != null ? active.repInput : (e.repsTarget || 8); active.repInput = v + 1; render(); };
  const rDec = document.querySelector('[data-rep-dec]'); if (rDec) rDec.onclick = () => { const e = active.sess.main[active.i]; const v = active.repInput != null ? active.repInput : (e.repsTarget || 8); active.repInput = Math.max(1, v - 1); render(); };
  const raB = document.querySelector('[data-rest-add]'); if (raB) raB.onclick = () => { if (active && active.resting) { active.restLeft += 15; const t = document.querySelector('.timer'); if (t) t.textContent = active.restLeft; } };
  const rsB = document.querySelector('[data-rest-sub]'); if (rsB) rsB.onclick = () => { if (active && active.resting) { active.restLeft = Math.max(1, active.restLeft - 15); const t = document.querySelector('.timer'); if (t) t.textContent = active.restLeft; } };
  const swB = document.querySelector('[data-swap-ex]'); if (swB) swB.onclick = swapExercise;
  const fsB = document.querySelector('[data-finish-summary]'); if (fsB) fsB.onclick = finishWorkout;
  const sr = document.querySelector('[data-skip-rest]'); if (sr) sr.onclick = () => { if (active.timer) clearInterval(active.timer); active.resting = false; render(); };
  const qw = document.querySelector('[data-quit-workout]'); if (qw) qw.onclick = () => {
    if (!confirm('לצאת מהאימון? ההתקדמות של האימון הנוכחי לא תישמר.')) return;
    if (active?.timer) clearInterval(active.timer); releaseWake(); active = null; go('workouts');
  };

  // ---- library filter ----
  document.querySelectorAll('[data-filter]').forEach((b) => b.onclick = () => go('library', { filter: b.dataset.filter }));

  // ---- progress ----
  const srB = document.querySelector('[data-share-report]'); if (srB) srB.onclick = shareReport;

  // ---- progress photos ----
  const pin = document.querySelector('[data-photo-input]'); if (pin) pin.onchange = () => { if (pin.files && pin.files[0]) addPhotoFromFile(pin.files[0]); };
  document.querySelectorAll('[data-photo]').forEach((b) => b.onclick = () => { photoView = b.dataset.photo; render(); });
  const pClose = document.querySelector('[data-photo-close]'); if (pClose) pClose.onclick = () => { photoView = null; render(); };
  const pShare = document.querySelector('[data-photo-share]'); if (pShare) pShare.onclick = () => sharePhoto(pShare.dataset.photoShare);
  const pDel = document.querySelector('[data-photo-del]'); if (pDel) pDel.onclick = () => { if (confirm('למחוק את התמונה?')) deletePhoto(pDel.dataset.photoDel); };

  const aw = document.querySelector('[data-add-weight]'); if (aw) aw.onclick = () => {
    const raw = +el('w-input').value; const v = clampNum(fromDisp(raw), 20, 300); if (!v) return toast('הכנס משקל סביר');
    // one weigh-in per day: replace today's if it exists
    const t = todayStr(); const existing = S.weights.find((w) => w.date === t);
    if (existing) existing.kg = v; else S.weights.push({ date: t, kg: v });
    save(); render(); toast('נשמר ✓'); checkBadges();
  };

  // ---- nutrition ----
  const fq = el('food-q'); if (fq) {
    fq.oninput = () => { route.params.q = fq.value; const c = fq.selectionStart; render(); const n = el('food-q'); if (n) { n.focus(); try { n.setSelectionRange(c, c); } catch {} } };
  }
  document.querySelectorAll('[data-food]').forEach((b) => b.onclick = () => {
    const q = (route.params.q || '').trim();
    const f = FOODS.filter((x) => x.name.includes(q))[+b.dataset.food];
    if (f) { pendingFood = f; render(); }
  });
  document.querySelectorAll('[data-recent]').forEach((b) => b.onclick = () => {
    const f = FOODS.find((x) => x.name === b.dataset.recent); if (f) { pendingFood = f; render(); }
  });
  document.querySelectorAll('[data-qty]').forEach((b) => b.onclick = () => addFood(pendingFood, +b.dataset.qty));
  const qa = document.querySelector('[data-qty-add]'); if (qa) qa.onclick = () => { const v = +el('qty-input').value; addFood(pendingFood, v > 0 ? v : 1); };
  const qc = document.querySelector('[data-qty-cancel]'); if (qc) qc.onclick = () => { pendingFood = null; render(); };
  document.querySelectorAll('[data-water]').forEach((b) => b.onclick = () => {
    const t = todayStr(); const next = (S.water[t] || 0) + (+b.dataset.water);
    S.water[t] = Math.max(0, next); save(); render(); checkBadges();
  });
  const stmpl = document.querySelector('[data-save-tmpl]'); if (stmpl) stmpl.onclick = () => {
    const items = (S.nutrition[todayStr()] || []).map((f) => ({ name: f.name, kcal: f.kcal, p: f.p, c: f.c, f: f.f }));
    if (!items.length) return; S.mealTemplates.push({ name: 'תבנית ' + (S.mealTemplates.length + 1), items }); save(); render(); toast('נשמר כתבנית ✓');
  };
  document.querySelectorAll('[data-apply-tmpl]').forEach((b) => b.onclick = () => {
    const t = S.mealTemplates[+b.dataset.applyTmpl]; if (!t) return; const day = todayStr();
    (S.nutrition[day] ||= []).push(...t.items.map((f) => ({ ...f, meal: mealForNow() }))); save(); render(); toast(`${t.name} נוסף ✓`); checkBadges();
  });
  const dtmpl = document.querySelector('[data-del-tmpl]'); if (dtmpl) dtmpl.onclick = () => { S.mealTemplates.pop(); save(); render(); };
  document.querySelectorAll('[data-idea]').forEach((b) => b.onclick = () => { const f = FOODS.find((x) => x.name === b.dataset.idea); if (f) { pendingFood = f; render(); } });
  document.querySelectorAll('[data-del-food]').forEach((b) => b.onclick = () => {
    S.nutrition[todayStr()].splice(+b.dataset.delFood, 1); save(); render();
  });

  // ---- family ----
  document.querySelectorAll('[data-react]').forEach((b) => b.onclick = () => {
    const n = b.dataset.react; S.reactions[n] = (S.reactions[n] || 0) + 1; save(); render(); toast(`שלחת 🔥 ל${n}!`);
  });
  const inv = document.querySelector('[data-invite]'); if (inv) inv.onclick = async () => {
    const url = location.href;
    if (navigator.share) { try { await navigator.share({ title: 'KIN', text: 'בוא נתאמן יחד ב-KIN 💪', url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); toast('הקישור הועתק — שלח למשפחה 📲'); } catch { toast(url); } }
  };

  // ---- profile ----
  // ---- cloud family ----
  const gc = document.querySelector('[data-gen-code]'); if (gc) gc.onclick = () => {
    const alpha = (S.profile?.name || '').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 5);
    const inp = el('c-family'); if (inp) inp.value = (alpha || 'FAM') + Math.floor(100 + Math.random() * 900);
  };
  const cpsql = document.querySelector('[data-copy-sql]'); if (cpsql) cpsql.onclick = async () => {
    const pre = document.querySelector('pre'); try { await navigator.clipboard.writeText(pre.textContent); toast('ה-SQL הועתק ✓'); } catch { toast('בחר והעתק ידנית'); }
  };
  const cc = document.querySelector('[data-cloud-connect]'); if (cc) cc.onclick = async () => {
    const url = el('c-url').value.trim(), key = el('c-key').value.trim(), name = el('c-name').value.trim(), family = el('c-family').value.trim().toUpperCase();
    if (!url || !key || !name || !family) return toast('מלא את כל השדות');
    toast('בודק חיבור…');
    const res = await Cloud.test({ url, key });
    if (!res.ok) return toast('שגיאה: ' + res.error);
    Cloud.save({ url, key, name, family }); Cloud.resetCache();
    await Cloud.refresh({ workouts: S.workoutsLog.length, streak: S.streak });
    go('family'); setTimeout(() => toast('מחובר! המשפחה חיה ☁️'), 200);
  };
  const cd = document.querySelector('[data-cloud-disconnect]'); if (cd) cd.onclick = () => {
    if (confirm('להתנתק מהמשפחה בענן? (המידע המקומי נשמר)')) { Cloud.clear(); go('family'); }
  };
  const cr = document.querySelector('[data-cloud-refresh]'); if (cr) cr.onclick = async () => {
    Cloud.resetCache(); render(); await Cloud.refresh({ workouts: S.workoutsLog.length, streak: S.streak }); render();
  };
  const scode = document.querySelector('[data-share-code]'); if (scode) scode.onclick = async () => {
    const c = Cloud.cfg;
    const text = `הצטרף למשפחה שלנו ב-KIN! 💪\nקוד משפחה: ${c.family}\nURL: ${c.url}\nkey: ${c.key}`;
    if (navigator.share) { try { await navigator.share({ title: 'KIN', text }); } catch {} }
    else { try { await navigator.clipboard.writeText(text); toast('הפרטים הועתקו — שלח למשפחה 📲'); } catch { toast(text); } }
  };
  // auto-load the live leaderboard the first time the family screen opens
  if (route.name === 'family' && Cloud.enabled() && Cloud.members === null && Cloud.status !== 'loading') {
    Cloud.refresh({ workouts: S.workoutsLog.length, streak: S.streak }).then(() => { if (route.name === 'family') render(); });
  }

  // ---- goals ----
  const awg = document.querySelector('[data-add-weight-goal]'); if (awg) awg.onclick = () => {
    const t = clampNum(fromDisp(+el('g-weight').value), 20, 300); if (!t) return toast('הכנס משקל יעד סביר');
    const cur = S.weights.length ? S.weights[S.weights.length - 1].kg : S.profile.weight;
    S.goals.push({ type: 'weight', target: t, start: cur }); save(); render(); toast('יעד נוסף 🎯');
  };
  const arg = document.querySelector('[data-add-reps-goal]'); if (arg) arg.onclick = () => {
    const exId = el('g-ex').value, target = parseInt(el('g-reps').value, 10);
    if (!target || target < 1) return toast('הכנס יעד חזרות');
    S.goals.push({ type: 'reps', exId, target }); save(); render(); toast('יעד נוסף 🎯');
  };
  document.querySelectorAll('[data-del-goal]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); S.goals.splice(+b.dataset.delGoal, 1); save(); render(); });
  const chDone = document.querySelector('[data-challenge-done]'); if (chDone) chDone.onclick = () => { S.challenges[todayStr()] = true; save(); render(); confetti(); tap(20); toast('אתגר הושלם! 🔥'); };
  document.querySelectorAll('[data-start-program]').forEach((b) => b.onclick = () => { S.activeProgram = { id: b.dataset.startProgram, start: todayStr() }; save(); render(); confetti(); toast('התוכנית התחילה! 🎯'); });
  const stopP = document.querySelector('[data-stop-program]'); if (stopP) stopP.onclick = () => { if (confirm('לעצור את התוכנית?')) { S.activeProgram = null; save(); render(); } };

  // ---- settings (live plan edits) ----
  document.querySelectorAll('[data-set-goal]').forEach((b) => b.onclick = () => {
    const id = b.dataset.setGoal; let gs = goalList(S.profile);
    gs = gs.includes(id) ? gs.filter((x) => x !== id) : [...gs, id];
    if (!gs.length) gs = [id];
    S.profile.goals = gs; S.profile.goal = gs[0]; save(); render(); toast('המטרות עודכנו ✓');
  });
  document.querySelectorAll('[data-set-days]').forEach((b) => b.onclick = () => { S.profile.days = +b.dataset.setDays; save(); render(); toast('התדירות עודכנה ✓'); });
  document.querySelectorAll('[data-set-level]').forEach((b) => b.onclick = () => { S.profile.level = +b.dataset.setLevel; save(); render(); toast('הרמה עודכנה ✓'); });
  document.querySelectorAll('[data-set-units]').forEach((b) => b.onclick = () => { S.profile.units = b.dataset.setUnits; save(); render(); });
  document.querySelectorAll('[data-set-theme]').forEach((b) => b.onclick = () => { S.theme = b.dataset.setTheme; save(); render(); });
  const tgS = document.querySelector('[data-toggle-sound]'); if (tgS) tgS.onclick = () => { S.sound = S.sound === false; save(); render(); };
  const tgV = document.querySelector('[data-toggle-vibrate]'); if (tgV) tgV.onclick = () => { S.vibrate = S.vibrate === false; save(); render(); if (S.vibrate) tap(20); };
  document.querySelectorAll('[data-set-injury]').forEach((b) => b.onclick = () => {
    const id = b.dataset.setInjury; let inj = (S.profile.injuries && S.profile.injuries.length) ? S.profile.injuries : ['none'];
    if (id === 'none') inj = [];
    else { inj = inj.filter((x) => x !== 'none' && x !== id).concat(inj.includes(id) ? [] : [id]); }
    S.profile.injuries = inj; save(); render();
  });

  const ep = document.querySelector('[data-edit-profile]'); if (ep) ep.onclick = () => { S.draft = { ...S.profile, goals: goalList(S.profile) }; S.onboardStep = 1; save(); go('onboard'); };
  const rs = document.querySelector('[data-reset]'); if (rs) rs.onclick = () => {
    if (confirm('לאפס את כל הנתונים ולהתחיל מחדש?')) { localStorage.removeItem(KEY); S = load(); go('onboard'); }
  };
  const ex = document.querySelector('[data-export]'); if (ex) ex.onclick = () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kin-backup-${todayStr()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('גיבוי נוצר ✓');
  };
  const im = document.querySelector('[data-import]'); if (im) im.onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          if (!data || typeof data !== 'object' || !('profile' in data)) throw new Error('bad');
          S = migrate({ ...structuredClone(DEFAULT_STATE), ...data }); refreshStreak(); save();
          go('home'); toast('המידע שוחזר ✓');
        } catch { toast('קובץ לא תקין'); }
      };
      r.readAsText(f);
    };
    inp.click();
  };
}

/* ============================================================
   BOOT
   ============================================================ */
render();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
