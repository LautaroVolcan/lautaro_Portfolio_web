// Hero "Señal": the dot grid becomes a screen.
// Every dot of the grid is a GL point. Dots inside the "screen" rectangle sample the hero
// video and turn into a halftone of it; the cursor pushes dots away and tints them red;
// on load the dots assemble from noise ("connecting"), on scroll they scatter again.

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LinearFilter,
  OrthographicCamera,
  Points,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  VideoTexture,
  WebGLRenderer,
} from 'three';

const vertex = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uScatter;
  uniform float uTime;
  uniform float uDpr;
  uniform float uSpacing;
  uniform vec3 uIdle;
  uniform vec3 uRed;

  attribute vec2 aUv;      // uv inside the screen rect, or (-1, -1) for idle grid dots
  attribute vec3 aRand;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = position.xy;
    bool inside = aUv.x >= 0.0;

    vec3 col = uIdle;
    float size = 3.0;

    if (inside) {
      vec3 tex = texture2D(uTex, aUv).rgb;
      // textures are decoded to linear; measure brightness perceptually
      float lum = dot(pow(tex, vec3(0.4545)), vec3(0.299, 0.587, 0.114));
      col = tex;
      size = mix(1.2, uSpacing * 1.05, pow(smoothstep(0.04, 0.95, lum), 1.7));
    }

    // cursor: push dots outward and heat them up
    vec2 toP = p - uMouse;
    float d = length(toP);
    float radius = 140.0;
    float f = smoothstep(radius, 0.0, d) * uMouseStrength;
    p += (d > 0.001 ? toP / d : vec2(0.0)) * f * 26.0;
    size *= 1.0 + f * 0.7;
    col = mix(col, uRed, f * (inside ? 0.55 : 0.9));

    // scatter (intro + scroll): drift along a per-dot direction with a little turbulence
    float s = uScatter * uScatter;
    vec2 dir = normalize(aRand.xy - 0.5 + 0.0001);
    float wobble = sin(uTime * 0.8 + aRand.z * 6.2831) * 0.5 + 0.5;
    p += dir * s * (120.0 + aRand.z * 520.0) + vec2(0.0, -s * 160.0 * wobble);
    size *= 1.0 - s * 0.6;

    vColor = col;
    vAlpha = (inside ? 1.0 : 0.85) * (1.0 - s * 0.95);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
    gl_PointSize = max(size, 1.0) * uDpr;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.36, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;

interface Options {
  stage: HTMLElement;   // element the canvas fills (the hero)
  video: HTMLVideoElement;
  poster: string;
}

export function initHeroParticles({ stage, video, poster }: Options) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return; // no WebGL: the static video + CSS grid stay
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, 1, -10, 10);

  // Start from the poster; switch to the live video as soon as it plays.
  let texture: Texture = new TextureLoader().load(poster);
  texture.colorSpace = SRGBColorSpace;
  const useVideo = () => {
    if (texture instanceof VideoTexture) return;
    const vt = new VideoTexture(video);
    vt.colorSpace = SRGBColorSpace;
    vt.minFilter = vt.magFilter = LinearFilter;
    texture = vt;
    material.uniforms.uTex.value = vt;
  };
  if (!video.paused && video.readyState >= 2) queueMicrotask(useVideo);
  video.addEventListener('playing', useVideo);

  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthTest: false,
    uniforms: {
      uTex: { value: texture },
      uMouse: { value: [-9999, -9999] },
      uMouseStrength: { value: 0 },
      uScatter: { value: reduce ? 0 : 1 },
      uTime: { value: 0 },
      uDpr: { value: dpr },
      uSpacing: { value: 10 },
      uIdle: { value: new Color('#4a4843') },
      uRed: { value: new Color('#e0574c') },
    },
  });

  let points: Points | null = null;
  let width = 0;
  let height = 0;

  function build() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    renderer.setSize(width, height, false);
    camera.right = width;
    camera.bottom = height;
    camera.updateProjectionMatrix();

    const mobile = width < 900;
    const spacing = mobile ? 8 : 10;
    material.uniforms.uSpacing.value = spacing;

    // The "screen": a square on the right on desktop, centered and full-width on mobile.
    // On mobile the screen sits under the header and the text drops below it.
    const side = mobile ? Math.min(width * 0.92, height * 0.46) : Math.min(width * 0.47, height * 0.78);
    const sx = mobile ? (width - side) / 2 : width - side - Math.max(24, width * 0.04);
    const sy = mobile ? 80 : (height - side) / 2 + height * 0.03;

    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    const n = cols * rows;
    const pos = new Float32Array(n * 3);
    const uv = new Float32Array(n * 2);
    const rnd = new Float32Array(n * 3);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * spacing + spacing / 2;
        const y = r * spacing + spacing / 2;
        pos.set([x, y, 0], i * 3);
        const u = (x - sx) / side;
        const v = 1 - (y - sy) / side;
        const inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;
        // outside the screen keep a sparser grid (every other dot), like the original dot pattern
        if (!inside && (r % 2 || c % 2)) continue;
        uv.set(inside ? [u, v] : [-1, -1], i * 2);
        rnd.set([Math.random(), Math.random(), Math.random()], i * 3);
        i++;
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos.subarray(0, i * 3), 3));
    geo.setAttribute('aUv', new BufferAttribute(uv.subarray(0, i * 2), 2));
    geo.setAttribute('aRand', new BufferAttribute(rnd.subarray(0, i * 3), 3));

    if (points) {
      points.geometry.dispose();
      points.geometry = geo;
    } else {
      points = new Points(geo, material);
      points.frustumCulled = false;
      scene.add(points);
    }
  }

  stage.prepend(canvas);
  build();
  stage.classList.add('has-webgl');

  // --- input ---------------------------------------------------------------
  let mouseTarget = 0;
  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    material.uniforms.uMouse.value = [e.clientX - rect.left, e.clientY - rect.top];
    mouseTarget = 1;
  };
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', () => (mouseTarget = 0));

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(build, 150);
  });

  // --- loop: only while the hero is on screen and the tab is visible ---------
  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) start();
  });

  const t0 = performance.now();
  const introMs = reduce ? 0 : 1800;
  let raf = 0;
  let running = false;

  function frame(now: number) {
    if (!visible || document.hidden) {
      running = false;
      return;
    }
    const t = (now - t0) / 1000;
    const intro = introMs ? Math.max(0, 1 - (now - t0) / introMs) : 0;
    const introEased = intro * intro * (3 - 2 * intro);
    const scroll = Math.min(1, Math.max(0, window.scrollY / (height * 0.85)));
    const u = material.uniforms;
    u.uTime.value = t;
    u.uScatter.value = reduce ? 0 : Math.max(introEased, scroll);
    u.uMouseStrength.value += (mouseTarget - u.uMouseStrength.value) * 0.08;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  start();

  return () => {
    cancelAnimationFrame(raf);
    renderer.dispose();
  };
}
