import{a as e,c as t,d as n,f as r,h as i,m as a,n as o,o as s,p as c,r as l,t as u,u as d}from"./three.module.D6du07YE.js";var f=`
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
`,p=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.36, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;function m({stage:m,video:h,poster:g}){let _=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,v=document.createElement(`canvas`);v.className=`hero__canvas`,v.setAttribute(`aria-hidden`,`true`);let y;try{y=new u({canvas:v,antialias:!1,alpha:!0,powerPreference:`high-performance`})}catch{return}let b=Math.min(window.devicePixelRatio||1,2);y.setPixelRatio(b),y.setClearColor(0,0);let x=new r,S=new t(0,1,0,1,-10,10),C=new a().load(g);C.colorSpace=n;let w=()=>{if(C instanceof i)return;let e=new i(h);e.colorSpace=n,e.minFilter=e.magFilter=s,C=e,T.uniforms.uTex.value=e};!h.paused&&h.readyState>=2&&queueMicrotask(w),h.addEventListener(`playing`,w);let T=new c({vertexShader:f,fragmentShader:p,transparent:!0,depthTest:!1,uniforms:{uTex:{value:C},uMouse:{value:[-9999,-9999]},uMouseStrength:{value:0},uScatter:{value:+!_},uTime:{value:0},uDpr:{value:b},uSpacing:{value:10},uIdle:{value:new e(`#4a4843`)},uRed:{value:new e(`#e0574c`)}}}),E=null,D=0,O=0;function k(){D=m.clientWidth,O=m.clientHeight,y.setSize(D,O,!1),S.right=D,S.bottom=O,S.updateProjectionMatrix();let e=D<900,t=e?8:10;T.uniforms.uSpacing.value=t;let n=e?Math.min(D*.92,O*.46):Math.min(D*.47,O*.78),r=e?(D-n)/2:D-n-Math.max(24,D*.04),i=e?80:(O-n)/2+O*.03,a=Math.ceil(D/t)+1,s=Math.ceil(O/t)+1,c=a*s,u=new Float32Array(c*3),f=new Float32Array(c*2),p=new Float32Array(c*3),h=0;for(let e=0;e<s;e++)for(let o=0;o<a;o++){let a=o*t+t/2,s=e*t+t/2;u.set([a,s,0],h*3);let c=(a-r)/n,l=1-(s-i)/n,d=c>=0&&c<=1&&l>=0&&l<=1;!d&&(e%2||o%2)||(f.set(d?[c,l]:[-1,-1],h*2),p.set([Math.random(),Math.random(),Math.random()],h*3),h++)}let g=new l;g.setAttribute(`position`,new o(u.subarray(0,h*3),3)),g.setAttribute(`aUv`,new o(f.subarray(0,h*2),2)),g.setAttribute(`aRand`,new o(p.subarray(0,h*3),3)),E?(E.geometry.dispose(),E.geometry=g):(E=new d(g,T),E.frustumCulled=!1,x.add(E))}m.prepend(v),k(),m.classList.add(`has-webgl`);let A=0;m.addEventListener(`pointermove`,e=>{let t=v.getBoundingClientRect();T.uniforms.uMouse.value=[e.clientX-t.left,e.clientY-t.top],A=1}),m.addEventListener(`pointerleave`,()=>A=0);let j=0;window.addEventListener(`resize`,()=>{clearTimeout(j),j=window.setTimeout(k,150)});let M=!0;new IntersectionObserver(([e])=>{M=e.isIntersecting,M&&R()}).observe(m),document.addEventListener(`visibilitychange`,()=>{document.hidden||R()});let N=performance.now(),P=_?0:1800,F=0,I=!1;function L(e){if(!M||document.hidden){I=!1;return}let t=(e-N)/1e3,n=P?Math.max(0,1-(e-N)/P):0,r=n*n*(3-2*n),i=Math.min(1,Math.max(0,window.scrollY/(O*.85))),a=T.uniforms;a.uTime.value=t,a.uScatter.value=_?0:Math.max(r,i),a.uMouseStrength.value+=(A-a.uMouseStrength.value)*.08,y.render(x,S),F=requestAnimationFrame(L)}function R(){I||(I=!0,F=requestAnimationFrame(L))}return R(),()=>{cancelAnimationFrame(F),y.dispose()}}export{m as initHeroParticles};