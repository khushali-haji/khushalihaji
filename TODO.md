# To do

Next things to work on. Tick a box when it's done.

## Case studies

- [ ] Excalidraw: add images of users
- [ ] Add "more case studies" options above the footer on every case study page, like the St. Joe's page
- [ ] Add Ghar Se as case study 05 (then swap it in for the "Coming soon" card on the home page)

## Clean-up

- [ ] Look into deleting `case-studies/Excalidraw/Figma_recording.mov` (18MB). It is the same recording as the `.mp4`, and the page only uses it as a fallback that browsers skip. If it goes, also remove its `<source>` line in `excalidraw-attribution.html`. It stays in git history either way.
- [ ] Check the other files in `case-studies/Excalidraw/` for unused images (`Before.png`, `After.png`, `Before_1.png`, `After_1.png` are not used on the page)

## About page

Done so far: heading with the hover/tap role labels, shortened body text, new Toolkit, CTA buttons, thumbnails-only project cards, fine-tune board (`about.html?tune=1`), links to Conflict Lens, the data page and St. Joe's Hoes.

- [ ] Positioning on tablet and phone: check the heading, tap note and labels again on real devices (iPad mini to Pro 11" and 12.9" portrait, phones, landscape). The tap arrow and label spacing on portrait tablets were still being nudged.
- [x] Accessibility pass done (skip link, main landmark, headings, contrast, keyboard, reduced motion). Still open: test with a real screen reader (VoiceOver) and at 200% zoom, and audit the shared footer and the other pages
- [ ] Clean up the code: about.html has a lot of leftover CSS from earlier layouts (check for unused rules), the responsive blocks overlap and could be merged, and `js/word-rays.js` and `js/role-tuner.js` need a tidy and comments
- [ ] Add links to work in the About body text (more project and case study links where they fit)
- [ ] Make the About me edits from Will's notes
- [ ] Decide whether the homepage and case studies should share the new cursor fix and the word-rays code (they still have their own copies)
- [ ] Check the Woodstock year (2025 on the About page, 2026 on the St. Joe's Hoes card)

## New sections

- [ ] Add the urban design portfolio
- [ ] Add writing
- [ ] Add videos
