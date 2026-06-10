#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ממשק ווב למערכת סוכני AI
=========================
הפעלה:
    python3 app.py

אחר כך פתח בדפדפן:
    http://localhost:5000
"""

import os
import json
import queue
import threading

try:
    from flask import Flask, render_template, request, Response, stream_with_context, send_file, abort
except ImportError:
    print("חסרה ספריית flask. הרץ קודם:  pip install -r requirements.txt")
    import sys
    sys.exit(1)

import agents

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html", model=agents.MODEL)


@app.route("/run", methods=["POST"])
def run():
    data = request.get_json(force=True) or {}
    business_goal = data.get("goal", "").strip()

    if not business_goal:
        return {"error": "לא הוזנה מטרה עסקית"}, 400

    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {
            "error": (
                "מפתח API לא הוגדר. "
                "הגדר את ANTHROPIC_API_KEY לפני הפעלת השרת."
            )
        }, 400

    result_queue: queue.Queue = queue.Queue()

    def on_progress(step, msg):
        result_queue.put({"type": "progress", "step": step, "msg": msg})

    def worker():
        try:
            result = agents.run_analysis(business_goal, on_progress=on_progress)
            result_queue.put({"type": "done", **result})
        except Exception as exc:
            result_queue.put({"type": "error", "msg": str(exc)})

    threading.Thread(target=worker, daemon=True).start()

    def generate():
        while True:
            item = result_queue.get()
            # docx_filename may be None — replace with empty string for JSON
            if "docx_filename" in item and item["docx_filename"] is None:
                item["docx_filename"] = ""
            yield f"data: {json.dumps(item, ensure_ascii=False)}\n\n"
            if item["type"] in ("done", "error"):
                break

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.route("/download/<path:filename>")
def download(filename):
    # אבטחה: מאפשר הורדה רק של קבצי דוח מהתיקייה הנוכחית
    if not filename.startswith("report_") or ".." in filename:
        abort(404)
    filepath = os.path.join(os.getcwd(), filename)
    if not os.path.exists(filepath):
        abort(404)
    return send_file(filepath, as_attachment=True)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("=" * 60)
    print("  ממשק ווב — מערכת סוכני AI לעסק אונליין")
    print(f"  פתח בדפדפן: http://localhost:{port}")
    print(f"  מודל: {agents.MODEL}")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print()
        print("  ⚠️  אזהרה: מפתח API לא הוגדר!")
        print("  הגדר אותו לפני הפעלה:")
        print("    Mac/Linux: export ANTHROPIC_API_KEY=sk-ant-xxxxx")
        print("    Windows:   set ANTHROPIC_API_KEY=sk-ant-xxxxx")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
