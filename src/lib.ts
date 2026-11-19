import { getCollection } from 'astro:content';
import { sections } from './data/site';

const sectionIndex = (id: string) => sections.findIndex((s) => s.id === id);

/** All published projects, grouped by section (Art, Films, Commercial) and then by `order`. */
export async function getProjects() {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  return all.sort(
    (a, b) =>
      sectionIndex(a.data.section) - sectionIndex(b.data.section) ||
      a.data.order - b.data.order ||
      a.data.title.localeCompare(b.data.title),
  );
}

/** Turns a Vimeo/YouTube/Adobe (Behance)/Sketchfab URL into an embeddable player URL. Returns null for anything else. */
export function embedUrl(url: string): string | null {
  const u = new URL(url);
  // Behance-hosted videos (Adobe Creative Cloud player) and Sketchfab models are already embed URLs.
  if (u.hostname === 'www-ccv.adobe.io' && u.pathname.includes('/embed')) return url;
  if (u.hostname === 'sketchfab.com') {
    const id = u.pathname.match(/models\/([0-9a-f]+)/)?.[1] ?? u.pathname.match(/-([0-9a-f]{32})$/)?.[1];
    return id ? `https://sketchfab.com/models/${id}/embed?autostart=0&ui_theme=dark` : null;
  }
  if (u.hostname.includes('vimeo.com')) {
    const id = u.pathname.split('/').filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${id}?dnt=1&title=0&byline=0&portrait=0` : null;
  }
  if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') {
    const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v');
    return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
  }
  return null;
}
