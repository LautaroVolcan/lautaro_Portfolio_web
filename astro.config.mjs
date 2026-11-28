// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.lautaroferrandi.com',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
});
