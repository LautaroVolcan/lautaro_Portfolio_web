function e(e){let t=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,n=document.createElement(`canvas`);n.className=`fluid-bg`,n.setAttribute(`aria-hidden`,`true`);let r=n.getContext(`webgl2`,{antialias:!1,alpha:!1,powerPreference:`low-power`});if(!r)return;let i=(e,t)=>{let n=r.createShader(e);if(r.shaderSource(n,t),r.compileShader(n),!r.getShaderParameter(n,r.COMPILE_STATUS))throw Error(r.getShaderInfoLog(n)??`shader`);return n},a=r.createProgram();try{if(r.attachShader(a,i(r.VERTEX_SHADER,`#version 300 es
in vec2 p;
out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`)),r.attachShader(a,i(r.FRAGMENT_SHADER,`#version 300 es
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
  col *= 0.68;  // overall dimmer, so folders and text sit on top of it
  outColor = vec4(col, 1.0);
}`)),r.linkProgram(a),!r.getProgramParameter(a,r.LINK_STATUS))throw Error(`link`)}catch{return}r.useProgram(a);let o=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,o),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW);let s=r.getAttribLocation(a,`p`);r.enableVertexAttribArray(s),r.vertexAttribPointer(s,2,r.FLOAT,!1,0,0);let c=r.getUniformLocation(a,`uTime`),l=r.getUniformLocation(a,`uAspect`),u=r.getUniformLocation(a,`uMouse`),d=()=>{let e=Math.max(64,Math.round(window.innerWidth/3)),t=Math.max(64,Math.round(window.innerHeight/3));n.width=e,n.height=t,r.viewport(0,0,e,t),r.uniform1f(l,window.innerWidth/window.innerHeight)};d(),window.addEventListener(`resize`,d);let f={x:.5,y:.5,tx:.5,ty:.5};window.addEventListener(`pointermove`,e=>{f.tx=e.clientX/window.innerWidth,f.ty=1-e.clientY/window.innerHeight},{passive:!0}),document.body.prepend(n),document.documentElement.classList.add(`has-fluid`);let p=new Set,m=!1,h=new IntersectionObserver(e=>{e.forEach(e=>e.isIntersecting?p.add(e.target):p.delete(e.target)),p.size&&b()});e.forEach(e=>h.observe(e)),document.addEventListener(`visibilitychange`,()=>!document.hidden&&b());let g=performance.now(),_=0,v=e=>{f.x+=(f.tx-f.x)*.05,f.y+=(f.ty-f.y)*.05,r.uniform1f(c,t?8:(e-g)/1e3),r.uniform2f(u,f.x,f.y),r.drawArrays(r.TRIANGLES,0,3)};function y(e){!p.size||document.hidden?m=!1:(e-_>33&&(v(e),_=e),requestAnimationFrame(y))}function b(){t?v(performance.now()):m||(m=!0,requestAnimationFrame(y))}v(performance.now())}var t=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,n=document.querySelector(`[data-header]`),r=()=>n?.classList.toggle(`is-scrolled`,window.scrollY>24);r(),window.addEventListener(`scroll`,r,{passive:!0});var i=document.querySelector(`[data-menu-toggle]`),a=document.getElementById(`site-nav`);i?.addEventListener(`click`,()=>{let e=a?.classList.toggle(`is-open`)??!1;i.setAttribute(`aria-expanded`,String(e))}),a?.querySelectorAll(`a`).forEach(e=>e.addEventListener(`click`,()=>{a.classList.remove(`is-open`),i?.setAttribute(`aria-expanded`,`false`)}));var o=document.querySelectorAll(`[data-reveal]`);if(`IntersectionObserver`in window&&!t){let e=new IntersectionObserver(t=>t.forEach(t=>{t.isIntersecting&&(t.target.classList.add(`is-in`),e.unobserve(t.target))}),{rootMargin:`0px 0px -8% 0px`});o.forEach(t=>e.observe(t))}else o.forEach(e=>e.classList.add(`is-in`));var s=document.querySelector(`[data-timecode]`);if(s&&!t){let e=performance.now(),t=e=>String(e).padStart(2,`0`),n=``,r=i=>{let a=Math.floor((i-e)/1e3*25),o=a%25,c=Math.floor(a/25)%60,l=Math.floor(a/1500)%60,u=Math.floor(a/9e4),d=`${t(u)}:${t(l)}:${t(c)}:${t(o)}`;d!==n&&(s.textContent=n=d),requestAnimationFrame(r)};requestAnimationFrame(r)}document.querySelectorAll(`[data-copy]`).forEach(e=>{e.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(e.dataset.copy??``);let t=e.textContent;e.textContent=`Copied ✓`,setTimeout(()=>e.textContent=t,1800)}catch{window.location.href=`mailto:${e.dataset.copy}`}})}),window.matchMedia(`(hover: hover)`).matches&&document.querySelectorAll(`[data-card]`).forEach(e=>{let t=e.querySelector(`[data-card-loop]`);t&&(e.addEventListener(`mouseenter`,()=>{t.play().then(()=>t.classList.add(`is-playing`)).catch(()=>{})}),e.addEventListener(`mouseleave`,()=>{t.pause(),t.classList.remove(`is-playing`)}))});var c=Array.from(document.querySelectorAll(`[data-fluid]`));c.length&&!navigator.connection?.saveData&&e(c);var l=document.querySelector(`[data-hero-card]`),u=document.querySelector(`.hero`);if(l&&u&&!t&&window.matchMedia(`(hover: hover)`).matches){let e={x:5,y:-14},t={x:e.x,y:e.y},n={x:e.x,y:e.y},r=!1,i=0,a=0,o=0,s=()=>{let c=r?{x:0,y:0}:e;n.x=c.x-a*6,n.y=c.y+i*8,t.x+=(n.x-t.x)*.08,t.y+=(n.y-t.y)*.08,l.style.setProperty(`--rx`,`${t.x.toFixed(2)}deg`),l.style.setProperty(`--ry`,`${t.y.toFixed(2)}deg`),o=Math.abs(n.x-t.x)+Math.abs(n.y-t.y)>.02?requestAnimationFrame(s):0},c=()=>{o||=requestAnimationFrame(s)};u.addEventListener(`pointermove`,e=>{let t=u.getBoundingClientRect();i=(e.clientX-t.left)/t.width-.5,a=(e.clientY-t.top)/t.height-.5,c()}),u.addEventListener(`pointerleave`,()=>{i=0,a=0,r=!1,c()}),l.addEventListener(`pointerenter`,()=>{r=!0,c()}),l.addEventListener(`pointerleave`,()=>{r=!1,c()})}var d=document.querySelector(`[data-work-tabs]`);if(d){let e=Array.from(d.querySelectorAll(`[data-tab]`)),t=Array.from(document.querySelectorAll(`[data-panel]`)),n=(n,r=!1)=>{e.forEach(e=>{let t=e.dataset.tab===n;e.setAttribute(`aria-selected`,String(t)),e.tabIndex=t?0:-1,t&&r&&e.focus()}),t.forEach(e=>{e.hidden=e.dataset.panel!==n,e.hidden||e.querySelectorAll(`[data-reveal]`).forEach(e=>e.classList.add(`is-in`))})};d.hidden=!1,document.documentElement.classList.add(`has-work-tabs`);let r=location.hash.match(/^#work-(\w+)/)?.[1];n(e.some(e=>e.dataset.tab===r)?r:e[0].dataset.tab),r&&document.getElementById(`work`)?.scrollIntoView(),e.forEach((t,r)=>{t.addEventListener(`click`,()=>{n(t.dataset.tab),history.replaceState(null,``,`#work-${t.dataset.tab}`)}),t.addEventListener(`keydown`,t=>{let i=t.key===`ArrowRight`?1:t.key===`ArrowLeft`?-1:0;if(!i)return;t.preventDefault();let a=e[(r+i+e.length)%e.length];n(a.dataset.tab,!0)})})}