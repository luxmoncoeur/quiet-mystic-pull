// Site-wide text: title, intro, footer, and the Part I room list.
// Edit the "(…)" placeholders here; the pages read everything from this file.

export const site = {
  // Wrap one word in *asterisks* to show it in the accent color.
  title: 'The Version of Me That Kept *Reaching*',
  subtitle: 'a quiet, mystic pull',
  tagline: 'A digital art portfolio · GEARTS · 2026',
  description: 'Who Am I Becoming? A digital art portfolio for GEARTS, Art Appreciation.',

  exhibitionNote: {
    statement: "Perhaps I was never searching for something new, only finding new ways to say what I couldn't before.",
    intro:
      'This portfolio gathers my GEARTS works and the creations I pursued beyond the classroom. Part I reveals an unexpected thread of water and tides woven through my class outputs, reflecting more of me than I first realized. Part II follows that thread through posters, photographs, and fuzzy-wire lilies, each a new medium through which I continue to discover and express myself.',
  },

  footer: {
    name: 'Gio Angelo Lat',
    course: 'GEARTS · Art Appreciation',
    section: 'BSIT 3A',
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
  { id: 'room-1', name: 'Still Water, Moving Lines', note: 'Three individual works that use the sea as their subject, in pen, coffee, and newsprint.' },
  { id: 'room-2', name: 'Draft: A New Brushstroke', note: "Two reinterpretations of famous paintings: Millais's Ophelia and da Vinci's Mona Lisa." },
  { id: 'room-3', name: 'Draft: Made Together', note: 'Group works, each with my role listed on its label. In this part, it analyzes how coordination can lead to efficient workflow.' },
] as const;
