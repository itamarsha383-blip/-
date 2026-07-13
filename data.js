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
function buildSession(profile, sessionOffset = 0, adjustments = {}) {
  const split = chooseSplit(profile);
  const tmpl = split.sessions[sessionOffset % split.sessions.length];
  const rx = prescription(profile.goal, profile.level);
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
  for (const pat of tmpl.patterns) {
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
    const target = repTarget(profile.goal, profile.level, adj);
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

  // Warm-up: prioritise drills that prep the muscles THIS session will use.
  const sessPatterns = new Set(main.map((e) => e.pattern));
  const relevant = WARMUPS.filter((w) => (w.for || []).some((p) => sessPatterns.has(p)));
  const general = WARMUPS.filter((w) => !relevant.includes(w));
  const warmup = [...relevant, ...general].slice(0, 3);
  // Cooldown: rotating stretches.
  const rot = (arr, n) => Array.from({ length: n }, (_, i) => arr[(sessionOffset + i) % arr.length]);
  return {
    name: tmpl.name,
    splitLabel: split.label,
    days: split.days,
    goalStyle: GOALS.find((g) => g.id === profile.goal)?.style || '',
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
  if (p.goal === 'fatloss') kcal *= 0.82;       // ~18% deficit — sustainable
  if (p.goal === 'muscle') kcal *= 1.10;        // modest surplus
  kcal = Math.round(kcal / 10) * 10;
  // Protein: higher on a cut (muscle retention) and for muscle gain.
  const protPerKg = p.goal === 'fatloss' ? 2.2 : p.goal === 'muscle' ? 2.0 : 1.8;
  const protein = Math.round(protPerKg * w);
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
  const water = Math.round(w * 0.033 * 10) / 10; // liters/day baseline
  return { kcal, protein, carbs, fat, water };
}

// --- Food database (per stated unit) ----------------------------------
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
  { name: 'שמן זית', kcal: 884, p: 0, c: 0, f: 100, unit: '100 מ״ל' },
  { name: 'גבינה צהובה', kcal: 350, p: 25, c: 2, f: 27, unit: '100 גרם' },
  { name: 'חומוס מבושל', kcal: 164, p: 9, c: 27, f: 2.6, unit: '100 גרם' },
  { name: 'חמאת בוטנים', kcal: 588, p: 25, c: 20, f: 50, unit: '100 גרם' },
  { name: 'טופו', kcal: 76, p: 8, c: 1.9, f: 4.8, unit: '100 גרם' }
];

// --- Professional demonstration photos --------------------------------
// Source: free-exercise-db (yuhonas) — Public Domain (Unlicense).
// Two frames per move (start ↔ end) → crossfaded into a motion demo.
// Loaded lazily when online, cached by the service worker, SVG fallback offline.
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

// Mock family for the leaderboard demo (real accounts in phase 2).
const DEMO_FAMILY = [
  { name: 'אתה', workouts: 0, streak: 0, you: true },
  { name: 'אבא', workouts: 4, streak: 5 },
  { name: 'אמא', workouts: 3, streak: 3 },
  { name: 'נועה', workouts: 6, streak: 8 },
  { name: 'איתי', workouts: 2, streak: 1 }
];
