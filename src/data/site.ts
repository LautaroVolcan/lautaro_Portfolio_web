// Everything text-like that isn't a project lives here, so copy edits don't require touching layout code.

export const site = {
  name: 'Lautaro Ferrandi',
  title: 'Lautaro Ferrandi — Video Editor, Motion Designer & Multimedia Artist',
  description:
    'Lautaro Ferrandi is a senior video editor and motion designer based in Barcelona: paid social, motion graphics, VJ visuals, interactive installations and documentary.',
  email: 'lautaroferrandi@gmail.com',
  cv: 'https://drive.google.com/file/d/1Pn3yrs8o7u8h14fKldFHuf7Ay09ZuEo4/view?usp=sharing',
  /** Paste a Vimeo/YouTube URL here when the reel is ready: a "Watch reel" button appears in the hero. */
  reel: '' as string,
  socials: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/lautaroferrandi/' },
    { label: 'Instagram', url: 'https://www.instagram.com/lautarovolcan/' },
    { label: 'X', url: 'https://twitter.com/LautaroVolcan' },
    { label: 'GitHub', url: 'https://github.com/LautaroVolcan' },
    { label: 'Behance', url: 'https://www.behance.net/lautaroferrandi' },
    { label: 'Telegram', url: 'https://t.me/lautaroferrandi' },
  ],
};

export const hero = {
  greeting: "Hello, I'm Lautaro",
  lines: ['Video Designer', 'and Multimedia Artist.'],
};

export const about = {
  lead: "I'm a creative and multimedia designer based in Barcelona. I take an idea from the brief to the finished piece — concept, edit, motion, 3D and AI-assisted imagery — for brands, campaigns and my own projects.",
  body: [
    'Most of my commercial work is brand content: campaigns and pieces made for the places people actually see them.',
    "I trained in Image Design at the Universidad Nacional de La Plata, in Argentina, and later added UX/UI and front-end development. That mix is how I work: I think about who the piece is for and where it will be seen before I think about how it looks, and I can build most of it myself.",
    'I use generative AI as part of the toolbox — for previs, plates, variations and speed — and keep the decisions about story, rhythm and taste on my side of the table.',
    'Alongside that I keep a personal practice — interactive installations, live visuals and documentary — with its own questions and its own pace.',
  ],
};

export const work = [
  {
    when: '2025 — 2026',
    org: 'Factorial',
    role: 'Senior Video Specialist',
    text: 'Led end-to-end video production for paid social campaigns — from creative direction and on-set supervision through to final delivery. I directed filming crews, managed post-production across multiple concurrent projects, and worked closely with marketing to define video strategy and keep assets performing across Meta, TikTok and other paid channels.',
  },
  {
    when: '2022 — 2025',
    org: 'Siel Bleu',
    role: 'Head of Audiovisual Department',
    text: 'Led the audiovisual department end-to-end — from concept and scripting through production and final delivery. Oversaw the full output of graphic and video content, and coordinated the team across each stage of the process.',
  },
  {
    when: '2020 — 2022',
    org: 'Magnus Idea',
    role: 'Video and VFX Editor',
    text: 'Worked at an audiovisual marketing agency developing concepts and producing content for major brands, with a focus on visual effects. Projects ranged from commercial spots to branded digital content.',
  },
  {
    when: '2019',
    org: 'AfonicoMusic',
    role: 'Video Producer',
    text: 'Handled the full production cycle for artists on the label — developing creative concepts and seeing them through to finished music videos, managing both production and post-production at every step.',
  },
];

export const education = [
  {
    when: '2024',
    org: 'TouchDesigner',
    role: 'Advanced Course',
    text: 'Advanced course in TouchDesigner focused on real-time visual programming and interactive media. Deepened hands-on skills in node-based workflows for live performance and installation work.',
  },
  {
    when: '2020 — 2022',
    org: 'Frontend Development',
    role: 'Course',
    text: 'Full frontend development track covering Web Development, JavaScript, and React — rounding out the technical side of my profile alongside the audiovisual work.',
  },
  {
    when: '2019',
    org: 'UX/UI Design',
    role: 'Course · Coderhouse',
    text: 'UX/UI design course covering the full product design process — user research, information architecture and user flows, wireframes, visual interface design, interactive prototypes and usability testing.',
  },
  {
    when: '2018',
    org: 'After Effects',
    role: 'Specialization',
    text: 'Intensive specialization in After Effects covering motion graphics, keyframe animation, compositing, and visual effects. Focused on building production-level skills in title design, tracking, and integrating graphics into live-action footage.',
  },
  {
    when: '2013 — 2018',
    org: 'Universidad Nacional de La Plata',
    role: 'Degree in Image Design',
    text: "Five-year degree in Image Design — a program that bridges visual theory and hands-on audiovisual production. It's where I built the foundation that still informs how I approach every project.",
  },
];

/** The three tabs of Work, in display order. */
export const sections = [
  { id: 'commercial', label: 'Commercial', blurb: 'Campaigns, brand content and creative for clients.' },
  { id: 'art', label: 'Art', blurb: 'Installations, real-time visuals, music videos and personal research.' },
  { id: 'films', label: 'Films', blurb: 'Documentary and branded films.' },
] as const;

/** Section counters styled as SMPTE timecode (HH:MM:SS:FF). */
export const tc = (n: number) => `00:00:${String(n).padStart(2, '0')}:00`;
