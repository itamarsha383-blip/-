# Driving your tools

You are not limited to text. When the connected tools below are available, use them
to actually *produce* the content — that's what makes this a studio, not a notepad.
Tool schemas may be deferred; find them with ToolSearch (e.g. `select:generate_image`
or a keyword search) before calling. **Always offer** before producing an asset, and
**confirm before any paid or heavy generation** so the user stays in control of cost.

If none of these are connected, the workflow still works end-to-end in text — you
hand the user ready-to-shoot scripts, slide-by-slide carousels, and copy they can
produce themselves. Never block on a tool.

## Higgsfield — images, video, audio, and virality prediction
The production powerhouse. Core tools: `generate_image`, `generate_video`,
`generate_audio`, `generate_3d`. When unsure which model fits, call
`models_explore` with `action:'recommend'` and the user's goal first.
- **Turn a script into a video** — after Phase 4, offer to generate the Reel/Short.
  For made-to-brief videos (narrated explainer, ad, UGC/talking-head), call
  `get_workflow_instructions` (no args) to see the catalog, then again with the
  matching workflow name before building. There's also a **shorts studio** and a
  **marketing studio** for templated social output.
- **Generate the visual** — `generate_image` for a thumbnail, hero shot, or carousel
  art; then `upscale_image` for crisp export, `remove_background` for cutouts,
  `outpaint_image`/`reframe` to fit an aspect ratio.
- **Voiceover** — `generate_audio`, or `create_voice` to build a reusable voice.
- **Virality predictor** — `virality_predictor` scores a draft video for hook
  strength, retention risk, and audience response. Use it as a pre-flight check in
  Phase 5/6 to catch a weak hook *before* the user posts, then revise and re-check.
- If the user has a local photo/clip to use as input, call `media_upload_widget` so
  they can attach it — remote tools can't read chat attachments directly.
- Generation costs credits — check `balance`/`show_plans_and_credits` and confirm
  before large jobs.

## Canva — design carousels, thumbnails, stories, posts
Best for polished, on-brand static design.
- `list-brand-kits` / `search-brand-templates` — start from the user's brand so
  everything stays consistent (fonts, colors, logo).
- `create-design-from-brand-template` or `generate-design` — build the carousel,
  thumbnail, story, or feed post from the slide-by-slide content you wrote in Phase 4.
- `export-design` — hand the user a downloadable file.
- Match the platform's exact size from `platforms.md` (e.g., 1080×1350 for an IG
  carousel, 1080×1920 for a story/Reel cover).

## Supermetrics — performance analytics (the feedback loop)
This closes Phase 7 — real numbers turn guessing into a learning system.
- `data_source_discovery()` to list connected sources (Instagram, TikTok, Facebook
  Ads, Google Analytics, etc.) and their auth status; if a source needs login, share
  the link it returns.
- Follow the discovery flow: `data_source_discovery(ds_id=X)` → `accounts_discovery`
  → `field_discovery` → `data_query` → `get_async_query_results`.
- Pull what actually matters for the goal: reach, watch-through/retention, saves,
  shares, follows, click-through, conversions — not vanity likes.
- **Never fabricate numbers.** Only report values the tools return. Feed the
  best-performing pieces back into `marketing-brief.md` as saved examples so the next
  round is tuned to this specific audience.

## Artifact — a polished plan the user keeps
For a content calendar, a strategy one-pager, or a swipe file, publish a clean
HTML/Markdown Artifact the user can revisit and share. Load the `artifact-design`
skill first to calibrate the design effort.

## A note on cost and consent
Text and analysis are free; image/video generation and paid designs are not. Default
to producing text deliverables, *offer* the richer asset, and only generate after the
user says yes — especially for anything that spends credits.
