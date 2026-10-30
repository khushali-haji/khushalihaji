# To do

Next things to work on. Tick a box when it's done.

## Case studies

- [ ] Excalidraw: add images of users
- [ ] Add "more case studies" options above the footer on every case study page, like the St. Joe's page
- [ ] Add Ghar Se as case study 05 (then swap it in for the "Coming soon" card on the home page)

## Clean-up

- [ ] Look into deleting `case-studies/Excalidraw/Figma_recording.mov` (18MB). It is the same recording as the `.mp4`, and the page only uses it as a fallback that browsers skip. If it goes, also remove its `<source>` line in `excalidraw-attribution.html`. It stays in git history either way.
- [ ] Check the other files in `case-studies/Excalidraw/` for unused images (`Before.png`, `After.png`, `Before_1.png`, `After_1.png` are not used on the page)
- [ ] Decide what to do with files no page mentions (case study screenshots and old hero images, about 36 files, roughly 45MB): `case-studies/Images/` (image2 to image23, two Screenshot files, `Mobile View/`, `world-map.svg`, `map-poster.jpg`), `case-studies/Conflict Lens/User1_Jamila.png`, `User2_Zaif.png`, `User3_Amara.png`, `case-studies/Fin Lit_image.png`, `case-studies/Excalidraw/QR Code.png`, `icons/` (city, globe, grid, video), `images/hero-02`, `hero-03`, `hero-04`, `hero-06`, `hero-09`

## About page

Done so far: heading with the hover/tap role labels (and the "tap" note), shortened body text with links to the work, new Toolkit, thumbnails-only project cards, a layout for each screen (phones in portrait and landscape, iPad mini to Pro 11" portrait, iPad Pro 12.9" and desktop), "Read more" on phones, the section lines, one spacing system for the gaps between sections, accessibility pass, and the code clean-up. The iPad portrait layout was placed with `tools/ipad-editor.html` (a dev tool, safe to delete).

- [x] Positioning on tablet and phone: heading, tap note, labels, photo, section lines and spacing are set for phones, iPads and desktop. Still worth doing: look at it on real devices (an iPad and a phone)
- [x] Accessibility pass done (skip link, main landmark, headings, contrast on every screen size, keyboard, reduced motion, 44px tap targets, new-tab notices, zoom and text spacing, shared footer). Still open: test with a real screen reader (VoiceOver), and audit the other pages
- [x] Clean up the code: fine-tune board and its code removed, unused and overridden CSS removed from `about.html`, `js/word-rays.js` tidied
- [x] Add links to work in the About body text (On a Map, Seat at the Table, Documented, Central Desi, the water and sanitation project, the Silurians award, plus the existing case study links)
- [ ] Make the About me edits from Will's notes
- [ ] Decide whether the homepage and case studies should share the new cursor fix and the word-rays code (they still have their own copies)
- [ ] Check the Woodstock year (2025 on the About page, 2026 on the St. Joe's Hoes card)
- [ ] Match the award wording: the Toolkit "Recognition" row says "Dennis Duggan Journalism Award (2024)", the body text and the Silurians page say "Dennis Duggan Award"

## New sections

- [ ] Add the urban design portfolio
- [ ] Add writing
- [ ] Add videos
