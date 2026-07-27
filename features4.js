/* ============================================================
   KIN — feature module (Wave 4): AI coach chat, goal ETA
   prediction, injury-rehab paths, and cycle-aware training.
   ============================================================ */
(function () {
  'use strict';
  if (typeof S === 'undefined' || typeof window.FEATURE_SCREENS !== 'object') return;

  if (typeof S.cycle !== 'object' || !S.cycle) S.cycle = null; // {lastStart, length}
  save();

  const today = () => new Date().toISOString().slice(0, 10);
  const backBtn = (to) => `<button class="back" data-fx="nav" data-to="${to || 'tools'}">›  חזרה</button>`;
  const num = (id) => { const v = parseFloat((document.getElementById(id) || {}).value); return Number.isFinite(v) ? v : null; };

  // ======================================================
  //  AI Coach — rules-based, grounded in the user's own data
  // ======================================================
  let chatLog = [{ who: 'coach', text: 'היי! אני המאמן שלך 🏋️ שאל אותי כל דבר — תזונה, טכניקה, התקדמות, פציעות, או מה לעשות היום.' }];
  const QUICK = ['מה לאכול היום?', 'כמה חלבון?', 'מתי אגיע ליעד?', 'איך משתפרים במתח?', 'כואב לי — מה לעשות?', 'מה האימון היום?'];

  function coachReply(qRaw) {
    const q = (qRaw || '').trim(); const p = S.profile; const mt = (typeof macroTargets === 'function') ? macroTargets(p) : nutritionPlan(p);
    const has = (...w) => w.some((x) => q.includes(x));
    if (has('חלבון')) return `היעד היומי שלך: <b>${mt.protein} גרם חלבון</b> (בערך ${Math.round(mt.protein / 4)}ג׳ בכל אחת מ-4 ארוחות). מקורות טובים: עוף, ביצים, טונה, קוטג׳, עדשים.`;
    if (has('לאכול', 'תזונה', 'ארוחה', 'קלוריות')) return `היעד: <b>${mt.kcal} קלוריות</b> · ${mt.protein}ג׳ חלבון · ${mt.carbs}ג׳ פחמימה · ${mt.fat}ג׳ שומן · ${mt.water} ליטר מים. פתח את מסך "תזונה" כדי לרשום ולראות כמה נשאר.`;
    if (has('מתח', 'מאסל', 'פלאנש', 'סקיל', 'מיומנות')) return `מעולה שאתה שואף לסקיל! פתח את <b>עץ המיומנויות</b> — יש שם מפת דרך מדויקת עם אבני-דרך. הכלל: שלוט בכל שלב עם טכניקה מלאה לפני שעולים. עקביות > עצימות.`;
    if (has('כואב', 'פציעה', 'כאב', 'נקע')) return `אם יש כאב חד — עצור והתמקד ב<b>מסלול השיקום</b> (במסך הכלים). כלל אצבע: כאב מפרקי = מנוחה + ניידות; תפיסת שריר קלה = חימום ותנועה קלה. אם הכאב חזק/מתמשך — פנה לרופא.`;
    if (has('יעד', 'מתי', 'כמה זמן', 'תחזית')) return `פתח את <b>חיזוי היעד</b> (בכלים) — לפי מגמת המשקל וקצב האימונים שלך אני מעריך מתי תגיע. טיפ: 3–4 אימונים בשבוע באופן עקבי זה מה שמזיז את המחט.`;
    if (has('היום', 'אימון')) { const s = (typeof todaysSession === 'function') ? todaysSession() : null; return s ? `האימון להיום: <b>${s.name}</b> — ${s.main.map((e) => e.name).join(', ')}. כ-${s.main.length} תרגילים, ${s.rx.sets} סטים. ${s.ageBand && s.ageBand.note ? '👤 ' + s.ageBand.note : ''}` : 'פתח את מסך "אימון" כדי לראות את התוכנית של היום.'; }
    if (has('רזה', 'שומן', 'לרדת')) return `לירידה בשומן: גירעון קלורי מתון (היעד שלך כבר מכוון לזה — ${mt.kcal} קל׳), חלבון גבוה (${mt.protein}ג׳) לשמירת שריר, ו-3–4 אימונים + הליכה. סבלנות: 0.5–1% ממשקל הגוף לשבוע זה קצב בריא.`;
    if (has('שריר', 'מסה', 'לעלות', 'להתחזק')) return `לבניית שריר: עומס מתקדם (המנוע האדפטיבי שלנו דואג לזה), ${mt.protein}ג׳ חלבון, שינה טובה, ועודף קלורי קטן. תעדף תרגילים מורכבים ותוסיף חזרה/סט כשמרגיש קל.`;
    if (has('רצף', 'מוטיבציה', 'עצל', 'קשה לי')) return `הרצף הנוכחי שלך: <b>${S.streak} ימים</b> 🔥. אם קשה היום — עשה "אימון מהיר" של 10 דק׳ או יום מנוחה פעיל. ואל תשכח: יש לך אסימוני הקפאת רצף כדי לא לאבד מומנטום.`;
    if (has('שלום', 'היי', 'היי', 'מה נשמע')) return `היי ${p.name}! מוכן לזוז? שאל אותי כל דבר או לחץ על אחת ההצעות למטה 👇`;
    return `שאלה טובה! אני מאמן מבוסס-כללים, אז אני הכי חזק בנושאים: תזונה, יעדים, טכניקה, סקילים, פציעות ומה לעשות היום. נסה אחת מההצעות למטה, או נסח מחדש 🙂`;
  }
  function ScreenCoachAI() {
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:10px">🤖 מאמן KIN</h2>
      <div class="chat">${chatLog.map((m) => `<div class="msg ${m.who}">${m.text}</div>`).join('')}</div>
      <div class="chips" style="margin:10px 0">${QUICK.map((q) => `<button class="chip" data-fx="coach-q" data-q="${esc(q)}" style="flex:0 0 auto;padding:8px 12px"><div class="t" style="font-size:12px">${q}</div></button>`).join('')}</div>
      <div class="row2" style="grid-template-columns:1fr auto"><input class="input" id="coach-in" placeholder="שאל את המאמן…"><button class="btn sm" data-fx="coach-send">שלח</button></div>
    </div>`;
  }

  // ======================================================
  //  Goal ETA prediction
  // ======================================================
  function linTrendPerWeek(points) { // points: [{date,kg}] → kg/week slope
    if (points.length < 2) return null;
    const t0 = new Date(points[0].date).getTime();
    const xs = points.map((p) => (new Date(p.date).getTime() - t0) / (7 * 864e5));
    const ys = points.map((p) => p.kg);
    const n = xs.length, sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
    const sxx = xs.reduce((a, b) => a + b * b, 0), sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
    const d = n * sxx - sx * sx; if (!d) return null;
    return (n * sxy - sx * sy) / d;
  }
  function ScreenPredict() {
    const w = (S.weights || []).slice().sort((a, b) => a.date < b.date ? -1 : 1);
    const cur = w.length ? w[w.length - 1].kg : (S.profile.weight || null);
    const slope = linTrendPerWeek(w);
    const consistency = (() => { const wk = {}; S.workoutsLog.forEach((x) => { const d = new Date(x.date); const key = d.getFullYear() + '-' + Math.floor((d - new Date(d.getFullYear(), 0, 1)) / (7 * 864e5)); wk[key] = (wk[key] || 0) + 1; }); const vals = Object.values(wk); return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0; })();
    let weightCard = `<div class="card"><p class="muted" style="font-size:13px;margin:0">רשום לפחות 2 שקילות (במסך מדידות/התקדמות) כדי שאחשב תחזית משקל.</p></div>`;
    if (cur != null && slope != null && Math.abs(slope) > 0.02) {
      const dir = slope < 0 ? 'יורד' : 'עולה';
      weightCard = `<div class="card"><div class="ex-name" style="margin-bottom:6px">📉 מגמת משקל</div>
        <p class="muted" style="font-size:14px;color:var(--text)">המשקל שלך ${dir} בקצב <b>${Math.abs(slope).toFixed(2)} ק״ג/שבוע</b>. במשקל נוכחי ${cur.toFixed(1)} ק״ג.</p>
        <label class="fld" style="margin-top:10px">משקל יעד (ק״ג)<input class="input" id="pr-target" type="number" inputmode="decimal" placeholder="לדוגמה ${Math.round(cur + (slope < 0 ? -4 : 4))}"></label>
        <button class="btn sm" style="margin-top:8px" data-fx="predict-eta">חשב מתי אגיע</button><div id="eta-out"></div></div>`;
    }
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:10px">🔮 חיזוי יעד</h2>
      ${weightCard}
      <div class="section-title">עקביות</div>
      <div class="card"><p class="muted" style="font-size:14px;color:var(--text)">אתה מתאמן בממוצע <b>${consistency}</b> פעמים בשבוע. ${consistency >= (S.profile.days || 3) ? 'עומד ביעד — ככה מגיעים לתוצאות! 🎯' : 'העלאה ל-' + (S.profile.days || 3) + ' תאיץ את ההתקדמות.'}</p></div>
      <p class="muted center" style="font-size:12px;margin-top:8px">תחזיות סטטיסטיות מהמגמה שלך — לא הבטחה. הגוף לא ליניארי 🙂</p>`;
  }

  // ======================================================
  //  Injury rehab paths
  // ======================================================
  const REHAB = {
    shoulder: { name: 'כתף', emoji: '💪', phases: ['מנוחה 2–3 ימים + קרח אם יש נפיחות', 'ניידות עדינה: מעגלי כתף, מטוטלת, מתיחת חזה', 'חיזוק בנד: רוטציה חיצונית, scapular retraction', 'חזרה הדרגתית: שכיבות על הברכיים → מלאות'] },
    knee: { name: 'ברך', emoji: '🦵', phases: ['הפחתת עומס, הימנע מכיפוף עמוק כואב', 'ניידות: הרמות רגל ישרה, מתיחת ירך אחורית', 'חיזוק: גשר ישבן, סקוואט חלקי לספסל', 'חזרה: סקוואט מלא → לאנג׳ בזהירות'] },
    back: { name: 'גב תחתון', emoji: '🔙', phases: ['מנוחה יחסית, שמור על גב ניטרלי', 'ניידות: cat-cow, ברכיים לחזה, McGill big-3', 'חיזוק ליבה: פלאנק, bird-dog, dead bug', 'חזרה: hinge קל → הדרגתי'] },
    wrist: { name: 'שורש כף יד', emoji: '✋', phases: ['מנוחה, הימנע מעומס בכף יד', 'ניידות: מתיחות כף יד עדינות לכל הכיוונים', 'חיזוק: כיפוף/יישור עם משקל קל', 'חזרה: תמיכה על אגרוף/מוט → כף יד'] }
  };
  function ScreenRehab(params) {
    const sel = params && params.area;
    if (sel && REHAB[sel]) {
      const r = REHAB[sel];
      return `<div class="screen">${backBtn('rehab')}
        <div class="center" style="margin:6px 0 14px"><div style="font-size:48px">${r.emoji}</div><h2 class="h-lg" style="margin-top:6px">שיקום ${r.name}</h2></div>
        <div class="card" style="border-color:#FFA23D"><p class="muted" style="font-size:13px;margin:0;color:var(--text)">⚠️ זה מדריך כללי לחזרה מכאב קל. כאב חד, נפיחות משמעותית או חוסר תפקוד — פנה לרופא/פיזיותרפיסט.</p></div>
        <div class="section-title">4 שלבי החזרה</div>
        <div class="roadmap">${r.phases.map((ph, i) => `<div class="rm-step"><div class="rm-dot">${i + 1}</div><div class="rm-body"><div class="rm-name" style="font-size:13.5px">${ph}</div></div></div>`).join('')}</div>
        <p class="muted center" style="font-size:12px;margin-top:8px">עבור שלב רק כשאין כאב בשלב הנוכחי. סבלנות מנצחת.</p></div>`;
    }
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:6px">🩹 מסלול שיקום</h2>
      <p class="muted" style="margin:0 0 12px">חזרה בטוחה מכאב קל, לפי אזור. בחר:</p>
      <div class="tool-grid">${Object.entries(REHAB).map(([k, r]) => `<button class="tool-card" data-fx="nav" data-to="rehab" data-area="${k}"><span class="te">${r.emoji}</span><span class="tt">${r.name}</span></button>`).join('')}</div>`;
  }

  // ======================================================
  //  Cycle-aware training
  // ======================================================
  function ScreenCycle() {
    const c = S.cycle;
    let phaseCard = '';
    if (c && c.lastStart) {
      const day = Math.floor((Date.now() - new Date(c.lastStart).getTime()) / 864e5) % (c.length || 28) + 1;
      const phase = day <= 5 ? ['מחזור', 'עצימות לפי ההרגשה, ניידות ומנוחה זה בסדר גמור.']
        : day <= 13 ? ['פוליקולרית', 'אנרגיה גבוהה — זמן מצוין לאימוני כוח וסקילים! 💪']
          : day <= 15 ? ['ביוץ', 'שיא כוח — נצל לאימון עצים או ניסיון שיא.']
            : ['לוטאלית', 'ייתכן עייפות — עצימות מתונה, דגש על טכניקה ושינה.'];
      const nextIn = (c.length || 28) - day + 1;
      phaseCard = `<div class="card" style="border-color:var(--accent)"><div class="between"><span class="ex-name">יום ${day} · ${phase[0]}</span><span class="pill">מחזור צפוי בעוד ~${nextIn} ימים</span></div><p class="muted" style="font-size:13.5px;margin:8px 0 0;color:var(--text)">${phase[1]}</p></div>`;
    }
    return `<div class="screen">${backBtn('tools')}
      <h2 class="h-lg" style="margin-bottom:6px">🌙 מעקב מחזור</h2>
      <p class="muted" style="margin:0 0 12px">התאמת עצימות האימון לשלב המחזור — פרטי לחלוטין, נשמר רק אצלך במכשיר.</p>
      ${phaseCard}
      <div class="card">
        <label class="fld">תאריך תחילת מחזור אחרון<input class="input" id="cy-start" type="date" value="${c && c.lastStart || ''}"></label>
        <label class="fld" style="margin-top:8px">אורך מחזור ממוצע (ימים)<input class="input" id="cy-len" type="number" inputmode="numeric" value="${c && c.length || 28}"></label>
        <button class="btn" style="margin-top:12px" data-fx="cycle-save">💾 שמור</button>
      </div>
      <p class="muted center" style="font-size:12px;margin-top:8px">אופציונלי. עוזר להתאים אימונים לאנרגיה הטבעית של הגוף.</p>`;
  }

  // ---------------- actions ----------------
  const FX4 = {
    'coach-q': (t2) => { const q = t2.dataset.q; chatLog.push({ who: 'me', text: q }); chatLog.push({ who: 'coach', text: coachReply(q) }); render(); scrollChat(); },
    'coach-send': () => { const inp = document.getElementById('coach-in'); const q = inp && inp.value.trim(); if (!q) return; chatLog.push({ who: 'me', text: esc(q) }); chatLog.push({ who: 'coach', text: coachReply(q) }); render(); scrollChat(); },
    'predict-eta': () => {
      const w = (S.weights || []).slice().sort((a, b) => a.date < b.date ? -1 : 1);
      const cur = w.length ? w[w.length - 1].kg : S.profile.weight;
      const slope = linTrendPerWeek(w); const target = num('pr-target');
      const out = document.getElementById('eta-out'); if (!out) return;
      if (target == null || !slope) { out.innerHTML = '<p class="muted" style="font-size:13px">הזן משקל יעד.</p>'; return; }
      const diff = target - cur;
      if (diff * slope <= 0) { out.innerHTML = `<p class="muted" style="font-size:13px;margin-top:8px">המגמה הנוכחית מתרחקת מהיעד — נצטרך לכוונן תזונה/אימונים כדי להתקדם לכיוון ${target} ק״ג.</p>`; return; }
      const weeks = Math.abs(diff / slope);
      const d = new Date(); d.setDate(d.getDate() + Math.round(weeks * 7));
      out.innerHTML = `<div class="card" style="margin-top:10px;border-color:var(--accent)"><b>הערכה:</b> בקצב הנוכחי תגיע ל-${target} ק״ג בעוד כ-<b>${Math.round(weeks)} שבועות</b> (בערך ${d.toLocaleDateString('he-IL')}).</div>`;
    },
    'cycle-save': () => { const st = (document.getElementById('cy-start') || {}).value; const len = num('cy-len') || 28; if (!st) return toast('בחר תאריך'); S.cycle = { lastStart: st, length: len }; save(); toast('נשמר ✓'); render(); }
  };
  function scrollChat() { setTimeout(() => { const c = document.querySelector('.chat'); if (c) c.scrollTop = c.scrollHeight; }, 40); }
  document.addEventListener('click', (ev) => {
    const t2 = ev.target.closest('[data-fx]'); if (!t2) return;
    const fn = FX4[t2.dataset.fx]; if (fn) { ev.preventDefault(); ev.stopPropagation(); try { fn(t2, ev); } catch (e) { console.error('fx4', t2.dataset.fx, e); } }
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target && ev.target.id === 'coach-in') { ev.preventDefault(); FX4['coach-send'](); } });

  Object.assign(window.FEATURE_SCREENS, { coachai: ScreenCoachAI, predict: ScreenPredict, rehab: ScreenRehab, cycle: ScreenCycle });
  window.FEATURE_ROUTES = Object.keys(window.FEATURE_SCREENS);
})();
