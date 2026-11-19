// English is the main site (/), Spanish lives under /es/.
// UI strings are here; page copy is in data/site.ts (en) and data/site.es.ts (es);
// project translations are in content/projects-es/<same-slug>.md.

import * as en from './data/site';
import * as es from './data/site.es';

export const langs = ['en', 'es'] as const;
export type Lang = (typeof langs)[number];

/** Prefix an absolute site path ("/", "/#work", "/work/x/") for a language. */
export const href = (lang: Lang, path: string) => (lang === 'en' ? path : `/es${path}`);

/** The same page in the other language. */
export const altPath = (lang: Lang, pathname: string) =>
  lang === 'en' ? `/es${pathname}` : pathname.replace(/^\/es(?=\/|$)/, '') || '/';

export const copy = (lang: Lang) => (lang === 'es' ? es : en);

export const ui = {
  en: {
    nav: { work: 'Work', about: 'About', contact: 'Contact' },
    home: 'Lautaro Ferrandi — home',
    menu: 'Menu',
    skip: 'Skip to content',
    backToTop: 'Back to top ↑',
    langSwitch: 'Leer en español',
    watchReel: '▶ Watch reel',
    selectedWork: 'Selected work',
    scroll: 'Scroll ↓',
    workTitle: 'Work',
    kindsOfWork: 'Kinds of work',
    about: 'About',
    aboutTitle: 'About me',
    timelineWork: 'Work',
    education: 'Education',
    getInTouch: 'Get in touch',
    contact: 'Contact',
    hiThere: 'Hi there!',
    mailSubject: 'Hi Lautaro',
    copyEmail: 'Copy email',
    copied: 'Copied ✓',
    facts: { category: 'Category', year: 'Year', client: 'Client', type: 'Type', role: 'Role', tools: 'Tools' },
    kind: { client: 'Client project', spec: 'Spec work', pitch: 'Pitch', concept: 'Concept' },
    caseH: {
      brief: 'Brief',
      challenge: 'Challenge',
      idea: 'The idea',
      process: 'Process',
      results: 'Results',
      deliverables: 'Deliverables',
      credits: 'Credits',
    },
    caseStudy: 'Case study',
    outcome: 'Outcome',
    nextIn: (s: string) => `Next in ${s}`,
    back: 'Back',
    allIn: (s: string) => `All ${s.toLowerCase()} work`,
    photos: 'photos',
    video: 'video',
    prev: 'Previous photo',
    next: 'Next photo',
  },
  es: {
    nav: { work: 'Trabajos', about: 'Sobre mí', contact: 'Contacto' },
    home: 'Lautaro Ferrandi — inicio',
    menu: 'Menú',
    skip: 'Ir al contenido',
    backToTop: 'Volver arriba ↑',
    langSwitch: 'Read in English',
    watchReel: '▶ Ver reel',
    selectedWork: 'Trabajos seleccionados',
    scroll: 'Bajar ↓',
    workTitle: 'Trabajos',
    kindsOfWork: 'Tipos de trabajo',
    about: 'Sobre mí',
    aboutTitle: 'Sobre mí',
    timelineWork: 'Experiencia',
    education: 'Formación',
    getInTouch: 'Contacto',
    contact: 'Contacto',
    hiThere: '¡Hola!',
    mailSubject: 'Hola Lautaro',
    copyEmail: 'Copiar email',
    copied: 'Copiado ✓',
    facts: { category: 'Categoría', year: 'Año', client: 'Cliente', type: 'Tipo', role: 'Rol', tools: 'Herramientas' },
    kind: { client: 'Proyecto para cliente', spec: 'Trabajo spec', pitch: 'Pitch', concept: 'Concepto' },
    caseH: {
      brief: 'Brief',
      challenge: 'Desafío',
      idea: 'La idea',
      process: 'Proceso',
      results: 'Resultados',
      deliverables: 'Entregables',
      credits: 'Créditos',
    },
    caseStudy: 'Caso de estudio',
    outcome: 'Resultado',
    nextIn: (s: string) => `Siguiente en ${s}`,
    back: 'Volver',
    allIn: (s: string) => `Toda la sección ${s}`,
    photos: 'fotos',
    video: 'video',
    prev: 'Foto anterior',
    next: 'Foto siguiente',
  },
} as const;
