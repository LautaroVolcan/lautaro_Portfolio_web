import { getCollection } from 'astro:content';

export async function getProjects() {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

/** Turns a Vimeo/YouTube page URL into an embeddable player URL. Returns null for anything else. */
export function embedUrl(url: string): string | null {
  const u = new URL(url);
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
