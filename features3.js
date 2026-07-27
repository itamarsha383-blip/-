/* ============================================================
   KIN — feature module (Wave 3): the calisthenics DIFFERENTIATOR.
   Skill trees + roadmaps to flagship skills, an assessment test,
   XP / levels / journey, and a hands-free guided follow-along mode.
   Registers into FEATURE_SCREENS. Self-contained, delegated events.
   ============================================================ */
(function () {
  'use strict';
  if (typeof S === 'undefined' || typeof window.FEATURE_SCREENS !== 'object') return;

  // ---- lazy state ----
  if (typeof S.xp !== 'number') S.xp = 0;
  if (typeof S.skillProgress !== 'object' || !S.skillProgress) S.skillProgress = {}; // {skillId:[doneMilestoneIdx]}
  if (typeof S.assessment !== 'object' || !S.assessment) S.assessment = null;        // {date, values}
  if (typeof S.skillOfMonth !== 'string') S.skillOfMonth = '';
  save();

  const today = () => new Date().toISOString().slice(0, 10);
  const backBtn = (to) => `<button class="back" data-fx="nav" data-to="${to || 'tools'}">›  חזרה</button>`;
  const num = (id) => { const v = parseFloat((document.getElementById(id) || {}).value); return Number.isFinite(v) ? v : null; };

  // ======================================================
  //  SKILL TREES — roadmaps to the flagship skills
  //  Each milestone is auto-checked from your PRs when possible
  //  (auto:{ex,val}) or marked manually for pure skill holds.
  // ======================================================
  const SKILLS = [
    {
      id: 'pullup_first', name: 'המתח הראשון', emoji: '🎯', cat: 'משיכה', level: 1,
      why: 'אבן היסוד לכל תרגילי המשיכה — שער הכניסה למאסל-אפ ולפרונט-לבר.',
      milestones: [
        { n: 'תליה פעילה 20 שנ׳', auto: { ex: 'pullup', val: 0 } },
        { n: 'משיכה שלילית איטית (5 שנ׳ ירידה)' },
        { n: 'מתח בעזרת גומייה 8 חזרות' },
        { n: 'מתח אחד מלא!', auto: { ex: 'pullup', val: 1 } },
        { n: '5 מתחים רצופים', auto: { ex: 'pullup', val: 5 } }
      ]
    },
    {
      id: 'muscleup', name: 'מאסל-אפ', emoji: '💪', cat: 'משיכה', level: 3,
      why: 'תרגיל הדגל של הקליסתניקס — שילוב כוח משיכה מתפרץ ומעבר לדחיפה.',
      milestones: [
        { n: '8 מתחים נקיים', auto: { ex: 'pullup', val: 8 } },
        { n: '8 מקבילים (dips)', auto: { ex: 'dip', val: 8 } },
        { n: 'מתח מתפרץ עד החזה' },
        { n: 'מעבר (transition) עם קפיצה' },
        { n: 'מאסל-אפ ראשון!' },
        { n: '3 מאסל-אפ רצופים' }
      ]
    },
    {
      id: 'handstand', name: 'עמידת ידיים', emoji: '🤸', cat: 'איזון', level: 2,
      why: 'שליטה, כוח כתפיים ואיזון — בסיס ל-HSPU ולתנועות יד.',
      milestones: [
        { n: 'פלאנק כתפיים 45 שנ׳', auto: { ex: 'plank', val: 45 } },
        { n: 'עמידת ידיים על הקיר 30 שנ׳' },
        { n: 'בעיטות לקיר (kick-ups)' },
        { n: 'עמידת ידיים חופשית 5 שנ׳' },
        { n: 'עמידת ידיים חופשית 20 שנ׳' }
      ]
    },
    {
      id: 'planche', name: 'פלאנש', emoji: '🦅', cat: 'דחיפה', level: 3,
      why: 'אחד המרשימים בקליסתניקס — כוח קו-אמצע וכתפיים יוצא דופן.',
      milestones: [
        { n: 'פלאנק מלא 60 שנ׳', auto: { ex: 'plank', val: 60 } },
        { n: 'Lean דחיפה קדמית 20 שנ׳' },
        { n: 'Tuck planche 10 שנ׳' },
        { n: 'Advanced tuck 10 שנ׳' },
        { n: 'Straddle planche 5 שנ׳' },
        { n: 'Full planche!' }
      ]
    },
    {
      id: 'frontlever', name: 'פרונט-לבר', emoji: '➖', cat: 'משיכה', level: 3,
      why: 'כוח גב וליבה איזומטרי — סקיל מפתח בטבעות ובמוט.',
      milestones: [
        { n: '10 מתחים', auto: { ex: 'pullup', val: 10 } },
        { n: 'Tuck front lever 10 שנ׳' },
        { n: 'Advanced tuck 10 שנ׳' },
        { n: 'One-leg front lever 5 שנ׳' },
        { n: 'Full front lever!' }
      ]
    },
    {
      id: 'pistol', name: 'פיסטול סקוואט', emoji: '🦵', cat: 'רגליים', level: 2,
      why: 'כוח רגל חד-צדדי, שיווי משקל וניידות קרסול — סקיל רגליים מלכותי.',
      milestones: [
        { n: '30 סקוואט משקל גוף', auto: { ex: 'squat', val: 30 } },
        { n: 'סקוואט בולגרי' },
        { n: 'פיסטול לספסל' },
        { n: 'פיסטול מלא ברגל אחת!' },
        { n: '5 פיסטול לכל רגל' }
      ]
    },
    {
      id: 'hspu', name: 'שכיבות עמידת ידיים', emoji: '🔺', cat: 'דחיפה', level: 3,
      why: 'דחיפה אנכית מקסימלית — הכנה ל-press handstand.',
      milestones: [
        { n: 'עמידת ידיים על קיר 30 שנ׳' },
        { n: 'Pike push-up 10 חזרות' },
        { n: 'HSPU חלקי (טווח מופחת)' },
        { n: 'HSPU מלא על קיר!' },
        { n: '5 HSPU רצופים' }
      ]
    },
    {
      id: 'humanflag', name: 'דגל אנושי', emoji: '🚩', cat: 'ליבה', level: 3,
      why: 'הסקיל הראוותני מכולם — כוח צד, אחיזה וליבה יוצאי דופן.',
      milestones: [
        { n: 'פלאנק צד 45 שנ׳' },
        { n: 'אחיזת דגל תמיכה' },
        { n: 'Chamber hold' },
        { n: 'דגל ברכיים מכופפות' },
        { n: 'דגל אנושי מלא!' }
      ]
    }
  ];
  window.SKILLS = SKILLS;

  function skillDone(sk) {
    const manual = S.skillProgress[sk.id] || [];
    let done = 0;
    sk.milestones.forEach((m, i) => {
      if (m.auto) { const best = (S.prs[m.auto.ex] && S.prs[m.auto.ex].best) || 0; if (best >= m.auto.val && m.auto.val > 0) return done++; if (m.auto.val === 0 && best >= 0 && manual.includes(i)) return done++; }
      if (manual.includes(i)) done++;
    });
    return Math.min(done, sk.milestones.length);
  }
  const skillPct = (sk) => Math.round(skillDone(sk) / sk.milestones.length * 100);

  // Rotating weekly skill challenge — deterministic by ISO week (no randomness needed).
  function isoWeek() { const d = new Date(); const on = new Date(d.getFullYear(), 0, 1); return Math.floor((d - on) / (7 * 864e5)); }
  const WEEKLY_CHALLENGES = [
    'החזק פלאנק 60 שניות ברצף', 'בצע 50 שכיבות סמיכה מצטברות היום', 'נסה 10 שניות עמידת ידיים על הקיר',
    'בצע 3 סטים של מקסימום מתח', '100 סקוואטים מצטברים היום', 'החזק tuck planche 10 שניות',
    '5 דקות ניידות כתפיים', 'נסה pistol squat לספסל לכל רגל'
  ];
  function weeklyChallengeCard() {
    const c = WEEKLY_CHALLENGES[isoWeek() % WEEKLY_CHALLENGES.length];
    const key = 'wc' + isoWeek(); const done = (S.weeklyChallengeDone || []).includes(key);
    return `<div class="card" style="border-color:${done ? 'var(--accent)' : 'var(--line)'}"><div class="between"><span class="flex"><span style="font-size:22px">🏁</span><span class="ex-name" style="font-size:14px">אתגר השבוע: ${c}</span></span>${done ? '<span class="pill accent">בוצע ✓</span>' : '<button class="btn sm" data-fx="wc-done">סיימתי</button>'}</div></div>`;
  }

  // --- Skill tree overview ---
  function ScreenSkills() {
    const cats = [...new Set(SKILLS.map((s) => s.cat))];
    const rec = S.skillOfMonth && SKILLS.find((s) => s.id === S.skillOfMonth);
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:4px">🌳 עץ המיומנויות</h2>
      <p class="muted" style="margin:0 0 12px">המסלול שלך לתרגילי הדגל של הקליסתניקס. כל סקיל = שרשרת אבני-דרך.</p>
      ${!S.assessment ? `<div class="card" style="border-color:var(--accent)"><div class="ex-name" style="margin-bottom:4px">📋 עשה מבחן הערכה</div><p class="muted" style="font-size:13px;margin:0 0 10px">2 דקות שממקמות אותך ומדליקות אוטומטית את אבני-הדרך שכבר עברת.</p><button class="btn" data-fx="nav" data-to="assess">התחל מבחן</button></div>` : ''}
      ${rec ? `<div class="card"><span class="pill accent">🎯 סקיל החודש</span> <b>${rec.emoji} ${rec.name}</b> — ${skillPct(rec)}% הושלם</div>` : ''}
      ${weeklyChallengeCard()}
      ${cats.map((c) => `<div class="section-title">${c}</div>
        ${SKILLS.filter((s) => s.cat === c).map((sk) => { const pct = skillPct(sk); const complete = pct === 100; return `<button class="skill-card ${complete ? 'done' : ''}" data-fx="nav" data-to="skill" data-id="${sk.id}">
          <span class="sk-emoji">${sk.emoji}</span>
          <span class="sk-body"><span class="sk-name">${sk.name} ${complete ? '✅' : ''}</span><span class="sk-meta">רמה ${['', 'מתחיל', 'בינוני', 'מתקדם'][sk.level]} · ${skillDone(sk)}/${sk.milestones.length} אבני דרך</span>
          <span class="mtrack" style="margin-top:6px"><span class="mfill" style="width:${pct}%"></span></span></span>
          <span class="sk-pct">${pct}%</span></button>`; }).join('')}`).join('')}
    </div>`;
  }

  // --- Single skill roadmap ---
  function ScreenSkill(params) {
    const sk = SKILLS.find((s) => s.id === (params && params.id)); if (!sk) return ScreenSkills();
    const manual = S.skillProgress[sk.id] || [];
    const isDone = (m, i) => {
      if (m.auto && m.auto.val > 0) { const best = (S.prs[m.auto.ex] && S.prs[m.auto.ex].best) || 0; if (best >= m.auto.val) return true; }
      return manual.includes(i);
    };
    const pct = skillPct(sk);
    const isMonth = S.skillOfMonth === sk.id;
    return `<div class="screen">${backBtn('skills')}
      <div class="center" style="margin:6px 0 14px"><div style="font-size:52px">${sk.emoji}</div>
        <h2 class="h-lg" style="margin-top:6px">${sk.name}</h2>
        <p class="muted" style="font-size:13.5px;max-width:320px;margin:6px auto 0">${sk.why}</p></div>
      <div class="card center" style="border-color:var(--accent)"><div class="h-xl" style="color:var(--accent)">${pct}%</div><div class="muted">${skillDone(sk)} מתוך ${sk.milestones.length} אבני דרך</div></div>
      <button class="btn ${isMonth ? 'ghost' : ''}" data-fx="skill-month" data-id="${sk.id}">${isMonth ? '🎯 סקיל החודש הנוכחי' : '🎯 הגדר כסקיל החודש'}</button>
      <div class="section-title">מפת הדרך 🗺️</div>
      <div class="roadmap">${sk.milestones.map((m, i) => { const done = isDone(m, i); const auto = m.auto && m.auto.val > 0; return `<div class="rm-step ${done ? 'done' : ''}">
        <div class="rm-dot">${done ? '✓' : i + 1}</div>
        <div class="rm-body"><div class="rm-name">${m.n}</div>${auto ? `<div class="rm-meta">נבדק אוטומטית מהשיאים שלך (${m.auto.val}+ ${m.auto.ex === 'plank' ? 'שנ׳' : 'חזרות'})</div>` : ''}</div>
        ${!auto ? `<button class="react-btn" data-fx="ms-toggle" data-sk="${sk.id}" data-i="${i}">${done ? 'בוצע ✓' : 'סמן'}</button>` : done ? '<span class="pill accent">✓</span>' : '<span class="pill">נעול</span>'}
      </div>`; }).join('')}</div>
      ${pct === 100 ? `<div class="card center" style="border-color:var(--accent);margin-top:12px"><div style="font-size:36px">🏆</div><div class="ex-name" style="margin-bottom:8px">כבשת את ${sk.name}!</div><button class="btn sm" data-fx="skill-cert" data-id="${sk.id}">📜 קבל תעודה לשיתוף</button></div>` : ''}
    </div>`;
  }

  // --- Assessment test ---
  function ScreenAssess() {
    const fld = (id, lab, unit) => `<label class="fld">${lab}<input class="input" id="a-${id}" type="number" inputmode="numeric" placeholder="${unit}"></label>`;
    return `<div class="screen">${backBtn('skills')}
      <h2 class="h-lg" style="margin-bottom:6px">📋 מבחן הערכה</h2>
      <p class="muted" style="margin:0 0 14px">הזן את המקסימום הנוכחי שלך בכל תרגיל. נשתמש בזה כדי לפתוח אבני-דרך, לחשב תקני כוח ולהמליץ על סקיל יעד. (0 זה בסדר גמור!)</p>
      <div class="card">
        <div class="row2">${fld('pushup', 'שכיבות סמיכה', 'חזרות')}${fld('pullup', 'מתח', 'חזרות')}</div>
        <div class="row2" style="margin-top:8px">${fld('dip', 'מקבילים', 'חזרות')}${fld('squat', 'סקוואט', 'חזרות')}</div>
        <div class="row2" style="margin-top:8px">${fld('plank', 'פלאנק', 'שניות')}${fld('legraise', 'הרמות רגליים', 'חזרות')}</div>
        <button class="btn" style="margin-top:14px" data-fx="assess-save">💾 שמור והמלץ לי סקיל</button>
      </div>
    </div>`;
  }

  // --- Journey / XP / level ---
  function levelInfo() {
    const xp = S.xp || 0;
    let lvl = 1, need = 100, acc = 0;
    while (xp >= acc + need) { acc += need; lvl++; need = 100 + (lvl - 1) * 50; }
    return { lvl, into: xp - acc, need, xp };
  }
  const RANKS = ['מתחיל', 'חניך', 'מתאמן', 'לוחם', 'אתלט', 'ותיק', 'מאסטר', 'אלוף', 'אגדה'];
  // Streak pet grows with your best streak — a little companion to keep momentum.
  function streakPet(streak) {
    if (streak >= 30) return { emoji: '🐉', name: 'דרקון הרצף', hint: 'רצף שיא 30+ — אגדי!' };
    if (streak >= 21) return { emoji: '🦁', name: 'אריה', hint: 'רצף 21+ — בלתי ניתן לעצירה' };
    if (streak >= 14) return { emoji: '🐺', name: 'זאב', hint: 'רצף 14+ — חיה' };
    if (streak >= 7) return { emoji: '🦊', name: 'שועל', hint: 'רצף 7+ — מתחמם' };
    if (streak >= 3) return { emoji: '🐣', name: 'אפרוח', hint: 'רצף 3+ — גדל!' };
    return { emoji: '🥚', name: 'ביצה', hint: 'התאמן 3 ימים ברצף כדי לבקוע' };
  }
  function ScreenJourney() {
    const li = levelInfo();
    const rank = RANKS[Math.min(RANKS.length - 1, Math.floor((li.lvl - 1) / 2))];
    const skillsDone = SKILLS.filter((s) => skillPct(s) === 100).length;
    const quests = [
      ['אמן היום', S.lastWorkout === today(), 20],
      ['רשום תזונה היום', (S.nutrition[today()] || []).length > 0, 15],
      ['שתה מים (יעד)', (S.water && S.water[today()] || 0) > 0, 10],
      ['בדוק מוכנות', !!(S.readiness && S.readiness[today()]), 10]
    ];
    const pet = streakPet(S.maxStreak || 0);
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:4px">🎮 המסע שלי</h2>
      <div class="card center"><div style="font-size:52px;line-height:1">${pet.emoji}</div><div class="ex-name" style="margin-top:4px">${pet.name}</div><div class="muted" style="font-size:12px">${pet.hint}</div></div>
      <div class="card center" style="border-color:var(--accent)">
        <div class="muted">${rank}</div>
        <div class="h-xl" style="color:var(--accent)">רמה ${li.lvl}</div>
        <div class="mtrack" style="margin:10px 0 6px"><div class="mfill" style="width:${Math.round(li.into / li.need * 100)}%"></div></div>
        <div class="muted" style="font-size:12px">${li.into}/${li.need} XP לרמה הבאה · סה״כ ${li.xp} XP</div>
      </div>
      <div class="row3" style="margin-top:4px">
        <div class="card center"><div class="h-lg" style="color:var(--accent)">${S.workoutsLog.length}</div><div class="muted" style="font-size:11px">אימונים</div></div>
        <div class="card center"><div class="h-lg" style="color:var(--accent)">${skillsDone}</div><div class="muted" style="font-size:11px">סקילים</div></div>
        <div class="card center"><div class="h-lg" style="color:var(--accent)">${S.maxStreak || 0}</div><div class="muted" style="font-size:11px">רצף שיא</div></div>
      </div>
      <div class="section-title">משימות היום ⚡</div>
      <div class="card">${quests.map((q, i) => `<div class="between" style="padding:9px 0;${i ? 'border-top:1px solid var(--line)' : ''}"><span class="flex"><span>${q[1] ? '✅' : '⬜'}</span><span class="${q[1] ? 'muted' : ''}">${q[0]}</span></span><span class="pill ${q[1] ? 'accent' : ''}">${q[2]} XP</span></div>`).join('')}</div>
      <p class="muted center" style="font-size:12px;margin-top:8px">מרוויחים XP על אימונים, שיאים ואבני-דרך של סקילים.</p>
    </div>`;
  }

  // --- Guided follow-along mode ---
  let guided = null;
  function startGuided() {
    const sess = (typeof todaysSession === 'function') ? todaysSession() : null;
    if (!sess || !sess.main.length) return toast('אין אימון להיום');
    // Flatten into timed steps: each main exercise → sets, with work/rest.
    const steps = [];
    steps.push({ kind: 'say', text: 'מתחילים. ' + sess.warmup.map((w) => w.name).join(', ') + ' לחימום', sec: 3 });
    sess.main.forEach((e) => {
      for (let s = 0; s < e.sets; s++) {
        steps.push({ kind: 'work', name: e.name, set: s + 1, sets: e.sets, reps: e.reps, hold: e.holdSec, sec: e.holdSec || 40, emoji: e.emoji });
        if (!(s === e.sets - 1)) steps.push({ kind: 'rest', sec: Math.min(e.rest, 60), name: e.name });
      }
      steps.push({ kind: 'rest', sec: Math.min(e.rest, 60), name: 'הבא' });
    });
    guided = { steps, idx: 0, sess };
    go('guided');
    setTimeout(runGuided, 60);
  }
  let guidedTimer = null;
  function runGuided() {
    if (!guided) return;
    const stage = document.getElementById('guided-stage'); if (!stage) return;
    if (guidedTimer) clearInterval(guidedTimer);
    const st = guided.steps[guided.idx];
    if (!st) return finishGuided();
    let left = st.sec;
    if (typeof speakCue === 'function') { if (st.kind === 'work') speakCue(st.name + (st.hold ? ' החזק' : '')); else if (st.kind === 'rest') speakCue('מנוחה'); else speakCue(st.text); }
    const draw = () => {
      const total = guided.steps.length;
      stage.innerHTML = `<div class="guided-full ${st.kind}">
        <div class="g-top">${guided.idx + 1}/${total}</div>
        <div class="g-mid">
          <div class="g-label">${st.kind === 'work' ? (st.emoji || '💪') + ' ' + st.name : st.kind === 'rest' ? '🌬️ מנוחה' : '🚀'}</div>
          ${st.kind === 'work' ? `<div class="g-sub">סט ${st.set}/${st.sets} · ${st.reps}</div>` : st.kind === 'rest' ? `<div class="g-sub">הבא: ${st.name}</div>` : `<div class="g-sub">${st.text}</div>`}
          <div class="g-timer">${left}</div>
        </div>
        <div class="g-btns"><button class="btn ghost" data-fx="g-skip">דלג ›</button><button class="btn ghost" data-fx="g-quit">סיים</button></div>
      </div>`;
    };
    draw();
    guidedTimer = setInterval(() => {
      left--;
      if (left <= 3 && left > 0 && typeof beep === 'function') beep(1200, 0.07);
      if (left <= 0) { clearInterval(guidedTimer); if (typeof beep === 'function') beep(880); guided.idx++; runGuided(); }
      else { const t = stage.querySelector('.g-timer'); if (t) t.textContent = left; }
    }, 1000);
  }
  function finishGuided() {
    if (guidedTimer) clearInterval(guidedTimer);
    const sess = guided && guided.sess; guided = null;
    // log like a real workout
    if (sess) {
      S.workoutsLog.push({ date: today(), name: sess.name + ' · מודרך', exercises: sess.main.map((e) => e.id) });
      if (typeof refreshStreak === 'function') refreshStreak(); save();
      awardXP(20, 'אימון הושלם');
      if (typeof confetti === 'function') confetti();
      if (typeof checkBadges === 'function') checkBadges();
      if (typeof Cloud !== 'undefined' && Cloud.enabled() && Cloud.postEvent) { Cloud.resetCache(); Cloud.syncSelf({ workouts: S.workoutsLog.length, streak: S.streak }).catch(() => {}); Cloud.postEvent('workout', 'סיים אימון מודרך 🔥').catch(() => {}); }
    }
    go('home');
    if (typeof speakCue === 'function') speakCue('כל הכבוד, סיימת');
  }
  function ScreenGuided() {
    return `<div class="screen guided-screen"><div id="guided-stage"></div></div>`;
  }

  // ---------------- XP engine ----------------
  function awardXP(amount, reason) {
    const before = levelInfo().lvl;
    S.xp = (S.xp || 0) + amount; save();
    const after = levelInfo().lvl;
    if (after > before) { if (typeof confetti === 'function') confetti(); setTimeout(() => toast('🎉 עלית לרמה ' + after + '!'), 300); }
  }
  window.awardXP = awardXP;

  // hook workout completion (wrap core finishWorkout) to grant XP + skill checks
  if (typeof window.finishWorkout === 'function' && !window._xpWrapped) {
    const orig = window.finishWorkout;
    window.finishWorkout = function () {
      const prsBefore = Object.keys(S.prs).length;
      orig.apply(this, arguments);
      let xp = 20;
      const prsAfter = Object.keys(S.prs).length;
      if (prsAfter > prsBefore) xp += 15 * (prsAfter - prsBefore);
      checkSkillMilestones();
      awardXP(xp, 'אימון');
    };
    window._xpWrapped = true;
  }
  function checkSkillMilestones() {
    // auto-complete + XP for newly-reached auto milestones
    SKILLS.forEach((sk) => {
      sk.milestones.forEach((m, i) => {
        if (m.auto && m.auto.val > 0) {
          const best = (S.prs[m.auto.ex] && S.prs[m.auto.ex].best) || 0;
          const set = S.skillProgress[sk.id] = S.skillProgress[sk.id] || [];
          if (best >= m.auto.val && !set.includes('a' + i)) { set.push('a' + i); awardXP(50, 'אבן דרך'); setTimeout(() => toast(`🏅 ${sk.name}: ${m.n}!`), 600); }
        }
      });
    });
    save();
  }

  // ---------------- actions ----------------
  const FX3 = {
    'ms-toggle': (t2) => {
      const sk = t2.dataset.sk, i = +t2.dataset.i;
      const set = S.skillProgress[sk] = S.skillProgress[sk] || [];
      const at = set.indexOf(i);
      if (at >= 0) set.splice(at, 1); else { set.push(i); awardXP(50, 'אבן דרך'); }
      save(); render();
    },
    'skill-month': (t2) => { S.skillOfMonth = S.skillOfMonth === t2.dataset.id ? '' : t2.dataset.id; save(); render(); },
    'wc-done': () => { const key = 'wc' + isoWeek(); S.weeklyChallengeDone = S.weeklyChallengeDone || []; if (!S.weeklyChallengeDone.includes(key)) { S.weeklyChallengeDone.push(key); awardXP(30, 'אתגר שבועי'); } save(); toast('כל הכבוד! +30 XP'); render(); },
    'skill-cert': (t2) => { const sk = SKILLS.find((s) => s.id === t2.dataset.id); if (sk) skillCertificate(sk); },
    'assess-save': () => {
      const map = { pushup: 'pushup', pullup: 'pullup', dip: 'dip', squat: 'squat', plank: 'plank', legraise: 'legraise' };
      const vals = {};
      Object.keys(map).forEach((k) => { const v = num('a-' + k); if (v != null) { vals[k] = v; S.prs[k] = { best: v, date: today() }; } });
      S.assessment = { date: today(), values: vals };
      checkSkillMilestones();
      // recommend nearest skill
      let best = null, bestPct = -1;
      SKILLS.forEach((sk) => { const p = skillPct(sk); if (p < 100 && p > bestPct) { bestPct = p; best = sk; } });
      if (best) S.skillOfMonth = best.id;
      save(); awardXP(30, 'מבחן הערכה');
      toast(best ? `הומלץ: ${best.emoji} ${best.name}` : 'נשמר ✓');
      go('skills');
    },
    'g-skip': () => { if (guided) { if (guidedTimer) clearInterval(guidedTimer); guided.idx++; runGuided(); } },
    'g-quit': () => { if (guidedTimer) clearInterval(guidedTimer); guided = null; go('workouts'); },
    'start-guided': () => startGuided()
  };
  document.addEventListener('click', (ev) => {
    const t2 = ev.target.closest('[data-fx]'); if (!t2) return;
    const fn = FX3[t2.dataset.fx]; if (fn) { ev.preventDefault(); ev.stopPropagation(); try { fn(t2, ev); } catch (e) { console.error('fx3', t2.dataset.fx, e); } }
  });
  // stop guided timer if navigating away
  const _go = window.go;
  window.go = function (name, params) { if (route.name === 'guided' && name !== 'guided' && guidedTimer) { clearInterval(guidedTimer); } _go(name, params); };

  // Shareable skill certificate (canvas → share/download).
  async function skillCertificate(sk) {
    try {
      const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
      const ctx = cv.getContext('2d'); ctx.textAlign = 'center'; ctx.direction = 'rtl';
      const g = ctx.createLinearGradient(0, 0, 0, 1350); g.addColorStop(0, '#12181f'); g.addColorStop(1, '#0B0E11');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1350);
      ctx.strokeStyle = '#C6FF3D'; ctx.lineWidth = 6; ctx.strokeRect(50, 50, 980, 1250);
      ctx.fillStyle = '#C6FF3D'; ctx.font = '900 70px sans-serif'; ctx.fillText('KIN', 540, 180);
      ctx.fillStyle = '#8A97A6'; ctx.font = '34px sans-serif'; ctx.fillText('תעודת מיומנות', 540, 250);
      ctx.font = '200px sans-serif'; ctx.fillText(sk.emoji, 540, 560);
      ctx.fillStyle = '#EDF1F5'; ctx.font = 'bold 68px sans-serif'; ctx.fillText(sk.name, 540, 700);
      ctx.fillStyle = '#8A97A6'; ctx.font = '38px sans-serif'; ctx.fillText('הוענקה ל', 540, 800);
      ctx.fillStyle = '#C6FF3D'; ctx.font = 'bold 60px sans-serif'; ctx.fillText(S.profile.name || 'אלוף', 540, 880);
      ctx.fillStyle = '#EDF1F5'; ctx.font = '34px sans-serif'; ctx.fillText('על כיבוש כל אבני הדרך', 540, 970);
      ctx.fillStyle = '#8A97A6'; ctx.font = '30px sans-serif'; ctx.fillText(new Date().toLocaleDateString('he-IL'), 540, 1200);
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      const file = new File([blob], 'kin-certificate.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: `כבשתי ${sk.name} ב-KIN! 🏆` });
      else { const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'kin-certificate.png'; a.click(); }
    } catch (e) { toast('לא הצלחתי ליצור תעודה'); }
  }

  Object.assign(window.FEATURE_SCREENS, { skills: ScreenSkills, skill: ScreenSkill, assess: ScreenAssess, journey: ScreenJourney, guided: ScreenGuided });
  window.FEATURE_ROUTES = Object.keys(window.FEATURE_SCREENS);
  window._skillPct = skillPct; // reused by wave 5 (rare achievements)
})();
