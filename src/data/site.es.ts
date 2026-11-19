// Spanish copy for /es/. Same shape as site.ts.
import { site as siteEn } from './site';

export { tc } from './site';

export const site = {
  ...siteEn,
  title: 'Lautaro Ferrandi — Diseñador creativo y multimedia',
  description:
    'Lautaro Ferrandi es diseñador creativo y multimedia en Barcelona: contenido de marca, edición, motion, 3D e imagen asistida por IA, además de instalaciones, visuales en vivo y documental.',
};

export const hero = {
  greeting: 'Hola, soy Lautaro',
  lines: ['Diseñador de video', 'y artista multimedia.'],
};

export const about = {
  lead: 'Soy diseñador creativo y multimedia, y vivo en Barcelona. Llevo una idea del brief a la pieza terminada —concepto, edición, motion, 3D e imagen asistida por IA— para marcas, campañas y proyectos propios.',
  body: [
    'La mayor parte de mi trabajo comercial es contenido de marca: campañas y piezas pensadas para los lugares donde la gente realmente las ve.',
    'Me formé en Diseño de Imagen en la Universidad Nacional de La Plata, en Argentina, y después sumé UX/UI y desarrollo frontend. Esa mezcla es mi forma de trabajar: antes de pensar cómo se ve una pieza, pienso para quién es y dónde se va a ver, y puedo construir casi todo yo mismo.',
    'Uso la IA generativa como una herramienta más —para previsualizar, generar fondos y variaciones, y ganar velocidad— y las decisiones de historia, ritmo y gusto las sigo tomando yo.',
    'En paralelo tengo una práctica personal —instalaciones interactivas, visuales en vivo y documental— con sus propias preguntas y su propio ritmo.',
  ],
};

export const work = [
  {
    when: '2025 — 2026',
    org: 'Factorial',
    role: 'Senior Video Specialist',
    text: 'Dirigí la producción de video de punta a punta para campañas de paid social, desde la dirección creativa y la supervisión en rodaje hasta la entrega final. Coordiné equipos de filmación, gestioné la postproducción de varios proyectos en simultáneo y trabajé con marketing para definir la estrategia de video y mantener el rendimiento de las piezas en Meta, TikTok y otros canales pagos.',
  },
  {
    when: '2022 — 2025',
    org: 'Siel Bleu',
    role: 'Responsable del departamento audiovisual',
    text: 'Dirigí el departamento audiovisual de punta a punta, del concepto y el guion a la producción y la entrega final. Supervisé toda la producción de contenido gráfico y de video, y coordiné al equipo en cada etapa del proceso.',
  },
  {
    when: '2020 — 2022',
    org: 'Magnus Idea',
    role: 'Editor de video y VFX',
    text: 'Trabajé en una agencia de marketing audiovisual desarrollando conceptos y produciendo contenido para grandes marcas, con foco en efectos visuales. Los proyectos iban de spots comerciales a contenido digital de marca.',
  },
  {
    when: '2019',
    org: 'AfonicoMusic',
    role: 'Productor de video',
    text: 'Me ocupé del ciclo completo de producción para los artistas del sello: desarrollar los conceptos creativos y llevarlos hasta el videoclip terminado, a cargo de la producción y la postproducción en cada paso.',
  },
];

export const education = [
  {
    when: '2024',
    org: 'TouchDesigner',
    role: 'Curso avanzado',
    text: 'Curso avanzado de TouchDesigner centrado en programación visual en tiempo real y medios interactivos. Profundicé en el trabajo con nodos para performance en vivo e instalaciones.',
  },
  {
    when: '2020 — 2022',
    org: 'Desarrollo frontend',
    role: 'Curso',
    text: 'Formación completa en desarrollo frontend —desarrollo web, JavaScript y React— que completa el lado técnico de mi perfil junto al trabajo audiovisual.',
  },
  {
    when: '2019',
    org: 'Diseño UX/UI',
    role: 'Curso · Coderhouse',
    text: 'Curso de diseño UX/UI que recorre todo el proceso de diseño de producto: investigación de usuarios, arquitectura de la información y flujos, wireframes, diseño visual de interfaces, prototipos interactivos y pruebas de usabilidad.',
  },
  {
    when: '2018',
    org: 'After Effects',
    role: 'Especialización',
    text: 'Especialización intensiva en After Effects: motion graphics, animación por keyframes, composición y efectos visuales, con foco en diseño de títulos, tracking e integración de gráficos en imagen real a nivel profesional.',
  },
  {
    when: '2013 — 2018',
    org: 'Universidad Nacional de La Plata',
    role: 'Carrera de Diseño de Imagen',
    text: 'Carrera de cinco años que une la teoría de la imagen con la producción audiovisual práctica. Ahí construí la base que todavía guía cómo encaro cada proyecto.',
  },
];

export const sections = [
  { id: 'commercial', label: 'Comercial', blurb: 'Campañas, contenido de marca y creatividad para clientes.' },
  { id: 'art', label: 'Arte', blurb: 'Instalaciones, visuales en tiempo real, videoclips e investigación personal.' },
  { id: 'films', label: 'Films', blurb: 'Documentales y films de marca.' },
] as const;
