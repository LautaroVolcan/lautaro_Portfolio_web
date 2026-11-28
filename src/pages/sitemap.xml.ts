// sitemap.xml with both languages of every page, linked as alternates for search engines.
import type { APIRoute } from 'astro';
import { getProjects } from '../lib';

export const GET: APIRoute = async ({ site }) => {
  const base = site!;
  const paths = ['/', ...(await getProjects()).map((p) => `/work/${p.id}/`)];
  const url = (p: string) => new URL(p, base).href;
  const entries = paths
    .flatMap((p) => [p, `/es${p}`])
    .map((loc) => {
      const en = loc.replace(/^\/es(?=\/)/, '');
      return `  <url>
    <loc>${url(loc)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${url(en)}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${url('/es' + en)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url(en)}"/>
  </url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
