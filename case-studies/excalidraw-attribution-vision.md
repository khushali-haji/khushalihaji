# Excalidraw — Export & Attribution Suite: Vision & Changes

**Purpose of this file:** (1) brief for an implementing agent working directly in the Excalidraw repo (Sections 1-9), and (2) source material for a portfolio case study about the project (Section 10, written last, 2026-09-26). Section 10 is the place to start if you are drafting the case study.

**Original purpose:** brief for an implementing agent working directly in the Excalidraw repo. It states the problem, the KPI, the strategic call, and the concrete changes to make. Where a decision has real uncertainty (feasibility, exact copy, exact placement), that's flagged instead of guessed — resolve it against the real codebase, don't assume this doc is final.

---

## 1. Stakeholder & KPI

**Stakeholder:** Head of Marketing.

**KPI: Brand visibility rate** — the percentage of exported or shared Excalidraw drawings that carry visible Excalidraw attribution, out of all exports, tracked across every export format.

**Current state:** there is no instrumentation for this at all. No export event is tracked, no baseline exists, and no per-format breakdown exists. Any target number in this doc (e.g. ">90%") is a reasoned estimate, not a measured baseline — treat instrumentation (Section 4, tracking dashboard) as a prerequisite deliverable, not a nice-to-have.

---

## 2. Strategic Direction

**Decision: capture value from existing usage, don't chase new segments.**

Reasoning:
- Excalidraw already has ~850K MAU and 124K+ GitHub stars, concentrated in developers, with a strong system-design-interview-prep sub-segment. That audience is large, engaged, and already producing shareable artifacts (PRs, READMEs, diagrams) — most of which currently leave the tool with zero attribution.
- Expansion segments researched (education) are structurally blocked, not just under-marketed: Google already steered Jamboard users to FigJam, there's no classroom-management feature set, there's a FERPA/COPPA/SOC 2 procurement wall, and the discovery channels (ISTE, Pinterest, EdTech Index) don't overlap with Excalidraw's dev-heavy channels. Pursuing this now would require capabilities Excalidraw doesn't have and a go-to-market motion it hasn't built.
- Every default, structural, non-opt-in growth loop researched (Loom's watermark, tldraw's OSS+SDK model) outperformed opt-in or campaign-driven tactics (Loom's badge became a "tax" once squeezed to opt-in on paid tiers; draw.io's marketplace model built no brand equity).

**Implication for scope:** prioritize mechanisms that are default and structural (ship attribution automatically, on by default) over anything that depends on a user opting in or a new audience discovering the product.

---

## 3. Key Research Findings (condensed)

**Competitors — who attributes, who doesn't:**
- Attribute by default on free tier (including paywalled removal): Miro, Whimsical, Napkin.ai.
- No export watermark at all: tldraw.com (the "Made with tldraw" mark is an SDK-embedder thing, not tldraw.com itself), FigJam/Figma, draw.io.
- Canva: watermark only when premium elements are used — not a blanket mark.

**Growth mechanics that worked / didn't:**
- Figma: community/UGC-led growth.
- Miro: template-library SEO.
- tldraw: open source + SDK distribution.
- Loom / Calendly: default, non-removable badge loops — the single strongest precedent for this KPI, because the mark was structural, not opted into.
- Loom cautionary tale: once the badge became removable only on paid tiers, it stopped being a growth loop and became a churn/resentment point ("a tax"). **Lesson: keep any Excalidraw attribution mechanism default and low-friction to keep, not something monetized by removal.**
- draw.io: marketplace-led, but built no lasting brand equity — a counterexample to chase reach without brand capture.

**Excalidraw's existing surface to build on:**
- Scene data is already embedded in exports: SVG `<metadata>` and PNG tEXt chunks carry it. A `metadata` param and `EXCALIDRAW_EXPORT_SOURCE` already exist in the export pipeline. Exports also already support configurable `exportPadding`.
- Excalidraw+ already has a QR code for live-collaboration links (presentation/classroom use case). It is **not** on exported static files — it's a different touchpoint from the export-attribution KPI, but cheap to extend with a logo mark since it already exists.
- Excalidraw is local-first: no account, no server sees the drawing. excalidraw.app collects no user data; Excalidraw+ uses SimpleAnalytics and self-hosted Umami. **Any new tracking (exports, survey responses) has to be designed inside this constraint — it's a real architecture gap, not a policy choice to relitigate.**
- `@excalidraw/excalidraw` (the npm package) is embedded in third-party apps (e.g. the Obsidian plugin) with zero attribution flowing back to Excalidraw. This is a distinct leak from the end-user export flows below.

**Export path / attribution placement reality — this is the load-bearing fact for the whole PRD:**

| Touchpoint | Dominant format | Why |
|---|---|---|
| GitHub PRs | PNG, via clipboard paste | GitHub auto-uploads pasted images; almost nobody uses File→Export here |
| READMEs | PNG (scene embedded) and SVG | Both are common; SVG works because GitHub renders it |
| Blog posts | Mostly PNG | WordPress and most blog platforms block/strip SVG by default |
| Native PDF | Weak/third-party | No solid native path — a Chrome extension, CLI tools, or an Inkscape workaround |

**The consequence:** the largest share of real-world exports are copy-paste PNGs and static blog/README images — not something a user routes through a dialog. Any attribution mechanism that only lives in a menu, a dialog, or an opt-in toggle will systematically miss the majority of actual usage. This is why Section 4's edits demote/reframe two items below.

---

## 4. Feature Scope

### P1 — ship this cycle
1. **Default, structural export mark.** A small Excalidraw credit placed in the export **margin/padding**, not overlapping drawn content, on by default, present on PNG and SVG exports produced through *any* path — File→Export, Copy-to-clipboard, and the embedded scene data flows. This is the mechanism that actually reaches PR-pasted PNGs and blog/README images, which the icon/embed-frame approach (below) does not.
2. **Embed frame branding.** When a drawing is embedded (e.g. via Google Slides/Docs/PowerPoint embed, expanded formats), the surrounding embed frame carries Excalidraw branding.
3. **QR code logo.** Add the Excalidraw logo inside the existing Excalidraw+ collaboration-link QR code. Low effort, existing surface, no new infra.
4. **Expanded export formats / aspect ratios.** Add social-aspect-ratio export presets (e.g. Instagram/Pinterest ratios) with a configurable background, so exporting *for* social platforms is a first-class path, not a manual resize.
5. **Attribution opt-out control** (rename from "watermark opt-out" — see Section 6 wording note) — a toggle to disable the export mark, paired with the 30-second exit survey (Section 6). Opt-in-away, not opt-in-to: the mark is on by default; this is the escape hatch.
6. **Export tracking dashboard.** Instrument every export path (File→Export PNG/SVG, clipboard copy, embed generation) as a distinct event, broken out by format. This is the KPI's data source and does not exist today — build this first, since every other feature's success is unmeasurable without it.

### P2 — next cycle / lower priority
1. **File-type icon.** Nice-to-have visual polish on exported file icons; not load-bearing for the KPI.
2. **Downstream-usage tracking.** See Section 7(b) — feasibility is unresolved and likely requires new hosting infrastructure Excalidraw doesn't have (it's local-first with embedded, not server-referenced, scene data). Don't build against this until the open question below is answered.
3. **Metadata-based tracking.** Extend the existing `EXCALIDRAW_EXPORT_SOURCE`/`metadata` embedding for richer analytics, once the core dashboard (P1.6) exists.
4. **Video-casting.** Explicitly next cycle, not this one.

### Mention-only, not scoped this cycle
- Schools/EdTech campaign — blocked structurally (Section 3); don't build for it yet.
- Social campaign / hashtag strategy — a marketing motion, not a product change; out of scope for this agent's work.

---

## 5. Reconciliation Note (read before implementing P1.1–P1.2)

The original brief's "no watermark" constraint should be interpreted as **"never overlaps or alters the drawn content,"** not "no mark at all." The icon (P1 file-type icon, now P2) and embed frame (P1.2) alone do **not** reach copy-paste PNGs or static blog/README exports — those are likely the largest share of total exports (Section 3 table). The margin/padding credit line (P1.1) is what actually closes that gap, using the export pipeline's existing `exportPadding` mechanism. **P1.1 must ship alongside P1.2 for the >90% target to be plausible; shipping P1.2 alone will not move the KPI on the majority of real traffic.**

Also rename any UI/copy currently called "watermark" to **"attribution mark"** — "watermark" implies overlaying/obscuring content, which contradicts the non-destructive placement above and will confuse implementation intent.

---

## 6. Attribution Opt-Out Survey — Spec

Shown once, at the moment someone turns the attribution mark off. Single-select, tap-only, ~15–20 seconds, always dismissible without answering (the setting still applies if they skip).

1. **Why are you turning it off?**
   It clashes with my design or looks unprofessional / Client, employer or school branding rules / I don't want to advertise a tool / It gets in the way of my content / Other

2. **What is this export for?**
   GitHub PR, README or docs / Blog post or article / Slides or presentation / Social media / Client or internal work / Teaching or studying / Other

3. **What would make you keep it on?**
   A smaller or subtler credit / Only on public or shared exports / Being able to add my own name or brand alongside it / Nothing, I'd always turn it off

4. **What best describes you?**
   Developer or engineer / Designer / PM or business role / Student / Teacher / Other

**Implementation notes:**
- Q1→Q3 is the design-feedback loop (turns opt-out reasons into concrete mark variants). Q2 maps directly to the touchpoint table in Section 3 — this is how you'd validate/refute it with real data. Q4 fills the demographics gap the client explicitly flagged (P1.6 dashboard).
- **This is not overall-user demographics** — it's demographics of people who opted out. Don't present Q4 results as if they describe the whole user base; that's a selection-biased sample. The export dashboard (P1.6) is what should carry the actual usage/demographic picture.
- The opt-out **event** itself is the KPI-relevant data point and must be logged whether or not the survey is answered — don't gate KPI tracking on survey completion.
- Must stay inside the local-first/no-account constraint: anonymous, no user ID, one line of copy stating that ("Anonymous, used only to improve attribution"). This needs a response-collection endpoint that doesn't currently exist — flag as a dependency, same as the tracking dashboard.
- Optional, cuttable if scope is tight: a 5th question, "How easy was it to turn off?" (1–5), as a lightweight usability signal on the flow itself — not required for the KPI.

---

## 7. Specific PRD Text Edits

These are literal edits to make in the existing PRD document (not new content — apply as find/replace):

**(a) Section 2c, "Measurable Outcomes" — append after the existing "Note on the target" paragraph's final sentence** (the sentence ending "...worth monitoring closely once real data exists."):

> This target also assumes the margin-credit mechanism (Section 2) ships alongside the icon and embed frame — icon and embed-frame alone would not reach copy-paste or static blog/README exports, which are likely the largest share of total exports.

**(b) Section 2c — Loom citation correction (same paragraph).** The paragraph currently cites "Loom's free-tier watermark... which drove 30% of Loom's organic signups" as the basis for the >90% coverage target. That conflates two different numbers: signup attribution is not coverage. Replace that clause with:

> ...Loom's free-tier watermark appeared on effectively 100% of free-tier exports by default (non-removable without upgrading), which is the coverage precedent we're citing — separately, that mark is credited with driving ~30% of Loom's organic signups, which speaks to downstream impact, not coverage.

**(c) Section 3, Journey 3 — replace this line:**

> [P1] Team can view, where technically possible, how exported drawings are downstream used or applied.

**with:**

> [P2 / feasibility unresolved] Team can view, where technically possible, how exported drawings are downstream used — contingent on the open question below; may not be achievable without new hosting infrastructure.

**(d) Rename throughout:** any heading or copy called "Managing the watermark experience" → **"Managing the attribution mark experience"** (see Section 5 above for why).

---

## 8. Open Questions / Risks (carry into implementation)

- **Downstream-usage tracking feasibility (blocks P2.2 / Journey 3 item above):** what would "downstream usage" tracking concretely look like given Excalidraw's local-first, embedded-scene-data architecture — no server reference to trace back to? Likely needs new hosting infrastructure. Don't build until this is answered; the demoted priority in Section 7(c) reflects that.
- **No baseline exists for the KPI.** The >90% target is a reasoned estimate (Section 7b), not measured. Ship P1.6 (tracking dashboard) first so every other feature has something to be judged against.
- **Survey response storage** and **export event storage** both need a backend decision compatible with the local-first/no-account model — this is infrastructure, not UI, and should be scoped explicitly before P1.1/P1.6 implementation starts.
- **"Figma used hashtags" claim** (from earlier marketing-tactics research) is unverified — our research only confirmed Figma engaging the existing #DesignTwitter tag, not running a hashtag campaign. Don't cite this as fact in any external-facing material without re-verifying.

---

## 9. Implementation Plan (from Figma reference, resolved 2026-09-23)

Source: 4 Figma export screenshots reviewed directly (export dialog default state; survey step 1/4; step 2/4; step 4/4 complete). QR code logo overlay (Section 4 P1.3) has no Figma reference yet — implement per Section 4/8 text spec, revisit if a design lands later.

### 9.1 PR sequencing (decision: PRs 1 below are combined, not split)

Per direct discussion: watermark rendering and the opt-out toggle/survey ship as **one PR**, not two, because the renderer's suppression condition and the survey's completion state are one coupled feature — splitting them would leave a window where the mark is unremovable in production between merges. Formats + aspect ratio (2026-09-25 update: aspect ratio folded into PR2) and the QR logo remain separate, sequential PRs since each is additive and independently revertable. **Pinterest is removed from the current sequence** and moved to future scope (see 9.5).

1. **PR1 — Attribution mark + opt-out toggle + survey** (combined). No dependency.
2. **PR2 — New export formats + aspect ratio selector** (WebP, JPEG, .excalidraw; aspect ratio for PNG + JPEG). Depends on PR1 only in that the mark-rendering path must apply to the new raster formats too. Aspect ratio shares the format pills UI, so shipping them together avoids touching the same block twice.
3. **PR3 — QR code logo overlay** (was PR5). No dependency on PR1–2; unrelated subsystem (`excalidraw-app/share/`). Can ship anytime.
4. **Future scope — Pinterest share** (was PR4). See 9.5.

**Final outcome (2026-09-26):** PR3 (QR logo) was **not** shipped from this branch: a teammate had already built it on another branch (see 9.6 and Section 10.10). It was replaced by a different, smaller PR that closed a gap in PR1: reporting the survey answers as anonymous analytics events (9.8). Three commits are on `export-view`: PR1, PR2, and survey reporting. They are delivered as one branch and one pull request, one commit per unit (see 10.9).

### 9.2 PR1 — Attribution mark + opt-out toggle + survey

**Files in scope** (from codebase exploration):
- `packages/excalidraw/scene/export.ts` — canvas/SVG render pipeline; add mark compositing here (or a small new `scene/exportAttribution.ts` module called from here, to keep this shared/sensitive file's diff minimal).
- `packages/utils/src/export.ts` — public `exportToCanvas`/`exportToBlob`/`exportToSvg` wrappers; must pass the suppression flag through.
- `packages/excalidraw/components/ImageExportDialog.tsx` — toggle + survey card UI; replaces the settings list's format-button section conditionally.
- `packages/excalidraw/components/ImageExportDialog.scss` — survey card, per-question row, progress, collapsed-answer styling.
- `packages/excalidraw/actions/actionExport.tsx` — new action(s) for setting the opt-out/survey-complete state, following the existing pattern of `actionChangeExportBackground` etc.
- `packages/excalidraw/appState.ts` / `types.ts` — new `appState` fields (exact names TBD at build time, e.g. `exportAttributionOptedOut: boolean`, `exportAttributionSurveyAnswers: {...} | null`).
- `packages/excalidraw/locales/en.json` — all new copy (see 9.2.3).

**Copy/wording decision (locked 2026-09-23):** follow the vision doc's Section 5 rename guidance, not the literal Figma placeholder text. Use "attribution mark" / "attribution", never "watermark", in any user-facing string.
- Toggle label: **"Hide attribution mark"** (replaces Figma placeholder "Opt out of attribute" — parallel structure with sibling toggles "Background," "Dark mode," "Embed scene").
- Survey card header: **"A few quick questions to turn off the attribution mark"** (replaces Figma placeholder "Answer these quick questions to keep watermark off").

**9.2.1 Mark rendering**
- Small mark icon + cursive "Made with Excalidraw" text, bottom-right, inside the canvas's export padding — not overlapping drawn content, consistent with both the screenshot and the vision doc's Section 5 reconciliation note.
- ~45% opacity, on by default.
- Applies across every export path that goes through the shared render pipeline: File→Export PNG/SVG, Copy-to-clipboard, and the new WebP/JPEG formats from PR2 (not `.excalidraw`, which is raw scene data, not a rendered image).
- The render call takes a single boolean input (derived from opt-out + survey-complete state) — the renderer itself has no knowledge of toggles or surveys, only "show mark: yes/no."

**9.2.2 Toggle behavior**
- "Opt out of attribution mark" toggle sits below Scale, matching the screenshot position.
- Turning it **on** replaces the entire format-buttons block (format pills, aspect ratio row, Pinterest row, Download/Copy buttons) with the survey card — full replacement, not a collapse-and-reveal-below, per screenshot 2/3.
- Turning it **off** (whether before or after survey completion) restores the format-buttons block and re-enables the mark.
- Turning it off then back on **fully wipes** any previously given survey answers (confirmed decision) — the user answers all 4 from a blank state again, exactly as on first opt-out. No pre-fill.
- The mark is suppressed **only** once all 4 questions are answered — not on toggle-on alone.

**9.2.3 Survey UI**
- Card header: "Answer these quick questions to keep attribution mark off" (wording per 9.2 decision).
- One question visible at a time; progress shown as "1/4", "2/4", etc. in the accent color.
- Previously answered questions collapse to a single line: question text + "✓ done" at the right, with the chosen answer shown below as a quoted/indented line (matches screenshots 3–4 exactly).
- "Other" on any question reveals an inline text field (per original spec; not directly visible in screenshots since no "Other" was selected in the captured flow, but stays as specified).
- Question copy and options: pulled directly from Section 6 of this doc — screenshots confirm Q1, Q2, and Q3's shown answer match Section 6 verbatim, so no separate option text is needed unless you want to change them from what's already written there.
- **Live preview updates immediately** once all 4 are answered (confirmed decision) — the in-dialog canvas preview re-renders without the mark the moment the 4th question is answered, not only at actual export/download time. This means the preview's `exportToCanvas` call (already re-run on every state change per the `useEffect` dependency array in `ImageExportDialog.tsx`) needs the suppression boolean added to its dependencies and its `appState` payload.
- Opt-out **event** must log independently of survey completion (per vision doc Section 6) — instrumentation is P1.6/dashboard scope (separate future PR, backend dependency per Section 8), but the toggle-on action should fire that event regardless of whether the survey is ever finished.

**9.2.4 Tests to include in this PR** (per CONTRIBUTING.md requirement that new features ship with tests)
- Render test: mark present by default on PNG/SVG export output, absent when suppressed.
- State machine test: toggle on → survey required → mark returns on toggle off/on cycle → answers wiped on reset → mark suppressed only after 4/4.
- Manual test plan (for PR description): verify across Chrome/Firefox/Safari per CONTRIBUTING's cross-browser guidance, particularly clipboard export and canvas compositing, which are known to diverge across browsers.

### 9.3 PR2 — New export formats (WebP, JPEG, .excalidraw) + aspect ratio

- Format pill order per screenshot: PNG, SVG, WebP, JPEG, .excalidraw.
- Extend `EXPORT_IMAGE_TYPES` (`packages/common/src/constants.ts`) and the switch in `App.onExportImage` (`App.tsx`).
- `.excalidraw` format: **Copy to clipboard stays visible but disabled/greyed out** when `.excalidraw` is the selected pill (confirmed decision — layout doesn't shift between formats).
- Attribution mark (PR1) must apply to WebP and JPEG raster output the same as PNG; does not apply to `.excalidraw` (raw JSON scene data, not a rendered image).

### 9.4 PR2 (continued) — Aspect ratio selector

Built in the same PR as the formats (implementation notes at the end of this section).

- Row appears **only** when PNG or JPEG is the selected format pill (confirmed by spec; screenshot shows it under PNG — behavior for JPEG assumed identical, not separately screenshotted).
- Hidden for SVG, WebP, `.excalidraw`.
- Options: Original, 1:1, 4:5, 3:4, 2:3 — selecting one changes export canvas dimensions accordingly (per original spec).
- Lives in `ImageExportDialog.tsx`. Built as pills (per Figma) using a small shared `ExportPills` helper that the format pills also use, rather than `RadioGroup`.
- **Sizing rule (as built):** the canvas is *grown* to the requested width/height ratio around the padded content, never cropped, and the content is centered (`aspectRatio` option on `exportToCanvas`, `scene/export.ts`). Ratios are width:height, so 4:5, 3:4 and 2:3 are portrait. Background fills the whole grown canvas; the attribution mark stays bottom-right of the final canvas.
- Applies to the live preview, downloads and clipboard copy when PNG or JPEG is selected; ignored for other formats.
- Dialog height was tuned to 460px (`--ImageExportModal-height`) so the default view fits without a scrollbar.

### 9.5 Future scope — Pinterest share (removed from PR sequence 2026-09-25)

Not being built now. Design reference kept for later: bordered row below the aspect ratio row, same PNG/JPEG-only visibility, "Share straight to Pinterest" label left, red "Pin it" button (Pinterest mark) right.

**Strategy notes / open questions before building:**
- **Feasibility gap:** Pinterest's pin-create flow takes a *publicly reachable* image URL (`media` param). Excalidraw is local-first with no image hosting, so a locally generated PNG/JPEG cannot be handed to Pinterest directly. This is the same missing-infrastructure problem as downstream-usage tracking (Section 8).
- **Options to evaluate:** (a) download the image, then open Pinterest's upload page with a short instruction (no infra, weaker "share straight to" promise); (b) host exported images somewhere (new infra, privacy and cost implications, conflicts with the no-account/local-first stance); (c) share a link to the scene instead of an image (lowest friction, but Pinterest would show the page, not the drawing).
- **KPI fit:** a hosted image could carry the attribution mark and give a real downstream-usage signal, which links this to the deferred downstream-tracking question. Decide the hosting question once, for both.
- **Depends on:** the aspect ratio selector (shipped in PR2) so pins can use Pinterest-friendly ratios such as 2:3.
- **Revisit when:** hosting/backend direction for survey responses and export events (Section 8) is decided.

### 9.6 PR3 — QR code logo overlay (was PR5)

Figma reference now available (Share dialog, Live Collaboration panel): purple crossed-pencils mark centered over the QR code on a small white square backdrop (breaks the modules directly underneath it — confirms high ECC level is required so the code still scans).

- **Asset: no new file needed.** The mark is already in the codebase as `LogoIcon` in `packages/excalidraw/components/ExcalidrawLogo.tsx` — a `currentColor` inline SVG (viewBox `0 0 40 40`), colored via the existing `--color-logo-icon` CSS variable (already the same purple shown in the screenshot). Reuse this component/path rather than adding a static image asset. Same mark can back the PR1 export-watermark icon (9.2.1) for visual consistency, so both features draw from one source instead of two separate assets.
- Touches `excalidraw-app/share/QRCode.tsx` and `excalidraw-app/share/qrcode.chunk.ts`. `QRCode.tsx` already imports cross-package from `@excalidraw/excalidraw/components/...` (does this today for `Spinner`), so importing `LogoIcon` the same way is consistent with the existing pattern.
- `qrcode.chunk.ts` currently calls `renderSVG(text)` from the `uqr` library with no options. Needs the high error-correction option, e.g. `renderSVG(text, { ecc: "H" })` — confirm exact `uqr` API at build time.
- Implementation approach: render the QR as today, then overlay a small white square + the `LogoIcon` SVG centered on top (matching the screenshot's white backdrop behind the mark), either as a second absolutely-positioned SVG/element over `QRCode.tsx`'s container, or injected directly into the generated SVG markup returned by `generateQRCodeSVG`. Exact approach (CSS overlay vs. SVG-string injection) to be decided at build time — either satisfies the visual.
- Since ECC "H" tolerates up to ~30% obstruction, keep the overlay square small relative to the code's total size (screenshot shows it covering roughly the center ~15-20% of the code) to stay safely within scannable tolerance.

**Status (2026-09-26): SUPERSEDED, not shipped from this branch.** A prototype was built here (CSS overlay reusing the exported `ExcalidrawLogo`, `ecc: "H"`, scan-checked with jsQR at 150/300/600px). It was then found that Bo Moldenhauer had already implemented the QR logo on `origin/Export-Brand-Visibility-Integration` (commit `e3bf2677`, 2026-09-23: level `H` + centered logo badge, SVG injection, shared logo path in `packages/common/src/brand.ts`). To avoid two competing implementations the local prototype was first **stashed** (`git stash`) rather than deleted, then dropped once confirmed unneeded; the teammate's version is the one that will land. See Section 10.10 for the coordination lesson.

### 9.7 Open items still to confirm before/during build

- Exact `appState`/storage field names for the opt-out state and its expiry timestamp — not yet decided, small implementation detail.

**Resolved 2026-09-23 — persistence: time-boxed, 30 days.** Deliberate KPI-vs-friction trade-off (discussed directly, not a default): a completed opt-out (mark hidden) holds for **30 days from survey completion**, stored in localStorage alongside a completion timestamp, then automatically lapses — the mark returns and the toggle reverts to off, requiring the survey to be redone to hide it again. This is a middle ground between full persistence (respects the choice indefinitely, but permanently loses that user's visibility) and full per-session reset (maximizes visibility but risks reading as a dark pattern if a user notices the mark keeps coming back). Chosen specifically to recover visibility from lapsed/inactive opt-outs over time without nagging on every single session.
- This 30-day auto-expiry is **independent of** the manual reset behavior in 9.2.2 (toggling off then back on immediately wipes answers and requires a fresh survey) — both paths lead to the same end state (mark on, survey required again), just triggered differently: one by elapsed time, one by explicit user action.
- Implementation note: check the stored timestamp against `Date.now()` on dialog open (or app load); if expired, clear the opt-out state the same way the manual toggle-reset does, so both paths share one "reset opt-out state" function rather than duplicating the wipe logic.

**Resolved 2026-09-23:** Q1–Q4 options confirmed verbatim, all four questions single-select with an "Other" free-text field:

1. **Why are you turning it off?** It clashes with my design or looks unprofessional / Client, employer, or school branding rules / I don't want to advertise a tool / It gets in the way of my content / Other (free text)
2. **What is this export for?** GitHub PR, README or docs / Blog post or article / Slides or presentation / Social media / Client or internal work / Teaching or studying / Other (free text)
3. **What would make you keep it on?** A smaller or subtler credit / Only on public or shared exports / Being able to add my own name or brand alongside it / Nothing, I'd always turn it off — **no "Other" field on this question** (matches Section 6 and the screenshot, which showed no inline text field affordance for Q3)
4. **What best describes you?** Developer or engineer / Designer / PM or business role / Student / Teacher / Other (free text)

These are identical to Section 6, so Section 6 remains the single source of truth for survey copy — no separate strings file needed for question/option text.

### 9.8 Survey answer reporting (added 2026-09-26)

Gap found after PR1: the survey collected 4 answers and then discarded them; only the "opt-out toggled" event was tracked, so the survey produced no usable data.

- On survey completion, `trackAttributionSurveyAnswers` sends one anonymous event per question through the existing `trackEvent` (SimpleAnalytics): `attribution-survey-reason`, `-purpose`, `-keepOn`, `-role`, each labelled with the chosen option id (e.g. `design`, `blog`).
- Free text typed under "Other" is **never sent**, only that "other" was chosen (free text can contain personal data).
- Nothing is sent for half-finished surveys; the toggle event is unchanged. No account or user id involved, so the local-first, no-account constraint holds.
- Only sends on the production site with tracking enabled (existing `trackEvent` behavior); cannot be observed on localhost, so it is covered by unit tests (3 tests) instead.
- **Dashboard finding:** the teammate's analytics dashboard (`feature/export-analytics-dashboard`, `public/analytics.html`) uses a seeded random generator for all numbers ("Mock data") and reads no real source, so it cannot display these events yet. Handoff: give the dashboard owner the four event names above so it can be pointed at real SimpleAnalytics data.
- Commit: `fe39762d`. Files: `AttributionMarkSurvey.tsx`, `ImageExportDialog.tsx` (2 lines), `AttributionMarkSurvey.test.tsx`.

---

## 10. Case Study Source Material (for the portfolio)

### 10.0 How to use this section

- **Audience:** the portfolio owner, and an AI assistant in a separate session that will draft the case study from this file. Sections 1-9 are the raw product brief and build plan; this section is the narrative layer on top.
- **Reliability:** facts here were checked against the git history and the working sessions on 2026-09-23 to 2026-09-26. Anything not verified is tagged **[UNVERIFIED]** or **[DECISION NEEDED]**. Section 10.17 lists what must not be claimed.
- **Voice:** written in third person about "the project" so it can be re-voiced. The portfolio owner made the product decisions; an AI coding assistant (Claude Code) was used as an implementation pair (see 10.17 on how to frame that).
- **Naming:** "PR1", "PR2" and "survey reporting" are the labels of the three planned units of work. They were delivered as **three commits on one branch (`export-view`) in a single pull request**, which is normal practice for closely related changes. Wherever this section says "unit", it means one of those commits.
- **Screenshots** are not stored in this file. Section 10.15 lists which ones to capture or re-export.

### 10.1 Elevator pitch and headline options

**Pitch (3 sentences):** Excalidraw has about 850K monthly users, and almost every drawing they export leaves the tool with no trace of where it came from. I designed and built a default-on "Made with Excalidraw" credit for exported images, an opt-out that asks four short questions before the credit can be removed, and a richer export dialog, all inside a local-first product that cannot use accounts or servers. The work was delivered as three small, dependency-ordered commits in one reviewable pull request on a shared GitHub repo, alongside three other contributors.

**Headline options:**
1. "Turning every export into a brand touchpoint, without a watermark on the drawing"
2. "Designing an attribution feature people can turn off, and learning why they do"
3. "From marketing KPI to merged code: an export attribution suite for Excalidraw"

### 10.2 Project snapshot

| Field | Detail |
|---|---|
| Product | Excalidraw (open-source, local-first browser whiteboard), worked in a team fork (`excalidrawCycle2`) |
| Stakeholder / brief | Head of Marketing; KPI = brand visibility rate (Section 1) |
| Role | Product designer and implementer for the export attribution suite (PR1, PR2, survey reporting) |
| Team | 4 contributors on one GitHub repo: the portfolio owner, Bo Moldenhauer, richardtheard-dotcom, Vince (repo owner). **[DECISION NEEDED]** confirm each person is happy to be named; otherwise say "three teammates". |
| Timeline | Brief and Figma reference 2026-09-23; three commits authored 2026-09-26 |
| Stack | React, TypeScript, SCSS, Vite, Vitest, ESLint/Prettier, Yarn workspaces monorepo |
| Tools | Figma (prototype), GitHub, VS Code, localhost dev server, Claude Code |
| Deliverables | 3 commits on branch `export-view`; a written product brief and build plan (this file) |
| Size | 18 files changed, +1,632 / -66 lines vs. the base commit; 7 new source/test files; 28 new automated tests |

### 10.3 The problem

- **Business problem:** Excalidraw drawings spread through GitHub PRs, READMEs, blog posts and slides, but leave the product with zero attribution, so the product gets no brand credit from its own most-shared artifact.
- **KPI:** brand visibility rate = share of exports that carry visible Excalidraw attribution. **There was no baseline at all** (no export event was tracked), so the >90% target in the brief is an estimate, not a measurement. Making the KPI measurable was itself a requirement.
- **Constraint that shaped everything:** Excalidraw is local-first. No accounts, no server sees the drawing. Any tracking or feedback collection has to be anonymous and lightweight. This ruled out account-based ideas immediately.
- **Where exports actually go (research, Section 3):** most exports are copy-pasted PNGs into GitHub PRs and blog posts, not files saved through a menu. Any attribution that lives only in a dialog or an opt-in toggle would miss most real usage.

### 10.4 Strategy: capture value, don't chase new segments

Decision (Section 2): grow attribution from the existing developer base rather than pursue new audiences.

- **Evidence for:** large engaged base already producing shareable artifacts; default, structural mechanisms (Loom's badge, tldraw's SDK model) outperformed opt-in or campaign tactics in the research.
- **Evidence against the alternative:** the education segment was structurally blocked (procurement and privacy requirements, different discovery channels, no classroom features), so it was explicitly not pursued.
- **Cautionary precedent used as a design constraint:** Loom's badge became a resented "tax" once removal was tied to paid tiers. So the mark is on by default, but removal is free and low friction, not monetized.

### 10.5 Prioritization and scope decisions

**Original P1 list and what happened to each item:**

| P1 item | Outcome | Who / where |
|---|---|---|
| Default export mark in the margin | Built | PR1 (this branch) |
| Opt-out control + 30-second survey | Built | PR1 (this branch) |
| Expanded formats / social aspect ratios | Built (WebP, JPEG, .excalidraw; ratios 1:1, 4:5, 3:4, 2:3) | PR2 (this branch) |
| Embed frame branding | Already merged to master before this work | Vince, live-embed example |
| QR code logo | Built by a teammate; my duplicate was set aside | Bo, `Export-Brand-Visibility-Integration` |
| Export tracking dashboard | In progress by a teammate; currently mock data | richardtheard-dotcom, `feature/export-analytics-dashboard` |
| (Gap found later) survey answers reported | Built | commit `fe39762d` |

**Things deliberately cut or deferred, with reasons:**
- **Pinterest "share straight to Pinterest" (planned PR4, deferred 2026-09-25).** It was designed in Figma and initially scheduled. It was pulled because Pinterest's pin flow needs a publicly reachable image URL and Excalidraw has no image hosting (local-first), so it could not be built honestly with the current architecture, and it would have needed new infrastructure and privacy decisions. It was *not* silently dropped: it moved to a "Future scope" section (9.5) with three options (download then manual upload, hosted images, share a scene link instead), a KPI note (a hosted image could carry the mark and give a downstream-usage signal), a dependency (aspect ratios, now shipped), and a revisit trigger (when the hosting/backend direction for tracking is decided). This is a good example of scope management: cut, document the reasoning, keep the option alive.
- **Downstream-usage tracking:** blocked by the same missing-hosting problem; labelled feasibility-unresolved (Section 7c, 8).
- **Video casting, education campaign, hashtag campaign:** out of scope for this cycle (Section 4).
- **Aspect ratio folded into PR2** (originally its own PR3): it shares the same UI block as the format pills, so shipping them together avoided rewriting the same code twice. Decision made by the portfolio owner on 2026-09-25.
- **QR logo dropped from this branch** once a teammate's implementation was found (10.10).

### 10.6 Product design decisions (decision log)

| # | Decision | Alternatives considered | Why this one | Trade-off accepted |
|---|---|---|---|---|
| 1 | Mark placed in a reserved export margin, never on top of the drawing | Overlay directly on the canvas | Brief requires "never overlaps or alters drawn content"; a margin guarantees it | Exports get extra whitespace when the mark is shown |
| 2 | Mark on by default | Opt-in | Default, structural mechanisms won in research | Some users will dislike it |
| 3 | Rename "watermark" to "attribution mark" in all UI copy, even though the Figma placeholder said "watermark" | Follow Figma text literally | "Watermark" implies covering the content, which contradicts decision 1 | Deviated from the prototype's literal copy; documented |
| 4 | Toggle labelled "Hide attribution mark" | "Opt out of attribute" (Figma placeholder) | Parallel to sibling toggles ("Dark mode", "Embed scene"), unambiguous about what ON does | none |
| 5 | Removal is free but gated by a 4-question survey; mark only hides after all 4 are answered | Paid removal (Loom model); no gate | Loom lesson: don't monetize removal. The survey turns opt-outs into design feedback | Adds friction to opting out |
| 6 | Survey shows one question at a time, answered ones collapse with a "done" tick, progress "n/4" | All questions at once | Lower perceived effort (~15-20s target), matches Figma | More UI state to build and test |
| 7 | Live preview updates the moment the 4th answer is given | Only change the real export | Immediate feedback that the mark is really gone | Preview must re-render on state change |
| 8 | Toggling off then on fully wipes survey answers | Keep answers pre-filled | Consistent, simple rule; every opt-out is a fresh, deliberate act | Repeat opt-outs re-answer |
| 9 | **Opt-out persists 30 days, then lapses** | Forever; every session; every export | Genuine KPI-vs-user-respect tension: forever loses those users' visibility permanently; per-session nagging repeats the Loom "tax" resentment. 30 days is a middle path. The owner chose it after the trade-off was laid out | Some visibility recovered by lapse, some friction returns monthly |
| 10 | Requiring the survey on every export was rejected | Per-export survey | Same person answering 20 times = 1 data point, inflated counts, hostile UX | none |
| 11 | Survey answers reported as anonymous analytics events; "Other" free text never sent | Send free text; build a new backend | Fits local-first (no accounts, existing tool); free text can hold personal data | Only categorical data, no verbatims |
| 12 | Anonymous, no user id, one line of copy promising it | n/a | Local-first constraint | Cannot link answers to behavior |
| 13 | `.excalidraw` disables (does not hide) "Copy to clipboard" | Hide it | Layout does not jump between formats | A disabled button needs to be understood |
| 14 | JPEG always exports with a background, preview matches | Let it come out black | JPEG has no transparency | Background toggle is overridden for JPEG |
| 15 | Aspect ratio grows the canvas around the drawing and centers it, never crops | Crop to the ratio | Cropping could cut a user's content | Extra background around the drawing |
| 16 | Aspect ratio only for PNG and JPEG | All raster formats | Matches the spec/Figma | WebP users cannot pick a ratio |
| 17 | Structured the work as three dependency-ordered atomic commits on one branch (one PR); kept the mark and its opt-out together in the first commit | One PR per unit (stacked); one giant commit; mark and opt-out split apart | The mark, opt-out and survey are one coupled feature and a permanent, unremovable mark must not ship without its escape hatch. Each commit is a working, tested state that can be reviewed or reverted alone | One PR is bigger to review at once (mitigated by reviewing commit by commit); first commit is large (1,181 added lines incl. tests) |
| 18 | Kept the local plan file out of git (`.gitignore`) and out of the PR commit | Commit the planning doc | Planning notes are not product code; keeps PR diffs focused | none |

### 10.7 Design-to-build workflow

1. **Brief first:** the vision document (Sections 1-8) fixed the KPI, constraints, scope and open questions before any code.
2. **Guidance before building:** best practices for surgical edits, commit structure and commit style were agreed first (read from the repo's CONTRIBUTING guide: semantic commit/PR titles, tests required, manual cross-browser testing).
3. **Figma reference reviewed:** four export-dialog frames plus a QR frame were read closely. Copy in the frames was checked against the brief; differences were surfaced as questions, not silently followed.
4. **Clarifying questions asked, answers recorded (2026-09-23):** (a) UI wording: follow the brief's "attribution mark" rename over Figma's "watermark"; (b) preview updates live once the survey is complete; (c) survey answers fully wiped when the toggle is reset; (d) `.excalidraw` clipboard button disabled rather than hidden. Later: persistence window (30 days) and survey option text confirmed verbatim against the brief.
5. **Written plan in the repo folder** (Section 9) mapping each unit of work to files, before touching code.
6. **Build in dependency order, verify, then review on localhost.** After each unit the dev server was started so the owner could review visually before committing.
7. **Hands-on QA by the owner drove real fixes** (list below).

**QA findings raised by the owner while testing on localhost, and the outcome:**
- Attribution mark rendered in the middle of the image and too small, not bottom-right: real bug, fixed (10.8 #2).
- Mark got cropped on small or zoomed-in exports: real bug, fixed (10.8 #3).
- Preview scrolled away when the survey grew the dialog: fixed twice (first sticky, then independent scrolling; 10.8 #4).
- Scale options showed no visible change in the preview: **not a bug** (Scale changes output resolution, not appearance); explained and how to verify given.
- Transparent margin around the preview: traced to the existing preview letterboxing CSS, not the exported image; owner asked to check the downloaded file to be sure.
- Big empty gap above the format pills after PR2: caused by the taller dialog set for the final design; height tuned to fit the content.
- Dialog stretched too wide after aspect ratios were added: layout fixed by giving the settings column a fixed 45% width.

### 10.8 Engineering quality and debugging stories

Working principles: surgical diffs (only files the feature needs; new logic in new small files instead of growing shared ones), tests for new behavior as CONTRIBUTING requires, typecheck + lint + tests after every change, and reporting exactly which files were touched.

Bugs found and fixed (each is a usable "problem, cause, fix" mini-story):

1. **Survey hint on the wrong question.** The "(pick one, fill if other)" hint showed on answered questions instead of the active one. Found in self-review before the owner saw it, fixed, and pinned with tests.
2. **Mark drawn in the wrong place and too small (canvas double-scaling).** Root cause: the app's renderer sets a scale on the canvas context and never resets it, and the new mark code applied the scale a second time, so it was squared. Fix: draw in the already-scaled context.
3. **Mark cropped on small exports.** Root cause: the margin reserved for the mark was a guessed 40 units, but the mark itself needs about 200. Fix: compute the margin from the mark's own size, plus a safety clamp so it can never be positioned off-canvas. Regression test uses a 10x10 element and failed against the old code.
4. **Preview scrolling with the survey.** The dialog's real scroll container was an ancestor holding both columns. Fix: give the settings column its own bounded, independently scrolling box (and stop a flex-wrap rule from splitting content into two columns).
5. **Settings column squeezing the preview.** The new wide pills/buttons rows inflated the column's content width. Fix: fixed 45% column width.
6. **A type that hid errors.** `Omit<ExportType, "backend">` on a string union does not narrow types; replaced with `Exclude`, which made the new export branches type-safe.
7. **Testing limits stated honestly:** the test environment cannot rasterize canvases, so pixel-position bugs cannot be caught by unit tests. Position was verified visually by the owner, and SVG output (which is inspectable) was used for automated position checks.

Quality checks at the end of the work: typecheck clean across the monorepo, lint clean on every touched file, 74 tests passing in the related suites (28 new), no existing test broken.

### 10.9 GitHub and version-control workflow

**Glossary (for readers new to GitHub):** *repository* = the project folder tracked by git; *branch* = a separate copy of the code to work on without affecting others; *commit* = a saved snapshot with a message; *pull request (PR)* = a proposal to merge a branch into another, reviewed by teammates; *stash* = shelving uncommitted work without deleting it; *merge conflict* = two people changed the same lines; *dry-run merge* = checking whether two branches would merge cleanly without merging them.

**What was done and why:**
- **Followed the repo's own contribution rules** (read from the official contributing docs): semantic commit/PR titles (`feat(editor): ...`), tests included with features, and a manual test plan.
- **Sequenced the work into units by dependency**, not by feature list: unit 1 (mark + opt-out + survey) first because everything else reads from it; unit 2 (formats + aspect ratio) next; unit 3 (survey reporting) last. Independent items (QR, Pinterest) were kept out of this branch so each could ship or be dropped on its own.
- **One atomic commit per unit, each a working state.** Every commit was typechecked, linted and tested when it was made, so any single commit can be reviewed alone, checked out, or undone with `git revert <hash>` without breaking the others. The history reads as a story: mark and opt-out, then export formats, then reporting.
- **Kept two tightly coupled features in the same commit** (mark rendering and its opt-out) so an unremovable mark could never exist in the history without its escape hatch. The alternative (release-order discipline or a feature flag) was considered and documented.
- **Commit hygiene:** one commit per unit with a title of the form `type(scope): summary` and a bulleted body explaining what and why; an attribution trailer on commits made with the AI pair; an unrelated local change (`.gitignore`) deliberately left out of the feature commits by staging files individually.
- **Branch handling and a recovered mistake:** the first request named the branch `export-view`, but work began on `master` by mistake. Because nothing had been committed, the recovery was safe: fetch the remote branch, create a local branch tracking it (`git checkout -b export-view origin/export-view`), which carried the uncommitted changes across with no conflicts. Lesson: confirm the branch before the first edit.
- **Checked the base branch first:** `export-view` was found to be 5 commits behind `master` (an earlier live-embed feature). Confirmed none of the changed files overlapped before building on it.
- **Checked for collisions with teammates before pushing:** ran dry-run merges (`git merge-tree`) of `export-view` against `master`, Bo's branch and Richard's branch. All three came back conflict-free.
- **Set aside duplicate work without destroying it** using `git stash` (path-limited, with a descriptive message).
- **Delivery choice (2026-09-26): one branch, three commits, one pull request.** For closely related work by one author this is standard practice: reviewers get the full context in one place, and can still read it one commit at a time using the PR's Commits tab. A stacked alternative (one branch per unit, each PR targeting the previous one) was prepared and checked (each PR showed exactly its own commit and diff), then deliberately not used, because the commits had already been pushed together and a single PR was the simpler review. The tradeoff to state plainly: a reviewer sees ~1,600 changed lines at once instead of three smaller diffs.
- **Why the commit split still matters:** it is what makes either delivery style possible. Because the units are clean commits, splitting into three PRs later is a mechanical step (a branch per commit), not a rewrite.

**Commits on `export-view` (base: `2b9da961`):**

| Commit | Title | Size |
|---|---|---|
| `975437f5` | feat(editor): add export attribution mark with opt-out survey | 14 files, +1,181 / -46 |
| `6daa34ff` | feat(editor): add WebP, JPEG, .excalidraw export and aspect ratios | 12 files, +404 / -37 |
| `fe39762d` | feat(editor): report attribution survey answers as anonymous events | 3 files, +64 |

### 10.10 Teamwork and coordination

**Who built what (from git history, verified):**

| Person | Branch | Work |
|---|---|---|
| Portfolio owner | `export-view` | Export mark, opt-out toggle + survey, formats, aspect ratios, survey reporting |
| Bo Moldenhauer | `Export-Brand-Visibility-Integration` (2 commits, 2026-09-23) | Branded export filenames, QR code logo, file-type icon metadata and PWA/favicon branding |
| richardtheard-dotcom | `feature/export-analytics-dashboard` (2 commits, 2026-09-24) | Export analytics dashboard integrated into the app menu |
| Vince (repo owner) | `LiveEmbedded-Feature` merged to `master` (PR #2), plus deployment config | Live-sync embed with attribution (embed frame branding), Vercel configuration |

**The QR duplication incident (a real teamwork lesson):**
- A QR-logo PR was built and passed its own checks (level-H error correction, centered logo, a scan test that decoded correctly at three sizes).
- Only afterwards, when the owner mentioned a teammate might have done it, was the remote checked (`git fetch`, branch list, `git log --grep`). Bo had built the same feature three days earlier with the same technical approach.
- Response: stop, verify, stash the duplicate rather than delete it, tell the owner exactly what overlapped, and re-plan the next unit of work around the real gaps.
- **What to do differently (process lesson to state in the case study):** fetch and read teammates' branches before starting each item, and claim work publicly (an issue or board card) so overlaps are visible early. This was also the reason for the dry-run merge check afterwards.

**Cross-team integration findings:**
- Dry-run merges: no conflicts with any teammate branch or master.
- The analytics dashboard was found to run entirely on generated mock data with no connection to real events. Handoff: the four survey event names (9.8) go to the dashboard owner so it can be connected to real data.
- Shared files were touched by more than one person (`App.tsx`, `data/index.ts`, `constants.ts`), which is the main future conflict risk when branches are merged one after another.

### 10.11 Outcomes

**Delivered (three commits, pushed to `origin/export-view`, verified 2026-09-26; **[UNVERIFIED]** whether the pull request has been opened, reviewed or merged since):**
- Default "Made with Excalidraw" credit (logo + handwritten text, ~45% opacity, bottom-right of the export margin) on PNG, JPEG, WebP and SVG exports and the clipboard copy, and in the live preview.
- "Hide attribution mark" toggle with a 4-question survey; mark only hides after all questions are answered; 30-day persistence.
- Export dialog redesigned to format pills plus one Download button: PNG, SVG, WebP, JPEG, .excalidraw; clipboard disabled for `.excalidraw`.
- Aspect ratio selector (Original, 1:1, 4:5, 3:4, 2:3) for PNG and JPEG.
- Anonymous survey reporting through the existing analytics tool.

**Numbers:** 3 commits, 18 files, +1,632 / -66 lines, 7 new files, 28 new tests, 0 existing tests broken, 4 real defects found and fixed in QA/self-review (plus 2 layout issues).

**Business outcome:** none measurable yet. The KPI has no baseline and the dashboard shows mock data. The honest claim is that the *instrumentation and the feature* exist; the *impact* is unmeasured.

### 10.12 Limitations and open items (say these openly)

- Not manually tested across Chrome, Firefox and Safari (the repo's guide asks for it). The mark uses canvas features that can vary by browser. **[UNVERIFIED]**
- Dark-mode appearance of the mark was chosen (light text on dark) but not visually reviewed by the owner.
- The survey events only send on the production site with tracking on, so they could not be observed end to end locally.
- The dashboard cannot show real data yet.
- The `.excalidraw` export uses the file-save dialog only where the browser supports it; other browsers download directly (existing behavior of the shared file-save helper).
- Pinterest, metadata-based tracking, downstream-usage tracking are open.

### 10.13 Reflections / what to do differently

1. Check teammates' branches before starting each item (the QR duplication cost a full build cycle).
2. Confirm the working branch before the first edit (the `master` start was recoverable only because nothing was committed).
3. Set up manual cross-browser testing earlier; unit tests cannot cover pixel-level canvas rendering.
4. Agree the measurement plan with the dashboard owner at the start so the events and the dashboard are designed together, not connected afterwards.
5. Ship the KPI baseline first (the brief itself said instrumentation was a prerequisite); the feature was built before there was anything to measure it against.
6. What worked well: writing the plan and decision log before coding, surfacing trade-offs to the owner as explicit choices (e.g. 30-day persistence), and treating scope cuts as documented decisions.

### 10.14 Skills demonstrated (with evidence to point at)

| Skill | Evidence |
|---|---|
| Product strategy and prioritization | Capture-vs-expand decision with cited research (10.4); P1/P2 triage and cuts (10.5) |
| Scope management | Pinterest deferral with options and revisit trigger (9.5); aspect ratio folded into PR2 |
| Product design and UX judgment | Decision log (10.6); one-question-at-a-time survey; opt-out that asks rather than blocks |
| Ethical/dark-pattern awareness | Rejected per-export surveys; 30-day persistence debate; free text never collected (10.6 #9-#12) |
| Working from a Figma prototype | Frame-by-frame reading, copy conflicts raised as questions (10.7) |
| Cross-functional thinking | KPI to feature mapping; marketing goal vs local-first engineering constraint |
| QA and user testing | Hands-on localhost review finding concrete defects (10.7) |
| Debugging | Root-cause stories (10.8) |
| Front-end engineering | React state machine (toggle, survey, expiry), canvas/SVG rendering, SCSS layout |
| Testing discipline | 28 new tests incl. a regression test that fails on the old bug |
| GitHub / version control | Branch handling, atomic commit structure and conventions, dependency ordering, dry-run merges, stash (10.9) |
| Collaboration | Team ownership map, overlap incident and lesson, dashboard handoff (10.10) |
| Honest reporting | Verified vs unverified labelling throughout (10.11, 10.12, 10.17) |

### 10.15 Portfolio assets to capture

**Screenshots (re-take from localhost if not saved):**
1. The four Figma export-dialog frames (default, survey step 1/4, 2/4, complete) and the QR frame, shown next to the built UI for a design-vs-built comparison.
2. Export dialog default state, with the mark visible in the preview (zoom on the bottom-right corner).
3. The survey mid-flow and complete, and the format pills with each aspect ratio.
4. Before/after of an exported image with and without the mark, including a small tightly-cropped export (the bug case).
5. `git log --oneline --graph` showing `export-view` and the teammate branches.
6. The pull request page (once opened): title, description, checks.
7. Terminal test run showing the passing suites.

**Diagrams to draw:** (a) commit dependency chain: unit 1 -> unit 2 -> unit 3 on one branch, with QR and Pinterest shown as separate/deferred; (b) prioritization matrix (impact on KPI vs. feasibility under local-first), with Pinterest and downstream tracking in the "blocked" corner; (c) how an export flows through the code to get the mark (dialog, App, export function, canvas/SVG).

### 10.16 Suggested case study outline

1. **Hero:** headline, one-line pitch, role, timeline, team size, stack (10.1, 10.2).
2. **The problem:** exports leave with no attribution; KPI with no baseline; the local-first constraint (10.3).
3. **Strategy:** capture vs expand, and the Loom lesson (10.4).
4. **Prioritization:** P1 table and what was cut and why, with Pinterest as the featured example (10.5).
5. **Design decisions:** pick 4-5 from the log; give the 30-day persistence and "survey instead of paywall" the most space (10.6).
6. **From Figma to code:** the questions asked and the QA loop (10.7).
7. **Engineering and debugging:** two or three bug stories with a before/after image (10.8).
8. **Working in GitHub with a team:** atomic commit structure, one branch and one PR, conventions, the branch recovery, dry-run merges (10.9).
9. **Teamwork:** ownership map and the QR overlap lesson (10.10).
10. **Results and honesty:** delivered items, numbers, what is unmeasured (10.11, 10.12).
11. **Reflections:** what you would do differently (10.13).

Target length 1,200-1,800 words for the page, with the log and tables as expandable or linked detail.

**Prompt to use in the other session:** "Using the attached file's Section 10 as the source of truth, draft a portfolio case study following the outline in 10.16. Use only facts from the file; keep the [UNVERIFIED] items out or clearly caveated; write in first person for the portfolio owner; keep the tone practical, not promotional."

### 10.17 Do not claim / framing caveats

- **Do not** say the feature is merged, deployed, or live unless that has since happened. It is pushed to the branch `export-view` on GitHub as three commits; describe it as a single pull request with three commits, and only say it was reviewed or merged if that has happened.
- **Do not** cite any measured impact on the KPI. There is none.
- **Do not** claim cross-browser testing or that the dashboard shows real data.
- **Do not** say the whole plan was built by one person. The QR logo, icon/filename branding, analytics dashboard, and live embed belong to teammates.
- **Do not** present the >90% coverage target as measured (it is a reasoned estimate) or cite the "Figma used hashtags" claim (unverified, Section 8).
- **[DECISION NEEDED] AI assistance framing:** commits made with Claude Code carry a co-author trailer, so it will be visible in the repo history. Decide upfront how to describe it (for example: "product decisions, design review and QA were mine; implementation was done with an AI coding pair under my direction"). Being open about it is safer than leaving it to be discovered.
- **[DECISION NEEDED]** teammate naming permission (10.2), and whether the original company/stakeholder framing ("Head of Marketing") should be described as a course brief or a real stakeholder.
