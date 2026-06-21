# Case Study 1 — Conflict Lens

> **Full case study spec — product design portfolio.**
> Sections, final copy, visuals, and *why-this-works* notes for each block.
> Guidance notes appear as `> [!NOTE]` callouts — they explain how to build the
> section and are **not** meant to ship as body copy.

---

## 0. Hero

**Title:** Conflict Lens

**One-liner:**
Turn a single news article into a geo-referenced, bias-aware conflict briefing — in under a minute.

**Meta row:**
- **Role:** *[Fill — e.g. "Solo: Product Design & Build"]*
- **Timeline:** *[Fill]*
- **Type:** Responsive web app
- **Stack:** React · Leaflet · Express · Google Gemini
- **Links:** [Live demo] · [GitHub]

**Visual:** Full-bleed hero of the desktop dashboard — the black-and-white satellite map with the colored pins and the floating glass panels.

> [!NOTE]
> Lead with the dashboard, not the input screen. It's your most distinctive frame and signals "this is a real, working product" in 3 seconds. If you can, use a short looping GIF of the map fitting to the pins on load.

---

## 1. The Problem

**Headline:** Understanding a conflict shouldn't take 12 browser tabs

When a conflict breaks, a single article gives you fragments, not understanding. The location is buried in one paragraph, the actors in another. The historical context is assumed. And the article's own slant is invisible unless you already know the outlet.

So an engaged reader does the work manually: open a map to find where Khan Yunis actually is, skim Wikipedia for who's involved, cross-check a second outlet to sense the bias. Three tools, ten minutes, and most people give up before they start. Worse, the most rigorous reporting sits behind paywalls — so the readers who want depth hit a login wall first.

> **How might we take someone from a single article to a contextual, geographically-grounded, bias-aware understanding of a conflict — in under a minute?**

**Visual:** "Before" diagram — a messy cluster of browser tabs (Maps, Wikipedia, two outlets, a fact-checker) with a frustrated flow between them.

> [!NOTE]
> This proves the problem is real and specific before you've claimed a solution. Product/UX reviewers reward problem framing over feature lists.

---

## 2. Research & Insight

**Headline:** I started with the workflow, not the interface

### 2a — Who it's for

The core user isn't a headline-skimmer — it's the **engaged reader**: students, journalists, analysts, globally-curious people who want to understand an event, not just hear it happened. Their frustration isn't lack of news; it's lack of synthesis. The information exists; assembling it is the labor.

> [!NOTE]
> If you did ANY real input — even talking to 3 friends who follow international news, or logging your own frustration — say so here; it's a big credibility multiplier. If not, frame it honestly as "designed from a defined user need," don't fake data.

### 2b — The market gap

Every existing tool solves one slice:

- **AI summarizers** compress text — but strip geography and offer no source skepticism.
- **Live conflict maps** (LiveUAMap) nail geography — but no synthesis, history, or bias.
- **Traditional news** has depth — but no structure, no map, one outlet's framing.

**The whitespace:** nobody combines synthesis + geography + bias-awareness in one view.

**Visual:** Competitive matrix.

| | Summarizers | Conflict maps | Traditional news | **Conflict Lens** |
|---|:---:|:---:|:---:|:---:|
| Synthesis | ✓ | — | ✓ | **✓** |
| Geography | — | ✓ | — | **✓** |
| Bias awareness | — | — | — | **✓** |
| Accessible | ✓ | ✓ | — | **✓** |

> [!NOTE]
> This single grid IS your product-market-fit argument — make it prominent. It's the most important image in the research section.

### 2c — From insight to principles

The research converged on four principles that drove every later decision:

1. **Geography is the spine** — the map leads, text supports.
2. **Never make them wait for everything** — show the core fast, stream depth in.
3. **Make bias visible, not invisible** — source framing is a feature you read, not a trap you fall into.
4. **Meet the reader where the content is** — even when it's paywalled.

**Visual:** Four principle cards with small icons (pin · lightning · eye · key).

> [!NOTE]
> Reference these by name in the decisions section — it shows your work is thesis-driven, not taste-driven. This is the #1 thing that reads as "senior product thinker."

---

## 3. Defining the Product

**Headline:** One flow, three moves

I kept scope deliberately tight: no accounts, no saved history, no feeds — those would dilute the one thing that had to feel like magic: the moment a wall of article text becomes a living briefing. The whole product is one flow: **Input → AI analysis → Interactive briefing.**

**Visual:** 3-step flow diagram: `[Input: Link / PDF] → [Analyze] → [Interactive Briefing]`

**Cut on purpose:** no accounts · no saved history · no multi-article comparison.

> [!NOTE]
> Keep the "what I cut" list — defending scope signals product maturity. Junior portfolios add features; strong ones justify omissions.

---

## 4. The Interface (Desktop)

**Headline:** Three screens, one continuous narrative

### Screen 1 — Input
A quiet, editorial entry point: warm neutrals, sage accents, a Newsreader serif headline against Inter body. Restraint as a trust signal — this handles serious subject matter and should feel like it. A two-tab switcher offers **Paste Link** or **Upload PDF** (the PDF path exists for a specific reason — see Decisions).

### Screen 2 — Analysis
Instead of a generic spinner, honest copy: *"Extracting Core Incident… georeferencing primary location and key actors (~5–10s)."* Truthful waiting copy lowers perceived wait and sets the expectation that real work is happening.

### Screen 3 — The Briefing Dashboard
A black-and-white satellite map fills the screen; translucent panels float over it. On load the map fits to every pin at the tightest zoom that shows them all. Pins are color-coded: incident site, actor bases, conflict areas, timeline events — each radiating a soft colored ring. Three panel zones do the synthesis:

- **Key Details** — actors (states / groups / people), location, date.
- **The Briefing** — plain-language summary (The Latest / Backdrop / Why it matters) + Journalistic Analysis: framing, source lean, cross-border context, and verification links.
- **Timeline** — a connected strip of lead-up events; click one and the map flies to it.

Everything loads progressively — core paints first, then locations, timeline, and bias stream in behind, each with its own inline loading cue.

**Visuals:** Annotated screenshots of all three screens (callouts on: dual-mode tabs, honest loading copy, pin colour system, the three panel zones, the connected timeline). The dashboard is the largest, most polished image.

> [!NOTE]
> Every screenshot caption should explain the *why*, not the *what*. If you can, record a GIF of: map fitting to pins → clicking a timeline card → map flying to it. Motion sells this far better than stills.

---

## 5. Mobile: A Different Metaphor

**Headline:** The desktop pattern breaks on a phone — so I changed the metaphor

"Floating panels over a fullscreen map" is elegant on desktop but unusable on mobile — the panels would cover the map or overflow. So mobile uses the **map-app pattern**: the map is the hero and stays fully pannable; a compact top bar holds the title and a fresh-analysis button; a bottom nav bar splits into **Key Details · Summary · Timeline**. Tapping one slides a sheet up over the map; an X or a tap on the map dismisses it. Tapping a map pin auto-opens the Timeline and selects that event, and the map lifts so the pin isn't hidden behind the sheet.

**Visuals:** Side-by-side mobile frames — collapsed (map + nav bar), one sheet open, and a pin-tap auto-opening the Timeline.

> [!NOTE]
> This section is gold for product roles: it shows you recognise when a pattern doesn't translate and redesign the interaction model, not just the CSS. Recruiters open portfolios on phones — a thoughtful mobile story stands out.

---

## 6. Key Design Decisions

**Headline:** Decisions, and the tradeoffs behind them

**Format:** Decision cards — *Tension → Decision → Why (principle).*

**Progressive rendering over one big result.**
*Tension:* One AI call is simpler but means 20+ seconds of blank screen.
*Decision:* Split into stages; core paints in ~5–10s, the rest streams in.
*Why:* Never make them wait.

**A PDF escape hatch for paywalls.**
*Tension:* The best reporting is paywalled and a scraper just hits a login wall.
*Decision:* A second input mode — upload the article as PDF. A product answer to a real-world constraint.
*Why:* Meet the reader where the content is.

**Bias as a visible panel.**
*Decision:* A dedicated Journalistic Analysis panel: framing, institutional lean, missing cross-border context, plus links to cross-reference.
*Why:* Make bias visible.

**Map-first, fit-to-pins.**
*Decision:* Full-bleed map; on load it frames every pin at the tightest fitting zoom.
*Why:* Geography is the spine.

**A restrained, muted palette.**
*Decision:* One sage accent family for all UI chrome; four muted pin colours are the only place hue carries meaning, so the map reads instantly.

> [!NOTE]
> The "tension → decision → why" structure proves you weigh tradeoffs instead of just having opinions. Keep it rigid across all cards.

---

## 7. Designing for Unreliable AI ⭐

**Headline:** The hardest design problem wasn't the UI — it was the AI

When your data source is a language model, it can return wrong, malformed, or missing output at any moment. Most of the real design work was absorbing that gracefully:

- **Hallucinated source links.** The model happily invented article URLs that 404'd. Rather than trust them, I had it return an outlet + a search query and construct guaranteed-valid search links myself — real, relevant, never broken.
- **Coordinates that landed in the ocean.** The model often returned `0.0, 0.0`. The prompts now insist on real coordinates with capital-city fallbacks, and the UI filters invalid pins and de-duplicates overlapping ones.
- **Failures that looked like empty states.** A failed analysis used to show "No data." Now it shows a clear error with a one-tap **Retry** that re-runs only the failed step.
- **Rate limits mid-demo.** I made the model configurable and moved to a tier with a separate quota, and stopped retrying on quota errors (which only burned more).

> **Good UX for AI is as much about handling failure as showcasing success.**

**Visual:** Before/after pair — a hallucinated broken link vs. the constructed search link; and a "No data" panel vs. the error-with-retry state.

> [!NOTE]
> This is your strongest differentiator. Lots of people can wire up an LLM; far fewer design for its failure modes. Lean into it.

---

## 8. Concept → Build: Where I Was Wrong

**Headline:** What the build taught me that the concept didn't

**Format:** Three before/after rows.

- **"One AI call" → a four-stage pipeline.** The single mega-call was slow and returned malformed JSON. Rebuilt as scrape-once + progressive core/locations/deep passes.
- **"Paste any URL" → URLs and PDFs.** Real reporting is paywalled; the PDF mode exists entirely because my first assumption broke on contact.
- **"The AI returns clean map data" → defensive design.** `0.0, 0.0` coordinates and invented URLs forced me to engineer the experience around messy output.

> **The concept was "paste a link, get a summary." The product became a resilient, progressively-rendered briefing engine — because real articles are paywalled, real AI output is messy, and real APIs rate-limit you.**

> [!NOTE]
> Most valuable section for product roles — it proves you learn from reality instead of defending v1. Be specific and a little vulnerable.

---

## 9. The Stack / How It Works

**Headline:** Under the hood

- **Frontend:** React + Vite, React-Leaflet (black-and-white satellite tiles), hand-built CSS theming.
- **Backend:** Node + Express, Google Gemini as the analysis engine.
- **Pipeline:** Cheerio + Axios scrape the article; pdf-parse handles uploads; a short-lived session cache avoids re-scraping across the multi-step analysis; every AI call has retry/back-off.
- **Shipped:** frontend on GitHub Pages, backend on a free server tier.

**Visual:** Architecture diagram — `[Browser / React] → [Express API] → [Scraper / PDF parser] + [Gemini] → back to UI`

> [!NOTE]
> Keep this short and skimmable — the diagram does 80% of the work. Reviewers want to see you can build, not read code.

---

## 10. Reflection & What's Next

**Headline:** What I learned, and where it goes

The biggest lesson was about designing for systems you don't fully control — progressive loading, honest waiting states, sensible fallbacks, one-tap recovery. If I took it further: source-reliability scoring on the verification links, saved briefings for analysts, and an animated "play through the timeline" walkthrough.

> [!NOTE]
> Add one genuine limitation you'd fix — self-awareness reads as senior. End on the forward-looking line.

---

## 11. Footer

Conflict Lens · [Live demo] · [GitHub] · [Back to portfolio] · [Email / LinkedIn]

> [!NOTE]
> A live demo dramatically outperforms screenshots — but add the "first load may take ~30s (free server waking)" note so a cold start doesn't read as broken.

---

## Image / Diagram Checklist

- [ ] **Hero** — annotated desktop dashboard (or GIF of fit-to-pins) ⭐
- [ ] **Problem** — "12 browser tabs" before-state diagram
- [ ] **Research** — user/need card
- [ ] **Research** — competitive matrix ⭐ *(your PMF money shot)*
- [ ] **Research** — four principle cards
- [ ] **Product** — 3-step flow diagram
- [ ] **Desktop** — annotated input / loading / dashboard (3 images)
- [ ] **Mobile** — 3 frames (collapsed · sheet open · pin-tap → timeline) ⭐
- [ ] **Decisions** — optional icon per card
- [ ] **Designing for unreliable AI** — 2 before/after pairs (links + error state) ⭐
- [ ] **Concept → build** — three v1→v2 rows
- [ ] **Stack** — architecture diagram
- [ ] **Optional** — GIF: timeline card click → map flies to event

---

## What I Would Do Next (backlog)

- **"Play" walkthrough** — a ▶ button that steps through events in sequence, flying the map to each. A fantastic portfolio demo moment — it animates the whole dataset in one click.
- **Chronological guarantee + relative dates** — sort events by date and show consistent formatting (the model sometimes returns mixed formats).
- **Keyboard nav** — ←/→ arrows to move through events with the map following. Cheap, feels premium.
- **Enter-to-start** — pressing Enter on the landing page triggers analysis. Input screen validation/feedback — disable "Analyze Link" until there's a vaguely URL-shaped value, and show a subtle inline error rather than only the bottom-of-page red text.
- **Casualties field** — surface it in Key Details. If the news is an event where casualties aren't directly related, state which indirect event's casualties are shown. If not relevant, write **n/a**.
- **Reduce panel density** on the left sidebar — Summary + four analysis blocks is a lot of text stacked vertically. Consider collapsible sections or tabs (Summary / Bias / Sources).
- **Loading skeletons instead of spinners** in the panels. Skeleton shapes that match the final layout feel faster and more designed than spinners.

---

## Cross-cutting Tips

Weight sections **2, 6, 7, and 8** most (research, decisions, designing-for-AI, and learning — the four things UX/product reviewers use to separate a decorator from a product thinker). Keep prose tight, use pull-quotes for the principles and HMW, and put a *why* caption on every screenshot.
