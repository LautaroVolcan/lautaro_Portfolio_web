// Liquid gradient background shared by the hero and the Work section.
// Plain WebGL (no three.js): one fullscreen fragment shader on a fixed canvas, rendered at a
// third of the screen resolution (the browser upscales it smoothly, which is the soft look we
// want) and at ~30 fps. It pauses whenever neither the hero nor Work is on screen.

const vert = `#version 300 es
in vec2 p;
out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const frag = `#version 300 es
precision highp float;
uniform float uTime;
uniform float uAspect;
uniform vec2 uMouse;
in vec2 vUv;
out vec4 outColor;

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
// palette taken from the references (display values)
vec3 palette(float t) {
  vec3 c[7] = vec3[7](
    vec3(0.10, 0.30, 0.24),  // deep green
    vec3(0.25, 0.72, 0.66),  // teal
    vec3(0.95, 0.62, 0.72),  // pink
    vec3(0.70, 0.22, 0.19),  // brand red
    vec3(1.00, 0.48, 0.18),  // orange
    vec3(1.00, 0.85, 0.66),  // cream
    vec3(0.56, 0.55, 0.95)   // lavender
  );
  float s = fract(t) * 7.0;
  int i = int(floor(s));
  return mix(c[i], c[(i + 1) % 7], smoothstep(0.0, 1.0, fract(s)));
}
void main() {
  vec2 p = vec2(vUv.x * uAspect * 0.55, vUv.y * 1.15) * 0.75;
  float t = uTime * 0.035;
  p += (uMouse - 0.5) * 0.12;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 1.8 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p + 1.8 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm(p + 2.2 * r);
  vec3 col = palette(f * 1.6 + r.x * 0.6 - 0.45);
  float band = (f + r.y) * 5.0 + t * 3.0;
  float streak = pow(abs(sin(band)), 26.0) + 0.5 * pow(abs(sin(band * 1.7 + 1.3)), 40.0);
  col += vec3(1.0, 0.93, 0.86) * streak * 0.28;
  col *= 0.62 + 0.6 * smoothstep(0.2, 0.8, f);
  outColor = vec4(col, 1.0);
}`;

export function initFluidBackground(sections: HTMLElement[]) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'fluid-bg';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  try {
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch {
    return; // the CSS gradient fallback stays
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uAspect = gl.getUniformLocation(prog, 'uAspect');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  const resize = () => {
    const w = Math.max(64, Math.round(window.innerWidth / 3));
    const h = Math.max(64, Math.round(window.innerHeight / 3));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform1f(uAspect, window.innerWidth / window.innerHeight);
  };
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1 - e.clientY / window.innerHeight;
  }, { passive: true });

  document.body.prepend(canvas);
  document.documentElement.classList.add('has-fluid');

  // run only while one of the sections that show it is on screen
  const onScreen = new Set<Element>();
  let running = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
    if (onScreen.size) start();
  });
  sections.forEach((s) => io.observe(s));
  document.addEventListener('visibilitychange', () => !document.hidden && start());

  const t0 = performance.now();
  let last = 0;
  const draw = (now: number) => {
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    gl.uniform1f(uTime, reduce ? 8 : (now - t0) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  function frame(now: number) {
    if (!onScreen.size || document.hidden) {
      running = false;
      return;
    }
    if (now - last > 33) {
      draw(now);
      last = now;
    }
    requestAnimationFrame(frame);
  }
  function start() {
    if (reduce) {
      draw(performance.now());
      return;
    }
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }
  draw(performance.now());
}
