// ===== Scene 2 "bên trong đầu Bluezii" — nạp sau scene 1 (gop/index.html gọi import('./nao.mjs')) =====

{ const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap'; document.head.appendChild(l);

  const st = document.createElement('style'); st.textContent = '\n/* Demo khung hình: POV người đi trên bề mặt não hồng lúc 4 giờ sáng. Giữ các ý của bản overthinking (chữ ý nghĩ, khớp thần kinh, đồng hồ, still awake) + vật phi lý. */\n#naoHud { --nen: #12051a; --chu: #ffe9f0; --mo: rgba(255,233,240,.6); --do: #ff4d5e; color-scheme: dark; }\n#naoHud .hud { position: fixed; z-index: 2; letter-spacing: .1em; text-transform: uppercase; color: var(--mo); text-shadow: 0 1px 10px rgba(40,0,30,.8); }\n#naoHud .hud b { color: var(--chu); font-weight: 500; }\n#naoHud .to { font: 400 34px/1 "VT323", monospace; color: var(--chu); display: block; }\n#tt { top: 16px; left: max(16px, env(safe-area-inset-left, 0px)); }\n#tp { top: 16px; right: max(16px, env(safe-area-inset-right, 0px)); text-align: right; }\n#dt { bottom: 16px; left: max(16px, env(safe-area-inset-left, 0px)); }\n#dp { bottom: 16px; right: max(16px, env(safe-area-inset-right, 0px)); text-align: right; }\n#dp #naoHud .to { color: var(--do); }\n\n#naoHud { position: fixed; inset: 0; z-index: 12; pointer-events: none; font: 400 12px/1.5 "IBM Plex Mono", ui-monospace, monospace; color: var(--chu); opacity: 0; transition: opacity .4s; }\nbody.nao #naoHud { opacity: 1; }\n#naoHud #dp { display: none; }\n#naoHud #veToi { position: absolute; left: max(40px, env(safe-area-inset-left, 0px)); bottom: calc(56px + env(safe-area-inset-bottom, 0px)); max-width: min(560px, 86vw); opacity: 0; transform: translateY(12px); transition: opacity .7s, transform .7s; text-transform: none; letter-spacing: 0; color: #fff6f9; font-size: 17px; line-height: 1.6; text-shadow: 0 2px 18px rgba(4,10,16,.85), 0 0 2px rgba(4,10,16,.6); }\n#naoHud::before { content: ""; position: absolute; left: 0; bottom: 0; width: min(900px, 100vw); height: 70vh; background: radial-gradient(ellipse at 0% 100%, rgba(3,10,16,.78) 0%, rgba(3,10,16,.45) 38%, rgba(3,10,16,0) 70%); opacity: 0; transition: opacity .7s; pointer-events: none; }\n#naoHud.coChu::before { opacity: 1; }\n#naoHud #dt { top: 62px; bottom: auto; }\n@media (max-width: 600px) { #naoHud #veToi { left: 16px; bottom: calc(40px + env(safe-area-inset-bottom, 0px)); font-size: 15px; } #naoHud #veToi b { font-size: 30px !important; } }\n#naoHud #veToi.hien { opacity: 1; transform: none; }\n#naoHud #veToi b { font: 500 44px/1.05 \"IBM Plex Mono\", monospace; letter-spacing: -.01em; display: block; margin-bottom: 14px; color: #fff; }\n#naoHud #veToi p { margin: 0 0 10px; max-width: 46ch; } #naoHud #veToi p:last-child { margin: 0; color: #ff9aa8; }\ncanvas#naoGl { position: fixed; inset: 0; width: 100%; height: 100%; display: block; z-index: 11; opacity: 0; pointer-events: none; transition: opacity .35s; }\nbody.nao canvas#naoGl { opacity: 1; }\n'; document.head.appendChild(st);

  const h = document.createElement('div'); h.id = 'naoHud'; h.innerHTML = '<div class="hud" id="tt"><b>ABOUT ME</b><br>inside my head · 03:47 AM</div>\n<div class="hud" id="tp"><span class="to">03:47</span>AM · Hà Nội</div>\n<div class="hud" id="dt">sleep ▱▱▱▱▱ <b>0%</b></div>\n<div class="hud" id="dp"><span class="to">999+</span>thoughts / sec</div>' + '<div id="veToi"><b>Hi, I\'m Trung Hieu.</b><p>People call me Bluezii. Creative director from Hà Nội.</p><p>I collect records, late-night ideas and good people, then turn them into things worth staying up for.</p><p>My head never really switches off. This is what it looks like at 3:47 AM.</p></div>'; document.body.appendChild(h); }



import * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';



const GOC = +(new URLSearchParams(location.search).get('goc') || 1);

const TROI_XANH = new URLSearchParams(location.search).get('troi') !== 'tim';

const SANG = { value: 1 }, UT = { value: 0 };   // SANG: độ sáng trời (chớp mắt làm tối), UT: thời gian cho shader

// [chân trời, đỉnh trời, dải sáng chân trời]

const TROI = TROI_XANH ? ['vec3(.16,.42,.46)', 'vec3(.006,.022,.04)', 'vec3(.55,.42,.30)'] : ['vec3(.52,.15,.32)', 'vec3(.025,.008,.04)', 'vec3(.28,.07,.16)'];

const HAM_TROI = `vec3 troi(vec3 d){ float h = clamp(d.y*2.2,0.,1.); vec3 c = mix(${TROI[0]}, ${TROI[1]}, pow(h,.45)); c += ${TROI[2]}*exp(-abs(d.y)*18.); return c; }`;

await Promise.all([document.fonts.load('400 40px "IBM Plex Mono"', 'aăâđêôơư ếệỗửộ'), document.fonts.load('500 40px "IBM Plex Mono"', 'aăâđêôơư ếệỗửộ'), document.fonts.load('400 40px VT323')]).catch(() => {});   // tải trước phần chữ có dấu tiếng Việt



// ---------- nhiễu 2D (simplex rút gọn) ----------

const P = new Uint8Array(512); { const p = [...Array(256).keys()]; let s = 7; for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) P[i] = p[i & 255]; }

const G = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

function noise(x, y) {

  const F2 = .366025, G2 = .211325, s = (x + y) * F2, i = Math.floor(x + s), j = Math.floor(y + s), t = (i + j) * G2;

  const x0 = x - i + t, y0 = y - j + t, i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;

  const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2, ii = i & 255, jj = j & 255;

  let n = 0;

  for (const [dx, dy, g] of [[x0, y0, P[ii + P[jj]]], [x1, y1, P[ii + i1 + P[jj + j1]]], [x2, y2, P[ii + 1 + P[jj + 1]]]]) {

    let tt = .5 - dx * dx - dy * dy; if (tt > 0) { tt *= tt; const gr = G[g & 7]; n += tt * tt * (gr[0] * dx + gr[1] * dy); }

  }

  return 70 * n;

}

// ---------- độ cao bề mặt não: nếp cuộn (gyri) tròn, rãnh (sulci) hẹp ----------

let A_CUOI = 0;

// mặt đất làm phẳng cho thú chạy: trung bình nhiều điểm quanh chân, không nảy theo từng nếp nhỏ

function caoMuot(x, z) { let t = 0; for (const [a, b] of [[0, 0], [1.4, 0], [-1.4, 0], [0, 1.4], [0, -1.4], [1, 1], [-1, -1], [1, -1], [-1, 1]]) t += cao(x + a, z + b); return t / 9 + .35; }

function cao(x, z) {

  const wx = x + 3 * noise(x * .07, z * .07), wz = z + 3 * noise(x * .07 + 31, z * .07 + 17);

  const g = noise(wx * .2, wz * .2);

  A_CUOI = Math.abs(g);

  const nep = 1 - Math.exp(-Math.abs(g) * 7);          // nếp tròn như khúc ruột, rãnh hẹp sâu

  return nep * 1.5 + 2.2 * noise(x * .018, z * .018) + .03 * noise(x * 1.4, z * 1.4);

}



const W = innerWidth, H = innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); window.__naoR = renderer;   // tối ưu 13/11: hình đi qua composer nên khử răng cưa của canvas không có tác dụng, chỉ tốn bộ nhớ GPU → tắt
 renderer.debug.checkShaderErrors = new URLSearchParams(location.search).has('soiShader');   // tối ưu tải 10/11: tắt đọc log shader (chặn trang ~17 s lúc vẽ đầu trên máy đo); ?soiShader để bật lại khi soi lỗi window.__naoR = renderer;   // soi số shader khi tối ưu

renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 2)); renderer.setSize(W, H);   // điện thoại: 1.5 cho nhẹ

renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;

renderer.domElement.id = 'naoGl'; document.body.appendChild(renderer.domElement);
// gop-3: khi vào bảo tàng, trang gộp gọi mat() để giải phóng GPU của não (mất context có chủ đích); lùi về thì hoi() — three.js tự nạp lại texture/hình lên GPU
window.__naoGPU = { mat: () => renderer.forceContextLoss(), hoi: () => renderer.forceContextRestore(), mat_: () => renderer.getContext().isContextLost() };

const scene = new THREE.Scene();

scene.fog = new THREE.FogExp2(TROI_XANH ? 0x0b2328 : 0x1e0719, .016);

const cam = new THREE.PerspectiveCamera(GOC === 2 || W / H < .8 ? 72 : 62, W / H, .1, 600);   // phương án B: màn dọc nhìn rộng hơn (72°) để thấy cả con mắt lẫn mặt đất



// ---------- bầu trời: tím đêm, chân trời hồng phát sáng ----------

const troi = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uSang: SANG },

  vertexShader: 'varying vec3 v; void main(){ v = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',

  fragmentShader: 'uniform float uSang; varying vec3 v; ' + HAM_TROI + ' void main(){ gl_FragColor = vec4(troi(v) * uSang,1.); }' }));

scene.add(troi);



// ---------- mặt não ----------

const LUOI_NAO = innerWidth < 700 ? 420 : 700;   // phương án B: điện thoại 353 nghìn tam giác thay vì 980 nghìn
const geo = new THREE.PlaneGeometry(220, 220, LUOI_NAO, LUOI_NAO); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -60);

const pos = geo.attributes.position, mau = new Float32Array(pos.count * 3);

const cRanh = new THREE.Color(0x7a1f3d), cNep = new THREE.Color(0xf2a0b4), cDinh = new THREE.Color(0xffd2dc), tmp = new THREE.Color();

for (let i = 0; i < pos.count; i++) {

  const x = pos.getX(i), z = pos.getZ(i), h = cao(x, z); pos.setY(i, h);

  const k = Math.min(1, A_CUOI / .38);

  tmp.copy(cRanh).lerp(cNep, Math.min(1, k * 1.6)); if (k > .75) tmp.lerp(cDinh, (k - .75) * 2);

  mau.set([tmp.r, tmp.g, tmp.b], i * 3);

}

geo.setAttribute('color', new THREE.BufferAttribute(mau, 3)); geo.computeVertexNormals();

const naoMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .45, clearcoat: .45, clearcoatRoughness: .35, sheen: 1, sheenColor: new THREE.Color(0xffc4d4), sheenRoughness: .5 });

scene.add(new THREE.Mesh(geo, naoMat));



// mạch máu mảnh bò trên mặt não

const mach = new THREE.MeshPhysicalMaterial({ color: 0x8e1b4a, roughness: .3, clearcoat: 1 });

for (let m = 0; m < 26; m++) {

  let x = (Math.random() - .5) * 120, z = -Math.random() * 140 + 20, gocM = Math.random() * 6.28; const pts = [];

  for (let i = 0; i < 40; i++) { gocM += (Math.random() - .5) * .5; x += Math.cos(gocM) * 1.2; z += Math.sin(gocM) * 1.2; pts.push(new THREE.Vector3(x, cao(x, z) + .05, z)); }

  scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, .06 + Math.random() * .05, 6), mach));

}



// ---------- ánh sáng ----------

scene.add(new THREE.HemisphereLight(0xffb6cc, 0x2a0820, 1.1));

const ven = new THREE.DirectionalLight(0xff9ec0, 1.4); ven.position.set(-20, 18, -80); scene.add(ven);   // ngược sáng từ chân trời

const phu = new THREE.DirectionalLight(0x9fb4ff, .6); phu.position.set(30, 40, 30); scene.add(phu);



// ---------- chữ ý nghĩ (ý cũ của Blue) ----------

function chuSprite(t, co, mauChu, phat) {

  const c = document.createElement('canvas'), g = c.getContext('2d');

  g.font = `400 ${co}px ${co > 60 && !/[^ -~]/.test(t) ? 'VT323, "IBM Plex Mono", monospace' : '"IBM Plex Mono", monospace'}`; const w = Math.ceil(g.measureText(t).width) + 40;

  c.width = w; c.height = co * 1.6; g.font = `400 ${co}px ${co > 60 && !/[^ -~]/.test(t) ? 'VT323, "IBM Plex Mono", monospace' : '"IBM Plex Mono", monospace'}`;

  g.textBaseline = 'middle'; g.shadowColor = phat; g.shadowBlur = 5; g.fillStyle = mauChu; g.fillText(t, 20, c.height / 2);

  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;

  const sm = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: true }), song = { value: 0 };

  sm.onBeforeCompile = sh => { sh.uniforms.uSong = song; sh.uniforms.uT = UT;

    sh.fragmentShader = 'uniform float uSong; uniform float uT;\n' + sh.fragmentShader.replace('#include <map_fragment>',

      'vec2 uvS = vMapUv + vec2(sin(vMapUv.y * 26. + uT * 7.) * .016, sin(vMapUv.x * 9. + uT * 5.) * .022) * uSong; diffuseColor *= texture2D(map, uvS);'); };

  const s = new THREE.Sprite(sm); s.userData.song = song;

  s.scale.set(w / c.height, 1, 1); return s;

}

// chữ (anh 09/11): công việc ~65%, đời sống ~35%

// chữ ý nghĩ: mỗi câu chỉ xuất hiện 1 lần, không có 2 câu cùng ý (anh 09/11). ~65% công việc, ~35% đời sống. Câu trong NONG hiện màu đỏ.
const CV = ['Antimusic poster v7', 'Electric guest spot', 'Điên Nặng next party', 'Gaztik 2AM set', 'Design drink menu', 'LED wall budget',
  'kick too loud', 'the font is wrong', 'redo the room', 'v12_final_final', 'one more idea', 'new logo?', 'not weird enough', 'reply client',
  'check the P&L', 'lương tháng này', 'chốt line-up chưa', 'brief chưa gửi', 'caption tối nay', 'merch drop?', 'render 43%', 'Ctrl+Z',
  'mai tính', 'ổn chưa?', 'who am I', 'dress well', 'gửi hoá đơn', 'moodboard v3', 'gọi lại nhà in', 'sound check 6PM', 'booking DJ tháng sau',
  'sửa lại kịch bản', 'deadline', 'why is it 4AM', 'hay là…', '??'];
const DS = ['muốn đi du lịch quá', 'bao giờ mua được Porsche 911', 'ăn gì giờ', 'đi biển đi', 'tập gym từ mai', 'uống 1 ly thôi',
  'ai rep tin nhắn chưa', 'nghỉ 1 tuần được không', 'muốn nuôi mèo', 'stay weird', 'Tokyo?', 'đm mệt vl', 'cần được ngủ', 'mua giày nữa à',
  'gọi về nhà', 'quên uống nước', '1 tập phim nữa', 'sang năm lấy vợ', 'mai dậy sớm (không)'];
const NONG = new Set(['deadline', 'why is it 4AM', 'đm mệt vl', 'cần được ngủ']);
let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const diemChu = [], CHU = [];

const TRON = [...CV, ...DS]; for (let i = TRON.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [TRON[i], TRON[j]] = [TRON[j], TRON[i]]; }
TRON.forEach((t, i) => { const nong = NONG.has(t), cao_ = i >= 38;          // 38 câu ở tầng thấp, còn lại bay cao trên trời
  const s = chuSprite(t, 64, nong ? '#ff5a6a' : '#fff4f8', nong ? '#ff2040' : '#ff9ac0');
  if (cao_) { s.userData.cao = true; s.scale.multiplyScalar(1.4 + rnd() * 1.4); scene.add(s); CHU.push(s); return; }
  const z = -8 - rnd() * 100, x = (rnd() - .5) * (20 + -z * .9), y = cao(x, z) + 6 + rnd() * (6 + -z * .18);
  s.position.set(x, y, z); const k = .6 + rnd() * 1.3; s.scale.multiplyScalar(k * (1 + -z * .012)); scene.add(s); diemChu.push(s.position); CHU.push(s); });

// khớp thần kinh nối các ý nghĩ: dây sáng mảnh

const lg = []; for (let i = 0; i < 70; i++) { const a = diemChu[(rnd() * diemChu.length) | 0], b = diemChu[(rnd() * diemChu.length) | 0]; if (a.distanceTo(b) < 26) lg.push(a.x, a.y, a.z, b.x, b.y, b.z); }

const lgG = new THREE.BufferGeometry(); lgG.setAttribute('position', new THREE.Float32BufferAttribute(lg, 3));

scene.add(new THREE.LineSegments(lgG, new THREE.LineBasicMaterial({ color: 0xffb0d0, transparent: true, opacity: .35, blending: THREE.AdditiveBlending })));

// đốm sáng lơ lửng

{ const n = 900, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const x = (rnd() - .5) * 120, z = -rnd() * 150 + 10; a.set([x, cao(x, z) + .5 + rnd() * 16, z], i * 3); }

  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));

  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffd6e6, size: .12, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }))); }



// ---------- vật phi lý ----------

const vat = (c, r = .45, ex = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, clearcoat: .4, ...ex });

// 1. Cá mập biết bay

function caMap() {

  const g = new THREE.Group();

  const pr = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pr.push(new THREE.Vector2(Math.max(.001, Math.sin(Math.PI * Math.pow(t, .8)) * (t < .3 ? 1.05 : 1) * 1.1 * (1 - .35 * t)), (t - .5) * 9)); }

  const than = new THREE.LatheGeometry(pr, 40); than.rotateZ(-Math.PI / 2);

  const p = than.attributes.position, cl = new Float32Array(p.count * 3);

  for (let i = 0; i < p.count; i++) { const k = THREE.MathUtils.smoothstep(p.getY(i), -.35, .25); const c = new THREE.Color(0xeeeef2).lerp(new THREE.Color(0x52677e), k); cl.set([c.r, c.g, c.b], i * 3); }

  than.setAttribute('color', new THREE.BufferAttribute(cl, 3)); than.scale(1, .95, .8);

  g.add(new THREE.Mesh(than, vat(0xffffff, .3, { vertexColors: true, clearcoat: 1 })));

  const vay = (pts, d = .12) => { const s = new THREE.Shape(); s.moveTo(...pts[0]); pts.slice(1).forEach(q => s.lineTo(...q)); const e = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: .04, bevelThickness: .04 }); e.translate(0, 0, -d / 2); return new THREE.Mesh(e, vat(0x4c6078, .35)); };

  const lung = vay([[-.6, 0], [.9, 0], [-.2, 2.1]]); lung.position.set(-.6, .8, 0); g.add(lung);

  const duoi1 = vay([[0, 0], [1.6, 1.9], [1.1, 0]]); duoi1.position.set(4.2, 0, 0); g.add(duoi1);

  const duoi2 = vay([[0, 0], [1.2, -1.3], [.8, 0]]); duoi2.position.set(4.2, 0, 0); g.add(duoi2);

  for (const sgn of [1, -1]) { const v = vay([[0, 0], [1.1, 0], [.9, -1.7]], .08); v.rotation.x = sgn * 1.1; v.position.set(-1.6, -.5, sgn * .5); g.add(v);

    const mat = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8), vat(0x050505, .1, { clearcoat: 1 })); mat.position.set(-3.6, .25, sgn * .52); g.add(mat); }

  const mieng = new THREE.Mesh(new THREE.TorusGeometry(.5, .05, 6, 20, Math.PI * .8), vat(0x3a0a14, .6)); mieng.rotation.set(Math.PI / 2, 0, Math.PI * .1); mieng.position.set(-3.4, -.55, 0); g.add(mieng);

  return g;

}

// 2. Gà phun lửa

function gaLua() {

  const g = new THREE.Group(), trang = vat(0xfbf3e6, .7), do_ = vat(0xe0202a, .5), vang = vat(0xffb21a, .4);

  const than = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), trang); than.scale.set(1.25, 1, .95); than.position.y = 1.9; g.add(than);

  const co = new THREE.Mesh(new THREE.CylinderGeometry(.42, .6, 1.1, 20), trang); co.position.set(-.95, 2.8, 0); co.rotation.z = .45; g.add(co);

  const dau = new THREE.Mesh(new THREE.SphereGeometry(.52, 24, 16), trang); dau.position.set(-1.25, 3.45, 0); g.add(dau);

  for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.2 - i * .02, 12, 8), do_); m.position.set(-1.45 + i * .22, 3.98 - i * .04, 0); g.add(m); }

  const mo = new THREE.Mesh(new THREE.ConeGeometry(.16, .5, 12), vang); mo.rotation.z = Math.PI / 2; mo.position.set(-1.85, 3.4, 0); g.add(mo);

  const yem = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), do_); yem.scale.y = 1.6; yem.position.set(-1.62, 3.1, 0); g.add(yem);

  for (const s of [1, -1]) { const mat = new THREE.Mesh(new THREE.SphereGeometry(.08, 10, 8), vat(0x050505, .1, { clearcoat: 1 })); mat.position.set(-1.6, 3.58, s * .35); g.add(mat);

    const canh = new THREE.Mesh(new THREE.SphereGeometry(.75, 20, 12), trang); canh.scale.set(1.3, .65, .25); canh.position.set(.1, 2, s * .9); canh.rotation.z = -.25; g.add(canh);

    const chan = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.2, 8), vang); chan.position.set(0, .6, s * .35); g.add(chan); }

  const duoi = new THREE.Mesh(new THREE.ConeGeometry(.6, 1.4, 16), trang); duoi.position.set(1.35, 2.6, 0); duoi.rotation.z = -.6; g.add(duoi);

  // lửa: hạt cộng sáng xếp thành nón từ mỏ

  const n = 1400, a = new Float32Array(n * 3), cl = new Float32Array(n * 3);

  for (let i = 0; i < n; i++) { const t = Math.pow(rnd(), .7), r = t * 1.6 * Math.sqrt(rnd()), q = rnd() * 6.28;

    a.set([-2.1 - t * 7, 3.4 + Math.sin(q) * r + t * t * 1.2, Math.cos(q) * r], i * 3);

    const c = new THREE.Color().setHSL(.13 - t * .12, 1, .75 - t * .35); cl.set([c.r, c.g, c.b], i * 3); }

  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(a, 3)); lg.setAttribute('color', new THREE.BufferAttribute(cl, 3));

  g.add(new THREE.Points(lg, new THREE.PointsMaterial({ size: .35, vertexColors: true, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })));

  const den = new THREE.PointLight(0xff7a1a, 25, 16, 1.8); den.position.set(-5, 3.6, 0); g.add(den);

  return g;

}

// 3. Cánh cửa đứng giữa não, khe cửa hắt sáng (đi đâu không biết)

function cua() {

  const g = new THREE.Group(), go = vat(0x1d1420, .6);

  for (const [w, h, x, y] of [[.25, 4.6, -1.3, 2.3], [.25, 4.6, 1.3, 2.3], [2.85, .25, 0, 4.6]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .35), go); m.position.set(x, y, 0); g.add(m); }

  const sang = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 4.45), new THREE.MeshBasicMaterial({ color: 0xfff1c9 })); sang.position.set(0, 2.25, -.02); g.add(sang);

  const canh = new THREE.Mesh(new THREE.BoxGeometry(2.3, 4.4, .12), vat(0x2b6f8f, .5)); canh.geometry.translate(1.15, 0, 0); canh.position.set(-1.17, 2.25, .1); canh.rotation.y = -1.05; g.add(canh);

  const tay = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), vat(0xd9b061, .2)); tay.position.set(1.9, 0, .12); canh.add(tay);

  const den = new THREE.PointLight(0xffe2a8, 12, 12, 1.8); den.position.set(0, 2.3, 1.5); g.add(den);

  return g;

}

// 4. Cá voi đĩa than: đĩa than khổng lồ bay như sứa (nối với phòng đĩa than scene 1)

function diaSua() {

  const g = new THREE.Group();

  const dia = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, .12, 64), vat(0x0b0b0e, .25, { clearcoat: 1 })); g.add(dia);

  const nhan = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .14, 40), new THREE.MeshStandardMaterial({ color: 0xff4d5e, emissive: 0xff2d4a, emissiveIntensity: .6 })); g.add(nhan);

  for (let i = 0; i < 9; i++) { const q = i / 9 * 6.28, pts = []; for (let k = 0; k < 10; k++) pts.push(new THREE.Vector3(Math.cos(q) * (2.4 - k * .08) + Math.sin(k * .8 + i) * .3, -k * .7, Math.sin(q) * (2.4 - k * .08)));

    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .06, 5), new THREE.MeshStandardMaterial({ color: 0xffb3d1, emissive: 0xff7ab0, emissiveIntensity: .9, transparent: true, opacity: .75 }))); }

  return g;

}



const dat = (o, x, z, nang = 0) => { o.position.set(x, cao(x, z) + nang, z); scene.add(o); return o; };

// (cá mập khối cũ: thay bằng mô hình thật)

const ga = dat(gaLua(), -12, -28, -.15); ga.rotation.y = -2.75;   // anh 09/11: gà ở chỗ cũ; hướng chạy đặt ở đoạn 'gà chạy thật' (chéo vào sâu, ngược đàn ngựa) ga.scale.setScalar(1.25);

const denGa = new THREE.SpotLight(0xffd6e4, 120, 40, .5, .6); denGa.position.set(0, 12, 0); denGa.target = ga; scene.add(denGa);

// (bỏ đĩa than sứa theo ý anh 09/11)

// thêm 1 cá mập nhỏ xa xa





// ================= DƯỚI ĐẤT =================

const sang = (c, k = 1.4) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k });

// cây nơ-ron: thân sợi trục, cành phân nhánh, đầu cành là khớp sáng

const matNoron = new THREE.MeshPhysicalMaterial({ color: 0xffe3ec, roughness: .35, clearcoat: 1, emissive: 0xff7fae, emissiveIntensity: .25 });

const matDau = sang(0xfff0b8, .9), hinhDau = new THREE.SphereGeometry(1, 10, 8);

function caiNoron(x, z, cao0) {

  const g = new THREE.Group(), q = [[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), cao0, .28, 0]];

  while (q.length) {

    const [goc, huong, dai, r, cap] = q.shift();

    const cuoi = goc.clone().addScaledVector(huong, dai);

    const t = new THREE.Mesh(new THREE.CylinderGeometry(r * .65, r, dai, 7), matNoron);

    t.position.copy(goc).lerp(cuoi, .5); t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), huong); g.add(t);

    if (cap >= 4) { const d = new THREE.Mesh(hinhDau, matDau); d.position.copy(cuoi); d.scale.setScalar(.12 + rnd() * .1); g.add(d); continue; }

    const so = cap === 0 ? 4 : 2 + (rnd() < .5 ? 1 : 0);

    for (let i = 0; i < so; i++) {

      const h = huong.clone().add(new THREE.Vector3((rnd() - .5) * 1.6, rnd() * .5, (rnd() - .5) * 1.6)).normalize();

      q.push([cuoi, h, dai * (.55 + rnd() * .2), r * .62, cap + 1]);

    }

  }

  // thân tế bào phình ở gốc

  const than = new THREE.Mesh(new THREE.SphereGeometry(.7, 20, 14), matNoron); than.scale.set(1, .6, 1); g.add(than);

  return dat(g, x, z, -.1);

}

// (cây nơ-ron giữa cảnh: bỏ cho gọn)



// nấm phát sáng theo cụm

function cumNam(x, z) {

  const g = new THREE.Group(), mau = [0x7ff3ff, 0xff7ad9, 0xc2ff7a][(rnd() * 3) | 0];

  for (let i = 0; i < 5 + rnd() * 4; i++) {

    const h = .4 + rnd() * 1.4, r = .25 + rnd() * .5, ox = (rnd() - .5) * 2.4, oz = (rnd() - .5) * 2.4;

    const than = new THREE.Mesh(new THREE.CylinderGeometry(r * .18, r * .28, h, 8), vat(0xfff4ee, .6)); than.position.set(ox, h / 2, oz); g.add(than);

    const mu = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 10, 0, 6.29, 0, 1.4), sang(mau, .6)); mu.position.set(ox, h, oz); g.add(mu);

  }

  return dat(g, x, z, -.1);

}

if (false) for (const [x, z] of [[-5, -7], [9, -22], [-13, -20], [4, -33], [16, -46], [-20, -52], [-2, -62], [24, -30], [-28, -24]]) cumNam(x, z);



// xương rồng đeo kính râm

function xuongRong() {

  const g = new THREE.Group(), xanh = vat(0x3fae6a, .55);

  const than = new THREE.Mesh(new THREE.CapsuleGeometry(.55, 2.8, 8, 16), xanh); than.position.y = 1.9; g.add(than);

  for (const [s, y, l] of [[1, 2, 1.1], [-1, 2.6, .9]]) {

    const ngang = new THREE.Mesh(new THREE.CapsuleGeometry(.3, .6, 6, 10), xanh); ngang.rotation.z = Math.PI / 2; ngang.position.set(s * .85, y, 0); g.add(ngang);

    const dung = new THREE.Mesh(new THREE.CapsuleGeometry(.3, l, 6, 10), xanh); dung.position.set(s * 1.25, y + l / 2 + .1, 0); g.add(dung);

  }

  const den = vat(0x050505, .05, { clearcoat: 1 });

  for (const s of [1, -1]) { const k = new THREE.Mesh(new THREE.BoxGeometry(.42, .26, .08), den); k.position.set(s * .24, 2.9, .55); g.add(k); }

  const cau = new THREE.Mesh(new THREE.BoxGeometry(.9, .05, .05), den); cau.position.set(0, 2.98, .56); g.add(cau);

  const hoa = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 8), sang(0xff4d8a, 1)); hoa.position.set(0, 3.8, 0); g.add(hoa);

  return g;

}

// (xương rồng khối cũ: thay bằng mô hình thật)



// bong bóng ký ức: bóng ánh cầu vồng, bên trong là 1 vật nhỏ phát sáng

const matBong = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, transparent: true, opacity: .22, iridescence: 1, iridescenceIOR: 1.6, clearcoat: 1, depthWrite: false });

if (false) for (const [x, z, y, r] of [[-3, -10, 2.5, 1.1], [4.5, -9, 4.2, .8], [-10, -26, 3.5, 1.6], [14, -28, 5, 1.3], [0, -40, 6, 2]]) {

  const b = new THREE.Group(); b.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), matBong));

  const trong = rnd() < .5 ? new THREE.Mesh(new THREE.TorusKnotGeometry(r * .25, r * .08, 60, 8), sang(0xffc36b, 1.2)) : new THREE.Mesh(new THREE.OctahedronGeometry(r * .32), sang(0x9fd8ff, 1.2));

  b.add(trong); dat(b, x, z, y);

}



// ================= TRÊN TRỜI =================

// mặt trăng là quả cầu disco

if (false) { const geo = new THREE.IcosahedronGeometry(9, 4).toNonIndexed(), p = geo.attributes.position, cl = new Float32Array(p.count * 3);

  for (let i = 0; i < p.count; i += 3) { const v = .55 + rnd() * .45, c = rnd() < .08 ? new THREE.Color(1, .6, .8) : new THREE.Color(v, v, v * 1.05); for (let k = 0; k < 3; k++) cl.set([c.r, c.g, c.b], (i + k) * 3); }

  geo.setAttribute('color', new THREE.BufferAttribute(cl, 3));

  const trang = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, metalness: .3, roughness: .2, emissive: 0x6a3a60, emissiveIntensity: .6 }));

  trang.position.set(-30, 40, -130); scene.add(trang);

  const day = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 80, 4), sang(0xffffff, .4)); day.position.set(-40, 97, -150); scene.add(day); }



// đàn băng cassette bay như đàn chim

function cassette() {

  const g = new THREE.Group();

  g.add(new THREE.Mesh(new THREE.BoxGeometry(2, 1.25, .25), vat(0x1a1a22, .4)));

  const nhan = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .55), new THREE.MeshStandardMaterial({ color: [0xff5a6a, 0xfff1d6, 0x7fd0ff][(rnd() * 3) | 0] })); nhan.position.set(0, .22, .13); g.add(nhan);

  for (const s of [1, -1]) { const cuon = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .28, 14), vat(0xf2f2f2, .3)); cuon.rotation.x = Math.PI / 2; cuon.position.set(s * .45, -.2, .02); g.add(cuon); }

  return g;

}

for (let i = 0; i < 0; i++) { const c = cassette(), t = i / 6; c.position.set(14 + t * 26 + (rnd() - .5) * 5, 17 + Math.sin(t * 5) * 3 + rnd() * 2, -50 - t * 20 + (rnd() - .5) * 6); c.rotation.set(rnd() - .5, -.8 + (rnd() - .5) * .6, (rnd() - .5) * .8); c.scale.setScalar(.8 + rnd() * .6); scene.add(c); }



// TV CRT lơ lửng (nối với phòng scene 1)

function tvManHinh(chu) {

  const c = document.createElement('canvas'); c.width = 256; c.height = 192; const x = c.getContext('2d');

  x.fillStyle = '#0a1426'; x.fillRect(0, 0, 256, 192); x.fillStyle = '#e2efff'; x.font = '40px VT323'; x.fillText(chu, 18, 110);

  for (let y = 0; y < 192; y += 4) { x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, y, 256, 2); }

  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;

}

function tv(chu) {

  const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 2.4), vat(0xe8dcc6, .55)));

  const man = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.75), new THREE.MeshBasicMaterial({ map: tvManHinh(chu) })); man.position.z = 1.21; g.add(man);

  const ang = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.6, 4), vat(0x999999, .3)); ang.position.set(.5, 1.8, 0); ang.rotation.z = -.5; g.add(ang);

  return g;

}

if (false) for (const [x, y, z, chu, ry] of [[-14, 9, -28, '> overthink', .5], [-24, 14, -46, 'NO SIGNAL', .3], [22, 11, -40, 'BLUEZII', -.5], [-6, 18, -60, 'zzz?', .1]]) {

  const t = tv(chu); t.position.set(x, y, z); t.rotation.set(.15, ry, (rnd() - .5) * .5); scene.add(t);

}



// ly martini khổng lồ, trong ly là hành tinh có vành

if (false) { const g = new THREE.Group(), kinh = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, transparent: true, opacity: .28, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });

  const mieng = new THREE.Mesh(new THREE.ConeGeometry(4, 3.6, 40, 1, true), kinh); mieng.rotation.x = Math.PI; mieng.position.y = 1.8; g.add(mieng);

  const chan = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 4, 10), kinh); chan.position.y = -2; g.add(chan);

  const de = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, .12, 30), kinh); de.position.y = -4; g.add(de);

  const hanh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 20), sang(0xffa64d, .9)); hanh.position.y = 2.1; g.add(hanh);

  const vanh = new THREE.Mesh(new THREE.TorusGeometry(2.1, .1, 8, 60), sang(0xffe2b0, 1.2)); vanh.position.y = 2.1; vanh.rotation.x = 1.25; g.add(vanh);

  g.position.set(26, 24, -70); g.rotation.z = -.35; scene.add(g); }



// vịt cao su khổng lồ trôi trên trời

if (false) { const g = new THREE.Group(), vang = vat(0xffd21f, .35, { clearcoat: 1 });

  const than = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 20), vang); than.scale.set(1.35, .85, 1); g.add(than);

  const dau = new THREE.Mesh(new THREE.SphereGeometry(1.8, 28, 18), vang); dau.position.set(-2.6, 2.6, 0); g.add(dau);

  const mo = new THREE.Mesh(new THREE.SphereGeometry(.9, 20, 12), vat(0xff7a1a, .35)); mo.scale.set(1.2, .45, .9); mo.position.set(-4.3, 2.3, 0); g.add(mo);

  for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), vat(0x050505, .1)); m.position.set(-3.6, 3.1, s * .9); g.add(m); }

  const duoi = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2, 16), vang); duoi.rotation.z = -1.1; duoi.position.set(4, 1.3, 0); g.add(duoi);

  g.position.set(-28, 24, -80); g.rotation.set(.1, -.6, .15); scene.add(g); }



// cá voi bay rất xa

if (false) { const w = caMap(); w.position.set(55, 40, -170); w.scale.setScalar(4.5); w.rotation.set(0, -.9, .05); scene.add(w); }



// máy xăm bay như chuồn chuồn

function mayXam() {

  const g = new THREE.Group(), kl = vat(0xb8c0cc, .2, { metalness: .8 });

  const than = new THREE.Mesh(new THREE.CylinderGeometry(.18, .14, 2, 12), kl); than.rotation.z = Math.PI / 2; g.add(than);

  const kim = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .8, 4), kl); kim.rotation.z = Math.PI / 2; kim.position.x = -1.4; g.add(kim);

  const cuon = new THREE.Mesh(new THREE.TorusGeometry(.22, .08, 8, 16), vat(0xc0392b, .4)); cuon.position.set(.3, .3, 0); g.add(cuon);

  const canh = new THREE.MeshPhysicalMaterial({ color: 0xbfe8ff, transparent: true, opacity: .4, roughness: .1, iridescence: 1, side: THREE.DoubleSide, depthWrite: false });

  for (const [x, s] of [[.2, 1], [.2, -1], [-.3, 1], [-.3, -1]]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(.45, 1.8), canh); c.rotation.x = Math.PI / 2 + s * .25; c.rotation.z = s * .15; c.position.set(x, .12, s * .95); g.add(c); }

  return g;

}

if (false) for (const [x, y, z, ry] of [[14, 7, -24, .8], [-16, 6, -26, -.3], [2, 12, -36, 1.4]]) { const m = mayXam(); m.position.set(x, cao(x, z) + y, z); m.rotation.set(.1, ry, .2); scene.add(m); }



// lợn có cánh bướm

if (false) { const g = new THREE.Group(), hong = vat(0xffa3bf, .5);

  const than = new THREE.Mesh(new THREE.SphereGeometry(1.4, 28, 18), hong); than.scale.set(1.3, 1, 1); g.add(than);

  const mom = new THREE.Mesh(new THREE.CylinderGeometry(.45, .5, .4, 20), vat(0xff8aa8, .5)); mom.rotation.z = Math.PI / 2; mom.position.set(-1.9, .1, 0); g.add(mom);

  for (const s of [1, -1]) {

    const tai = new THREE.Mesh(new THREE.ConeGeometry(.35, .6, 10), hong); tai.position.set(-1, 1.1, s * .55); tai.rotation.x = s * -.4; g.add(tai);

    const m = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 6), vat(0x050505, .1)); m.position.set(-1.55, .5, s * .45); g.add(m);

    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(.6, 2.4, 2.6, 2.2, 1.6, .4); sh.bezierCurveTo(2.4, -.4, 1.4, -1.8, 0, 0);

    const canh = new THREE.Mesh(new THREE.ShapeGeometry(sh, 24), new THREE.MeshStandardMaterial({ color: 0x55c8ff, emissive: 0x2a7cff, emissiveIntensity: .6, side: THREE.DoubleSide, transparent: true, opacity: .9 }));

    canh.position.set(.2, .9, s * .3); canh.rotation.set(Math.PI / 2 + s * -.6, 0, .4); canh.scale.z = s; g.add(canh);

  }

  g.position.set(-10, cao(-10, -14) + 6.5, -14); g.rotation.set(0, -.5, .1); scene.add(g); }



// ================= THÊM (anh 09/11): xe mui trần bay + ông già Noel lái, giun khổng lồ, loa, tiền, Luffy =================

function nguoi(ao, quan, da = 0xf1c7a8) {   // người nhỏ ghép khối, đứng gốc ở chân

  const g = new THREE.Group();

  const than = new THREE.Mesh(new THREE.CapsuleGeometry(.32, .6, 6, 12), vat(ao, .6)); than.position.y = 1.25; g.add(than);

  const dau = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 14), vat(da, .6)); dau.position.y = 2.05; g.add(dau);

  for (const s of [1, -1]) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .55, 4, 8), vat(quan, .6)); c.position.set(0, .45, s * .16); g.add(c); }

  return g;

}

// xe mui trần đỏ bay, ông già Noel cầm lái

if (false) { const g = new THREE.Group(), do_ = vat(0xd1101c, .2, { clearcoat: 1, clearcoatRoughness: .05 });

  const sh = new THREE.Shape(); sh.moveTo(-2.4, .25); sh.lineTo(2.3, .25); sh.quadraticCurveTo(2.6, .3, 2.55, .75); sh.lineTo(1.1, .9); sh.lineTo(.3, .95);

  sh.lineTo(-.6, .95); sh.quadraticCurveTo(-1.4, 1.15, -2.3, 1.05); sh.quadraticCurveTo(-2.6, .9, -2.4, .25);

  const vo = new THREE.ExtrudeGeometry(sh, { depth: 1.9, bevelEnabled: true, bevelSize: .12, bevelThickness: .15, bevelSegments: 4 }); vo.translate(0, 0, -.95);

  g.add(new THREE.Mesh(vo, do_));

  const kinh = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .5), new THREE.MeshPhysicalMaterial({ color: 0x223344, transparent: true, opacity: .5, roughness: 0 })); kinh.position.set(.95, 1.15, 0); kinh.rotation.set(0, Math.PI / 2, -.6); g.add(kinh);

  for (const [x, z] of [[1.6, 1], [1.6, -1], [-1.5, 1], [-1.5, -1]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .3, 20), vat(0x111111, .7)); b.rotation.x = Math.PI / 2; b.position.set(x, .3, z); g.add(b);

    const vanh = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .32, 12), vat(0xd8d8d8, .2, { metalness: .9 })); vanh.rotation.x = Math.PI / 2; vanh.position.set(x, .3, z); g.add(vanh); }

  for (const z of [.6, -.6]) { const den = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), sang(0xff3030, 3)); den.position.set(-2.5, .7, z); g.add(den); }

  // ông già Noel ngồi lái

  const noel = new THREE.Group();

  const than = new THREE.Mesh(new THREE.SphereGeometry(.6, 20, 14), vat(0xc8102e, .6)); than.scale.y = 1.1; noel.add(than);

  const dau = new THREE.Mesh(new THREE.SphereGeometry(.32, 18, 12), vat(0xf1c7a8, .6)); dau.position.y = .85; noel.add(dau);

  const rau = new THREE.Mesh(new THREE.ConeGeometry(.34, .7, 16), vat(0xffffff, .9)); rau.rotation.z = Math.PI; rau.position.set(.18, .55, 0); noel.add(rau);

  const mu = new THREE.Mesh(new THREE.ConeGeometry(.32, .8, 16), vat(0xc8102e, .6)); mu.position.set(-.15, 1.35, 0); mu.rotation.z = .6; noel.add(mu);

  const vien = new THREE.Mesh(new THREE.TorusGeometry(.31, .08, 8, 20), vat(0xffffff, .9)); vien.rotation.x = Math.PI / 2; vien.position.y = 1.05; noel.add(vien);

  const bong = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), vat(0xffffff, .9)); bong.position.set(-.5, 1.6, 0); noel.add(bong);

  noel.position.set(-.3, 1.3, .4); g.add(noel);

  // vệt sáng sau xe

  const vet = new THREE.Mesh(new THREE.PlaneGeometry(6, .5), new THREE.MeshBasicMaterial({ color: 0xff8fb0, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); vet.position.set(-5.3, .5, 0); vet.rotation.x = Math.PI / 2; g.add(vet);

  g.position.set(-11, cao(-11, -22) + 10.5, -22); g.rotation.set(.08, .9, -.12); g.scale.setScalar(1.1); scene.add(g); }



// giun khổng lồ chui lên từ rãnh não rồi cắm xuống lại

if (false) { const pts = [], x0 = -16, z0 = -30; for (let i = 0; i <= 30; i++) { const t = i / 30; const x = x0 + t * 14, z = z0 - Math.sin(t * 3) * 3; pts.push(new THREE.Vector3(x, cao(x, z) - 1 + Math.sin(t * Math.PI) * 8, z)); }

  const duong = new THREE.CatmullRomCurve3(pts);

  scene.add(new THREE.Mesh(new THREE.TubeGeometry(duong, 200, 1.1, 20), vat(0xd98a8a, .35, { clearcoat: .8, sheen: 1, sheenColor: new THREE.Color(0xffd0d0) })));

  for (let i = 1; i < 60; i++) { const t = i / 60, p = duong.getPointAt(t), tg = duong.getTangentAt(t); const v = new THREE.Mesh(new THREE.TorusGeometry(1.12, .09, 6, 24), vat(0xb86a72, .5)); v.position.copy(p); v.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tg); scene.add(v); }

  const daiDau = new THREE.Mesh(new THREE.TorusGeometry(1.2, .3, 10, 24), vat(0xe9a0a6, .4)); const p = duong.getPointAt(.35); daiDau.position.copy(p); daiDau.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), duong.getTangentAt(.35)); scene.add(daiDau); }



// loa: 2 loa tháp đứng trên não + loa bay

function loa(cao0 = 3.2) {

  const g = new THREE.Group(); const hop = new THREE.Mesh(new THREE.BoxGeometry(1.6, cao0, 1.4), vat(0x1b1712, .5)); hop.position.y = cao0 / 2; g.add(hop);

  for (const [y, r] of [[cao0 * .3, .6], [cao0 * .68, .42], [cao0 * .9, .18]]) {

    const vanh = new THREE.Mesh(new THREE.TorusGeometry(r, .06, 8, 28), vat(0xc0c0c0, .2, { metalness: .9 })); vanh.position.set(0, y, .71); g.add(vanh);

    const non = new THREE.Mesh(new THREE.ConeGeometry(r * .95, .3, 28, 1, true), vat(0x2a2a2a, .8, { side: THREE.DoubleSide })); non.rotation.x = -Math.PI / 2; non.position.set(0, y, .62); g.add(non);

    const tam = new THREE.Mesh(new THREE.SphereGeometry(r * .25, 12, 8), sang(0xff4d8a, .8)); tam.position.set(0, y, .55); g.add(tam);

  }

  return g;

}

for (const [x, y, z] of [[-18, 13, -40], [26, 16, -55], [6, 20, -70]]) { const l = loa(2.4); l.position.set(x, y, z); l.rotation.set(rnd() - .5, rnd() * 2, rnd() - .5); scene.add(l); }



// tiền bay lả tả (giấy bạc chung chung, không phải mẫu tiền thật)

const texTien = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 112; const x = c.getContext('2d');

  x.fillStyle = '#7fc98a'; x.fillRect(0, 0, 256, 112); x.strokeStyle = '#2f6b3a'; x.lineWidth = 6; x.strokeRect(8, 8, 240, 96);

  x.fillStyle = '#2f6b3a'; x.font = 'bold 54px "IBM Plex Mono"'; x.fillText('$', 24, 76); x.font = '40px VT323'; x.fillText('ONE MORE IDEA', 70, 70);

  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();

{ const matTien = new THREE.MeshStandardMaterial({ map: texTien, side: THREE.DoubleSide, roughness: .8 }), hinh = new THREE.PlaneGeometry(1.1, .48);

  for (let i = 0; i < 0; i++) { const m = new THREE.Mesh(hinh, matTien); const a = rnd() * 6.28, r = rnd() * 6;

    m.position.set(17 + Math.cos(a) * r, 9 + rnd() * 7, -30 + Math.sin(a) * r * .6); m.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6); scene.add(m); } }



// Luffy (gợi nhớ): mũ rơm, áo đỏ, quần xanh, tay cao su vươn dài lên chộp tiền

if (false) { const g = nguoi(0xd62828, 0x3a6fd8);

  const mu = new THREE.Group(); const vanhMu = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, .05, 28), vat(0xf2d16b, .8)); mu.add(vanhMu);

  const dinh = new THREE.Mesh(new THREE.SphereGeometry(.33, 20, 10, 0, 6.29, 0, 1.6), vat(0xf2d16b, .8)); mu.add(dinh);

  const bang = new THREE.Mesh(new THREE.CylinderGeometry(.335, .335, .1, 24, 1, true), vat(0xc81d25, .6)); bang.position.y = .05; mu.add(bang);

  mu.position.y = 2.28; g.add(mu);

  const goc = new THREE.Vector3(0, 1.55, -.35), dich = new THREE.Vector3(3.5, 9.5, -7);

  const tay = new THREE.CatmullRomCurve3([goc, new THREE.Vector3(.4, 3.5, -1.5), new THREE.Vector3(2.4, 6.5, -4.5), dich]);

  g.add(new THREE.Mesh(new THREE.TubeGeometry(tay, 60, .1, 8), vat(0xf1c7a8, .6)));

  const nam = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 8), vat(0xf1c7a8, .6)); nam.position.copy(dich); g.add(nam);

  const l = dat(g, 3.5, -17, -.05); l.rotation.y = -.15; l.scale.setScalar(1.3); }



// ---------- máy quay: mắt người đang đi trong rãnh não ----------

// ================= THÊM 2 (anh 09/11): loa bay, Godzilla vs King Kong, Woody + Buzz, đồ lơ lửng, mây, mặt trời con mắt =================

// mặt trời là con mắt đang quan sát

let MAT_TROI;

{ const c = document.createElement('canvas'); c.width = 1024; c.height = 520; const x = c.getContext('2d');

  // con mắt mở ngang hình hạt hạnh nhân

  const mi = () => { x.beginPath(); x.moveTo(40, 260); x.bezierCurveTo(260, 20, 764, 20, 984, 260); x.bezierCurveTo(764, 470, 260, 470, 40, 260); x.closePath(); };

  x.save(); mi(); x.clip();

  const lt = x.createRadialGradient(512, 260, 60, 512, 260, 500); lt.addColorStop(0, '#fff7f2'); lt.addColorStop(.7, '#f6d6dc'); lt.addColorStop(1, '#c98aa0'); x.fillStyle = lt; x.fillRect(0, 0, 1024, 520);

  for (let i = 0; i < 26; i++) { x.strokeStyle = 'rgba(205,50,80,.4)'; x.lineWidth = 1.6; x.beginPath(); const sx = i % 2 ? 60 + Math.random() * 120 : 840 + Math.random() * 120, sy = 180 + Math.random() * 160; x.moveTo(sx, sy); x.quadraticCurveTo((sx + 512) / 2, sy + (Math.random() - .5) * 120, 512 + (sx < 512 ? -170 : 170), 260 + (Math.random() - .5) * 120); x.stroke(); }

  const g1 = x.createRadialGradient(512, 255, 30, 512, 255, 175); g1.addColorStop(0, '#2b0a3d'); g1.addColorStop(.35, '#d6336c'); g1.addColorStop(.8, '#ff9a5a'); g1.addColorStop(1, '#4a0d28');

  x.fillStyle = g1; x.beginPath(); x.arc(512, 255, 175, 0, 6.29); x.fill();

  for (let i = 0; i < 110; i++) { const a = i / 110 * 6.28; x.strokeStyle = 'rgba(255,220,180,.32)'; x.beginPath(); x.moveTo(512 + Math.cos(a) * 75, 255 + Math.sin(a) * 75); x.lineTo(512 + Math.cos(a) * 168, 255 + Math.sin(a) * 168); x.stroke(); }

  x.fillStyle = '#050208'; x.beginPath(); x.arc(512, 255, 72, 0, 6.29); x.fill();

  x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.arc(470, 205, 24, 0, 6.29); x.fill();

  const bong = x.createLinearGradient(0, 40, 0, 200); bong.addColorStop(0, 'rgba(60,10,40,.75)'); bong.addColorStop(1, 'rgba(60,10,40,0)'); x.fillStyle = bong; x.fillRect(0, 0, 1024, 220);

  x.restore();

  // viền mí + lông mi trên

  x.lineWidth = 14; x.strokeStyle = '#2a0a1e'; mi(); x.stroke();

  x.lineCap = 'round'; x.lineWidth = 7;

  for (let i = 0; i <= 22; i++) { const t = .06 + i / 22 * .88, u = 1 - t;

    const px = u * u * u * 40 + 3 * u * u * t * 260 + 3 * u * t * t * 764 + t * t * t * 984, py = u * u * u * 260 + 3 * u * u * t * 20 + 3 * u * t * t * 20 + t * t * t * 260;

    const ang = -Math.PI / 2 + (t - .5) * 1.8; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(ang) * 30, py + Math.sin(ang) * 30, px + Math.cos(ang + .3 * (t - .5)) * 58, py + Math.sin(ang) * 52); x.stroke(); }

  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, fog: false, transparent: true }));

  mat.scale.set(56, 28.4, 1); mat.position.set(8, 56, -125); scene.add(mat); MAT_TROI = mat;

  // quầng sáng quanh mắt

  const qc = document.createElement('canvas'); qc.width = qc.height = 256; const q = qc.getContext('2d');

  const gq = q.createRadialGradient(128, 128, 40, 128, 128, 128); gq.addColorStop(0, 'rgba(255,190,150,.9)'); gq.addColorStop(.45, 'rgba(255,120,170,.35)'); gq.addColorStop(1, 'rgba(255,120,170,0)');

  q.fillStyle = gq; q.fillRect(0, 0, 256, 256);

  const qs = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(qc), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));

  qs.scale.setScalar(75); qs.material.opacity = .3; qs.visible = false; qs.position.copy(mat.position); scene.add(qs);

  }



// mây hồng phồng

const matMay = new THREE.MeshStandardMaterial({ color: 0xffe4ee, roughness: 1, emissive: 0xff9ac0, emissiveIntensity: .35 });

function may() { const g = new THREE.Group(); const n = 6 + (rnd() * 6) | 0;

  for (let i = 0; i < n; i++) { const r = 1.5 + rnd() * 2.5; const b = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), matMay); b.position.set((i - n / 2) * 2.2 + (rnd() - .5), rnd() * 1.6, (rnd() - .5) * 2.5); b.scale.y = .75; g.add(b); }

  return g; }

for (let i = 0; i < 0; i++) { const m = may(), z = -40 - rnd() * 110; m.position.set((rnd() - .5) * (60 + -z), 22 + rnd() * 30, z); m.scale.setScalar(1 + rnd() * 1.6); scene.add(m); }



// loa kèn đỏ (như đôi loa kèn ở phòng scene 1) bay trên trời

function loaKen() {

  const g = new THREE.Group();

  const pr = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pr.push(new THREE.Vector2(.18 + Math.pow(t, 3) * 1.9, t * 2.6)); }

  const ken = new THREE.Mesh(new THREE.LatheGeometry(pr, 40), new THREE.MeshPhysicalMaterial({ color: 0xc4161c, roughness: .25, clearcoat: 1, side: THREE.DoubleSide }));

  ken.rotation.z = -Math.PI / 2; ken.position.x = .6; g.add(ken);

  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.4), vat(0x3a2414, .5)));

  const trong = new THREE.Mesh(new THREE.CircleGeometry(1.9, 40), sang(0xffb0c8, .6)); trong.rotation.y = -Math.PI / 2; trong.position.x = 3.15; g.add(trong);

  return g;

}

for (const [x, y, z, ry, k] of []) {

  const l = loaKen(); l.position.set(x, y, z); l.rotation.set((rnd() - .5) * .6, ry, (rnd() - .5) * .5); l.scale.setScalar(k); scene.add(l); }

// radio cassette bay

function boombox() {

  const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(4, 2, 1), vat(0xd9d9de, .3, { metalness: .4 })));

  for (const s of [1, -1]) { const v = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, .1, 30), vat(0x111111, .6)); v.rotation.x = Math.PI / 2; v.position.set(s * 1.3, -.1, .5); g.add(v);

    const tam = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), sang(0x7ff3ff, 1)); tam.position.set(s * 1.3, -.1, .58); g.add(tam); }

  const bang = new THREE.Mesh(new THREE.BoxGeometry(1, .6, .05), sang(0xffd36b, .8)); bang.position.set(0, .1, .52); g.add(bang);

  const quai = new THREE.Mesh(new THREE.TorusGeometry(1.4, .08, 8, 30, Math.PI), vat(0x777777, .3, { metalness: .8 })); quai.position.y = 1; g.add(quai);

  return g;

}

for (const [x, y, z, ry] of []) { const b = boombox(); b.position.set(x, y, z); b.rotation.set(.1, ry, (rnd() - .5) * .6); scene.add(b); }



// Godzilla đánh King Kong ở chân trời

if (false) { const xa = -78, tamX = 6;

  const go = new THREE.Group(), da = vat(0x2b3a33, .7);

  const than = new THREE.Mesh(new THREE.CapsuleGeometry(5, 14, 8, 20), da); than.position.y = 16; than.rotation.z = .25; go.add(than);

  const dau = new THREE.Mesh(new THREE.SphereGeometry(3, 20, 14), da); dau.scale.set(1.5, .9, 1); dau.position.set(-4, 27, 0); go.add(dau);

  const ham = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 3), da); ham.position.set(-6.5, 25.2, 0); ham.rotation.z = -.35; go.add(ham);

  for (const s of [1, -1]) { const chan = new THREE.Mesh(new THREE.CapsuleGeometry(2.4, 7, 6, 12), da); chan.position.set(1, 5, s * 3); go.add(chan);

    const tay = new THREE.Mesh(new THREE.CapsuleGeometry(1, 5, 6, 10), da); tay.position.set(-4, 19, s * 4); tay.rotation.z = 1.1; go.add(tay); }

  const duoi = new THREE.CatmullRomCurve3([[3, 9, 0], [10, 4, 2], [18, 2, -2], [26, 4, -6]].map(v => new THREE.Vector3(...v)));

  go.add(new THREE.Mesh(new THREE.TubeGeometry(duoi, 40, 2.6, 12), da));

  for (let i = 0; i < 9; i++) { const v = new THREE.Mesh(new THREE.ConeGeometry(1.1 + (i % 3 === 1 ? .5 : 0), 3.5, 5), sang(0x5ad2ff, 1.5)); v.position.set(3.5 - i * .3 + Math.max(0, i - 5) * 2, 23 - i * 1.8, 0); v.rotation.z = .25 - i * .05; go.add(v); }

  const tia = new THREE.Mesh(new THREE.CylinderGeometry(1.2, .6, 32, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));

  tia.rotation.z = Math.PI / 2 - .08; tia.position.set(-22, 25, 0); go.add(tia);

  const loi = new THREE.Mesh(new THREE.CylinderGeometry(.5, .3, 32, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); loi.rotation.z = Math.PI / 2 - .08; loi.position.set(-22, 25, 0); go.add(loi);

  go.position.set(tamX + 26, cao(tamX + 26, xa) - 2, xa); go.rotation.y = .15; scene.add(go);

  const kong = new THREE.Group(), long_ = vat(0x2a1a12, .9), mk = vat(0x6b4a3a, .8);

  const nguc = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), long_); nguc.scale.set(1, 1.15, .9); nguc.position.y = 20; kong.add(nguc);

  const dauK = new THREE.Mesh(new THREE.SphereGeometry(3.3, 20, 14), long_); dauK.position.set(1.5, 29, 0); kong.add(dauK);

  const matK = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), mk); matK.scale.set(.7, .8, 1); matK.position.set(3.2, 28.5, 0); kong.add(matK);

  for (const s of [1, -1]) {

    const tay = new THREE.Mesh(new THREE.CapsuleGeometry(1.9, 13, 6, 12), long_); tay.position.set(5, 20 + s * 2, s * 7); tay.rotation.set(s * .3, 0, s > 0 ? -2.1 : -.5); kong.add(tay);

    const nam = new THREE.Mesh(new THREE.SphereGeometry(2.6, 14, 10), long_); nam.position.set(s > 0 ? 12 : 8, s > 0 ? 25 : 12, s * 8); kong.add(nam);

    const chan = new THREE.Mesh(new THREE.CapsuleGeometry(2.4, 6, 6, 12), long_); chan.position.set(0, 6, s * 3.5); kong.add(chan); }

  kong.position.set(tamX - 22, cao(tamX - 22, xa - 4) - 2, xa - 4); kong.rotation.y = Math.PI; scene.add(kong);

  const sangVa = new THREE.PointLight(0x7fd8ff, 400, 80, 1.5); sangVa.position.set(tamX - 8, 26, xa + 6); scene.add(sangVa); }



// Woody và Buzz đang bay

if (false) { const w = new THREE.Group();

  const than = new THREE.Mesh(new THREE.CapsuleGeometry(.4, .9, 6, 12), vat(0xf2c230, .6)); than.position.y = 1.6; w.add(than);

  const ao = new THREE.Mesh(new THREE.CapsuleGeometry(.43, .6, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8 })); ao.position.y = 1.75; w.add(ao);

  for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), vat(0x111111, .8)); d.position.set(Math.cos(i * 2) * .3, 1.5 + (i % 3) * .25, .38); d.scale.z = .3; w.add(d); }

  const dau = new THREE.Mesh(new THREE.SphereGeometry(.33, 18, 12), vat(0xf1c7a8, .6)); dau.position.y = 2.55; dau.scale.y = 1.15; w.add(dau);

  const vanh = new THREE.Mesh(new THREE.CylinderGeometry(.75, .75, .06, 24), vat(0x8a5a2b, .7)); vanh.position.y = 2.85; w.add(vanh);

  const chop = new THREE.Mesh(new THREE.CylinderGeometry(.32, .38, .45, 18), vat(0x8a5a2b, .7)); chop.position.y = 3.08; w.add(chop);

  for (const s of [1, -1]) { const ch = new THREE.Mesh(new THREE.CapsuleGeometry(.16, 1.1, 4, 8), vat(0x2f5fa8, .7)); ch.position.set(0, .55, s * .2); w.add(ch);

    const tay = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .9, 4, 8), vat(0xf2c230, .6)); tay.position.set(0, 2.3, s * .55); tay.rotation.x = s * -2.6; w.add(tay); }

  w.position.set(-3, cao(-3, -12) + 9, -12); w.rotation.set(0, .4, -1.15); w.scale.setScalar(1.15); scene.add(w);

  const b = new THREE.Group(), trang = vat(0xf4f4f6, .35, { clearcoat: .8 }), xanh = vat(0x7ac943, .4), tim = vat(0x6b3fa0, .5);

  const tb = new THREE.Mesh(new THREE.CapsuleGeometry(.48, .9, 6, 14), trang); tb.position.y = 1.6; b.add(tb);

  const ngu = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .1), xanh); ngu.position.set(0, 1.75, .47); b.add(ngu);

  const nut = new THREE.Mesh(new THREE.BoxGeometry(.3, .25, .05), vat(0xd62828, .4)); nut.position.set(0, 1.6, .53); b.add(nut);

  const dauB = new THREE.Mesh(new THREE.SphereGeometry(.36, 18, 12), vat(0xf1c7a8, .6)); dauB.position.y = 2.6; b.add(dauB);

  const mu = new THREE.Mesh(new THREE.SphereGeometry(.38, 18, 12, 0, 6.29, 0, 1.4), tim); mu.position.y = 2.62; b.add(mu);

  const kinhB = new THREE.Mesh(new THREE.SphereGeometry(.55, 20, 14, 0, 6.29, 0, 2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .25, roughness: 0, clearcoat: 1 })); kinhB.position.y = 2.55; b.add(kinhB);

  for (const s of [1, -1]) { const ch = new THREE.Mesh(new THREE.CapsuleGeometry(.2, 1, 4, 8), trang); ch.position.set(0, .55, s * .22); b.add(ch);

    const canh = new THREE.Mesh(new THREE.BoxGeometry(.12, .35, 1.6), vat(0xffffff, .3)); canh.position.set(-.35, 1.9, s * 1.1); canh.rotation.x = s * .25; b.add(canh);

    const dc = new THREE.Mesh(new THREE.BoxGeometry(.13, .3, .35), vat(0xd62828, .4)); dc.position.set(-.35, 1.92, s * 1.85); b.add(dc); }

  const tayB = new THREE.Mesh(new THREE.CapsuleGeometry(.14, .9, 4, 8), trang); tayB.position.set(0, 3.2, .3); b.add(tayB);

  b.position.set(1, cao(1, -14) + 10.5, -14); b.rotation.set(0, .3, -1.2); b.scale.setScalar(1.15); scene.add(b); }



// đồ lơ lửng rải khắp trời

const lamVat = [

  () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CapsuleGeometry(.45, .9, 6, 14), vat(0xffffff, .3))); const b = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .9, 14), vat([0xff4d6d, 0x4dc3ff, 0xffd34d][(rnd() * 3) | 0], .3)); b.position.y = .45; g.add(b); return g; },

  // (bỏ đĩa than lơ lửng theo ý anh 09/11)

  () => new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), vat(0xfafafa, .3, { clearcoat: 1 })),

  () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(.7, 18, 12), sang(0xfff1b8, .8))); const d = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .5, 12), vat(0xb0b0b0, .3, { metalness: .8 })); d.position.y = -.8; g.add(d); return g; },

  () => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(2, .4); sh.lineTo(0, .8); sh.lineTo(.4, .4); sh.lineTo(0, 0); return new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: 0xfff7ea, side: THREE.DoubleSide })); },

  () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 16), vat([0x7f6bff, 0x4dd6a0, 0xff9a4d][(rnd() * 3) | 0], .5))); const v = new THREE.Mesh(new THREE.TorusGeometry(2.2, .12, 6, 40), sang(0xffe2b0, .8)); v.rotation.x = 1.3; g.add(v); return g; },

  () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TorusGeometry(.7, .35, 14, 28), vat(0xd9a35f, .6))); const k = new THREE.Mesh(new THREE.TorusGeometry(.7, .37, 14, 28, Math.PI), vat(0xff7ab8, .35, { clearcoat: 1 })); k.position.z = .05; g.add(k); return g; },

  () => new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, .1, 24), vat(0xf2c230, .2, { metalness: 1 })),

];

if (false) for (let i = 0; i < 3; i++) {

  const o = lamVat[(rnd() * lamVat.length) | 0](), z = -12 - rnd() * 100, x = (rnd() - .5) * (30 + -z * 1.1), y = 8 + rnd() * (10 + -z * .35);

  o.position.set(x, y, z); o.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6); o.scale.setScalar(.7 + rnd() * .8); scene.add(o);

}



// ================= TẾ BÀO MÁU chảy thành dòng qua lại =================

const hinhHC = (() => { const pr = [[0, .1], [.3, .15], [.55, .27], [.75, .3], [.9, .18], [.95, 0], [.9, -.18], [.75, -.3], [.55, -.27], [.3, -.15], [0, -.1]].map(([x, y]) => new THREE.Vector2(x, y));

  return new THREE.LatheGeometry(pr, 24); })();

const matHC = new THREE.MeshPhysicalMaterial({ color: 0xc4122f, roughness: .3, clearcoat: 1, clearcoatRoughness: .15, sheen: .6, sheenColor: new THREE.Color(0xff6a7a), emissive: 0x5a0010, emissiveIntensity: .35 });

const hinhBC = (() => { const g = new THREE.IcosahedronGeometry(.9, 3), p = g.attributes.position, v = new THREE.Vector3();

  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); v.multiplyScalar(1 + .12 * noise(v.x * 3, v.y * 3 + v.z * 2)); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; })();

const matBC = new THREE.MeshPhysicalMaterial({ color: 0xf6eef2, roughness: .45, clearcoat: .6, emissive: 0xffd6e6, emissiveIntensity: .15 });

const DONG = [];

function dongMau(diem, so, r, toc, coBC = 4) {

  const duong = new THREE.CatmullRomCurve3(diem.map(([x, y, z]) => new THREE.Vector3(x, y, z)));

  const hc = new THREE.InstancedMesh(hinhHC, matHC, so), bc = new THREE.InstancedMesh(hinhBC, matBC, coBC);

  const te = []; for (let i = 0; i < so + coBC; i++) te.push({ t: rnd(), a: rnd() * 6.28, d: Math.sqrt(rnd()) * r, q: new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6), xoay: (rnd() - .5) * 3, k: .55 + rnd() * .5, v: toc * (.8 + rnd() * .4) });

  scene.add(hc, bc); DONG.push({ duong, hc, bc, te, so });

}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _tg = new THREE.Vector3(), _n = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);

function capMau(dt) {

  for (const D of DONG) D.te.forEach((e, i) => {

    e.t = (e.t + e.v * dt + 1) % 1; e.q.x += e.xoay * dt; e.q.y += e.xoay * .7 * dt;

    D.duong.getPointAt(e.t, _p); D.duong.getTangentAt(e.t, _tg); _n.crossVectors(_tg, _up).normalize(); _b.crossVectors(_tg, _n);

    _p.addScaledVector(_n, Math.cos(e.a) * e.d).addScaledVector(_b, Math.abs(Math.sin(e.a)) * e.d * .25);

    _q.setFromEuler(e.q); _s.setScalar(e.k * .45 * (i < D.so ? 1 : .8)); _m.compose(_p, _q, _s);

    if (i < D.so) D.hc.setMatrixAt(i, _m); else D.bc.setMatrixAt(i - D.so, _m);

  });

  for (const D of DONG) { D.hc.instanceMatrix.needsUpdate = true; D.bc.instanceMatrix.needsUpdate = true; }

}



// đứng trên đỉnh nếp cao nhất gần gốc, nhìn ra cánh đồng nếp não

let best = [0, 4, -1e9]; for (let x = -3; x <= 3; x += .25) for (let z = 3; z <= 6; z += .25) { const h = cao(x, z); if (h > best[2]) best = [x, z, h]; }

const [cx0, cz0, ch0] = best;

if (GOC === 1) { cam.position.set(cx0, ch0 + 1.75, cz0); cam.lookAt(cx0 + 1, ch0 + 6, cz0 - 30); cam.rotation.z += .025; }

else { cam.position.set(cx0, ch0 + 1.7, cz0); cam.lookAt(cx0 - 4, ch0 + 9, cz0 - 22); }



// tế bào máu chảy dưới đất: từ xa men theo rãnh não chảy lại, lướt qua 2 bên chân người xem rồi ra sau

{ const duong = (xXa, xGan, lech) => { const d = []; for (let i = 0; i <= 24; i++) { const t = i / 24, z = -130 + t * (cz0 + 14 + 130);

    const x = xXa + (xGan - xXa) * Math.pow(t, 1.4) + Math.sin(t * 9 + lech) * 3 * (1 - t); d.push([x, cao(x, z) + 1.8, z]); } return d; };

  dongMau(duong(-34, cx0 - 6, 0), 248, 1.6, .045, 3);

  dongMau(duong(30, cx0 + 6.5, 2), 248, 1.6, .05, 3);

  dongMau(duong(-6, cx0 - 12, 4), 158, 1.3, .04, 2); }

capMau(0);





// lấp 2 bên khung (anh: "trống 2 bên quá"): cây nơ-ron, nấm, loa dưới đất + đồ lơ lửng sát mép

for (const [dx, dz, h] of [[-8, -4, 4.5], [10, -6, 5], [-19, -22, 5]]) caiNoron(cx0 + dx, cz0 + dz, h);

if (false) for (const [dx, dz] of [[-5, -2], [-10, -8], [7, -3], [12, -10], [-15, -16], [17, -20]]) cumNam(cx0 + dx, cz0 + dz);

// đôi loa theo mẫu anh gửi (thùng thép xước + kèn đỏ trên nóc), tách 2 bên

function loaMau(mauThung, kenVuong) {

  const g = new THREE.Group(), thep = vat(mauThung, .38, { metalness: .85, clearcoat: .5 }), do_ = new THREE.MeshPhysicalMaterial({ color: 0xc8141c, roughness: .22, clearcoat: 1, side: THREE.DoubleSide });

  const de = new THREE.Mesh(new THREE.BoxGeometry(2.6, .12, 2.2), vat(0x9a9aa0, .3, { metalness: .9 })); de.position.y = .06; g.add(de);

  for (const [x, z] of [[-1.1, -.9], [1.1, -.9], [-1.1, .9], [1.1, .9]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .5, 8), vat(0x9a9aa0, .3, { metalness: .9 })); c.position.set(x, .35, z); g.add(c); }

  const thung = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3, 1.9), thep); thung.position.y = 2.1; g.add(thung);

  const vanh = new THREE.Mesh(new THREE.TorusGeometry(.8, .07, 10, 40), vat(0x222222, .3, { metalness: .8 })); vanh.position.set(0, 2.35, .96); g.add(vanh);

  const non = new THREE.Mesh(new THREE.ConeGeometry(.78, .4, 40, 1, true), vat(0x111111, .85, { side: THREE.DoubleSide })); non.rotation.x = -Math.PI / 2; non.position.set(0, 2.35, .82); g.add(non);

  const tam = new THREE.Mesh(new THREE.SphereGeometry(.18, 16, 10), vat(0x222222, .2, { metalness: .9 })); tam.position.set(0, 2.35, .78); g.add(tam);

  const khe = new THREE.Mesh(new THREE.BoxGeometry(1.4, .16, .05), vat(0x050505, .9)); khe.position.set(0, 1.0, .96); g.add(khe);

  const cu = new THREE.Mesh(new THREE.CylinderGeometry(.18, .26, .5, 16), vat(0x2a2a2a, .3, { metalness: .8 })); cu.position.set(0, 3.85, -.2); g.add(cu);

  const ken = new THREE.Group(); ken.position.set(0, 4.25, -.2);

  if (kenVuong) {   // kèn nhiều ô vuông (multicell)

    // kèn vuông loe liền khối (miệng chữ nhật, thân thắt dần về họng), có vách chia 2 ô

    const pr = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pr.push(new THREE.Vector2(.12 + Math.pow(t, 2.2) * 1.05, t * 1.5)); }

    const k = new THREE.Mesh(new THREE.LatheGeometry(pr, 4, Math.PI / 4), do_); k.rotation.x = Math.PI / 2; k.scale.set(1.35, 1, .75); ken.add(k);

    const vach = new THREE.Mesh(new THREE.BoxGeometry(.04, .02, 1.3), do_); vach.scale.set(1, 1, 1); vach.rotation.z = Math.PI / 2; vach.position.set(0, 0, .85); vach.scale.y = 40; ken.add(vach);

    const vien = new THREE.Mesh(new THREE.TorusGeometry(1.2, .05, 6, 4, Math.PI * 2), vat(0x8a0a10, .3)); vien.rotation.z = Math.PI / 4; vien.scale.set(1.35 * .88, .75 * .88, 1); vien.position.z = 1.5; ken.add(vien);

  } else {             // kèn loe tròn

    const pr = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pr.push(new THREE.Vector2(.15 + Math.pow(t, 2.6) * 1.35, t * 1.9)); }

    const k = new THREE.Mesh(new THREE.LatheGeometry(pr, 48), do_); k.rotation.x = Math.PI / 2; k.position.z = -.1; ken.add(k);

  }

  g.add(ken);

  const den = new THREE.SpotLight(0xffe2c8, 60, 14, .45, .6); den.position.set(0, 9, 3); den.target = thung; g.add(den);

  return g;

}

{ const a = dat(loaMau(0x1c1c20, false), cx0 - 9, cz0 - 13, -.1); a.rotation.y = .45; a.scale.setScalar(1.25);

  const b = dat(loaMau(0xdcdcdf, false), cx0 + 11, cz0 - 15, -.1); b.rotation.y = -.5; b.scale.setScalar(1.25); }

if (false) for (let i = 0; i < 2; i++) { const o = lamVat[(rnd() * lamVat.length) | 0](), ben = i % 2 ? 1 : -1, z = cz0 - 8 - rnd() * 30;

  o.position.set(cx0 + ben * (9 + rnd() * 14), ch0 + 3 + rnd() * 9, z); o.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6); o.scale.setScalar(.8 + rnd() * .7); scene.add(o); }



const TEX_LUA = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');

  for (const [w, mau] of [[30, 'rgba(255,90,20,.55)'], [20, 'rgba(255,170,40,.75)'], [11, 'rgba(255,240,180,.95)']]) {

    x.fillStyle = mau; x.beginPath(); x.moveTo(32, 6); x.bezierCurveTo(32 + w * .3, 40, 32 + w, 70, 32 + w * .7, 100); x.quadraticCurveTo(32, 128, 32 - w * .7, 100); x.bezierCurveTo(32 - w, 70, 32 - w * .3, 40, 32, 6); x.fill(); }

  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();

// ngựa vằn phi từ sau lưng người xem lên phía trước, chân chạm đâu để lại dấu lửa đó (anh 09/11)

{ const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d');

  x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, 64, 512); x.fillStyle = '#121214';

  for (let y = 0; y < 512; y += 26) { x.beginPath(); for (let i = 0; i <= 64; i += 8) x.lineTo(i, y + Math.sin(i * .12 + y) * 4); for (let i = 64; i >= 0; i -= 8) x.lineTo(i, y + 11 + Math.sin(i * .1 + y * 1.3) * 4); x.fill(); }

  const van = new THREE.CanvasTexture(c); van.colorSpace = THREE.SRGBColorSpace; van.wrapS = van.wrapT = THREE.RepeatWrapping;

  const vVan = (rep) => { const t = van.clone(); t.needsUpdate = true; t.repeat.set(1, rep); return new THREE.MeshStandardMaterial({ map: t, roughness: .7 }); };

  const g = new THREE.Group(), den = vat(0x121214, .7);

  const than = new THREE.Mesh(new THREE.CapsuleGeometry(.75, 2.2, 8, 20), vVan(1.4)); than.rotation.z = Math.PI / 2; than.position.y = 2.2; g.add(than);

  const co = new THREE.Mesh(new THREE.CylinderGeometry(.32, .55, 1.6, 14), vVan(.8)); co.position.set(-1.6, 3, 0); co.rotation.z = .75; g.add(co);

  const dau = new THREE.Mesh(new THREE.CapsuleGeometry(.3, .9, 6, 14), vVan(.6)); dau.position.set(-2.35, 3.45, 0); dau.rotation.z = 1.9; g.add(dau);

  const mom = new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 8), den); mom.position.set(-2.85, 3.1, 0); g.add(mom);

  for (const s_ of [1, -1]) { const tai = new THREE.Mesh(new THREE.ConeGeometry(.1, .4, 8), vVan(.2)); tai.position.set(-2.05, 3.95, s_ * .15); tai.rotation.z = .3; g.add(tai); }

  const bom = new THREE.Mesh(new THREE.BoxGeometry(1.3, .3, .1), den); bom.position.set(-1.65, 3.55, 0); bom.rotation.z = .75; g.add(bom);

  // chân kiểu phi nước đại: 2 trước duỗi ra trước, 2 sau đạp ra sau

  for (const [px, pz, goc] of [[-1, .35, .7], [-1, -.35, .35], [1, .35, -.65], [1, -.35, -.35]]) {

    const ch = new THREE.Mesh(new THREE.CapsuleGeometry(.14, 1.7, 4, 10), vVan(.9)); ch.geometry.translate(0, -.95, 0); ch.position.set(px, 1.9, pz); ch.rotation.z = goc; g.add(ch);

    const mong = new THREE.Mesh(new THREE.CylinderGeometry(.16, .18, .18, 10), den); mong.position.set(0, -1.9, 0); ch.add(mong);

    const lua = new THREE.PointLight(0xff6a1a, 6, 3, 2); lua.position.set(0, -2, 0); ch.add(lua);

  }

  const duoi = new THREE.Mesh(new THREE.CylinderGeometry(.04, .08, 1.3, 6), den); duoi.position.set(1.85, 2.4, 0); duoi.rotation.z = -1.1; g.add(duoi);

  const zx = cx0 + 2.6, zz = cz0 - 13; g.position.set(zx, cao(zx, zz), zz); g.rotation.y = Math.PI / 2 - .55; g.scale.setScalar(1.05); scene.add(g); g.visible = false; window.__NV = { zx, zz };

  // vệt dấu chân lửa: từ sau lưng người xem chạy lên tới con ngựa

  const dauLua = (x, z, k) => {

    const y = cao(x, z) + .03, nhom = new THREE.Group(); nhom.position.set(x, y, z);

    const vet = new THREE.Mesh(new THREE.CircleGeometry(.28, 16), new THREE.MeshBasicMaterial({ color: 0xffb340, transparent: true, opacity: .85 * k })); vet.rotation.x = -Math.PI / 2; vet.scale.set(1, 1.4, 1); nhom.add(vet);

    const chay = new THREE.Mesh(new THREE.CircleGeometry(.45, 16), new THREE.MeshBasicMaterial({ color: 0x3a0a05, transparent: true, opacity: .6 })); chay.rotation.x = -Math.PI / 2; chay.position.y = -.01; chay.scale.set(1, 1.4, 1); nhom.add(chay);

    for (let i = 0; i < 2; i++) { const h = (.55 + rnd() * .5) * k; const ng = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX_LUA, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9 })); ng.scale.set(h * .55, h, 1); ng.position.set((rnd() - .5) * .2, h * .45, (rnd() - .5) * .25); nhom.add(ng); }

    scene.add(nhom);

  };

  const n = 0; for (let i = 0; i < n; i++) { const t = i / (n - 1), x = cx0 + .6 + (zx - cx0 - .6) * t + (i % 2 ? .35 : -.35), z = cz0 + 1.5 + (zz - cz0 - 1.5) * t;

    dauLua(x, z, .45 + .55 * t); }

  }



// ================= MÔ HÌNH THẬT (Sketchfab, CC-BY, nguồn ở mo-hinh/NGUON.txt) =================

const NAP = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder), MIXERS = [];
// tối ưu tải 10/11: điện thoại (< 700 px) dùng bản -dt (ảnh ≤ 512, ít mặt hơn); tải song song mọi mô hình theo thứ tự xuất hiện thay vì lần lượt từng cái
const MH_CU = new URLSearchParams(location.search).has('mhcu');   // ?mhcu: nạp bản cũ trong sao-luu-truoc-toi-uu/ để chụp so sánh (chỉ dùng trên máy)
const DUOI_MH = innerWidth < 700 && !MH_CU ? '-dt' : '', TRUOC_MH = {}, MUON_MH = [];
const layMH = ten => NAP.loadAsync((MH_CU ? 'sao-luu-truoc-toi-uu/' : '') + 'mo-hinh-nen/' + ten + DUOI_MH + '.wasm');
['15-ngua-van-cd', '16-ga-cd', '02-ca-map', '04-ferrari', '05-noel', '08-woody', '09-buzz', '17-godzilla-cd', '07-kong', '14-mat', '20-thuyen', '21-porsche', '24-ca-koi', '28-bo-xuong', '29-xe-lan', '13-xuong-rong']
  .forEach(ten => { TRUOC_MH[ten] = layMH(ten); TRUOC_MH[ten].catch(() => {}); });

async function napMH(ten) {

  const hua = TRUOC_MH[ten] || layMH(ten); delete TRUOC_MH[ten];   // mỗi bản tải trước chỉ dùng 1 lần (14-mat dùng 2 lần → lần 2 tải riêng)
  const g = await hua, P = g.parser, J = P.json; window.__naoTien = Math.min(.98, (window.__naoTien || 0) + 1 / 22);

  // mẫu lưu màu kiểu cũ (spec-gloss): tự gắn lại ảnh màu

  if ((J.extensionsUsed || []).includes('KHR_materials_pbrSpecularGlossiness')) {

    const viec = [];

    g.scene.traverse(o => { if (!o.isMesh) return; [].concat(o.material).forEach(m => {

      const a = P.associations.get(m); if (!a || a.materials === undefined) return;

      const sg = (J.materials[a.materials].extensions || {}).KHR_materials_pbrSpecularGlossiness; if (!sg) return;

      if (sg.diffuseFactor) m.color.fromArray(sg.diffuseFactor.slice(0, 3));

      m.metalness = 0; m.roughness = 1 - (sg.glossinessFactor ?? .3) * .8;

      if (sg.diffuseTexture) viec.push(P.getDependency('texture', sg.diffuseTexture.index).then(t => { t.colorSpace = THREE.SRGBColorSpace; m.map = t; m.needsUpdate = true; }));

    }); });

    await Promise.all(viec);

  }

  return g;

}

// đặt mô hình: chiều cao (hoặc chiều dài) đích, chân chạm mặt não (+ nâng), xoay

async function datMH(ten, { x, z, h, dai, nang = 0, rx = 0, ry = 0, rz = 0, anim, tAnim = .5, cha = scene, y }) {

  const g = await napMH(ten), o = g.scene, nhom = new THREE.Group();

  if (anim !== undefined && g.animations.length) { const mx = new THREE.AnimationMixer(o); mx.clipAction(typeof anim === 'string' ? (g.animations.find(a => a.name === anim) || g.animations[0]) : g.animations[anim]).play(); mx.update(tAnim); MIXERS.push(mx); }

  o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o, true), s = new THREE.Vector3(), c = new THREE.Vector3(); b.getSize(s); b.getCenter(c);

  const k = dai ? dai / Math.max(s.x, s.y, s.z) : h / s.y;

  o.scale.setScalar(k); o.position.set(-c.x * k, -b.min.y * k, -c.z * k);

  const xoay = new THREE.Group(); xoay.add(o); xoay.rotation.set(rx, ry, rz); nhom.add(xoay);

  nhom.position.set(x, y !== undefined ? y : (cha === scene ? cao(x, z) : 0) + nang, z); cha.add(nhom);

  o.traverse(m => { if (m.isMesh) { m.frustumCulled = false; } });
  ((window.__MH = window.__MH || {})[ten] = window.__MH[ten] || []).push(nhom);   // tra cứu khi soi lỗi

  return { nhom, xoay, o, g };

}



// ngựa vằn thật (thay khối cũ, giữ vệt dấu chân lửa)

{ const { zx, zz } = window.__NV; const QS = new URLSearchParams(location.search), Q = (k, d) => +(QS.get(k) ?? d);

  const nv = window.__NVZ = await datMH('15-ngua-van-cd', { x: zx, z: zz, h: 2.3, ry: Q('nry', Math.PI + .6), anim: 'Gallop', tAnim: .3 });

  // mẫu có khung xương nhưng thiếu ảnh vằn: tự vẽ vằn theo toạ độ gốc của mô hình (vằn bám theo khi ngựa chuyển động)

  nv.o.traverse(m => { if (!m.isMesh) return; m.geometry.computeBoundingBox(); const bbMin = m.geometry.boundingBox.min.clone(), bbKich = m.geometry.boundingBox.getSize(new THREE.Vector3()); const mt = m.material; mt.roughness = .75; mt.metalness = 0;

    mt.onBeforeCompile = sh => {

      sh.vertexShader = 'varying vec3 vP;' + String.fromCharCode(10) + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>' + String.fromCharCode(10) + ' vP = position;');

      sh.uniforms.uMin = { value: bbMin }; sh.uniforms.uKich = { value: bbKich };

      sh.fragmentShader = 'uniform vec3 uMin; uniform vec3 uKich; varying vec3 vP;' + String.fromCharCode(10) + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>

        vec3 q = (vP - uMin) / uKich * vec3(61., 169.24, 264.24) + vec3(-30.55, -1.26, -122.57); float y = q.y, z = q.z, x = q.x;   // quy về toạ độ gốc của mẫu (bản nén đổi cách lưu toạ độ)

        float than = sin(z * .42 + sin(y * .05 + z * .01) * 2.4 + sin(y * .13) * .6);

        float chan = sin(y * .62 + sin(x * .12) * .8);

        float dau = sin(y * .55 + z * .2);

        float k = y < 70. ? chan : (z > 95. ? dau : than);

        float s = smoothstep(-.18, .18, k);

        diffuseColor.rgb *= mix(vec3(.045, .04, .04), vec3(.93, .91, .87), s);`);

    }; mt.needsUpdate = true; }); }

// gà trống khổng lồ (giữ lửa phun cũ)

{ ga.traverse(o => { if (o.isMesh) o.visible = false; });

  const QS = new URLSearchParams(location.search), Q = (k, d) => +(QS.get(k) ?? d);

  const r = window.__GA = await datMH('16-ga-cd', { x: 0, z: 0, h: 3.9, ry: Q('gry', Math.PI), cha: ga, y: 0, anim: 'run01flap', tAnim: .25 }); r.nhom.position.x = -.6;

  r.o.traverse(m => { if (m.isMesh && /roast/i.test([].concat(m.material)[0].name)) m.visible = false; }); }

// cá mập trắng bay (2 con), dùng tư thế đang bơi

{ const a = window.__CA = await datMH('02-ca-map', { x: 9, z: -30, dai: 7, nang: 14, ry: .55, rz: -.15, anim: 0, tAnim: .3 });

  // (cá mập thứ 2: bỏ cho gọn)

}

// Ferrari mui trần sơn đỏ, ông già Noel cầm lái

{ const r = window.__XE = await datMH('04-ferrari', { x: -11, z: -22, dai: 5.8, nang: 10.5, ry: .9 - Math.PI / 2, rx: .08, rz: -.1 });

  r.o.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(mt => { if (/paint/i.test(mt.name)) { mt.map = null; mt.color.set(0xc4000f); mt.metalness = .35; mt.roughness = .28; if ('clearcoat' in mt) mt.clearcoat = 1; mt.needsUpdate = true; } }); });

  const n = await datMH('05-noel', { x: 0, z: 0, h: 1.35, cha: r.xoay, y: 0 }); n.nhom.position.set(-.35, .45, .25); n.nhom.rotation.y = Math.PI / 2; }

// giun khổng lồ trồi lên từ rãnh não

MUON_MH.push(() => datMH('11-giun', { x: -11, z: -31, h: 9, nang: -1.2, ry: .6, anim: 0, tAnim: 1.2 }));   // giun nặng nhất (hoạt hình 100 s): tải sau khi não đã hiện, hiện ra sau vài giây

// Luffy bật nhảy giữa không trung

// (bỏ Luffy) window.__LF = await datMH('10-luffy', { x: 4.5, z: -15, h: 2.6, nang: 6.5, rx: -1.1, ry: -.9, rz: .2 });

// Woody + Buzz bay ngang trời

window.__WD = await datMH('08-woody', { x: -4.5, z: -10, h: 2.4, nang: 6, rx: -1.25, ry: .5 });

window.__BZ = await datMH('09-buzz', { x: -1, z: -12, h: 2.5, nang: 7.5, rx: -1.2, ry: .2, rz: .1 });

// Godzilla đánh King Kong ở chân trời (+ tia nguyên tử)

{ const xa = -80;

  const gz = window.__GZ = await datMH('17-godzilla-cd', { x: 27, z: xa - 18, h: 20, nang: -2, ry: +(new URLSearchParams(location.search).get('zry') ?? (-Math.PI / 2 - .2)), anim: 0, tAnim: .8 });

  const kg = window.__KG = await datMH('07-kong', { x: -5, z: xa - 20, h: 16, nang: -2, ry: Math.PI / 2 + .2, anim: 0, tAnim: .6 });

  const tu = new THREE.Vector3(35, cao(42, xa) + 21, xa), den = new THREE.Vector3(-18, cao(-26, xa) + 14, xa - 2), d = den.clone().sub(tu), L = d.length();

  const tia = new THREE.Mesh(new THREE.CylinderGeometry(.9, .45, L, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }));

  tia.position.copy(tu).addScaledVector(d, .5); tia.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); // bỏ tia phun (anh 09/11)

  const sv = new THREE.PointLight(0xffb070, 260, 60, 1.5); sv.position.set(4, cao(4, xa) + 12, xa + 8); scene.add(sv); }

// mắt người mở ngang trên trời: da + mí + lông mi lấy từ ảnh thật (Wikimedia, CC BY 4.0),

// khe mắt khoét trong suốt, nhãn cầu 3D thật đặt phía sau nên đảo được sang 2 bên

let MAT_CAU = null;

MAT_TROI.visible = false;

if (false) { const p = MAT_TROI.position.clone(); MAT_TROI.visible = false;

  const anh = await new Promise((ok, loi) => { const i = new Image(); i.onload = () => ok(i); i.onerror = loi; i.src = 'mo-hinh/18-mat-nguoi.jpg'; });

  const W0 = anh.width, H0 = anh.height, c = document.createElement('canvas'); c.width = W0; c.height = H0; const x = c.getContext('2d');

  x.drawImage(anh, 0, 0);

  // viền da tan dần vào trời (elip mềm)

  x.globalCompositeOperation = 'destination-in';

  const g = x.createRadialGradient(W0 * .56, H0 * .48, H0 * .22, W0 * .56, H0 * .48, H0 * .5);

  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.55, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');

  x.save(); x.translate(W0 * .56, H0 * .48); x.scale(1.62, 1); x.translate(-W0 * .56, -H0 * .48); x.fillStyle = g; x.fillRect(-W0, -H0, W0 * 3, H0 * 3); x.restore();

  // khoét khe mắt (hạnh nhân) theo mép mí thật trong ảnh

  x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';

  x.beginPath(); x.moveTo(462, 458);

  x.bezierCurveTo(600, 300, 820, 236, 960, 238); x.bezierCurveTo(1150, 240, 1330, 360, 1440, 590);

  x.bezierCurveTo(1300, 640, 1080, 645, 900, 640); x.bezierCurveTo(720, 630, 560, 545, 462, 458); x.closePath(); x.fill();

  x.globalCompositeOperation = 'source-over';

  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;

  const RONG = 46, CAO = RONG * H0 / W0;

  const mat = new THREE.Mesh(new THREE.PlaneGeometry(RONG, CAO), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .03, fog: false }));

  mat.position.copy(p); mat.lookAt(cam.position); scene.add(mat);

  // nhãn cầu 3D phía sau khe, tâm trùng tâm tròng đen trong ảnh (~ 925, 420)

  const u = (925 / W0 - .5) * RONG, v = (.5 - 430 / H0) * CAO, Rc = +(new URLSearchParams(location.search).get('rc') || 11);

  const pha = new THREE.Vector3(u, v, -Rc * 1.04).applyQuaternion(mat.quaternion).add(mat.position);

  const r = await datMH('14-mat', { x: pha.x, z: pha.z, y: pha.y - Rc, dai: Rc * 2 });

  r.o.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(mt => { mt.fog = false; }); });

  r.nhom.lookAt(cam.position);

  // xoay quanh tâm nhãn cầu (không phải đáy): dời mô hình để tâm về gốc nhóm xoay

  const tamXoay = new THREE.Group(); tamXoay.position.set(0, Rc, 0); r.nhom.add(tamXoay); r.xoay.position.y = -Rc; tamXoay.add(r.xoay);

  MAT_CAU = tamXoay; tamXoay.rotation.y = -.28; tamXoay.rotation.x = .05;   // khung chụp: đang liếc sang trái

  const den = new THREE.PointLight(0xfff0f0, 700, 70, 1.6); den.position.copy(p).lerp(cam.position, .2); scene.add(den); }

// mặt trăng đồng hồ (thay con mắt): trăng thật (ảnh NASA LRO), kim đồng thau + kim giây đỏ chỉ 03:47,

// 12 vạch giờ là 12 miệng hố phát sáng nhẹ, kim đổ bóng giả lên mặt trăng

let KIM = null;

if (false) { const p = MAT_TROI.position.clone().add(new THREE.Vector3(-7, 3, 0)), R = 13;

  const tex = await new THREE.TextureLoader().loadAsync('mo-hinh/19-trang.jpg'); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;

  const trang = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 96), new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 2.5, roughness: 1, metalness: 0, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .12, fog: false }));

  const tam = new THREE.Group(); tam.position.copy(p); tam.lookAt(cam.position); scene.add(tam);

  trang.rotation.y = -Math.PI / 2; tam.add(trang);   // mặt gần (kinh độ 0) quay về người xem

  const anhTrang = new THREE.PointLight(0xfff1e0, 2600, 75, 1.4); anhTrang.position.set(-24, 14, 22); tam.add(anhTrang);   // nắng xiên từ trái trên cho hố hiện khối

  // 12 vạch giờ = 12 hố sáng nằm trên mặt cầu

  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, rr = R * .78, x = Math.sin(a) * rr, y = Math.cos(a) * rr, z = Math.sqrt(R * R - x * x - y * y);

    const h = new THREE.Mesh(new THREE.SphereGeometry(i % 3 === 0 ? .75 : .45, 16, 10), new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xffe2b0 : 0xffd0a0, fog: false }));

    h.position.set(x, y, z - .15); tam.add(h); }

  // kim

  const dong = new THREE.MeshStandardMaterial({ color: 0xe0b866, metalness: .55, roughness: .3, emissive: 0x3a2a10, emissiveIntensity: .6, fog: false });

  const doKim = new THREE.MeshStandardMaterial({ color: 0xff3b4a, emissive: 0x8a0010, emissiveIntensity: .8, roughness: .4, fog: false });

  const bong = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .35, fog: false, depthWrite: false });

  const kim = (dai, rong, mat, z) => { const g = new THREE.Group(); const sh = new THREE.Shape(); sh.moveTo(-rong / 2, -dai * .14); sh.lineTo(rong / 2, -dai * .14); sh.lineTo(rong * .18, dai); sh.lineTo(-rong * .18, dai); sh.closePath();

    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .18, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 2 }), mat); m.position.z = z; g.add(m);

    const b = new THREE.Mesh(new THREE.ShapeGeometry(sh), bong); b.position.set(.9, -.9, R + .06); g.add(b); tam.add(g); return g; };

  const kh = kim(R * .52, 1.6, dong, R + 1.4), km = kim(R * .8, 1.05, dong, R + 1.8), ks = kim(R * .9, .34, doKim, R + 2.2);

  const nut = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .5, 24), dong); nut.rotation.x = Math.PI / 2; nut.position.z = R + 2.3; tam.add(nut);

  const G = 3, P = 47, S = 22; kh.rotation.z = -((G + P / 60) / 12) * Math.PI * 2; km.rotation.z = -(P / 60) * Math.PI * 2; ks.rotation.z = -(S / 60) * Math.PI * 2;

  KIM = { kh, km, ks }; }

// nhãn cầu của chính bộ não, thả lên trời canh chừng: không mí, tia máu nhẹ (thức trắng), tròng luôn dõi theo người xem,

// dây thần kinh thị giác nối từ sau nhãn cầu xuống mặt não như dây diều

{ const R = 9, p = MAT_TROI.position.clone().add(new THREE.Vector3(-4, -6, 10));

  const r = await datMH('14-mat', { x: p.x, z: p.z, y: p.y - R, dai: R * 2 });

  r.o.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(mt => { mt.fog = false; if (mt.color) mt.color.lerp(new THREE.Color(0xffffff), .25); mt.roughness = .18; if ('clearcoat' in mt) mt.clearcoat = 1; }); });

  // lọc gần hết tia máu: điểm ảnh ngả đỏ (không phải tròng xanh) đưa về trắng ngà

  r.o.traverse(m => { if (!m.isMesh) return; [].concat(m.material).forEach(mt => { const t = mt.map; if (!t || !t.image) return;

    const im = t.image, c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);

    const d = x.getImageData(0, 0, c.width, c.height), a = d.data;

    for (let i = 0; i < a.length; i += 4) { const R = a[i], G = a[i + 1], B = a[i + 2], do_ = R - (G + B) / 2;

      if (do_ > 18 && R > 90) { const k = Math.min(1, (do_ - 18) / 50) * .92; a[i] = R + (238 - R) * k; a[i + 1] = G + (228 - G) * k; a[i + 2] = B + (224 - B) * k; } }

    x.putImageData(d, 0, 0); const nt = new THREE.CanvasTexture(c); nt.colorSpace = t.colorSpace; nt.flipY = t.flipY; nt.wrapS = t.wrapS; nt.wrapT = t.wrapT; mt.map = nt; mt.needsUpdate = true; }); });

  const tamXoay = new THREE.Group(); tamXoay.position.set(0, R, 0); r.nhom.add(tamXoay); r.xoay.position.y = -R; tamXoay.add(r.xoay);

  r.nhom.lookAt(cam.position); MAT_CAU = tamXoay; tamXoay.rotation.y = -.12;

  const den = new THREE.PointLight(0xfff2f2, 900, 60, 1.6); den.position.copy(p).lerp(cam.position, .22).add(new THREE.Vector3(-8, 8, 0)); scene.add(den);

  // bầu trời rạch thành khe mắt: mảng trời cùng màu trời (tính theo hướng nhìn), mép khe là mí mắt

  { const RONG = R * 4.6, CAO = R * 3.2, sx = R * 1.62 / (RONG / 2), sy = R * .78 / (CAO / 2);

    const vm = new THREE.ShaderMaterial({ transparent: true, fog: false, side: THREE.DoubleSide,

      uniforms: { sx: { value: sx }, sy: { value: sy }, asp: { value: CAO / RONG }, uMo: { value: 1 }, uSang: SANG },

      vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',

      fragmentShader: `uniform float sx, sy, asp, uMo, uSang; varying vec2 vUv; varying vec3 vW;

        ${HAM_TROI}

        void main(){

          vec2 q = vUv * 2. - 1.; float x = q.x / sx; float y = q.y / sy;

          float ax = clamp(abs(x), 0., 1.); float hm = pow(max(1. - ax*ax, 0.), .75) * uMo;

          float yy = y > 0. ? y : y * 1.15;                       // mí dưới phẳng hơn

          float d = (abs(yy) - hm) * sy * asp;                   // khoảng cách tới mép khe (đơn vị đều)

          float aNgoai = 1. - smoothstep(.72, .97, length(q * vec2(1., 1.05)));   // mép tấm trời mờ dần → không lộ khung
          if (abs(x) < 1. && abs(yy) < hm) { float dong = smoothstep(.95, .55, uMo); if (dong < .01) discard; gl_FragColor = vec4(vec3(.32, .03, .06) * uSang, dong); return; }   // lòng khe: thấy nhãn cầu; nhắm thì mí che kín

          vec3 c = troi(normalize(vW - cameraPosition)) * uSang;

          float vung = 1. - smoothstep(0., .16, d);               // mí: dải sát mép khe

          vec3 thit = mix(vec3(.42,.02,.07), vec3(.78,.16,.22), smoothstep(0., .12, d));

          c = mix(c, thit, vung * smoothstep(1.25, .95, abs(x)));

          c *= mix(.35, 1., smoothstep(0., .02, d));               // viền tối ở mép trong

          c += vec3(1.25,.72,.38) * exp(-pow(d / .012, 2.)) * smoothstep(1.02, .85, abs(x)) * 1.4 * smoothstep(.5, .95, uMo);   // đường sáng vàng như ánh sáng lọt qua vết rạch

          if (y > 0.) { float nep = exp(-pow((d - .2) / .018, 2.)); c *= 1. - .35 * nep * smoothstep(1.1, .6, abs(x)); }   // nếp mí trên

          if (y > 0. && d < .11 && abs(x) < .95) { float l = abs(fract(x * 26. + d * 18.) - .5); c *= 1. - .8 * smoothstep(.12, .0, l) * smoothstep(.11, .0, d); }  // lông mi

          gl_FragColor = vec4(c, aNgoai);

        }` });

    const mang = new THREE.Mesh(new THREE.PlaneGeometry(RONG, CAO), vm); window.__VM = vm;

    const huong = cam.position.clone().sub(p).normalize();

    mang.position.copy(p).addScaledVector(huong, R * 1.12); mang.lookAt(cam.position); scene.add(mang); }

}

// ================= THÊM v2 (anh 09/11 tối) =================

{ const { clone: nhanBan } = await import('three/addons/utils/SkeletonUtils.js');

  const DONG2 = [];   // [nhóm, hàm cập nhật(t, dt)]

  // thuyền Going Merry mắc cạn trên nếp não, nghiêng một bên

  window.__THUYEN = await datMH('20-thuyen', { x: cx0 - 21, z: cz0 - 30, dai: 11, nang: -1.2, ry: .9, rz: .22, rx: -.06 });

  // Porsche 911 bay (chiếc anh mơ)

  { const r = window.__PORSCHE = await datMH('21-porsche', { x: cx0 + 16, z: cz0 - 34, dai: 5.5, nang: 12, ry: -2.3, rz: .12, rx: -.05 });

    const g0 = r.nhom.position.clone(); DONG2.push(t => { r.nhom.position.set(g0.x - t * 2.2, g0.y + Math.sin(t * 1.4) * .4, g0.z + t * .6); }); }

  // đĩa bay lơ lửng (có chuyển động lơ lửng sẵn)

  MUON_MH.push(async () => { const r = await datMH('22-ufo', { x: cx0 - 26, z: cz0 - 60, dai: 7, nang: 22, rz: .15, anim: 'Hovering', tAnim: .4 });

    const g0 = r.nhom.position.clone(); DONG2.push(t => { r.nhom.position.x = g0.x + t * 1.4; r.xoay.rotation.y = t * .8; }); });   // tải sau khi não đã hiện (vật trên trời cao, không cần cho khung đầu)

  // máy bay bay ngang trên cao

  MUON_MH.push(async () => { const r = await datMH('23-may-bay', { x: cx0 + 40, z: cz0 - 95, dai: 12, nang: 34, ry: -Math.PI / 2 - .3, rz: -.12 });

    const g0 = r.nhom.position.clone(); DONG2.push(t => { r.nhom.position.x = g0.x - t * 6; r.nhom.position.z = g0.z + t * 1.2; }); });   // tải sau khi não đã hiện (vật trên trời cao, không cần cho khung đầu)

  // cá bơi trên trời: đàn koi, sứa, cá voi xanh

  { const g = await napMH('24-ca-koi');

    for (let i = 0; i < 6; i++) {

      const o = nhanBan(g.scene), nhom = new THREE.Group(), b = new THREE.Box3().setFromObject(g.scene, true), s = b.getSize(new THREE.Vector3()), k = (2.2 + rnd() * 1.2) / Math.max(s.x, s.y, s.z);

      o.scale.setScalar(k); nhom.add(o); scene.add(nhom);

      const mx = new THREE.AnimationMixer(o); if (g.animations[0]) { const a = mx.clipAction(g.animations[0]); a.timeScale = 1.6; a.play(); } mx.update(rnd() * 2); MIXERS.push(mx);

      (window.__KOI = window.__KOI || []).push(nhom); const x0 = cx0 - 22 + i * 1.8 + rnd() * 2, y0 = ch0 + 4.5 + rnd() * 2.5, z0 = cz0 - 16 - rnd() * 6, pha = rnd() * 6;

      const cap = t => { const x = x0 + t * 1.6, y = y0 + Math.sin(t * 1.2 + pha) * .6; nhom.position.set(x, y, z0 + Math.sin(t * .7 + pha) * 1.2); nhom.rotation.y = Math.PI / 2 * 0 + Math.sin(t * .7 + pha) * .25; };

      cap(0); DONG2.push(cap);

    } }

  if (false) { const g = await napMH('25-sua');

    for (let i = 0; i < 4; i++) {

      const o = nhanBan(g.scene), nhom = new THREE.Group(), b = new THREE.Box3().setFromObject(g.scene, true), s = b.getSize(new THREE.Vector3()), k = (1.8 + rnd()) / s.y;

      o.scale.setScalar(k); nhom.add(o); scene.add(nhom);

      o.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(mt => { mt.transparent = true; mt.opacity = Math.min(mt.opacity, .85); if (mt.emissive) { mt.emissive.set(0xff9ad0); mt.emissiveIntensity = .35; } }); });

      const mx = new THREE.AnimationMixer(o); if (g.animations[0]) mx.clipAction(g.animations[0]).play(); mx.update(rnd() * 3); MIXERS.push(mx);

      const x0 = cx0 + 6 + rnd() * 10, y0 = ch0 + 6 + rnd() * 6, z0 = cz0 - 14 - rnd() * 14, pha = rnd() * 6;

      const cap = t => nhom.position.set(x0 + Math.sin(t * .4 + pha) * .8, y0 + t * .35 + Math.sin(t * 1.5 + pha) * .3, z0); cap(0); DONG2.push(cap);

    } }

  if (false) { const r = await datMH('26-ca-voi', { x: cx0 - 30, z: cz0 - 110, dai: 40, nang: 40, ry: Math.PI / 2 + .3, anim: 0, tAnim: 1 });

    const g0 = r.nhom.position.clone(); DONG2.push(t => { r.nhom.position.x = g0.x + t * 2.5; }); }

  // cá mập quẫy rõ hơn

  if (window.__CA && window.__CA.g) { /* hoạt ảnh bơi chạy nhanh gấp 2,5 */ }

  MIXERS.forEach(m => { const ac = m._actions && m._actions[0]; if (ac && ac.getClip().name.startsWith('Swimming01')) ac.timeScale = 2.5; });



  // ===== v3 (anh 09/11 tối) =====

  // --- lửa sinh dưới chân ngựa khi chạy: bùng lên lúc móng chạm đất, nhỏ và mờ dần rồi tắt; vết sém tan chậm hơn ---

  const LUA = (() => {

    const texNgon = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');

      const g = x.createRadialGradient(32, 96, 2, 32, 80, 60); g.addColorStop(0, 'rgba(255,245,200,1)'); g.addColorStop(.25, 'rgba(255,190,70,.9)'); g.addColorStop(.6, 'rgba(255,90,20,.45)'); g.addColorStop(1, 'rgba(200,30,0,0)');

      x.fillStyle = g; x.beginPath(); x.moveTo(32, 4); x.bezierCurveTo(46, 40, 60, 70, 52, 104); x.quadraticCurveTo(32, 128, 12, 104); x.bezierCurveTo(4, 70, 18, 40, 32, 4); x.fill();

      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();

    const texSem = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 2, 32, 32, 32);

      g.addColorStop(0, 'rgba(20,4,2,.85)'); g.addColorStop(.5, 'rgba(60,10,4,.45)'); g.addColorStop(1, 'rgba(60,10,4,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();

    const texQuang = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);

      g.addColorStop(0, 'rgba(255,170,80,.9)'); g.addColorStop(1, 'rgba(255,90,20,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();

    const N = 260, ds = [];

    for (let i = 0; i < N; i++) {

      const sem = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texSem, transparent: true, depthWrite: false, opacity: 0 })); sem.rotation.x = -Math.PI / 2;

      const quang = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texQuang, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); quang.rotation.x = -Math.PI / 2;

      const ngon = []; for (let k = 0; k < 2; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texNgon, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); ngon.push(sp); }

      const nhom = new THREE.Group(); nhom.add(sem, quang, ...ngon); nhom.visible = false; scene.add(nhom);

      ds.push({ nhom, sem, quang, ngon, tuoi: 99, pha: rnd() * 6 });

    }

    let con = 0;

    return {

      tha(x, z) { const d = ds[con++ % N]; d.tuoi = 0; d.nhom.position.set(x, caoMuot(x, z) - .3, z); d.nhom.visible = true; },

      cap(dt, t) { for (const d of ds) { if (!d.nhom.visible) continue; d.tuoi += dt; const a = d.tuoi;

        const lua = a < 1.6 ? Math.max(0, 1 - a / 1.6) : 0, sem = Math.max(0, 1 - a / 3.2);

        if (sem <= 0) { d.nhom.visible = false; continue; }

        d.sem.material.opacity = .75 * sem; d.sem.scale.setScalar(.7 + .3 * Math.min(1, a * 3)); d.sem.position.y = .02;

        d.quang.material.opacity = .6 * lua; d.quang.scale.setScalar(1.6); d.quang.position.y = .05;

        d.ngon.forEach((sp, k) => { const nhay = .75 + .25 * Math.sin(t * 22 + d.pha + k * 2.1) + .12 * Math.sin(t * 37 + k); const h = (.75 + k * .25) * lua * nhay;

          sp.material.opacity = Math.min(1, lua * 1.4); sp.scale.set(h * .5, h, 1); sp.position.set((k - .5) * .18, h * .45, (k - .5) * .1); }); } }

    };

  })();



  // --- đàn ngựa: con đầu đàn phi về phía trước; đàn 4 con chạy NGANG qua sát ống kính giữa cảnh (giây 3 → 7) ---

  const DAN = [];

  if (window.__NVZ) { const dau = window.__NVZ, g = dau.g, matVan = dau.o.getObjectByProperty('isMesh', true).material;

    DAN.push({ nhom: dau.nhom, buoc: 0 });

    for (const [dz, dx, tr] of [[0, 0, .1], [1.4, 3, .35], [-1.2, 5.5, .2], [.4, 8, .45]]) {

      const o = nhanBan(g.scene); o.scale.copy(dau.o.scale); o.position.copy(dau.o.position); o.traverse(m => { if (m.isMesh) m.material = matVan; });

      const xoay = new THREE.Group(); xoay.rotation.y = +(new URLSearchParams(location.search).get('dry') ?? -Math.PI / 2); xoay.add(o); const nhom = new THREE.Group(); nhom.add(xoay); scene.add(nhom);

      const mx = new THREE.AnimationMixer(o); mx.clipAction(g.animations.find(a => a.name === 'Gallop') || g.animations[0]).play(); mx.update(tr); MIXERS.push(mx);

      const con = { nhom, buoc: rnd() * .1, y: null };

      const cap = (t) => { const k = Math.min(1, Math.max(0, (t - 3) / 4.2));                       // 0 → 1 trong giây 3 → 7,2

        const camZ = cam.position.z, x = cam.position.x + 24 - k * 52 + dx, z = camZ - 6.5 + dz;

        const yy = caoMuot(x, z); con.y = con.y === null ? yy : con.y + (yy - con.y) * .25; nhom.position.set(x, con.y, z);

        nhom.visible = t > 2.4 && t < 8.2; };

      cap(0); DONG2.push(cap); DAN.push(con);

    } }

  // mỗi con ngựa thả dấu lửa theo nhịp phi (2 móng trước + 2 móng sau xen kẽ)

  { let tTruoc = 0; DONG2.push((t, dt) => { dt = dt || 0;

      for (const c of DAN) { if (c.nhom.visible === false) continue; c.buoc += dt; if (c.buoc > .11) { c.buoc = 0; const p = c.nhom.position;

          const lech = (Math.random() - .5) * .9; LUA.tha(p.x + lech * .6, p.z + lech); } }

      LUA.cap(dt, t); }); }



  // --- tia nguyên tử xanh bám miệng Godzilla (khớp cao nhất trên sống lưng), bắn về phía King Kong ---

  if (window.__GZ && window.__KG) { const gz = window.__GZ, kg = window.__KG;

    let dauGz = null, cao0 = -1e9; scene.updateMatrixWorld(true); const v = new THREE.Vector3();

    gz.o.traverse(b => { if (b.isBone && /^Bone/.test(b.name)) { b.getWorldPosition(v); if (v.y > cao0) { cao0 = v.y; dauGz = b; } } });

    const tia = new THREE.Group(); scene.add(tia);

    const vo = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x5fd8ff, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));

    const loi = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }));

    tia.add(vo, loi); const den = new THREE.PointLight(0x6fd8ff, 260, 50, 1.6); scene.add(den);

    const A = new THREE.Vector3(), B = new THREE.Vector3(), D = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);

    DONG2.push(t => { if (!dauGz) return; dauGz.getWorldPosition(A); kg.nhom.getWorldPosition(B); B.y += 12;

      D.copy(B).sub(A); const L = D.length(); D.normalize(); A.addScaledVector(D, 1.2);

      tia.position.copy(A).addScaledVector(D, L / 2); tia.quaternion.setFromUnitVectors(Y, D);

      const nhay = 1 + .12 * Math.sin(t * 40) + .06 * Math.sin(t * 73);

      vo.scale.set(1.3 * nhay, L, 1.3 * nhay); loi.scale.set(.45 * nhay, L, .45 * nhay); den.position.copy(B); }); }



  // --- buồm thuyền phập phồng, cờ bay (sóng nhẹ trên các mảng mỏng ở phần trên thuyền) ---

  if (window.__THUYEN) { const th = window.__THUYEN; scene.updateMatrixWorld(true);

    const bTh = new THREE.Box3().setFromObject(th.o, true);

    th.o.traverse(m => { if (!m.isMesh) return; const b = new THREE.Box3().setFromObject(m, true), s = b.getSize(new THREE.Vector3());

      const day = Math.min(s.x, s.y, s.z), lon = Math.max(s.x, s.y, s.z);

      if (b.min.y < bTh.min.y + (bTh.max.y - bTh.min.y) * .35 || day > lon * .25) return;   // chỉ mảng mỏng phía trên = buồm, cờ

      m.geometry.computeBoundingBox(); const gb = m.geometry.boundingBox, kich = gb.getSize(new THREE.Vector3()), bien = Math.max(kich.x, kich.y, kich.z) * .06;

      m.material = m.material.clone();

      m.material.onBeforeCompile = sh => { sh.uniforms.uT = UT; sh.uniforms.uBien = { value: bien }; sh.uniforms.uDay = { value: gb.min.y }; sh.uniforms.uCao = { value: Math.max(kich.y, 1e-4) };

        sh.vertexShader = 'uniform float uT, uBien, uDay, uCao;\n' + sh.vertexShader.replace('#include <begin_vertex>',

          '#include <begin_vertex>\n float hh = clamp((position.y - uDay) / uCao, 0., 1.); transformed.z += sin(position.y * 6.283 / uCao * 1.2 + uT * 3.1) * uBien * hh + sin(uT * 1.7) * uBien * .6 * hh; transformed.x += sin(position.y * 4. / uCao + uT * 2.3) * uBien * .4 * hh;'); };

      m.material.needsUpdate = true; }); }



  // --- cá koi bơi qua chữ: chữ gợn sóng như mặt nước ---

  { const pk = new THREE.Vector3(); DONG2.push(t => { const koi = window.__KOI || [];

      for (const sp of CHU) { if (!sp.userData.song) continue; let gan = 1e9; for (const k of koi) { k.getWorldPosition(pk); const d = pk.distanceTo(sp.position); if (d < gan) gan = d; }

        const muc = Math.max(0, 1 - gan / 6); sp.userData.song.value += (muc - sp.userData.song.value) * .15; } }); }



  // --- con mắt chớp chậm (giây 6,6 → 7,9), cả bầu trời tối sầm theo nhịp chớp ---

  DONG2.push(t => { UT.value = t; const a = (t - 6.6) / 1.3; let mo = 1;

    if (a > 0 && a < 1) mo = Math.pow(Math.abs(Math.cos(a * Math.PI)), 1.6);       // nhắm dần rồi mở lại

    if (window.__VM) window.__VM.uniforms.uMo.value = Math.max(.02, mo); if (MAT_CAU) MAT_CAU.visible = mo > .55;   // mí khép quá nửa thì ẩn nhãn cầu (hết vầng trăng trắng)

    SANG.value = .35 + .65 * mo; renderer.toneMappingExposure = .95 * (.7 + .3 * mo); });



  // ===== v4 (anh 09/11 tối) =====

  // --- gà chạy thật: di chuyển theo hướng mặt, tăng tốc êm, độ cao mượt; lửa vẫn bám mỏ ---

  if (window.__GA) { const ga0 = ga.position.clone(), r = window.__GA; scene.updateMatrixWorld(true);

    const mo = r.o.getObjectByName('beak_38'), dau = r.o.getObjectByName('head_40'), A = new THREE.Vector3(), B = new THREE.Vector3();

    mo.getWorldPosition(A); dau.getWorldPosition(B); let huong = A.sub(B).setY(0).normalize();
    { const muon = new THREE.Vector3(1, 0, -.55).normalize();   // anh 09/11: đứng xa hơn, chạy chéo trái → phải và sâu dần (ngược đàn ngựa), không che màn, thấy nghiêng + lửa phun
      ga.rotation.y += Math.atan2(-muon.z, muon.x) - Math.atan2(-huong.z, huong.x); huong = muon; }

    let y = null;

    DONG2.push(t => { const di = t < 1 ? 1.1 * t * t / 2 : 1.1 * (t - .5); const x = ga0.x + huong.x * di, z = ga0.z + huong.z * di;

      const yy = caoMuot(x, z) - .25; y = y === null ? yy : y + (yy - y) * .2; ga.position.set(x, y, z); }); }



  // --- bộ xương đang chạy bộ băng ngang mặt não (trái → phải) ---

  { const r = window.__XUONG = await datMH('28-bo-xuong', { x: cx0 - 12, z: cz0 - 10, h: +(new URLSearchParams(location.search).get('xh') || 3.4), ry: +(new URLSearchParams(location.search).get('xry') ?? Math.PI / 2), anim: 0, tAnim: .2 });

    const g0 = r.nhom.position.clone(); let y = null;

    MIXERS.forEach(m => { if (m.getRoot() === r.o) m._actions.forEach(a => a.timeScale = 1.15); });

    DONG2.push(t => { const x = g0.x + t * 2.1, z = g0.z; const yy = caoMuot(x, z) - .2; y = y === null ? yy : y + (yy - y) * .2; r.nhom.position.set(x, y, z); }); }



  // --- xe lăn bay: lượn chậm, xoay bánh nhẹ, nghiêng theo hướng bay ---

  { const r = await datMH('29-xe-lan', { x: cx0 + 9, z: cz0 - 20, dai: 2.6, nang: 9, ry: -.6 });

    const g0 = r.nhom.position.clone();

    DONG2.push(t => { r.nhom.position.set(g0.x - t * 1.3, g0.y + Math.sin(t * 1.1) * .5, g0.z + Math.sin(t * .5) * .8); r.xoay.rotation.z = Math.sin(t * 1.1) * .12; r.xoay.rotation.y = -.6 + Math.sin(t * .4) * .2; }); }



  // vài cây nơ-ron ở xa

  for (const [x, z, h] of [[cx0 - 34, cz0 - 70, 7], [cx0 + 28, cz0 - 78, 8], [cx0 - 6, cz0 - 98, 9], [cx0 + 44, cz0 - 58, 6.5]]) caiNoron(x, z, h);



  // lửa gà: ngọn lửa mềm phun ra từ mỏ (bám xương mỏ khi gà vỗ cánh)

  { ga.traverse(o => { if (o.isPoints) o.visible = false; });

    const n = 900, a = new Float32Array(n * 3), cl = new Float32Array(n * 3), tt = new Float32Array(n);

    for (let i = 0; i < n; i++) { tt[i] = rnd(); }

    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(a, 3)); geo.setAttribute('color', new THREE.BufferAttribute(cl, 3));

    const lua = new THREE.Points(geo, new THREE.PointsMaterial({ size: .55, map: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));

    lua.frustumCulled = false; scene.add(lua);

    const mo = window.__GA && window.__GA.o.getObjectByName('beak_38'), dauG = window.__GA && window.__GA.o.getObjectByName('head_40');

    const P = new THREE.Vector3(), H = new THREE.Vector3(), F = new THREE.Vector3(), U = new THREE.Vector3(), V = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), mau = new THREE.Color();

    const cap = (t, dt) => {

      if (!mo) return; mo.getWorldPosition(P); dauG.getWorldPosition(H); F.copy(P).sub(H).normalize(); U.crossVectors(F, Y).normalize(); V.crossVectors(U, F);

      for (let i = 0; i < n; i++) { tt[i] = (tt[i] + (dt || 0) * 1.6) % 1; const k = tt[i], s = (i * 7.31) % 6.28, r = k * 1.5 * ((i * .618) % 1);

        const d = k * 7; a[i * 3] = P.x + F.x * d + (U.x * Math.cos(s) + V.x * Math.sin(s)) * r + k * k * .8;

        a[i * 3 + 1] = P.y + F.y * d + (U.y * Math.cos(s) + V.y * Math.sin(s)) * r + k * k * 1.2; a[i * 3 + 2] = P.z + F.z * d + (U.z * Math.cos(s) + V.z * Math.sin(s)) * r;

        mau.setHSL(.14 - k * .13, 1, .62 - k * .4); cl[i * 3] = mau.r * (1 - k * .6); cl[i * 3 + 1] = mau.g * (1 - k * .6); cl[i * 3 + 2] = mau.b * (1 - k * .6); }

      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; };

    scene.updateMatrixWorld(true); cap(0, 0); DONG2.push(cap); }



  // nắng toả từ con mắt trên trời (như mặt trời): tia nắng xoay chậm + quầng ấm

  if (MAT_CAU) { const tam = new THREE.Vector3(); MAT_CAU.getWorldPosition(tam);

    const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'); x.translate(512, 512);

      for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2 + (i % 2 ? .02 : 0), dai = 380 + (i * 97 % 120), rong = i % 3 ? .018 : .035;

        const gr = x.createLinearGradient(0, 0, Math.cos(a) * dai, Math.sin(a) * dai); gr.addColorStop(0, 'rgba(255,214,150,.55)'); gr.addColorStop(1, 'rgba(255,170,110,0)');

        x.fillStyle = gr; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a - rong) * dai, Math.sin(a - rong) * dai); x.lineTo(Math.cos(a + rong) * dai, Math.sin(a + rong) * dai); x.fill(); }

      x.globalCompositeOperation = 'destination-out'; const lo = x.createRadialGradient(0, 0, 90, 0, 0, 170); lo.addColorStop(0, 'rgba(0,0,0,1)'); lo.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = lo; x.fillRect(-512, -512, 1024, 1024); x.globalCompositeOperation = 'source-over';

      const q = x.createRadialGradient(0, 0, 150, 0, 0, 420); q.addColorStop(0, 'rgba(255,220,170,.35)'); q.addColorStop(.35, 'rgba(255,170,120,.18)'); q.addColorStop(1, 'rgba(255,150,110,0)'); x.fillStyle = q; x.fillRect(-512, -512, 1024, 1024);

      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();

    const nang = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));

    const huong = cam.position.clone().sub(tam).normalize(); nang.position.copy(tam).addScaledVector(huong, 9 * 1.3); nang.lookAt(cam.position); nang.renderOrder = -1; /* bỏ tia nắng (anh 09/11) */

    DONG2.push(t => { nang.rotation.z = t * .05; }); }



  window.__THEM = (t, dt) => DONG2.forEach(f => f(t, dt));

  window.__THEM(0, 0);

}

// xương rồng thật + vài cây nấm thật

await datMH('13-xuong-rong', { x: -6.5, z: -17, h: 4.6, ry: .3 });

if (false) for (const [x, z, h] of [[-4.5, -8, 1.3], [8.5, -18, 1.8], [-13, -24, 2.2]]) { const r = await datMH('12-nam', { x, z, h, ry: x });

  r.o.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(mt => { if (mt.emissive) mt.emissiveIntensity = .5; }); }); }



await new Promise(r => setTimeout(r, 60));

const W2 = innerWidth, H2 = innerHeight; renderer.setSize(W2, H2); cam.aspect = W2 / H2; cam.updateProjectionMatrix();

// sắp chữ: không chồng nhau trên màn hình, chữ nhỏ quá thì đưa lại gần → dày nhưng đọc được

{ cam.updateMatrixWorld(); cam.updateProjectionMatrix();

  const v = new THREE.Vector3(), da = [], tanF = Math.tan(cam.fov * Math.PI / 360);

  const hop = sp => { v.copy(sp.position).project(cam); if (v.z > 1 || v.z < -1) return null; const dd = sp.position.distanceTo(cam.position);

    const h = sp.scale.y / 2 / (dd * tanF), w = h * sp.scale.x / sp.scale.y / cam.aspect; return [v.x - w - .01, v.x + w + .01, v.y - h * 1.25, v.y + h * 1.25, h]; };

  const chong = b => da.some(o => b[0] < o[1] && b[1] > o[0] && b[2] < o[3] && b[3] > o[2]);

  const hopLe = b => b && b[4] > .016 && b[0] > -.98 && b[1] < .98 && b[3] < .9 && b[2] > -.35 && !chong(b);

  { v.copy(MAT_TROI.position).project(cam); const dd = MAT_TROI.position.distanceTo(cam.position), r = 15 / (dd * tanF); da.push([v.x - 2 * r / cam.aspect, v.x + 2 * r / cam.aspect, v.y - r, v.y + r, r]); }

  for (const sp of CHU) {

    const goc = sp.scale.clone(); let b = sp.userData.cao ? null : hop(sp), thu = 0;

    while (!hopLe(b) && thu++ < 60) {

      const z = -8 - Math.random() * 70, x = cx0 + (Math.random() - .5) * (14 + -z * 1.1), y = sp.userData.cao ? ch0 + 10 + Math.random() * (8 + -z * .6) : ch0 + 3 + Math.random() * (5 + -z * .35);

      sp.position.set(x, y, z); sp.scale.copy(goc).multiplyScalar(1); b = hop(sp);

    }

    if (hopLe(b)) da.push(b); else sp.visible = false;

  } }



// tối ưu 13/11: lớp nhoè ống kính (Bokeh) trước đây vẽ lại CẢ cảnh lần thứ 2 mỗi khung chỉ để lấy độ sâu (~3200 lệnh vẽ, 5,6 triệu tam giác / khung).
//   Nay lần vẽ chính ghi luôn độ sâu vào 1 ảnh độ sâu gắn sẵn trên bộ đệm của composer, Bokeh đọc ảnh đó → còn 1 lần vẽ cảnh / khung. ?bokehCu để chạy cách cũ khi cần so.
const BOKEH_CU = new URLSearchParams(location.search).has('bokehCu'), PR2 = renderer.getPixelRatio();
const comp = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W2 * PR2, H2 * PR2, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(W2 * PR2, H2 * PR2) }));
comp.renderTarget2.depthTexture = new THREE.DepthTexture(W2 * PR2, H2 * PR2);   // bộ đệm thứ 2 phải có ảnh độ sâu RIÊNG (bản clone dùng chung ảnh gốc → đọc và ghi cùng 1 ảnh = hình đen)
comp.setPixelRatio(PR2); comp.setSize(W2, H2); comp.addPass(new RenderPass(scene, cam));

comp.addPass(new UnrealBloomPass(new THREE.Vector2(W2, H2), .14, .4, .95));
// sửa lỗi 13/11: não không theo đổi cỡ cửa sổ / xoay điện thoại (hình bị kéo méo). Nay đổi cỡ thì cập nhật canvas + máy quay + bộ hậu kỳ (chữ ý nghĩ giữ chỗ đã sắp)
addEventListener('resize', () => { const w = innerWidth, h = innerHeight; if (!w || !h) return; renderer.setSize(w, h); comp.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); });

// lớp điện ảnh: lấy nét vào ngựa vằn (xa/gần nhoè nhẹ), chỉnh màu, tối góc, hạt phim, lệch màu mép ống kính

{ const bk = new BokehPass(scene, cam, { focus: 17, aperture: .0008, maxblur: .0025 });
  if (!BOKEH_CU) {
    bk.materialBokeh.defines.DEPTH_PACKING = 0; bk.renderTargetDepth.dispose();
    bk.setSize = function (w, h) { this.materialBokeh.uniforms.aspect.value = w / h; };
    bk.render = function (rd, ghi, doc) {   // doc = bộ đệm vừa vẽ cảnh (màu + độ sâu)
      this.uniforms.tColor.value = doc.texture; this.uniforms.tDepth.value = doc.depthTexture;
      this.uniforms.nearClip.value = this.camera.near; this.uniforms.farClip.value = this.camera.far;
      if (this.renderToScreen) rd.setRenderTarget(null); else { rd.setRenderTarget(ghi); rd.clear(); }
      this.fsQuad.render(rd);
    };
  }
  comp.addPass(bk); }

comp.addPass(new OutputPass());

comp.addPass(new ShaderPass({ uniforms: { tDiffuse: { value: null }, uT: { value: 1.7 } },

  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',

  fragmentShader: `uniform sampler2D tDiffuse; uniform float uT; varying vec2 vUv;

    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }

    void main(){ vec2 d = vUv - .5; float r2 = dot(d,d);

      vec3 c; c.r = texture2D(tDiffuse, vUv + d * r2 * .012).r; c.g = texture2D(tDiffuse, vUv).g; c.b = texture2D(tDiffuse, vUv - d * r2 * .012).b;

      float l = dot(c, vec3(.299,.587,.114));

      c = mix(vec3(l), c, .88);                                  // bớt bão hoà một chút

      c = c * vec3(1.02, .97, 1.0) + vec3(.012, .0, .02) * (1. - l); // bóng tối ngả tím, sáng ngả ấm

      c = pow(c, vec3(1.08));                                    // tương phản kiểu phim

      c *= 1. - smoothstep(.18, .75, r2 * 1.6) * .55;            // tối góc

      c += (h(vUv * 900. + uT) - .5) * .045;                     // hạt phim

      gl_FragColor = vec4(c, 1.); }` }));

// tối ưu tải 10/11: lần vẽ đầu từng chặn trang ~21 s (dịch shader của mọi vật liệu + đẩy ảnh lên GPU, đồng bộ). Dịch shader song song trước (KHR_parallel_shader_compile), đẩy ảnh từng cái nhường khung
{ const rt0 = renderer.getRenderTarget(); renderer.setRenderTarget(comp.readBuffer);   // dịch đúng biến thể shader mà composer dùng (vẽ vào render target: không tone mapping, màu tuyến tính)
  await renderer.compileAsync(scene, cam).catch(e => console.warn(e)); renderer.setRenderTarget(rt0); window.__soShaderTruoc = renderer.info.programs.map(x => x.cacheKey); }
{ const ds = new Set(); scene.traverse(o => { if (o.isMesh) [].concat(o.material).forEach(m => { for (const k in m) { const v = m[k]; if (v && v.isTexture) ds.add(v); } }); });
  let i = 0; for (const t of ds) { renderer.initTexture(t); if (++i % 4 === 0) await new Promise(r => setTimeout(r, 0)); } }
comp.render();

let tr = performance.now();

let tNao = 0, trN = performance.now();

(function chay(now) { const dtr = Math.min(.05, (now - trN) / 1000); trN = now;

  if (window.__trongNao && window.__buocT) {

    // anh 10/11: bỏ tự trôi (làm khó cuộn ngược, không về được phòng)
    if (false) { const q0 = window.__qNao || 0; if (q0 < .999) window.__qDichCong && window.__qDichCong(dtr * (q0 < .8 ? .026 : q0 < .87 ? .011 : .02)); }   // anh 09/11: để nguyên cũng tự chạy qua still awake → glitch → lửa cháy          // đứng yên vẫn trôi tới rất chậm

    const qq = window.__qNao || 0, dich = Math.min(7.85, qq / .82 * 7.85), moi = tNao + (dich - tNao) * .12;   // q 0→.82: đi bộ; .82→: đứng hình + tan

    const dt = qq >= .82 ? 0 : Math.max(moi - tNao, 0) + dtr * .35; tNao = moi; window.__buocT(tNao, dt); window.__naoKet && window.__naoKet(qq, dtr);

    const k = (performance.now() - (window.__tVaoNao || 0)) / 1100;                                  // vừa vào: rung + lệch màu ngắn

    const cv = renderer.domElement;

    const vt = document.getElementById('veToi'); if (vt) { const on = (window.__qNao || 0) > .04 && (window.__qNao || 0) < .22; vt.classList.toggle('hien', on); document.getElementById('naoHud').classList.toggle('coChu', on); }   // đoạn giới thiệu hiện ở đầu, tắt khi đi sâu

    if (k < 1) { const tt = k * 1.1, f = Math.exp(-tt * 6) + (tt > .17 ? .6 * Math.exp(-(tt - .17) * 8) : 0);   // FLASH LIGHT: chớp 2 nhịp
      const e = 1 - Math.pow(1 - Math.min(1, k / .55), 3);
      cv.style.clipPath = `circle(${4 + 140 * e}% at 50% 50%)`; cv.style.transform = `rotate(${-16 * (1 - e)}deg) scale(${1.35 - .35 * e + .035 * f})`; cv.style.filter = `brightness(${1 + 5.5 * f}) saturate(${Math.max(0, 1 - .9 * f)}) contrast(${1 + .6 * f})`; }

    else if (cv.style.transform) { cv.style.transform = ''; cv.style.filter = ''; cv.style.clipPath = ''; }

  }

  requestAnimationFrame(chay); })(trN);



// ===== chế độ quay video demo: mỗi lần gọi __buoc(i) là 1 khung (24 khung/giây), máy quay đi bộ tiến vào =====

{ const CAM0 = cam.position.clone(), NHIN0 = new THREE.Vector3(); cam.getWorldDirection(NHIN0);

  const G0 = {}; for (const k of ['__NVZ', '__CA', '__XE', '__WD', '__BZ', '__LF']) if (window[k]) G0[k] = window[k].nhom.position.clone();

  const O = k => window[k] && window[k].nhom;

  window.__buoc = (i, fps = 24) => window.__buocT(i / fps, 1 / fps);

  window.__buocT = (t, dt) => {

    capMau(dt); MIXERS.forEach(m => m.update(dt));

    const di = t < 1.2 ? 1.35 * t * t / 2.4 : 1.35 * (t - .6); const p = CAM0.clone(); p.z -= di; p.x += Math.sin(t * .6) * .25;

    const yDich = CAM0.y + (caoMuot(p.x, p.z) - caoMuot(CAM0.x, CAM0.z)) * .3; window.__yCam = window.__yCam === undefined ? yDich : window.__yCam + (yDich - window.__yCam) * .12; p.y = window.__yCam;          // đi êm, không nhún

    cam.position.copy(p); const nhin = p.clone().addScaledVector(NHIN0, 30); nhin.x += Math.sin(t * .35) * 1.2; cam.lookAt(nhin); cam.rotateY(window.__nhinYaw || 0); cam.rotateX(window.__nhinPitch || 0);

    if (O('__NVZ')) { const n = O('__NVZ'); n.position.z = G0.__NVZ.z - (t < .8 ? 3.2 * t * t / 1.6 : 3.2 * (t - .4)); const yy = caoMuot(n.position.x, n.position.z); n.userData.y = n.userData.y === undefined ? yy : n.userData.y + (yy - n.userData.y) * .2; n.position.y = n.userData.y; }

    if (O('__CA')) { const n = O('__CA'); n.position.x = G0.__CA.x - t * 1.8; n.position.y = G0.__CA.y + Math.sin(t * 1.3) * .6; }

    if (O('__XE')) { const n = O('__XE'); n.position.x = G0.__XE.x + t * 2.6; n.position.z = G0.__XE.z - t * .8; n.position.y = G0.__XE.y + Math.sin(t * 1.7) * .35; }

    if (O('__WD')) { const n = O('__WD'); n.position.x = G0.__WD.x + t * 1.2; n.position.y = G0.__WD.y + Math.sin(t * 2) * .4; }

    if (O('__BZ')) { const n = O('__BZ'); n.position.x = G0.__BZ.x - t; n.position.y = G0.__BZ.y + Math.cos(t * 1.8) * .4; }

    if (O('__LF')) O('__LF').position.y = G0.__LF.y + Math.abs(Math.sin(t * 2.2)) * 1.2;

    if (MAT_CAU) { MAT_CAU.rotation.y = Math.sin(t * .9) * .38 + Math.sin(t * 2.7) * .04; MAT_CAU.rotation.x = Math.sin(t * .55) * .1; }

    if (window.__THEM) window.__THEM(t, dt);

    comp.render();

  }; }

window.__xong = true; window.__naoSan = true; window.__naoTien = 1;
// tối ưu 13/11: 3 mô hình tải muộn (giun, UFO, máy bay) trước đây đợi tới khung hình đầu tiên trong não mới dịch shader (7 shader, dịch đồng bộ) → trang đứng ~1,4 s đúng lúc vừa vào cảnh.
//   Nay tải xong là dịch song song ngay (không chặn trang, giống lần dịch đầu) rồi đẩy ảnh lên GPU từng cái.
Promise.allSettled(MUON_MH.map(f => f().catch(e => console.error(e)))).then(async () => {
  if (renderer.getContext().isContextLost()) return;
  const rt0 = renderer.getRenderTarget(); renderer.setRenderTarget(comp.readBuffer);
  const hua = renderer.compileAsync(scene, cam); renderer.setRenderTarget(rt0);   // chỉ cần đặt đích lúc TẠO shader; phần chờ dịch xong chạy nền (vòng vẽ có thể đang chạy)
  await hua.catch(e => console.warn(e));
  const ds = new Set(); scene.traverse(o => { if (o.isMesh) [].concat(o.material).forEach(m => { for (const k in m) { const v = m[k]; if (v && v.isTexture) ds.add(v); } }); });
  let i = 0; for (const t of ds) { if (renderer.getContext().isContextLost()) return; renderer.initTexture(t); if (++i % 4 === 0) await new Promise(r => setTimeout(r, 0)); }
});


// ===== KẾT SCENE 2 (anh 09/11): Blob Tracking → đứng hình "still awake." → tan bụi kiểu Thanos; + giữ chuột xoay nhìn =====
{ const tan = document.createElement('canvas'); tan.id = 'naoTan';
  tan.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:13;pointer-events:none;display:none';
  document.body.appendChild(tan); const tg = tan.getContext('2d');
  const hint = document.createElement('div'); hint.id = 'naoHint';
  hint.style.cssText = 'position:fixed;left:0;right:0;bottom:18%;z-index:14;text-align:center;font:500 12px/1.4 "IBM Plex Mono",monospace;letter-spacing:.16em;color:rgba(255,233,240,.6);opacity:0;transition:opacity .6s;pointer-events:none';
  hint.textContent = 'NEXT · PROJECTS ↓'; document.body.appendChild(hint);
  let W = 0, H = 0, DPR = 1;
  const doCo = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; tan.width = W * DPR; tan.height = H * DPR; tg.setTransform(DPR, 0, 0, DPR, 0, 0); anh = null; };
  let anh = null, hat = null, snap = null, buf = null, bufD = null;
  addEventListener('resize', doCo); doCo();
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // --- Blob Tracking: khung mảnh bám vật + nhãn hài, nối dây giữa các khung ---
  const DS = [['__NVZ', 'ZEBRA', 'running late'], ['__CA', 'SHARK', 'swimming in air'], ['__XE', 'SANTA', "it's november"], ['__GZ', 'PROBLEM_01', 'big'], ['__KG', 'PROBLEM_02', 'bigger'],
    ['__XUONG', 'ME', 'after 3 coffees'], ['__THUYEN', 'GOING MERRY', 'stranded'], ['__PORSCHE', 'PORSCHE 911', 'someday']];
  const B = new THREE.Box3(), V = new THREE.Vector3(), goc = [...Array(8)].map(() => new THREE.Vector3());
  function khung(o) { B.setFromObject(o); if (B.isEmpty()) return null; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, truoc = 0;
    for (let i = 0; i < 8; i++) { V.set(i & 1 ? B.max.x : B.min.x, i & 2 ? B.max.y : B.min.y, i & 4 ? B.max.z : B.min.z).project(cam); if (V.z < 1) truoc++;
      const x = (V.x + 1) / 2 * W, y = (1 - V.y) / 2 * H; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    if (truoc < 8 || x1 < 0 || y1 < 0 || x0 > W || y0 > H || x1 - x0 < 18 || x1 - x0 > W * .7) return null; return [x0, y0, x1, y1]; }
  function veBlob(muc, t) {
    const hop = []; tg.lineWidth = 1; tg.font = '500 11px "IBM Plex Mono", monospace';
    for (const [k, ten, mo] of DS) { const r = window[k]; if (!r || !r.nhom) continue; const b = khung(r.nhom); if (!b) continue; hop.push(b);
      const [x0, y0, x1, y1] = b, a = muc;
      tg.strokeStyle = `rgba(255,255,255,${.55 * a})`; tg.strokeRect(x0, y0, x1 - x0, y1 - y0);
      tg.strokeStyle = `rgba(255,255,255,${.95 * a})`; const c = 8; tg.beginPath();
      for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { tg.moveTo(x, y + dy * c); tg.lineTo(x, y); tg.lineTo(x + dx * c, y); } tg.stroke();
      const pt = (88 + Math.floor((Math.sin(t * 3 + x0) * .5 + .5) * 11)) + '%', nhan = `${ten} · ${mo}`, w = tg.measureText(nhan).width + tg.measureText(pt).width + 22;
      tg.fillStyle = `rgba(255,77,94,${.92 * a})`; tg.fillRect(x0, y0 - 18, tg.measureText(pt).width + 8, 16);
      tg.fillStyle = `rgba(6,12,18,${.75 * a})`; tg.fillRect(x0 + tg.measureText(pt).width + 8, y0 - 18, w - tg.measureText(pt).width - 8, 16);
      tg.fillStyle = `rgba(255,255,255,${a})`; tg.fillText(pt, x0 + 4, y0 - 6); tg.fillText(nhan, x0 + tg.measureText(pt).width + 14, y0 - 6); }
    tg.strokeStyle = `rgba(255,255,255,${.22 * muc})`; tg.beginPath();
    for (let i = 1; i < hop.length; i++) { const a = hop[i - 1], b = hop[i]; tg.moveTo((a[0] + a[2]) / 2, (a[1] + a[3]) / 2); tg.lineTo((b[0] + b[2]) / 2, (b[1] + b[3]) / 2); } tg.stroke();
  }
  // --- chữ "still awake." + con trỏ ---
  function veStill(g, nhay) { const co = Math.min(W * .13, 150); g.font = `400 ${co}px VT323, "IBM Plex Mono", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(255,77,94,.7)'; g.shadowBlur = 26; g.fillStyle = '#fff4f8'; g.fillText('still awake.', W / 2, H / 2); g.shadowBlur = 0;
    const w = g.measureText('still awake.').width; if (nhay) { g.fillStyle = '#ff4d5e'; g.fillRect(W / 2 + w / 2 + 8, H / 2 - co * .3, co * .3, co * .58); } g.textAlign = 'start'; g.textBaseline = 'alphabetic'; }
  // --- GLITCH chuyển màn: xé ngang thành dải, lệch dải, tách màu đỏ/xanh, vạch nhiễu ---
  function veGlitch(g, m, t) { const src = renderer.domElement, k = src.height / H, nhip = Math.floor(t * 18); let y = 0;
    while (y < H) { const r = hash(y * .37 + nhip * 1.3), cao_ = 3 + r * 42;
      if (r < .55 * m) { const dx = (hash(y * 1.7 + nhip * 3.1) - .5) * 150 * m; g.drawImage(src, 0, y * k, src.width, cao_ * k, dx, y, W, cao_);
        if (r < .2 * m) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .7; g.filter = hash(y + nhip) > .5 ? 'sepia(1) saturate(8) hue-rotate(-40deg)' : 'sepia(1) saturate(8) hue-rotate(140deg)'; g.drawImage(src, 0, y * k, src.width, cao_ * k, dx + 14 * m, y, W, cao_); g.restore(); } }
      y += cao_; }
    for (let i = 0; i < 9 * m; i++) { g.fillStyle = hash(i + nhip) > .5 ? `rgba(255,77,94,${.55 * m})` : `rgba(120,255,240,${.45 * m})`; g.fillRect(0, hash(i * 7.3 + nhip) * H, W, 1 + hash(i * 3.1) * 4); }
    if (hash(nhip * .7) < .35 * m) { g.fillStyle = `rgba(255,255,255,${.12 * m})`; g.fillRect(0, 0, W, H); } }
  // --- chụp khung đứng hình rồi tạo hạt bụi ---
  function chup() {
    snap = document.createElement('canvas'); snap.width = W; snap.height = H; const sg = snap.getContext('2d');
    sg.drawImage(renderer.domElement, 0, 0, W, H); sg.fillStyle = 'rgba(0,0,0,.35)'; sg.fillRect(0, 0, W, H); veStillVao(sg);
    const d = sg.getImageData(0, 0, W, H).data, buoc = W * H > 1.2e6 ? 4 : 3; hat = [];
    for (let y = 0; y < H; y += buoc) for (let x = 0; x < W; x += buoc) { const i = (y * W + x) * 4, hang = (y / 6) | 0;
      hat.push({ x, y, r: d[i], g: d[i + 1], b: d[i + 2], tre: .85 * x / W + .12 * hash(hang), vx: 80 + Math.random() * 260, vy: -30 - Math.random() * 160, xo: Math.random() * 6.28, bien: 8 + Math.random() * 36 }); }
    buf = document.createElement('canvas'); buf.width = W; buf.height = H; bufD = buf.getContext('2d').createImageData(W, H);
  }
  function veStillVao(g) { const l = DPR; veStill(g, true); }
  function veTan(k) {
    tg.fillStyle = '#020406'; tg.fillRect(0, 0, W, H);
    const mat = k * 1.75;
    tg.save(); tg.beginPath(); for (let r = 0; r * 6 < H; r++) { const bien = (mat - .12 * hash(r)) / .85 * W; if (bien < W) tg.rect(Math.max(0, bien), r * 6, W, 6); } tg.clip(); tg.drawImage(snap, 0, 0, W, H); tg.restore();
    const px = bufD.data; px.fill(0);
    for (const h of hat) { const a = mat - h.tre; if (a <= 0) continue;
      const x = (h.x + h.vx * a + Math.sin(a * 4 + h.xo) * h.bien * a) | 0, y = (h.y + h.vy * a - 80 * a * a + Math.cos(a * 3 + h.xo) * h.bien * .5 * a) | 0;
      if (x < 0 || y < 0 || x >= W || y >= H) continue; const al = 1 - ss(.15, .8, a), tro = ss(0, .3, a), i = (y * W + x) * 4;
      const R_ = h.r + (120 - h.r) * tro, G_ = h.g + (106 - h.g) * tro, B_ = h.b + (98 - h.b) * tro, A_ = 255 * al; for (const o of [0, 4, W * 4, W * 4 + 4]) { const j = i + o; if (j + 3 < px.length) { px[j] = R_ * 1.25; px[j + 1] = G_ * 1.25; px[j + 2] = B_ * 1.25; px[j + 3] = A_; } } }
    buf.getContext('2d').putImageData(bufD, 0, 0); tg.drawImage(buf, 0, 0, W, H);
  }
  // --- gọi mỗi khung từ vòng chạy của não ---
  window.__naoKet = (qq, dtr) => {
    window.__amKet && window.__amKet(qq, dtr);
    if (qq < .86) { const tt = performance.now() / 1000; for (const sp of CHU) { const u = sp.userData; if (!u.lech) { u.lech = new THREE.Vector3(); u.pha = Math.random() * 6.28; u.bien = .25 + Math.random() * .35; }
      sp.position.sub(u.lech); u.lech.set(Math.sin(tt * .23 + u.pha) * u.bien, Math.sin(tt * .31 + u.pha * 1.7) * u.bien * .7, Math.cos(tt * .19 + u.pha) * u.bien * .5); sp.position.add(u.lech); } }
    const hud = document.getElementById('naoHud');
    if (!window.__trongNao) { tan.style.display = 'none'; hint.style.opacity = 0; return; }
    tan.style.display = 'block'; tg.clearRect(0, 0, W, H);
    const t = performance.now() / 1000;
    if (qq < .82) { window.__tanVat && window.__tanVat(0); if (hud) hud.style.visibility = ''; const muc = ss(.26, .34, qq) * (1 - ss(.74, .82, qq)); if (muc > .01) veBlob(muc, t); hint.style.opacity = 0; return; }
    if (hud) hud.style.visibility = 'hidden';
    // .82 → .86 đứng hình + "still awake."; .86 → .97 từng vật tan thành hạt (xa trước, gần sau); .97 → 1 mặt não + trời tối hẳn
    // .82→.86 đứng hình "still awake." · .86→.93 từng vật tan thành hạt (xa trước) · .90→.95 hạt cuộn thành xoáy, não tối dần
    // .945→.975 DATAMOSH · .955→.995 xoáy bung ra thành hành lang bảo tàng (scene Projects)
    // anh 09/11: .82→.875 đứng hình "still awake." · .85→.885 GLITCH · .875 chụp khung não làm "tờ giấy" · .88→.975 LỬA CHÁY từ dưới lên, cháy thủng lộ hành lang bảo tàng
    const daChay = qq >= .875;
    if (daChay && !window.__luaCo) { const sn = document.createElement('canvas'), r = Math.min(devicePixelRatio || 1, 1.5); sn.width = W * r; sn.height = H * r; const sg = sn.getContext('2d');
      sg.drawImage(renderer.domElement, 0, 0, sn.width, sn.height); sg.setTransform(r, 0, 0, r, 0, 0); sg.fillStyle = 'rgba(0,0,0,.3)'; sg.fillRect(0, 0, W, H); veStill(sg, true);
      window.__luaTao && window.__luaTao(sn); window.__luaCo = true; }
    if (!daChay) window.__luaCo = false;
    window.__xoay && window.__xoay(0, 0, 1, daChay);   // anh 09/11: bỏ hạt, lửa cháy xong là màn đen
    window.__lua && window.__lua(daChay ? Math.min(1, Math.max(0, (qq - .88) / .112)) : -1);   // lửa cháy chậm, đều theo cuộn
    if (!daChay) { tg.globalAlpha = 1; tg.fillStyle = `rgba(0,0,0,${.3 * ss(.82, .85, qq)})`; tg.fillRect(0, 0, W, H); veStill(tg, ((t * 2) | 0) % 2 === 0); }
    const mg = ss(.85, .868, qq) * (1 - ss(.874, .89, qq)); if (mg > .01) veGlitch(tg, mg, t);
    hint.style.opacity = ss(.99, .999, qq);
  };

  // --- giữ chuột kéo để xoay nhìn quanh (giữ góc; cuộn tiếp thì từ từ quay về) ---
  let keo = null; window.__nhinYaw = 0; window.__nhinPitch = 0;
  // nút nghe lại "I Like You" (góc dưới phải, trên nút Sound)
  { const n = document.createElement('button'); n.type = 'button'; n.id = 'naoNhac';
    n.innerHTML = '<span class="vg" aria-hidden="true">↺</span><b>I Like You</b><i>Post Malone</i>'; n.setAttribute('aria-label', 'Play I Like You by Post Malone again');   // 13/11 anh: gọn hơn
   // phương án B: điện thoại chữ ngắn, vừa 1 hàng với nút tiếng
    n.style.cssText = 'position:fixed;right:max(40px,env(safe-area-inset-right,0px));bottom:calc(64px + env(safe-area-inset-bottom,0px));z-index:15;font:500 12px/1 "IBM Plex Mono",monospace;letter-spacing:.06em;color:#fff4f8;background:rgba(6,14,20,.55);border:1px solid rgba(255,233,240,.25);padding:9px 12px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .4s;backdrop-filter:blur(4px)';
    if (false && innerWidth < 700) Object.assign(n.style, { right: '16px', bottom: 'auto', top: 'calc(96px + env(safe-area-inset-top,0px))', fontSize: '11px', padding: '7px 10px' });   // phương án B: vị trí do khung.mjs đặt (cùng hàng nút tiếng)   // điện thoại: lên góc phải trên, không đè đoạn giới thiệu
    n.addEventListener('pointerdown', e => e.stopPropagation()); n.addEventListener('click', e => { e.stopPropagation(); window.__phatLaiILikeYou && window.__phatLaiILikeYou(); });
    n.addEventListener('focus', () => n.style.outline = '1px solid #fff'); n.addEventListener('blur', () => n.style.outline = '');
    document.body.appendChild(n);
    setInterval(() => { const on = !!window.__trongNao && (window.__qNao || 0) < .82; n.style.opacity = on ? 1 : 0; n.style.pointerEvents = on ? 'auto' : 'none'; }, 200); }
  addEventListener('pointerdown', e => { if (!window.__trongNao) return; keo = [e.clientX, e.clientY, window.__nhinYaw, window.__nhinPitch]; document.body.style.cursor = 'grabbing'; });
  addEventListener('pointermove', e => { if (!keo || !window.__trongNao) return;
    if (e.pointerType === 'touch') { if (window.__khoaTruc === 'ngang') window.__nhinYaw = keo[2] - (e.clientX - keo[0]) * .004; return; }   // điện thoại: chỉ vuốt ngang mới xoay, vuốt dọc để cuộn
    window.__nhinYaw = keo[2] - (e.clientX - keo[0]) * .004; window.__nhinPitch = Math.max(-.6, Math.min(.5, keo[3] - (e.clientY - keo[1]) * .003)); });
  addEventListener('pointerup', () => { keo = null; document.body.style.cursor = window.__trongNao ? 'grab' : ''; });
  let qTruoc = 0; setInterval(() => { const q = window.__qNao || 0; if (!keo && Math.abs(q - qTruoc) > .0005) { window.__nhinYaw *= .9; window.__nhinPitch *= .9; } qTruoc = q; }, 50);
}

// ===== TAN TỪNG VẬT 3D (anh 09/11: "tan từng object một như igloo") =====
// Mỗi vật vỡ thành hạt lấy từ chính đỉnh hình + màu của vật, bay lên xoáy rồi tắt; tan từ xa vào gần; chạy theo cuộn (cuộn ngược thì ghép lại).
{ const VAT = []; let daTao = false;
  const texHat = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const vs = `attribute vec3 aVan; attribute float aTre; attribute vec3 aMau; uniform float uTuoi; uniform float uCo; varying float vA; varying vec3 vMau;
    void main(){ float a = max(uTuoi - aTre, 0.); vec3 p = position + aVan * a + vec3(sin(a * 3. + position.y) * .6, a * a * 1.6, cos(a * 2.6 + position.x) * .6) * a;
      vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
      float song = a > 0. ? 1. - smoothstep(.0, 1.7, a) : 1.; vA = song * step(0.0001, uTuoi + 1.) * (uTuoi > aTre ? 1. : 0.);
      vMau = aMau * (1.4 - .6 * smoothstep(0., 1.2, a)) + vec3(.35, .1, .15) * (1. - smoothstep(0., .4, a));
      gl_PointSize = uCo * (1. - .6 * smoothstep(0., 1.7, a)) * (300. / -mv.z); }`;
  const fs = `uniform sampler2D uTex; varying float vA; varying vec3 vMau; void main(){ vec4 t = texture2D(uTex, gl_PointCoord); if (vA * t.a < .01) discard; gl_FragColor = vec4(vMau, vA * t.a); }`;
  const V = new THREE.Vector3(), C = new THREE.Color(), tam = new THREE.Vector3(), hop = new THREE.Box3();
  function taoHat(goc, toiDa) {
    goc.updateMatrixWorld(true); const ds = [];
    goc.traverse(m => { if ((m.isMesh || m.isSkinnedMesh) && m.visible !== false && m.geometry && m.geometry.attributes.position) ds.push(m); });
    if (!ds.length) return null;
    let tong = 0; for (const m of ds) tong += m.geometry.attributes.position.count;
    const buoc = Math.max(1, Math.floor(tong / toiDa)), P = [], VA = [], TR = [], MA = [];
    hop.setFromObject(goc); hop.getCenter(tam);
    for (const m of ds) { const pos = m.geometry.attributes.position, mt = [].concat(m.material)[0] || {};
      C.copy(mt.color || new THREE.Color(1, 1, 1)); if (mt.emissive) C.add(mt.emissive.clone().multiplyScalar(mt.emissiveIntensity || 0)); C.lerp(new THREE.Color(1, .75, .82), .35);
      for (let i = 0; i < pos.count; i += buoc) { V.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); P.push(V.x, V.y, V.z);
        const d = V.clone().sub(tam).normalize(); VA.push(d.x * (.8 + Math.random() * 1.4), Math.random() * 1.2, d.z * (.8 + Math.random() * 1.4));
        TR.push(Math.random() * .35 + Math.max(0, (V.y - hop.min.y) / Math.max(.01, hop.max.y - hop.min.y)) * .25);   // tan từ chân lên
        MA.push(C.r, C.g, C.b); if (Math.random() < .3) (window.__POOL = window.__POOL || []).push(V.x, V.y, V.z, C.r, C.g, C.b); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('aVan', new THREE.Float32BufferAttribute(VA, 3));
    g.setAttribute('aTre', new THREE.Float32BufferAttribute(TR, 1)); g.setAttribute('aMau', new THREE.Float32BufferAttribute(MA, 3));
    const kich = hop.getSize(new THREE.Vector3()).length();
    const mat = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTuoi: { value: -1 }, uCo: { value: Math.min(.55, .12 + kich * .012) }, uTex: { value: texHat } } });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
    return { pts, mat, kc: tam.distanceTo(cam.position) };
  }
  function taoTatCa() {
    daTao = true; const bo = new Set();
    const ung = [];
    for (const o of scene.children) {
      if (o.isLight || o.isCamera || o.isPoints || o === troi) continue;
      if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters && o.geometry.parameters.width >= 100) continue;   // mặt não: tắt dần riêng
      if (o.isInstancedMesh) { ung.push({ o, sprite: true, kc: 0 }); continue; }                                                             // máu: mờ dần
      if (o.isSprite) { o.updateMatrixWorld(); ung.push({ o, sprite: true, kc: o.position.distanceTo(cam.position), y0: o.position.y, mo: o.material.opacity }); continue; }
      if (!o.visible) continue;
      const h = taoHat(o, o.children.length > 3 ? 2600 : 1400); if (!h) continue; ung.push({ o, ...h });
    }
    for (const u of ung) u.v0 = u.o.visible; ung.sort((a, b) => b.kc - a.kc); ung.forEach((u, i) => { u.bat = i / Math.max(1, ung.length - 1); }); VAT.push(...ung);
  }
  // k: 0 → 1 (tiến độ tan cả cảnh). Mỗi vật bắt đầu ở bat * .8, tan trong .2 tiếp theo.
  window.__tanVat = k => {
    if (k <= 0) { if (daTao) for (const u of VAT) { u.o.visible = u.v0; if (u.sprite && u.o.isSprite) { u.o.position.y -= u.dy || 0; u.dy = 0; u.o.material.opacity = u.mo; } if (u.pts) u.pts.visible = false; } return; }
    if (!daTao) taoTatCa();
    for (const u of VAT) { const a = (k - u.bat * .8) / .2;   // a < 0: chưa tới lượt; 0 → 1: đang tan
      if (u.sprite) { if (u.o.isSprite) { const s = Math.min(1, Math.max(0, a)); u.o.material.opacity = u.mo * (1 - s); const dy = s * s * 4; u.o.position.y += dy - (u.dy || 0); u.dy = dy; u.o.visible = u.v0 && s < 1; } else { u.o.visible = u.v0 && a < .6; } continue; }
      u.pts.visible = a > -.05; u.mat.uniforms.uTuoi.value = a * 2.2; u.o.visible = u.v0 && a < .12; }
  };
}

// ===== CHUYỂN CẢNH SANG PROJECTS (anh 09/11, cách A): hạt của các vật cuộn vào nhau thành xoáy, rồi bung ra thành hành lang bảo tàng =====
// Hạt chỉ là cách chuyển cảnh; scene Projects (bảo tàng ngược) sẽ dựng thật sau, hành lang hạt này là khung hình đầu của nó.
{ const NHO = matchMedia('(max-width: 700px)').matches, N = NHO ? 7000 : 15000;
  let XO = null, hop = null;
  // màn tối che mặt não + trời (nằm trong WebGL để hạt vẫn vẽ đè lên)
  const man = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 16), new THREE.MeshBasicMaterial({ color: 0x030308, side: THREE.BackSide, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }));
  man.renderOrder = 998; man.frustumCulled = false; man.visible = false; scene.add(man);

  // điểm đích: hành lang bảo tàng nhìn từ chỗ đứng (toạ độ theo máy quay: nhìn về -z, y lên trên)
  function diemDich() {
    const D = [], M = [], them = (x, y, z, r, g, b) => { D.push(x, y, z); M.push(r, g, b); };
    const SAN = -1.7, TRAN = 2.4, TUONG = 3.4, Z0 = -3.5, Z1 = -40;
    const nLine = N * .16 | 0, nKhung = N * .5 | 0, nChu = N - nLine - nKhung;
    for (let i = 0; i < nLine; i++) { const z = Z0 + (Z1 - Z0) * Math.pow(Math.random(), .8), c = i % 4, x = c & 1 ? TUONG : -TUONG, y = c & 2 ? TRAN : SAN;
      them(x, y, z, .55, .28, .42); }
    // khung tranh 2 bên tường + 1 khung cuối hành lang ("where it started")
    const KH = []; for (let j = 0; j < 6; j++) { const z = -6.5 - j * 5.4; KH.push([-TUONG + .02, z, 1], [TUONG - .02, z - 2.7, -1]); }
    const chuVi = (w, h) => { let u = Math.random() * 2 * (w + h); if (u < w) return [u - w / 2, -h / 2]; u -= w; if (u < h) return [w / 2, u - h / 2]; u -= h; if (u < w) return [w / 2 - u, h / 2]; u -= w; return [-w / 2, h / 2 - u]; };
    for (let i = 0; i < nKhung; i++) {
      const cuoi = i < nKhung * .1; let x, y, z; const lop = Math.random();
      if (cuoi) { const [a, b] = lop < .75 ? chuVi(2.2, 1.6) : chuVi(2.5, 1.9); x = a; y = .35 + b; z = Z1 + 2; }
      else { const [xt, zt] = KH[i % KH.length]; let a, b;
        if (lop < .55) [a, b] = chuVi(3, 2); else if (lop < .8) [a, b] = chuVi(3.25, 2.25);
        else if (lop < .9) { a = (Math.random() - .5) * .9; b = -1.45 - Math.random() * .06; }             // biển tên dưới tranh
        else { a = (Math.random() - .5) * 2.9; b = (Math.random() - .5) * 1.9; }                            // bóng ảnh mờ trong khung
        x = xt; y = .35 + b; z = zt + a; }
      const mo = lop >= .9 && !cuoi ? .35 : 1; them(x, y, z, 1 * mo, .9 * mo, .82 * mo); }
    // chữ PROJECTS + dòng phụ, lấy mẫu từ canvas
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 150px "IBM Plex Mono", monospace'; g.fillText('PROJECTS', 512, 100);
    g.font = '500 44px "IBM Plex Mono", monospace'; g.fillText('2026  →  where it started', 512, 215);
    const d = g.getImageData(0, 0, 1024, 256).data, o = []; for (let y = 0; y < 256; y += 2) for (let x = 0; x < 1024; x += 2) if (d[(y * 1024 + x) * 4 + 3] > 128) o.push(x, y);
    for (let i = 0; i < nChu; i++) { const k = (Math.random() * o.length / 2 | 0) * 2; them((o[k] - 512) / 1024 * 5.2, .95 - (o[k + 1] - 128) / 256 * 1.3, -8.5 + (Math.random() - .5) * .05, 1, .97, .95); }
    return [D, M];
  }

  const vs = `attribute vec3 aA; attribute vec3 aB; attribute vec3 aMau; attribute vec3 aMau2; attribute float aR;
    uniform float uG; uniform float uX; uniform float uT; uniform float uCo; varying vec3 vMau; varying float vA;
    void main(){
      float g = smoothstep(0., 1., clamp(uG * 1.35 - aR * .35, 0., 1.));
      float ang = aR * 628.3 + uT * (1.2 + aR * 1.6) + g * 5.;
      float rad = .25 + pow(aR, .7) * 2.6;
      vec3 xoay = vec3(cos(ang) * rad, .3 + sin(ang) * rad * .62, -7. + sin(ang * 3. + aR * 9.) * .5);
      vec3 p = mix(aA, xoay, g);
      float x = smoothstep(0., 1., clamp(uX * 1.5 - fract(aR * 7.31) * .5, 0., 1.));
      p = mix(p, aB, x);
      p += vec3(sin(uT * 2. + aR * 40.), cos(uT * 1.7 + aR * 30.), sin(uT * 1.3 + aR * 20.)) * .06 * (1. - x);
      vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
      vMau = mix(aMau * 1.2, aMau2, x) * (1. + .8 * g * (1. - x));
      vA = min(1., uG * 5.) * (.55 + .25 * x);
      gl_PointSize = clamp(uCo * (1. + .8 * g * (1. - x)) * 300. / -mv.z, 1., 9.); }`;
  const fs = `varying vec3 vMau; varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = dot(q, q); if (d > .25) discard; gl_FragColor = vec4(vMau, vA * (1. - d * 4.)); }`;

  function tao() {
    hop = new THREE.Object3D(); cam.updateMatrixWorld(true); hop.matrixAutoUpdate = false; hop.matrix.copy(cam.matrixWorld); hop.matrixWorld.copy(cam.matrixWorld);
    const nguoc = cam.matrixWorld.clone().invert(), P = window.__POOL || [], nP = P.length / 6 | 0, V = new THREE.Vector3();
    const A = new Float32Array(N * 3), MA = new Float32Array(N * 3), R = new Float32Array(N); const [B, MB] = diemDich();
    // xáo đích để hạt từ mọi vật bay về mọi chỗ (cuộn vào nhau)
    const thu = [...Array(N).keys()]; for (let i = N - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [thu[i], thu[j]] = [thu[j], thu[i]]; }
    const B2 = new Float32Array(N * 3), MB2 = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const t = thu[i]; B2.set(B.slice(t * 3, t * 3 + 3), i * 3); MB2.set(MB.slice(t * 3, t * 3 + 3), i * 3);
      if (nP) { const k = (Math.random() * nP | 0) * 6; V.set(P[k], P[k + 1], P[k + 2]).applyMatrix4(nguoc); MA.set([P[k + 3], P[k + 4], P[k + 5]], i * 3); }
      else { V.set((Math.random() - .5) * 30, (Math.random() - .5) * 10, -5 - Math.random() * 40); MA.set([1, .55, .7], i * 3); }
      A.set([V.x, V.y, V.z], i * 3); R[i] = Math.random(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(A, 3)); g.setAttribute('aA', new THREE.Float32BufferAttribute(A, 3));
    g.setAttribute('aB', new THREE.Float32BufferAttribute(B2, 3)); g.setAttribute('aMau', new THREE.Float32BufferAttribute(MA, 3)); g.setAttribute('aMau2', new THREE.Float32BufferAttribute(MB2, 3)); g.setAttribute('aR', new THREE.Float32BufferAttribute(R, 1));
    const mat = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uG: { value: 0 }, uX: { value: 0 }, uT: { value: 0 }, uCo: { value: NHO ? .07 : .05 } } });
    XO = new THREE.Points(g, mat); XO.frustumCulled = false; XO.renderOrder = 999; hop.add(XO); scene.add(hop);
  }
  // kG: gom thành xoáy · kX: bung thành hành lang · kToi: che não · bat: đang ở đoạn này
  window.__xoay = (kG, kX, kToi, bat) => {
    if (!bat) { if (hop) hop.visible = false; man.visible = false; return; }
    if (kG > 0) { if (!XO) tao(); hop.visible = true; const u = XO.material.uniforms; u.uG.value = kG; u.uX.value = kX; u.uT.value = performance.now() / 1000; } else if (hop) hop.visible = false;
    man.position.copy(cam.position); man.visible = kToi > .001; man.material.opacity = kToi;
  };

  // ===== DATAMOSH: các khối điểm ảnh bị "kẹt" và lem theo hướng chuyển động, khối khác nhảy sang hình mới =====
  const mo = document.createElement('canvas'), mg = mo.getContext('2d'); let moW = 0, moH = 0, daCo = false;
  const hh = n => { const s = Math.sin(n * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };
  window.__mosh = (tg, W, H, m) => {
    if (m <= .002) { daCo = false; return; }
    const S = .5, w = Math.round(W * S), h = Math.round(H * S), K = 16, src = renderer.domElement;
    if (w !== moW || h !== moH) { mo.width = moW = w; mo.height = moH = h; daCo = false; }
    if (!daCo) { mg.drawImage(src, 0, 0, w, h); daCo = true; }
    const t = performance.now() / 1000, nhip = Math.floor(t * 12);
    for (let by = 0; by < h; by += K) for (let bx = 0; bx < w; bx += K) {
      const id = bx * 7.1 + by * 13.3, r = hh(id + nhip * .37);
      if (r < .1 + .25 * (1 - m)) { mg.drawImage(src, bx / S, by / S, K / S, K / S, bx, by, K, K); continue; }          // khối "I-frame": lấy hình mới
      if (r < .1 + .25 * (1 - m) + .6 * m) { const vx = (hh(id) - .3) * 10 * m + 3 * m, vy = (hh(id + 3) - .5) * 5 * m;  // khối "P-frame": lem theo vector
        mg.drawImage(mo, bx - vx, by - vy, K, K, bx, by, K, K); } }
    tg.save(); tg.imageSmoothingEnabled = false; tg.globalAlpha = Math.min(1, m * 1.6); tg.drawImage(mo, 0, 0, W, H);
    tg.globalCompositeOperation = 'screen'; tg.globalAlpha = .35 * m; tg.filter = 'hue-rotate(160deg) saturate(2)'; tg.drawImage(mo, 7 * m, 0, W, H); tg.restore();
  };
}

// ===== LỬA CHÁY HẾT MÀN HÌNH (anh 09/11): khung não đứng hình thành "tờ giấy", lửa bén từ mép dưới + dấu chân ngựa vằn, cháy lan, cháy thủng lộ cảnh sau =====
// Viền cháy cam sáng, mép xém đen, ngọn lửa bốc lên, tàn lửa bay, hơi nóng làm hình méo. Chạy bằng 1 shader trên canvas riêng.
{ const cv = document.createElement('canvas'); cv.id = 'naoLua';
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:12;pointer-events:none;display:none';
  document.body.appendChild(cv);
  let rd = null, sc = null, cam2 = null, mat = null, tex = null;
  const fs = `uniform sampler2D uTex; uniform float uK, uT; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * n(p); p *= 2.03; a *= .5; } return v; }
    void main(){
      vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 p = vec2(uv.x * asp, uv.y);
      float d = min(length(p - vec2(.44 * asp, .2)), length(p - vec2(.8 * asp, .26)) * 1.15);   // bén từ dấu chân ngựa vằn + chỗ gà
      d = min(d, uv.y * 1.25 + .12);                                                              // và từ mép dưới lên
      float f = d * .9 + fbm(p * 3.2 + vec2(0., -uT * .15)) * .45;
      float x = f - (pow(uK, 1.7) * 1.5 - .06);   // cháy lan chậm hơn, bùng dần về cuối
      if (x < 0.) { float rim = smoothstep(-.035, 0., x); gl_FragColor = vec4(vec3(1., .32, .06) * rim * 1.6, rim * .55); return; }   // đã cháy thủng
      float gan = 1. - smoothstep(0., .2, x);
      vec2 lech = (vec2(fbm(p * 8. + uT * 1.5), fbm(p * 8. - uT * 1.3)) - .5) * .014 * gan;          // hơi nóng làm méo hình
      vec3 c = texture2D(uTex, uv + lech).rgb;
      c = mix(c, vec3(.045, .02, .01), 1. - smoothstep(0., .075, x));                              // mép xém đen
      c *= 1. - .35 * smoothstep(.3, 0., x);                                                       // ám khói
      c += vec3(.9, .33, .07) * gan * .28;                                                         // ánh lửa hắt cam
      c += vec3(1.7, .8, .28) * exp(-pow(x / .012, 2.)) * (.7 + .6 * n(p * 40. + uT * 8.));        // viền lửa sáng
      float lua = fbm(vec2(p.x * 7., p.y * 4. - uT * 2.6)), ng = smoothstep(.45, .85, lua) * smoothstep(.17, 0., x);
      c += mix(vec3(1., .22, .02), vec3(1., .82, .35), ng) * ng * 1.5;                             // ngọn lửa bốc lên
      vec2 g = p * vec2(40., 22.) + vec2(sin(uT + p.y * 6.) * .3, uT * 6.); vec2 id = floor(g), fp = fract(g) - .5;
      c += vec3(1., .6, .2) * step(.93, h(id)) * smoothstep(.13, 0., length(fp)) * smoothstep(.4, 0., x) * 2.2;   // tàn lửa bay
      gl_FragColor = vec4(c, 1.);
    }`;
  function khoi() {
    rd = new THREE.WebGLRenderer({ canvas: cv, alpha: true, premultipliedAlpha: false, antialias: false });
    rd.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.5)); rd.setClearColor(0x000000, 0);
    sc = new THREE.Scene(); cam2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    mat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, uniforms: { uTex: { value: null }, uK: { value: 0 }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: fs });
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  }
  window.__luaTao = anh => { if (!rd) khoi(); if (tex) tex.dispose(); tex = new THREE.CanvasTexture(anh); mat.uniforms.uTex.value = tex; };
  window.__lua = k => {
    if (k < 0 || !rd) { cv.style.display = 'none'; return; }
    cv.style.display = k >= 1 ? 'none' : 'block'; if (k >= 1) return;
    const w = innerWidth, h = innerHeight; rd.setSize(w, h, false); mat.uniforms.uRes.value.set(w, h);
    mat.uniforms.uK.value = k; mat.uniforms.uT.value = performance.now() / 1000; rd.render(sc, cam2);
  };
}

// ===== ÂM THANH ĐOẠN KẾT (anh 09/11): tim đập nhanh dần ở "still awake." → tiếng rè glitch → lửa bùng, cháy lách tách. Tạo bằng WebAudio, chỉ kêu khi đã bật tiếng; nhạc nền hạ nhỏ trong đoạn kết =====
{ let lua = null, tim = 0, gl = 0, lac = 0, buf = null, daHa = false;
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const nhieu = ac => { if (buf) return buf; buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return buf; };
  function tiengTim(a, to) { const ac = a.ac, t = ac.currentTime;
    for (const [dt, v] of [[0, 1], [.17, .65]]) { const o = ac.createOscillator(); o.frequency.setValueAtTime(72, t + dt); o.frequency.exponentialRampToValueAtTime(36, t + dt + .13);
      const g = ac.createGain(); g.gain.setValueAtTime(.0001, t + dt); g.gain.exponentialRampToValueAtTime(.6 * v * to, t + dt + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dt + .24);
      o.connect(g).connect(a.ra); o.start(t + dt); o.stop(t + dt + .26); } }
  function tiengGlitch(a, m) { const ac = a.ac, t = ac.currentTime, dai = .03 + Math.random() * .07;
    const n = ac.createBufferSource(); n.buffer = nhieu(ac); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700 + Math.random() * 4500; bp.Q.value = 6;
    const g = ac.createGain(); g.gain.setValueAtTime(.32 * m, t); g.gain.setValueAtTime(.0001, t + dai); n.connect(bp).connect(g).connect(a.ra); n.start(t, Math.random()); n.stop(t + dai + .01);
    if (Math.random() < .35) { const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = 120 + Math.random() * 900; const g2 = ac.createGain(); g2.gain.setValueAtTime(.06 * m, t); g2.gain.setValueAtTime(.0001, t + dai * .7); o.connect(g2).connect(a.ra); o.start(t); o.stop(t + dai); } }
  function batLua(a) { const ac = a.ac, t = ac.currentTime, ra = ac.createGain(); ra.gain.value = 0; ra.connect(a.ra);
    const n = ac.createBufferSource(); n.buffer = nhieu(ac); n.loop = true; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; n.connect(lp).connect(ra);   // tiếng lửa ầm trầm
    const n2 = ac.createBufferSource(); n2.buffer = nhieu(ac); n2.loop = true; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = .7; const g2 = ac.createGain(); g2.gain.value = .22; n2.connect(bp).connect(g2).connect(ra);   // tiếng xèo
    n.start(t); n2.start(t, .7);
    const w = ac.createBufferSource(); w.buffer = nhieu(ac); const wb = ac.createBiquadFilter(); wb.type = 'bandpass'; wb.Q.value = 1.2; wb.frequency.setValueAtTime(250, t); wb.frequency.exponentialRampToValueAtTime(2600, t + .9);   // phừng
    const wg = ac.createGain(); wg.gain.setValueAtTime(.0001, t); wg.gain.exponentialRampToValueAtTime(.5, t + .15); wg.gain.exponentialRampToValueAtTime(.0001, t + 1.1); w.connect(wb).connect(wg).connect(a.ra); w.start(t); w.stop(t + 1.2);
    return { ra, dung: () => { const t2 = ac.currentTime; ra.gain.setTargetAtTime(0, t2, .15); setTimeout(() => { try { n.stop(); n2.stop(); ra.disconnect(); } catch (e) {} }, 900); } }; }
  function tach(a, k) { const ac = a.ac, t = ac.currentTime, dai = .006 + Math.random() * .02;
    const n = ac.createBufferSource(); n.buffer = nhieu(ac); const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200 + Math.random() * 3500;
    const g = ac.createGain(); g.gain.setValueAtTime((.12 + Math.random() * .3) * Math.min(1, .3 + k), t); g.gain.exponentialRampToValueAtTime(.0001, t + dai); n.connect(hp).connect(g).connect(a.ra); n.start(t, Math.random() * 1.5); n.stop(t + dai + .01); }
  window.__amKet = (qq, dtr) => {
    const a = window.__amThanh && window.__amThanh();
    const tat = () => { if (lua) { lua.dung(); lua = null; } if (daHa && a && a.nhac) { a.nhac.gain.setTargetAtTime(.9, a.ac.currentTime, .4); daHa = false; } };
    if (!a || !window.__trongNao || qq < .82) { tat(); return; }
    if (!daHa && a.nhac) { a.nhac.gain.setTargetAtTime(.4, a.ac.currentTime, .5); daHa = true; }               // hạ nhạc để nghe tiếng kết
    if (qq < .885) { tim -= dtr; if (tim <= 0) { const nhanh = Math.min(1, (qq - .82) / .065); tiengTim(a, .55 + .45 * nhanh); tim = .95 - .5 * nhanh; } }
    const mg = ss(.85, .868, qq) * (1 - ss(.874, .89, qq)); if (mg > .05) { gl -= dtr; if (gl <= 0) { tiengGlitch(a, mg); gl = .035 + Math.random() * .11; } }
    if (qq >= .88 && qq < .997) { const k = Math.min(1, (qq - .88) / .112); if (!lua) lua = batLua(a);
      lua.ra.gain.setTargetAtTime(.55 * Math.min(1, .25 + k * 1.5) * (1 - ss(.975, .997, qq)), a.ac.currentTime, .12);
      lac -= dtr; if (lac <= 0) { tach(a, k); lac = Math.random() * (.22 - .17 * k); } }
    else if (lua) { lua.dung(); lua = null; }
  };
}
