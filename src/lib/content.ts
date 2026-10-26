import { getCollection } from 'astro:content';

export const pad = (n: number) => String(n).padStart(2, '0');

export const isExternal = (href: string) => /^https?:\/\//.test(href);

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const byNumber = <T extends { data: { number: number } }>(a: T, b: T) => a.data.number - b.data.number;

export async function getPart1() {
  return (await getCollection('part1')).sort(byNumber);
}

export async function getPart2() {
  const works = (await getCollection('part2')).sort(byNumber);
  const familiar = works.filter((w) => w.data.familiar);
  if (familiar.length > 1) {
    throw new Error(
      `Only one Part II work may be marked familiar: true (found ${familiar.map((w) => w.id).join(', ')})`,
    );
  }
  return works;
}

export async function getAppendices() {
  return (await getCollection('appendices')).sort(byNumber);
}
