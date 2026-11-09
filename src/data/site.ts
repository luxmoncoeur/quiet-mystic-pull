// Site-wide text: title, intro, footer, and the Part I month notes.
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
  },
};

// The five rooms of the museum, in visiting order. Used by the nav, the page
// counter, and the floor directory.
export const wings = [
  { href: '/', numeral: '', nav: '', title: 'Entrance' },
  { href: '/part-1', numeral: 'I', nav: 'Part I', title: 'My Art Appreciation *Journey*' },
  { href: '/part-2', numeral: 'II', nav: 'Part II', title: 'My Artistic *Exploration*' },
  { href: '/reflection', numeral: 'III', nav: 'Reflection', title: 'Looking Forward: Who Am I *Becoming*?' },
  { href: '/appendices', numeral: 'IV', nav: 'Appendices', title: 'Appendices' },
] as const;

// The About page: the passport card and the bento cells around it.
export const about = {
  photo: { src: '/about-me/gio.webp', alt: 'Gio Angelo Lat in a brown plaid shirt and glasses, sitting at a dark table in a cafe lit by hanging lanterns.' },
  surname: 'Lat',
  givenNames: 'Gio Angelo',
  program: 'BSIT',
  passportNo: 'GLT8036-1219',
  issued: '19 Dec 2025', // December 19, 2025
  likes: ['choco banana frappe', 'matcha', 'Spotify'],
  hyperfixations: ['Airbuds', 'squishies'],
  // Each song opens on Spotify inside my public playlist.
  songs: {
    artist: 'NIKI',
    playlist: '4GU5VUQNQlLFIp3B4HtH7Y',
    tracks: [
      { title: 'Magnets', id: '2r08E0h3dkYtdFCV3Ur4uK' },
      { title: 'Tsunami', id: '7fZ9GpxwteD6R1SNL8OPZa' },
      { title: 'lowkey', id: '5TTXEcfsYLh6fTarLaevTi' },
    ],
  },
  validFor: 'Until the end of time',
  foundAt: "If I'm not at home, I'm probably at The Outlets at Lipa, at Motobrew.",
  links: [
    { label: 'Medium', handle: '@luxmoncoeur', url: 'https://medium.com/@luxmoncoeur' },
    { label: 'GitHub', handle: 'luxmoncoeur', url: 'https://github.com/luxmoncoeur' },
  ],
};

// Pages outside the museum's five rooms: in the nav, but not in the page counter.
export const extraPages = [{ href: '/about', numeral: '', nav: 'About', title: 'About *me*' }] as const;

// Part I hangs in the order the works were made, one room per month. Its notes
// are keyed by month name; a month without a note just shows its name.
export const part1Months: Record<string, string> = {
  July: 'The first weeks: a scribble that turned into a sea, and two book spine poems built with my groupmates.',
  August: 'Coffee as paint, and the shore again.',
  September: 'Newsprint, an appropriated painting, and a group analysis of Balota.',
  October: 'A Rococo Mona Lisa, and a short film made with friends.',
};
