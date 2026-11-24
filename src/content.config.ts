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
      /** Which tab of Work the project lives in: art, films or commercial. */
      section: z.enum(['art', 'films', 'commercial']),
      /**
       * Case study, for commercial work. Every field is optional; the page shows the parts
       * that are filled in, in this order: brief → idea → process → deliverables → results → credits.
       */
      caseStudy: z
        .object({
          /** Be honest about what the project was: shown as a small tag next to the client. */
          kind: z.enum(['client', 'spec', 'pitch', 'concept']).default('client'),
          brief: z.string().optional(),
          challenge: z.string().optional(),
          idea: z.string().optional(),
          process: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
          deliverables: z.array(z.string()).default([]),
          results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
          credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
        })
        .optional(),
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
      /** Optional: replaces the hero with a 3D carousel of these images (loops, with arrows). */
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
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
            z.object({ type: z.literal('images'), items: z.array(z.object({ src: image(), alt: z.string() })).min(2).max(4), caption: z.string().optional() }),
            z.object({ type: z.literal('video'), url: z.string().url(), ratio: z.string().default('16/9'), title: z.string().optional(), caption: z.string().optional() }),
            z.object({ type: z.literal('text'), body: z.string() }),
            /** A small section title inside the blocks, e.g. "02 · Product". */
            z.object({ type: z.literal('heading'), label: z.string().optional(), title: z.string(), text: z.string().optional() }),
            /**
             * A node-graph style diagram of a pipeline: columns left to right, each with a few cards (thumbnail + label).
             * Good for showing how an AI workflow is wired (references feeding generators).
             * An item without `src` is drawn as a text card (use `text` for one line of what it does).
             */
            z.object({
              type: z.literal('nodes'),
              columns: z
                .array(z.object({ label: z.string(), items: z.array(z.object({ src: image().optional(), text: z.string().optional(), label: z.string() })).min(1) }))
                .min(2),
              caption: z.string().optional(),
            }),
          ]),
        )
        .default([]),
      /** Optional link to an external archive (Behance, festival page…). */
      external: z.object({ label: z.string(), url: z.string().url() }).optional(),
      /** Set to true to hide a project without deleting it. */
      draft: z.boolean().default(false),
    }),
});

/**
 * Spanish translations, one file per project with the same name as in content/projects.
 * Only text: anything left out falls back to English. `blocks` and `gallery` are matched by position
 * (block 1 overrides block 1…), so you only write the text fields (alt, caption, title, text, label, body).
 */
const projectsEs = defineCollection({
  loader: glob({ base: './src/content/projects-es', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    category: z.string().optional(),
    client: z.string().optional(),
    role: z.string().optional(),
    coverAlt: z.string().optional(),
    caseStudy: z.record(z.string(), z.any()).optional(),
    gallery: z.array(z.object({ alt: z.string() }).partial()).optional(),
    blocks: z.array(z.record(z.string(), z.any())).optional(),
  }),
});

export const collections = { projects, projectsEs };
