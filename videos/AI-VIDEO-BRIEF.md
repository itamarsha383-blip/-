# 🎬 KIN — מפרט הפקת סרטוני AI לתרגילים

מדריך מלא ליצירת סרטוני הדגמה עם אנשים (AI) ב-ChatGPT / Sora / כל כלי וידאו,
והטמעתם באפליקציה. **25 סרטונים** בסך הכל.

---

## חלק 1 — מפרט טכני (חובה, זהה לכל הסרטונים)

| פרמטר | ערך |
|---|---|
| **פורמט** | MP4 (H.264) |
| **יחס** | 16:9 לרוחב (מומלץ) או 1:1 ריבוע |
| **רזולוציה** | 1080p |
| **אורך** | 4–6 שניות |
| **לופ** | חלק — הפריים הראשון והאחרון באותה תנוחת התחלה |
| **מצלמה** | קבועה, בלי חיתוכים/זום. הזווית מצוינת לכל תרגיל |
| **דמות** | אדם אתלטי אחד, לבוש ספורט נייטרלי, גוף מלא בפריים |
| **רקע** | סטודיו נקי אחיד, תאורה טובה, בלי טקסט/לוגו |
| **אודיו** | לא נחוץ (הסרטונים מושתקים באפליקציה) |
| **טכניקה** | **מדויקת לפי הספר** — זה החשוב ביותר |

**פרומפט בסיס (הדבק לפני כל תיאור תרגיל):**
> A single fit athlete in neutral fitted activewear performs the exercise with
> textbook form, 1–2 slow controlled reps, full body centered in frame, fixed
> camera, clean evenly-lit light-grey seamless studio background, no text, no
> logos, seamless loop (starts and ends in the same position). 5 seconds.

---

## חלק 2 — 25 הסרטונים (id · שם · זווית · פרומפט)

> ⚠️ **חשוב:** שמור כל קובץ בשם ה-id **בדיוק** + `.mp4` (למשל `pushup.mp4`),
> והכנס לתיקייה `videos/`. האפליקציה תזהה ותנגן אוטומטית.

### תרגילים ראשיים (13)

**1. `pushup` — שכיבות סמיכה** · זווית: פרופיל צד
> ...Push-up: body in a straight rigid plank, lowers chest until nearly touching the floor with elbows tucked ~45°, then presses back up to full extension. Side profile view.

**2. `pike` — Pike Push-up** · פרופיל צד
> ...Pike push-up: inverted-V position with hips high, lowers the head toward the floor between the hands, then presses back up. Side profile.

**3. `rows` — משיכות אופקיות** · פרופיל צד
> ...Inverted bodyweight row under a low bar, body straight like a rigid plank, pulls chest up to the bar squeezing shoulder blades, lowers under control. Side profile.

**4. `pullup` — מתח (Pull-up)** · חזית / חצי צד
> ...Pull-up: hangs from a bar with arms fully extended, pulls the chin above the bar, lowers all the way back to a dead hang. Front three-quarter view.

**5. `squat` — סקוואט** · פרופיל צד
> ...Bodyweight squat: stands tall, sits hips back and down until thighs are parallel to the floor with knees tracking over the toes and a flat back, then stands up. Side profile.

**6. `lunge` — מכרעים (לאנג׳)** · פרופיל צד
> ...Forward lunge: steps forward and lowers until the back knee nearly touches the floor, front knee stacked over the ankle, torso upright, then pushes back to standing. Side profile.

**7. `glutebridge` — גשר ישבן** · פרופיל צד
> ...Glute bridge: lies on back with knees bent and feet flat, drives the hips up into a straight line squeezing the glutes, then lowers. Side profile.

**8. `dip` — מקבילים (Dips)** · פרופיל צד
> ...Parallel-bar dip: supports body on parallel bars with arms straight, lowers until elbows reach 90°, keeps elbows close, presses back up. Side profile.

**9. `plank` — פלאנק** · פרופיל צד
> ...Forearm plank hold: forearms under shoulders, body in one straight line from head to heels, core braced, minimal motion (subtle breathing). Side profile.

**10. `hollow` — Hollow Hold** · פרופיל צד
> ...Hollow body hold: lies on back, lower back pressed to the floor, shoulders and straight legs lifted into a shallow banana shape, holds. Side profile.

**11. `legraise` — הרמות רגליים** · פרופיל צד
> ...Lying leg raise: lies on back, raises straight legs to 90°, lowers them slowly without touching the floor, lower back stays flat. Side profile.

**12. `mountain` — מטפסי הרים** · פרופיל צד
> ...Mountain climbers: high plank position, drives knees toward the chest alternately at a controlled pace, hips low and stable. Side profile.

**13. `burpee` — ברפי** · פרופיל צד
> ...Burpee: from standing drops to a squat with hands down, kicks feet back to a plank with a push-up, jumps feet back in, explodes up with a jump. Side profile.

### חימום (7)

**14. `arm_circles` — סיבובי זרועות** · חזית
> ...Standing arm circles: arms extended out to the sides, drawing controlled circles. Front view.

**15. `leg_swings` — נדנודי רגליים** · פרופיל צד
> ...Standing leg swings: holds a support with one hand, swings one straight leg forward and backward in a controlled arc. Side profile.

**16. `jumping_jacks` — קפיצות פיסוק** · חזית
> ...Classic jumping jacks: jumps feet out while raising arms overhead, then back together. Front view.

**17. `bw_squats` — סקוואט להתחממות** · פרופיל צד
> ...Light warm-up bodyweight squats at an easy comfortable pace and range. Side profile.

**18. `cat_cow` — חתול־פרה** · פרופיל צד
> ...Cat-cow on all fours: alternately arches the spine up (cat) and drops the belly down (cow) slowly. Side profile.

**19. `shoulder_taps` — נגיעות כתף בפלאנק** · חזית/צד
> ...Plank shoulder taps: high plank, taps the opposite shoulder with each hand alternately while keeping hips stable. Front three-quarter view.

**20. `band_pull` — משיכות פתיחת כתף** · חזית
> ...Band pull-apart: holds a resistance band at shoulder height with straight arms and pulls it apart, squeezing the shoulder blades, then returns. Front view.

### שחרור ומתיחות (5)

**21. `chest_stretch` — מתיחת חזה** · חצי צד
> ...Standing chest stretch: clasps hands behind the head/back and opens the chest, holding the stretch. Front three-quarter view.

**22. `hamstring` — מתיחת ירך אחורית** · פרופיל צד
> ...Standing hamstring stretch: one leg slightly forward, hinges at the hips over the front leg to feel the hamstring stretch, holds. Side profile.

**23. `quad` — מתיחת ארבע ראשי** · פרופיל צד
> ...Standing quad stretch: pulls one heel toward the glute holding the ankle, knees together, holds. Side profile.

**24. `child_pose` — תנוחת הילד** · פרופיל צד
> ...Child's pose: kneels and sits back on the heels with arms extended forward on the floor, forehead down, holds. Side profile.

**25. `shoulder_stretch` — מתיחת כתף** · חזית
> ...Cross-body shoulder stretch: pulls one straight arm across the chest with the other arm, holds. Front view.

---

## חלק 3 — איך מטמיעים

1. צור כל סרטון לפי הפרומפט (בסיס + תיאור התרגיל).
2. ייצא ל-MP4 ושמור בשם ה-id בדיוק, למשל `squat.mp4`.
3. הכנס את הקבצים לתיקייה `videos/` בפרויקט.
4. זהו — האפליקציה מנגנת אוטומטית את ה-`.mp4` במקום ההדגמה הזמנית.

**סדר עדיפויות:** התחל מ-13 התרגילים הראשיים (הכי חשובים), אחר כך חימום ומתיחות.

**טיפ:** אם כלי ה-AI מייצר קליפ ארוך מדי — חתוך ל-5 שניות ודאג שהפריים הראשון
והאחרון זהים, כדי שהלופ יהיה חלק.
