import{c as e,d as t,f as n,h as r,i,l as a,o,p as s,s as c,t as l}from"./three.module.D6du07YE.js";var u=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,d=`
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
`;function f(f){let p=document.createElement(`canvas`);p.className=`crt-canvas`,p.setAttribute(`aria-hidden`,`true`);let m;try{m=new l({canvas:p,antialias:!1,alpha:!1})}catch{return}let h=Math.min(window.devicePixelRatio||1,2);m.setPixelRatio(h),document.body.append(p);let g=new n,_=new e(-1,1,1,-1,0,1),v=new s({vertexShader:u,fragmentShader:d,uniforms:{uTex:{value:null},uHover:{value:0},uTime:{value:0},uImageAspect:{value:1},uPlaneAspect:{value:1},uMouse:{value:[.5,.5]},uLines:{value:220}}});g.add(new c(new a(2,2),v));let y=new Map;function b(e){let n=e.querySelector(`[data-card-loop]`);if(n&&n.readyState>=2){let e=new r(n);return e.colorSpace=t,v.uniforms.uImageAspect.value=n.videoWidth/n.videoHeight||1,e}if(y.has(e))return y.get(e);let a=e.querySelector(`[data-card-img]`);if(!a||!a.complete||!a.naturalWidth)return null;let s=document.createElement(`canvas`);s.width=a.naturalWidth,s.height=a.naturalHeight,s.getContext(`2d`).drawImage(a,0,0);let c=new i(s);return c.colorSpace=t,c.minFilter=o,c.generateMipmaps=!1,c.needsUpdate=!0,y.set(e,c),c}let x=null,S=0,C=0,w=!1,T=performance.now();function E(){if(!x)return;let e=x.querySelector(`[data-card-media]`).getBoundingClientRect();p.style.transform=`translate(${e.left}px, ${e.top}px)`,(p.width!==Math.round(e.width*h)||p.height!==Math.round(e.height*h))&&m.setSize(e.width,e.height,!0),v.uniforms.uPlaneAspect.value=e.width/e.height}function D(e){let t=v.uniforms;t.uHover.value+=(S-t.uHover.value)*.12,t.uTime.value=(e-T)/1e3,E(),m.render(g,_),S===0&&t.uHover.value<.01?(p.classList.remove(`is-on`),x?.classList.remove(`crt-active`),x=null,w=!1):C=requestAnimationFrame(D)}return f.forEach(e=>{e.addEventListener(`pointerenter`,t=>{if(t.pointerType!==`mouse`)return;let n=b(e);if(!n)return;x?.classList.remove(`crt-active`),x=e,v.uniforms.uTex.value=n;let i=e.querySelector(`[data-card-img]`);!(n instanceof r)&&i&&(v.uniforms.uImageAspect.value=i.naturalWidth/i.naturalHeight),S=1,E(),p.classList.add(`is-on`),e.classList.add(`crt-active`),w||(w=!0,C=requestAnimationFrame(D))}),e.addEventListener(`pointermove`,t=>{if(e!==x)return;let n=e.querySelector(`[data-card-media]`).getBoundingClientRect();v.uniforms.uMouse.value=[(t.clientX-n.left)/n.width,1-(t.clientY-n.top)/n.height]}),e.addEventListener(`pointerleave`,()=>{e===x&&(S=0)})}),()=>{cancelAnimationFrame(C),m.dispose()}}export{f as initGridCrt};