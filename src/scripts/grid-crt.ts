// Work grid, "Monitores" (light version): one shared WebGL canvas floats over the hovered
// card and redraws its image (or its loop video) through a CRT shader: RGB split, scanlines,
// a little barrel distortion and flicker. One canvas for the whole grid keeps it cheap.

import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Texture,
  VideoTexture,
  WebGLRenderer,
} from 'three';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uHover;
  uniform float uTime;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform vec2 uMouse;      // 0..1 inside the card
  uniform float uLines;     // scanline count
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    vec2 s = uPlaneAspect > uImageAspect
      ? vec2(1.0, uImageAspect / uPlaneAspect)
      : vec2(uPlaneAspect / uImageAspect, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    vec2 c = uv - 0.5;
    // barrel distortion
    uv = 0.5 + c * (1.0 + dot(c, c) * 0.18 * uHover);

    // horizontal jitter band that rolls down the screen
    float band = smoothstep(0.0, 0.02, abs(fract(uv.y - uTime * 0.18) - 0.5) - 0.47);
    uv.x += (1.0 - band) * 0.012 * uHover;

    // RGB split grows with hover and with the cursor's distance from center
    float split = (0.004 + 0.01 * length(uMouse - 0.5)) * uHover;
    vec2 dir = normalize(uMouse - 0.5 + 0.0001);
    vec2 base = coverUv(uv);
    float r = texture2D(uTex, base + dir * split).r;
    float g = texture2D(uTex, base).g;
    float b = texture2D(uTex, base - dir * split).b;
    vec3 col = vec3(r, g, b);

    // scanlines + flicker + vignette
    float scan = 0.5 + 0.5 * sin(uv.y * uLines * 3.14159);
    col *= mix(1.0, 0.72 + 0.28 * scan, uHover);
    col *= 1.0 - 0.04 * uHover * rand(vec2(uTime, uv.y));
    col *= 1.0 - smoothstep(0.35, 0.75, length(c)) * 0.55 * uHover;

    // outside the curved screen: black
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function initGridCrt(cards: HTMLElement[]) {
  const canvas = document.createElement('canvas');
  canvas.className = 'crt-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false });
  } catch {
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  document.body.append(canvas);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uTex: { value: null as Texture | null },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uImageAspect: { value: 1 },
      uPlaneAspect: { value: 1 },
      uMouse: { value: [0.5, 0.5] },
      uLines: { value: 220 },
    },
  });
  scene.add(new Mesh(new PlaneGeometry(2, 2), material));

  // Textures are built from a separate CORS-mode copy of each cover, so the effect also works
  // when images are served from another host (a CDN, a preview server that redirects).
  // If a cover can't be read safely, that card simply gets no effect: never a black box.
  const textures = new Map<HTMLElement, { tex: Texture; aspect: number }>();
  function prepare(card: HTMLElement) {
    const img = card.querySelector<HTMLImageElement>('[data-card-img]');
    if (!img) return;
    const src = img.currentSrc || img.src;
    if (!src) return;
    const copy = new Image();
    copy.crossOrigin = 'anonymous';
    copy.decoding = 'async';
    copy.onload = () => {
      const off = document.createElement('canvas');
      off.width = copy.naturalWidth;
      off.height = copy.naturalHeight;
      const ctx = off.getContext('2d');
      if (!ctx) return;
      try {
        ctx.drawImage(copy, 0, 0);
        ctx.getImageData(0, 0, 1, 1); // throws if the canvas is tainted
      } catch {
        return;
      }
      const tex = new CanvasTexture(off);
      tex.colorSpace = SRGBColorSpace;
      tex.minFilter = LinearFilter;
      tex.generateMipmaps = false;
      textures.set(card, { tex, aspect: copy.naturalWidth / copy.naturalHeight });
    };
    copy.src = src;
  }
  function textureFor(card: HTMLElement): { tex: Texture; aspect: number } | null {
    const video = card.querySelector<HTMLVideoElement>('[data-card-loop]');
    if (video && video.readyState >= 2 && video.classList.contains('is-playing')) {
      const tex = new VideoTexture(video);
      tex.colorSpace = SRGBColorSpace;
      return { tex, aspect: video.videoWidth / video.videoHeight || 1 };
    }
    return textures.get(card) ?? null;
  }

  let active: HTMLElement | null = null;
  let target = 0;
  let raf = 0;
  let running = false;
  const t0 = performance.now();

  function place() {
    if (!active) return;
    const media = active.querySelector<HTMLElement>('[data-card-media]')!;
    const r = media.getBoundingClientRect();
    canvas.style.transform = `translate(${r.left}px, ${r.top}px)`;
    if (canvas.width !== Math.round(r.width * dpr) || canvas.height !== Math.round(r.height * dpr)) {
      renderer.setSize(r.width, r.height, true);
    }
    material.uniforms.uPlaneAspect.value = r.width / r.height;
  }

  function frame(now: number) {
    const u = material.uniforms;
    u.uHover.value += (target - u.uHover.value) * 0.12;
    u.uTime.value = (now - t0) / 1000;
    place();
    renderer.render(scene, camera);
    if (target === 0 && u.uHover.value < 0.01) {
      canvas.classList.remove('is-on');
      active?.classList.remove('crt-active');
      active = null;
      running = false;
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  cards.forEach((card) => {
    const img = card.querySelector<HTMLImageElement>('[data-card-img]');
    if (img?.complete) prepare(card);
    else img?.addEventListener('load', () => prepare(card), { once: true });

    card.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      const t = textureFor(card);
      if (!t) return;
      active?.classList.remove('crt-active');
      active = card;
      material.uniforms.uTex.value = t.tex;
      material.uniforms.uImageAspect.value = t.aspect;
      target = 1;
      place();
      canvas.classList.add('is-on');
      card.classList.add('crt-active');
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    });
    card.addEventListener('pointermove', (e) => {
      if (card !== active) return;
      const r = card.querySelector<HTMLElement>('[data-card-media]')!.getBoundingClientRect();
      material.uniforms.uMouse.value = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    });
    card.addEventListener('pointerleave', () => {
      if (card === active) target = 0;
    });
  });

  return () => {
    cancelAnimationFrame(raf);
    renderer.dispose();
  };
}
