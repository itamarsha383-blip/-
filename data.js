/* ============================================================
   KIN — content library
   Exercise DB + food DB + workout program builder.
   Kept as plain data so it's trivial to expand later.
   ============================================================ */

// --- Exercise library -------------------------------------------------
// level: 1=מתחיל, 2=בינוני, 3=מתקדם
// type: 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'mobility'
// emoji is a temporary stand-in for the animated demo video (phase 2).
const EXERCISES = [
  {
    id: 'pushup', name: 'שכיבות סמיכה', emoji: '🙇‍♂️', type: 'push', level: 1,
    muscles: ['חזה', 'כתפיים', 'טרייספס'], equip: 'none', metVal: 8,
    steps: [
      'כפות ידיים על הרצפה מעט רחב מהכתפיים.',
      'גוף ישר כמו קרש — בטן אסופה, ישבן לא עולה.',
      'רד עד שהחזה כמעט נוגע ברצפה, מרפקים ב־45°.',
      'דחוף חזרה למעלה בשליטה.'
    ],
    mistakes: ['אגן צונח למטה', 'מרפקים מתרחקים לצדדים ב־90°', 'ראש צונח קדימה'],
    scaleDown: 'שכיבות על הברכיים או מול קיר.',
    scaleUp: 'שכיבות יהלום או עם רגליים מוגבהות.'
  },
  {
    id: 'squat', name: 'סקוואט משקל גוף', emoji: '🏋️', type: 'legs', level: 1,
    muscles: ['ארבע ראשי', 'ישבן', 'ירך אחורית'], equip: 'none', metVal: 5,
    steps: [
      'רגליים ברוחב כתפיים, אצבעות מעט החוצה.',
      'שלח ישבן אחורה כאילו מתיישב על כיסא.',
      'רד עד שהירכיים מקבילות לרצפה, גב ישר.',
      'דחוף דרך העקבים חזרה למעלה.'
    ],
    mistakes: ['ברכיים נכנסות פנימה', 'עקבים מתרוממים', 'גב מתעגל'],
    scaleDown: 'סקוואט לכיסא (נגיעה קלה וקימה).',
    scaleUp: 'סקוואט קפיצה או על רגל אחת.'
  },
  {
    id: 'plank', name: 'פלאנק', emoji: '🧘', type: 'core', level: 1,
    muscles: ['בטן', 'ליבה', 'כתפיים'], equip: 'none', metVal: 4,
    steps: [
      'מרפקים מתחת לכתפיים, אמות על הרצפה.',
      'גוף ישר מהראש עד העקבים.',
      'הדק בטן וישבן, נשום רגיל.',
      'החזק לזמן היעד.'
    ],
    mistakes: ['אגן עולה גבוה', 'גב תחתון שוקע', 'עוצרים נשימה'],
    scaleDown: 'פלאנק על הברכיים.',
    scaleUp: 'פלאנק עם הרמת רגל לסירוגין.'
  },
  {
    id: 'lunge', name: 'מכרעים (לאנג׳)', emoji: '🚶', type: 'legs', level: 1,
    muscles: ['ארבע ראשי', 'ישבן'], equip: 'none', metVal: 6,
    steps: [
      'עמידה זקופה, צעד גדול קדימה.',
      'רד עד שהברך האחורית כמעט נוגעת ברצפה.',
      'ברך קדמית מעל הקרסול, לא מעבר.',
      'דחוף חזרה והחלף רגל.'
    ],
    mistakes: ['צעד קצר מדי', 'גוף נוטה קדימה', 'ברך עוברת את האצבעות'],
    scaleDown: 'מכרעים במקום עם אחיזה בקיר לאיזון.',
    scaleUp: 'מכרעים בקפיצה מתחלפת.'
  },
  {
    id: 'pullup', name: 'מתח (Pull-up)', emoji: '🧗', type: 'pull', level: 2,
    muscles: ['גב רחב', 'ביצפס', 'כתף אחורית'], equip: 'bar', metVal: 8,
    steps: [
      'אחיזה במוט מעט רחב מהכתפיים, כפות מהגוף.',
      'משוך שכמות למטה ואחורה קודם.',
      'משוך את הסנטר מעל המוט.',
      'רד בשליטה מלאה עד יישור מרפקים.'
    ],
    mistakes: ['נדנוד גוף (קיפינג) לא נשלט', 'ירידה חלקית', 'כתפיים עולות לאוזניים'],
    scaleDown: 'מתח בעזרת גומייה או מתח שלילי (ירידה איטית).',
    scaleUp: 'מתח עם משקל נוסף או L-sit.'
  },
  {
    id: 'dip', name: 'מקבילים (Dips)', emoji: '💪', type: 'push', level: 2,
    muscles: ['חזה תחתון', 'טרייספס', 'כתפיים'], equip: 'bars', metVal: 8,
    steps: [
      'אחיזה על מקבילים, זרועות ישרות.',
      'רד עד שהמרפקים ב־90°.',
      'שמור מרפקים קרובים לגוף.',
      'דחוף חזרה עד יישור.'
    ],
    mistakes: ['ירידה עמוקה מדי לכתף', 'נטייה מוגזמת קדימה', 'כתפיים אסופות'],
    scaleDown: 'דיפים על ספסל (רגליים על הרצפה).',
    scaleUp: 'דיפים עם משקל.'
  },
  {
    id: 'hollow', name: 'Hollow Hold', emoji: '🍌', type: 'core', level: 2,
    muscles: ['בטן', 'ליבה'], equip: 'none', metVal: 4,
    steps: [
      'שכיבה על הגב, גב תחתון צמוד לרצפה.',
      'הרם כתפיים ורגליים מעט מהרצפה.',
      'הגוף כמו סירה/בננה.',
      'החזק ונשום.'
    ],
    mistakes: ['גב תחתון מתרומם מהרצפה', 'רגליים גבוהות מדי'],
    scaleDown: 'ברכיים מכופפות וידיים לצד הגוף.',
    scaleUp: 'ידיים מעל הראש, רגליים ישרות.'
  },
  {
    id: 'pike', name: 'Pike Push-up', emoji: '⛰️', type: 'push', level: 2,
    muscles: ['כתפיים', 'טרייספס'], equip: 'none', metVal: 7,
    steps: [
      'עמדת V הפוך — ישבן גבוה, ראש למטה.',
      'רד עם הראש לכיוון הרצפה בין הידיים.',
      'דחוף חזרה למעלה.',
      'שמור ליבה אסופה.'
    ],
    mistakes: ['ישבן נמוך מדי (הופך לשכיבה רגילה)', 'מרפקים מתרחקים'],
    scaleDown: 'זווית קטנה יותר, ידיים גבוהות על ספסל.',
    scaleUp: 'רגליים מוגבהות לכיוון handstand push-up.'
  },
  {
    id: 'burpee', name: 'ברפי', emoji: '🔥', type: 'cardio', level: 2,
    muscles: ['כל הגוף'], equip: 'none', metVal: 10,
    steps: [
      'מעמידה — רד לסקוואט וכפות ידיים לרצפה.',
      'קפוץ רגליים אחורה לפלאנק + שכיבה.',
      'קפוץ רגליים חזרה קדימה.',
      'קפיצה למעלה עם ידיים.'
    ],
    mistakes: ['גב מתעגל בקפיצה אחורה', 'ויתור על השכיבה'],
    scaleDown: 'בלי שכיבה ובלי קפיצה (צעד במקום).',
    scaleUp: 'ברפי עם מתח או קפיצה גבוהה.'
  },
  {
    id: 'mountain', name: 'מטפסי הרים', emoji: '🏃', type: 'cardio', level: 1,
    muscles: ['ליבה', 'כתפיים', 'רגליים'], equip: 'none', metVal: 8,
    steps: [
      'עמדת פלאנק גבוה, ידיים תחת כתפיים.',
      'הבא ברך לכיוון החזה לסירוגין.',
      'קצב מהיר, ליבה יציבה.',
      'ישבן לא עולה.'
    ],
    mistakes: ['ישבן עולה', 'טווח קצר', 'משקל נופל אחורה'],
    scaleDown: 'קצב איטי ומבוקר.',
    scaleUp: 'קצב מהיר / cross-body.'
  },
  {
    id: 'glutebridge', name: 'גשר ישבן', emoji: '🌉', type: 'legs', level: 1,
    muscles: ['ישבן', 'ירך אחורית'], equip: 'none', metVal: 4,
    steps: [
      'שכיבה על הגב, ברכיים כפופות, כפות רגליים על הרצפה.',
      'דחוף דרך העקבים והרם אגן.',
      'הדק ישבן בשיא.',
      'רד בשליטה.'
    ],
    mistakes: ['גב תחתון עושה את העבודה', 'עקבים רחוקים מדי'],
    scaleDown: 'טווח קטן.',
    scaleUp: 'גשר על רגל אחת.'
  },
  {
    id: 'legraise', name: 'הרמות רגליים בתלייה/שכיבה', emoji: '🦵', type: 'core', level: 2,
    muscles: ['בטן תחתונה'], equip: 'none', metVal: 5,
    steps: [
      'שכיבה על הגב, ידיים לצד הגוף.',
      'הרם רגליים ישרות עד 90°.',
      'רד לאט בלי לגעת ברצפה.',
      'גב תחתון צמוד.'
    ],
    mistakes: ['גב תחתון מתקמר', 'תנופה במקום שליטה'],
    scaleDown: 'ברכיים מכופפות.',
    scaleUp: 'בתלייה על מוט (hanging leg raise).'
  }
];

// --- Goals & levels metadata -----------------------------------------
const GOALS = [
  { id: 'fatloss', label: 'ירידה בשומן', emoji: '🔥' },
  { id: 'muscle', label: 'בניית שריר', emoji: '💪' },
  { id: 'strength', label: 'כוח', emoji: '⚡' },
  { id: 'mobility', label: 'ניידות ובריאות', emoji: '🌿' }
];
const LEVELS = [
  { id: 1, label: 'מתחיל', desc: 'חדש/ה או חוזר/ת אחרי הפסקה' },
  { id: 2, label: 'בינוני', desc: 'מתאמן/ת באופן קבוע' },
  { id: 3, label: 'מתקדם', desc: 'שולט/ת בתרגילי הבסיס' }
];
const EQUIP = [
  { id: 'none', label: 'רק משקל גוף', emoji: '🤸' },
  { id: 'bar', label: 'מתקן מתח', emoji: '🏗️' },
  { id: 'bands', label: 'גומיות', emoji: '➰' },
  { id: 'weights', label: 'משקולות', emoji: '🏋️' }
];

// --- Workout generator ------------------------------------------------
// Builds a session tuned to the user's level, goal and available equipment.
function buildWorkout(profile) {
  const level = profile.level || 1;
  const hasBar = ['bar', 'weights'].includes(profile.equip) || profile.equip === 'bar';
  let pool = EXERCISES.filter((e) => e.level <= level + 0);
  // Respect equipment: drop bar/bars moves if no bar.
  if (!(profile.equip === 'bar' || profile.equip === 'weights')) {
    pool = pool.filter((e) => e.equip !== 'bar' && e.equip !== 'bars');
  }
  const pick = (type) => pool.filter((e) => e.type === type);
  const order = profile.goal === 'fatloss'
    ? ['cardio', 'legs', 'push', 'core', 'pull']
    : profile.goal === 'mobility'
    ? ['mobility', 'core', 'legs', 'push', 'legs']
    : ['push', 'pull', 'legs', 'core', 'cardio'];

  const chosen = [];
  const used = new Set();
  for (const t of order) {
    const candidates = pick(t).filter((e) => !used.has(e.id));
    if (candidates.length) { const e = candidates[0]; chosen.push(e); used.add(e.id); }
  }
  // Ensure at least 4 exercises.
  for (const e of pool) {
    if (chosen.length >= 5) break;
    if (!used.has(e.id)) { chosen.push(e); used.add(e.id); }
  }

  const sets = profile.goal === 'strength' ? 5 : profile.goal === 'muscle' ? 4 : 3;
  const repsFor = (e) => {
    if (e.type === 'core') return level >= 2 ? '30-45 שנ׳' : '20-30 שנ׳';
    if (e.type === 'cardio') return '40 שנ׳';
    if (profile.goal === 'strength') return `${5 + level} חזרות`;
    if (profile.goal === 'fatloss') return `${12 + level * 2} חזרות`;
    return `${8 + level * 2} חזרות`;
  };
  return chosen.map((e) => ({ ...e, sets, reps: repsFor(e) }));
}

// --- Food database (per 100g unless noted) ----------------------------
const FOODS = [
  { name: 'חזה עוף מבושל', kcal: 165, p: 31, c: 0, f: 3.6, unit: '100 גרם' },
  { name: 'ביצה גדולה', kcal: 78, p: 6, c: 0.6, f: 5, unit: 'יחידה' },
  { name: 'אורז לבן מבושל', kcal: 130, p: 2.7, c: 28, f: 0.3, unit: '100 גרם' },
  { name: 'אורז מלא מבושל', kcal: 111, p: 2.6, c: 23, f: 0.9, unit: '100 גרם' },
  { name: 'בננה', kcal: 105, p: 1.3, c: 27, f: 0.4, unit: 'יחידה בינונית' },
  { name: 'תפוח', kcal: 95, p: 0.5, c: 25, f: 0.3, unit: 'יחידה' },
  { name: 'שיבולת שועל יבשה', kcal: 389, p: 17, c: 66, f: 7, unit: '100 גרם' },
  { name: 'טונה במים', kcal: 116, p: 26, c: 0, f: 1, unit: '100 גרם' },
  { name: 'קוטג׳ 5%', kcal: 98, p: 11, c: 3.4, f: 4.3, unit: '100 גרם' },
  { name: 'יוגורט יווני 0%', kcal: 59, p: 10, c: 3.6, f: 0.4, unit: '100 גרם' },
  { name: 'אבוקדו', kcal: 240, p: 3, c: 12, f: 22, unit: 'חצי יחידה' },
  { name: 'שקדים', kcal: 579, p: 21, c: 22, f: 50, unit: '100 גרם' },
  { name: 'לחם מלא', kcal: 247, p: 13, c: 41, f: 3.4, unit: '100 גרם' },
  { name: 'בטטה אפויה', kcal: 90, p: 2, c: 21, f: 0.1, unit: '100 גרם' },
  { name: 'עדשים מבושלות', kcal: 116, p: 9, c: 20, f: 0.4, unit: '100 גרם' },
  { name: 'סלמון', kcal: 208, p: 20, c: 0, f: 13, unit: '100 גרם' },
  { name: 'חלב 3%', kcal: 61, p: 3.3, c: 4.8, f: 3.3, unit: '100 מ״ל' },
  { name: 'שמן זית', kcal: 884, p: 0, c: 0, f: 100, unit: '100 מ״ל' }
];

// Mock family members for the leaderboard demo (replaced by real accounts in phase 2).
const DEMO_FAMILY = [
  { name: 'אתה', workouts: 0, streak: 0, you: true },
  { name: 'אבא', workouts: 4, streak: 5 },
  { name: 'אמא', workouts: 3, streak: 3 },
  { name: 'נועה', workouts: 6, streak: 8 },
  { name: 'איתי', workouts: 2, streak: 1 }
];
