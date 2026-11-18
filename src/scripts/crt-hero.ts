// Hero: a CRT monitor in a 3D scene, playing the hero video, over a liquid gradient.
//
// - Background: domain-warped noise mapped to a palette taken from the references
//   (red/orange/pink/teal/green/lavender), rendered at low resolution so it stays soft
//   and cheap, then upscaled with grain. The left side is darkened so the headline reads.
// - Monitor: built from primitives (no model to download). Pearl body with iridescence and
//   clearcoat that reflects the same gradient (it doubles as the environment map).
// - Screen: the video through a CRT shader (scanlines, RGB split, vignette) with a
//   power-on animation. A thin glass layer on top catches reflections.
// - Pointer turns the monitor a little, scroll tilts it away.

import {
  ACESFilmicToneMapping,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HalfFloatType,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  TextureLoader,
  VideoTexture,
  WebGLRenderTarget,
  WebGLRenderer,
  EquirectangularReflectionMapping,
  UVMapping,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* ---------------------------------------------------------------- shaders */

const fullscreenVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fluidFrag = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = r * p * 1.9; a *= 0.45; }
    return v;
  }

  // palette from the references, in display (sRGB) values
  vec3 palette(float t) {
    vec3 c0 = vec3(0.10, 0.30, 0.24);  // deep green
    vec3 c1 = vec3(0.25, 0.72, 0.66);  // teal
    vec3 c2 = vec3(0.95, 0.62, 0.72);  // pink
    vec3 c3 = vec3(0.70, 0.22, 0.19);  // brand red
    vec3 c4 = vec3(1.00, 0.48, 0.18);  // orange
    vec3 c5 = vec3(1.00, 0.85, 0.66);  // cream
    vec3 c6 = vec3(0.56, 0.55, 0.95);  // lavender
    t = fract(t);
    float s = t * 7.0;
    vec3 a = c0, b = c1;
    if (s < 1.0) { a = c0; b = c1; }
    else if (s < 2.0) { a = c1; b = c2; }
    else if (s < 3.0) { a = c2; b = c3; }
    else if (s < 4.0) { a = c3; b = c4; }
    else if (s < 5.0) { a = c4; b = c5; }
    else if (s < 6.0) { a = c5; b = c6; }
    else { a = c6; b = c0; }
    return mix(a, b, smoothstep(0.0, 1.0, fract(s)));
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect * 0.55, vUv.y * 1.15) * 0.75;
    float t = uTime * 0.035;
    p += (uMouse - 0.5) * 0.15;

    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 1.8 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p + 1.8 * q + vec2(8.3, 2.8) - t * 1.1));
    float f = fbm(p + 2.2 * r);

    vec3 col = palette(f * 1.6 + r.x * 0.6 - 0.45);
    // glossy streaks, like long-exposure light
    float band = (f + r.y) * 5.0 + t * 3.0;
    float streak = pow(abs(sin(band)), 26.0) + 0.5 * pow(abs(sin(band * 1.7 + 1.3)), 40.0);
    col += vec3(1.0, 0.93, 0.86) * streak * 0.28;
    // soft shadows inside the folds
    col *= 0.62 + 0.6 * smoothstep(0.2, 0.8, f);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const compositeFrag = /* glsl */ `
  uniform sampler2D uFluid;
  uniform float uTime;
  uniform float uDarkLeft;  // 1 on desktop: darken behind the headline
  uniform float uFade;      // scroll: darken everything
  varying vec2 vUv;
  float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec3 col = texture2D(uFluid, vUv).rgb;
    // keep the headline readable: fade to near-black on the left (desktop) / bottom (mobile)
    float leftMask = mix(1.0, smoothstep(0.02, 0.72, vUv.x), uDarkLeft);
    float bottomMask = mix(smoothstep(0.0, 0.62, vUv.y), 1.0, uDarkLeft);
    float topMask = smoothstep(0.98, 0.84, vUv.y) * 0.6 + 0.4;
    col = mix(vec3(0.039), col, leftMask * bottomMask * topMask * 0.95);
    col *= 1.0 - uFade * 0.85;
    col += (rand(vUv * 913.0 + uTime) - 0.5) * 0.045;  // film grain
    gl_FragColor = vec4(col, 1.0);
  }
`;

const screenVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const screenFrag = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uOn;          // 0 → 1 power-on
  uniform float uTexAspect;
  uniform float uScreenAspect;
  varying vec2 vUv;
  float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    vec2 c = uv - 0.5;
    vec2 s = uScreenAspect > uTexAspect ? vec2(1.0, uTexAspect / uScreenAspect) : vec2(uScreenAspect / uTexAspect, 1.0);
    vec2 tuv = (uv - 0.5) * s + 0.5;
    // tiny horizontal wobble
    tuv.x += sin(uv.y * 180.0 + uTime * 6.0) * 0.0009;

    float split = 0.0025 + 0.0015 * sin(uTime * 1.3);
    vec3 col = vec3(
      texture2D(uTex, tuv + vec2(split, 0.0)).r,
      texture2D(uTex, tuv).g,
      texture2D(uTex, tuv - vec2(split, 0.0)).b
    );
    float scan = 0.82 + 0.18 * sin(uv.y * 420.0);
    col *= scan;
    col *= clamp(1.0 - 0.55 * pow(length(c * vec2(1.0, 1.1)) * 1.45, 2.4), 0.25, 1.0);
    col += (rand(uv * 600.0 + uTime) - 0.5) * 0.05;
    col = col * 1.12 + 0.015;

    // power-on: a bright line opens vertically, then the picture settles
    float openY = smoothstep(0.08, 0.55, uOn);
    float openX = smoothstep(0.0, 0.12, uOn);
    float inside = step(abs(c.y), 0.5 * max(openY, 0.006)) * step(abs(c.x), 0.5 * max(openX, 0.02));
    col = mix(vec3(1.0, 0.97, 0.92) * 1.6, col, smoothstep(0.45, 1.0, uOn));
    col *= inside;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ------------------------------------------------------------------- init */

interface Options {
  stage: HTMLElement;
  video: HTMLVideoElement;
}

export function initCrtHero({ stage, video }: Options) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.autoClear = false;

  /* background: fluid at low res → composite with grain */
  const ortho = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new PlaneGeometry(2, 2);
  const fluidMat = new ShaderMaterial({
    vertexShader: fullscreenVert,
    fragmentShader: fluidFrag,
    uniforms: { uTime: { value: 0 }, uAspect: { value: 1 }, uMouse: { value: [0.5, 0.5] } },
    depthTest: false,
    depthWrite: false,
  });
  const fluidScene = new Scene();
  fluidScene.add(new Mesh(quad, fluidMat));
  const fluidRT = new WebGLRenderTarget(256, 256, { type: HalfFloatType, magFilter: LinearFilter, minFilter: LinearFilter });

  const compositeMat = new ShaderMaterial({
    vertexShader: fullscreenVert,
    fragmentShader: compositeFrag,
    uniforms: {
      uFluid: { value: fluidRT.texture },
      uTime: { value: 0 },
      uDarkLeft: { value: 1 },
      uFade: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const bgScene = new Scene();
  bgScene.add(new Mesh(quad, compositeMat));

  /* 3D scene */
  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 7);

  const pmrem = new PMREMGenerator(renderer);
  let envRT: WebGLRenderTarget | null = null;
  const refreshEnv = () => {
    // the background gradient doubles as the environment the monitor reflects
    fluidRT.texture.mapping = EquirectangularReflectionMapping;
    const next = pmrem.fromEquirectangular(fluidRT.texture);
    fluidRT.texture.mapping = UVMapping;
    scene.environment = next.texture;
    envRT?.dispose();
    envRT = next;
  };

  scene.add(new DirectionalLight(new Color('#ffd2b0'), 1.2).translateX(-3).translateY(4).translateZ(5));
  const rim = new DirectionalLight(new Color('#7fe0d0'), 2.2);
  rim.position.set(4, 1, -3);
  scene.add(rim);
  const pinkFill = new DirectionalLight(new Color('#f06aa0'), 1.6);
  pinkFill.position.set(-5, -1, 2);
  scene.add(pinkFill);
  const warmUnder = new DirectionalLight(new Color('#ff7a2e'), 1.3);
  warmUnder.position.set(1, -4, 3);
  scene.add(warmUnder);

  const monitor = new Group();
  const tilt = new Group(); // pointer + scroll rotations
  tilt.add(monitor);
  scene.add(tilt);

  const body = new MeshPhysicalMaterial({
    color: new Color('#e4ded6'),
    roughness: 0.16,
    metalness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    iridescence: 1,
    iridescenceIOR: 1.35,
    iridescenceThicknessMinimum: 220,
    iridescenceThicknessMaximum: 900,
    envMapIntensity: 2.1,
  });
  const dark = new MeshPhysicalMaterial({ color: new Color('#141414'), roughness: 0.45, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.3 });

  // case
  const W = 1.7, H = 1.36, D = 0.55;
  const front = new Mesh(new RoundedBoxGeometry(W, H, D, 6, 0.14), body);
  monitor.add(front);
  // tapered tube at the back
  const tubeGeo = new CylinderGeometry(0.42, 0.78, 0.95, 4, 1);
  tubeGeo.rotateY(Math.PI / 4);
  tubeGeo.rotateX(-Math.PI / 2);
  const tube = new Mesh(tubeGeo, body);
  tube.scale.set(1.12, 0.92, 1);
  tube.position.z = -D / 2 - 0.42;
  monitor.add(tube);
  // bezel (dark recess around the glass)
  const bezel = new Mesh(new RoundedBoxGeometry(W * 0.84, H * 0.78, 0.06, 4, 0.05), dark);
  bezel.position.set(0, H * 0.06, D / 2 - 0.01);
  monitor.add(bezel);
  // control strip: knobs + red power LED (brand red)
  for (const x of [0.48, 0.64]) {
    const knob = new Mesh(new CylinderGeometry(0.045, 0.045, 0.05, 24), dark);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(x, -H / 2 + 0.11, D / 2 + 0.02);
    monitor.add(knob);
  }
  const led = new Mesh(new SphereGeometry(0.022, 16, 16), new MeshBasicMaterial({ color: new Color('#ff3b2f') }));
  led.position.set(-0.66, -H / 2 + 0.11, D / 2 + 0.01);
  monitor.add(led);
  // foot
  const foot = new Mesh(new RoundedBoxGeometry(W * 0.62, 0.1, D * 1.25, 4, 0.04), body);
  foot.position.set(0, -H / 2 - 0.07, -0.15);
  monitor.add(foot);

  // screen: a slightly bulged plane
  const SW = W * 0.74, SH = H * 0.66;
  const screenGeo = new PlaneGeometry(SW, SH, 40, 30);
  const pos = screenGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (SW / 2), y = pos.getY(i) / (SH / 2);
    pos.setZ(i, 0.045 * (1 - (x * x * 0.5 + y * y * 0.5)));
  }
  screenGeo.computeVertexNormals();

  let videoTex: Texture = new TextureLoader().load(video.poster);
  videoTex.colorSpace = SRGBColorSpace;
  const screenMat = new ShaderMaterial({
    vertexShader: screenVert,
    fragmentShader: screenFrag,
    uniforms: {
      uTex: { value: videoTex },
      uTime: { value: 0 },
      uOn: { value: reduce ? 1 : 0 },
      uTexAspect: { value: 1 },
      uScreenAspect: { value: SW / SH },
    },
    toneMapped: false,
  });
  const screen = new Mesh(screenGeo, screenMat);
  screen.position.set(0, H * 0.06, D / 2 + 0.03); // in front of the bezel face
  monitor.add(screen);
  const useVideo = () => {
    if (videoTex instanceof VideoTexture) return;
    const vt = new VideoTexture(video);
    vt.colorSpace = SRGBColorSpace;
    videoTex = vt;
    screenMat.uniforms.uTex.value = vt;
    screenMat.uniforms.uTexAspect.value = video.videoWidth / video.videoHeight || 1;
  };
  if (!video.paused && video.readyState >= 2) useVideo();
  video.addEventListener('playing', useVideo);

  // glass on top of the screen: only reflections
  const glass = new Mesh(
    screenGeo,
    new MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.12, envMapIntensity: 2.2, depthWrite: false }),
  );
  glass.position.copy(screen.position);
  glass.position.z += 0.012;
  monitor.add(glass);

  /* layout ----------------------------------------------------------------- */
  let width = 0, height = 0, mobile = false;
  const base = { x: 0, y: 0, s: 1 };
  function layout() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    mobile = width < 900;
    const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const visW = visH * camera.aspect;
    if (mobile) {
      base.s = Math.min((visW * 0.72) / W, (visH * 0.34) / H);
      base.x = 0;
      base.y = visH * 0.2;
    } else {
      base.s = Math.min((visH * 0.46) / H, (visW * 0.3) / W);
      base.x = visW * 0.27;
      base.y = -visH * 0.01;
    }
    monitor.scale.setScalar(base.s);
    tilt.position.set(base.x, base.y, 0);
    compositeMat.uniforms.uDarkLeft.value = mobile ? 0 : 1;
    fluidMat.uniforms.uAspect.value = camera.aspect;
    // fluid resolution: a third of the screen keeps it soft and cheap
    const fw = Math.max(64, Math.round((width * dpr) / 3));
    const fh = Math.max(64, Math.round((height * dpr) / 3));
    fluidRT.setSize(fw, fh);
  }

  stage.prepend(canvas);
  layout();

  /* input ------------------------------------------------------------------ */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  });
  stage.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
  });
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 120);
  });

  /* loop: only while visible ----------------------------------------------- */
  let visible = true;
  let running = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  }).observe(stage);
  document.addEventListener('visibilitychange', () => !document.hidden && start());

  const t0 = performance.now();
  let lastEnv = -10;
  let firstFrame = true;

  function frame(now: number) {
    if (!visible || document.hidden) {
      running = false;
      return;
    }
    const t = (now - t0) / 1000;
    const scroll = Math.min(1, Math.max(0, window.scrollY / (height * 0.9)));

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    // background
    fluidMat.uniforms.uTime.value = reduce ? 8 : t;
    fluidMat.uniforms.uMouse.value = [pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5];
    renderer.setRenderTarget(fluidRT);
    renderer.render(fluidScene, ortho);
    renderer.setRenderTarget(null);
    if (firstFrame || (!reduce && t - lastEnv > 2.5)) {
      refreshEnv();
      lastEnv = t;
      firstFrame = false;
    }
    compositeMat.uniforms.uTime.value = t;
    compositeMat.uniforms.uFade.value = scroll;

    // monitor motion
    const float = reduce ? 0 : Math.sin(t * 0.8) * 0.04;
    tilt.rotation.y = -0.52 + pointer.x * 0.3 + (mobile ? 0.3 : 0);
    tilt.rotation.x = 0.06 + pointer.y * 0.16 + scroll * 0.7;
    tilt.position.y = base.y + float - scroll * 0.9;
    tilt.rotation.z = reduce ? 0 : Math.sin(t * 0.5) * 0.012;

    screenMat.uniforms.uTime.value = t;
    if (!reduce) screenMat.uniforms.uOn.value = Math.min(1, Math.max(0, (t - 0.5) / 1.3));

    renderer.clear();
    renderer.render(bgScene, ortho);
    renderer.clearDepth();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }
  stage.classList.add('has-webgl');
  start();

}
