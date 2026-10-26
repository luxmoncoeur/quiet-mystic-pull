// Site-wide text: title, intro, footer, and the Part I room list.
// Edit the "(…)" placeholders here; the pages read everything from this file.

export const site = {
  // Wrap one word in *asterisks* to show it in the accent color.
  title: 'The Version of Me That Kept *Reaching*',
  subtitle: 'a quiet, mystic pull',
  tagline: 'A digital art portfolio · GEARTS · 2026',
  description: 'Who Am I Becoming? A digital art portfolio for GEARTS, Art Appreciation.',

  exhibitionNote: {
    statement: '(One-line statement about the exhibition.)',
    intro:
      '(Two or three sentences introducing the portfolio: what visitors will find, and the thread that ties the works together.)',
  },

  footer: {
    name: '(Your name)',
    course: 'GEARTS · Art Appreciation',
    section: '(Section)',
    year: 2026,
    credits:
      'Set in Instrument Serif, Inter, and IBM Plex Mono. Built with Astro and Tailwind CSS.',
  },
};

// The five rooms of the museum, in visiting order. Used by the nav, the page
// counter, and the floor directory.
export const wings = [
  { href: '/', numeral: '', nav: '', title: 'Entrance' },
  { href: '/part-1', numeral: 'I', nav: 'I', title: 'My Art Appreciation *Journey*' },
  { href: '/part-2', numeral: 'II', nav: 'II', title: 'My Artistic *Exploration*' },
  { href: '/reflection', numeral: 'III', nav: 'Reflection', title: 'Looking Forward: Who Am I *Becoming*?' },
  { href: '/appendices', numeral: 'IV', nav: 'Appendices', title: 'Appendices' },
] as const;

// Part I is split into curated rooms. Each Part I work sets `room:` to one of
// these ids, in the order the rooms appear on the wing page.
export const part1Rooms = [
  { id: 'room-1', name: '(Room name)', note: '(One factual line on why these works sit together.)' },
  { id: 'room-2', name: '(Room name)', note: '(One factual line on why these works sit together.)' },
  { id: 'room-3', name: '(Room name)', note: '(One factual line on why these works sit together.)' },
] as const;
