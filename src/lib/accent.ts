// Titles may mark one accent word with asterisks: "Kept *Reaching*".
// Kept free of server-only imports so the browser (the 3D title card) can use it too.

// Strips the marks, for places that show text only (tab title, nav, labels).
export const plain = (text: string) => text.replace(/\*/g, '');

export function splitAccent(text: string) {
  const match = text.match(/\*([^*]+)\*/);
  if (!match || match.index === undefined) return { before: plain(text), accent: '', after: '' };
  return {
    before: plain(text.slice(0, match.index)),
    accent: match[1],
    after: plain(text.slice(match.index + match[0].length)),
  };
}
