import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';
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

type Obj = Record<string, any>;
/** Overlay translated text on an item, matching arrays (items, columns) by position. */
function overlay<T extends Obj>(base: T, over?: Obj): T {
  if (!over) return base;
  const out: Obj = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (Array.isArray(v) && Array.isArray(base[k])) out[k] = base[k].map((b: Obj, i: number) => (v[i] && typeof b === 'object' ? overlay(b, v[i]) : v[i] ?? b));
    else if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') out[k] = overlay(base[k], v);
    else if (v !== undefined && v !== null) out[k] = v;
  }
  return out as T;
}

/** A project's data and body in the given language (Spanish falls back to English field by field). */
export async function localize(project: CollectionEntry<'projects'>, lang: Lang) {
  const tr = lang === 'es' ? await getEntry('projectsEs', project.id) : undefined;
  if (!tr) return { data: project.data, body: project as CollectionEntry<'projects'> | CollectionEntry<'projectsEs'> };
  const { blocks, gallery, caseStudy, ...rest } = tr.data;
  const data = overlay(project.data, rest);
  if (caseStudy && project.data.caseStudy) data.caseStudy = overlay(project.data.caseStudy, caseStudy);
  if (gallery) data.gallery = overlay({ g: project.data.gallery }, { g: gallery }).g;
  if (blocks) data.blocks = overlay({ b: project.data.blocks }, { b: blocks }).b;
  const body = tr.body && tr.body.trim() ? tr : project;
  return { data, body: body as CollectionEntry<'projects'> | CollectionEntry<'projectsEs'> };
}

/** Props for every project page: number and "next" run inside the project's own section. */
export async function projectPaths(lang: Lang) {
  const projects = await getProjects();
  return projects.map((project) => {
    const same = projects.filter((q) => q.data.section === project.data.section);
    const i = same.indexOf(project);
    return {
      params: { slug: project.id },
      props: { project, index: i, next: same.length > 1 ? same[(i + 1) % same.length] : null, lang },
    };
  });
}
