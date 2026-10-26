import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { part1Rooms } from './data/site';

const required = (field: string) => z.string().trim().min(1, `${field} is required`);

// One image. `src` is a path inside public/, e.g. /art/part1/01-main.webp.
const image = z.object({
  src: required('Image src'),
  alt: required('Alt text'),
  caption: z.string().optional(),
  // Slash-label row, e.g. ["(camera)", "(date)", "(setting)"]
  details: z.array(z.string()).optional(),
});

// Leave youtube/tiktok empty to show a "Video coming soon" box.
const video = z.object({
  title: required('Video title'),
  youtube: z.string().optional(), // the ID only, e.g. dQw4w9WgXcQ
  tiktok: z.union([z.url(), z.literal('')]).optional(), // full TikTok video URL
});

const roomIds = part1Rooms.map((room) => room.id) as [string, ...string[]];

const part1 = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/part1' }),
  schema: z
    .object({
      number: z.number().int().positive(),
      title: required('Title'),
      type: z.string().optional(),
      medium: required('Medium'),
      date: z.string().optional(),
      authorship: z.enum(['Individual', 'Group']),
      group: z.string().optional(),
      role: z.string().optional(),
      ai_disclosure: z.string().optional(),
      note: z.string().optional(),
      room: z.enum(roomIds),
      highlight: z.boolean().default(false), // shows in the landing hallway
      document: z.string().optional(), // e.g. a PDF in public/art/part1/
      media: z.array(image).min(1, 'Add at least one image'),
      videos: z.array(video).default([]),
    })
    .refine((d) => d.authorship !== 'Group' || (d.group && d.role), {
      message: 'Group works need both `group` and `role`',
      path: ['group'],
    }),
});

const part2 = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/part2' }),
  schema: z
    .object({
      number: z.number().int().positive(),
      title: required('Title'),
      type: z.string().optional(), // art form
      medium: required('Medium'),
      date: z.string().optional(),
      time_spent: z.string().optional(),
      authorship: z.enum(['Individual', 'Group']),
      familiar: z.boolean().default(false),
      familiar_reason: z.string().optional(),
      note: z.string().optional(),
      // First image is the hero; the rest form the sub-gallery.
      media: z.array(image).min(1, 'Add at least one image'),
      gallery_style: z.enum(['masonry', 'contact-sheet', 'carousel', 'grid']).default('grid'),
      process: z.array(image.extend({ date: z.string().optional() })).default([]),
      videos: z.array(video).default([]),
    })
    .refine((d) => d.authorship === 'Individual', {
      message: 'Part II works must be made by you alone',
      path: ['authorship'],
    }),
});

const appendices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/appendices' }),
  schema: z.object({
    number: z.number().int().positive(), // matches the Part II work number
    title: required('Title'),
    folder: required('Folder name'),
    sticker: z.string().optional(),
    items: z
      .array(
        z.object({
          date: z.coerce.date(),
          description: required('Description'),
          image: image.optional(),
          video: video.optional(),
        }),
      )
      .default([]),
    links: z
      .array(z.object({ label: required('Link label'), url: z.url(), proves: required('What it proves') }))
      .default([]),
    metadata: z
      .object({ columns: z.array(z.string()).min(1), rows: z.array(z.array(z.string())) })
      .optional(),
  }),
});

const reflection = defineCollection({
  loader: glob({ pattern: 'reflection.md', base: './src/content' }),
  schema: z.object({}),
});

export const collections = { part1, part2, appendices, reflection };
