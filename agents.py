#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מערכת סוכני AI לעסק אונליין בשוק האמריקאי
==========================================
"אימפריית סוכנים" קטנה ועובדת. הצוות:

  🧑‍💼 מנכ"ל     - מפרק מטרה עסקית למשימות מחקר ומסכם דוח החלטות
  🔍 חוקרים     - מחפשים בשוק האמריקאי האמיתי (מחירים, מתחרים, ביקוש)
  💰 כלכלן      - מחשב עלויות, תמחור ורווחיות למכירה אונליין
  ✍️  שיווק      - כותב תוכן שיווקי באנגלית (לשוק האמריקאי) + הסבר בעברית

המערכת בנויה לעסק אונליין שלא דורש ממך אנגלית - הסוכנים מטפלים באנגלית
ומסבירים לך הכל בעברית. הכל רץ על Claude API של Anthropic.
ראה README.md להוראות הפעלה צעד-צעד.
"""

import os
import sys
import json
import datetime

try:
    import anthropic
except ImportError:
    print("חסרה ספריית anthropic. הרץ קודם:  pip install -r requirements.txt")
    sys.exit(1)


# ---------------------------------------------------------------------------
# הגדרות
# ---------------------------------------------------------------------------

# בחירת מודל: אפשר לבחור בלי לגעת בקוד, דרך משתנה הסביבה AGENT_MODEL.
#   "claude-sonnet-4-6"  -> ברירת מחדל. האיזון הכי טוב בין איכות למחיר (מומלץ)
#   "claude-opus-4-8"    -> הכי חכם, יקר יותר. להחלטות גדולות
#   "claude-haiku-4-5"   -> הכי זול ומהיר, פחות מעמיק
MODEL = os.environ.get("AGENT_MODEL", "claude-sonnet-4-6")

WEB_SEARCH_TOOL = {"type": "web_search_20260209", "name": "web_search"}

# כמה שאלות מחקר המנכ"ל יפרק את המטרה (אפשר לשנות)
NUM_RESEARCH_TASKS = 4


def get_client() -> "anthropic.Anthropic":
    """יוצר חיבור ל-Claude. דורש משתנה סביבה ANTHROPIC_API_KEY."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print(
            "\n[שגיאה] לא נמצא מפתח API.\n"
            "הגדר אותו כך (החלף את xxxxx במפתח שלך מ-console.anthropic.com):\n"
            "    Mac/Linux:   export ANTHROPIC_API_KEY=sk-ant-xxxxx\n"
            "    Windows:     set ANTHROPIC_API_KEY=sk-ant-xxxxx\n"
        )
        sys.exit(1)
    return anthropic.Anthropic()


# ---------------------------------------------------------------------------
# מנוע בסיסי: הרצת סוכן בודד (עם או בלי גישה לאינטרנט)
# ---------------------------------------------------------------------------

def run_agent(client, system_prompt, user_prompt, use_web=False, max_tokens=16000):
    """
    מריץ סוכן Claude יחיד ומחזיר את הטקסט שהוא הפיק.
    אם use_web=True - הסוכן יכול לחפש באינטרנט בזמן אמת.
    """
    tools = [WEB_SEARCH_TOOL] if use_web else []
    messages = [{"role": "user", "content": user_prompt}]

    # לולאה שמטפלת ב-"pause_turn" - קורה כשהסוכן עושה הרבה חיפושים ברצף
    for _ in range(10):
        resp = client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            thinking={"type": "adaptive"},
            output_config={"effort": "high"},
            system=system_prompt,
            messages=messages,
            tools=tools,
        )
        if resp.stop_reason == "pause_turn":
            messages.append({"role": "assistant", "content": resp.content})
            continue
        break

    return "".join(block.text for block in resp.content if block.type == "text").strip()


# ---------------------------------------------------------------------------
# הסוכנים
# ---------------------------------------------------------------------------

def ceo_plan(client, business_goal):
    """
    המנכ"ל: מקבל מטרה עסקית ומפרק אותה ל-NUM_RESEARCH_TASKS שאלות מחקר חדות.
    מחזיר רשימת מחרוזות (שאלות לחוקרים).
    """
    system = (
        "אתה מנכ\"ל מנוסה של חברת ייעוץ לעסקים אונליין שמתמחה בשוק האמריקאי. "
        "הלקוח שלך מוכר אונליין בלבד ואינו דובר אנגלית, לכן התמקד בהזדמנויות "
        "שלא דורשות שיחה עם לקוחות (מסחר אלקטרוני, דרופשיפינג, מוצרים דיגיטליים). "
        "המשימה שלך: לפרק מטרה עסקית למשימות מחקר ממוקדות שאפשר לבדוק עם חיפוש "
        "באינטרנט - מחירים, מתחרים, גודל שוק, ביקוש, ועלויות כניסה נמוכות."
    )
    user = (
        f"המטרה העסקית: {business_goal}\n\n"
        f"פרק אותה ל-{NUM_RESEARCH_TASKS} שאלות מחקר עצמאיות. "
        "החזר אך ורק JSON תקין במבנה הבא, בלי טקסט נוסף:\n"
        '{"tasks": ["שאלה 1", "שאלה 2", ...]}'
    )
    raw = run_agent(client, system, user, use_web=False, max_tokens=4000)

    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        tasks = json.loads(raw[start:end]).get("tasks", [])
        if tasks:
            return tasks[:NUM_RESEARCH_TASKS]
    except (ValueError, json.JSONDecodeError):
        pass

    return [
        f"חקור את הביקוש וגודל השוק האמריקאי עבור: {business_goal}",
        f"מי המתחרים המובילים בארה\"ב בתחום: {business_goal}? מה הם גובים?",
        f"מהי טווח המחירים המקובל בארה\"ב עבור: {business_goal}?",
        f"אילו פערים והזדמנויות עם השקעה נמוכה קיימים בתחום: {business_goal}?",
    ]


def researcher(client, question, idx, total):
    """חוקר: מחפש באינטרנט נתונים אמיתיים על שאלת מחקר אחת."""
    print(f"  [{idx}/{total}] חוקר: {question}")
    system = (
        "אתה חוקר שוק מקצועי. השתמש בחיפוש באינטרנט כדי למצוא נתונים אמיתיים "
        "ועדכניים על השוק האמריקאי: מחירים בדולרים, שמות מתחרים אמיתיים, מספרים, "
        "מגמות. צטט מקורות כשאפשר. אל תמציא מספרים - אם לא מצאת נתון, אמור זאת. "
        "כתוב את הממצאים בעברית, בצורה תמציתית ומסודרת עם נקודות."
    )
    return run_agent(client, system, question, use_web=True, max_tokens=8000)


def economist(client, business_goal, findings):
    """
    כלכלן: על בסיס ממצאי המחקר, מחשב עלויות, תמחור ורווחיות למכירה אונליין.
    משתמש בחיפוש כדי למצוא עמלות פלטפורמות ועלויות אמיתיות.
    """
    print("\n  💰 הכלכלן מחשב עלויות ורווחיות...")
    combined = "\n\n".join(f"ממצא {i+1}:\n{f}" for i, f in enumerate(findings))
    system = (
        "אתה כלכלן עסקי שמתמחה במכירה אונליין בארה\"ב. על בסיס ממצאי המחקר, "
        "בנה ניתוח רווחיות ריאליסטי בעברית. חפש באינטרנט עלויות אמיתיות: עמלות "
        "מרקטפלייסים (Amazon, Etsy, Shopify), עלויות משלוח, עלות פרסום ממוצעת "
        "(CPC/CPA), ועלות מוצר. הצג: (1) טבלת עלויות משוערת לפריט, (2) תמחור "
        "מומלץ, (3) רווח גולמי למכירה ובאחוזים, (4) כמה מכירות צריך כדי לכסות "
        "השקעה ראשונית נמוכה. ציין הנחות במפורש ואל תמציא מספרים שלא מצאת."
    )
    user = f"המטרה העסקית: {business_goal}\n\nממצאי המחקר:\n{combined}"
    return run_agent(client, system, user, use_web=True, max_tokens=10000)


def marketer(client, business_goal, findings):
    """
    שיווק: כותב תוכן שיווקי באנגלית לשוק האמריקאי, ומסביר אותו בעברית.
    זה הסוכן שמגשר על פער השפה - הלקוח מקבל אנגלית מוכנה למכירה.
    """
    print("\n  ✍️  סוכן השיווק כותב תוכן באנגלית + הסבר בעברית...")
    context = "\n\n".join(f"ממצא {i+1}:\n{f}" for i, f in enumerate(findings))
    system = (
        "אתה קופירייטר מומחה למסחר אלקטרוני בשוק האמריקאי. הלקוח אינו דובר "
        "אנגלית, לכן עליך לכתוב לו תוכן שיווקי מוכן לשימוש באנגלית, ולצדו הסבר "
        "ותרגום בעברית כדי שיבין מה כתבת. הפק עבור המוצר/התחום: "
        "(1) שם מוצר וכותרת מושכת באנגלית, "
        "(2) תיאור מוצר מלא באנגלית (לדף מכירה/אמזון), "
        "(3) 5 נקודות מכירה (bullet points) באנגלית, "
        "(4) טקסט קצר למודעת פרסום באנגלית, "
        "(5) רשימת מילות מפתח באנגלית (SEO). "
        "לכל חלק באנגלית - הוסף מיד אחריו תרגום/הסבר קצר בעברית בסוגריים. "
        "סדר את הכל עם כותרות ברורות."
    )
    user = (
        f"התחום/המוצר: {business_goal}\n\n"
        f"רקע מהמחקר (להתאמת המסרים לשוק):\n{context}"
    )
    return run_agent(client, system, user, use_web=False, max_tokens=12000)


def ceo_synthesize(client, business_goal, findings, economics):
    """המנכ"ל מסכם הכל לדוח החלטות עם המלצה קונקרטית."""
    print("\n  🧑‍💼 המנכ\"ל מסכם את הדוח הסופי...")
    combined = "\n\n".join(f"### ממצאי מחקר {i+1}:\n{f}" for i, f in enumerate(findings))
    system = (
        "אתה מנכ\"ל שמכין דוח החלטות לבעלים של עסק אונליין שאינו דובר אנגלית. "
        "על בסיס המחקר וניתוח הרווחיות, כתוב דוח ברור בעברית הכולל: "
        "(1) סיכום השוק והביקוש, (2) המתחרים והמחירים, (3) ההזדמנות הכי מבטיחה "
        "עם השקעה נמוכה ומכירה אונליין, (4) המלצה קונקרטית עם 3-5 צעדים ראשונים "
        "ריאליסטיים, (5) הערכת סיכונים ולוחות זמנים כנה. "
        "אם משהו לא משתלם - אמור זאת בכנות."
    )
    user = (
        f"המטרה העסקית: {business_goal}\n\n"
        f"ממצאי צוות המחקר:\n{combined}\n\n"
        f"ניתוח רווחיות מהכלכלן:\n{economics}\n\n"
        "כתוב את דוח ההחלטות המלא."
    )
    return run_agent(client, system, user, use_web=False, max_tokens=16000)


# ---------------------------------------------------------------------------
# הרצה ראשית
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("  מערכת סוכני AI לעסק אונליין בשוק האמריקאי")
    print(f"  (מודל בשימוש: {MODEL})")
    print("=" * 60)

    if len(sys.argv) > 1:
        business_goal = " ".join(sys.argv[1:])
    else:
        business_goal = input(
            "\nמה התחום/המטרה העסקית שתרצה לחקור?\n"
            "(לדוגמה: 'מכירת מוצרי טיפוח טבעיים אונליין בארה\"ב')\n> "
        ).strip()

    if not business_goal:
        print("לא הוזנה מטרה. יציאה.")
        return

    client = get_client()
    print(f"\nמטרה: {business_goal}\n")

    print("שלב 1 - המנכ\"ל מפרק את המטרה למשימות מחקר...")
    tasks = ceo_plan(client, business_goal)

    print(f"\nשלב 2 - צוות החוקרים יוצא לדרך ({len(tasks)} משימות):")
    findings = [researcher(client, q, i + 1, len(tasks)) for i, q in enumerate(tasks)]

    print("\nשלב 3 - ניתוח כלכלי:")
    economics = economist(client, business_goal, findings)

    print("\nשלב 4 - תוכן שיווקי:")
    marketing = marketer(client, business_goal, findings)

    print("\nשלב 5 - דוח החלטות:")
    report = ceo_synthesize(client, business_goal, findings, economics)

    # שמירת הכל לקובץ אחד
    stamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")
    filename = f"report_{stamp}.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# דוח עסקי מלא: {business_goal}\n\n")
        f.write(f"_נוצר ב-{stamp} על ידי מערכת סוכני AI (מודל: {MODEL})_\n\n")
        f.write("## 🧑‍💼 דוח החלטות (המנכ\"ל)\n\n" + report + "\n\n")
        f.write("## 💰 ניתוח רווחיות (הכלכלן)\n\n" + economics + "\n\n")
        f.write("## ✍️ תוכן שיווקי מוכן (סוכן השיווק)\n\n" + marketing + "\n")

    print("\n" + "=" * 60)
    print(report)
    print("=" * 60)
    print(f"\n[נשמר] הדוח המלא (החלטות + רווחיות + תוכן שיווקי) בקובץ: {filename}")
    print("פתח אותו בכל עורך טקסט כדי לראות הכל.")


if __name__ == "__main__":
    main()
