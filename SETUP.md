# Novixel.ai — Setup / מדריך הקמה

Bilingual setup guide. English first, then Hebrew. / מדריך דו-לשוני: אנגלית ואז עברית.

---

## 🏗️ Architecture (what we're building)

- **Public site** — `index.html` (English) + Spanish, with a language switcher. Content is
  loaded from Supabase so it can be edited from the admin panel (with a built-in fallback so
  the site always renders, even offline).
- **Admin panel** — `/admin/` — Hebrew + English, login-protected. Edit all site content,
  prices, FAQ, translations, and view/manage the **leads inbox** ("customer memory").
- **Backend** — Supabase (Postgres + Auth + Row Level Security). Free tier is enough to start.

---

## ✅ Setup steps (do these once)

1. **Create a Supabase project** → https://supabase.com → New project. Pick a region close
   to your customers. Wait ~2 min for it to provision.
2. **Run the schema** → SQL Editor → New query → paste the contents of
   `supabase/schema.sql` → **Run**.
3. **Create your admin login** → Authentication → Users → *Add user* → enter your email +
   a password.
4. **Mark yourself as admin** → SQL Editor → run (replace the two values):
   ```sql
   insert into public.admins (user_id, email, role)
   values ('YOUR-USER-UUID', 'you@novixel.ai', 'owner');
   ```
   (Find the UUID under Authentication → Users.)
5. **Copy your keys** → Settings → API → copy:
   - **Project URL** (e.g. `https://abcd.supabase.co`)
   - **anon public** key
6. **Paste the keys** into both:
   - `assets/config.js`  (used by the public site)
   - `admin/config.js`   (used by the admin panel)
   > Only the **anon public** key goes in these files. Never put the `service_role` key in
   > front-end code — it bypasses all security.
7. **Deploy** to Netlify (drag-and-drop the folder, or connect the GitHub repo).

That's it — the site reads content from Supabase, the form writes leads, and you log into
`/admin/` to edit everything.

---
---

## 🏗️ ארכיטקטורה (מה אנחנו בונים)

- **אתר ציבורי** — `index.html` (אנגלית) + ספרדית, עם מתג שפה. התוכן נטען מ-Supabase כדי
  שניתן יהיה לערוך אותו מממשק הניהול (עם ברירת-מחדל מובנית כך שהאתר תמיד מוצג, גם בלי חיבור).
- **ממשק ניהול** — `/admin/` — עברית + אנגלית, מוגן בהתחברות. עריכת כל תוכן האתר, מחירים,
  שאלות נפוצות ותרגומים, וצפייה/ניהול של **תיבת הלידים** ("זיכרון לקוח").
- **שרת (Backend)** — Supabase (Postgres + התחברות + אבטחת שורות). החבילה החינמית מספיקה
  להתחלה.

---

## ✅ שלבי הקמה (פעם אחת)

1. **פתח פרויקט Supabase** → https://supabase.com → New project. בחר אזור קרוב ללקוחות שלך.
   המתן ~2 דקות.
2. **הרץ את הסכמה** → SQL Editor → New query → הדבק את תוכן `supabase/schema.sql` → **Run**.
3. **צור משתמש ניהול** → Authentication → Users → *Add user* → המייל שלך + סיסמה.
4. **סמן את עצמך כמנהל** → SQL Editor → הרץ (החלף את שני הערכים):
   ```sql
   insert into public.admins (user_id, email, role)
   values ('ה-UUID-שלך', 'you@novixel.ai', 'owner');
   ```
   (את ה-UUID מוצאים תחת Authentication → Users.)
5. **העתק מפתחות** → Settings → API → העתק:
   - **Project URL**
   - מפתח **anon public**
6. **הדבק את המפתחות** בשני הקבצים:
   - `assets/config.js`  (לאתר הציבורי)
   - `admin/config.js`   (לממשק הניהול)
   > רק מפתח ה-**anon public** נכנס לקבצים האלה. לעולם אל תכניס את מפתח ה-`service_role`
   > לקוד צד-לקוח — הוא עוקף את כל האבטחה.
7. **העלה ל-Netlify** (גרירה של התיקייה, או חיבור למאגר ב-GitHub).

זהו — האתר קורא תוכן מ-Supabase, הטופס כותב לידים, ואתה מתחבר ל-`/admin/` כדי לערוך הכל.
