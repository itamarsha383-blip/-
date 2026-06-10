#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מערכת סוכני AI לחקר השוק האמריקאי
==================================
"אימפריית סוכנים" קטנה ועובדת: מנכ"ל (Orchestrator) שמפרק מטרה עסקית
למשימות מחקר, צוות חוקרים שמחפשים בשוק האמריקאי האמיתי (מחירים, מתחרים,
פערים), ודוח מסכם עם המלצות קונקרטיות.

הכל בנוי על Claude API של Anthropic. צריך מפתח API אחד כדי להריץ.
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

MODEL = "claude-opus-4-8"            # המודל החכם והעדכני ביותר
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
    אם use_web=True — הסוכן יכול לחפש באינטרנט בזמן אמת.
    """
    tools = [WEB_SEARCH_TOOL] if use_web else []
    messages = [{"role": "user", "content": user_prompt}]

    # לולאה שמטפלת ב-"pause_turn" — קורה כשהסוכן עושה הרבה חיפושים ברצף
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
        "אתה מנכ\"ל מנוסה של חברת ייעוץ עסקי שמתמחה בשוק האמריקאי. "
        "המשימה שלך: לקבל מטרה עסקית ולפרק אותה למשימות מחקר ממוקדות שיעזרו "
        "להחליט אם ואיך להיכנס לשוק ולהרוויח. כל שאלת מחקר צריכה להיות קונקרטית, "
        "ניתנת לבדיקה עם חיפוש באינטרנט, וממוקדת בנתונים אמיתיים: מחירים, מתחרים, "
        "גודל שוק, ביקוש, מחסומי כניסה, והזדמנויות עם השקעה נמוכה."
    )
    user = (
        f"המטרה העסקית: {business_goal}\n\n"
        f"פרק אותה ל-{NUM_RESEARCH_TASKS} שאלות מחקר עצמאיות. "
        "החזר אך ורק JSON תקין במבנה הבא, בלי טקסט נוסף:\n"
        '{"tasks": ["שאלה 1", "שאלה 2", ...]}'
    )
    raw = run_agent(client, system, user, use_web=False, max_tokens=4000)

    # ניסיון לחלץ JSON; אם נכשל — נופלים לחלוקה פשוטה
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
    """
    חוקר: מקבל שאלת מחקר אחת, מחפש באינטרנט נתונים אמיתיים, ומחזיר ממצאים.
    """
    print(f"  [{idx}/{total}] חוקר: {question}")
    system = (
        "אתה חוקר שוק מקצועי. השתמש בחיפוש באינטרנט כדי למצוא נתונים אמיתיים "
        "ועדכניים על השוק האמריקאי: מחירים בדולרים, שמות מתחרים אמיתיים, מספרים, "
        "מגמות. צטט מקורות כשאפשר. אל תמציא מספרים — אם לא מצאת נתון, אמור זאת. "
        "כתוב את הממצאים בעברית, בצורה תמציתית ומסודרת עם נקודות."
    )
    return run_agent(client, system, question, use_web=True, max_tokens=8000)


def ceo_synthesize(client, business_goal, findings):
    """
    המנכ"ל מסכם את כל הממצאים לדוח החלטה עם המלצות קונקרטיות.
    """
    print("\n  המנכ\"ל מסכם את הממצאים לדוח החלטות...")
    combined = "\n\n".join(
        f"### ממצאי מחקר {i + 1}:\n{f}" for i, f in enumerate(findings)
    )
    system = (
        "אתה מנכ\"ל שמכין דוח החלטות לבעלים. על בסיס ממצאי המחקר, כתוב דוח "
        "ברור בעברית הכולל: (1) סיכום השוק והביקוש, (2) ניתוח המתחרים והמחירים, "
        "(3) ההזדמנות הכי מבטיחה עם השקעה נמוכה, (4) המלצה קונקרטית עם צעדים "
        "ראשונים ריאליסטיים, (5) הערכה כנה של סיכונים ולוחות זמנים. "
        "היה כן — אם משהו לא משתלם, אמור זאת."
    )
    user = (
        f"המטרה העסקית המקורית: {business_goal}\n\n"
        f"ממצאי צוות המחקר:\n{combined}\n\n"
        "כתוב את דוח ההחלטות המלא."
    )
    return run_agent(client, system, user, use_web=False, max_tokens=16000)


# ---------------------------------------------------------------------------
# הרצה ראשית
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("  מערכת סוכני AI לחקר השוק האמריקאי")
    print("=" * 60)

    # קבלת המטרה: מארגומנט שורת הפקודה או משאלה אינטראקטיבית
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
    print("שלב 1 — המנכ\"ל מפרק את המטרה למשימות מחקר...")
    tasks = ceo_plan(client, business_goal)

    print(f"\nשלב 2 — צוות החוקרים יוצא לדרך ({len(tasks)} משימות):")
    findings = [researcher(client, q, i + 1, len(tasks)) for i, q in enumerate(tasks)]

    print("\nשלב 3 — הכנת דוח ההחלטות:")
    report = ceo_synthesize(client, business_goal, findings)

    # שמירת הדוח לקובץ
    stamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")
    filename = f"report_{stamp}.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# דוח חקר שוק: {business_goal}\n\n")
        f.write(f"_נוצר ב-{stamp} על ידי מערכת סוכני AI_\n\n")
        f.write(report)

    print("\n" + "=" * 60)
    print(report)
    print("=" * 60)
    print(f"\n[נשמר] הדוח המלא נשמר בקובץ: {filename}")


if __name__ == "__main__":
    main()
