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
      /** Optional main video shown first on the project page: Vimeo, YouTube, Adobe/Behance (ccv) or Sketchfab URL. */
      video: z.string().url().optional(),
      /** Aspect ratio of the main video, e.g. "16/9" (default), "9/16", "1/1", "4/3". */
      videoRatio: z.string().default('16/9'),
      /**
       * The body of the case study, in order, after the main text. Each block is one of:
       *   - type: image   → one image (wide: true = full bleed)
       *   - type: images  → 2–3 images side by side
       *   - type: video   → an embedded player (Vimeo, YouTube, Adobe/Behance, Sketchfab)
       *   - type: text    → a paragraph (or several, separated by a blank line) between media
       */
      blocks: z
        .array(
          z.discriminatedUnion('type', [
            z.object({ type: z.literal('image'), src: image(), alt: z.string(), caption: z.string().optional(), wide: z.boolean().default(false) }),
            z.object({ type: z.literal('images'), items: z.array(z.object({ src: image(), alt: z.string() })).min(2).max(3), caption: z.string().optional() }),
            z.object({ type: z.literal('video'), url: z.string().url(), ratio: z.string().default('16/9'), title: z.string().optional(), caption: z.string().optional() }),
            z.object({ type: z.literal('text'), body: z.string() }),
          ]),
        )
        .default([]),
      /** Optional link to an external archive (Behance, festival page…). */
      external: z.object({ label: z.string(), url: z.string().url() }).optional(),
      /** Set to true to hide a project without deleting it. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
