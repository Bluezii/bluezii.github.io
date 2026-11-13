// DEMO B scene 3 (10/11/2026, bản 4: đủ cả scene 3 đi liền 1 mạch).
// Cổng vòm cẩm thạch + 2 bộ xương (mô hình quét, mặc đồ tự dựng) → qua cửa → sảnh 6 logo tạc cẩm thạch, đầy tượng/đạo cụ
// → hành lang cũ dần (nứt, giàn giáo, mái thủng) → phế tích ngoài trời + khung tranh vàng trống → hố đen ??? → sụp, hút vào.
// Texture/HDRI Poly Haven (tai-nguyen/NGUON.md), mô hình (mo-hinh/NGUON.md). Toạ độ: tường cổng z = 0, đi về phía z âm; 1 đơn vị ~ 1 m.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// tối ưu bảo tàng 10/11 (gop-3): bỏ SAOPass, BokehPass, SMAAPass → vệt tối giả dưới chân vật, sương + tối góc, FXAA gộp trong FilmShader
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'   // gop-3: artifact chặn bộ giải Draco → đổi sang meshopt;
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

// ---------- dự án: màu brand đã chốt; logo ảnh nếu có, không thì chữ VT323 ----------
export const MAU = { antimusic: 0xff4a12, gaztik: 0x8a4dff, 'dien-nang': 0x39ff6a, electric: 0x1f6bff, mikenco: 0xffa920, other: 0xa86bff, freelance: 0x22e0c4 };   // bản 6: other = tím (đoán), vàng là màu phụ
export const LOGO = { antimusic: 'antimusic.png', 'dien-nang': 'dien-nang.png', electric: 'electric.png', gaztik: 'gaztik.png', mikenco: 'mikenco.png', freelance: 'freelance.png' };
const DO = 0xff4d5e, AM = 0xffb062, TEAL = 0x8ff3e6;
const NGOC_Y = 3.45;                     // tâm logo (bản 5: logo to ~2,2 lần nên nâng lên)
const TN = f => new URL(`./tai-nguyen/${f}`, import.meta.url).href;
const MH = f => new URL(`./mo-hinh/${f.replace(/\.glb$/, '.wasm')}`, import.meta.url).href;   // gop-3: GLB nén đổi đuôi .wasm (nơi đăng không nhận .glb); GLTFLoader đọc theo nội dung, không theo đuôi
const TR = f => new URL(`./tranh/${f}.jpg`, import.meta.url).href;

// ---------- shader ngọc, lấy lại từ bao-tang-dem.mjs ----------
const NOISE = /* glsl */`
float h31(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
  return mix(mix(mix(h31(i), h31(i+vec3(1,0,0)), f.x), mix(h31(i+vec3(0,1,0)), h31(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i+vec3(0,0,1)), h31(i+vec3(1,0,1)), f.x), mix(h31(i+vec3(0,1,1)), h31(i+vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * n3(p); p *= 2.03; a *= .5; } return s; }
`;
const UV_VS = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const LOGO3D_FS = /* glsl */`
uniform sampler2D tL; uniform vec3 uMau; uniform float uA, uSang; varying vec2 vUv;
void main(){ vec4 t = texture2D(tL, vUv); if (t.a < .45 || uA < .02) discard; gl_FragColor = vec4(mix(uMau, vec3(1.), .78) * uSang * 1.25 * uA, 1.); }`;
const LOGO_FS = /* glsl */`
uniform sampler2D tL; uniform vec3 uMau; uniform float uA; varying vec2 vUv;
void main(){ vec4 t = texture2D(tL, vUv); float a = t.a * uA; gl_FragColor = vec4(mix(uMau, vec3(1.), .82) * a * 1.4, a); }`;
const QUANG_FS = /* glsl */`
uniform vec3 uMau; uniform float uA; varying vec2 vUv;
void main(){ float r = length(vUv - .5) * 2.; float g = exp(-r * r * 5.) * .55 + exp(-r * 14.) * .4; gl_FragColor = vec4(uMau * g * uA, 1.); }`;

// bản 6: logo KHỐI LIỀN (bỏ ráp mảnh vụn, theo bản C): nhiều lớp cẩm thạch nhuộm màu brand xếp dày thành khối;
// mép + mặt tự phát sáng với giá trị > 1 (HDR) để bloom bắt được → logo toả sáng rõ; gợn sáng chạy ngang (uGon), rê chuột sáng hơn (uHover).
const LOGO_KHOI_FS = /* glsl */`
uniform sampler2D tL; uniform vec3 uMau; uniform float uA, uSang, uT, uLop, uSo, uHover, uGon, uGlow, uE; varying vec2 vUv;
${NOISE}
void main(){
  float a = texture2D(tL, vUv).a; if (a < .45 || uA < .02) discard;
  float e = uE, m = min(min(texture2D(tL, vUv + vec2(e, 0.)).a, texture2D(tL, vUv - vec2(e, 0.)).a), min(texture2D(tL, vUv + vec2(0., e)).a, texture2D(tL, vUv - vec2(0., e)).a));
  float vien = smoothstep(.6, .1, m);
  float n = fbm(vec3(vUv * vec2(5., 3.), uLop * .3));
  float van = pow(1. - abs(sin((vUv.x * 1.4 + vUv.y) * 9. + n * 7.)), 10.) + .5 * pow(1. - abs(sin((vUv.y - vUv.x * .6) * 17. + n * 11.)), 18.);
  vec3 da = mix(uMau * (.55 + .45 * n), mix(uMau, vec3(1.), .7), clamp(van * .9, 0., 1.));
  float truoc = uSang > .9 ? 1. : 0., sang = truoc > .5 ? 1. : .42 + .18 * uLop / uSo;
  vec3 c = da * sang * .8 * (.8 + .3 * (1. - vUv.y));
  float gon = smoothstep(.07, 0., abs(vUv.x + vUv.y * .35 - uGon));
  float tho = .85 + .15 * sin(uT * 1.6);
  vec3 phat = mix(uMau, vec3(1.), .3);
  c += phat * vien * mix(1.7, 2.6, truoc) * uGlow * tho * (1. + uHover * .9 + gon * 2.2);   // mép rỉ sáng mạnh (bloom)
  c += uMau * mix(.18, .42, truoc) * mix(1., uGlow, .6) * tho * (1. + uHover * .8 + gon);                  // mặt đá tự phát sáng nhẹ
  gl_FragColor = vec4(c * uA, 1.);
}`;
// bản 6: hạt sáng cho sách phép (kieu 0: bay lên từ trang) và đũa phép (kieu 1: toé ra quanh đầu đũa rồi rơi)
const HAT_VS = /* glsl */`
attribute vec4 aR; uniform float uT, uPx, uKieu; varying float vA, vM;
void main(){
  float t = fract(aR.w + uT * (.16 + aR.z * .22));
  vec3 p;
  if (uKieu < .5) p = vec3((aR.x - .5) * .9 * (.4 + t), t * 1.5, (aR.y - .5) * .4 + sin(uT * 1.7 + aR.x * 30.) * .06 * t);
  else { vec3 d = normalize(vec3(aR.x - .5, aR.y - .5, aR.z - .5) + 1e-3); p = d * t * .5 - vec3(0., t * t * .35, 0.); }
  vA = sin(t * 3.1416); vM = aR.z;
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = uPx * (26. + aR.z * 40.) / -mv.z; gl_Position = projectionMatrix * mv;
}`;
const HAT_FS = /* glsl */`
uniform vec3 uM1, uM2; varying float vA, vM;
void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); gl_FragColor = vec4(mix(uM1, uM2, step(.5, vM)) * a * a * vA * 3., 1.); }`;
// ---------- kính chuông giả (fresnel), cột sáng trăng, ánh khe cửa ----------
const KINH_VS = /* glsl */`
varying vec3 vN, vV; varying float vY;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); vY = position.y;
  gl_Position = projectionMatrix * viewMatrix * w; }`;
const KINH_FS = /* glsl */`
uniform vec3 uMau; varying vec3 vN, vV; varying float vY;
void main(){
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
  float f = pow(1. - abs(dot(N, vV)), 3.);
  float soc = smoothstep(.06, 0., abs(fract(atan(N.z, N.x) * .955 + .12) - .5) - .38);   // vệt phản chiếu dọc
  vec3 c = mix(vec3(.55, .9, .88), uMau, .25) * (f * .45 + soc * .05) + vec3(1.) * pow(f, 6.) * .2;
  c += vec3(.8, 1., .95) * smoothstep(1.62, 1.7, vY) * .06;
  gl_FragColor = vec4(c, 1.);
}`;
const COT_VS = /* glsl */`
varying vec3 vN, vV, vP; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); vP = position;
  gl_Position = projectionMatrix * viewMatrix * w; }`;
const COT_FS = /* glsl */`
uniform float uT, uA, uH; uniform vec3 uMau; varying vec3 vN, vV, vP;
${NOISE}
void main(){
  float f = abs(dot(normalize(vN), vV)); f = pow(f, 3.2);              // bản 5: mép cột sáng tan mềm hơn (không còn ống sáng cứng)
  float y = vP.y / uH + .5;                                              // 0 sàn → 1 trần
  float v = .45 + .55 * n3(vec3(atan(vP.z, vP.x) * 2.5, y * 3. - uT * .05, uT * .04));
  v *= .75 + .25 * n3(vec3(vP.x * 3., vP.y * 2. - uT * .3, vP.z * 3.));   // bụi lơ lửng trong tia
  float a = f * smoothstep(0., .6, y) * smoothstep(1., .82, y) * (.25 + .75 * y) * v * uA;
  gl_FragColor = vec4(uMau * a, 1.);
}`;
const BUI_VS = /* glsl */`
uniform float uT, uPx; attribute float aS; varying float vA;
void main(){ vec3 p = position; float t = uT * (.05 + aS * .06);
  p.y = mod(p.y - t, 11.) + .3; p.x += sin(uT * .3 + aS * 30.) * .15; p.z += cos(uT * .25 + aS * 20.) * .15;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  vA = (.35 + .65 * aS) * (.5 + .5 * sin(uT * (1. + aS * 2.) + aS * 50.)) * smoothstep(.3, 1.5, p.y) * smoothstep(11.3, 9., p.y);
  gl_PointSize = (1.2 + aS * 2.8) * uPx * 6. / -mv.z; gl_Position = projectionMatrix * mv; }`;
const BUI_FS = /* glsl */`
uniform vec3 uMau; varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(uMau * smoothstep(.5, 0., d) * vA * .9, 1.); }`;
const KHE_FS = /* glsl */`
uniform float uA, uT; varying vec2 vUv;
void main(){ vec2 d = vUv - .5; float g = exp(-pow(abs(d.x) * 2.6, 2.)) * smoothstep(.5, .2, abs(d.y));
  gl_FragColor = vec4(vec3(1., .72, .4) * g * uA * (.92 + .08 * sin(uT * 1.7)), 1.); }`;

// ---------- hậu kỳ (bản 3): chạy SAU OutputPass, trong không gian màu màn hình ----------
// chỉnh màu điện ảnh (bóng tối ngả teal, vùng sáng ấm, tương phản mềm) + lens flare nhẹ cho đèn + lệch màu nhẹ + tối góc + hạt phim
const FilmShader = {
  uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uChroma: { value: .0006 }, uLoa: { value: 0 }, uDen: { value: 1 }, uRes: { value: new THREE.Vector2(1, 1) },
    uAm: { value: new THREE.Color(0xffc48a) }, uGrade: { value: 1 }, uDo: { value: 0 }, uFlash: { value: 0 }, uXq: { value: 0 }, uFxaa: { value: 1 }, uVig: { value: .36 }, uTx: { value: new THREE.Vector2(1, 1) }, uMauFlash: { value: new THREE.Color(0xeaf4ff) },
    uL: { value: [0, 1, 2, 3].map(() => new THREE.Vector3()) }, uLC: { value: [0, 1, 2, 3].map(() => new THREE.Color()) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: /* glsl */`
  uniform sampler2D tDiffuse; uniform float uT, uChroma, uLoa, uDen, uGrade, uDo, uFlash, uXq, uFxaa, uVig; uniform vec2 uRes, uTx; uniform vec3 uAm, uMauFlash; uniform vec3 uL[4]; uniform vec3 uLC[4]; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  // tối ưu 10/11: FXAA (bản rút gọn kiểu Lottes) thay SMAA — chạy ngay trong pass cuối, ảnh đã ở không gian màu màn hình
  vec3 fxaa(vec2 uv){
    const vec3 Lw = vec3(.299, .587, .114);
    vec3 cM = texture2D(tDiffuse, uv).rgb;
    float lNW = dot(texture2D(tDiffuse, uv + vec2(-1., -1.) * uTx).rgb, Lw), lNE = dot(texture2D(tDiffuse, uv + vec2(1., -1.) * uTx).rgb, Lw);
    float lSW = dot(texture2D(tDiffuse, uv + vec2(-1., 1.) * uTx).rgb, Lw), lSE = dot(texture2D(tDiffuse, uv + vec2(1., 1.) * uTx).rgb, Lw), lM = dot(cM, Lw);
    float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE))), lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
    if (lMax - lMin < max(.0312, lMax * .125)) return cM;   // không có cạnh: bỏ qua (đỡ tốn + không làm nhoè chữ/vân)
    vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
    float red = max((lNW + lNE + lSW + lSE) * (.25 * (1. / 8.)), 1. / 128.);
    dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + red), vec2(-8.), vec2(8.)) * uTx;
    vec3 a = .5 * (texture2D(tDiffuse, uv + dir * (1. / 3. - .5)).rgb + texture2D(tDiffuse, uv + dir * (2. / 3. - .5)).rgb);
    vec3 b = a * .5 + .25 * (texture2D(tDiffuse, uv - dir * .5).rgb + texture2D(tDiffuse, uv + dir * .5).rgb);
    float lB = dot(b, Lw); return (lB < lMin || lB > lMax) ? a : b;
  }
  void main(){
    vec2 d = vUv - .5; float r = length(d); float asp = uRes.x / uRes.y;
    vec2 o = d * uChroma * 8. * r * 2.;
    vec3 c0 = texture2D(tDiffuse, vUv).rgb, c = uFxaa > .5 ? fxaa(vUv) : c0;
    c.r += texture2D(tDiffuse, vUv + o).r - c0.r; c.b += texture2D(tDiffuse, vUv - o).b - c0.b;   // lệch màu nhẹ ở mép (cộng phần chênh để giữ khử răng cưa)
    // lens flare: lõi + vệt ngang mảnh + 2 bóng ma; tắt khi điểm đèn bị che (đọc độ sáng tại đèn)
    for (int i = 0; i < 4; i++) {
      vec3 L = uL[i]; if (L.z <= 0.) continue;
      float lum = dot(texture2D(tDiffuse, L.xy).rgb, vec3(.3, .59, .11));
      float k = smoothstep(.55, .95, lum) * L.z;
      vec2 dd = (vUv - L.xy) * vec2(asp, 1.);
      float f = exp(-dot(dd, dd) * 700.) * .35 + exp(-abs(dd.y) * 300.) * exp(-abs(dd.x) * 6.) * .22;
      vec2 g1 = (vUv - (.5 + (.5 - L.xy) * .55)) * vec2(asp, 1.), g2 = (vUv - (.5 + (.5 - L.xy) * 1.25)) * vec2(asp, 1.);
      f += smoothstep(.03, .018, length(g1)) * .045 + smoothstep(.055, .04, length(g2)) * .03;
      c += uLC[i] * k * f;
    }
    // chỉnh màu
    float lu = dot(c, vec3(.3, .59, .11));
    float sh = 1. - smoothstep(0., .45, lu), hi = smoothstep(.45, 1., lu);
    c = c * mix(vec3(1.), vec3(.88, 1.02, 1.07), sh * uGrade) + vec3(0., .01, .014) * sh * uGrade;
    c *= mix(vec3(1.), vec3(1.07, 1., .9), hi * uGrade);
    c = mix(c, c * c * (3. - 2. * c), .16 * uGrade);
    float vig = smoothstep(1.05, .28, length(d * vec2(asp, 1.) * .9));
    c *= mix(uVig, 1., vig);
    c += uLoa * uAm * .12 * smoothstep(.8, 0., length(d * vec2(asp, 1.)));
    c += (h(vUv * uRes + fract(uT * 7.) * 91.) - .5) * mix(.045, .022, clamp(lu * 2., 0., 1.));
    c = mix(c, c * vec3(1.5, .35, .35) + vec3(.12, 0., .01), uDo);
    // bản 5, Flash Light: chớp trắng cháy sáng rồi ánh "phim X-quang" (chỉ vật sáng nhất còn lại: bộ xương phát sáng)
    float luX = dot(c, vec3(.3, .59, .11));
    vec3 xq = uMauFlash * smoothstep(.22, .9, luX) * 1.25 + vec3(.01, .02, .03);
    c = mix(c, xq, uXq);
    c = 1. - (1. - c) * (1. - uFlash * uMauFlash);
    c *= 1. - uDen;
    gl_FragColor = vec4(c, 1.);
  }`
};
// ---------- tối ưu 10/11: shader gương sàn = ReflectorShader của three r160 + nhoè 5 điểm (che ảnh phản chiếu độ phân giải thấp) ----------
const GUONG_SHADER = {
  name: 'GuongMo',
  uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } },
  vertexShader: /* glsl */`uniform mat4 textureMatrix; varying vec4 vUv;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main(){ vUv = textureMatrix * vec4(position, 1.); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  #include <logdepthbuf_vertex>
  }`,
  fragmentShader: /* glsl */`uniform vec3 color; uniform sampler2D tDiffuse; varying vec4 vUv;
  #include <logdepthbuf_pars_fragment>
  float bo(float b, float l){ return b < .5 ? 2. * b * l : 1. - 2. * (1. - b) * (1. - l); }
  void main(){
  #include <logdepthbuf_fragment>
    vec2 uv = vUv.xy / vUv.w, px = 1.2 / vec2(textureSize(tDiffuse, 0));
    vec3 b = texture2D(tDiffuse, uv).rgb * .36 + (texture2D(tDiffuse, uv + vec2(px.x, px.y)).rgb + texture2D(tDiffuse, uv + vec2(-px.x, px.y)).rgb
      + texture2D(tDiffuse, uv + vec2(px.x, -px.y)).rgb + texture2D(tDiffuse, uv - px).rgb) * .16;
    gl_FragColor = vec4(bo(b.r, color.r), bo(b.g, color.g), bo(b.b, color.b), 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`
};
// ---------- tia trăng (god rays): làm nhoè hướng tâm các điểm rất sáng về phía giếng trời (máy tính) ----------
const TiaShader = {
  uniforms: { tDiffuse: { value: null }, uP: { value: new THREE.Vector2(.5, 1.2) }, uStr: { value: 0 }, uMau: { value: new THREE.Color(0xa8fff2) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: /* glsl */`
  uniform sampler2D tDiffuse; uniform vec2 uP; uniform float uStr; uniform vec3 uMau; varying vec2 vUv;
  void main(){
    vec4 base = texture2D(tDiffuse, vUv);
    if (uStr <= 0.) { gl_FragColor = base; return; }
    vec2 st = (vUv - uP) / 32. * .85; vec2 p = vUv; float dec = 1.; vec3 acc = vec3(0.);
    for (int i = 0; i < 32; i++) { p -= st; vec3 s = texture2D(tDiffuse, clamp(p, 0., 1.)).rgb;
      float t = dot(s, vec3(.2, .45, .35)); acc += max(t - .55, 0.) * dec; dec *= .955; }
    gl_FragColor = vec4(base.rgb + uMau * acc / 32. * uStr, base.a);
  }`
};

// ---------- bản 5, Datamosh khi chuyển cảnh: giữ khối của khung trước, trôi theo vector chuyển động giả, kéo dãn pixel ----------
// Pass có bộ đệm khung trước (feedback): khối "kẹt" lấy từ khung trước dịch đi 1 chút → vết hình chảy, vỡ như video bị mất khung I.
class MoshPass extends Pass {
  constructor() {
    super();
    this.truoc = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType });
    this.u = { tDiffuse: { value: null }, tTruoc: { value: this.truoc.texture }, uK: { value: 0 }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uMoi: { value: 1 } };
    this.mat = new THREE.ShaderMaterial({ uniforms: this.u, vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: /* glsl */`
      uniform sampler2D tDiffuse, tTruoc; uniform float uK, uT, uMoi; uniform vec2 uRes; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec4 hien = texture2D(tDiffuse, vUv);
        if (uMoi > .5) { gl_FragColor = hien; return; }
        vec2 o = floor(vUv * uRes / 22.), nhip = vec2(floor(uT * 9.), 0.);
        vec2 mv = (vec2(h(o + .3), h(o + 7.1)) - .5) * .018 + vec2(.0, -.006) + (vec2(h(floor(o / 4.) + 2.), h(floor(o / 4.) + 9.)) - .5) * .02;
        vec4 cu = texture2D(tTruoc, clamp(vUv - mv * uK, 0., 1.));
        float ket = step(h(o + nhip), uK * .5) * step(.3, h(o * 1.37 + 5.));
        vec4 c = mix(hien, cu, ket * .85);
        // kéo pixel: vài dải ngang kéo dài màu theo trục x
        float dong = floor(vUv.y * uRes.y / 6.);
        if (h(vec2(dong, floor(uT * 14.))) > 1. - uK * .09) { float x0 = floor(vUv.x * 5.) / 5.; c = mix(c, texture2D(tTruoc, vec2(x0 + (vUv.x - x0) * .08, vUv.y)), .85); }
        // lệch kênh màu theo khối
        c.r = mix(c.r, texture2D(tTruoc, clamp(vUv - mv * uK * 2.5, 0., 1.)).r, ket * .5);
        gl_FragColor = c;
      }` });
    this.fsq = new FullScreenQuad(this.mat);
    this.chep = new FullScreenQuad(new THREE.MeshBasicMaterial({ toneMapped: false }));
  }
  setSize(w, h) { this.truoc.setSize(w, h); this.u.uRes.value.set(w, h); }
  render(renderer, writeBuffer, readBuffer) {
    this.u.tDiffuse.value = readBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); this.fsq.render(renderer);
    if (!this.renderToScreen) { this.chep.material.map = writeBuffer.texture; renderer.setRenderTarget(this.truoc); this.chep.render(renderer); }
    this.u.uMoi.value = 0;
  }
  dispose() { this.truoc.dispose(); this.mat.dispose(); this.chep.material.dispose(); this.fsq.dispose(); this.chep.dispose(); }
}

// ---------- bản 6, A (sửa theo góp ý: bỏ lưới chấm point cloud). TIA SÁNG QUÉT KHÔNG GIAN, hậu kỳ dùng khoảng cách tới máy quay (tKC) ----------
// Mặt sáng teal-trắng, mép mềm, chạy ra xa theo chiều sâu (uQuet, uQuet2 = 2 lượt, mét). Chỗ mặt sáng đi qua: bề mặt loé sáng và nét kiến trúc
// (mép theo chênh lệch khoảng cách) sáng viền trong chốc lát, rồi trả về cảnh thật. Cảnh luôn nhìn rõ.
const LidarShader = {
  uniforms: { tDiffuse: { value: null }, tKC: { value: null }, uQuet: { value: 0 }, uQuet2: { value: 0 }, uA1: { value: 0 }, uA2: { value: 0 }, uDay: { value: .5 }, uRes: { value: new THREE.Vector2(1, 1) } },
  vertexShader: UV_VS,
  fragmentShader: /* glsl */`
  uniform sampler2D tDiffuse, tKC; uniform float uQuet, uQuet2, uA1, uA2, uDay; uniform vec2 uRes; varying vec2 vUv;
  void main(){
    vec3 goc = texture2D(tDiffuse, vUv).rgb;
    vec2 b = 2. / uRes;
    float kc = texture2D(tKC, vUv).r, co = step(kc, 500.);
    float kx = texture2D(tKC, vUv + vec2(b.x, 0.)).r, ky = texture2D(tKC, vUv + vec2(0., b.y)).r, kx2 = texture2D(tKC, vUv - vec2(b.x, 0.)).r, ky2 = texture2D(tKC, vUv - vec2(0., b.y)).r;
    float net = smoothstep(.04, .2, (abs(kx - kc) + abs(ky - kc) + abs(kx2 - kc) + abs(ky2 - kc)) / max(kc, 1.)) * co;   // nét kiến trúc
    float v1 = exp(-pow((kc - uQuet) / uDay, 2.)) * uA1, v2 = exp(-pow((kc - uQuet2) / uDay, 2.)) * uA2;
    float d1 = smoothstep(uDay * 7., 0., uQuet - kc) * step(kc, uQuet) * uA1, d2 = smoothstep(uDay * 7., 0., uQuet2 - kc) * step(kc, uQuet2) * uA2;   // vệt sáng tắt dần sau mặt quét
    float vach = (v1 + v2) * co, duoi = (d1 + d2) * co;
    vec3 teal = vec3(.5, 1., .95);
    vec3 c = goc * (1. + vach * .8) + teal * vach * (.3 + 2.4 * net) + teal * duoi * net * 1.1 + teal * duoi * .05;
    gl_FragColor = vec4(c, 1.);
  }` };
// ---------- bản 6, B. THẤU KÍNH HẤP DẪN quanh miệng hố đen + thấu kính nhỏ theo con trỏ + xoáy + vỡ khối điểm ảnh đỏ khi bị hút ----------
const LensShader = {
  uniforms: { tDiffuse: { value: null }, uC: { value: new THREE.Vector2(.5, .5) }, uR: { value: .1 }, uK: { value: 0 }, uC2: { value: new THREE.Vector2(.5, .5) }, uK2: { value: 0 }, uAsp: { value: 1 }, uVo: { value: 0 }, uXoay: { value: 0 }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
  vertexShader: UV_VS,
  fragmentShader: /* glsl */`
  uniform sampler2D tDiffuse; uniform vec2 uC, uC2, uRes; uniform float uR, uK, uK2, uAsp, uVo, uXoay, uT; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main(){
    vec2 A = vec2(uAsp, 1.), d = (vUv - uC) * A; float r = length(d) + 1e-4;
    float Re = uR * (uXoay > .01 ? 1.25 : .95) * uK;
    float g = uXoay * uR / (r + uR * .3);
    vec2 dx = vec2(cos(g) * d.x - sin(g) * d.y, sin(g) * d.x + cos(g) * d.y);
    float om = 1. - smoothstep(uR * 1.3, uR * 2.4, r) * step(uXoay, .01);   // lúc nghỉ: chỉ cong sát miệng hố; khi bị hút: cả màn
    vec2 s = uC + (dx - normalize(dx + 1e-5) * Re * Re / max(r, uR * .35) * om) / A;
    s = mix(vUv, s, smoothstep(uR * .42, uR * .78, r) * step(.001, uK));   // trong chân trời sự kiện: giữ hình hố đen gốc
    vec2 d2 = (vUv - uC2) * A; float r2 = length(d2) + 1e-4, R2 = .075 * uK2;
    s -= (d2 / r2) * (R2 * R2 / max(r2, R2 * .7)) / A * smoothstep(.4, .08, r2);
    vec3 c = texture2D(tDiffuse, clamp(s, 0., 1.)).rgb;
    c += vec3(1., .62, .5) * exp(-pow((r - Re) / (uR * .08 + 1e-4), 2.)) * .3 * min(uK, 1.) * step(.001, uK);
    c += vec3(.75, .9, 1.) * exp(-pow((r2 - R2) / (R2 * .12 + 1e-4), 2.)) * .12 * uK2;
    if (uVo > 0.) {
      float B = mix(3., 46., uVo); vec2 o = floor(vUv * uRes / B), tb = (o + .5) * B / uRes;
      vec3 cb = texture2D(tDiffuse, tb).rgb; float l = dot(cb, vec3(.3, .59, .11));
      vec3 dd = vec3(l * 1.8 + .3 * h(o), l * .2, l * .25);
      float chet = step(h(o + floor(uT * 12.)), uVo * .9);
      c = mix(c, dd * (1. - chet), smoothstep(0., .25, uVo));
    }
    gl_FragColor = vec4(c, 1.);
  }` };

// ---------- sương giả: tấm dọc noise fbm cuộn chậm, cộng sáng, mờ theo khoảng cách và góc nhìn ----------
const SUONG_VS = /* glsl */`
varying vec2 vUv; varying vec3 vWp, vN;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.); vWp = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
const SUONG_FS = /* glsl */`
uniform float uT, uA, uDay, uCao, uOct; uniform vec3 uMau; varying vec2 vUv; varying vec3 vWp, vN;
float h31(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
  return mix(mix(mix(h31(i), h31(i+vec3(1,0,0)), f.x), mix(h31(i+vec3(0,1,0)), h31(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i+vec3(0,0,1)), h31(i+vec3(1,0,1)), f.x), mix(h31(i+vec3(0,1,1)), h31(i+vec3(1,1,1)), f.x), f.y), f.z); }
void main(){
  vec3 q = vec3(vWp.x * .32 + uT * .045, vWp.y * .55 - uT * .012, vWp.z * .3 - uT * .03);
  float s = 0., a = .55; for (int i = 0; i < 4; i++) { if (float(i) >= uOct) break; s += a * n3(q); q = q * 2.07 + 1.3; a *= .5; }
  float m = smoothstep(.28, .78, s);
  float hy = max(vWp.y - uDay, 0.);
  float roi = exp(-hy / uCao);
  float vien = smoothstep(0., .18, vUv.x) * smoothstep(1., .82, vUv.x) * smoothstep(1., .45, vUv.y);
  vec3 V = cameraPosition - vWp; float kc = length(V);
  float goc = smoothstep(.1, .45, abs(dot(normalize(vN), V / kc)));
  float xa = smoothstep(.6, 3.5, kc) * (1. - smoothstep(22., 40., kc));
  gl_FragColor = vec4(uMau * m * roi * vien * goc * xa * uA, 1.);
}`;

// ---------- độ cũ cho vật liệu đá: chân tối (AO giả), vệt chảy dọc, mảng bẩn xỉn ----------
const NOISE_CU = /* glsl */`
float h31c(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float n3c(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
  return mix(mix(mix(h31c(i), h31c(i+vec3(1,0,0)), f.x), mix(h31c(i+vec3(0,1,0)), h31c(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(h31c(i+vec3(0,0,1)), h31c(i+vec3(1,0,1)), f.x), mix(h31c(i+vec3(0,1,1)), h31c(i+vec3(1,1,1)), f.x), f.y), f.z); }
float fbmc(vec3 p){ float s = 0., a = .5; for (int i = 0; i < 3; i++) { s += a * n3c(p); p *= 2.03; a *= .5; } return s; }
`;
function lamCu(mat, { day = 0, min = .45, vet = .3, bam = .3, cao = 1.5, ten = 'cu' } = {}) {
  const u = { uDay: { value: day }, uMin: { value: min }, uVet: { value: vet }, uBam: { value: bam }, uCaoAo: { value: cao } };
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'varying vec3 vWpC;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      { vec4 wq = vec4(transformed, 1.);
      #ifdef USE_INSTANCING
        wq = instanceMatrix * wq;
      #endif
        vWpC = (modelMatrix * wq).xyz; }`);
    sh.fragmentShader = 'varying vec3 vWpC; uniform float uDay, uMin, uVet, uBam, uCaoAo;\n' + NOISE_CU + sh.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        float cuN = fbmc(vWpC * 1.7);
        float cuAo = mix(uMin, 1., smoothstep(0., uCaoAo * (.7 + cuN * .7), vWpC.y - uDay));
        float cuVet = uVet * smoothstep(.5, .78, n3c(vec3(vWpC.x * 3.1 + vWpC.z * 2.3, vWpC.y * .12, vWpC.z * 3.1 - vWpC.x)));
        float cuBan = uBam * smoothstep(.45, .8, fbmc(vWpC * .55 + 3.1));
        diffuseColor.rgb *= cuAo * (1. - .32 * cuVet) * (1. - .4 * cuBan);
        diffuseColor.rgb *= mix(vec3(1.), vec3(.86, .93, .82), cuBan);
        float cuTuoi = smoothstep(-28., -90., vWpC.z);
        float cuNut = cuTuoi * (smoothstep(.028, .0, abs(n3c(vWpC * vec3(1.4, 2.1, 1.4)) - .5)) + .6 * smoothstep(.02, .0, abs(n3c(vWpC * 4.3 + 9.) - .5)));
        float cuMang = cuTuoi * smoothstep(.35, .72, fbmc(vWpC * .7 + 5.));
        diffuseColor.rgb *= (1. - .75 * min(cuNut, 1.)) * (1. - .5 * cuMang) * mix(vec3(1.), vec3(.72, .8, .66), cuTuoi * .7);
        cuBan = max(cuBan, cuMang);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + (1. - cuAo) * .35 + cuBan * .3 + cuVet * .15, 0., 1.);`);
  };
  mat.customProgramCacheKey = () => ten;
  return mat;
}

// ---------- texture vẽ tay ----------
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function veVan(x, S, r, n, mauVan, rong = [0.6, 1.8]) {
  for (let i = 0; i < n; i++) {
    x.strokeStyle = mauVan; x.lineWidth = rong[0] + r() * (rong[1] - rong[0]); x.globalAlpha = .12 + r() * .35;
    x.beginPath(); let px = r() * S, py = r() * S, a = r() * Math.PI * 2; x.moveTo(px, py);
    for (let k = 0; k < 26; k++) { a += (r() - .5) * .9; px += Math.cos(a) * S * .035; py += Math.sin(a) * S * .035; x.lineTo(px, py); }
    x.stroke();
  }
  x.globalAlpha = 1;
}
function canDa(S = 512, seed = 7, nen = '#d9e0dc', van = '#5d6f70') {
  const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), r = rnd(seed);
  x.fillStyle = nen; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(${r() < .5 ? '60,80,82' : '255,255,255'},${.03 + r() * .05})`; x.beginPath(); x.arc(r() * S, r() * S, 20 + r() * 90, 0, 7); x.fill(); }
  x.filter = 'blur(1px)'; veVan(x, S, r, 26, van); x.filter = 'none'; veVan(x, S, r, 14, van, [.4, .9]);
  // lặp mép cho liền: vẽ chồng 4 bản lệch nửa ô với độ mờ nhẹ
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
}
function canSan() {   // ca rô: ô trắng đục hơn, ô đen trong hơn để thấy phản chiếu
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), r = rnd(3), h = S / 2;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const trang = (i + j) % 2 === 0;
    x.save(); x.beginPath(); x.rect(i * h, j * h, h, h); x.clip();
    x.fillStyle = trang ? 'rgba(214,222,218,.93)' : 'rgba(10,13,14,.6)'; x.fillRect(i * h, j * h, h, h);
    veVan(x, h, () => r(), 8, trang ? 'rgba(70,90,92,.9)' : 'rgba(150,170,170,.5)');
    x.restore();
    x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 2; x.strokeRect(i * h, j * h, h, h);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
function canTran() {  // ô giếng trần (coffer)
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  x.fillStyle = '#7d8d8b'; x.fillRect(0, 0, S, S);
  const b = [[18, '#9aaaa7'], [34, '#5b6968'], [50, '#3b4645'], [64, '#2a3333']];
  for (const [m, col] of b) { x.fillStyle = col; x.fillRect(m, m, S - 2 * m, S - 2 * m); }
  x.fillStyle = '#1d2424'; x.beginPath(); x.arc(S / 2, S / 2, 14, 0, 7); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function canCuaDong() {  // mặt cánh cửa đồng: 3 ô pa-nô, 2 ô có huy hiệu tròn, đinh tán
  const W = 256, H = 940, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), r = rnd(11);
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#6d5a2c'); g.addColorStop(.5, '#4a3d1e'); g.addColorStop(1, '#5c4b25'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${r() < .5 ? '30,40,25' : '150,130,70'},${r() * .12})`; x.fillRect(r() * W, r() * H, 2 + r() * 10, 2 + r() * 10); }
  const pano = (y, h, tron) => {
    x.strokeStyle = '#2a2210'; x.lineWidth = 10; x.strokeRect(30, y, W - 60, h);
    x.strokeStyle = '#a08a4a'; x.lineWidth = 3; x.strokeRect(38, y + 8, W - 76, h - 16);
    if (tron) { x.strokeStyle = '#2a2210'; x.lineWidth = 8; x.beginPath(); x.arc(W / 2, y + h / 2, 48, 0, 7); x.stroke();
      x.strokeStyle = '#b39b55'; x.lineWidth = 3; x.beginPath(); x.arc(W / 2, y + h / 2, 38, 0, 7); x.stroke();
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * 12, y + h / 2 + Math.sin(a) * 12); x.lineTo(W / 2 + Math.cos(a) * 36, y + h / 2 + Math.sin(a) * 36); x.stroke(); } }
  };
  pano(40, 250, true); pano(320, 270, false); pano(640, 260, true);
  x.fillStyle = '#c2a860'; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(14, 30 + i * 50, 4, 0, 7); x.fill(); x.beginPath(); x.arc(W - 14, 30 + i * 50, 4, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function canTroi() {  // kính giếng trời nhìn từ dưới: song kính toả tròn
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  const g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#bfeee8'); x.fillStyle = g; x.fillRect(0, 0, S, S);
  x.strokeStyle = 'rgba(20,50,52,.75)'; x.lineWidth = 3;
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; x.beginPath(); x.moveTo(S / 2 + Math.cos(a) * 22, S / 2 + Math.sin(a) * 22); x.lineTo(S / 2 + Math.cos(a) * S, S / 2 + Math.sin(a) * S); x.stroke(); }
  for (const rr of [22, 60, 96]) { x.beginPath(); x.arc(S / 2, S / 2, rr, 0, 7); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------- hình khối ----------
// thân cột có rãnh: n rãnh lõm hình bán nguyệt, cạnh sắc; pháp tuyến tính tay để không lộ đường nối
function thanCotRanh(R0, R1, H, n, sau = .045, seg = 6) {
  const N = n * seg, Y = 8, pos = [], nor = [], uv = [], idx = [];
  for (let j = 0; j <= Y; j++) {
    const v = j / Y, y = v * H, R = THREE.MathUtils.lerp(R0, R1, v) * (1 + .025 * Math.sin(v * Math.PI));   // hơi phình (entasis)
    for (let i = 0; i <= N; i++) {
      const th = i / N * Math.PI * 2, fr = (i % seg) / seg;
      const f = Math.sin(Math.PI * fr), fd = n / 2 * Math.cos(Math.PI * fr);
      const r = R * (1 - sau * f), rd = -R * sau * fd;
      const c = Math.cos(th), s = Math.sin(th);
      pos.push(r * c, y, r * s);
      const tx = rd * c - r * s, tz = rd * s + r * c; const l = Math.hypot(tx, tz);
      nor.push(tz / l, 0, -tx / l); uv.push(i / N * 2, v * H / 3);
    }
  }
  for (let j = 0; j < Y; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + N + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}
const tien = (g, x, y, z) => { g.translate(x, y, z); return g; };
const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

function cotDoric(H) {  // đế bậc + thân rãnh + mũ echinus + abacus vuông
  const thanH = H - .75;
  const parts = [
    tien(new THREE.BoxGeometry(1.45, .16, 1.45), 0, .08, 0),
    tien(thanCotRanh(.56, .46, thanH, 20, .05), 0, .16, 0),
    tien(lathe([[.44, 0], [.5, .05], [.62, .22], [.68, .34], [0, .34]]), 0, .16 + thanH, 0),
    tien(new THREE.BoxGeometry(1.5, .25, 1.5), 0, .16 + thanH + .34 + .125, 0),
  ];
  return mergeGeometries(parts.map(p => p.index ? p : p), false);
}
function cotIonic(H) {  // đế hai vòng + thân 24 rãnh + mũ có 2 cuộn xoắn hướng vào giữa sảnh (trục x)
  const thanH = H - 1.0;
  const parts = [
    tien(new THREE.BoxGeometry(1.3, .14, 1.3), 0, .07, 0),
    tien(lathe([[.62, 0], [.64, .06], [.6, .14], [.52, .18], [.56, .26], [.5, .32], [0, .32]]), 0, .14, 0),
    tien(thanCotRanh(.47, .41, thanH, 24, .045), 0, .46, 0),
  ];
  const yc = .46 + thanH;
  parts.push(tien(lathe([[.42, 0], [.5, .1], [.54, .18], [0, .18]]), 0, yc, 0));
  const tru = new THREE.CylinderGeometry(.17, .17, 1.1, 18); tru.rotateZ(Math.PI / 2);   // trục cuộn chạy theo x
  parts.push(tien(tru.clone(), 0, yc + .2, .45), tien(tru, 0, yc + .2, -.45));
  for (const sx of [-.56, .56]) for (const sz of [-.45, .45]) {
    const to = new THREE.TorusGeometry(.13, .055, 8, 20); to.rotateY(Math.PI / 2); parts.push(tien(to, sx, yc + .2, sz));
    const nut = new THREE.SphereGeometry(.06, 10, 8); parts.push(tien(nut, sx * 1.04, yc + .2, sz));
  }
  parts.push(tien(new THREE.BoxGeometry(1.25, .14, 1.25), 0, yc + .44, 0));
  return mergeGeometries(parts, false);
}

// ---------- bộ xương bảo vệ (bản 4): xương từ mô hình quét (bo-xuong.glb, đã tách đầu/hàm/tay/chân), đồ tự dựng ----------
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const TRUC_Y = V3(0, 1, 0);
function datDoan(g, a, b) { const d = b.clone().sub(a); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(TRUC_Y, d.normalize())); g.translate(a.x, a.y, a.z); return g; }
// nhăn vải: đẩy đỉnh theo pháp tuyến bằng noise + nếp gấp
function nhan(geo, bien, seed) {
  geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = bien * (Math.sin(x * 37 + y * 21 + seed) * Math.cos(z * 29 - y * 13) * .7 + Math.sin(y * 61 + x * 9 + seed * 2) * .35 + Math.sin((x - z) * 83 + seed) * .15);
    p.setXYZ(i, x + n.getX(i) * k, y + n.getY(i) * k, z + n.getZ(i) * k);
  }
  geo.computeVertexNormals(); return geo;
}
// chuẩn hoá các mảnh xương: cao 1,8 m, chân ở y = 0, mặt nhìn +z
function chuanXuong(gltf) {
  const P = {}; gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(o => { if (o.isMesh) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); P[o.name] = g; } });
  const b = new THREE.Box3(); for (const g of Object.values(P)) { g.computeBoundingBox(); b.union(g.boundingBox); }
  const s = 1.8 / (b.max.y - b.min.y), cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
  for (const g of Object.values(P)) { g.translate(-cx, -b.min.y, -cz); g.scale(s, s, s); g.computeBoundingBox(); if (!g.attributes.normal) g.computeVertexNormals(); }
  return P;
}
const hopCua = g => g.boundingBox;
const dinhTren = g => { const b = hopCua(g); return V3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2); };
const dayDuoi = g => { const b = hopCua(g); return V3((b.min.x + b.max.x) / 2, b.min.y, (b.min.z + b.max.z) / 2); };

// kieu 0: chào uể oải, dùi cui buông tay trái. kieu 1: dựa cột chéo chân, vác dùi cui, ngáp.
function boXuong(kieu, M, P) {
  const g = new THREE.Group();
  const mesh = (geo, mat = M.xuong) => new THREE.Mesh(geo, mat);
  g.add(mesh(P.than));
  // ----- tay: cánh tay quay quanh vai, cẳng tay quay quanh khuỷu -----
  const tay = {};
  const dungTay = (ben, khuyuDich, banDich) => {
    const kt = P['canhtay_' + ben], ct = P['cangtay_' + ben];
    const vai = dinhTren(kt).add(V3(0, -.012, 0)), khuyu = dinhTren(ct).add(V3(0, -.01, 0)), ngon = dayDuoi(ct);
    const tren = new THREE.Group(); tren.position.copy(vai); g.add(tren);
    const m1 = mesh(kt.clone().translate(-vai.x, -vai.y, -vai.z)); tren.add(m1);
    const duoi = new THREE.Group(); duoi.position.copy(khuyu).sub(vai); tren.add(duoi);
    duoi.add(mesh(ct.clone().translate(-khuyu.x, -khuyu.y, -khuyu.z)));
    const r1 = khuyu.clone().sub(vai).normalize(), r2 = ngon.clone().sub(khuyu).normalize();
    if (khuyuDich) {
      tren.quaternion.setFromUnitVectors(r1, khuyuDich.clone().sub(vai).normalize());
      const khuyuMoi = vai.clone().add(khuyu.clone().sub(vai).applyQuaternion(tren.quaternion));
      const d2 = banDich.clone().sub(khuyuMoi).normalize().applyQuaternion(tren.quaternion.clone().invert());
      duoi.quaternion.setFromUnitVectors(r2, d2);
    }
    // tay áo ngắn, hơi loe, nhăn: bọc phần trên cánh tay
    const tao = new THREE.CylinderGeometry(.05, .064, .19, 16, 4, true); tao.translate(0, -.095, 0); nhan(tao, .012, ben === 'L' ? 3 : 7);
    datDoan(tao, V3(0, .01, 0), r1.clone().multiplyScalar(-1)); tren.add(mesh(tao, M.ao));
    tren.userData.goc = tren.quaternion.clone();
    return { tren, duoi, vai, ngonLocal: ngon.clone().sub(khuyu) };
  };
  if (kieu === 0) {   // tay phải (-x) chào lên vành mũ, hơi trễ xuống
    tay.dong = dungTay('L', V3(-.4, 1.5, .1), V3(-.15, 1.72, .14));
    tay.tinh = dungTay('R', V3(.21, 1.13, .02), V3(.24, .86, .06));
  } else {            // tay trái (+x) gập lên vác dùi cui
    tay.dong = dungTay('R', V3(.37, 1.27, .1), V3(.19, 1.53, .13));
    tay.tinh = dungTay('L', V3(-.22, 1.14, .03), V3(-.21, .88, .08));
  }
  // ----- chân: kiểu 1 chéo chân trái qua trước chân phải -----
  for (const ben of ['L', 'R']) {
    const c = P['chan_' + ben], hong = dinhTren(c).add(V3(0, -.03, 0)), mc = dayDuoi(c).add(V3(0, .06, 0));
    const nhom = new THREE.Group(); nhom.position.copy(hong); g.add(nhom);
    nhom.add(mesh(c.clone().translate(-hong.x, -hong.y, -hong.z)));
    let chanDat = mc.clone();
    if (kieu === 1 && ben === 'L') { const dich = V3(.17, .08, .1); nhom.quaternion.setFromUnitVectors(mc.clone().sub(hong).normalize(), dich.clone().sub(hong).normalize()); chanDat = dich; }
    // dép: đế + quai chữ Y
    const sh = new THREE.Shape(); sh.moveTo(0, -.05); sh.bezierCurveTo(.05, -.05, .055, .05, .045, .14); sh.bezierCurveTo(.04, .2, -.04, .2, -.045, .14); sh.bezierCurveTo(-.055, .05, -.05, -.05, 0, -.05);
    const de = new THREE.ExtrudeGeometry(sh, { depth: .016, bevelEnabled: false }); de.rotateX(Math.PI / 2); de.deleteAttribute('uv');
    const quai = [-1, 1].map(s => { const t = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(-.005, .002, .14), V3(s * .02, .03, .09), V3(s * .045, .006, .04)]), 8, .006, 4).toNonIndexed(); t.deleteAttribute('uv'); return t; });
    const dep = mesh(mergeGeometries([de, ...quai], false), M.dep); dep.position.set(chanDat.x, kieu === 1 && ben === 'L' ? chanDat.y - .06 : .016, chanDat.z - .06);
    if (kieu === 1 && ben === 'L') dep.rotation.set(.7, 0, -.2);
    g.add(dep);
  }
  // ----- áo sơ mi xanh nhạt: thân lathe dẹt, nhăn, vạt so le, xộc xệch -----
  const vaiR = Math.abs(tay.dong.vai.x) * .98, k = vaiR / .19;
  const profAo = [[.178, .985], [.18, 1.06], [.176, 1.16], [.185, 1.28], [.195, 1.38], [.19, 1.46], [.165, 1.515], [.1, 1.555], [.078, 1.59]];
  const than = new THREE.LatheGeometry(profAo.map(([r, y]) => new THREE.Vector2(r, y)), 36);
  than.scale(k, 1, .74 * k); than.translate(0, 0, .0);
  { const p = than.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (y < 1.0) p.setY(i, y - .025 * (Math.sin(x * 23 + kieu * 3) * .5 + .5) - (z > 0 ? .02 : 0) - (x > .05 && kieu === 0 ? .03 : 0)); } }
  nhan(than, .016, 7 + kieu);
  g.add(mesh(than, M.ao));
  for (const s of [-1, 1]) {
    const co = new THREE.BoxGeometry(.075, .006, .05); co.rotateX(-.5); co.rotateZ(s * .35); co.translate(s * .045, 1.575, .06); g.add(mesh(co, M.ao));
    const cv = mesh(new THREE.BoxGeometry(.05, .014, .13), M.mu); cv.position.set(s * .15 * k, 1.535, -.01); cv.rotation.z = s * -.45; g.add(cv);
    const tui = mesh(new THREE.BoxGeometry(.075, .085, .01), M.ao); tui.position.set(s * .085, 1.37, .142 * k); tui.rotation.y = s * .25; g.add(tui);
  }
  const the = mesh(new THREE.BoxGeometry(.06, .016, .006), M.vangThe); the.position.set(.085, 1.43, .15 * k); the.rotation.y = .25; g.add(the);
  // cà vạt xanh đậm, hơi lệch (kiểu 1 vắt sang bên)
  { const sh = new THREE.Shape(); sh.moveTo(-.016, 0); sh.lineTo(.016, 0); sh.lineTo(.04, -.36); sh.lineTo(0, -.41); sh.lineTo(-.04, -.36); sh.closePath();
    const cg = new THREE.ExtrudeGeometry(sh, { depth: .006, bevelEnabled: false });
    const p = cg.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, p.getZ(i) + .012 * Math.sin(y * 14) + (-y) * (kieu ? .25 : .06)); p.setX(i, p.getX(i) + (kieu ? (-y) * (-y) * .9 : Math.sin(-y * 9) * .01)); }
    cg.computeVertexNormals();
    const cv = mesh(cg, M.cavat); cv.position.set(0, 1.56, .133 * k); cv.rotation.x = -.12; g.add(cv);
    const nut = mesh(new THREE.SphereGeometry(.018, 8, 6), M.cavat); nut.scale.set(1.1, 1.2, .6); nut.position.set(0, 1.56, .135 * k); g.add(nut); }
  // ----- đầu + hàm (ngáp) + mũ lưỡi trai mềm -----
  const bD = hopCua(P.dau), coDau = V3(0, bD.min.y + .02, (bD.min.z + bD.max.z) / 2 - .02);
  const dau = new THREE.Group(); dau.position.copy(coDau); g.add(dau);
  dau.add(mesh(P.dau.clone().translate(-coDau.x, -coDau.y, -coDau.z)));
  const bH = hopCua(P.ham), bl = V3(0, bH.max.y - .012, bH.min.z + .015);
  const ham = new THREE.Group(); ham.position.copy(bl).sub(coDau); dau.add(ham);
  ham.add(mesh(P.ham.clone().translate(-bl.x, -bl.y, -bl.z)));
  const rongSo = (bD.max.x - bD.min.x) / 2, kMu = (rongSo + .014) / .094;
  const mu = new THREE.Group(); mu.position.set(0, bD.max.y - coDau.y - .062 * kMu, (bD.min.z + bD.max.z) / 2 - coDau.z + .008); mu.rotation.x = kieu ? -.24 : -.08; mu.scale.setScalar(kMu); dau.add(mu);
  { const ch = new THREE.SphereGeometry(.104, 24, 10, 0, Math.PI * 2, 0, Math.PI * .5); ch.scale(.9, .62, 1.06);
    const p = ch.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); p.setY(i, y * (1 + .1 * Math.sin(x * 40) * Math.cos(z * 30)) + (z > .03 ? .012 * (y / .064) : 0)); }
    ch.computeVertexNormals(); mu.add(mesh(ch, M.mu));
    const sh = new THREE.Shape(); sh.absarc(0, 0, .095, Math.PI * .05, Math.PI * .95, false); sh.absellipse(0, 0, .1, .175, Math.PI * .95, Math.PI * .05, true);
    const lg = new THREE.ShapeGeometry(sh, 16); lg.rotateX(-Math.PI / 2); lg.scale(.95, 1, -1);
    const q = lg.attributes.position; for (let i = 0; i < q.count; i++) { const x = q.getX(i), z = q.getZ(i); q.setY(i, -2.2 * x * x - .25 * Math.max(0, z - .08)); }
    lg.computeVertexNormals(); const luoi = mesh(lg, M.muLuoi); luoi.position.set(0, .004, 0); mu.add(luoi);
    const huy = mesh(new THREE.CircleGeometry(.016, 12), M.vang); huy.position.set(0, .035, .1); huy.rotation.x = -.35; mu.add(huy); }
  // ----- dùi cui đen: gắn vào cẳng tay, đặt theo hướng thế giới mong muốn -----
  const dui = new THREE.Group();
  dui.add(mesh(mergeGeometries([new THREE.CylinderGeometry(.016, .018, .62, 10), new THREE.CylinderGeometry(.021, .021, .1, 10).translate(0, -.24, 0), new THREE.CylinderGeometry(.024, .024, .012, 10).translate(0, -.185, 0)], false), M.dui));
  const cam = kieu === 0 ? tay.tinh : tay.dong;
  cam.duoi.add(dui); dui.position.copy(cam.ngonLocal).multiplyScalar(.82);
  g.updateMatrixWorld(true);
  const qThe = new THREE.Quaternion().setFromEuler(kieu === 0 ? new THREE.Euler(.06, 0, .04) : new THREE.Euler(-.9, 0, .55));
  const qCha = new THREE.Quaternion(); cam.duoi.getWorldQuaternion(qCha);
  const qG = new THREE.Quaternion(); g.getWorldQuaternion(qG);
  dui.quaternion.copy(qCha.invert().multiply(qG).multiply(qThe));
  if (kieu === 0) dui.position.add(V3(0, -.18, 0).applyQuaternion(dui.quaternion));
  g.userData = { dau, ham, tay: tay.dong.tren, kieu };
  return g;
}

// ---------- shader hố đen trên mặt phẳng trong lòng khung tranh (chuyển từ hoDen của bao-tang-dem.mjs) ----------
const HO_FS = /* glsl */`
uniform float uT, uR, uMo; uniform sampler2D tHoi; varying vec2 vUv;
${NOISE}
void main(){
  vec2 d = (vUv - .5) * vec2(2.4, 3.4);                    // đơn vị mét trong lòng khung
  float R = .62 * uR; if (R < .002) discard;
  float r = length(d), a = atan(d.y, d.x);
  float xo = a + uT * .9 + .2 / (r + .05);
  float vet = n3(vec3(cos(xo) * 4., sin(xo) * 4., r * 3. - uT * .5));
  vec3 do_ = mix(vec3(.9, .16, .22), vec3(1., .5, .25), vet);
  float toi = smoothstep(R * 2.6, R * .55, r) * .92;
  float g = -.32, cg = cos(g), sg = sin(g);
  vec2 q = vec2(cg * d.x - sg * d.y, sg * d.x + cg * d.y);
  float rd = length(q * vec2(1., 4.2)), aq = atan(q.y * 4.2, q.x);
  float vd = n3(vec3(cos(aq + uT * 1.2) * 3., sin(aq + uT * 1.2) * 3., rd * 4.));
  float dia = smoothstep(R * .62, R * .78, rd) * smoothstep(R * 1.9, R * .95, rd) * (.35 + .9 * vd);
  float vong = smoothstep(R * .48, R * .56, r) * smoothstep(R * .95, R * .58, r) * (.3 + .8 * vet);
  float truoc = step(0., q.y);
  float loi = 1. - smoothstep(R * .44, R * .5, r);
  vec3 c = do_ * vong * .9 * (1. - loi * (1. - truoc));
  c += do_ * dia * 1.6 * (r > R * .5 ? 1. : truoc);
  c += vec3(1., .7, .55) * smoothstep(.03, 0., abs(r - R * .5)) * 1.4;
  float rl = r / (R * .46);
  if (rl < 1.) {
    float gx = .35 * rl * rl + .12 * sin(uT * .6);
    vec2 dq = vec2(cos(gx) * d.x - sin(gx) * d.y, sin(gx) * d.x + cos(gx) * d.y) * (1. + .9 * rl * rl);
    vec2 tuv = dq / (R * .66) * vec2(1., 2.) * .5 + .5;
    float chu = (tuv.x > 0. && tuv.x < 1. && tuv.y > 0. && tuv.y < 1.) ? texture2D(tHoi, tuv).a : 0.;
    c += vec3(1., .45, .45) * chu * (1.1 + .3 * sin(uT * 2.3)) * smoothstep(1., .6, rl) * uMo;
  }
  float alpha = clamp(max(toi, loi * (1. - truoc * dia)), 0., 1.);
  gl_FragColor = vec4(c, alpha);
}`;
// sao trời
const SAO_VS = /* glsl */`attribute float aS; uniform float uT, uPx; varying float vA;
void main(){ vA = .4 + .6 * fract(aS * 7.3) * (.7 + .3 * sin(uT * (1. + aS * 3.) + aS * 40.)); vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = (1. + aS * 2.2) * uPx; gl_Position = projectionMatrix * mv; }`;
const SAO_FS = /* glsl */`varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(vec3(.85, .95, 1.) * smoothstep(.5, .1, d) * vA, 1.); }`;
const TRANG_FS = /* glsl */`varying vec2 vUv; uniform float uA;
void main(){ float r = length(vUv - .5) * 2.; float dia = smoothstep(.36, .33, r); float n = .85 + .15 * sin(vUv.x * 40.) * sin(vUv.y * 33.);
  vec3 c = vec3(.86, .97, .95) * dia * n * 2.2 + vec3(.5, .85, .82) * exp(-r * 3.2) * .55 * smoothstep(1., .6, r); gl_FragColor = vec4(c * uA, 1.); }`;   // bản 5: quầng tắt hẳn trước mép tấm (hết viền vuông)

// chữ VT323 thành texture (logo chưa có ảnh, dấu ???)
async function chuThanhAnh(chu, w = 1024, h = 384, co = 300) {   // bản 6: nhận nhiều dòng ('\n')
  try { await document.fonts.load(`${co}px VT323`); } catch (e) { }
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.font = `${co}px VT323, monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
  const dong = chu.split('\n'), dai = () => Math.max(...dong.map(d => x.measureText(d).width));
  let s = co; while ((dai() > w * .92 || s * .86 * dong.length > h * .94) && s > 40) { s -= 10; x.font = `${s}px VT323, monospace`; }
  dong.forEach((d, i) => x.fillText(d, w / 2, h / 2 + (i - (dong.length - 1) / 2) * s * .86 + s * .04));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// bản 5: cửa đồng đen làm lại. 1 bộ canvas phủ cả 2 cánh (mặt trời chia đôi), vẽ 4 lớp cùng hình:
// màu (đồng sẫm + vàng), phát sáng (chỉ nét vàng, dịu), nổi khối (bump: viền, đinh tán, hoa văn nổi, ô lõm), độ nhám (vàng bóng hơn đồng).
function canCuaVom() {
  const W = 1024, H = 1536, CY = 512, R0 = 512;   // 256 px = 1 m; tâm cung vòm ở (512, 512)
  const lop = ['mau', 'sang', 'loi', 'nham'].map(k => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [k, c, c.getContext('2d')]; });
  const vom = (x, i) => { x.beginPath(); x.moveTo(i, H - i); x.lineTo(i, CY); x.arc(512, CY, R0 - i, Math.PI, 0); x.lineTo(W - i, H - i); x.closePath(); };
  const meander = (x, x0, y0, len, dung, b = 40) => {   // hoạ tiết chìa khoá Hy Lạp
    x.beginPath();
    for (let k = 0; k * b < len - b; k++) {
      const a = k * b, P = (u, v) => dung ? [x0 + v, y0 + a + u] : [x0 + a + u, y0 + v];
      [[0, 0], [0, 26], [26, 26], [26, 7], [14, 7], [14, 18], [7, 18], [7, 0], [b, 0]].forEach(([u, v], j) => { const [px, py] = P(u, v); (j || k) ? x.lineTo(px, py) : x.moveTo(px, py); });
    }
    x.stroke();
  };
  for (const [k, c, x] of lop) {
    const r = rnd(31);
    const [nen, vang, lom] = { mau: ['#17140e', '#c9a14a', '#0c0a06'], sang: ['#000', '#8a6420', '#000'], loi: ['#7a7a7a', '#e6e6e6', '#3a3a3a'], nham: ['#a8a8a8', '#4a4a4a', '#c0c0c0'] }[k];
    x.fillStyle = nen; x.fillRect(0, 0, W, H);
    if (k === 'mau') {   // đồng sẫm có vệt xanh rỉ + xước
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#221d12'); g.addColorStop(.5, '#14110b'); g.addColorStop(1, '#1f1a0f'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${r() < .35 ? '46,74,58' : r() < .5 ? '120,96,48' : '8,7,5'},${r() * .12})`; x.beginPath(); x.arc(r() * W, r() * H, 2 + r() * 16, 0, 7); x.fill(); }
      x.strokeStyle = 'rgba(160,140,90,.05)'; x.lineWidth = 1; for (let i = 0; i < 260; i++) { const px = r() * W, py = r() * H; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - .5) * 60, py + (r() - .5) * 14); x.stroke(); }
    }
    if (k === 'loi') { for (let i = 0; i < 900; i++) { const v = r() < .5 ? 0 : 255; x.fillStyle = `rgba(${v},${v},${v},.04)`; x.fillRect(r() * W, r() * H, 3 + r() * 9, 3 + r() * 9); } }
    // ô lõm: ô vòm trên (rộng cả 2 cánh), 2 ô dưới mỗi cánh
    x.fillStyle = lom;
    x.beginPath(); x.moveTo(118, 640); x.lineTo(118, CY); x.arc(512, CY, R0 - 118, Math.PI, 0); x.lineTo(906, 640); x.closePath(); x.fill();
    for (const ox of [0, 512]) x.fillRect(ox + 104, 1150, 304, 262);
    // tia nổi trong ô vòm trên (mặt trời mọc)
    x.strokeStyle = vang; x.lineWidth = k === 'loi' ? 7 : 4;
    for (let i = 1; i < 18; i++) { const a = Math.PI + Math.PI * i / 18; x.beginPath(); x.moveTo(512 + Math.cos(a) * 70, 640 + Math.sin(a) * 70); x.lineTo(512 + Math.cos(a) * 380, 640 + Math.sin(a) * 380); x.stroke(); }
    x.beginPath(); x.arc(512, 640, 64, Math.PI, 0); x.stroke();
    // viền ngoài theo vòm + viền hạt cườm
    x.lineWidth = 16; vom(x, 14); x.stroke();
    x.lineWidth = 5; vom(x, 52); x.stroke(); vom(x, 104); x.stroke();
    x.fillStyle = vang; for (let i = 0; i <= 40; i++) { const a = Math.PI + Math.PI * i / 40; x.beginPath(); x.arc(512 + Math.cos(a) * (R0 - 78), CY + Math.sin(a) * (R0 - 78), 6, 0, 7); x.fill(); }
    // meander dọc 2 mép mỗi cánh + ngang dưới ô vòm, trên ô dưới và đáy
    x.lineWidth = 6; x.lineCap = 'square';
    for (const ox of [0, 512]) { meander(x, ox + 62, 540, H - 620, true); meander(x, ox + 512 - 92, 540, H - 620, true); meander(x, ox + 104, 670, 304, false); meander(x, ox + 104, 1104, 304, false); meander(x, ox + 104, 1440, 304, false); }
    // đinh tán dọc 2 mép mỗi cánh
    for (const ox of [0, 512]) for (let y = 560; y < H - 50; y += 58) for (const dx of [34, 512 - 34]) {
      const g = x.createRadialGradient(ox + dx - 2, y - 2, 1, ox + dx, y, 9); g.addColorStop(0, k === 'mau' ? '#f3d68a' : vang); g.addColorStop(1, vang); x.fillStyle = g; x.beginPath(); x.arc(ox + dx, y, 8, 0, 7); x.fill(); }
    // hoa hồng nổi ở ô dưới
    for (const ox of [0, 512]) { const cx = ox + 256, cy = 1281; x.fillStyle = vang;
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; x.beginPath(); x.ellipse(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44, 40, 15, a, 0, 7); x.fill(); }
      x.fillStyle = lom; x.beginPath(); x.arc(cx, cy, 26, 0, 7); x.fill(); x.fillStyle = vang; x.beginPath(); x.arc(cx, cy, 15, 0, 7); x.fill();
      x.strokeStyle = vang; x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, 104, 0, 7); x.stroke(); }
    // mặt trời giữa, chia đôi 2 cánh: 32 tia hình ngọn lửa xen dài/ngắn, 2 vòng, núm giữa
    { const cx = 512, cy = 880; x.fillStyle = lom; x.beginPath(); x.arc(cx, cy, 236, 0, 7); x.fill();
      x.fillStyle = vang;
      for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, L = i % 2 ? 182 : 226, w = i % 2 ? .07 : .095;
        x.beginPath(); x.moveTo(cx + Math.cos(a - w) * 124, cy + Math.sin(a - w) * 124);
        x.quadraticCurveTo(cx + Math.cos(a + w * .9) * (L * .8), cy + Math.sin(a + w * .9) * (L * .8), cx + Math.cos(a) * L, cy + Math.sin(a) * L);
        x.quadraticCurveTo(cx + Math.cos(a - w * .2) * (L * .7), cy + Math.sin(a - w * .2) * (L * .7), cx + Math.cos(a + w) * 124, cy + Math.sin(a + w) * 124); x.closePath(); x.fill(); }
      x.strokeStyle = vang; x.lineWidth = 12; x.beginPath(); x.arc(cx, cy, 118, 0, 7); x.stroke(); x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, 244, 0, 7); x.stroke();
      const g = x.createRadialGradient(cx - 24, cy - 28, 6, cx, cy, 98); g.addColorStop(0, k === 'mau' ? '#f6dc96' : k === 'loi' ? '#ffffff' : vang); g.addColorStop(.7, vang); g.addColorStop(1, k === 'mau' ? '#6d5222' : vang); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 96, 0, 7); x.fill();
      x.strokeStyle = lom; x.lineWidth = 4; for (const rr of [70, 40]) { x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.stroke(); } }
    // khe giữa 2 cánh
    x.fillStyle = k === 'loi' ? '#202020' : k === 'nham' ? '#d0d0d0' : '#050403'; x.fillRect(509, 0, 6, H);
  }
  return lop.map(([k, c]) => { const t = new THREE.CanvasTexture(c); if (k === 'mau' || k === 'sang') t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; });
}
// bảng chú thích nhỏ trên bệ
const _bien = {};
function canBang(ten, phu) {   // tấm đồng khắc kiểu nhãn hiện vật: tên, dòng phụ, PLEASE DO NOT TOUCH
  const key = ten + '|' + phu; if (_bien[key]) return _bien[key];
  const c = document.createElement('canvas'); c.width = 768; c.height = 384; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 768, 384); g.addColorStop(0, '#8c6a2c'); g.addColorStop(.45, '#c9a35a'); g.addColorStop(.55, '#b48d45'); g.addColorStop(1, '#7a5a22'); x.fillStyle = g; x.fillRect(0, 0, 768, 384);
  for (let i = 0; i < 380; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,240,200' : '60,40,10'},${Math.random() * .06})`; x.fillRect(0, Math.random() * 384, 768, 1); }
  x.strokeStyle = 'rgba(40,26,6,.85)'; x.lineWidth = 6; x.strokeRect(16, 16, 736, 352); x.lineWidth = 2; x.strokeRect(30, 30, 708, 324);
  x.fillStyle = '#2a1c06'; x.textAlign = 'center';
  let co = 76; x.font = `600 ${co}px Georgia, 'Times New Roman', serif`; while (x.measureText(ten).width > 660 && co > 30) { co -= 4; x.font = `600 ${co}px Georgia, 'Times New Roman', serif`; }
  x.fillText(ten, 384, 128);
  x.font = 'italic 38px Georgia, serif'; x.fillText(phu, 384, 184);
  x.fillRect(250, 214, 268, 3);
  x.font = '500 34px "IBM Plex Mono", monospace'; x.fillText('PLEASE DO NOT TOUCH', 384, 290);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return (_bien[key] = t);
}
// đá vụn: khối đa diện méo
function daVun(seed, s = 1) { const g = new THREE.IcosahedronGeometry(s, 0), p = g.attributes.position, r = rnd(seed);
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (.7 + r() * .6), p.getY(i) * (.5 + r() * .5), p.getZ(i) * (.7 + r() * .6)); g.computeVertexNormals(); return g; }
// ---------- bản 6: vật trưng 3D dựng bằng code: sách phép (Other Projects) + đũa phép (Freelance) ----------
const em = t => t * t * (3 - 2 * t);
let _texQuang = null;
function texQuang() { if (_texQuang) return _texQuang; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return (_texQuang = new THREE.CanvasTexture(c)); }
function quangSprite(mau, co, a = .8) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texQuang(), color: new THREE.Color(mau).multiplyScalar(1.6), transparent: true, opacity: a, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(co); return s; }
function taoHat(n, m1, m2, kieu) {
  const a = new Float32Array(n * 4); for (let i = 0; i < n * 4; i++) a[i] = Math.random();
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aR', new THREE.BufferAttribute(a, 4));
  const p = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uPx: { value: Math.min(devicePixelRatio, 1.5) }, uKieu: { value: kieu }, uM1: { value: new THREE.Color(m1) }, uM2: { value: new THREE.Color(m2) } },
    vertexShader: HAT_VS, fragmentShader: HAT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  p.frustumCulled = false; return p;
}
function canTrang(seed, phat) {   // trang giấy da cổ: vòng phép + dòng ký tự rune. phat = chỉ nét (làm bản đồ phát sáng)
  const S = 512, c = document.createElement('canvas'); c.width = S; c.height = Math.round(S * 1.38); const x = c.getContext('2d'), r = rnd(seed), H = c.height;
  if (!phat) { const g = x.createRadialGradient(S / 2, H / 2, 40, S / 2, H / 2, S * .85); g.addColorStop(0, '#eadcb6'); g.addColorStop(1, '#9c7f4e'); x.fillStyle = g; x.fillRect(0, 0, S, H); }
  else { x.fillStyle = '#000'; x.fillRect(0, 0, S, H); }
  x.strokeStyle = phat ? '#fff' : 'rgba(58,26,70,.85)'; x.lineWidth = phat ? 3.2 : 2.4; x.lineCap = 'round';
  const cx = S / 2, cy = H * .33;
  for (const R of [96, 74, 30]) { x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke(); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; x.beginPath(); x.moveTo(cx + Math.cos(a) * 96, cy + Math.sin(a) * 96); x.lineTo(cx + Math.cos(a + 2.094) * 96, cy + Math.sin(a + 2.094) * 96); x.stroke(); }
  for (let y = H * .58; y < H - 40; y += 36) for (let xx = 46; xx < S - 56; xx += 22 + r() * 9) {
    const k = Math.floor(r() * 4); x.beginPath();
    if (k === 0) { x.moveTo(xx, y); x.lineTo(xx + 9, y - 16); x.lineTo(xx + 14, y); } else if (k === 1) { x.moveTo(xx + 6, y - 18); x.lineTo(xx + 6, y); x.moveTo(xx, y - 10); x.lineTo(xx + 12, y - 6); }
    else if (k === 2) x.arc(xx + 7, y - 8, 7, 0, Math.PI * 1.4); else { x.moveTo(xx, y); x.lineTo(xx + 12, y - 16); x.moveTo(xx + 12, y); x.lineTo(xx, y - 16); }
    x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function vatSach(mau, dt) {   // sách cổ mở: bìa da tím than, góc kim loại vàng, trang rune phát sáng, 1 trang lật đều, hạt sáng bay lên
  const g = new THREE.Group(), vang = new THREE.Color(0xffc95a);
  const mDa = new THREE.MeshStandardMaterial({ color: 0x3b1d3f, roughness: .55, metalness: .1, emissive: 0x14061c });
  const mKim = new THREE.MeshStandardMaterial({ color: 0xd8a64a, roughness: .3, metalness: 1, emissive: 0x3a2406 });
  const mMep = new THREE.MeshStandardMaterial({ color: 0xcdb98c, roughness: .9, emissive: 0x1a140a });
  const tPhat = canTrang(3, true);
  const mTrang = new THREE.MeshStandardMaterial({ map: canTrang(3, false), roughness: .85, emissive: new THREE.Color(mau).lerp(vang, .4), emissiveMap: tPhat, emissiveIntensity: 2.2 });
  const W = .6, H = .84;
  const nua = s => { const p = new THREE.Group();
    const bia = new THREE.Mesh(new THREE.BoxGeometry(W + .05, H + .07, .04), mDa); bia.position.set(s * (W + .05) / 2, 0, -.03); p.add(bia);
    const khoi = new THREE.Mesh(new THREE.BoxGeometry(W, H, .07), [mMep, mMep, mMep, mMep, mTrang, mMep]); khoi.position.set(s * W / 2, 0, .025); p.add(khoi);
    for (const yy of [-1, 1]) { const goc = new THREE.Mesh(new THREE.BoxGeometry(.13, .13, .055), mKim); goc.position.set(s * (W + .02), yy * (H / 2 + .02), -.03); goc.rotation.z = Math.PI / 4; p.add(goc); }
    const dinh = new THREE.Mesh(new THREE.SphereGeometry(.025, 10, 8), mKim); dinh.position.set(s * (W - .06), 0, -.055); p.add(dinh);
    p.rotation.y = s * .32; return p; };
  g.add(nua(-1), nua(1));
  const gay = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, H + .07, 14, 1, true, Math.PI / 2, Math.PI), mDa); gay.position.z = -.04; g.add(gay);
  const mLat = mTrang.clone(); mLat.side = THREE.DoubleSide;
  const lat = new THREE.Group(), tl = new THREE.Mesh(new THREE.PlaneGeometry(W * .96, H * .95), mLat); tl.position.x = W * .48; lat.add(tl); lat.position.z = .064; g.add(lat);
  const sp = quangSprite(new THREE.Color(mau).lerp(vang, .25), 2.2, .55); sp.position.z = .15; g.add(sp);
  const hat = taoHat(dt ? 26 : 60, mau, vang, 0); hat.position.z = .08; g.add(hat);
  g.rotation.x = -.42;
  return { g, capNhat(T) { const p = (T % 4.2) / 4.2, e = p < .55 ? 0 : em((p - .55) / .45); lat.rotation.y = .32 + e * (Math.PI - .64); lat.position.z = .064 + Math.sin(e * Math.PI) * .04;
    hat.material.uniforms.uT.value = T; mTrang.emissiveIntensity = mLat.emissiveIntensity = 2 + .6 * Math.sin(T * 2.3); sp.material.opacity = .45 + .15 * Math.sin(T * 2.3); } };
}
function vatDua(mau, dt) {   // đũa phép gỗ sẫm, tay cầm khấc, 2 khoen vàng, vạch sáng teal, đầu đũa phát sáng + hạt toé
  const g = new THREE.Group(), q = new THREE.Group(); g.add(q);
  const mGo = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: .5, metalness: .05, emissive: 0x0a0503 });
  const mKim = new THREE.MeshStandardMaterial({ color: 0xd8a64a, roughness: .3, metalness: 1, emissive: 0x3a2406 });
  const prof = [[0, 0], [.05, 0], [.056, .03], [.046, .06], [.052, .1], [.044, .16], [.052, .2], [.043, .26], [.049, .31], [.04, .34], [.034, .36], [.03, .6], [.024, .9], [.017, 1.15], [.012, 1.24], [0, 1.25]];
  q.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 14), mGo));
  for (const y of [.035, .35]) { const v = new THREE.Mesh(new THREE.TorusGeometry(.05, .01, 6, 18), mKim); v.rotation.x = Math.PI / 2; v.position.y = y; q.add(v); }
  const vach = new THREE.Mesh(new THREE.CylinderGeometry(.033, .033, .022, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(mau).multiplyScalar(2.6) })); vach.position.y = .46; q.add(vach);
  const dinh = new THREE.Mesh(new THREE.SphereGeometry(.03, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(mau).lerp(new THREE.Color(0xffffff), .5).multiplyScalar(6) })); dinh.position.y = 1.26; q.add(dinh);
  const sp = quangSprite(mau, .9, .8); sp.position.y = 1.26; q.add(sp);
  const hat = taoHat(dt ? 24 : 50, mau, 0xffffff, 1); hat.position.y = 1.26; q.add(hat);
  q.position.y = -.62; g.rotation.z = -.7;
  return { g, capNhat(T) { hat.material.uniforms.uT.value = T; const p = 1 + .25 * Math.sin(T * 3.1) + (Math.sin(T * 7.3) > .92 ? .35 : 0); dinh.scale.setScalar(p); sp.scale.setScalar(.9 * p);
    g.rotation.z = -.7 + Math.sin(T * .9) * .06; } };
}
// (bản 5 có hinhManh: chia logo thành mảnh tam giác; bản 6 không dùng nữa, logo khối liền)
function hinhManh_khongDung(w, h, seed) {
  const r = rnd(seed), nx = 12, ny = Math.max(3, Math.round(12 * h / w)), V = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const bien = i === 0 || j === 0 || i === nx || j === ny;
    V.push([(i / nx - .5) * w + (bien ? 0 : (r() - .5) * w / nx * .7), (j / ny - .5) * h + (bien ? 0 : (r() - .5) * h / ny * .7)]);
  }
  const pos = [], uv = [], tam = [], bay = [], xoay = [], tre = [];
  const tg = (a, b, c) => {
    const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
    const d = V3(cx / w + (r() - .5) * .8, cy / h * .6 + (r() - .5) * .8, (r() - .5) * 1.6).normalize().multiplyScalar(.16 + r() * .5);
    const ax = V3(r() - .5, r() - .5, r() - .5).normalize(), g = (r() - .5) * 4.5, t = r();
    for (const q of [a, b, c]) { pos.push(q[0], q[1], 0); uv.push(q[0] / w + .5, q[1] / h + .5); tam.push(cx, cy, 0); bay.push(d.x, d.y, d.z); xoay.push(ax.x, ax.y, ax.z, g); tre.push(t); }
  };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = V[j * (nx + 1) + i], b = V[j * (nx + 1) + i + 1], c = V[(j + 1) * (nx + 1) + i], d = V[(j + 1) * (nx + 1) + i + 1];
    if (r() < .5) { tg(a, b, d); tg(a, d, c); } else { tg(a, b, c); tg(b, d, c); }
  }
  const g = new THREE.BufferGeometry(), F = (k, a, n) => g.setAttribute(k, new THREE.Float32BufferAttribute(a, n));
  F('position', pos, 3); F('uv', uv, 2); F('aTam', tam, 3); F('aBay', bay, 3); F('aXoay', xoay, 4); F('aTre', tre, 1);
  return g;
}
// thân cột gãy: rãnh + đầu trên lởm chởm
function cotGay(H, seed, R = .47) {
  const g = thanCotRanh(R, R * .93, H, 20, .045), p = g.attributes.position, r = rnd(seed);
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > H - .01) p.setY(i, H - r() * .45 - .2 * Math.sin(p.getX(i) * 6 + seed)); }
  g.computeVertexNormals(); return g;
}

export async function khoiTao({ canvas, coSo = '../', duAn = [], cho = false }) {   // gop-3: cho = tải xong nhưng chưa vẽ (chờ trang gộp gọi chay())
  const nhe = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dienThoai = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
  const dt0 = Math.min(devicePixelRatio, 1.5);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); renderer.debug.checkShaderErrors = new URLSearchParams(location.search).has('soiShader');   // tối ưu tải 10/11: tắt đọc log shader (làm lần vẽ đầu chậm vài giây); ?soiShader để bật lại khi soi lỗi
  renderer.setPixelRatio(dt0);
  renderer.info.autoReset = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;   // tối ưu 10/11: 1 nguồn bóng (trăng), chỉ tính lại khi vào bảo tàng / khi trăng đổi chỗ
  const QS = new URLSearchParams(location.search);   // cờ đo: ?msaa=0|4 ?fxaa=0 ?guong=k ?guongCach=n ?pr=x
  const scene = new THREE.Scene();
  const MAU_NEN = new THREE.Color(0x020708), MAU_SUONG = new THREE.Color(0x061719), SUONG_AM = new THREE.Color(0x1a1209);
  scene.background = MAU_NEN.clone();
  scene.fog = new THREE.FogExp2(MAU_SUONG.clone(), .026);
  const cam = new THREE.PerspectiveCamera(50, 1, .05, 400);
  const suKien = [];
  const nghe = (o, t, f, opt) => { o.addEventListener(t, f, opt); suKien.push([o, t, f, opt]); };
  // nhóm theo đoạn để ẩn bớt khi máy quay ở xa (giảm lệnh vẽ)
  const DOAN = { cong: new THREE.Group(), sanhA: new THREE.Group(), sanhB: new THREE.Group(), cu: new THREE.Group(), ngoai: new THREE.Group() };
  for (const k in DOAN) scene.add(DOAN[k]);
  const chonVat = [];  // hộp chọn tương tác
  const doanCua = z => z > -1.5 ? DOAN.cong : z > -33 ? DOAN.sanhA : z > -63 ? DOAN.sanhB : z > -97 ? DOAN.cu : DOAN.ngoai;
  const them = (o, z = o.position.z) => { doanCua(z).add(o); return o; };

  // ---------- tải tài nguyên ----------
  const tlo = new THREE.TextureLoader();
  const nap = async (f, srgb, rx = 1, ry = rx) => { const t = await tlo.loadAsync(TN(`${dienThoai ? 'dt' : 'pc'}/${f}`));   // bản 5: bộ ảnh nén (máy tính 1024/512, điện thoại 512/256) if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = dienThoai ? 4 : 8; return t; };
  const pm = new THREE.PMREMGenerator(renderer);
  const gltfL = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const napGLB = f => gltfL.loadAsync(MH(f)).catch(e => { console.warn('Không nạp được', f, e.message); return null; });
  const nh = f => dienThoai && ['tuong-apollo', 'tuong-amazon', 'tuong-zeus', 'tuong-dionysos', 'tuong-co-gai'].includes(f) ? f + '-nhe.glb' : f + '.glb';
  // bản 5: chỉ chờ thứ cần cho cảnh đầu (HDR, đá, sàn, đồng, bộ xương); tượng + tranh tải nền sau khi đã vẽ khung đầu
  const [hdr, kD, kR, kN, vD, vR, vN, sD, sR, sN, dR, dN, gXuong] = await Promise.all([
    new RGBELoader().loadAsync(TN('dem-512-hdr.wasm')),   // gop-3: dem_512.hdr đổi đuôi .wasm
    nap('da-khoi_diff.jpg', 1), nap('da-khoi_rough.jpg'), nap('da-khoi_nor.jpg'),
    nap('da-van_diff.jpg', 1, 2, 3.6), nap('da-van_rough.jpg', 0, 2, 3.6), nap('da-van_nor.jpg', 0, 2, 3.6),
    nap('san_diff.jpg', 1, 4.6, 20), nap('san_rough.jpg', 0, 4.6, 20), nap('san_nor.jpg', 0, 4.6, 20),
    nap('dong_rough.jpg', 0, 1.2, 2.6), nap('dong_nor.jpg', 0, 1.2, 2.6),
    napGLB('bo-xuong.glb'),
  ]);
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  const env = pm.fromEquirectangular(hdr).texture; hdr.dispose();

  // ---------- vật liệu ----------
  // tối ưu 10/11: MeshPhysical → MeshStandard (bỏ clearcoat/sheen nhẹ, khó thấy); chỉ giữ Physical khi clearcoat ≥ .8 (bậc thềm ướt)
  const PM = o => { if ((o.clearcoat ?? 0) >= .8) return new THREE.MeshPhysicalMaterial(o);
    const { clearcoat, clearcoatRoughness, sheen, sheenRoughness, sheenColor, ...r } = o; return new THREE.MeshStandardMaterial(r); };
  const daKhoi = (mau, o = {}) => PM({ map: kD, roughnessMap: kR, normalMap: kN, normalScale: new THREE.Vector2(.7, .7), color: mau, roughness: .95, clearcoat: .12, clearcoatRoughness: .55, envMap: env, envMapIntensity: .22, ...o });
  const daVan = (mau, o = {}) => PM({ map: vD, roughnessMap: vR, normalMap: vN, normalScale: new THREE.Vector2(.16, .16), color: mau, roughness: .7, clearcoat: .35, clearcoatRoughness: .3, envMap: env, envMapIntensity: .3, ...o });
  const [tCuaMap, tCuaE, tCuaLoi, tCuaNham] = canCuaVom();
  const M = {
    da: lamCu(daKhoi(new THREE.Color(0x9fb6b2)), { min: .5, vet: .55, bam: .45, cao: 1.3, ten: 'cu-da' }),
    daSang: lamCu(daVan(new THREE.Color(0xc4d4d0)), { min: .55, vet: .4, bam: .3, cao: 1.2, ten: 'cu-dasang' }),
    daToi: lamCu(daKhoi(new THREE.Color(0x60716f)), { min: .45, vet: .35, bam: .35, cao: 1.6, ten: 'cu-datoi' }),
    nen: lamCu(daKhoi(new THREE.Color(0x56686a)), { min: 1, vet: 0, bam: .5, ten: 'cu-nen' }),
    bac: lamCu(daKhoi(new THREE.Color(0x8aa09d), { roughness: .35, clearcoat: .9, clearcoatRoughness: .08 }), { min: .6, vet: .2, bam: .3, cao: .8, ten: 'cu-bac' }),   // bậc thềm ướt
    cot: lamCu(daVan(new THREE.Color(0xc9d6d2)), { min: .42, vet: .3, bam: .25, cao: 1.6, ten: 'cu-cot' }),
    cotNgoai: lamCu(daVan(new THREE.Color(0xbfd0cc)), { day: 1.5, min: .4, vet: .55, bam: .4, cao: 1.4, ten: 'cu-cotngoai' }),
    be: lamCu(daVan(new THREE.Color(0xd5dfdb), { envMapIntensity: .45 }), { min: .62, vet: 0, bam: .12, cao: .9, ten: 'cu-be' }),
    cua: PM({ map: tCuaMap, emissiveMap: tCuaE, emissive: new THREE.Color(0xffc060), emissiveIntensity: .75, roughnessMap: tCuaNham, bumpMap: tCuaLoi, bumpScale: 2.2, color: 0xffffff, metalness: .88, roughness: .9, clearcoat: .25, clearcoatRoughness: .4, envMap: env, envMapIntensity: 1.1 }),
    dongKhung: PM({ color: 0x4e3f1d, metalness: .9, roughness: .4, roughnessMap: dR, envMap: env, envMapIntensity: .8 }),
    dongBong: PM({ color: 0xb08a3e, metalness: 1, roughness: .28, envMap: env, envMapIntensity: 1 }),
    vangKhung: PM({ color: 0xd4a84a, metalness: 1, roughness: .3, roughnessMap: dR, envMap: env, envMapIntensity: 1.2, emissive: new THREE.Color(0x3a2808), emissiveIntensity: .6 }),
    tran: PM({ map: canTran(), color: 0x7f908e, roughness: .9, side: THREE.DoubleSide, envMap: env, envMapIntensity: .1 }),
    xuong: PM({ color: 0xe0d2ab, roughness: .58, vertexColors: !!gXuong, clearcoat: .15, clearcoatRoughness: .6, envMap: env, envMapIntensity: .35 }),
    ao: PM({ color: 0x7299cf, roughness: .88, sheen: .35, sheenRoughness: .7, sheenColor: new THREE.Color(0xcfe2ff), side: THREE.DoubleSide, envMap: env, envMapIntensity: .25 }),
    cavat: PM({ color: 0x15234a, roughness: .55, sheen: .4, sheenColor: new THREE.Color(0x5b74b8), side: THREE.DoubleSide }),
    mu: PM({ color: 0x1a2a55, roughness: .9, sheen: .7, sheenRoughness: .8, sheenColor: new THREE.Color(0x4a64a8) }),
    muLuoi: PM({ color: 0x15224a, roughness: .7, side: THREE.DoubleSide }),
    dui: PM({ color: 0x0b0b0c, roughness: .35, clearcoat: .6, envMap: env, envMapIntensity: .6 }),
    dep: PM({ color: 0x2c5a96, roughness: .75 }),
    vang: PM({ color: 0xd8b25a, metalness: 1, roughness: .3, envMap: env }),
    vangThe: PM({ color: 0xe0c040, roughness: .5 }),
    hoc: new THREE.MeshStandardMaterial({ color: 0x040808, roughness: .95 }),
    nhung: PM({ color: 0x7a0c16, roughness: .8, sheen: 1, sheenRoughness: .5, sheenColor: new THREE.Color(0xff4a5a) }),
    vai: PM({ color: 0xb9b5a8, roughness: .95, sheen: .6, sheenColor: new THREE.Color(0xe8e2d0), side: THREE.DoubleSide }),
    vaiToi: PM({ color: 0x4a4f4c, roughness: .95, sheen: .4, sheenColor: new THREE.Color(0x9aa29e), side: THREE.DoubleSide }),
    go: new THREE.MeshStandardMaterial({ color: 0x3a2c1e, roughness: .85 }),
    sat: new THREE.MeshStandardMaterial({ color: 0x3c4446, roughness: .6, metalness: .7, envMap: env, envMapIntensity: .5 }),
    tranh: new THREE.MeshStandardMaterial({ color: 0x0c1110, roughness: .7 }),
    kinh: PM({ color: 0xcfeee8, roughness: .04, metalness: 0, transparent: true, opacity: .14, envMap: env, envMapIntensity: 1.4, depthWrite: false }),
    co: new THREE.MeshStandardMaterial({ color: 0x1d3328, roughness: .9, side: THREE.DoubleSide }),
    phTen: new THREE.MeshStandardMaterial({ color: 0x2b3836, roughness: .9 }),
  };
  M.ao.side = THREE.DoubleSide;
  const quangMat = (mau, a) => new THREE.ShaderMaterial({ uniforms: { uMau: { value: new THREE.Color(mau) }, uA: { value: a } }, vertexShader: UV_VS, fragmentShader: QUANG_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const uvTheoCo = (g, x, y, z) => { const uv = g.attributes.uv, p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < uv.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
      const a = ax > .5 ? [p.getZ(i), p.getY(i)] : ay > .5 ? [p.getX(i), p.getZ(i)] : [p.getX(i), p.getY(i)];
      uv.setXY(i, (a[0] + x * .37 + z * .53) / 4, (a[1] + y * .21) / 4); } return g; };
  const hop = (w, h, d, x, y, z, mat = M.da, rep) => {
    const g = new THREE.BoxGeometry(w, h, d); if (rep !== false) uvTheoCo(g, x, y, z);
    const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); them(m); return m;
  };

  // ============ CỔNG VÒM ============
  const sanNgoai = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), M.nen); sanNgoai.rotation.x = -Math.PI / 2; sanNgoai.position.set(0, 0, 20); DOAN.cong.add(sanNgoai);
  { const uv = sanNgoai.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 15, uv.getY(i) * 10); }
  const NEN = 1.5;                                      // cao bệ nền
  hop(30, NEN, 3.4, 0, NEN / 2, 1.7 - .01, M.bac);
  for (let i = 0; i < 4; i++) { const h = 1.2 - i * .3; hop(8.2, h, .72, 0, h / 2, 3.4 + .36 + i * .72, M.bac); }
  for (const s of [-1, 1]) { hop(6.6, NEN, 4.2, s * 7.4, NEN / 2, 5.1); hop(6.8, .16, 4.4, s * 7.4, NEN + .08, 5.1); }
  // tường + lỗ vòm ngoài (r 3.6) ở z = 0, lớp trong có lỗ cửa (r 2.0) ở z = -0.7
  const voml = (r, xx, chan) => { const p = new THREE.Path(); p.moveTo(xx - r, chan); p.lineTo(xx - r, chan + 4.0); p.absarc(xx, chan + 4.0, r, Math.PI, 0, true); p.lineTo(xx + r, chan); p.closePath(); return p; };
  const tuongVom = (rong, cao, r, z, sau, mat) => {
    const s = new THREE.Shape(); s.moveTo(-rong / 2, 0); s.lineTo(rong / 2, 0); s.lineTo(rong / 2, cao); s.lineTo(-rong / 2, cao); s.closePath();
    s.holes.push(voml(r, 0, NEN - .001));
    const g = new THREE.ExtrudeGeometry(s, { depth: sau, bevelEnabled: false, curveSegments: 24 });
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 4, uv.getY(i) / 4);
    const m = new THREE.Mesh(g, mat); m.position.z = z - sau; DOAN.cong.add(m); return m;
  };
  tuongVom(30, 16, 3.6, 0, .7, M.da);
  tuongVom(9, 12, 2.0, -.7, .6, M.daSang);
  // gờ vòm trong (khung quanh cửa) + gờ vòm ngoài
  const vanhVom = (r0, r1, z, sau, mat) => { const s = new THREE.Shape(); s.moveTo(-r1, NEN); s.lineTo(-r1, NEN + 4); s.absarc(0, NEN + 4, r1, Math.PI, 0, true); s.lineTo(r1, NEN); s.lineTo(r0, NEN); s.lineTo(r0, NEN + 4); s.absarc(0, NEN + 4, r0, 0, Math.PI, false); s.lineTo(-r0, NEN); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: sau, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 2, curveSegments: 28 }); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 4, uv.getY(i) / 4);
    const m = new THREE.Mesh(g, mat); m.position.z = z; DOAN.cong.add(m); return m; };
  vanhVom(2.0, 2.32, -.72, .2, M.daSang); vanhVom(3.6, 3.95, -.02, .16, M.daSang); vanhVom(3.35, 3.6, -.68, .7, M.daSang);
  // ô trần chạm khắc trên dải vòm giữa r 2.35 → 3.35 (mặt lớp trong): khung + lõm tối + hoa hồng giữa
  { const khung = [], lom = [];
    const o = (cx, cy, ang, kt) => {
      const q = new THREE.Quaternion().setFromAxisAngle(V3(0, 0, 1), ang);
      for (const [w, h, dx, dy] of [[kt, .1, 0, kt / 2 - .05], [kt, .1, 0, -kt / 2 + .05], [.1, kt, kt / 2 - .05, 0], [.1, kt, -kt / 2 + .05, 0]]) {
        const b = new THREE.BoxGeometry(w, h, .14); b.translate(dx, dy, 0); b.applyQuaternion(q); b.translate(cx, cy, -.62); khung.push(b); }
      const l = new THREE.BoxGeometry(kt - .2, kt - .2, .05); l.applyQuaternion(q); l.translate(cx, cy, -.68); lom.push(l);
      const h = new THREE.SphereGeometry(.07, 10, 6); h.scale(1, 1, .4); h.translate(cx, cy, -.64); khung.push(h);
    };
    for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; o(Math.cos(a) * 2.85, NEN + 4 + Math.sin(a) * 2.85, a - Math.PI / 2, .78); }
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) o(s * 2.85, NEN + .55 + k * .95, 0, .78);
    const fix = a => a.map(g => g.index ? g.toNonIndexed() : g).map(g => { g.deleteAttribute('uv'); return g; });
    DOAN.cong.add(new THREE.Mesh(mergeGeometries(fix(khung), false), M.daSang), new THREE.Mesh(mergeGeometries(fix(lom), false), M.daToi)); }
  // 2 cánh cửa vòm: trái đóng, phải hé; 1 canvas phủ cả 2 cánh (mặt trời chia đôi)
  const RC = 2.0, CH = 4.0;
  const canh = trai => { const s = new THREE.Shape(); if (trai) { s.moveTo(-RC, 0); s.lineTo(0, 0); s.lineTo(0, CH + RC); s.absarc(0, CH, RC, Math.PI / 2, Math.PI, false); s.closePath(); }
    else { s.moveTo(0, 0); s.lineTo(RC, 0); s.lineTo(RC, CH); s.absarc(0, CH, RC, 0, Math.PI / 2, false); s.closePath(); }
    const g = new THREE.ExtrudeGeometry(s, { depth: .12, bevelEnabled: false, curveSegments: 20 });
    const uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + RC) / (2 * RC), p.getY(i) / (CH + RC));
    return g; };
  const canhTrai = new THREE.Mesh(canh(true), M.cua); canhTrai.position.set(0, NEN, -.95); DOAN.cong.add(canhTrai);
  const banLe = new THREE.Group(); banLe.position.set(RC, NEN, -.95); DOAN.cong.add(banLe);
  const gPhai = canh(false); gPhai.translate(-RC, 0, 0); const canhPhai = new THREE.Mesh(gPhai, M.cua); banLe.add(canhPhai);
  banLe.rotation.y = -.95;
  // vòng gõ cửa đồng có núm (bản 5)
  for (const cha of [canhTrai, canhPhai]) {
    const x = cha === canhTrai ? -1.0 : -1.0;
    const num = new THREE.Mesh(new THREE.SphereGeometry(.085, 16, 10).scale(1, 1, .55), M.dongBong); num.position.set(x, 1.98, .15); cha.add(num);
    const vong = new THREE.Mesh(new THREE.TorusGeometry(.16, .022, 10, 32), M.dongBong); vong.position.set(x, 1.8, .17); vong.rotation.x = -.18; cha.add(vong);
  }
  // ánh vàng sau khe cửa: tấm sáng + sương ấm + đèn rọi ra bậc (bóng)
  const kheU = { uA: { value: 1 }, uT: { value: 0 } };
  const khe = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6.2), new THREE.ShaderMaterial({ uniforms: kheU, vertexShader: UV_VS, fragmentShader: KHE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  khe.position.set(.9, NEN + 3.1, -3.0); DOAN.cong.add(khe);   // bản 5: lùi ra sau mép cánh hé (trước đây cắt ngang cánh → vệt sáng thẳng trên cửa)
  const denKhe = new THREE.SpotLight(AM, 95, 22, .5, 1, 1.5); denKhe.position.set(.9, 5.6, -4); denKhe.target.position.set(.2, 1, 3.8); scene.add(denKhe, denKhe.target);
  // đèn tường đỏ trong vòm ngoài
  const dendo = [], quangDo = [], denFlare = [];
  for (const s of [-1, 1]) {
    const de = new THREE.Mesh(new THREE.CylinderGeometry(.06, .1, .35, 10), M.dongKhung); de.position.set(s * 2.95, 4.6, -.5); DOAN.cong.add(de);
    const tay = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, .3), M.dongKhung); tay.position.set(s * 2.95, 4.75, -.4); DOAN.cong.add(tay);
    const bong = new THREE.Mesh(new THREE.CylinderGeometry(.15, .09, .36, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(DO).multiplyScalar(4) }));
    bong.position.set(s * 2.95, 5.0, -.3); DOAN.cong.add(bong); denFlare.push({ p: bong.position.clone(), c: new THREE.Color(0xff6a78) });
    const pl = new THREE.PointLight(DO, 9, 9, 1.8); pl.position.set(s * 2.95, 5.0, .2); scene.add(pl);
    const qU = { uMau: { value: new THREE.Color(DO) }, uA: { value: .55 } };
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.ShaderMaterial({ uniforms: qU, vertexShader: UV_VS, fragmentShader: QUANG_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    q.position.set(s * 2.95, 5.0, -.1); DOAN.cong.add(q); quangDo.push(q);
    dendo.push({ pl, bong, qU });
  }
  // cột Doric 2 bên + dầm
  const gDoric = cotDoric(9.2);
  for (const x of [-5.1, 5.1, -9.6, 9.6]) { const c = new THREE.Mesh(gDoric, M.cotNgoai); c.position.set(x, NEN + .16, 2.4); DOAN.cong.add(c); }
  hop(22, 1.2, 1.8, 0, NEN + 9.36 + .76, 2.4); hop(22.6, .45, 2.1, 0, NEN + 11.6, 2.45); hop(22, .3, 3.4, 0, NEN + 11.4, .9);
  for (let i = -10; i <= 10; i += 1.5) hop(.3, .75, .12, i, NEN + 10.1, 3.32, M.daToi);
  // bộ xương
  const PX = gXuong ? chuanXuong(gXuong) : null;
  const xuongs = PX ? [boXuong(0, M, PX), boXuong(1, M, PX)] : [];
  if (xuongs.length) {
    xuongs[0].position.set(-4.1, NEN + .08, 5.0); xuongs[0].scale.setScalar(2.0); xuongs[0].rotation.y = .14; DOAN.cong.add(xuongs[0]);
    xuongs[1].position.set(3.95, NEN + .08, 4.75); xuongs[1].scale.setScalar(2.0); xuongs[1].rotation.set(0, -.32, -.08); DOAN.cong.add(xuongs[1]);
    xuongs.forEach((x, i) => { const hb = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.8, .9), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(x.position.x, NEN + 1.95, x.position.z); hb.userData.tt = { loai: 'xuong' + i, tam: hb.position.clone().add(V3(0, 1.4, 0)), cao: 3.6 }; DOAN.cong.add(hb); chonVat.push(hb); });
  }
  // trăng (bóng chính ở cổng; vào phế tích thì dời theo)
  const trang = new THREE.SpotLight(0x8fd8d2, 520, 80, .5, .85, 1.4); trang.position.set(-9, 22, 26); trang.target.position.set(0, 4, 2); scene.add(trang, trang.target);
  trang.castShadow = true; trang.shadow.mapSize.setScalar(dienThoai ? 512 : 1024); trang.shadow.camera.near = 10; trang.shadow.camera.far = 70; trang.shadow.bias = -.0004; trang.shadow.normalBias = .03; trang.shadow.radius = 3;
  // tối ưu 10/11: đèn khe cửa không còn đổ bóng (chỉ giữ bóng trăng)
  const ban = new THREE.HemisphereLight(0x3d7479, 0x0a1012, .2); scene.add(ban);

  // ============ SẢNH (mới → cũ) ============
  const Z0 = -1.25, ZC = -64, Z1 = -97, HW = 11, TRAN = 12, COTX = 6.6, CAO = 9.4;
  const DL = duAn.length || 6;
  const BUOC_LOGO = DL > 6 ? 45 / (DL - 1) : 9;   // bản 6: 7 bục cùng nằm trong sảnh cũ (bục cuối ở z −57, trước đoạn cũ z −64)
  const zLogo = k => -12 - k * BUOC_LOGO, xLogo = k => (k % 2 ? 3.2 : -3.2);
  // tối ưu 10/11: gương sàn độ phân giải thấp (máy .4, điện thoại .25 cạnh màn), không MSAA, nhoè 5 điểm che độ phân giải thấp,
  //   vẽ lại mỗi 2 khung, chỉ thấy lớp 0 (hạt, sỏi, sương, biển đồng, vệt tối… đặt lớp 1 = không soi gương)
  const guong = new Reflector(new THREE.PlaneGeometry(HW * 2, Z0 - Z1), { textureWidth: 256, textureHeight: 256, color: 0x6c7a79, clipBias: .003, multisample: 0, shader: GUONG_SHADER });
  guong.rotation.x = -Math.PI / 2; guong.position.set(0, -.015, (Z0 + Z1) / 2); scene.add(guong);
  const GUONG_K = QS.has('guong') ? +QS.get('guong') : dienThoai ? .25 : .4, GUONG_CACH = QS.has('guongCach') ? +QS.get('guongCach') : 2;
  let guongMoi = true;
  { const veGuong = guong.onBeforeRender; let dem = 0;
    guong.onBeforeRender = function (r, s, c, ...a) { if (c !== cam) return; if (guongMoi) { guongMoi = false; dem = 0; } if (dem++ % GUONG_CACH) return; veGuong.call(this, r, s, c, ...a); }; }
  const matSan = PM({ map: sD, roughnessMap: sR, normalMap: sN, normalScale: new THREE.Vector2(.35, .35), color: 0x707d7c, roughness: .32, transparent: true, envMap: env, envMapIntensity: .25, clearcoat: .2, clearcoatRoughness: .25 });
  matSan.onBeforeCompile = sh => { sh.vertexShader = 'varying vec3 vWpS;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vWpS = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = 'varying vec3 vWpS;\n' + NOISE_CU + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
    float tuoiS = smoothstep(-28., -88., vWpS.z);
    float vung = smoothstep(.48, .62, fbmc(vec3(vMapUv * vec2(1.6, .3), 2.)) + .08 * n3c(vec3(vMapUv * 9., 1.))) * (1. - tuoiS * .7);
    float banS = tuoiS * smoothstep(.3, .7, fbmc(vWpS * .45 + 7.));
    float nutS = tuoiS * smoothstep(.03, 0., abs(n3c(vWpS * vec3(1.3, 1., 1.3)) - .5));
    float lumS = dot(diffuseColor.rgb, vec3(.3, .59, .11)); diffuseColor.a = mix(.3, .82, smoothstep(.02, .3, lumS)) * mix(1., .5, vung);
    diffuseColor.a = mix(diffuseColor.a, 1., max(banS, tuoiS * .55));
    diffuseColor.rgb *= mix(1., .78, vung) * (1. - .55 * banS) * (1. - .8 * nutS) * mix(vec3(1.), vec3(.75, .8, .7), tuoiS);`).replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
    roughnessFactor = mix(mix(roughnessFactor, .03, vung), .9, banS);`); };
  matSan.customProgramCacheKey = () => 'san4';
  const san = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, Z0 - Z1), matSan);
  san.rotation.x = -Math.PI / 2; san.position.set(0, 0, (Z0 + Z1) / 2); scene.add(san);
  { const goc = guong.onBeforeRender; guong.onBeforeRender = function (...a) { san.visible = false; goc.apply(this, a); san.visible = true; }; }
  // tường dọc (chia đoạn để ẩn), tường cuối vỡ
  for (const [za, zb] of [[Z0, -33], [-33, ZC], [ZC, Z1]]) for (const s of [-1, 1]) {
    hop(1, TRAN + 2, za - zb, s * (HW + .5), (TRAN + 2) / 2, (za + zb) / 2, M.daToi);
    hop(.4, .5, za - zb, s * (HW - .2), .25, (za + zb) / 2, M.da);
    hop(.3, 1.2, za - zb, s * (HW - .15), 8.2, (za + zb) / 2, M.da);
  }
  { const s = new THREE.Shape(); s.moveTo(-HW - 1, 0); s.lineTo(HW + 1, 0); s.lineTo(HW + 1, TRAN + 2); s.lineTo(-HW - 1, TRAN + 2); s.closePath();
    const lo = new THREE.Path(), r = rnd(5); lo.moveTo(-4.2, 0); for (let k = 0; k <= 16; k++) { const a = Math.PI * k / 16; lo.lineTo(-Math.cos(a) * (4.2 + r() * .9), 6.5 + Math.sin(a) * 3.2 + (r() - .5) * 1.2); } lo.lineTo(4.4, 0); lo.closePath(); s.holes.push(lo);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 4, uv.getY(i) / 4);
    const m = new THREE.Mesh(g, M.daToi); m.position.set(0, 0, Z1 - 1); DOAN.cu.add(m); }
  // hốc tối giữa các cột
  for (const s of [-1, 1]) for (let z = -8; z > Z1 + 3; z -= 6) hop(.2, 5.2, 3.2, s * (HW - .1), 3.6, z, M.hoc, false);
  // đèn tường ấm (vị trí để gán đèn thật theo cụm) + chụp đèn phát sáng
  const viTriDenTuong = [];
  for (let z = -9; z > ZC; z -= 11.5) for (const s of [-1, 1]) {
    const zz = z + (s > 0 ? 0 : 5.7);
    const cd = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(AM).multiplyScalar(5) }));
    cd.position.set(s * (HW - .35), 8.9, zz); them(cd); denFlare.push({ p: cd.position.clone(), c: new THREE.Color(0xffc27a).multiplyScalar(.9) });
    const de = new THREE.Mesh(new THREE.CylinderGeometry(.05, .14, .3, 10), M.dongKhung); de.position.set(s * (HW - .3), 8.75, zz); them(de);
    viTriDenTuong.push(V3(s * (HW - 1.2), 8.6, zz));
  }
  // hàng cột Ionic (đoạn cũ: một số cột gãy/đổ)
  const zCot = []; for (let z = -5; z >= Z1 + 3; z -= 6) zCot.push(z);
  const gIon = cotIonic(CAO);
  const dungCot = zCot.flatMap(z => [-1, 1].map(s => ({ s, z }))).filter(({ s, z }) => !(z < ZC && ((s > 0 && (z === -71 || z === -83)) || (s < 0 && z === -77))));
  for (const nhom of [[Z0, -33, DOAN.sanhA], [-33, ZC, DOAN.sanhB], [ZC, Z1, DOAN.cu]]) {
    const ds = dungCot.filter(c => c.z <= nhom[0] && c.z > nhom[1]); if (!ds.length) continue;
    const im = new THREE.InstancedMesh(gIon, M.cot, ds.length); const m4 = new THREE.Matrix4();
    ds.forEach((c, k) => { m4.makeRotationY(c.s < 0 ? 0 : Math.PI); m4.setPosition(c.s * COTX, 0, c.z); im.setMatrixAt(k, m4); });
    nhom[2].add(im);
  }
  // cột gãy + trống cột đổ trong đoạn cũ
  const vatDo = [];   // vật có thể bị hút khi sụp
  for (const [s, z, h] of [[1, -71, 2.6], [-1, -77, 4.1], [1, -83, 1.4]]) { const m = new THREE.Mesh(cotGay(h, z), M.cot); m.position.set(s * COTX, 0, z); DOAN.cu.add(m); }
  { const r = rnd(9); for (let i = 0; i < 7; i++) { const g = thanCotRanh(.46, .44, 1.4 + r() * 1.2, 20, .045); g.translate(0, -.7, 0); const m = new THREE.Mesh(g, M.cot);
      m.rotation.set(Math.PI / 2 + (r() - .5) * .3, r() * 3, 0); m.rotation.z = (r() - .5) * 2; m.position.set((r() - .5) * 15, .46, -68 - r() * 26); m.rotation.order = 'YXZ'; m.rotation.x = Math.PI / 2; DOAN.cu.add(m); } }
  // dầm trên đầu cột + trần lối bên
  for (const s of [-1, 1]) {
    for (const [za, zb] of [[Z0, -33], [-33, ZC], [ZC, -80]]) { hop(1.5, 1.3, za - zb, s * COTX, CAO + .65, (za + zb) / 2); hop(1.7, .3, za - zb, s * COTX, CAO + 1.45, (za + zb) / 2); hop(HW - COTX, .3, za - zb, s * (COTX + HW) / 2, CAO + 1.2, (za + zb) / 2, M.daToi); }
  }
  // trần giữa có giếng trời trên mỗi logo; sau ZC: mảng trần vỡ, lộ trời sao
  const viTriTroi = [];
  {
    const sh = new THREE.Shape(); sh.moveTo(-COTX - .75, Z0); sh.lineTo(COTX + .75, Z0); sh.lineTo(COTX + .75, ZC); sh.lineTo(-COTX - .75, ZC); sh.closePath();
    for (let k = 0; k < DL; k++) { const h = new THREE.Path(); h.absarc(xLogo(k), zLogo(k), 1.45, 0, Math.PI * 2, true); sh.holes.push(h); viTriTroi.push(V3(xLogo(k), TRAN, zLogo(k))); }
    const g = new THREE.ShapeGeometry(sh, 40); g.rotateX(Math.PI / 2);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2.2, uv.getY(i) / 2.2);
    const tran = new THREE.Mesh(g, M.tran); tran.position.y = TRAN; scene.add(tran);
    const tTroi = canTroi();
    for (let k = 0; k < DL; k++) {
      const x = xLogo(k), z = zLogo(k);
      const vanh = new THREE.Mesh(new THREE.TorusGeometry(1.5, .14, 8, 40), M.da); vanh.rotation.x = Math.PI / 2; vanh.position.set(x, TRAN - .05, z); them(vanh);
      const ong = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 1, 32, 1, true), M.daToi); ong.position.set(x, TRAN + .5, z); them(ong);
      const troi = new THREE.Mesh(new THREE.CircleGeometry(1.45, 40), new THREE.MeshBasicMaterial({ map: tTroi, color: new THREE.Color(0xbff6ee).multiplyScalar(.95), fog: false }));   // bản 5: bớt chói
      troi.rotation.x = Math.PI / 2; troi.position.set(x, TRAN + .95, z); them(troi);
    }
    const r = rnd(13);
    for (let z = ZC - 1.5; z > Z1 + 2; z -= 3.2) for (const x of [-4.2, 0, 4.2]) if (r() < .45) { const b = hop(3.6 + r(), .5, 2.6 + r(), x + (r() - .5), TRAN + .2, z, M.daToi); b.rotation.set((r() - .5) * .25, 0, (r() - .5) * .25); }
    for (let i = 0; i < 4; i++) { const b = hop(.9, .9, 7 + r() * 4, (r() - .5) * 10, 3 + r() * 6, -70 - r() * 22, M.da); b.rotation.set(.6 + r() * .5, r(), .2); }   // dầm sập chéo
  }
  // sao + trăng (hiện qua mái thủng và ở phế tích)
  { const n = dienThoai ? 900 : 2200, p = new Float32Array(n * 3), s = new Float32Array(n), r = rnd(21);
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, b = Math.acos(r() * .95), R = 220; p[i * 3] = Math.cos(a) * Math.sin(b) * R; p[i * 3 + 1] = Math.cos(b) * R + 10; p[i * 3 + 2] = Math.sin(a) * Math.sin(b) * R - 120; s[i] = r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
    var saoU = { uT: { value: 0 }, uPx: { value: dt0 } };
    const sao = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: saoU, vertexShader: SAO_VS, fragmentShader: SAO_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    sao.frustumCulled = false; scene.add(sao);
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShaderMaterial({ uniforms: { uA: { value: 1 } }, vertexShader: UV_VS, fragmentShader: TRANG_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    tr.position.set(-60, 70, -300); tr.lookAt(0, 3, -110); scene.add(tr); }
  // cột sáng trăng + bụi
  const cotSang = [];
  const SO_BUI = dienThoai ? 300 : 700, bp = new Float32Array(SO_BUI * 3), bs = new Float32Array(SO_BUI);
  for (let i = 0; i < SO_BUI; i++) { const k = i % DL, a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 1.9;
    bp[i * 3] = xLogo(k) + Math.cos(a) * r; bp[i * 3 + 1] = Math.random() * 11; bp[i * 3 + 2] = zLogo(k) + Math.sin(a) * r; bs[i] = Math.random(); }
  const buiG = new THREE.BufferGeometry(); buiG.setAttribute('position', new THREE.BufferAttribute(bp, 3)); buiG.setAttribute('aS', new THREE.BufferAttribute(bs, 1));
  const buiU = { uT: { value: 0 }, uPx: { value: dt0 }, uMau: { value: new THREE.Color(0xd8fff8) } };
  const bui = new THREE.Points(buiG, new THREE.ShaderMaterial({ uniforms: buiU, vertexShader: BUI_VS, fragmentShader: BUI_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  bui.frustumCulled = false; scene.add(bui);
  { const n = dienThoai ? 100 : 220, p = new Float32Array(n * 3), s = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 6; p[i * 3 + 1] = Math.random() * 11; p[i * 3 + 2] = -1.5 - Math.random() * 8; s[i] = Math.random(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
    const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { ...buiU, uMau: { value: new THREE.Color(0xffc887) } }, vertexShader: BUI_VS, fragmentShader: BUI_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.frustumCulled = false; scene.add(m); }

  // ============ SƯƠNG GIẢ ============
  const suongU = [];
  const tamSuong = (w, h, x, y, z, mau, a, cao, ry = 0) => {
    const u = { uT: { value: 0 }, uA: { value: a }, uDay: { value: y - h / 2 }, uCao: { value: cao }, uOct: { value: dienThoai ? 2 : 4 }, uMau: { value: new THREE.Color(mau) } };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({ uniforms: u, vertexShader: SUONG_VS, fragmentShader: SUONG_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    m.position.set(x, y, z); m.rotation.y = ry; m.renderOrder = 7; them(m); suongU.push(u); return m;
  };
  { const buoc = dienThoai ? 6.4 : 3.2;
    for (let z = -3; z > Z1 + 2; z -= buoc) { const am = Math.max(0, 1 - (-z - 2) / 12); tamSuong(20, 6, Math.sin(z) * 1.5, 3, z, new THREE.Color(0x2b6a68).lerp(new THREE.Color(0x8a6236), am), .28 + am * .1, 1.4); }
    for (const z of (dienThoai ? [3, 9, 15] : [2.5, 5.5, 8.5, 12, 16])) tamSuong(30, 5, 0, 2.5 + (z > 6 ? 0 : 1.5), z, 0x2f7270, .55, 1.1);
    tamSuong(5, 6, .6, NEN + 3, -3.2, 0xffb36a, .28, 2.5); tamSuong(6, 6, 0, 3, -4.4, 0xc9925c, .22, 2.2);   // bản 5: không cắt qua cánh cửa
    for (let z = -100; z > -150; z -= dienThoai ? 9 : 4.5) tamSuong(60, 5, 0, 2.5, z, 0x2c6664, .5, .9); }

  // biển đồng nhỏ (mặt trước bệ), bấm được
  const bienCh = [];
  const bienDong = (ten, phu, w = .5) => { const h = w / 2; const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .015), [M.dongKhung, M.dongKhung, M.dongKhung, M.dongKhung, new THREE.MeshStandardMaterial({ map: canBang(ten, phu), roughness: .38, metalness: .55, envMap: env, envMapIntensity: .9 }), M.dongKhung]);
    m.userData.tt = { loai: 'bien', ten }; bienCh.push(m); return m; };
  // ============ LOGO TẠC CẨM THẠCH TRÊN BỆ (không chuông) ============
  const tl = new THREE.TextureLoader();
  const gBe = mergeGeometries([
    tien(new THREE.BoxGeometry(1.9, .42, 1.9), 0, .21, 0),
    tien(lathe([[.7, 0], [.72, .06], [.62, .14], [.58, .2], [0, .2]]), 0, .42, 0),
    tien(thanCotRanh(.55, .55, 1.0, 20, .06), 0, .62, 0),
    tien(lathe([[.56, 0], [.66, .1], [.74, .2], [.74, .3], [0, .3]]), 0, 1.62, 0),
  ], false);
  const gChuong = lathe([[.62, 0], [.62, 1.05], [.6, 1.25], [.54, 1.42], [.42, 1.56], [.24, 1.66], [0, 1.7]], 48);
  const coc = [], day = [];
  const ngoc = await Promise.all(duAn.map(async (d, k) => {
    const mau = new THREE.Color(MAU[d.id] ?? 0x9fd8d0), x = xLogo(k), z = zLogo(k);
    const be = new THREE.Mesh(gBe, M.be); be.position.set(x, 0, z); them(be);
    const dia = new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, .06, 40), M.dongKhung); dia.position.set(x, 1.95, z); them(dia);
    const chuong = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 2.6), new THREE.MeshBasicMaterial({ visible: false }));   // hộp chọn (không vẽ)
    chuong.position.set(x, NGOC_Y, z); them(chuong); chuong.userData.tt = { loai: 'logo', k };
    const hat = new THREE.Mesh(new THREE.CircleGeometry(.95, 32), quangMat(mau, .55)); hat.rotation.x = -Math.PI / 2; hat.position.set(x, 1.985, z); them(hat);   // quầng màu brand hắt xuống mặt bệ
    const vet = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), quangMat(mau, .18)); vet.rotation.x = -Math.PI / 2; vet.position.set(x, .025, z); them(vet);
    const cU = { uT: { value: 0 }, uA: { value: .2 }, uH: { value: TRAN }, uMau: { value: new THREE.Color(TEAL) } };
    const cs = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.7, TRAN, 40, 1, true), new THREE.ShaderMaterial({ uniforms: cU, vertexShader: COT_VS, fragmentShader: COT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    cs.position.set(x, TRAN / 2, z); cs.renderOrder = 5; them(cs); cotSang.push(cU);
    if (dienThoai) { const vung = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), quangMat(TEAL, .32)); vung.rotation.x = -Math.PI / 2; vung.position.set(x, .02, z); them(vung); }
    // dây chắn nhung đỏ + cột đồng quanh bệ; bảng chú thích
    const R = 1.55, goc4 = [[-R, -R], [R, -R], [R, R], [-R, R]];
    for (const [a, b] of goc4) { coc.push(tien(new THREE.CylinderGeometry(.035, .045, .95, 10), x + a, .475, z + b), tien(new THREE.SphereGeometry(.06, 10, 8), x + a, .97, z + b), tien(new THREE.CylinderGeometry(.13, .15, .05, 14), x + a, .025, z + b)); }
    for (let i = 0; i < 3; i++) { const [a1, b1] = goc4[i], [a2, b2] = goc4[i + 1]; const p0 = V3(x + a1, .9, z + b1), p1 = V3(x + a2, .9, z + b2), mid = p0.clone().lerp(p1, .5); mid.y -= .2;
      day.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, mid, p1]), 16, .028, 6)); }
    const bang = bienDong(d.ten, (d.nam || '').replace(/ – nay/, ' – now'), .62); bang.position.set(x, 1.22, z + .6); them(bang);
    // logo (bản 6: other/freelance là vật trưng 3D + chữ khối)
    const dacBiet = d.id === 'other' ? 'sach' : d.id === 'freelance' ? 'dua' : null;
    let tL; if (dacBiet) tL = await chuThanhAnh(dacBiet === 'sach' ? 'OTHER\nPROJECTS' : 'FREELANCE', 1024, 512, 230);
    else if (LOGO[d.id]) { tL = await tl.loadAsync(`${coSo}logo/${LOGO[d.id]}`); tL.colorSpace = THREE.SRGBColorSpace; } else tL = await chuThanhAnh(d.ten.split(' ')[0]);
    const asp = tL.image.height / tL.image.width;
    const nhom = new THREE.Group(); nhom.position.set(x, NGOC_Y, z); them(nhom, z);
    const xoay = new THREE.Group(); nhom.add(xoay); xoay.scale.setScalar(1.32);   // bản 5: to gấp 2,2 lần
    const quangU = { uMau: { value: mau.clone().lerp(new THREE.Color(0xffffff), .1) }, uA: { value: .5 } };
    const quang = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.ShaderMaterial({ uniforms: quangU, vertexShader: UV_VS, fragmentShader: QUANG_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    quang.renderOrder = 1; quang.scale.setScalar(1.05); xoay.add(quang);
    const NET = d.id === 'electric';   // gop-3: logo Electric nét mảnh → bớt glow, viền mép hẹp, khối mỏng hơn để đọc được chữ
    const logoU = { tL: { value: tL }, uMau: { value: NET ? mau.clone().lerp(new THREE.Color(0xffffff), .25) : mau }, uA: { value: 1 }, uT: { value: 0 }, uHover: { value: 0 }, uGon: { value: -1 }, uGlow: { value: NET ? .28 : 1 }, uE: { value: NET ? .004 : .012 } };
    const logo = new THREE.Group(), chu = new THREE.Group(), SO_LOP = dienThoai ? 12 : 20, hinh = new THREE.PlaneGeometry(1.1, 1.1 * asp);
    for (let l = 0; l < SO_LOP; l++) {
      const m = new THREE.Mesh(hinh, new THREE.ShaderMaterial({ uniforms: { ...logoU, uSang: { value: l === SO_LOP - 1 || l === 0 ? 1 : .5 }, uLop: { value: l }, uSo: { value: SO_LOP } }, vertexShader: UV_VS, fragmentShader: LOGO_KHOI_FS, side: THREE.DoubleSide }));
      m.position.z = (l / (SO_LOP - 1) - .5) * (NET ? .07 : .16); m.renderOrder = 2; m.userData.chon = k; chu.add(m);
    }
    logo.add(chu);
    let vat = null;
    if (dacBiet) { vat = dacBiet === 'sach' ? vatSach(mau, dienThoai) : vatDua(mau, dienThoai); vat.g.position.y = .46; vat.g.scale.setScalar(dacBiet === 'sach' ? .62 : .6); logo.add(vat.g); chu.position.y = -.3; chu.scale.setScalar(.86); }
    logo.scale.setScalar(1.75 * (dacBiet ? 1 : asp > 1.1 ? 1.1 / asp : asp < .4 ? 1.25 : 1)); xoay.add(logo);
    // vòng sỏi cẩm thạch nhỏ bay quanh logo (như bản C), ánh màu brand
    const SV = dienThoai ? 26 : 46;
    const vong = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.034, 0), new THREE.MeshStandardMaterial({ color: 0xa9b4b0, roughness: .6, emissive: mau, emissiveIntensity: .22, flatShading: true, envMap: env, envMapIntensity: .5 }), SV);
    { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = V3(1, 1, 1), p3 = V3(0, 0, 0), e3 = new THREE.Euler(), r = rnd(k * 31 + 5);
      for (let i = 0; i < SV; i++) { const a = i / SV * Math.PI * 2 + r() * .1, R = 1.25 + (r() - .5) * .24; p3.set(Math.cos(a) * R, (r() - .5) * .16, Math.sin(a) * R); e3.set(r() * 6, r() * 6, 0); q.setFromEuler(e3); s3.setScalar(.5 + r() * 1.3); m4.compose(p3, q, s3); vong.setMatrixAt(i, m4); } }
    vong.frustumCulled = false; const vongG = new THREE.Group(); vongG.rotation.x = .42; vongG.add(vong); xoay.add(vongG);
    return { d, k, mau, nhom, xoay, logo, logoU, quang, quangU, hover: 0, chuong, hat, vong, vongG, vat };
  }));
  if (coc.length) { DOAN.sanhA.add(new THREE.Mesh(mergeGeometries(coc.map(g => g.index ? g : g), false), M.dongBong)); DOAN.sanhA.add(new THREE.Mesh(mergeGeometries(day, false), M.nhung)); }

  // ============ TƯỢNG + ĐẠO CỤ LẤP ĐẦY SẢNH ============
  const tuongs = [];   // { nhom, dich: điểm đèn rọi }
  const TEN_TUONG = { apollo: ['Apollo Belvedere', 'marble'], amazon: ['Wounded Amazon', 'marble'], zeus: ['Colossal head of Zeus', 'marble'], dio: ['Torso of Dionysos', 'marble'],
    cogai: ['The Greek Slave', 'plaster model'], banthan: ['Marble bust', 'marble'], binh: ['Neck amphorae', 'terracotta'], tu: ['Amphorae', 'terracotta, in a case'], phu: ['Under restoration', 'covered'] };
  const mau = {}, choGan = [];   // choGan: việc gắn mô hình, chạy khi tải nền xong
  const CAO_MH = { apollo: 2.25, amazon: 2.15, zeus: .95, dio: 1.25, cogai: 2.0, banthan: .78, binh: .62 };
  const chuanMH = (g, cao, quay = 0) => { if (!g) return null; const o = g.scene.clone(true);
    const b = new THREE.Box3().setFromObject(o), sz = b.getSize(V3(0, 0, 0)), s = cao / sz.y;
    o.scale.setScalar(s); o.position.set(-(b.min.x + sz.x / 2) * s, -b.min.y * s, -(b.min.z + sz.z / 2) * s);
    o.traverse(m => { if (m.isMesh) { const mt = m.material; mt.envMap = env; mt.envMapIntensity = .55; if (mt.emissive) { mt.emissive.set(0x141e1e); } m.castShadow = false; } });
    const w = new THREE.Group(), tq = new THREE.Group(); tq.rotation.y = quay; tq.add(o); w.add(tq); return w; };
  const gBeVuong = mergeGeometries([tien(new THREE.BoxGeometry(1.25, .9, 1.25), 0, .45, 0), tien(new THREE.BoxGeometry(1.4, .12, 1.4), 0, .96, 0), tien(new THREE.BoxGeometry(1.4, .12, 1.4), 0, .06, 0)], false);
  const gBeThap = mergeGeometries([tien(new THREE.BoxGeometry(1.8, .55, 1.0), 0, .275, 0), tien(new THREE.BoxGeometry(1.95, .08, 1.15), 0, .59, 0)], false);
  const gPhu = (() => { const g = lathe([[.55, 0], [.6, .3], [.45, 1.2], [.52, 1.75], [.34, 2.15], [.2, 2.4], [0, 2.48]], 32); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + .08 * Math.sin(a * 7 + y * 2) * (1 - y / 2.6) + .04 * Math.sin(a * 13); p.setXYZ(i, x * k, y, z * k); }
    g.computeVertexNormals(); return nhan(g, .02, 4); })();
  const datTuong = (loai, x, z, quay) => {
    const nhom = new THREE.Group(); nhom.position.set(x, 0, z);
    let cao = 1.02, cha = null;
    if (loai === 'zeus' || loai === 'banthan') { nhom.add(new THREE.Mesh(gBe, M.be)); cao = 1.92; }
    else if (loai === 'binh') { nhom.add(new THREE.Mesh(gBeThap, M.be)); cao = .63; }
    else if (loai === 'tu') { // tủ kính thấp: đế gỗ + kính + 3 bình
      nhom.add(new THREE.Mesh(tien(new THREE.BoxGeometry(2.2, .8, 1.1), 0, .4, 0), M.go)); const k = new THREE.Mesh(tien(new THREE.BoxGeometry(2.2, 1.0, 1.1), 0, 1.3, 0), M.kinh); k.renderOrder = 8; nhom.add(k);
      choGan.push(() => { if (mau.binh) for (const dx of [-.65, 0, .65]) { const b = mau.binh.clone(); b.position.set(dx, .8, 0); b.scale.setScalar(.75 + Math.abs(dx) * .2); b.rotation.y = dx * 2; nhom.add(b); } });
      cao = -1;
    } else if (loai === 'phu') { nhom.add(new THREE.Mesh(gBeVuong, M.be)); const v = new THREE.Mesh(gPhu, M.vai); v.position.y = 1.02; v.scale.set(.9, .9, .9); nhom.add(v); cao = -1; }
    else nhom.add(new THREE.Mesh(gBeVuong, M.be));
    if (cao > 0) choGan.push(() => { if (!mau[loai]) return; cha = mau[loai].clone(); cha.position.y = cao; nhom.add(cha); if (loai === 'binh') { const b2 = mau.binh.clone(); b2.position.set(.55, cao, .1); b2.scale.setScalar(.8); b2.rotation.y = 1.3; nhom.add(b2); cha.position.x = -.45; } });
    const nb = TEN_TUONG[loai]; const bg = bienDong(nb[0], nb[1], .46);
    const truoc = loai === 'zeus' || loai === 'banthan' ? .96 : loai === 'binh' ? .52 : loai === 'tu' ? .56 : .64;
    bg.position.set(0, loai === 'zeus' || loai === 'banthan' ? .22 : loai === 'binh' ? .3 : loai === 'tu' ? .45 : .5, truoc); nhom.add(bg);
    nhom.rotation.y = quay; them(nhom, z);
    { const hc = cao > 0 ? cao + CAO_MH[loai] : loai === 'tu' ? 1.85 : 3.3, sz = V3(1.45, hc, 1.45), c = V3(x, hc / 2, z);   // hộp chọn tương tác (cỡ ước tính, mô hình gắn sau)
      const hb = new THREE.Mesh(new THREE.BoxGeometry(sz.x, sz.y, sz.z), new THREE.MeshBasicMaterial({ visible: false })); hb.position.copy(c); hb.userData.tt = { loai, tam: c, cao: sz.y }; them(hb, z); chonVat.push(hb); }
    tuongs.push({ nhom, dich: V3(x, loai === 'binh' || loai === 'tu' ? 1 : 2, z) });
    if (dienThoai) { const v = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), quangMat(0xffe0b0, .25)); v.rotation.x = -Math.PI / 2; v.position.set(x, .03, z); them(v); }
    return nhom;
  };
  const XT = 9.1, xepTuong = [
    ['apollo', 'amazon'], ['tu', 'zeus'], ['cogai', 'banthan'], ['dio', 'apollo'], ['amazon', 'binh'], ['zeus', 'cogai'], ['phu', 'dio'], ['banthan', 'tu'], ['apollo', 'phu']];
  xepTuong.forEach(([a, b], i) => { const z = -8 - i * 6; if (dienThoai && i % 2) return;
    datTuong(a, -XT, z, Math.PI / 2); datTuong(b, XT, z, -Math.PI / 2); });
  // đoạn cũ: tượng đổ, vải phủ, giàn giáo
  choGan.push(() => {
    if (mau.dio) { const t = mau.dio.clone(); t.position.set(-3, .35, -74); t.rotation.set(0, .8, Math.PI / 2.2); DOAN.cu.add(t); }
    if (mau.amazon && !dienThoai) { const t = mau.amazon.clone(); t.position.set(8.6, 0, -88); t.rotation.set(0, -1.2, -.12); DOAN.cu.add(t); }
  });
  datTuong('phu', -XT, -80, Math.PI / 2);
  { const ong = [], van = [], vai = [], r = rnd(17);
    for (const [x0, z0, z1] of [[-9.6, -66, -79], [8.4, -84, -94]]) {
      for (let z = z0; z >= z1; z -= 2.6) for (const dx of [0, 1.8]) ong.push(tien(new THREE.CylinderGeometry(.04, .04, 9, 6), x0 + dx, 4.5, z));
      for (const y of [1.5, 3.5, 5.5, 7.5]) { for (const dx of [0, 1.8]) ong.push(datDoan(new THREE.CylinderGeometry(.035, .035, 1, 6).translate(0, .5, 0).scale(1, z0 - z1, 1), V3(x0 + dx, y, z0), V3(x0 + dx, y, z1)));
        van.push(tien(new THREE.BoxGeometry(2.1, .06, z0 - z1), x0 + .9, y + .05, (z0 + z1) / 2)); }
      const p = new THREE.PlaneGeometry(z0 - z1, 7, 30, 20); p.rotateY(Math.PI / 2); p.translate(x0 + 2.05, 4.2, (z0 + z1) / 2);
      const q = p.attributes.position; for (let i = 0; i < q.count; i++) { const y = q.getY(i), z = q.getZ(i); q.setX(i, q.getX(i) + Math.sin(z * 2.4) * .18 + Math.sin(z * 7 + y) * .05 + (8 - y) * .03 * Math.sin(z)); }
      p.computeVertexNormals(); vai.push(p);
    }
    const fx = a => a.map(g => { g = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); return g; });
    DOAN.cu.add(new THREE.Mesh(mergeGeometries(fx(ong), false), M.sat), new THREE.Mesh(mergeGeometries(fx(van), false), M.go), new THREE.Mesh(mergeGeometries(fx(vai), false), M.vaiToi)); }
  // băng ghế đá giữa sảnh
  { const gh = []; for (let i = 0; i < DL - 1; i++) { const z = (zLogo(i) + zLogo(i + 1)) / 2; gh.push(tien(new THREE.BoxGeometry(2.6, .14, .7), 0, .5, z), tien(new THREE.BoxGeometry(.5, .43, .55), -.9, .215, z), tien(new THREE.BoxGeometry(.5, .43, .55), .9, .215, z)); }
    const g = mergeGeometries(gh, false); const m = new THREE.Mesh(g, M.be); DOAN.sanhA.add(m); }
  // bản 5: tranh thật trên tường (tranh/NGUON.md, Wikimedia Commons). Khung vàng + chụp đèn + quầng rọi tranh. Ảnh gắn khi tải nền xong.
  const TRANH_SANH = [['mona-lisa', .67], ['dem-sao', 1.26], ['song-lon', 1.49], ['venus', 1.59], ['ngoc-trai', .84], ['lu-khach', .78], ['tieng-thet', .81], ['dao-chet', 1.88], ['socrates', 1.52]];   // tên file, rộng/cao
  const matTranh = {};
  const layMatTranh = ten => matTranh[ten] ??= new THREE.MeshStandardMaterial({ color: 0x0c1110, roughness: .6, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0, envMap: env, envMapIntensity: .12 });
  { const khung = [], qg = [], theo = {};
    let n = 0;
    for (let z = -11; z > ZC + 2; z -= 6) for (const s of [-1, 1]) {
      const [ten, asp] = TRANH_SANH[n++ % TRANH_SANH.length];
      let h = 2.0, w = h * asp; if (w > 2.2) { w = 2.2; h = w / asp; }
      const x = s * (HW - .05), yc = 5.3;
      for (const [bw, bh, dz, dy] of [[w + .3, .15, 0, h / 2 + .07], [w + .3, .15, 0, -h / 2 - .07], [.15, h + .3, w / 2 + .07, 0], [.15, h + .3, -w / 2 - .07, 0]]) khung.push(tien(new THREE.BoxGeometry(.1, bh, bw), x - s * .05, yc + dy, z + dz));
      const pg = new THREE.PlaneGeometry(w, h); pg.rotateY(-s * Math.PI / 2); pg.translate(x - s * .04, yc, z); (theo[ten] ??= []).push(pg);
      const q = new THREE.PlaneGeometry(w + 1.4, h + 1.2); q.rotateY(-s * Math.PI / 2); q.translate(x - s * .12, yc + .25, z); qg.push(q);
      khung.push(tien(new THREE.BoxGeometry(.3, .06, Math.min(.9, w * .5)), x - s * .2, yc + h / 2 + .38, z));
    }
    DOAN.sanhA.add(new THREE.Mesh(mergeGeometries(khung, false), M.vangKhung));
    for (const ten in theo) DOAN.sanhA.add(new THREE.Mesh(mergeGeometries(theo[ten], false), layMatTranh(ten)));
    const mq = new THREE.Mesh(mergeGeometries(qg, false), quangMat(0xffc890, .1)); DOAN.sanhA.add(mq); }
  // rèm vải nặng 2 bên lối vào sảnh
  for (const s of [-1, 1]) { const p = new THREE.PlaneGeometry(2.4, 9, 24, 20); const q = p.attributes.position;
    for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i); q.setZ(i, Math.sin(x * 9) * .14 * (1 - (y + 4.5) / 14) + Math.sin(x * 23 + y) * .03); q.setX(i, x * (1 - .35 * (1 - (y + 4.5) / 9))); }
    p.computeVertexNormals(); const m = new THREE.Mesh(p, M.nhung); m.position.set(s * 4.2, 4.5, -1.6); them(m, -2); }

  // ============ PHẾ TÍCH NGOÀI TRỜI + KHUNG TRANH + HỐ ĐEN ============
  const ZK = -128;   // khung tranh
  { const nen = new THREE.Mesh(new THREE.PlaneGeometry(160, 140, 60, 50), M.nen); nen.rotation.x = -Math.PI / 2; nen.position.set(0, -.01, -165);
    const p = nen.geometry.attributes.position, r = rnd(3); for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); const ro = Math.min(1, Math.hypot(x, y + 37) / 14); p.setZ(i, ro * (Math.sin(x * .3) * Math.cos(y * .23) * .25 + r() * .08)); }
    nen.geometry.computeVertexNormals(); const uv = nen.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 40, uv.getY(i) * 35); DOAN.ngoai.add(nen); }
  // cỏ
  { const n = dienThoai ? 1800 : 6000, la = new THREE.PlaneGeometry(.06, .5, 1, 3); la.translate(0, .25, 0); { const p = la.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) * (1 - y * 1.6)); p.setZ(i, y * y * .3); } }
    const co = new THREE.InstancedMesh(la, M.co, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), r = rnd(8); let k = 0;
    while (k < n) { const x = (r() - .5) * 50, z = -98 - r() * 60; if (Math.abs(x) < 1.6 && z > ZK) continue; if (Math.hypot(x, z - ZK) < 2.2) continue;
      q.setFromEuler(new THREE.Euler((r() - .5) * .4, r() * 6.28, (r() - .5) * .4)); const s = .6 + r() * 1.2; m4.compose(V3(x, 0, z), q, V3(s, s * (.7 + r() * .8), s)); co.setMatrixAt(k++, m4); }
    DOAN.ngoai.add(co); }
  // cột gãy, trống cột đổ, đá vụn (bị hút khi sụp)
  { const r = rnd(44);
    for (const [x, z, h] of [[-6, -104, 5.5], [-6, -112, 2.2], [-6, -120, 6.8], [-6, -136, 3.1], [6, -104, 3.4], [6, -112, 7.4], [6, -120, 1.6], [6, -136, 5.2], [-11, -116, 4], [11, -126, 2.8], [-10, -140, 6], [12, -142, 3.6]]) {
      const m = new THREE.Mesh(cotGay(h, x * z), M.cotNgoai); m.position.set(x, 0, z); DOAN.ngoai.add(m); vatDo.push(m);
      if (h > 6) { const dm = hop(1.5, 1.1, 5, x, h + .3, z - 2.2, M.da); dm.rotation.set(.1, .05, .12); vatDo.push(dm); }
    }
    for (let i = 0; i < 9; i++) { const g = thanCotRanh(.47, .45, 1.2 + r(), 20, .045); g.translate(0, -.6, 0); const m = new THREE.Mesh(g, M.cotNgoai); m.rotation.set(Math.PI / 2, 0, r() * 3); m.position.set((r() - .5) * 26, .47, -100 - r() * 46); if (Math.abs(m.position.x) < 2) m.position.x += 4; DOAN.ngoai.add(m); vatDo.push(m); }
    for (let i = 0; i < (dienThoai ? 18 : 40); i++) { const m = new THREE.Mesh(daVun(i, .18 + r() * .4), M.cotNgoai); m.position.set((r() - .5) * 22, .1, -99 - r() * 40); m.rotation.set(r() * 3, r() * 3, r() * 3); DOAN.ngoai.add(m); vatDo.push(m); }
  }
  // đền Parthenon xa
  { const pc = [], W = 30, D = 14;
    for (let i = 0; i < 3; i++) pc.push(tien(new THREE.BoxGeometry(W + 4 - i * 1.4, .6, D + 4 - i * 1.4), 0, .3 + i * .6, 0));
    for (let i = 0; i < 8; i++) for (const zz of [-D / 2 + 1, D / 2 - 1]) if (!(zz > 0 && i === 5)) pc.push(tien(new THREE.CylinderGeometry(.75, .85, 10, 12), -W / 2 + 1.5 + i * (W - 3) / 7, 6.8, zz));
    pc.push(tien(new THREE.BoxGeometry(W, 1.8, D), 0, 12.7, 0));
    { const s = new THREE.Shape(); s.moveTo(-W / 2, 0); s.lineTo(W / 2, 0); s.lineTo(0, 3.6); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false }); g.translate(0, 13.6, -D / 2); pc.push(g); }
    const ok = pc.map(g => { g = g.index ? g.toNonIndexed() : g; g.deleteAttribute('uv'); return g; });
    const m = new THREE.Mesh(mergeGeometries(ok, false), M.phTen); m.position.set(-22, 0, -235); m.rotation.y = .35; DOAN.ngoai.add(m); }
  // bệ vỡ + khung tranh vàng trống
  const KW = 2.4, KH = 3.4, NGHIENG = .16, LECH = .35, thanhKhung = [];   // bản 6: khung nghiêng ~9°, lệch tâm 35 cm; khung chia 4 thanh để gãy khi bị hút
  const khungTranh = new THREE.Group(); khungTranh.position.set(LECH, 0, ZK); DOAN.ngoai.add(khungTranh);
  let khungG = null;
  { const be = new THREE.Mesh(cotGay(1.1, 7, 1.1), M.cotNgoai); khungTranh.add(be);
    const be2 = new THREE.Mesh(tien(new THREE.BoxGeometry(2.9, .25, 1.1), 0, 1.0, 0), M.daSang); be2.rotation.z = .03; khungTranh.add(be2);
    const y0 = 1.12 + KH / 2 + .35, T = .32; khungG = new THREE.Group(); khungG.position.set(0, y0, 0); khungG.rotation.z = NGHIENG; khungTranh.add(khungG);
    const sach = g => { g = g.index ? g.toNonIndexed() : g; g.deleteAttribute('uv'); return g; };
    [[KW + 2 * T, T, 0, KH / 2 + T / 2], [KW + 2 * T, T, 0, -KH / 2 - T / 2], [T, KH, KW / 2 + T / 2, 0], [T, KH, -KW / 2 - T / 2, 0]].forEach(([w, h, x, y], i) => {
      const kp = [new THREE.BoxGeometry(w, h, .22), tien(new THREE.BoxGeometry(w * (w > h ? .96 : .5), h * (h > w ? .985 : .5), .3), 0, 0, .02)];
      if (i < 2) for (const sx of [-1, 1]) kp.push(tien(new THREE.SphereGeometry(.22, 12, 8).scale(1, 1, .5), sx * (KW / 2 + T / 2), 0, .1));
      const m = new THREE.Mesh(mergeGeometries(kp.map(sach), false), M.vangKhung); m.position.set(x, y, 0); khungG.add(m);
      thanhKhung.push({ m, p: m.position.clone(), r: m.rotation.clone(), s: m.scale.clone() }); });
    khungTranh.userData.y0 = y0; }
  const hoU = { uT: { value: 0 }, uR: { value: 0 }, uMo: { value: 1 }, tHoi: { value: await chuThanhAnh('???', 512, 256, 220) } };
  const hoMat = new THREE.ShaderMaterial({ uniforms: hoU, vertexShader: UV_VS, fragmentShader: HO_FS, transparent: true, depthWrite: false, premultipliedAlpha: true });
  const ho = new THREE.Mesh(new THREE.PlaneGeometry(KW, KH), hoMat); ho.position.set(LECH, khungTranh.userData.y0, ZK + .05); ho.rotation.z = NGHIENG; ho.renderOrder = 9; DOAN.ngoai.add(ho);
  const TAM_HO = V3(LECH, khungTranh.userData.y0, ZK);

  // ============ bản 5: VÙNG "MEMORY IS BROKEN" (gộp hành lang cũ + phế tích thành 1 điểm dừng) ============
  // dòng báo lỗi kiểu hệ thống lơ lửng + vật thể vỡ vụn đứng hình giữa không trung + khung tranh mờ phía sau
  const TAM_VO = V3(0, 3.7, -105);
  const voChu = [];
  // bản 6: xếp thành cột chữ bên trái (máy tính) / giữa (điện thoại), mỗi dòng 1 hàng riêng, cách đều → không chồng nhau. [chữ, màu, hàng y, cỡ]
  { const DONG = [['FATAL  MEMORY_IS_BROKEN  0x0000DEAD', DO, 7.0, .56], ['ERR 404: the beginning was not found', DO, 6.2, .42], ['read error: /archive/2016 · sector not found', 0xdff6f2, 5.5, .38],
      ['checksum mismatch · 37 projects unrecoverable', 0xdff6f2, 4.85, .36], ['segmentation fault (core dumped)', DO, 4.2, .4], ['warning: timeline corrupted before 2019', 0x9fe9de, 3.6, .34],
      ['> recovering fragments ... 3%', 0x9fe9de, 3.05, .34]];
    const CHU_FS = /* glsl */`
    uniform sampler2D tC; uniform float uT, uS, uA; uniform vec3 uMau; varying vec2 vUv;
    float h(float x){ return fract(sin(x * 91.7 + 3.1) * 43758.5453); }
    void main(){
      float dong = floor(vUv.y * 6.);
      float giat = step(.9, h(floor(uT * 7. + uS * 13.) + dong * 1.7));
      vec2 uv = vUv + vec2((h(dong + floor(uT * 11.)) - .5) * .14 * giat, 0.);
      float a = texture2D(tC, uv).a, rr = texture2D(tC, uv + vec2(.005, 0.)).a, bb = texture2D(tC, uv - vec2(.005, 0.)).a;
      float nhay = .25 + .75 * step(.07, h(floor(uT * 6. + uS * 7.)));
      float quet = .78 + .22 * sin(vUv.y * 90. + uT * 7.);
      vec3 c = (uMau * a + vec3(rr, 0., bb) * .5 * giat) * quet * nhay * uA;
      gl_FragColor = vec4(c, 1.);
    }`;
    DONG.forEach(([chu, mau, y, co], i) => {
      co *= dienThoai ? .4 : .55; y = dienThoai ? y : 3.2 + (y - 3.05) * .7;   // nằm trọn trong lỗ vỡ của tường cuối (x −4,2…4,4)
      const c = document.createElement('canvas'), g = c.getContext('2d'), F = '500 54px "IBM Plex Mono", monospace';
      g.font = F; c.width = Math.min(2048, Math.ceil(g.measureText(chu).width + 40)); c.height = 96;
      g.font = F; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(chu, 20, 50);
      const t = new THREE.CanvasTexture(c);
      const u = { tC: { value: t }, uT: { value: 0 }, uS: { value: i * 1.37 }, uA: { value: 0 }, uMau: { value: new THREE.Color(mau).multiplyScalar(mau === DO ? 2.2 : 1.4) } };
      const m = new THREE.Mesh(new THREE.PlaneGeometry(co * c.width / 100, co * .96), new THREE.ShaderMaterial({ uniforms: u, vertexShader: UV_VS, fragmentShader: CHU_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      const w = co * c.width / 100, z = -99.6 - (i % 3) * .15;   // trước hàng cột (z −104) và đám mảnh vụn (z ≤ −100)
      if (dienThoai) m.position.set(i % 2 ? .1 : -.1, 3.7 + (y - 3.05) * .55, z); else m.position.set(-3.6 + w / 2 + (i % 2) * .2, y, z);
      m.rotation.set(0, dienThoai ? 0 : .06, (i % 2 ? 1 : -1) * .015);
      m.renderOrder = 9; DOAN.ngoai.add(m);   // bản 6: sửa lỗi bản 5 — dòng add nằm lọt trong chú thích nên chữ không được thêm vào cảnh
      voChu.push(u);
    });
  }
  // vật thể vỡ vụn: mảnh đá đứng hình giữa vụ nổ, xoay chậm, "thở" ra vào
  const SO_VUN = dienThoai ? 55 : 120, vun = new THREE.InstancedMesh(daVun(5, 1), M.cotNgoai, SO_VUN), vunD = [];
  { const r = rnd(77);
    for (let i = 0; i < SO_VUN; i++) {
      const d = V3(r() - .5, (r() - .5) * .8, r() - .5).normalize(), rr = 1.2 + Math.pow(r(), .7) * 5.2;
      const p = TAM_VO.clone().addScaledVector(d, rr); p.y = Math.max(.4, p.y);
      if (Math.abs(p.x) < 1.3 && Math.abs(p.y - 3) < 1.2) p.x += Math.sign(p.x || 1) * 1.6;   // chừa đường máy quay đi qua
      if (p.z > -100) p.z = -100 - r() * 3;   // không che sát máy quay ở điểm dừng
      vunD.push({ p, s: .06 + Math.pow(r(), 2.4) * .34, a: V3(r() - .5, r() - .5, r() - .5).normalize(), v: (r() - .5) * .5, g: r() * 6, f: r() * 6 });
    }
    vun.frustumCulled = false; DOAN.ngoai.add(vun); }
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
  // bản 6 (góp ý): mảnh chỉ lơ lửng — trôi chậm, xoay nhẹ, nhấp nhô; không tụ lại, không nổ ra (bỏ tua ngược)
  const capNhatVun = T => {
    for (let i = 0; i < SO_VUN; i++) { const d = vunD[i];
      _p.copy(d.p).sub(TAM_VO).multiplyScalar(1 + .035 * Math.sin(T * .45 + d.f)).add(TAM_VO); _p.y += Math.sin(T * .6 + d.f) * .05;
      _q.setFromAxisAngle(d.a, d.g + T * d.v); _s.setScalar(d.s); _m4.compose(_p, _q, _s); vun.setMatrixAt(i, _m4); }
    vun.instanceMatrix.needsUpdate = true; vun.computeBoundingSphere(); };
  capNhatVun(0);
  // trống cột vỡ lơ lửng quanh tâm
  const trongVo = [];
  { const r = rnd(91);
    for (let i = 0; i < (dienThoai ? 4 : 7); i++) { const g = cotGay(.9 + r() * .8, 300 + i, .42); g.translate(0, -.6, 0); const m = new THREE.Mesh(g, M.cotNgoai);
      const a = i / 7 * Math.PI * 2; m.position.set(Math.cos(a) * (3 + r() * 2), 2.2 + r() * 4, TAM_VO.z + Math.sin(a) * 3); if (Math.abs(m.position.x) < 1.5) m.position.x += 2.5;
      m.rotation.set(r() * 3, r() * 3, r() * 3); m.userData.v = (r() - .5) * .25; m.userData.dong = true; m.userData.y0 = m.position.y; DOAN.ngoai.add(m); trongVo.push(m); } }
  // khung tranh mờ phía sau (ảnh làm nhoè bằng cách thu nhỏ rồi phóng lại, gắn khi tải nền xong)
  const khungMo = [];
  for (const [ten, asp, x, y, z, h, rz] of [['dem-sao', 1.26, -5.6, 3.9, -115, 2.4, .08], ['tieng-thet', .81, -1.6, 4.6, -118, 2.6, -.05], ['mona-lisa', .67, 2.6, 4.2, -117, 2.6, .06], ['song-lon', 1.49, 6.2, 3.6, -114, 2.2, -.1], ['ngoc-trai', .84, 7.4, 6.4, -120, 2.0, .12]]) {
    const w = h * asp, g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(0, -x * .03, rz);
    const mat = new THREE.MeshBasicMaterial({ color: 0x9fb8b4, transparent: true, opacity: .0, depthWrite: false });
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat));
    const k = []; for (const [bw, bh, dx, dy] of [[w + .3, .15, 0, h / 2 + .07], [w + .3, .15, 0, -h / 2 - .07], [.15, h + .3, w / 2 + .07, 0], [.15, h + .3, -w / 2 - .07, 0]]) k.push(tien(new THREE.BoxGeometry(bw, bh, .08), dx, dy, -.02));
    g.add(new THREE.Mesh(mergeGeometries(k, false), M.vangKhung)); DOAN.ngoai.add(g); khungMo.push({ ten, mat, g });
  }
  const denVo = new THREE.PointLight(DO, 0, 16, 1.6); denVo.position.set(0, 5.5, -104); scene.add(denVo);
  // bản 6, C: mảnh vụn bay quanh lõi hố đen theo đĩa nghiêng (gần tâm bay nhanh hơn); bị hút vào khi sụp
  const SO_QH = dienThoai ? 28 : 70, quanhHo = new THREE.InstancedMesh(daVun(9, 1), M.cotNgoai, SO_QH), qhD = [];
  { const r = rnd(55); for (let i = 0; i < SO_QH; i++) qhD.push({ r0: 1.3 + r() * 3.2, a: r() * 6.283, y: (r() - .5) * .5, s: .03 + Math.pow(r(), 2) * .12, ax: V3(r() - .5, r() - .5, r() - .5).normalize(), f: r() }); }
  quanhHo.frustumCulled = false; quanhHo.visible = false; quanhHo.userData.dong = true; DOAN.ngoai.add(quanhHo);
  const qhNghieng = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.25, 0, -.32));

  // ============ bản 5: KHUNG TRANH HY LẠP CỔ ĐẶT NGHIÊNG QUANH HỐ ĐEN (bị hút xoáy khi sụp) ============
  const TRANH_CO = { athens: 1.29, alexander: 1.54, fayum: .57, sappho: .96, exekias: 1.5, phidias: 1.54, homer: 1.31, narcissus: .79 };
  const DS_CO = [['athens', -3.2, 4.7, -129, 1.3, .25, .35], ['alexander', 3.5, 5.1, -130, 1.4, -.3, -.4], ['fayum', -4.7, 2.2, -127, 1.3, -.15, .5], ['exekias', 4.5, 2.1, -127.5, 1.1, .2, -.55],
    ['sappho', -2.3, 6.8, -132, 1.1, -.4, .2], ['homer', 2.3, 7.1, -133, 1.1, .5, -.2], ['phidias', -6.6, 4.4, -133, 1.5, .12, .6], ['narcissus', 6.9, 4.0, -134, 1.8, -.18, -.6],
    ['alexander', -1.5, .75, -125.2, .8, .5, .3], ['homer', 1.7, .8, -125.6, .85, -.6, -.25], ['athens', -8.6, 6.6, -138, 1.8, .3, .4], ['sappho', 8.9, 7.0, -139, 1.8, -.35, -.4]];
  const khungTroi = [];
  for (const [ten, x, y, z, h, rz, ry] of dienThoai ? DS_CO.slice(0, 8) : DS_CO) {
    const asp = TRANH_CO[ten], w = h * asp, T2 = .16, g = new THREE.Group();
    g.position.set(x, y, z); g.rotation.set((Math.random() - .5) * .25, ry, rz);
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), layMatTranh(ten)));
    const k = []; for (const [bw, bh, dx, dy] of [[w + 2 * T2, T2, 0, h / 2 + T2 / 2], [w + 2 * T2, T2, 0, -h / 2 - T2 / 2], [T2, h, w / 2 + T2 / 2, 0], [T2, h, -w / 2 - T2 / 2, 0]]) k.push(tien(new THREE.BoxGeometry(bw, bh, .1), dx, dy, -.02));
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) k.push(tien(new THREE.SphereGeometry(.09, 8, 6).scale(1, 1, .5).toNonIndexed(), sx * (w / 2 + T2 / 2), sy * (h / 2 + T2 / 2), .02));
    g.add(new THREE.Mesh(mergeGeometries(k.map(q => { q = q.index ? q.toNonIndexed() : q; q.deleteAttribute('uv'); return q; }), false), M.vangKhung));
    DOAN.ngoai.add(g); vatDo.push(g); khungTroi.push(g);
  }

  // ============ ĐÈN THEO CỤM (số đèn cố định → không biên dịch lại shader) ============
  const MAX = dienThoai ? { brand: 3, troi: 0, tuong: 0, am: 0 } : QS.has('denCu') ? { brand: 3, troi: 3, tuong: 4, am: 4 } : { brand: 2, troi: 2, tuong: 3, am: 2 };   // tối ưu 10/11: máy tính 21 → 14 đèn (mỗi đèn tính ở mọi điểm ảnh, kể cả đèn đang tắt); vẫn gán cho các vật gần máy quay nhất
  const denBrand = [...Array(MAX.brand)].map(() => { const l = new THREE.PointLight(0xffffff, 0, 6, 1.6); scene.add(l); return l; });
  const denTroi = [...Array(MAX.troi)].map(() => { const l = new THREE.SpotLight(0x9ff5ea, 0, 22, .5, 1, 1.3); scene.add(l, l.target); return l; });
  const denTuong = [...Array(MAX.tuong)].map(() => { const l = new THREE.SpotLight(0xffe2b8, 0, 14, .45, 1, 1.4); scene.add(l, l.target); return l; });
  const denAm = [...Array(MAX.am)].map(() => { const l = new THREE.PointLight(AM, 0, 15, 1.5); scene.add(l); return l; });
  const denVao = dienThoai ? null : new THREE.PointLight(AM, 16, 14, 1.6); if (denVao) { denVao.position.set(0, 5.5, -5.5); scene.add(denVao); }
  const ganDen = (ds, diem, f) => { const sx = diem.map((p, i) => [p.distanceToSquared(cam.position), i]).sort((a, b) => a[0] - b[0]); ds.forEach((l, j) => { const q = sx[j]; if (q) f(l, q[1], Math.sqrt(q[0])); else l.intensity = 0; }); };

  // bóng: vật đặc ở cổng
  DOAN.cong.traverse(o => { if (o.isMesh && o.material?.isMeshStandardMaterial && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });
  // tối ưu 10/11: vệt tối mềm giả dưới chân bục / tượng / cột / bộ xương (thay SAO). 1 InstancedMesh = 1 lệnh vẽ, không soi gương.
  { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, '#fff'); g.addColorStop(.45, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = '#000'; x.fillRect(0, 0, 64, 64); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c), ds = [];   // [x, y, z, cỡ x, cỡ z, độ đậm]
    ngoc.forEach((n, k) => ds.push([xLogo(k), .012, zLogo(k), 3.0, 3.0, .6]));
    for (const t of tuongs) ds.push([t.nhom.position.x, .012, t.nhom.position.z, 2.3, 2.3, .55]);
    for (const c of dungCot) ds.push([c.s * COTX, .012, c.z, 2.0, 2.0, .5]);
    for (const [s, z] of [[1, -71], [-1, -77], [1, -83]]) ds.push([s * COTX, .012, z, 1.8, 1.8, .5]);
    for (const xx of [-5.1, 5.1, -9.6, 9.6]) ds.push([xx, NEN + .17, 2.4, 2.0, 2.0, .45]);
    for (const xg of xuongs) ds.push([xg.position.x, NEN + .17, xg.position.z, 1.7, 1.4, .5]);
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: tex, transparent: true, opacity: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), mat, ds.length), m4 = new THREE.Matrix4(), mc = new THREE.Color();
    ds.forEach(([px, py, pz, sx, sz, a], i) => { m4.makeScale(sx, 1, sz).setPosition(px, py, pz); im.setMatrixAt(i, m4); im.setColorAt(i, mc.setScalar(a)); });
    // màu instance dùng làm độ đậm: alpha = alphaMap × độ đậm (sửa shader nhỏ)
    mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <alphamap_fragment>', '#include <alphamap_fragment>\n diffuseColor.a *= vColor.r; diffuseColor.rgb = vec3(0.);'); };
    im.renderOrder = 1; im.frustumCulled = false; im.layers.set(1); scene.add(im); }
  // tối ưu 10/11: vật nhỏ / hạt / sương / biển đồng không soi gương (gương chỉ thấy lớp 0; máy quay chính thấy lớp 0 + 1)
  cam.layers.enable(1);
  { const khongSoi = o => o.layers.set(1);
    scene.traverse(o => { if (o.isPoints || o.isSprite || (o.isMesh && o.material?.isShaderMaterial && o.material.blending === THREE.AdditiveBlending && o.renderOrder === 7)) khongSoi(o); });
    for (const n of ngoc) n.vong?.traverse(khongSoi); for (const b of bienCh) khongSoi(b); khe.layers.set(1); quangDo.forEach(khongSoi);
    scene.traverse(o => { if (o.material === M.kinh) khongSoi(o); }); }
  scene.traverse(o => { if (o.isMesh && o.parent && o.parent.parent === scene && !o.isReflector && !o.material.isShaderMaterial && !vatDo.includes(o) && !o.userData.dong) { o.matrixAutoUpdate = false; o.updateMatrix(); } });
  const goc0 = vatDo.map(o => ({ o, p: o.position.clone(), r: o.rotation.clone(), s: o.scale.clone() }));

  // ============ MÁY QUAY: 11 điểm dừng ============
  const DUNG = [], P = [], L = [];
  const diem = (p, l, dung) => { if (dung) DUNG.push(P.length); P.push(V3(...p)); L.push(V3(...l)); };
  diem([0, 3.1, 21], [0, 5.2, 0], 1);
  diem([.15, 3.0, 13], [.3, 4.8, 0]);
  diem([.75, 3.2, 5.2], [1.0, 3.4, -6], 1);
  diem([.5, 3.15, -1.1], [.3, 3.2, -9]);
  diem([.3, 3.0, -5.5], [-1.2, 2.9, -11]);
  for (let k = 0; k < DL; k++) { const x = xLogo(k), z = zLogo(k);
    diem([x + (x < 0 ? 2.9 : -2.9), 3.5, z + 6.4], [x, NGOC_Y, z], 1);
    if (k < DL - 1) diem([0, 3.1, z - 4.5], [xLogo(k + 1) * .5, 2.9, zLogo(k + 1) - 2]); }
  // bản 5: hành lang cũ + phế tích gộp thành 1 điểm dừng "MEMORY IS BROKEN"
  diem([0, 3.0, zLogo(DL - 1) - 6], [0, 3.3, -78]);
  diem([.4, 3.0, -78], [0, 3.4, -96]);
  diem([0, 3.1, -91], [0, 3.8, -107], 1);
  diem([0, 2.9, -112], [0, 3.1, ZK]);
  diem([0, khungTranh.userData.y0, ZK + 6.2], [0, khungTranh.userData.y0, ZK], 1);
  const duongP = new THREE.CatmullRomCurve3(P, false, 'centripetal'), duongL = new THREE.CatmullRomCurve3(L, false, 'centripetal');
  const tCua = u => { const i = Math.min(DUNG.length - 2, Math.max(0, Math.floor(u))), f = Math.min(1, Math.max(0, u - i)); return (DUNG[i] + (DUNG[i + 1] - DUNG[i]) * f) / (P.length - 1); };
  const THOI = DUNG.slice(0, -1).map((a, i) => Math.min(2.6, .9 + P[a].distanceTo(P[DUNG[i + 1]]) * .07));
  const DIEM_LOGO = k => 2 + k, DIEM_HO = DUNG.length - 1, DIEM_VO = DUNG.length - 2;

  // ---------- hậu kỳ ----------
  // tối ưu 10/11: bỏ SAO + Bokeh (mỗi pass vẽ lại cả cảnh thêm 1 lần)
  const MSAA = QS.has('msaa') ? +QS.get('msaa') : dienThoai ? 0 : 4;
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: MSAA });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, cam));
  let tia = null;
  if (!dienThoai) { tia = new ShaderPass(TiaShader); composer.addPass(tia); }
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .38, .55, 1.1); composer.addPass(bloom);
  // (UnrealBloomPass vốn đã tính từ 1/2 độ phân giải; hạ thêm sẽ làm quầng sáng loang rộng gấp đôi → giữ nguyên)
  const mosh = new MoshPass(); mosh.enabled = false; composer.addPass(mosh);   // bản 6: không còn gọi (thay bằng LiDAR + thấu kính), giữ lại để dùng sau
  const lidar = new ShaderPass(LidarShader); lidar.enabled = false; composer.addPass(lidar);
  const lens = new ShaderPass(LensShader); lens.enabled = false; composer.addPass(lens);
  // bản 6: bản đồ khoảng cách (mét) cho LiDAR, nửa độ phân giải, chỉ vẽ khi đang quét
  const rtKC = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType });
  const matKC = new THREE.ShaderMaterial({ side: THREE.DoubleSide, vertexShader: `#include <common>
varying float vD;
void main(){
#include <begin_vertex>
#include <project_vertex>
vD = -mvPosition.z; }`, fragmentShader: `varying float vD; void main(){ gl_FragColor = vec4(vD, 0., 0., 1.); }` });
  lidar.uniforms.tKC.value = rtKC.texture;
  const mauXoa = new THREE.Color(), mauXa = new THREE.Color(1000, 0, 0);
  const veKC = () => { const nen = scene.background, sg = scene.fog, a = renderer.getClearAlpha(); renderer.getClearColor(mauXoa);
    scene.background = null; scene.fog = null; scene.overrideMaterial = matKC; renderer.setClearColor(mauXa, 1); renderer.setRenderTarget(rtKC); renderer.clear();
    const an = []; scene.traverse(o => { const m = o.material; if (o.visible && o !== san && (o.isReflector || o.isPoints || o.isSprite || (m && !Array.isArray(m) && (m.blending === THREE.AdditiveBlending || m.transparent || m.isShaderMaterial)))) { an.push(o); o.visible = false; } });
    renderer.render(scene, cam); for (const o of an) o.visible = true;   // sàn (trong suốt để soi gương) vẫn được quét
    renderer.setRenderTarget(null); scene.overrideMaterial = null; scene.background = nen; scene.fog = sg; renderer.setClearColor(mauXoa, a); };
  composer.addPass(new OutputPass());
  const film = new ShaderPass(FilmShader); composer.addPass(film);   // FXAA nằm trong FilmShader (thay SMAAPass)
  film.uniforms.uFxaa.value = QS.get('fxaa') === '0' ? 0 : 1;

  let W = 1, H = 1, doc = false;
  function doiCo() {
    W = innerWidth; H = innerHeight; doc = W / H < 1;
    const pr = QS.has('pr') ? +QS.get('pr') : Math.min(devicePixelRatio, 1.5); renderer.setPixelRatio(pr); buiU.uPx.value = pr; saoU.uPx.value = pr;   // tối ưu 10/11: máy tính 1,6 → 1,5
    renderer.setSize(W, H, false); composer.setPixelRatio(pr); composer.setSize(W, H);
    cam.aspect = W / H; cam.fov = doc ? 64 : 50; cam.updateProjectionMatrix();
    const k = doc && !dienThoai ? Math.min(GUONG_K, .3) : GUONG_K; guong.getRenderTarget().setSize(Math.max(64, Math.round(W * pr * k)), Math.max(64, Math.round(H * pr * k))); guongMoi = true;   // tối ưu 10/11: cũ .8 (máy) / .5 (dt)
    film.uniforms.uRes.value.set(W, H); film.uniforms.uTx.value.set(1 / (W * pr), 1 / (H * pr));
    mosh.setSize(Math.round(W * pr), Math.round(H * pr));
    rtKC.setSize(Math.round(W * pr * .5), Math.round(H * pr * .5));
    lidar.uniforms.uRes.value.set(W * pr, H * pr); lens.uniforms.uRes.value.set(W * pr, H * pr); lens.uniforms.uAsp.value = W / H;
    lidar.uniforms.uDay.value = dienThoai ? .3 : .6;   // điện thoại: vạch mỏng hơn
  }
  doiCo(); nghe(window, 'resize', doiCo);

  // ---------- trạng thái ----------
  let u = 0, uDi = 0, uDen = 0, tBat = 0, dai = 1.2, dangDi = false;
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const chuot = { x: 0, y: 0, mx: 0, my: 0, px: 0, py: 0, co: 0 };
  let run = 0, sup = null;   // sup: { t0, xong }
  let vaoR = 1, dangVe = false;   // gop-3: vaoR = tiến độ chuyển cảnh vào (1 = đã ở cổng); dangVe = vòng vẽ đang chạy
  const nhin = { yaw: 0, pitch: 0, vy: 0, vp: 0, tTha: -99, giu: false, oy: 0, op: 0, ny: 0, np: 0 };
  let canhBao = -99, tieuDiem = 0, trangPhe = null;   // tối ưu 10/11: tieuDiem thay Bokeh; trangPhe = trăng đang ở phế tích
  let moshManh = 0, tFlash = -99, flashCho = -1;   // bản 5: datamosh / flash light khi chuyển cảnh
  let huT = 0, huV = 0, huX = 0, moshQuet = 0;   // bản 6: lò xo "hố hút nhẹ" khi rê chuột
  let tron = null, xqHien = 0;   // bản 6: tron = đích u khi kéo theo cuộn (đoạn cổng → cửa), máy quay trượt mượt về đó; xqHien = độ X-quang hiện tại
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const AO_MAT = [M.ao, M.cavat, M.mu, M.muLuoi, M.dep, M.dui, M.vangThe];
  const vien = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), quangMat(0xfff0d0, 0)); vien.renderOrder = 8; scene.add(vien); let vienT = null;
  const vP = new THREE.Vector3(), denTam = [], tmp = new THREE.Vector3();
  nghe(window, 'pointermove', e => { chuot.x = e.clientX / W - .5; chuot.y = e.clientY / H - .5; chuot.px = e.clientX; chuot.py = e.clientY; chuot.co = 1; });
  const pC = new THREE.Vector3(), pL = new THREE.Vector3();
  const dong = new THREE.Clock(); let T = 0, den = 1;
  let ngheDung = null, khiMat = null;
  nghe(canvas, 'webglcontextlost', e => { e.preventDefault(); renderer.setAnimationLoop(null); khiMat && khiMat(); });

  function datMay(uu) {
    const t = tCua(uu);
    duongP.getPoint(t, pC); duongL.getPoint(t, pL);
    if (doc) { const k = Math.max(0, 1 - uu); pC.z += 4 * k; pL.y -= .5 * k; }
    cam.position.copy(pC);
    if (doc) { const ui = Math.round(uu); if (ui >= 2 && ui < 2 + DL) {   // bản 6, màn dọc: lùi máy quay ở bục logo để logo + vòng sỏi nằm trọn màn (lỗi lẹm mép 390)
      const w = Math.max(0, 1 - Math.abs(uu - ui) * 2); tmp.subVectors(pC, pL).normalize(); cam.position.addScaledVector(tmp, .9 * w); pL.y -= .7 * w; } }   // gop-3: lùi ít hơn (2,6 → 0,9 m) + nhìn thấp xuống để logo to, nằm nửa trên màn (nửa dưới là nhãn)
    pL.x += chuot.mx * .35; pL.y -= chuot.my * .25;
    { const ui = Math.round(uu); if (!doc && ui >= 2 && ui < 2 + DL) {   // máy tính: đẩy logo sang trái khung, chừa chỗ cho nhãn bên phải
      const w = Math.max(0, 1 - Math.abs(uu - ui) * 2); tmp.subVectors(pL, pC).cross(TRUC_Y).normalize(); pL.addScaledVector(tmp, 1.15 * w); } }
    if (run > 0 && !nhe) { cam.position.x += run * (Math.sin(T * 1.13) * .007 + Math.sin(T * 2.71 + 1) * .003); cam.position.y += run * (Math.sin(T * 1.37 + 2) * .006 + Math.sin(T * 3.3) * .002);
      pL.x += run * Math.sin(T * .83 + .5) * .03; pL.y += run * Math.sin(T * .97 + 3) * .02; }
    cam.lookAt(pL);
    cam.rotateY(nhin.yaw + nhin.oy); cam.rotateX(nhin.pitch + nhin.op);
    if (run > 0 && !nhe) cam.rotateZ(run * Math.sin(T * .71) * .0025);
  }
  const am = new THREE.Color(), teal = new THREE.Color();
  function ve() {
    renderer.info.reset();
    const dt = Math.min(.05, dong.getDelta()); T += dt;
    if (dangDi) { const k = Math.min(1, (T - tBat) / dai); u = uDi + (uDen - uDi) * eio(k); if (k >= 1) { dangDi = false; u = uDen; ngheDung && ngheDung(u); } }
    else if (tron !== null) { u += (tron - u) * Math.min(1, dt * (nhe ? 20 : 4.5)); if (Math.abs(tron - u) < 1e-4) u = tron; }
    const m = nhe ? 0 : 1;
    chuot.mx += (chuot.x * m - chuot.mx) * .04; chuot.my += (chuot.y * m - chuot.my) * .04;
    run += ((dangDi ? 0 : 1) - run) * Math.min(1, dt * 1.5);
    if (!nhin.giu) { nhin.yaw += nhin.vy; nhin.pitch += nhin.vp; nhin.vy *= .9; nhin.vp *= .9;
      if (T - nhin.tTha > 3 || dangDi || sup) { const k = Math.min(1, dt * (dangDi ? 3 : 1.2)); nhin.yaw -= nhin.yaw * k; nhin.pitch -= nhin.pitch * k; } }
    nhin.yaw = Math.max(-1.22, Math.min(1.22, nhin.yaw)); nhin.pitch = Math.max(-.44, Math.min(.44, nhin.pitch));
    nhin.oy += (nhin.ny - nhin.oy) * .08; nhin.op += (nhin.np - nhin.op) * .08;
    datMay(u);
    // gop-3, tối ưu 10/11: CHUYỂN CẢNH NÃO → BẢO TÀNG ngắn (vaoR 0 → 1 trong ~0,5 s, trang gộp phủ màn tối): máy quay lùi 4,5 m + cao 0,9 m rồi trượt về đúng tư thế cổng.
    //   (bản cũ: hạ từ trên trời theo tia trăng, kèm tàn lửa / bụi 2D — đã bỏ cho nhanh)
    if (vaoR < 1) { const e = 1 - Math.pow(1 - vaoR, 3); cam.position.add(tmp.set(0, .9, 4.5).multiplyScalar(1 - e)); den = Math.max(den, 1 - ss(0, .8, vaoR)); }
    // bản 6: rê chuột / chạm giữ vào hố đen → hố phóng to (lò xo), máy quay trôi chậm về lõi; rời ra thì nhả từ từ
    huV += ((huT * (sup ? 0 : 1) - huX) * 55 - huV * (huT ? 9 : 6)) * dt; huX = Math.max(0, Math.min(1.3, huX + huV * dt));
    if (!nhe && huX > .001) cam.position.lerp(TAM_HO, .09 * Math.min(1, huX));
    ho.scale.setScalar(1 + .24 * huX);
    // ---- sụp: rung, chớp đỏ, mọi thứ bị hút xoáy về hố, máy quay lao vào lõi ----
    let tSup = 0;
    if (sup) {
      // bản 6, B: hút kiểu bản C, ~5,5 s: (0,3–3,2) cột/đá/khung tranh/tượng kéo dài thành sợi xoắn vào lõi → (2,4–4,0) khung chính méo, gãy 4 thanh, bị hút cuối
      //   → (3,0–4,9) máy quay lao vào xoáy, xoay vòng → (3,9–5,0) vỡ khối điểm ảnh đỏ → (4,7–5,2) tối hẳn
      sup.tt = Math.max(0, sup.tt + (sup.nguoc ? -dt * 2.4 : dt)); tSup = sup.tt; const k = Math.min(1, tSup / 5.4), rung = (nhe ? .2 : 1) * Math.min(1, tSup / 1.2) * (1 - Math.max(0, (k - .85) / .15));
      cam.position.x += (Math.random() - .5) * .14 * rung; cam.position.y += (Math.random() - .5) * .12 * rung;
      const vao = Math.pow(Math.max(0, (tSup - 3.0) / 1.9), 2.2);
      cam.position.lerp(TAM_HO, Math.min(.97, vao)); cam.fov = (doc ? 64 : 50) + vao * 40; cam.updateProjectionMatrix();
      if (!nhe) cam.rotateZ(vao * 4.5 + Math.max(0, tSup - 2.5) * .25);
      hoU.uR.value = 1 + tSup * .35 + vao * 4;
      film.uniforms.uDo.value = (.5 + .5 * Math.sin(tSup * 9)) * Math.min(1, tSup) * .55;
      for (const g of goc0) { const tre = (Math.abs(g.p.x) * .06 + Math.abs(g.p.z - ZK) * .025), p = Math.min(1, Math.max(0, (tSup - .3 - tre) / 2.4)), e = p * p;
        const v = g.p.clone().sub(TAM_HO), r0 = Math.hypot(v.x, v.y), a0 = Math.atan2(v.y, v.x) + e * 5, rr2 = r0 * (1 - e);
        g.o.position.set(TAM_HO.x + Math.cos(a0) * rr2, TAM_HO.y + Math.sin(a0) * rr2 + e * (1 - e) * 2, g.p.z + (TAM_HO.z - g.p.z) * e);
        g.o.rotation.copy(g.r);
        if (e > .01 && !nhe) { g.o.lookAt(TAM_HO); g.o.rotateZ(e * 6); }   // kéo sợi: trục z hướng vào lõi, dài ra, mỏng đi
        const keo = nhe ? 1 : 1 + e * (1 - e) * 14 + e * 3, mong = Math.max(.02, 1 - e * .97);
        g.o.scale.set(g.s.x * mong, g.s.y * mong, g.s.z * mong * keo); }
      for (const m of trongVo) { const p = Math.min(1, Math.max(0, (tSup - .2) / 2.2)); m.scale.setScalar(Math.max(.02, 1 - p * p)); }
      { const p = Math.min(1, Math.max(0, (tSup - 2.2) / 1.2)); khungG.scale.set(1 - .28 * p, 1 + .3 * p, 1); khungG.rotation.z = NGHIENG + p * p * .5;   // khung chính bị kéo méo
        thanhKhung.forEach((b, i) => { const q = Math.min(1, Math.max(0, (tSup - 2.9 - i * .14) / 1.0)), e = q * q;   // rồi gãy rời từng thanh, xoắn vào giữa
          b.m.position.copy(b.p).multiplyScalar((1 - e) * (1 + .35 * Math.sin(Math.PI * Math.min(1, q * 2.5)))); b.m.position.z = e * -1.2;
          b.m.rotation.set(b.r.x + e * 2, b.r.y, b.r.z + e * (i % 2 ? 4 : -4)); b.m.scale.set(b.s.x * Math.max(.03, 1 - e), b.s.y * Math.max(.03, 1 - e), b.s.z * (1 + e * 8)); }); }
      window.__tSup = sup.nguoc ? 0 : tSup;   // 13/11 anh: trang mẹ loang trắng từ lúc vỡ khối
      if (tSup > 4.7) den = Math.min(1, (tSup - 4.7) / .5);
      if (tSup > 5.3 && !sup.xong) { sup.xong = true; sup.cb && sup.cb(); }
      if (sup.nguoc && tSup <= 0) phucHoi();   // bản 6: tua ngược xong → về lại điểm dừng hố đen
    } else { den = Math.max(0, den - dt * 1.2); const q = u - DIEM_VO; if (!nhe && q > 0 && q < 1) den = Math.max(den, .38 * Math.sin(Math.PI * q)); }   // bản 6: MEMORY → hố đen: tối dịu xuống rồi sáng lại (nhẹ)
    const zc = cam.position.z;
    // bật/ẩn theo đoạn
    DOAN.cong.visible = zc > -9; DOAN.sanhA.visible = zc < 8 && zc > -60; DOAN.sanhB.visible = zc < -4 && zc > -95; DOAN.cu.visible = zc < -22; DOAN.ngoai.visible = zc < -52;
    { const gv = zc < 2.5 && zc > -99; if (gv && !guong.visible) guongMoi = true; guong.visible = gv; } san.visible = zc > -110;
    // trăng: cổng ↔ phế tích (tối ưu 10/11: bóng chỉ tính lại khi trăng đổi chỗ)
    { const phe = zc < -80; if (phe !== trangPhe) { trangPhe = phe; renderer.shadowMap.needsUpdate = true; }
      if (phe) { trang.position.set(-30, 40, -95); trang.target.position.set(0, 2, -125); trang.angle = .55; } else { trang.position.set(-9, 22, 26); trang.target.position.set(0, 4, 2); trang.angle = .5; } }
    // màu sương: ấm ngay sau cửa → teal trong sảnh; phế tích loãng hơn
    const amK = Math.exp(-Math.pow((zc + 3) / 6, 2));
    scene.fog.color.copy(MAU_SUONG).lerp(SUONG_AM, amK * .8); scene.fog.density = zc < -96 ? .014 : .026;
    film.uniforms.uLoa.value = Math.exp(-Math.pow((zc + .5) / 1.6, 2)) * .5;
    film.uniforms.uT.value = T; film.uniforms.uDen.value = den;
    kheU.uA.value = Math.min(1, Math.max(0, (zc - 1.2) / 2.5)) * .8; kheU.uT.value = T;
    const f = .8 + .2 * Math.sin(T * 13) * Math.sin(T * 3.1) + (Math.sin(T * 37) > .97 ? .25 : 0) + (sup ? Math.sin(tSup * 9) * .4 : 0);
    const cb = T - canhBao < 1.2 ? Math.max(0, Math.sin((T - canhBao) * 16)) : 0;
    if (!sup) film.uniforms.uDo.value = cb * .28;
    for (const d of dendo) { d.pl.intensity = 9 * f * (1 + cb * 2); d.bong.material.color.setHex(DO).multiplyScalar(3.2 * f); d.qU.uA.value = .5 * f; }
    for (const q of quangDo) q.quaternion.copy(cam.quaternion);
    if (!nhe && xuongs.length && DOAN.cong.visible) {
      const [a, b] = xuongs;
      a.userData.dau.rotation.z = Math.sin(T * 1.1) * .05 - .06;
      for (const x of xuongs) { const dh = x.userData.dau; dh.rotation.y += ((chuot.co ? chuot.x * .9 : 0) + (T - canhBao < 2 ? Math.sin((T - canhBao) * 14) * .3 : 0) - dh.rotation.y) * .06; }
      const chao = Math.pow(Math.max(0, Math.sin(T * .8)), 12);
      // bản 6: giữ dáng gốc (tay chạm vành mũ như ảnh nền AI); chỉ nhích rất nhẹ, không vẫy tay ra xa
      a.userData.tay.quaternion.copy(a.userData.tay.userData.goc).multiply(tmpQ.setFromEuler(tmpE.set(chao * .035 - .015 * Math.sin(T * .4), 0, -chao * .03)));
      a.userData.ham.rotation.x = .04 + .03 * Math.sin(T * 2.1);
      const ngap = Math.pow(Math.max(0, Math.sin(T * .55)), 8);
      b.userData.dau.rotation.x = -.3 * ngap + Math.sin(T * .7) * .04;
      b.userData.ham.rotation.x = .08 + .45 * ngap;
      const go = Math.pow(Math.max(0, Math.sin(T * 3.2)), 6) * (1 - ngap);
      b.userData.tay.quaternion.copy(b.userData.tay.userData.goc).multiply(tmpQ.setFromEuler(tmpE.set(-go * .05, 0, go * .03)));   // bản 6: dùi cui nằm yên trên vai, gõ khẽ
    }
    // logo
    let gan0 = null, ganMax = 0;
    for (const n of ngoc) {
      const kc = cam.position.distanceTo(n.nhom.position);
      n.nhom.visible = kc < 40;   // tối ưu 10/11: 45 → 40 m
      if (!n.nhom.visible) continue;
      n.quang.quaternion.copy(cam.quaternion);
      n.nhom.lookAt(cam.position.x, n.nhom.position.y, cam.position.z);
      let hv = 0;
      if (chuot.co) { vP.copy(n.nhom.position).project(cam); const sx = (vP.x * .5 + .5) * W, sy = (-vP.y * .5 + .5) * H; hv = vP.z < 1 && Math.hypot(chuot.px - sx, chuot.py - sy) < Math.min(W, H) * .2 ? 1 : 0; }
      n.hover += (hv - n.hover) * .1;
      if (!nhe) { const chu = 7, pha = ((T + n.k * 1.3) % chu) / chu, vong = pha > .8 ? eio((pha - .8) / .2) * Math.PI * 2 : 0;
        n.logo.rotation.set(Math.sin(T * .7 + n.k) * .1 + n.hover * chuot.y * .5, Math.sin(T * .9 + n.k * 1.7) * .28 + vong + n.hover * chuot.x * .8, Math.sin(T * .6 + n.k) * .06);
        n.logo.position.y = Math.sin(T * 1.2 + n.k) * .09; }
      const gan = Math.abs(u - DIEM_LOGO(n.k)) < .5 ? 1 - Math.abs(u - DIEM_LOGO(n.k)) * 2 : 0;
      if (gan > ganMax) { ganMax = gan; gan0 = n; }
      n.logoU.uT.value = T; n.logoU.uHover.value = n.hover; n.logoU.uGon.value = nhe ? -1 : ((T * .22 + n.k * .37) % 1.6) * 1.6 - .4;
      if (!nhe) { n.vong.rotation.y = T * .12 + n.k; n.vongG.position.y = Math.sin(T * .7 + n.k) * .05; }
      if (n.vat) n.vat.capNhat(nhe ? 0 : T);
      n.quangU.uA.value = .5 * (.8 + .5 * Math.max(gan * .6, n.hover)) * (n.d.id === 'electric' ? .45 : 1);   // gop-3: quầng Electric nhẹ hơn cho đọc chữ
    }
    // gán đèn theo cụm gần máy quay
    ganDen(denBrand, ngoc.map(n => n.nhom.position), (l, i, kc) => { const n = ngoc[i]; l.position.copy(n.nhom.position); l.color.copy(n.mau); l.intensity = kc < 40 ? 6 + 4 * (n === gan0 ? ganMax : 0) + Math.sin(T * 1.6 + n.k) * .8 : 0; });
    ganDen(denTroi, viTriTroi, (l, i, kc) => { l.position.set(viTriTroi[i].x, TRAN + .5, viTriTroi[i].z); l.target.position.set(viTriTroi[i].x, 0, viTriTroi[i].z); l.target.updateMatrixWorld(); l.intensity = kc < 40 ? 26 : 0; });
    ganDen(denTuong, tuongs.map(t => t.dich), (l, i, kc) => { const t = tuongs[i]; l.position.set(t.dich.x * .72, 7.4, t.dich.z + 1.5); l.target.position.copy(t.dich); l.target.updateMatrixWorld(); l.intensity = kc < 30 ? 40 : 0; });
    ganDen(denAm, viTriDenTuong, (l, i, kc) => { l.position.copy(viTriDenTuong[i]); l.intensity = kc < 35 ? 20 : 0; });
    // nhoè hậu cảnh khi đứng ở logo
    // tối ưu 10/11: thay Bokeh bằng sương dày hơn chút khi đứng ở logo (hậu cảnh chìm vào sương teal) + tối góc mạnh hơn chút
    { const muc = gan0 && !dangDi && !sup ? ganMax : 0; tieuDiem += (muc - tieuDiem) * Math.min(1, dt * 3);
      if (zc >= -96) scene.fog.density = .026 + (dienThoai ? .008 : .02) * tieuDiem; film.uniforms.uVig.value = .36 - .08 * tieuDiem; }
    // tia trăng
    if (tia) { let best = 0, bp2 = null;
      for (const p of viTriTroi) { vP.set(p.x, TRAN + .9, p.z); const kc = vP.distanceTo(cam.position); vP.project(cam);
        const w = vP.z < 1 && zc < -2 ? Math.max(0, 1 - kc / 26) * Math.max(0, 1 - Math.abs(vP.x) / 1.6) : 0; if (w > best) { best = w; bp2 = [vP.x * .5 + .5, vP.y * .5 + .5]; } }
      const tu = tia.uniforms; tu.uStr.value += (best * 1.7 - tu.uStr.value) * .08; if (bp2) tu.uP.value.set(bp2[0], bp2[1]); }
    // lens flare
    denTam.length = 0;
    for (const d of denFlare) { vP.copy(d.p).project(cam); if (vP.z < 1 && Math.abs(vP.x) < 1 && Math.abs(vP.y) < 1) denTam.push([d.p.distanceToSquared(cam.position), vP.x * .5 + .5, vP.y * .5 + .5, d.c]); }
    denTam.sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < 4; i++) { const Lf = film.uniforms.uL.value[i], q = denTam[i]; if (q) { Lf.set(q[1], q[2], Math.min(1, 40 / q[0]) * (q[3].g < .5 ? f : 1)); film.uniforms.uLC.value[i].copy(q[3]); } else Lf.z = 0; }
    // hố đen: mở dần khi tới gần điểm cuối
    if (!sup) hoU.uR.value += ((u > DIEM_HO - 1.05 ? Math.min(1, Math.max(0, (u - (DIEM_HO - 1)) * 1.6 + .25)) : 0) - hoU.uR.value) * .06;
    hoU.uT.value = T;
    // bản 6, C: mảnh vụn quay quanh lõi
    quanhHo.visible = DOAN.ngoai.visible && hoU.uR.value > .15;
    if (quanhHo.visible) { const hut = sup ? Math.min(1, Math.max(0, (tSup - .2) / 2.4)) : 0;
      for (let i = 0; i < SO_QH; i++) { const d = qhD[i], r = d.r0 * (1 - hut * hut); d.a += dt * (nhe ? 0 : .9 / Math.pow(d.r0, 1.5) * (1 + hut * 8));
        _p.set(Math.cos(d.a) * r, d.y * (1 - hut), Math.sin(d.a) * r).applyQuaternion(qhNghieng).add(TAM_HO);
        if (huX > .001) _p.lerp(TAM_HO, .28 * Math.min(1, huX) * (1 - hut));
        _q.setFromAxisAngle(d.ax, T * 2 + d.f * 6); _s.set(1, 1, 1 + hut * 6).multiplyScalar(d.s * Math.min(1, hoU.uR.value) * (1 - hut * .85)); _m4.compose(_p, _q, _s); quanhHo.setMatrixAt(i, _m4); }
      quanhHo.instanceMatrix.needsUpdate = true; }
    // bản 6, A: LiDAR gắn theo u trong đoạn logo cuối (DIEM_VO − 1) → MEMORY (DIEM_VO)
    { const p = u - (DIEM_VO - 1), lu = lidar.uniforms; const bat = !nhe && !sup && p > .01 && p < .995;
      lidar.enabled = bat;
      if (bat) { lu.uQuet.value = 70 * Math.pow(ss(.03, .5, p), 1.4); lu.uA1.value = ss(.02, .06, p) * (1 - ss(.44, .52, p));   // lượt 1
        lu.uQuet2.value = 70 * Math.pow(ss(.36, .84, p), 1.4); lu.uA2.value = ss(.36, .4, p) * (1 - ss(.8, .9, p));             // lượt 2
        lidar.enabled = lu.uA1.value + lu.uA2.value > .002; if (lidar.enabled) { cam.updateMatrixWorld(); veKC(); } }
      moshQuet = !nhe && !sup && p > .8 && p < .98 ? .28 * Math.sin(Math.PI * (p - .8) / .18) : 0; }   // kết thúc: datamosh nhẹ ~.28, ngắn
    // bản 6, B: thấu kính hấp dẫn (mạnh dần khi tới hố đen), xoáy + vỡ khối điểm ảnh khi sụp, thấu kính nhỏ theo con trỏ ở điểm cuối
    { const lu = lens.uniforms; vP.copy(TAM_HO).project(cam); const tr = vP.z < 1;
      tmp.copy(TAM_HO).add(V3(0, .62 * Math.max(.3, hoU.uR.value), 0)).project(cam);
      const rU = tr ? Math.min(.6, Math.abs(tmp.y - vP.y) * .5) : 0, p = u - DIEM_VO;
      // ngưỡng bắt đầu lensing theo quãng MEMORY → hố đen (p 0 → 1): bản 6a .05 (quá sớm), 6b .88 (quá sát), 6c .70 (hiện tại)
      const LENS_BAT = .7;
      // góp ý: chỉ bật khi đã tới sát hố (u > ĐIỂM HỐ − .12) hoặc khi rê/chạm vào hố, tăng dần từ 0, nhẹ ~45% bản trước; bỏ lensing ở đoạn chuyển MEMORY → hố đen
      let K = tr ? ss(LENS_BAT, 1, p) * Math.min(1, hoU.uR.value + .2) * .25 + Math.min(1, huX) * .4 : 0; const buoc = 0;
      if (sup) K = 1 + tSup * .5;
      lu.uC.value.set(vP.x * .5 + .5, vP.y * .5 + .5); lu.uR.value = Math.max(rU, .1 * buoc); lu.uK.value = nhe ? 0 : K + buoc;
      lu.uXoay.value = sup ? Math.pow(Math.max(0, (tSup - 2.6) / 2.3), 1.5) * 9 + tSup * .3 : 0;
      lu.uVo.value = sup && !nhe ? Math.min(1, Math.max(0, (tSup - 3.9) / 1.1)) : 0;
      const k2 = !sup && !nhe && chuot.co && p > .7 ? ss(.7, 1, p) : 0; lu.uK2.value += (k2 - lu.uK2.value) * .1;
      lu.uC2.value.lerp(tmp.set(chuot.x + .5, .5 - chuot.y, 0), .15); lu.uT.value = T;
      lens.enabled = DOAN.ngoai.visible && (lu.uK.value > .01 || lu.uK2.value > .01 || lu.uVo.value > 0); }
    if (vienT) { vien.position.copy(vienT.tam); vien.quaternion.copy(cam.quaternion); vien.scale.setScalar(vienT.cao * 1.25); vien.material.uniforms.uA.value += (.22 - vien.material.uniforms.uA.value) * .15; }
    else vien.material.uniforms.uA.value *= .85;
    vien.visible = vien.material.uniforms.uA.value > .01;
    // ---- bản 5: datamosh khi đi giữa các điểm dừng được chọn ----
    { let k = 0; if (moshManh > 0 && dangDi) { const q = Math.min(1, (T - tBat) / dai); k = moshManh * Math.pow(Math.sin(Math.PI * q), 1.6); } else moshManh = 0;
      k = Math.max(k, moshQuet);
      if (k > .01 && !mosh.enabled) { mosh.enabled = true; mosh.u.uMoi.value = 1; }
      if (k <= .01) mosh.enabled = false;
      mosh.u.uK.value = k; mosh.u.uT.value = T; }
    // ---- bản 5: flash light: chớp trắng → ánh X-quang, quần áo biến mất, chỉ còn bộ xương sáng ----
    // bản 6: GẮN THEO CUỘN — độ chớp và X-quang chỉ phụ thuộc vị trí máy quay u trong đoạn cổng (0) → cửa (1). Dừng cuộn = dừng ở trạng thái đó.
    //   u .10–.20 chớp trắng, .17–.30 vào X-quang, giữ tới .78, nhạt hết ở .95. Nấc X-quang (dừng được) ở u = .5.
    { let fl = 0, xq = 0;
      if (!nhe && !sup && u > 0 && u < 1) { fl = u < .1 ? 0 : u < .2 ? (u - .1) / .1 : Math.exp(-(u - .2) * 16); xq = ss(.17, .3, u) * (1 - ss(.78, .95, u)); }
      xqHien = xq;
      film.uniforms.uFlash.value = fl * .95; film.uniforms.uXq.value = xq * .9;
      const an = xq > .35; if (AO_MAT[0].visible === an) renderer.shadowMap.needsUpdate = true; for (const m of AO_MAT) m.visible = !an;   // quần áo ẩn/hiện → tính lại bóng 1 lần
      M.xuong.emissive.setRGB(.55, .75, .85).multiplyScalar(xq * 2.6); }
    // ---- bản 5: vùng MEMORY IS BROKEN ----
    if (DOAN.ngoai.visible) {
      const vao = Math.min(1, Math.max(0, (-80 - zc) / 10)) * (zc > -123 ? 1 : .35);
      for (const c of voChu) { c.uT.value = T; c.uA.value = vao; }
      if (vao > 0) { capNhatVun(T); for (const m of trongVo) { m.rotation.x += m.userData.v * dt; m.rotation.z += m.userData.v * .6 * dt; m.position.y = m.userData.y0 + Math.sin(T * .5 + m.userData.v * 20) * .12; } }
      denVo.intensity = vao * 7 * (.75 + .25 * Math.sin(T * 17) * Math.sin(T * 5.3)) * (sup ? 0 : 1);
      for (const k of khungMo) k.mat.opacity = k.mat.map ? vao * .5 : 0;
      if (!sup) khungTroi.forEach((g, i) => { const b = goc0.find(q => q.o === g); if (!b) return; g.position.y = b.p.y + Math.sin(T * .45 + i * 1.7) * .1; g.rotation.z = b.r.z + Math.sin(T * .3 + i) * .05; });
    } else denVo.intensity = 0;
    for (const c of cotSang) c.uT.value = T;
    for (const s of suongU) s.uT.value = T;
    buiU.uT.value = T; saoU.uT.value = T;
    composer.render(dt);
  }
  const tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler();
  const _vG = new THREE.Vector3(), _vA = new THREE.Vector3(), _qG = new THREE.Quaternion(), _qA = new THREE.Quaternion();
  function phucHoi() {   // bản 6: trả mọi thứ về như lúc đứng ở hố đen (sau khi tua ngược hiệu ứng hút)
    const cb = sup && sup.khiVe; sup = null;
    for (const g of goc0) { g.o.position.copy(g.p); g.o.rotation.copy(g.r); g.o.scale.copy(g.s); }
    for (const b of thanhKhung) { b.m.position.copy(b.p); b.m.rotation.copy(b.r); b.m.scale.copy(b.s); } khungG.scale.set(1, 1, 1); khungG.rotation.z = NGHIENG;
    for (const m of trongVo) m.scale.setScalar(1);
    lens.uniforms.uVo.value = 0; lens.uniforms.uXoay.value = 0; film.uniforms.uDo.value = 0; den = 0; hoU.uR.value = 1;
    cam.fov = doc ? 64 : 50; cam.updateProjectionMatrix(); u = uDen = DIEM_HO; tron = null; dangDi = false;
    cb && cb();
  }
  // tối ưu 13/11: trước đây shader được dịch trước cho kiểu "vẽ thẳng ra màn hình", nhưng bảo tàng vẽ qua composer (vào bộ đệm: màu tuyến tính, không tone mapping)
  //   → khung hình đầu tiên phải dịch lại toàn bộ, trang đứng ~4,5 s (máy tính) / ~2,5 s (điện thoại) đúng lúc màn tối mở ra cổng.
  //   Nay dịch đúng biến thể mà composer dùng (đặt bộ đệm của composer làm đích lúc dịch), rồi đẩy ảnh lên GPU từng cái, nhường khung.
  let daHuy = false;
  async function dichTruoc() {
    if (daHuy || renderer.getContext().isContextLost()) return;
    const rt0 = renderer.getRenderTarget(); renderer.setRenderTarget(composer.readBuffer);
    let hua; try { hua = renderer.compileAsync(scene, cam); } catch (e) { try { renderer.compile(scene, cam); } catch (_) { } }
    renderer.setRenderTarget(rt0);   // chỉ cần đặt đích trong lúc TẠO shader; phần chờ dịch xong chạy nền, không giữ đích (vòng vẽ có thể đang chạy)
    try { await hua; } catch (e) { }
    const ds = new Set(); scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { for (const k in m) { const v = m[k]; if (v && v.isTexture && !v.isRenderTargetTexture && v.image) ds.add(v); } }); });
    let i = 0; for (const t of ds) { if (daHuy) return; try { renderer.initTexture(t); } catch (e) { } if (++i % 4 === 0) await new Promise(r => setTimeout(r, 0)); }
  }
  await dichTruoc();
  if (!cho) { renderer.setAnimationLoop(ve); dangVe = true; }
  // ---- bản 5: tải nền (tượng, tranh) sau khi cảnh đầu đã chạy; gắn dần vào cảnh khi về ----
  const taiNen = (async () => {
    const [gApollo, gAmazon, gZeus, gDio, gCoGai, gBanThan, gBinh] = await Promise.all([napGLB(nh('tuong-apollo')), napGLB(nh('tuong-amazon')), napGLB(nh('tuong-zeus')), napGLB(nh('tuong-dionysos')),
      napGLB(nh('tuong-co-gai')), napGLB('tuong-ban-than.glb'), napGLB('binh-amphora.glb')]);
    if (daHuy) return;
    mau.apollo = chuanMH(gApollo, 2.25); mau.amazon = chuanMH(gAmazon, 2.15); mau.zeus = chuanMH(gZeus, .95); mau.dio = chuanMH(gDio, 1.25);
    mau.cogai = chuanMH(gCoGai, 2.0); mau.banthan = chuanMH(gBanThan, .78); mau.binh = chuanMH(gBinh, .62);
    for (const f of choGan) f();
    if (mau.apollo) { const t = mau.apollo.clone(); t.position.set(-.6, 2.0, TAM_VO.z - .5); t.rotation.set(.35, .6, -.5); DOAN.ngoai.add(t); t.userData.dong = true; trongVo.push(Object.assign(t, { userData: { v: .08, y0: 2.0, dong: true } })); }
    
    // tranh: sảnh trước, rồi khung cổ quanh hố đen; khung mờ dùng lại ảnh sảnh (thu nhỏ → nhoè)
    await Promise.all(Object.keys(matTranh).map(async ten => {
      try { const t = await tlo.loadAsync(TR(ten)); if (daHuy) return; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
        const m = matTranh[ten]; m.map = t; m.emissiveMap = t; m.color.set(0xffffff); m.emissiveIntensity = .34; m.needsUpdate = true;
        for (const k of khungMo) if (k.ten === ten) { const c = document.createElement('canvas'), w = 24, h = Math.round(24 / (t.image.width / t.image.height)); c.width = w; c.height = h; c.getContext('2d').drawImage(t.image, 0, 0, w, h);
          const tm = new THREE.CanvasTexture(c); tm.colorSpace = THREE.SRGBColorSpace; tm.generateMipmaps = false; tm.minFilter = THREE.LinearFilter; k.mat.map = tm; k.mat.color.set(0x8fa6a2); k.mat.needsUpdate = true; }
      } catch (e) { console.warn('Không nạp được tranh', ten); }
    }));
    // tối ưu 13/11: tượng + tranh tải nền xong thì dịch shader của chúng ngay (song song, không chặn trang) → hết cú đứng ~2,4 s lúc bước qua cửa vào sảnh (trước đây 6 shader của tượng đợi tới lúc nhìn thấy mới dịch)
    await dichTruoc();
  })();

  function huy() {
    if (daHuy) return; daHuy = true;
    renderer.setAnimationLoop(null);
    for (const [o, t, fn, opt] of suKien) o.removeEventListener(t, fn, opt);
    const tex = new Set();
    scene.traverse(o => {
      o.geometry?.dispose();
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of ms) { if (!m) continue; Object.values(m).forEach(v => v?.isTexture && tex.add(v)); if (m.uniforms) Object.values(m.uniforms).forEach(x => x.value?.isTexture && tex.add(x.value)); m.dispose(); }
      if (o.isReflector) o.dispose();
      if (o.isLight && o.shadow?.map) o.shadow.map.dispose();
    });
    tex.forEach(t => t.dispose()); env.dispose(); pm.dispose(); rtKC.dispose(); matKC.dispose(); _texQuang?.dispose();
    for (const p of composer.passes) p.dispose?.();
    composer.dispose?.(); rt.dispose();
    renderer.dispose(); renderer.forceContextLoss();
  }
  const ray = new THREE.Raycaster(), nd = new THREE.Vector2(); ray.layers.enableAll();   // tối ưu 10/11: vật lớp 1 (biển đồng…) vẫn bấm được
  function chieu(v) { const p = v.clone().project(cam); return { x: (p.x * .5 + .5) * W, y: (-p.y * .5 + .5) * H, sau: p.z > 1 }; }
  return {
    soDiem: DUNG.length, DIEM_LOGO: 2, DIEM_HO,
    u: () => u, dangDi: () => dangDi, dangSup: () => !!sup,
    denDiem(i, tuc = false) {
      if (sup) return;
      const dich = Math.max(0, Math.min(DUNG.length - 1, i));
      tron = null;
      if (tuc) { u = uDen = dich; dangDi = false; ngheDung && ngheDung(u); return; }
      uDi = u; uDen = dich; tBat = T;
      const a = Math.min(u, dich), b = Math.max(u, dich); let s = 0;
      for (let k = Math.floor(a); k < Math.ceil(b); k++) s += THOI[k] * Math.min(1, Math.min(b, k + 1) - Math.max(a, k));
      dai = Math.max(.5, Math.min(4, s)) * (nhe ? .5 : 1); dangDi = true;
    },
    khiDung(fn) { ngheDung = fn; },
    keoU(v) { if (sup) return; dangDi = false; tron = Math.max(0, Math.min(DUNG.length - 1, v)); },   // bản 6: trượt mượt tới u = v (cuộn tới đâu chạy tới đó)
    dangKeo: () => tron !== null && Math.abs(tron - u) > .004,
    xq: () => xqHien,
    khiMatContext(fn) { khiMat = fn; },
    viTriLogo: k => { const n = ngoc[k]; if (!n) return null; const c = chieu(n.nhom.position.clone().add(V3(0, .1, 0))), t = chieu(n.nhom.position.clone().add(V3(0, 1.35, 0))); return { ...c, r: Math.abs(c.y - t.y) }; },
    viTriHo: () => { const c = chieu(TAM_HO), t = chieu(TAM_HO.clone().add(V3(0, .62 * Math.max(.3, hoU.uR.value), 0))); return { ...c, r: Math.abs(c.y - t.y), mo: hoU.uR.value }; },
    chonTai(x, y) {   // trả { loai, k?, x, y (điểm trên đầu vật trên màn hình) } hoặc null
      nd.set(x / W * 2 - 1, -(y / H) * 2 + 1); ray.setFromCamera(nd, cam);
      const ds = [...ngoc.map(n => n.chuong), ...chonVat.filter(o => o.parent?.visible !== false && doanCua(o.position.z).visible), ...bienCh.filter(o => o.parent.visible || o.parent.parent?.visible)];
      if (DOAN.ngoai.visible && hoU.uR.value > .3) ds.push(ho);
      const oVo = DOAN.ngoai.visible && cam.position.z < -85 && cam.position.z > -112;   // bản 6, C: mảnh vỡ ở MEMORY trỏ/chạm được
      if (oVo) ds.push(vun, ...trongVo.filter(m => m.isMesh));
      const hs = ray.intersectObjects(ds, false).filter(h => h.distance < 30); if (!hs.length) return null;
      const o = hs[0].object; if (o === ho) { const c = chieu(TAM_HO); return { loai: 'ho', x: c.x, y: c.y }; }
      if (o === vun || trongVo.includes(o)) { const c = chieu(hs[0].point); return { loai: 'manh', x: c.x, y: c.y, i: hs[0].instanceId ?? -1 }; }
      const tt = o.userData.tt; const tam = tt.tam || o.getWorldPosition(V3(0, 0, 0)); const dinh = chieu(tam.clone().add(V3(0, (tt.cao || .3) * .55, 0)));
      return { ...tt, x: dinh.x, y: dinh.y, tamV: tam, cao: tt.cao || .5 };
    },
    danhDau(c) { vienT = c && c.loai !== 'ho' && c.loai !== 'logo' ? { tam: c.tamV, cao: c.cao } : null; },
    nhinKeo(dx, dy) { nhin.giu = true; nhin.vy = -dx * .0042; nhin.vp = -dy * .0032; nhin.yaw += nhin.vy; nhin.pitch += nhin.vp; },
    nhinTha() { nhin.giu = false; nhin.tTha = T; },
    nghieng(g, b) { nhin.ny = Math.max(-.18, Math.min(.18, -g * .006)); nhin.np = Math.max(-.12, Math.min(.12, -(b - 50) * .004)); },
    canhBao() { canhBao = T; },
    huHo(b) { huT = b && !sup && !nhe ? 1 : 0; },   // bản 6: đang trỏ / chạm giữ vào hố đen
    huX: () => huX,
    hieuUng(loai, manh = 1) { if (nhe) return; if (loai === 'mosh') moshManh = manh; if (loai === 'flash') flashCho = manh; },   // gọi ngay sau denDiem
    taiNen: () => taiNen,
    sup(cb) { if (sup) { sup.nguoc = false; return; } uDen = DIEM_HO; if (dangDi) { dangDi = false; } tron = DIEM_HO; sup = { t0: T, tt: 0, cb, xong: false }; },   // sửa cuộn 11/11: không nhảy u về hố đen (gây giật khung cuối trước khi hút) — trượt nốt phần còn lại
    tuaLai(cb) { if (!sup) return; sup.nguoc = true; sup.khiVe = cb; },   // bản 6: cuộn lùi khi đang/đã bị hút → chạy ngược hiệu ứng hút
    tienLai() { if (sup) sup.nguoc = false; },
    datLai() { sup = null; moshManh = 0; tFlash = -99; tron = null; for (const g of goc0) { g.o.position.copy(g.p); g.o.rotation.copy(g.r); g.o.scale.copy(g.s); }
      for (const b of thanhKhung) { b.m.position.copy(b.p); b.m.rotation.copy(b.r); b.m.scale.copy(b.s); } khungG.scale.set(1, 1, 1); khungG.rotation.z = NGHIENG;
      for (const m of trongVo) m.scale.setScalar(1); lens.uniforms.uVo.value = 0; hoU.uR.value = 0; film.uniforms.uDo.value = 0; cam.fov = doc ? 64 : 50; cam.updateProjectionMatrix(); u = uDen = 0; dangDi = false; den = 1; },
    co: () => ({ W, H, doc }),
    info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries, dienThoai, pr: renderer.getPixelRatio(), msaa: MSAA, fxaa: film.uniforms.uFxaa.value, guongK: GUONG_K, guongCach: GUONG_CACH, bong: (() => { let n = 0; scene.traverse(o => { if (o.isMesh && o.castShadow) n++; }); return n; })(), den: (() => { let n = 0; scene.traverse(o => { if (o.isLight) n++; }); return n; })() }),
    huy,
    // gop-3: trang gộp điều khiển vòng vẽ (chỉ 1 cảnh WebGL nặng được vẽ tại 1 thời điểm) + chuyển cảnh vào
    chay() { if (daHuy || dangVe) return; dong.getDelta(); renderer.shadowMap.needsUpdate = true; guongMoi = true; renderer.setAnimationLoop(ve); dangVe = true; },
    dung() { renderer.setAnimationLoop(null); dangVe = false; },
    dangVe: () => dangVe,
    vao(r) { vaoR = Math.max(0, Math.min(1, r)); },
    veMot() { ve(); },
    _go: { scene, composer, cam, DOAN },
  };
}
