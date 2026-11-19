import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One line shown under the title on the project page and in link previews. */
      summary: z.string(),
      category: z.string(),
      year: z.number().int().optional(),
      client: z.string().optional(),
      role: z.string().optional(),
      tools: z.array(z.string()).default([]),
      /** Lower numbers appear first in the grid. */
      order: z.number().default(100),
      /** Square-ish cover image, stored next to the other project assets in src/assets/projects. */
      cover: image(),
      coverAlt: z.string(),
      /** Optional short muted loop (4–6 s, < 2 MB) in public/video, e.g. "/video/control-loop.mp4". Plays on hover in the grid. */
      loop: z.string().optional(),
      /** Optional full video: a Vimeo or YouTube URL. Shown first on the project page. */
      video: z.string().url().optional(),
      /** Extra stills for the project page. */
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      /** Optional link to an external archive (Behance, festival page…). */
      external: z.object({ label: z.string(), url: z.string().url() }).optional(),
      /** Set to true to hide a project without deleting it. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
