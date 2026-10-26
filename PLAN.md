# The Version of Me That Kept Reaching — Website Plan

*a quiet, mystic pull*
Who Am I Becoming? · A Digital Art Portfolio · GEARTS, Art Appreciation, Finals

This file is the build plan for the portfolio website. Read it fully before creating or changing files.

## Concept

The site is a small museum: visitors walk in through one 3D hallway, then move through two wings, a quiet room, and an archive. The 3D is used once, on the landing page; every other page is flat, editorial, and calm, so it feels artsy rather than techy.

| Room | Route | Feels like | Main inspo |
| --- | --- | --- | --- |
| Entrance | / | Walking into a gallery hallway | Dawson Wells |
| Part I wing | /part-1 | A curated wall of course works with museum labels | Dawson Wells, My Zodiac |
| Part II wing | /part-2 | An editorial feature per work, like a magazine spread | Unifiers of Japan |
| Reflection room | /reflection | One quiet wall of text | Dawson's exhibition note |
| Archive | /appendices | Opening the artist's folders | Cindy Ly |

**What to borrow from each inspo:**

- **Dawson Wells:** the scroll-controlled 3D corridor, the loading counter (Loading exhibition 0%), the skip-the-walkthrough link, numbered museum labels (Year, Medium, Dimensions).
- **My Zodiac:** parenthetical section numbers like ( 1.0 ) and ( 01 ), sliding marquee rows of repeated words, small slash-labels (energy / yang) — use these as label rows like medium / coffee on paper.
- **Unifiers of Japan:** huge editorial titles, 01 / 05 counters, a fact card per work, sticky sections that pin while content scrolls past.
- **Cindy Ly:** a personal voice, file-style names (bio.txt, appendix_01/), folders and sticker details — used only in the appendices and small touches.
- **SendTheSong:** soft, personal tone for the intro copy.

## Sitemap

The site has 5 top-level pages and 3 sets of detail pages generated from content files.

```
/                         Entrance · 3D hallway (title, intro, floor directory)
├── /part-1               ( I )   Part I wing — My Art Appreciation Journey
│   └── /part-1/[slug]          one work page per course output
├── /part-2               ( II )  Part II wing — My Artistic Exploration
│   └── /part-2/[slug]          one feature page per own work (4)
├── /reflection           ( III ) Looking Forward: Who Am I Becoming?
└── /appendices           ( IV )  Appendices
    └── /appendices/[n]         one evidence page per Part II work (4)

Part II work 01 links to Appendix 1, work 02 to Appendix 2, and so on.
Not on the site: the consent form (submitted separately with the link).
```

## Landing page (/) — the 3D entrance

The landing page is one long scroll in six stages; the 3D hallway is stage 3 and can be skipped at any point.

1. **Loader.** Plain off-white screen, the title in small caps, a compass needle that spins and settles pointing north, with Loading exhibition 0% → 100% under it. Preloads the hallway textures. Fades out.
2. **Hero.** Full-screen photo or render of the empty hallway. Big serif title "The Version of Me That Kept Reaching", with "a quiet, mystic pull" in small italics below, and one line under it: A digital art portfolio · GEARTS · 2026. Small hint at the bottom: Scroll to enter. Top-left link: Skip the walkthrough →.
3. **3D hallway (pinned, scroll-driven).** Scrolling moves the camera forward down a white corridor, turns one corner, and stops in front of a final framed piece.
   - 6 to 8 frames on the walls: a preview mix of Part I highlights and all Part II main pieces.
   - As the camera passes a frame, a museum label fades in beside it: number, title, year, medium, Part I or Part II.
   - The final frame is the Part II hero piece (or a title card with the exhibition title). The camera pushes in until it fills the screen, then the page continues.
   - Mobile and reduced-motion fallback: no 3D. Show the same frames as a horizontal swipe row with labels.
4. **Exhibition note.** Small label ( Exhibition note · 01 ), a large one-line statement, then a 2–3 sentence introduction. White space around it, like a wall text.
5. **Floor directory (table of contents).** Four large rows, each a link:
   - ( I ) My Art Appreciation Journey — count of works
   - ( II ) My Artistic Exploration — count of works
   - ( III ) Looking Forward: Who Am I Becoming?
   - ( IV ) Appendices
   - Hover: the row slides right and a small thumbnail appears. Below it, a slow marquee of the art forms tried (painting · photography · crafting · …).
6. **Footer / colophon.** Name, course, section, year, a short credits line (fonts, tools used to build the site), and Back to top.

The 3D frames use the same images as the gallery pages, so nothing is made twice.

## Part I wing — My Art Appreciation Journey

Part I is one scrolling gallery page plus a detail page per work; every work gets the same museum label.

**/part-1 (the wing page), top to bottom:**

1. **Wing header.** Small ( I ) counter, huge title My Art Appreciation Journey, one factual line: All outputs from GEARTS, individual and group, in the order I've curated them. A marquee row of the activity types underneath.
2. **Curated rooms.** Group the works into 2–4 rooms (for example: Looking, Words and Images, Making Together). Each room opens with a small label ( Room 1 · Looking ) and a one-line factual note on why these sit together.
3. **The wall.** Inside a room, works hang one by one, large, with lots of space. Each fades and rises in on scroll. Next to each image: its number (01, 02…) and the label card.
4. **End of wing.** A doorway-style link: Continue to Part II →.

**/part-1/[slug] (one per work):**

- Large image or video, then any extra photos in a small strip (click to enlarge).
- The label card (fields below), then a 1–2 sentence factual caption.
- Previous / next work links, and Back to the wing.

**Label card fields (same order everywhere):**

| Field | Example | Shows on |
| --- | --- | --- |
| Number | 04 | All |
| Title | (title) | All |
| Type of activity | Painting | All |
| Medium | Coffee on paper | All |
| Date | Sept 2026 | All |
| Authorship | Individual / Group | All |
| Group and role | Group 3: (members) — my role: (role) | Group works only |
| AI disclosure | AI-assisted, as allowed in this activity: (what AI did) | The appropriation work and any other AI-assisted task |
| Note | Original file missing; this is a photo of the printed copy | Only where true |

The AI disclosure and missing-file notes are styled as a visible tag on the label, not hidden in small print.

## Part II wing — My Artistic Exploration

Part II is an editorial index plus one magazine-style feature page per work, each ending in a button to its appendix.

**/part-2 (the wing page):**

1. **Wing header.** ( II ) counter, huge title My Artistic Exploration, one line: 4 works, made for this portfolio, mostly in forms new to me.
2. **Stacked feature cards (sticky).** One full-height card per work. Each card pins while the next slides up over it, like a stack of prints. Card: big number 01 / 04, title, art form, a Familiar or New to me tag, the main image.
3. **End of wing.** Continue to the Reflection →.

**/part-2/[slug] (one per work), top to bottom:**

1. **Hero.** 01 / 04 counter, huge title, art form, the main piece full width.
2. **Fact card** (Unifiers-style, sticky on desktop while the gallery scrolls): Art form · Medium/materials · Date made · Time spent · Familiar or new · Made by: me (solo).
3. **Process strip.** 3–5 small dated images in a row showing stages, each with a one-line factual caption. No reflective essay here; the reflection lives on its own page.
4. **Sub-gallery.** The rest of the series: grid, carousel, or video, depending on the work (see below).
5. **Proof link.** A big button: See the process evidence → Appendix N.
6. Previous / next work.

**Per-work layout (confirm order and the fourth work):**

| # | Work | Main piece | Sub-gallery style | Appendix |
| --- | --- | --- | --- | --- |
| 01 | Digital posters | One hero poster | Masonry grid of the other posters, click to enlarge | 1: layered files, sketches, version history, screen captures |
| 02 | Photography | One hero photo | Contact-sheet grid, each photo with a slash-label row (camera / date / setting) | 2: original captures, contact sheet, metadata, selection process |
| 03 | Crafting — fuzzy wire bouquet and paper rings | Bouquet photo | Progress carousel, then the making video; paper rings as an embedded TikTok with a link fallback | 3: materials, dated progress photos, the videos |
| 04 | (fourth work, new form) | — | — | 4 |

Only one of these can be the familiar slot; its tag reads Familiar practice and the fact card says why it connects to the theme.

## Reflection room and appendices

The reflection is the quietest page on the site; the appendices are the most personal-looking, styled as folders.

**/reflection — Looking Forward: Who Am I Becoming?**

- ( III ) counter and the full title, then one narrow column of prose (about 60–70 characters per line), large readable serif or sans.
- One pull line in very large type partway through — a sentence chosen from the reflection.
- Optional: 3–4 tiny thumbnails in the margin of works mentioned, linking back to them.
- Motion: only a slow fade-in per paragraph. No marquee, no pinning.
- Ends with: Thank you for visiting, and links to the Appendices and back to the Entrance.

**/appendices — the archive (Cindy Ly vibe)**

- Header ( IV ) Appendices, one line: Process evidence for each Part II work, in the same order.
- A row of folder icons, each with a file-style name and a sticker: appendix_01/ posters, appendix_02/ photography, appendix_03/ crafting, appendix_04/ (fourth).

**/appendices/[n] — one evidence page per work:**

1. Tab-style header: appendix_01 / Digital posters, with Back to the work ←.
2. **Timeline of evidence.** Dated items in order, oldest first: sketches → drafts → progress → final. Each item: image or video, date, one-line description.
3. **Files and links.** A list of external evidence (Drive folders, version history screenshots, TikTok, YouTube) that open in a new tab, each labelled with what it proves.
4. **Metadata table** where it applies (photography: camera, date taken, settings).
5. A short line: All works in Part II were made by me without AI tools.

## Shared components and navigation

Ten components build every page; make them once and reuse them.

| Component | What it does | Used on |
| --- | --- | --- |
| Top nav | Title (small, links home) on the left; I · II · Reflection · Appendices on the right; current page underlined. Hides on scroll down, returns on scroll up. Mobile: a Menu button opening a full-screen list. | All pages |
| Page counter | Small ( 02 / 05 ) in a corner showing which room you're in | All pages |
| Skip link | Skip the walkthrough → / Skip animation → | Landing, Part I, Part II |
| Section header | ( I ) counter + huge title + one line | Each wing |
| Museum label | The label card from Part I | Part I, 3D hallway |
| Fact card | Sticky info card for a work | Part II |
| Marquee | Slow row of repeated words | Landing, Part I |
| Lightbox | Click any image to see it large, with its alt text as caption | All galleries |
| Prev / next | Previous and next work in exhibition order | Work and appendix pages |
| Video embed | Lazy-loaded YouTube/TikTok embed with a plain link fallback; shows a placeholder box when no video ID is set | Part II, appendices |

**Accessibility rules:**

- Every image has alt text; every video has a visible link that opens it directly.
- Respect the reduced-motion setting: animations switch off and the 3D becomes the flat swipe row.
- Body text at least 17px, good contrast, nothing important only in motion.
- All external links open in a new tab.

## Visual system

Warm gallery white, black ink, one accent, three fonts, and slow motion — that's what keeps it artsy instead of techy.

**Color (pick one palette):**

| Palette | Background | Ink | Muted text | Accent |
| --- | --- | --- | --- | --- |
| A · Gallery wall | #F3F0EA warm white | #161616 | #7A766F | #B5432F terracotta |
| B · Night museum | #121212 | #EDEAE4 | #8C8880 | #D9B45A gold |

The accent appears only on tags, the active nav item, and one word per title at most.

**Type:**

| Role | Suggestion (free, Google Fonts) | Used for |
| --- | --- | --- |
| Display | Instrument Serif or Fraunces | Titles, big numbers, pull lines |
| Body | Inter or Manrope | Paragraphs, captions |
| Label | IBM Plex Mono | Counters ( 01 ), label fields, file names like appendix_01/ |

**Motion rules:**

| Where | Animation | Feel |
| --- | --- | --- |
| Landing hallway | Camera moves with scroll, labels fade in | The one big moment |
| Section titles | Words slide up from a mask, one by one | 0.8–1s, soft ease |
| Images | Fade and rise 30px when they enter; slight slow zoom on hero images | Gentle |
| Part II index | Cards pin and stack | Like laying prints on a table |
| Marquees | Constant slow drift; speeds up a little while scrolling | Ambient |
| Reflection | Paragraph fade only | Still |

**Not too techy — avoid:** neon glows, glitch effects, code-style fonts for body text, custom cursors that hide the real one, fast or bouncy easing, and particles. Texture can come from a faint paper grain overlay and real photos instead.

## Tech stack

Astro as the framework, Tailwind for styling, GSAP for scroll motion, and Three.js only for the landing hallway. No backend: this is a fully static site.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro | Built for content sites: one Markdown file per artwork becomes a page; ships almost no JavaScript, so it loads fast |
| Styling | Tailwind CSS | Fast layouts and phone-friendly breakpoints; colors and fonts set once in the config |
| Scroll animation | GSAP + ScrollTrigger | Pinned sections, stacking cards, title reveals, the scroll-driven camera |
| Smooth scroll | Lenis | Soft, gliding scroll feel; pairs with ScrollTrigger |
| 3D | Three.js | The landing hallway only, loaded just on that page |
| Content | Astro content collections (Markdown + frontmatter) | Label fields are validated, so a missing title or alt text shows an error |
| Images | Astro's Image component, WebP | Auto-resizes and lazy-loads |
| Video | YouTube (unlisted) or Drive embeds, TikTok links | Keeps the project small |
| Fonts | Google Fonts or Fontsource | Free display, body, and mono fonts |
| Running the site | Local only for now (npm run dev); hosting to decide later | Build and preview locally first; Git keeps a backup of each version |
| Editor | VS Code with the Astro extension | Syntax help for .astro files |

Setup: `npm create astro@latest` (in the current folder), `npx astro add tailwind`, `npm i gsap lenis three`, then `npm run dev`.

## Project folders and build order

Each artwork is one Markdown file, so the pages fill themselves from the content.

```
src/
  content/
    part1/        01-title.md, 02-title.md ...   (one per course work)
    part2/        01-digital-posters.md ... 04-*.md
    appendices/   01.md ... 04.md
    reflection.md
  components/
    Nav, PageCounter, SkipLink, SectionHeader, MuseumLabel,
    FactCard, Marquee, Lightbox, PrevNext, VideoEmbed, Hallway3D
  pages/
    index.astro
    part-1/index.astro, part-1/[slug].astro
    part-2/index.astro, part-2/[slug].astro
    reflection.astro
    appendices/index.astro, appendices/[n].astro
public/
  art/part1/  art/part2/  art/appendix/   (WebP, max ~2000px wide)
  hallway/    (3D wall and floor textures)
```

Each work's file starts with its label fields (number, title, type, medium, date, authorship, group, role, ai_disclosure, media list with alt text) and the caption below.

**Assets are not ready yet:** use placeholder entries and gray placeholder images with the final file names, so real files can be swapped in later without changing pages.

**Build order — submittable after step 5, the 3D comes last:**

- [ ] Put every Part I and Part II work into its Markdown file, with alt text (placeholders for now)
- [ ] Set up Astro + Tailwind, fonts, colors, and the nav
- [ ] Build the Part I wing and work pages with the museum label
- [ ] Build the Part II wing, feature pages, and fact card
- [ ] Build the appendices, reflection, and a simple landing page with the floor directory — save a copy here as a safe version
- [ ] Add GSAP + Lenis motion: title reveals, image fades, marquees, Part II stacking cards
- [ ] Build the 3D hallway (Three.js) with the mobile/reduced-motion fallback
- [ ] Test on a phone and in an incognito window; check every evidence link
- [ ] Submit the link, and the consent form separately

## Inspiration links

| Site | Use it for |
| --- | --- |
| [Dawson Wells Gallery](https://dawson-wells-gallery.pages.dev/) | Landing page 3D hallway, loader, museum labels, skip link |
| [My Zodiac](https://myzodiac.framer.website/) | ( 1.0 ) counters, marquee rows, slash-label rows |
| [SendTheSong](https://sendthesong.xyz/) | Soft, personal tone for the intro copy |
| [Cindy Ly](https://www.cindyly.design/) | Folder and file-name style for the appendices, stickers |
| [Unifiers of Japan](https://unifiersofjapan.framer.website/) | Big editorial titles, 01 / 05 counters, fact card, sticky sections |
