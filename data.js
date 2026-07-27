/* ============================================================
   KIN — coaching content library (trainer-grade)
   Built on mainstream evidence-based principles (NSCA/ACSM-style):
   movement-pattern balance, warm-up → work → cooldown, tempo,
   RPE/RIR, progressive overload, and calisthenics progressions.
   NOTE: educational content, not a substitute for a certified
   coach or medical advice.
   ============================================================ */

/* -------- Movement patterns (a coach programs by pattern, not by muscle) --------
   horiz_push, vert_push, horiz_pull, vert_pull, squat, hinge, core, cardio */

// level: 1=מתחיל, 2=בינוני, 3=מתקדם
const EXERCISES = [
  {
    id: 'pushup', name: 'שכיבות סמיכה', emoji: '🙇‍♂️', pattern: 'horiz_push', level: 1, equip: 'none', metVal: 8,
    muscles: { primary: ['חזה'], secondary: ['כתף קדמית', 'טרייספס', 'ליבה'] },
    tempo: '3-1-1', tempoNote: 'ירידה 3 שנ׳ · עצירה קלה למטה · דחיפה מהירה',
    breathing: 'שאיפה בירידה, נשיפה בדחיפה למעלה',
    cues: ['גוף כמו קרש — הדק בטן וישבן', 'שכמות נמשכות אחורה ולמטה', 'מרפקים ~45° מהגוף, לא לצדדים'],
    steps: [
      'כפות ידיים על הרצפה מעט רחב מהכתפיים.',
      'גוף בקו ישר אחד מהראש עד העקבים.',
      'רד בשליטה עד שהחזה כמעט נוגע ברצפה.',
      'דחוף חזרה עד יישור מלא של המרפקים.'
    ],
    mistakes: [
      { err: 'אגן צונח / ישבן עולה', fix: 'הדק בטן וישבן לאורך כל החזרה' },
      { err: 'מרפקים מתרחקים ל־90°', fix: 'קרב את המרפקים לכיוון הצלעות' },
      { err: 'טווח חלקי', fix: 'רד עד שהחזה קרוב לרצפה' }
    ],
    progressions: [
      { name: 'שכיבות מול קיר', level: 0 },
      { name: 'שכיבות על ספסל/משטח מוגבה', level: 0 },
      { name: 'שכיבות על הברכיים', level: 1 },
      { name: 'שכיבות מלאות', level: 1 },
      { name: 'שכיבות יהלום', level: 2 },
      { name: 'שכיבות ארצ׳ר (Archer)', level: 3 },
      { name: 'שכיבת יד אחת', level: 3 }
    ]
  },
  {
    id: 'pike', name: 'Pike Push-up', emoji: '⛰️', pattern: 'vert_push', level: 2, equip: 'none', metVal: 7,
    muscles: { primary: ['כתפיים'], secondary: ['טרייספס', 'חזה עליון'] },
    tempo: '3-1-1', tempoNote: 'ירידה נשלטת אל בין הידיים',
    breathing: 'שאיפה בירידה, נשיפה בדחיפה',
    cues: ['ישבן גבוה — עמדת V הפוך', 'ראש יורד אל בין כפות הידיים', 'ליבה אסופה'],
    steps: ['עמדת V הפוך: ישבן גבוה, ידיים ורגליים על הרצפה.', 'כופף מרפקים והורד את הראש לכיוון הרצפה.', 'עצור רגע כשהראש קרוב לרצפה.', 'דחוף חזרה עד יישור.'],
    mistakes: [
      { err: 'ישבן יורד (הופך לשכיבה רגילה)', fix: 'שמור ירך גבוה ומשקל מעל הידיים' },
      { err: 'מרפקים נפתחים החוצה', fix: 'כוון מרפקים קדימה' }
    ],
    progressions: [
      { name: 'Pike על משטח מוגבה', level: 1 },
      { name: 'Pike על הרצפה', level: 2 },
      { name: 'Pike עם רגליים מוגבהות', level: 2 },
      { name: 'Wall Handstand Push-up', level: 3 }
    ]
  },
  {
    id: 'rows', name: 'משיכות אופקיות (Rows)', emoji: '🚣', pattern: 'horiz_pull', level: 1, equip: 'bar', metVal: 6,
    muscles: { primary: ['גב אמצעי', 'גב רחב'], secondary: ['ביצפס', 'כתף אחורית'] },
    tempo: '2-1-2', tempoNote: 'משיכה מבוקרת, עצירה בשיא, ירידה איטית',
    breathing: 'נשיפה במשיכה אל הגוף',
    cues: ['משוך את המרפקים אחורה, לא את הידיים', 'סחט שכמות בשיא', 'גוף ישר כמו קרש הפוך'],
    steps: ['אחוז במוט נמוך/טבעות, גוף נשען אחורה בקו ישר.', 'משוך את החזה לכיוון המוט.', 'סחט את השכמות בשיא.', 'רד בשליטה עד יישור מרפקים.'],
    mistakes: [
      { err: 'אגן צונח', fix: 'הדק ישבן ובטן — גוף בקו אחד' },
      { err: 'משיכה עם הידיים בלבד', fix: 'התחל את התנועה מהשכמות' }
    ],
    progressions: [
      { name: 'Rows בזווית זקופה (קל)', level: 1 },
      { name: 'Rows אופקי יותר', level: 2 },
      { name: 'Rows רגליים מוגבהות', level: 3 },
      { name: 'Rows על יד אחת', level: 3 }
    ]
  },
  {
    id: 'pullup', name: 'מתח (Pull-up)', emoji: '🧗', pattern: 'vert_pull', level: 2, equip: 'bar', metVal: 8,
    muscles: { primary: ['גב רחב'], secondary: ['ביצפס', 'כתף אחורית', 'ליבה'] },
    tempo: '2-1-2', tempoNote: 'עלייה נשלטת, ירידה 2 שנ׳ מלאה',
    breathing: 'נשיפה בעלייה, שאיפה בירידה',
    cues: ['משוך שכמות למטה לפני שהזרועות עובדות', 'סנטר מעל המוט', 'ליבה אסופה — בלי נדנוד'],
    steps: ['אחיזה מעט רחב מהכתפיים, כפות מהגוף.', 'התחל במשיכת השכמות מטה.', 'משוך עד שהסנטר מעל המוט.', 'רד בשליטה מלאה עד יישור מרפקים.'],
    mistakes: [
      { err: 'נדנוד/קיפינג לא נשלט', fix: 'הדק ליבה, בצע חזרה נקייה' },
      { err: 'טווח חלקי', fix: 'רד עד יישור מלא בכל חזרה' }
    ],
    progressions: [
      { name: 'Dead hang (תלייה)', level: 1 },
      { name: 'מתח שלילי (ירידה איטית)', level: 1 },
      { name: 'מתח בעזרת גומייה', level: 2 },
      { name: 'מתח מלא', level: 2 },
      { name: 'מתח עם משקל / L-sit pull-up', level: 3 }
    ]
  },
  {
    id: 'squat', name: 'סקוואט משקל גוף', emoji: '🏋️', pattern: 'squat', level: 1, equip: 'none', metVal: 5,
    muscles: { primary: ['ארבע ראשי', 'ישבן'], secondary: ['ירך אחורית', 'ליבה'] },
    tempo: '3-1-1', tempoNote: 'ירידה 3 שנ׳, עצירה למטה, קימה מהירה',
    breathing: 'שאיפה בירידה, נשיפה בקימה',
    cues: ['ישבן אחורה כמו לשבת על כיסא', 'ברכיים בכיוון האצבעות', 'משקל על אמצע כף הרגל והעקב'],
    steps: ['רגליים ברוחב כתפיים, אצבעות מעט החוצה.', 'שלח ישבן אחורה ורד.', 'רד עד שהירכיים מקבילות לרצפה (או עמוק יותר).', 'דחוף דרך העקבים חזרה למעלה.'],
    mistakes: [
      { err: 'ברכיים נכנסות פנימה', fix: 'דחוף ברכיים החוצה בכיוון האצבעות' },
      { err: 'עקבים מתרוממים', fix: 'שמור משקל על העקבים; שפר ניידות קרסול' },
      { err: 'גב מתעגל', fix: 'שמור חזה פתוח וליבה אסופה' }
    ],
    progressions: [
      { name: 'סקוואט לכיסא', level: 1 },
      { name: 'סקוואט מלא', level: 1 },
      { name: 'סקוואט בולגרי (רגל אחורית מוגבהת)', level: 2 },
      { name: 'סקוואט פיסטול (רגל אחת)', level: 3 }
    ]
  },
  {
    id: 'lunge', name: 'מכרעים (לאנג׳)', emoji: '🚶', pattern: 'squat', level: 1, equip: 'none', metVal: 6,
    muscles: { primary: ['ארבע ראשי', 'ישבן'], secondary: ['ירך אחורית', 'שיווי משקל'] },
    tempo: '2-1-1', tempoNote: 'ירידה מבוקרת, דחיפה יציבה',
    breathing: 'נשיפה בקימה',
    cues: ['צעד גדול מספיק', 'ברך אחורית יורדת לכיוון הרצפה', 'גו זקוף'],
    steps: ['עמידה זקופה, צעד גדול קדימה.', 'רד עד שהברך האחורית כמעט נוגעת ברצפה.', 'ברך קדמית מעל הקרסול.', 'דחוף חזרה והחלף רגל.'],
    mistakes: [
      { err: 'גוף נוטה קדימה', fix: 'שמור גו זקוף ומבט קדימה' },
      { err: 'צעד קצר מדי', fix: 'הגדל את הצעד כדי להגן על הברך' }
    ],
    progressions: [
      { name: 'מכרעים במקום עם תמיכה', level: 1 },
      { name: 'מכרעים הולכים', level: 2 },
      { name: 'מכרעי קפיצה מתחלפים', level: 3 }
    ]
  },
  {
    id: 'glutebridge', name: 'גשר ישבן / Hip Hinge', emoji: '🌉', pattern: 'hinge', level: 1, equip: 'none', metVal: 4,
    muscles: { primary: ['ישבן', 'ירך אחורית'], secondary: ['ליבה', 'גב תחתון'] },
    tempo: '2-2-2', tempoNote: 'עצירה של 2 שנ׳ בשיא הכיווץ',
    breathing: 'נשיפה בדחיפת האגן',
    cues: ['דחוף דרך העקבים', 'סחט ישבן בשיא', 'הימנע מקימור גב תחתון'],
    steps: ['שכיבה על הגב, ברכיים כפופות, כפות רגליים על הרצפה.', 'דחוף דרך העקבים והרם את האגן.', 'סחט ישבן בשיא (גוף בקו ישר).', 'רד בשליטה.'],
    mistakes: [
      { err: 'גב תחתון עושה את העבודה', fix: 'התמקד בכיווץ הישבן, לא בקימור הגב' },
      { err: 'עקבים רחוקים מדי', fix: 'קרב את כפות הרגליים אל הישבן' }
    ],
    progressions: [
      { name: 'גשר ישבן דו־צדדי', level: 1 },
      { name: 'גשר עם עצירה ארוכה', level: 2 },
      { name: 'גשר על רגל אחת', level: 3 }
    ]
  },
  {
    id: 'dip', name: 'מקבילים (Dips)', emoji: '💪', pattern: 'horiz_push', level: 2, equip: 'bars', metVal: 8,
    muscles: { primary: ['חזה תחתון', 'טרייספס'], secondary: ['כתף קדמית'] },
    tempo: '3-1-1', tempoNote: 'ירידה נשלטת ל־90°, דחיפה יציבה',
    breathing: 'שאיפה בירידה, נשיפה בדחיפה',
    cues: ['מרפקים קרובים לגוף', 'נטייה קלה קדימה לחזה', 'כתפיים למטה — לא לאוזניים'],
    steps: ['אחיזה על מקבילים, זרועות ישרות.', 'רד עד שהמרפקים ב־90°.', 'שמור מרפקים קרובים.', 'דחוף חזרה עד יישור.'],
    mistakes: [
      { err: 'ירידה עמוקה מדי (לחץ על הכתף)', fix: 'עצור סביב 90° במרפק' },
      { err: 'כתפיים אסופות לאוזניים', fix: 'משוך שכמות מטה' }
    ],
    progressions: [
      { name: 'דיפים על ספסל (רגליים על הרצפה)', level: 1 },
      { name: 'דיפים במקבילים עם עזרה', level: 2 },
      { name: 'דיפים מלאים', level: 2 },
      { name: 'דיפים עם משקל', level: 3 }
    ]
  },
  {
    id: 'plank', name: 'פלאנק', emoji: '🧘', pattern: 'core', level: 1, equip: 'none', metVal: 4, timed: true,
    muscles: { primary: ['בטן עמוקה', 'ליבה'], secondary: ['כתפיים', 'ישבן'] },
    tempo: 'החזקה סטטית', tempoNote: 'נשימה רגילה לאורך ההחזקה',
    breathing: 'נשום רגיל — אל תעצור נשימה',
    cues: ['גוף בקו ישר אחד', 'הדק בטן וישבן', 'משוך טבור פנימה'],
    steps: ['מרפקים מתחת לכתפיים.', 'גוף ישר מהראש עד העקבים.', 'הדק בטן וישבן.', 'החזק לזמן היעד.'],
    mistakes: [
      { err: 'אגן עולה גבוה', fix: 'הורד אגן לקו הגוף' },
      { err: 'גב תחתון שוקע', fix: 'הדק ישבן ובטן' }
    ],
    progressions: [
      { name: 'פלאנק על הברכיים', level: 1 },
      { name: 'פלאנק מלא', level: 1 },
      { name: 'פלאנק עם הרמת רגל/יד', level: 2 },
      { name: 'RKC פלאנק (מתח מקסימלי)', level: 3 }
    ]
  },
  {
    id: 'hollow', name: 'Hollow Hold', emoji: '🍌', pattern: 'core', level: 2, equip: 'none', metVal: 4, timed: true,
    muscles: { primary: ['בטן'], secondary: ['כופפי ירך'] },
    tempo: 'החזקה סטטית', tempoNote: 'גב תחתון צמוד לרצפה כל הזמן',
    breathing: 'נשימות קצרות ורדודות תוך שמירה על מתח',
    cues: ['גב תחתון דבוק לרצפה', 'צורת בננה/סירה', 'כתפיים ורגליים מעל הרצפה'],
    steps: ['שכיבה על הגב, גב תחתון צמוד.', 'הרם כתפיים ורגליים מעט.', 'הגוף כמו סירה.', 'החזק תוך שמירה על הגב צמוד.'],
    mistakes: [
      { err: 'גב תחתון מתרומם', fix: 'הורד רגליים או כופף ברכיים כדי לשמור על צמידות' }
    ],
    progressions: [
      { name: 'Hollow עם ברכיים כפופות', level: 2 },
      { name: 'Hollow עם רגליים ישרות', level: 2 },
      { name: 'Hollow rocks', level: 3 }
    ]
  },
  {
    id: 'legraise', name: 'הרמות רגליים', emoji: '🦵', pattern: 'core', level: 2, equip: 'none', metVal: 5,
    muscles: { primary: ['בטן תחתונה'], secondary: ['כופפי ירך'] },
    tempo: '2-0-3', tempoNote: 'ירידה איטית של 3 שנ׳ — שם עיקר העבודה',
    breathing: 'נשיפה בהרמה',
    cues: ['גב תחתון צמוד', 'שליטה בירידה', 'בלי תנופה'],
    steps: ['שכיבה על הגב, ידיים לצד הגוף.', 'הרם רגליים ישרות עד 90°.', 'רד לאט בלי לגעת ברצפה.', 'שמור גב תחתון צמוד.'],
    mistakes: [
      { err: 'גב תחתון מתקמר', fix: 'כופף מעט ברכיים / הורד טווח' },
      { err: 'תנופה במקום שליטה', fix: 'האט את הקצב, שלוט בירידה' }
    ],
    progressions: [
      { name: 'הרמות ברכיים כפופות', level: 2 },
      { name: 'הרמות רגליים ישרות', level: 2 },
      { name: 'Hanging leg raise (בתלייה)', level: 3 }
    ]
  },
  {
    id: 'mountain', name: 'מטפסי הרים', emoji: '🏃', pattern: 'cardio', level: 1, equip: 'none', metVal: 8, timed: true,
    muscles: { primary: ['ליבה'], secondary: ['כתפיים', 'רגליים', 'לב־ריאה'] },
    tempo: 'קצב מהיר ומבוקר', tempoNote: 'ליבה יציבה גם בקצב גבוה',
    breathing: 'קצב נשימה יציב',
    cues: ['ישבן לא עולה', 'משקל יציב מעל הידיים', 'ברך אל החזה'],
    steps: ['עמדת פלאנק גבוה.', 'הבא ברך אל החזה לסירוגין.', 'שמור ליבה יציבה.', 'קצב מהיר לפי היכולת.'],
    mistakes: [
      { err: 'ישבן עולה', fix: 'שמור ירך נמוך בקו הגוף' },
      { err: 'משקל נופל אחורה', fix: 'העבר משקל מעל כפות הידיים' }
    ],
    progressions: [
      { name: 'קצב איטי ומבוקר', level: 1 },
      { name: 'קצב בינוני', level: 2 },
      { name: 'Cross-body מהיר', level: 3 }
    ]
  },
  {
    id: 'burpee', name: 'ברפי', emoji: '🔥', pattern: 'cardio', level: 2, equip: 'none', metVal: 10, timed: true,
    muscles: { primary: ['כל הגוף'], secondary: ['לב־ריאה'] },
    tempo: 'רציף', tempoNote: 'תנועה זורמת ונשלטת',
    breathing: 'נשיפה בקפיצה למעלה',
    cues: ['גב ישר בקפיצה אחורה', 'נחיתה רכה', 'ליבה אסופה'],
    steps: ['רד לסקוואט, ידיים לרצפה.', 'קפוץ רגליים אחורה לפלאנק + שכיבה.', 'קפוץ רגליים קדימה.', 'קפיצה למעלה עם ידיים.'],
    mistakes: [
      { err: 'גב מתעגל בקפיצה אחורה', fix: 'הדק ליבה; שלוט בקפיצה' },
      { err: 'נחיתה קשה', fix: 'נחת רך על מפרקים כפופים' }
    ],
    progressions: [
      { name: 'ברפי בלי שכיבה ובלי קפיצה', level: 1 },
      { name: 'ברפי מלא', level: 2 },
      { name: 'ברפי עם מתח / קפיצה גבוהה', level: 3 }
    ]
  }
];

// --- Warm-up drills (dynamic, done before every session) --------------
const WARMUPS = [
  { id: 'arm_circles', name: 'סיבובי זרועות', emoji: '🔄', sec: 30, note: 'קדימה ואחורה, טווח מלא', for: ['horiz_push', 'vert_push', 'horiz_pull', 'vert_pull'] },
  { id: 'leg_swings', name: 'נדנודי רגליים', emoji: '🦵', sec: 30, note: '15 לכל רגל, מבוקר', for: ['squat', 'hinge'] },
  { id: 'jumping_jacks', name: 'קפיצות פיסוק', emoji: '⭐', sec: 40, note: 'העלאת דופק', for: ['cardio'] },
  { id: 'bw_squats', name: 'סקוואט קל להתחממות', emoji: '🏋️', sec: 30, note: 'טווח נעים, בלי מאמץ', for: ['squat', 'hinge'] },
  { id: 'cat_cow', name: 'חתול־פרה (גב)', emoji: '🐈', sec: 30, note: 'ניידות עמוד שדרה', for: ['core', 'hinge'] },
  { id: 'shoulder_taps', name: 'נגיעות כתף בפלאנק', emoji: '👋', sec: 30, note: 'ייצוב ליבה וכתף', for: ['horiz_push', 'vert_push', 'core'] },
  { id: 'band_pull', name: 'משיכות פתיחת כתף', emoji: '➰', sec: 30, note: 'הפעלת גב עליון וכתף', for: ['horiz_pull', 'vert_pull'] }
];

// --- Cooldown stretches (static, after every session) -----------------
const COOLDOWNS = [
  { id: 'chest_stretch', name: 'מתיחת חזה בפינה', emoji: '🧍', sec: 30, note: 'נשימה עמוקה' },
  { id: 'hamstring', name: 'מתיחת ירך אחורית', emoji: '🙆', sec: 30, note: '30 שנ׳ לכל צד' },
  { id: 'quad', name: 'מתיחת ארבע ראשי', emoji: '🦵', sec: 30, note: '30 שנ׳ לכל צד' },
  { id: 'child_pose', name: 'תנוחת הילד', emoji: '🧘', sec: 40, note: 'הרפיית גב תחתון' },
  { id: 'shoulder_stretch', name: 'מתיחת כתף צולבת', emoji: '💆', sec: 30, note: '30 שנ׳ לכל צד' }
];

// --- Goals / levels / equipment metadata ------------------------------
const GOALS = [
  { id: 'fatloss', label: 'ירידה בשומן', emoji: '🔥', style: 'מעגלי, מנוחות קצרות' },
  { id: 'muscle', label: 'בניית שריר', emoji: '💪', style: 'היפרטרופיה, 8–12 חזרות' },
  { id: 'strength', label: 'כוח', emoji: '⚡', style: 'עומס גבוה, מנוחות ארוכות' },
  { id: 'mobility', label: 'ניידות ובריאות', emoji: '🌿', style: 'טווחים מלאים, קצב איטי' }
];
const LEVELS = [
  { id: 1, label: 'מתחיל', desc: 'חדש/ה או חוזר/ת אחרי הפסקה', days: 3 },
  { id: 2, label: 'בינוני', desc: 'מתאמן/ת באופן קבוע', days: 4 },
  { id: 3, label: 'מתקדם', desc: 'שולט/ת בתרגילי הבסיס', days: 5 }
];
const EQUIP = [
  { id: 'none', label: 'רק משקל גוף', emoji: '🤸' },
  { id: 'bar', label: 'מתקן מתח', emoji: '🏗️' },
  { id: 'bands', label: 'גומיות', emoji: '➰' },
  { id: 'weights', label: 'משקולות', emoji: '🏋️' }
];
// Limitations → exercises the engine will avoid & substitute automatically.
const INJURIES = [
  { id: 'none', label: 'אין מגבלות', emoji: '✅', avoid: [] },
  { id: 'knee', label: 'ברך', emoji: '🦵', avoid: ['lunge', 'burpee'] },
  { id: 'shoulder', label: 'כתף', emoji: '💪', avoid: ['dip', 'pike'] },
  { id: 'back', label: 'גב תחתון', emoji: '🔙', avoid: ['legraise', 'burpee'] },
  { id: 'wrist', label: 'שורש כף יד', emoji: '🤲', avoid: ['pushup', 'pike', 'mountain', 'burpee'] }
];

// --- Goals: support multiple selected goals ---------------------------
function goalList(p) { return (Array.isArray(p.goals) && p.goals.length) ? p.goals : (p.goal ? [p.goal] : ['muscle']); }
// The workout scheme follows the highest-priority selected goal.
function primaryTrainingGoal(p) { const g = goalList(p); for (const pref of ['strength', 'muscle', 'fatloss', 'mobility']) if (g.includes(pref)) return pref; return g[0] || 'muscle'; }

// --- Prescription by goal (sets / reps / rest / RPE) -------------------
function prescription(goal, level) {
  const base = {
    strength: { sets: 5, reps: '4–6', rest: 165, rpe: 'RPE 8 · 2 חזרות במאגר', tempoHint: 'איטי ומבוקר' },
    muscle:   { sets: 4, reps: '8–12', rest: 80, rpe: 'RPE 8–9 · 1–2 במאגר', tempoHint: 'שליטה בירידה' },
    fatloss:  { sets: 3, reps: '12–15', rest: 40, rpe: 'RPE 7–8 · רציף', tempoHint: 'קצב זורם' },
    mobility: { sets: 3, reps: 'טווח מלא', rest: 45, rpe: 'קל ומבוקר', tempoHint: 'איטי מאוד' }
  }[goal] || { sets: 3, reps: '8–12', rest: 60, rpe: 'RPE 7–8', tempoHint: 'מבוקר' };
  // Beginners: one less set to manage fatigue & soreness.
  const sets = Math.max(2, base.sets - (level === 1 ? 1 : 0));
  return { ...base, sets };
}

// --- Weekly split templates (movement-pattern based) ------------------
const SPLITS = {
  fullbody: {
    label: 'אימון גוף מלא',
    sessions: [
      { name: 'גוף מלא A', patterns: ['squat', 'horiz_push', 'horiz_pull', 'hinge', 'core'] },
      { name: 'גוף מלא B', patterns: ['squat', 'vert_push', 'vert_pull', 'core', 'cardio'] },
      { name: 'גוף מלא C', patterns: ['hinge', 'horiz_push', 'horiz_pull', 'core', 'cardio'] }
    ]
  },
  upperlower: {
    label: 'עליון / תחתון',
    sessions: [
      { name: 'פלג גוף עליון', patterns: ['horiz_push', 'horiz_pull', 'vert_push', 'vert_pull', 'core'] },
      { name: 'פלג גוף תחתון', patterns: ['squat', 'hinge', 'squat', 'core', 'cardio'] }
    ]
  },
  ppl: {
    label: 'דחיפה / משיכה / רגליים',
    sessions: [
      { name: 'דחיפה', patterns: ['horiz_push', 'vert_push', 'horiz_push', 'core'] },
      { name: 'משיכה', patterns: ['vert_pull', 'horiz_pull', 'vert_pull', 'core'] },
      { name: 'רגליים', patterns: ['squat', 'hinge', 'squat', 'core', 'cardio'] }
    ]
  }
};

function chooseSplit(profile) {
  const days = profile.days || (LEVELS.find((l) => l.id === profile.level)?.days) || 3;
  if (days >= 5) return { key: 'ppl', ...SPLITS.ppl, days };
  if (days === 4) return { key: 'upperlower', ...SPLITS.upperlower, days };
  return { key: 'fullbody', ...SPLITS.fullbody, days };
}

// Concrete rep target per goal (midpoint of the range) + level, before adaptation.
const REP_BASE = { strength: 5, muscle: 10, fatloss: 13, mobility: 10 };
function repTarget(goal, level, adjust) {
  const base = (REP_BASE[goal] || 10) + (level - 1) * (goal === 'strength' ? 1 : 2);
  return Math.max(3, base + (adjust || 0));
}

// --- Session builder (warm-up → main → cooldown) ----------------------
// sessionOffset lets the plan rotate day-to-day (progressive, not repetitive).
// adjustments: { exId: {adjust} } feeds the adaptive engine back into targets.
function buildSession(profile, sessionOffset = 0, adjustments = {}, opts = {}) {
  const split = chooseSplit(profile);
  const tmpl = split.sessions[sessionOffset % split.sessions.length];
  const patterns = (opts && opts.patterns) ? opts.patterns : tmpl.patterns;
  const pg = primaryTrainingGoal(profile);
  const rx = prescription(pg, profile.level);
  const hasBar = profile.equip === 'bar' || profile.equip === 'weights';

  // Exercises to avoid based on the user's injuries/limitations.
  const avoid = new Set();
  (profile.injuries || []).forEach((id) => (INJURIES.find((x) => x.id === id)?.avoid || []).forEach((x) => avoid.add(x)));

  const okEquip = (e) => hasBar || (e.equip !== 'bar' && e.equip !== 'bars');
  const eligible = (pattern, maxLevel) => EXERCISES.filter((e) =>
    e.pattern === pattern && e.level <= maxLevel && okEquip(e) && !avoid.has(e.id)
  );
  const used = new Set();
  const main = [];
  for (const pat of patterns) {
    let cands = eligible(pat, profile.level).filter((e) => !used.has(e.id));
    if (!cands.length) {
      // substitute a safe bodyweight alternative so the session is never empty
      cands = EXERCISES.filter((e) => e.level <= profile.level && e.equip === 'none' && !avoid.has(e.id) && !used.has(e.id));
    }
    if (!cands.length) continue;
    cands.sort((a, b) => b.level - a.level);   // hardest variation the user can handle
    let e = cands[0];

    // Progression graduation: mastered this move (adjust maxed) → step up a variation.
    let graduated = false;
    if ((adjustments[e.id]?.adjust || 0) >= 3) {
      const harder = eligible(pat, profile.level + 1).find((x) => x.level === e.level + 1 && !used.has(x.id));
      if (harder) { e = harder; graduated = true; }
    }
    used.add(e.id);

    const timed = e.timed;
    const adj = adjustments[e.id]?.adjust || 0;
    const target = repTarget(pg, profile.level, adj);
    const baseSec = profile.level >= 2 ? 35 : 25;
    const holdSec = Math.max(15, Math.min(75, baseSec + adj * 5));
    main.push({
      ...e,
      sets: rx.sets,
      reps: timed ? `${holdSec} שנ׳` : `${target} חזרות`,
      repsTarget: timed ? null : target,
      holdSec: timed ? holdSec : null,
      adjusted: adj,
      graduated,
      rest: rx.rest,
      rpe: rx.rpe,
      timed
    });
  }

  // Custom builder override: force the main list to a specific ordered set of ids.
  if (opts.exerciseIds && opts.exerciseIds.length) {
    main.length = 0; used.clear();
    for (const id of opts.exerciseIds) {
      const e = EXERCISES.find((x) => x.id === id);
      if (!e || used.has(id)) continue;
      used.add(id);
      const timed = e.timed;
      const adj = adjustments[e.id]?.adjust || 0;
      const target = repTarget(pg, profile.level, adj);
      const baseSec = profile.level >= 2 ? 35 : 25;
      const holdSec = Math.max(15, Math.min(75, baseSec + adj * 5));
      main.push({ ...e, sets: rx.sets, reps: timed ? `${holdSec} שנ׳` : `${target} חזרות`, repsTarget: timed ? null : target, holdSec: timed ? holdSec : null, adjusted: adj, graduated: false, rest: rx.rest, rpe: rx.rpe, timed });
    }
  }

  // Warm-up: prioritise drills that prep the muscles THIS session will use.
  const sessPatterns = new Set(main.map((e) => e.pattern));
  const relevant = WARMUPS.filter((w) => (w.for || []).some((p) => sessPatterns.has(p)));
  const general = WARMUPS.filter((w) => !relevant.includes(w));
  const warmup = [...relevant, ...general].slice(0, 3);
  // Cooldown: rotating stretches.
  const rot = (arr, n) => Array.from({ length: n }, (_, i) => arr[(sessionOffset + i) % arr.length]);
  return {
    name: opts.name || tmpl.name,
    splitLabel: opts.splitLabel || split.label,
    days: split.days,
    goalStyle: goalList(profile).map((id) => GOALS.find((g) => g.id === id)?.label).filter(Boolean).join(' + '),
    warmup,
    main,
    cooldown: rot(COOLDOWNS, 3),
    rx
  };
}

// --- Nutrition: coach-style targets -----------------------------------
// Activity factor scales with training frequency (not a flat guess).
function nutritionPlan(p) {
  const w = p.weight || 70, h = p.height || 170, a = p.age || 30;
  const bmr = 10 * w + 6.25 * h - 5 * a + (p.gender === 'f' ? -161 : 5);
  const days = p.days || (LEVELS.find((l) => l.id === p.level)?.days) || 3;
  const activity = days >= 5 ? 1.55 : days === 4 ? 1.48 : 1.42;
  let kcal = bmr * activity;
  // Adapt calories to the COMBINATION of goals.
  const goals = goalList(p);
  if (goals.includes('fatloss') && goals.includes('muscle')) kcal *= 0.92;  // recomposition
  else if (goals.includes('fatloss')) kcal *= 0.82;                          // ~18% deficit
  else if (goals.includes('muscle')) kcal *= 1.10;                           // modest surplus
  kcal = Math.round(kcal / 10) * 10;
  // Protein: highest priority across selected goals.
  const protPerKg = goals.includes('fatloss') ? 2.2 : goals.includes('muscle') ? 2.0 : 1.8;
  const protein = Math.round(protPerKg * w);
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
  const water = Math.round(w * 0.033 * 10) / 10; // liters/day baseline
  return { kcal, protein, carbs, fat, water };
}

// --- Food database ----------------------------------------------------
// Nutritional values are reference figures based on the USDA FoodData Central
// database (public domain). Bundled locally: works offline, sends nothing.
const FOOD_SOURCE = 'USDA FoodData Central';
const FOODS = [
  // חלבונים
  { name: 'חזה עוף מבושל', kcal: 165, p: 31, c: 0, f: 3.6, unit: '100 גרם' },
  { name: 'שוקיים עוף מבושל', kcal: 209, p: 26, c: 0, f: 11, unit: '100 גרם' },
  { name: 'חזה הודו מבושל', kcal: 135, p: 30, c: 0, f: 1, unit: '100 גרם' },
  { name: 'בשר בקר טחון מבושל (85%)', kcal: 250, p: 26, c: 0, f: 15, unit: '100 גרם' },
  { name: 'סלמון אפוי', kcal: 206, p: 22, c: 0, f: 12, unit: '100 גרם' },
  { name: 'טונה במים', kcal: 116, p: 26, c: 0, f: 1, unit: '100 גרם' },
  { name: 'ביצה גדולה', kcal: 78, p: 6.3, c: 0.6, f: 5.3, unit: 'יחידה' },
  { name: 'חלבון ביצה', kcal: 17, p: 3.6, c: 0.2, f: 0, unit: 'יחידה' },
  { name: 'טופו', kcal: 76, p: 8, c: 1.9, f: 4.8, unit: '100 גרם' },
  // מוצרי חלב
  { name: 'קוטג׳ 5%', kcal: 98, p: 11, c: 3.4, f: 4.3, unit: '100 גרם' },
  { name: 'קוטג׳ 3%', kcal: 90, p: 12, c: 4, f: 3, unit: '100 גרם' },
  { name: 'יוגורט יווני 0%', kcal: 59, p: 10, c: 3.6, f: 0.4, unit: '100 גרם' },
  { name: 'יוגורט יווני 5%', kcal: 97, p: 9, c: 4, f: 5, unit: '100 גרם' },
  { name: 'לבנה 5%', kcal: 116, p: 9, c: 4, f: 5, unit: '100 גרם' },
  { name: 'גבינה צהובה', kcal: 350, p: 25, c: 2, f: 27, unit: '100 גרם' },
  { name: 'גבינה בולגרית 5%', kcal: 160, p: 13, c: 3, f: 10, unit: '100 גרם' },
  { name: 'חלב 3%', kcal: 61, p: 3.3, c: 4.8, f: 3.3, unit: '100 מ״ל' },
  { name: 'חלב 1%', kcal: 42, p: 3.4, c: 5, f: 1, unit: '100 מ״ל' },
  // דגנים ופחמימות
  { name: 'אורז לבן מבושל', kcal: 130, p: 2.7, c: 28, f: 0.3, unit: '100 גרם' },
  { name: 'אורז מלא מבושל', kcal: 111, p: 2.6, c: 23, f: 0.9, unit: '100 גרם' },
  { name: 'פסטה מבושלת', kcal: 131, p: 5, c: 25, f: 1.1, unit: '100 גרם' },
  { name: 'קינואה מבושלת', kcal: 120, p: 4.4, c: 21, f: 1.9, unit: '100 גרם' },
  { name: 'קוסקוס מבושל', kcal: 112, p: 3.8, c: 23, f: 0.2, unit: '100 גרם' },
  { name: 'שיבולת שועל יבשה', kcal: 389, p: 17, c: 66, f: 7, unit: '100 גרם' },
  { name: 'לחם מלא', kcal: 247, p: 13, c: 41, f: 3.4, unit: '100 גרם' },
  { name: 'לחם לבן', kcal: 265, p: 9, c: 49, f: 3.2, unit: '100 גרם' },
  { name: 'בטטה אפויה', kcal: 90, p: 2, c: 21, f: 0.1, unit: '100 גרם' },
  { name: 'תפוח אדמה מבושל', kcal: 87, p: 1.9, c: 20, f: 0.1, unit: '100 גרם' },
  // קטניות
  { name: 'עדשים מבושלות', kcal: 116, p: 9, c: 20, f: 0.4, unit: '100 גרם' },
  { name: 'חומוס גרגירים מבושל', kcal: 164, p: 9, c: 27, f: 2.6, unit: '100 גרם' },
  { name: 'שעועית שחורה מבושלת', kcal: 132, p: 8.9, c: 24, f: 0.5, unit: '100 גרם' },
  { name: 'ממרח חומוס (טחינה)', kcal: 166, p: 8, c: 14, f: 10, unit: '100 גרם' },
  // פירות
  { name: 'בננה', kcal: 105, p: 1.3, c: 27, f: 0.4, unit: 'יחידה בינונית' },
  { name: 'תפוח', kcal: 95, p: 0.5, c: 25, f: 0.3, unit: 'יחידה' },
  { name: 'תפוז', kcal: 62, p: 1.2, c: 15, f: 0.2, unit: 'יחידה' },
  { name: 'ענבים', kcal: 69, p: 0.7, c: 18, f: 0.2, unit: '100 גרם' },
  { name: 'אבטיח', kcal: 30, p: 0.6, c: 8, f: 0.2, unit: '100 גרם' },
  { name: 'תות שדה', kcal: 32, p: 0.7, c: 7.7, f: 0.3, unit: '100 גרם' },
  { name: 'אבוקדו', kcal: 160, p: 2, c: 9, f: 15, unit: 'חצי יחידה' },
  // ירקות
  { name: 'ברוקולי מבושל', kcal: 35, p: 2.4, c: 7, f: 0.4, unit: '100 גרם' },
  { name: 'עגבנייה', kcal: 18, p: 0.9, c: 3.9, f: 0.2, unit: '100 גרם' },
  { name: 'מלפפון', kcal: 15, p: 0.7, c: 3.6, f: 0.1, unit: '100 גרם' },
  { name: 'גזר', kcal: 41, p: 0.9, c: 10, f: 0.2, unit: '100 גרם' },
  // שומנים ואגוזים
  { name: 'שקדים', kcal: 579, p: 21, c: 22, f: 50, unit: '100 גרם' },
  { name: 'אגוזי מלך', kcal: 654, p: 15, c: 14, f: 65, unit: '100 גרם' },
  { name: 'חמאת בוטנים', kcal: 588, p: 25, c: 20, f: 50, unit: '100 גרם' },
  { name: 'שמן זית', kcal: 884, p: 0, c: 0, f: 100, unit: '100 מ״ל' },
  { name: 'טחינה גולמית', kcal: 595, p: 17, c: 21, f: 54, unit: '100 גרם' },
  // אחר
  { name: 'דבש', kcal: 304, p: 0.3, c: 82, f: 0, unit: '100 גרם' },
  { name: 'שוקולד מריר 70%', kcal: 546, p: 5, c: 61, f: 31, unit: '100 גרם' }
];

// --- Professional demonstration photos --------------------------------
// Source: free-exercise-db (yuhonas) — Public Domain (Unlicense).
// Two frames per move (start ↔ end) → crossfaded into a motion demo.
// Loaded lazily when online, cached by the service worker, SVG fallback offline.
// Real video: drop a YouTube video-id here per exercise and it embeds inline.
// Until then, each exercise offers a curated "watch demonstration" search that
// always returns real, correct-form professional videos (free, no dead links).
const VIDEOS = {
  // pushup: 'IODxDxX7oi4',  ← example: add verified, embeddable ids here
};
const PHOTO_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const PHOTOS = {
  pushup: ['Pushups/0.jpg', 'Pushups/1.jpg'],
  pike: ['Hanging_Pike/0.jpg', 'Hanging_Pike/1.jpg'],
  rows: ['Inverted_Row/0.jpg', 'Inverted_Row/1.jpg'],
  pullup: ['Pullups/0.jpg', 'Pullups/1.jpg'],
  squat: ['Bodyweight_Squat/0.jpg', 'Bodyweight_Squat/1.jpg'],
  lunge: ['Bodyweight_Walking_Lunge/0.jpg', 'Bodyweight_Walking_Lunge/1.jpg'],
  glutebridge: ['Butt_Lift_Bridge/0.jpg', 'Butt_Lift_Bridge/1.jpg'],
  dip: ['Dips_-_Triceps_Version/0.jpg', 'Dips_-_Triceps_Version/1.jpg'],
  plank: ['Plank/0.jpg', 'Plank/1.jpg'],
  legraise: ['Flat_Bench_Lying_Leg_Raise/0.jpg', 'Flat_Bench_Lying_Leg_Raise/1.jpg'],
  mountain: ['Mountain_Climbers/0.jpg', 'Mountain_Climbers/1.jpg'],
  // warm-ups
  arm_circles: ['Arm_Circles/0.jpg', 'Arm_Circles/1.jpg'],
  jumping_jacks: ['Star_Jump/0.jpg', 'Star_Jump/1.jpg'],
  cat_cow: ['Cat_Stretch/0.jpg', 'Cat_Stretch/1.jpg'],
  bw_squats: ['Bodyweight_Squat/0.jpg', 'Bodyweight_Squat/1.jpg'],
  // cooldown stretches
  chest_stretch: ['Behind_Head_Chest_Stretch/0.jpg', 'Behind_Head_Chest_Stretch/1.jpg'],
  hamstring: ['Hamstring_Stretch/0.jpg', 'Hamstring_Stretch/1.jpg'],
  quad: ['Quad_Stretch/0.jpg', 'Quad_Stretch/1.jpg'],
  child_pose: ['Childs_Pose/0.jpg', 'Childs_Pose/1.jpg'],
  shoulder_stretch: ['Shoulder_Stretch/0.jpg', 'Shoulder_Stretch/1.jpg']
};
// Only ids that actually ship with a bundled ./videos/<id>.webm clip. Listing an
// id here without a real file makes the player fire a 404 before falling back —
// so this is the exact set of files present in /videos/. Drop in a new .webm and
// add its id here (an ./videos/<id>.mp4 also plays automatically if present).
const VIDEO_CLIPS = [
  'arm_circles', 'bw_squats', 'cat_cow', 'chest_stretch', 'child_pose', 'dip',
  'glutebridge', 'hamstring', 'jumping_jacks', 'legraise', 'lunge', 'mountain',
  'pike', 'plank', 'pullup', 'pushup', 'quad', 'rows', 'shoulder_stretch', 'squat'
];

// --- focused programs -------------------------------------------------
// session = the movement patterns each program's workout emphasises.
const PROGRAMS = [
  { id: 'pullup', name: '30 יום למתח הראשון', emoji: '🧗', desc: 'בניית כוח משיכה הדרגתי עד המתח הראשון', days: 30, session: ['vert_pull', 'horiz_pull', 'vert_pull', 'core'] },
  { id: 'pushup50', name: '50 שכיבות סמיכה', emoji: '🙇', desc: 'מ־0 ל־50 שכיבות תוך 30 יום', days: 30, session: ['horiz_push', 'vert_push', 'horiz_push', 'core'] },
  { id: 'core', name: 'ליבת פלדה', emoji: '🔥', desc: '21 יום לבטן וליבה חזקה ויציבה', days: 21, session: ['core', 'core', 'cardio', 'core'] },
  { id: 'legs', name: 'רגליים חזקות', emoji: '🦵', desc: '30 יום כוח וסיבולת לפלג גוף תחתון', days: 30, session: ['squat', 'hinge', 'squat', 'cardio'] },
  { id: 'fatburn', name: 'שריפת שומן 30 יום', emoji: '💧', desc: 'אימוני מעגל אינטנסיביים לחיטוב', days: 30, session: ['cardio', 'squat', 'horiz_push', 'core', 'cardio'] }
];

// --- daily challenges (rotates by day) --------------------------------
const DAILY_CHALLENGES = [
  { emoji: '🦵', text: '50 סקוואטים במהלך היום' },
  { emoji: '🙇', text: '30 שכיבות סמיכה מפוזרות' },
  { emoji: '🧘', text: 'פלאנק מצטבר של 3 דקות' },
  { emoji: '🚶', text: '8,000 צעדים היום' },
  { emoji: '💧', text: 'לשתות 3 ליטר מים' },
  { emoji: '🌅', text: '5 דקות מתיחות בבוקר' },
  { emoji: '🔥', text: '40 מטפסי הרים' },
  { emoji: '🍎', text: 'לאכול 2 מנות ירק' },
  { emoji: '🏃', text: '20 ברפי במהלך היום' },
  { emoji: '🌙', text: 'ללכת לישון לפני חצות' },
  { emoji: '🍗', text: 'להגיע ליעד החלבון היומי' },
  { emoji: '🤸', text: '20 מכרעים לכל רגל' },
  { emoji: '💪', text: '3 סטים של מקסימום שכיבות' },
  { emoji: '🧗', text: 'תלייה על מוט 60 שניות מצטבר' }
];

// --- 100 motivational lines (daily quote + between-set nudges) --------
const QUOTES = [
  'כל אימון סופר. גם הקצר.',
  'המשמעת מנצחת את המוטיבציה.',
  'הגוף שלך יכול. תשכנע את הראש.',
  'אתה לא צריך להיות מושלם, רק עקבי.',
  'הצעד הכי קשה הוא הראשון — ועשית אותו.',
  'אלוף נבנה מהחזרה שבא לך לוותר בה.',
  'תתאמן בשביל מי שתהיה מחר.',
  'כאב זמני, גאווה לתמיד.',
  'אין קסמים. יש עקביות.',
  'תתחיל היום, תודה לעצמך מחר.',
  'הרצף שלך הוא הכוח שלך.',
  'חזרה אחת יותר ממה שאתמול.',
  'גוף חזק, ראש חזק.',
  'תעשה את זה למען המשפחה שרואה אותך.',
  'הזיעה של היום היא החיוך של מחר.',
  'אתה מתחרה רק מול עצמך של אתמול.',
  'קטן וקבוע מנצח גדול ומזדמן.',
  'תתאמן כשקשה, במיוחד כשקשה.',
  'הגוף משיג את מה שהמוח מאמין בו.',
  'אין מעליות להצלחה, רק מדרגות.',
  'תפסיק לחכות למוטיבציה. תיצור אותה.',
  'כל טיפת מאמץ נספרת.',
  'אתה חזק יותר ממה שאתה חושב.',
  'ההתקדמות היא ההתמכרות הבריאה.',
  'תזוז. אפילו 10 דקות משנות הכל.',
  'הרגלים בונים אלופים.',
  'אל תספור ימים, תגרום לימים להיספר.',
  'הגרסה הטובה שלך מחכה בצד השני של המאמץ.',
  'תעשה זאת בשביל הבריאות, תישאר בשביל התחושה.',
  'משמעת היא לזכור מה אתה רוצה באמת.',
  'אתה נבנה עכשיו, חזרה אחר חזרה.',
  'הקושי הוא המורה הכי טוב.',
  'תתגאה בכל אימון שסימנת בוצע.',
  'אין תירוצים, יש רק צעדים.',
  'תשקיע בעצמך — זו ההשקעה הכי בטוחה.',
  'הרצף לא נשבר על ידי מי שלא מוותר.',
  'גם אלופים התחילו ממתחיל.',
  'תזוז היום כדי לחייך מחר.',
  'הכוח מגיע ממה שהתגברת עליו.',
  'תתאמן קשה, תישן טוב, תחזור מחר.',
  'המשפחה מתאמנת יחד, גדלה יחד.',
  'עוד סט. עוד ניצחון קטן.',
  'אתה לא עייף, אתה כמעט שם.',
  'תבחר להיות בריא — כל יום מחדש.',
  'הצלחה היא סכום של הרגלים קטנים.',
  'תזכור למה התחלת.',
  'הגוף שלך הוא הבית היחיד שיש לך. תשמור עליו.',
  'כל צעד קדימה הוא ניצחון.',
  'תתאמן היום כדי שלא תצטער מחר.',
  'המחר מתחיל במה שתעשה עכשיו.',
  'אתה בונה משמעת שתשרת אותך בכל תחום.',
  'תעצור לנוח, לא לוותר.',
  'חזק זה לא מה שאתה מרים, זה מה שאתה מתגבר עליו.',
  'תתאהב בתהליך, לא רק בתוצאה.',
  'הגוף מקשיב למה שאתה אומר לו.',
  'עוד חזרה קטנה, עוד גרסה טובה יותר.',
  'אין דבר כזה אימון גרוע. יש רק אימון שלא קרה.',
  'תעשה מה שקשה עכשיו, כדי שהחיים יהיו קלים אחר כך.',
  'גאווה נבנית מזיעה.',
  'הרצף שלך מעורר השראה למשפחה שלך.',
  'תזכור: התחלת כי היה לך אכפת.',
  'הכוח שלך גדל בשקט, יום אחר יום.',
  'אתה לא מפסיד זמן, אתה משקיע בבריאות.',
  'כל אימון הוא הצבעה למי שאתה רוצה להיות.',
  'תתחיל איפה שאתה, תשתמש במה שיש, תעשה מה שאתה יכול.',
  'אלוף זה מי שקם עוד פעם.',
  'הרגל אחד טוב מושך אחריו עשרה.',
  'תזיז את הגוף, תשקיט את הראש.',
  'אין קיצורי דרך למקומות ששווה להגיע אליהם.',
  'תעשה את זה עייף. תעשה את זה בכל זאת.',
  'הגוף שלך יודה לך על כל תנועה.',
  'ההצלחה אוהבת עקביות.',
  'תתאמן היום — האני העתידי שלך גאה בך.',
  'כל טיפת זיעה מקרבת אותך למטרה.',
  'הכוח הכי גדול הוא לא לוותר.',
  'תבנה את עצמך, לא רק את השרירים.',
  'תזכור כמה רחוק הגעת, לא רק כמה נשאר.',
  'אימון קצר עדיף על אימון שלא קרה.',
  'תעשה את זה למען עצמך, וגם למען מי שאוהב אותך.',
  'עקביות מנצחת מושלמות.',
  'הראש מוותר לפני הגוף. תשלוט בראש.',
  'תתאמן כמו שאתה מתכוון לנצח.',
  'כל יום שאתה בוחר לזוז — ניצחת.',
  'גוף בריא, חיים מלאים.',
  'תסמן בוצע ותרגיש את הגאווה.',
  'הרצף שלך הוא סיפור של החלטות טובות.',
  'אתה עושה את זה בשביל החיים, לא בשביל שבוע.',
  'עוד יום, עוד לבנה בבניין שלך.',
  'תתגבר על אין לי כוח ותגלה כוח חדש.',
  'המאמץ של היום הוא החופש של מחר.',
  'תתאמן בשמחה, לא בעונש.',
  'אתה לא נלחם בגוף שלך, אתה בונה אותו.',
  'כל התחלה מחדש היא אומץ.',
  'הדרך למעלה מתחילה בצעד קטן.',
  'תעשה את המקסימום שלך היום, זה מספיק.',
  'הבריאות היא העושר האמיתי.',
  'תזוז בשביל הילדים שרואים אותך.',
  'הרגל של אלוף: להראות, גם כשלא בא.',
  'אתה במרחק אימון אחד ממצב רוח טוב יותר.',
  'הגרסה הכי חזקה שלך נבנית עכשיו. תמשיך.'
];

// Mock family for the leaderboard demo (real accounts in phase 2).
const DEMO_FAMILY = [
  { name: 'אתה', workouts: 0, streak: 0, you: true },
  { name: 'אבא', workouts: 4, streak: 5 },
  { name: 'אמא', workouts: 3, streak: 3 },
  { name: 'נועה', workouts: 6, streak: 8 },
  { name: 'איתי', workouts: 2, streak: 1 }
];
