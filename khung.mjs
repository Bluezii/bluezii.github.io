// ===== gop-4-b · khung chữ chung cho cả hành trình (phương án B, 13/11/2026) =====
// Một lớp phủ duy nhất nằm trên cả 4 cảnh (phòng, đầu, bảo tàng, web trắng), dùng đúng hệ chữ trộn của web:
//   1) thanh hành trình 4 đoạn ở mép trên (kiểu story): đang ở cảnh nào, còn bao xa
//   2) chữ BLUEZII nhỏ (6 kiểu chữ) + nhãn cảnh "01 ROOM …" góc trái trên, thay 3 kiểu tiêu đề khác nhau của 3 cảnh
//   3) thẻ chuyển cảnh: tên cảnh bằng chữ trộn hiện ~1,2 s mỗi lần đổi cảnh
//   4) gợi ý cuộn / vuốt kiểu máy chữ, tự ẩn khi khách đã cuộn
// Chỉ đọc trạng thái từ trang (window.__pPhong, __qNao, __btDemo, class trên body), không điều khiển cảnh → gỡ file này ra thì trang vẫn chạy như bản A.
const CANH = [null,
  { so: '01', ten: 'ROOM', kieu: ['dac', 'vien', 'dao', 'dac'], phu: 'Trung Hieu · Ha Noi', ngan: 'Ha Noi' },
  { so: '02', ten: 'HEAD', kieu: ['go', 'dac', 'vien', 'dao'], phu: 'inside my head · 03:47 AM', ngan: 'inside my head' },
  { so: '03', ten: 'MUSEUM', kieu: ['dac', 'dao', 'dac', 'go', 'vien', 'dac'], phu: 'projects · newest first', ngan: 'newest first' },
  { so: '04', ten: 'WORK', kieu: ['dac', 'vien', 'dao', 'go'], phu: 'the white room', ngan: 'the white room' }];
const KIEU_CHINH = ['dac', 'vien', 'dao', 'go', 'dac', 'hep', 'dac'];   // B L U E Z I I — y hệt chữ chính của web
const giam = matchMedia('(prefers-reduced-motion: reduce)').matches, cham = matchMedia('(pointer: coarse)').matches;

const css = `
#kh{pointer-events:none;--chu:#f4f3ee;--dao:#0b0b0c;
  --to:'Archivo',sans-serif;--cat:'Anton',sans-serif;--go:'UnifrakturCook',serif;--may:'Space Mono',monospace;
  --trai:max(40px,env(safe-area-inset-left,0px));--tren:env(safe-area-inset-top,0px)}
#kh .mix{white-space:nowrap;line-height:.8;color:var(--chu)}
#kh .mix .l{display:inline-block;vertical-align:bottom;position:relative;margin:0 .008em}
#kh .mix .l>i{display:inline-block;font-style:normal;text-transform:uppercase}
#kh .k-dac>i{font-family:var(--to);font-weight:900;font-stretch:82%;letter-spacing:-.02em}
#kh .k-vien>i{font-family:var(--to);font-weight:900;font-stretch:82%;color:transparent;-webkit-text-stroke:.03em var(--chu)}
#kh .k-dao{background:var(--chu);padding:.06em .045em .015em;margin:0 .03em;rotate:-3deg}
#kh .k-dao>i{font-family:var(--cat);font-weight:400;color:var(--dao);font-size:.9em;line-height:.92}
#kh .k-go{rotate:4deg}
#kh .k-go>i{font-family:var(--go);font-weight:700;font-size:.9em;line-height:.92}
#kh .k-hep>i{font-family:var(--cat);font-weight:400;font-size:1.04em;line-height:.8}
#kh .k-may{rotate:-2deg}
#kh .k-may>i{font-family:var(--may);font-weight:700;font-size:.8em;line-height:.9;text-decoration:underline;text-decoration-thickness:.06em;text-underline-offset:.06em}
#kh .mix .l{opacity:0}
#kh .mix.vao .l{opacity:1;animation:khDan .3s steps(3) both;animation-delay:var(--tre,0s)}
#kh .mix.ra .l{animation:khBoc .22s steps(3) both;animation-delay:var(--tre,0s)}
@keyframes khDan{from{transform:translateY(-24%) rotate(10deg) scale(1.3);opacity:0}to{transform:none;opacity:1}}
@keyframes khBoc{from{opacity:1}to{transform:translateY(-30%) rotate(-14deg) scale(1.1);opacity:0}}

/* 1 · thanh hành trình: 4 đoạn, đảo màu theo nền (trắng trên cảnh tối, đen trên web trắng) */
#khThanh{position:fixed;z-index:70;left:var(--trai);right:var(--trai);top:calc(var(--tren) + 12px);display:flex;gap:6px;mix-blend-mode:difference;opacity:0;transition:opacity .8s}
#kh.hien #khThanh{opacity:1}
#khThanh i{flex:1;position:relative;height:2px;background:rgba(255,255,255,.3);font-style:normal}
#khThanh i b{position:absolute;inset:0;background:#fff;transform-origin:left;transform:scaleX(0)}
#khThanh i span{position:absolute;left:0;top:9px;font:400 10px/1 var(--may);letter-spacing:.08em;text-transform:uppercase;color:#fff;opacity:.45;transition:opacity .4s;white-space:nowrap}
#khThanh i.dang span{opacity:1}
#kh.web #khThanh{left:24px;right:24px;top:calc(var(--tren) + 6px)}
#kh.web #khThanh span{display:none}

/* 2 · chữ BLUEZII + nhãn cảnh */
#khDau{position:fixed;z-index:70;left:var(--trai);top:calc(var(--tren) + 46px);opacity:0;transition:opacity .8s;filter:drop-shadow(0 1px 10px rgba(0,0,0,.55))}
#kh.hien #khDau{opacity:1}
#kh.web #khDau,#kh.lop #khDau{opacity:0}
#kh.lop #khThanh{opacity:0}
#khTen{font-size:34px}
#khCanh{display:flex;align-items:center;gap:8px;margin-top:10px;font:400 11px/1 var(--may);letter-spacing:.06em;text-transform:uppercase;color:var(--chu)}
#khCanh b{background:var(--chu);color:var(--dao);font:800 12px/1 var(--to);font-stretch:90%;padding:5px 7px 6px;letter-spacing:0}
#khCanh span{opacity:.82}

/* 3 · thẻ chuyển cảnh */
#khThe{position:fixed;z-index:71;inset:0;display:grid;place-content:center;justify-items:center;gap:18px;mix-blend-mode:difference;visibility:hidden}
#khThe.on{visibility:visible}
#khThe .mix{font-size:clamp(72px,15vw,220px);--chu:#fff;--dao:#000}
#khThe .phu{font:400 clamp(11px,1.1vw,13px)/1 var(--may);letter-spacing:.08em;text-transform:uppercase;background:#fff;color:#000;padding:6px 10px 5px;rotate:-2deg;opacity:0;transition:opacity .25s}
#khThe.on .phu{opacity:1;transition-delay:.25s}
#khThe.ra .phu{opacity:0;transition-delay:0s}

/* 4 · gợi ý cuộn / vuốt */
#khGoi{position:fixed;z-index:70;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 30px);text-align:center;opacity:0;transition:opacity .6s}
#khGoi.on{opacity:1}
#khGoi span{display:inline-block;font:700 12px/1 var(--may);letter-spacing:.1em;text-transform:uppercase;color:var(--chu);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px;rotate:-2deg;text-shadow:0 1px 10px rgba(0,0,0,.7)}
#khGoi i{display:block;font-style:normal;margin-top:8px;color:var(--chu);animation:khNhay 1.6s ease-in-out infinite}
@keyframes khNhay{50%{transform:translateY(5px)}}

#naoHint{font:700 12px/1.4 'Space Mono',monospace!important;letter-spacing:.1em!important;color:#f4f3ee!important;text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1px}

/* ----- bỏ 3 kiểu tiêu đề cũ của 3 cảnh (đã có khung chung) ----- */
.goc.tt,.goc.tp,.goc.dt{display:none!important}
body #naoHud #tt{display:none}
body #naoHud #dt{top:calc(env(safe-area-inset-top,0px) + 124px);left:max(40px,env(safe-area-inset-left,0px))}
body #naoHud #tp{top:calc(env(safe-area-inset-top,0px) + 46px);right:max(40px,env(safe-area-inset-right,0px))}
body #bt3 #bTt{display:none}
body #bt3 #bTp{top:calc(env(safe-area-inset-top,0px) + 46px);right:max(40px,env(safe-area-inset-right,0px))}
body #bt3 #goiY{top:calc(env(safe-area-inset-top,0px) + 46px)}

/* ----- nút tiếng: 1 nút kiểu "tag", ≥ 44 px, nằm vùng ngón cái (phải dưới) ----- */
#am.goc.dp{left:auto;top:auto;right:max(40px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 30px);min-width:118px;height:44px;padding:0 14px 1px;
  display:inline-flex;align-items:center;justify-content:center;gap:9px;font:800 12px/1 'Archivo',sans-serif;font-stretch:90%;letter-spacing:.03em;text-transform:uppercase;white-space:nowrap;
  color:#f4f3ee;background:rgba(11,11,12,.55);border:1px solid rgba(244,243,238,.3);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);text-shadow:none;cursor:pointer;transition:opacity .9s,background .2s,color .2s}
#am.goc.dp[aria-pressed="true"]{background:#f4f3ee;color:#0b0b0c;border-color:#f4f3ee}
#am.goc.dp::before{content:"";width:14px;height:12px;flex:none;background:linear-gradient(currentColor,currentColor) 0 100%/2px 4px no-repeat,linear-gradient(currentColor,currentColor) 4px 100%/2px 4px no-repeat,linear-gradient(currentColor,currentColor) 8px 100%/2px 4px no-repeat,linear-gradient(currentColor,currentColor) 12px 100%/2px 4px no-repeat}
#am.goc.dp[aria-pressed="true"]::before{animation:khEq .9s steps(4) infinite}
@keyframes khEq{0%{background-size:2px 4px,2px 11px,2px 7px,2px 9px}25%{background-size:2px 10px,2px 5px,2px 12px,2px 4px}50%{background-size:2px 6px,2px 12px,2px 4px,2px 10px}75%{background-size:2px 12px,2px 7px,2px 9px,2px 5px}100%{background-size:2px 4px,2px 11px,2px 7px,2px 9px}}
#am.goc.dp:focus-visible{outline:2px solid #f4f3ee;outline-offset:3px}
body.nao #am.goc.dp,body.bt #am.goc.dp{color:#f4f3ee}
body.nao #am.goc.dp[aria-pressed="true"],body.bt #am.goc.dp[aria-pressed="true"]{color:#0b0b0c}
/* nút đổi bài ở bảo tàng: cùng hàng, bên trái nút tiếng */
#nutNhac{right:calc(max(40px,env(safe-area-inset-right,0px)) + 126px);bottom:calc(env(safe-area-inset-bottom,0px) + 30px);top:auto;height:44px;padding:0 14px;border-radius:0;display:inline-flex;align-items:center;gap:6px;
  font:400 11px/1 'Space Mono',monospace;letter-spacing:.06em;border:1px solid rgba(244,243,238,.3);background:rgba(11,11,12,.55);color:#f4f3ee}
#nutNhac b{color:#f4f3ee;font-weight:700}
#nutNhac:hover{border-color:#f4f3ee}
#nutNhac:focus-visible{outline:2px solid #f4f3ee;outline-offset:3px}
/* nút "play again" trong đầu: cùng hàng dưới, bên trái nút tiếng */
#naoNhac{right:calc(max(40px,env(safe-area-inset-right,0px)) + 126px)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 30px)!important;top:auto!important;height:44px;display:inline-flex!important;align-items:center;gap:6px;padding:0 14px!important;border-radius:0!important;font:400 11px/1 'Space Mono',monospace!important;letter-spacing:.04em}

/* ----- màn chờ trắng trước khi vào đầu: chữ HEAD kiểu chữ trộn, mực đen trên nền trắng (cùng chất với web trắng) ----- */
#the .khCho{font-size:clamp(72px,15vw,220px);line-height:.8;margin-bottom:22px;color:#111214;white-space:nowrap}
#the .khCho .l{display:inline-block;vertical-align:bottom;margin:0 .008em}
#the .khCho .l>i{display:inline-block;font-style:normal}
#the .khCho .k-dac>i{font-family:'Archivo',sans-serif;font-weight:900;font-stretch:82%;letter-spacing:-.02em}
#the .khCho .k-vien>i{font-family:'Archivo',sans-serif;font-weight:900;font-stretch:82%;color:transparent;-webkit-text-stroke:.03em #111214}
#the .khCho .k-dao{background:#111214;padding:.06em .045em .015em;margin:0 .03em;rotate:-3deg}
#the .khCho .k-dao>i{font-family:'Anton',sans-serif;color:#fff;font-size:.9em;line-height:.92}
#the .khCho .k-go{rotate:4deg}
#the .khCho .k-go>i{font-family:'UnifrakturCook',serif;font-weight:700;font-size:.9em;line-height:.92}
#the #naoTai{font:400 12px/1 'Space Mono',monospace!important;letter-spacing:.08em!important;background:#111214;color:#fff!important;padding:6px 10px 5px;display:inline-block!important;rotate:-2deg}
#the #naoTai:empty{display:none!important}

/* ----- bảo tàng: nhãn dự án dùng chữ Archivo đậm như danh sách Work của web ----- */
body #bt3 #bang h2{font:900 clamp(34px,4.2vw,58px)/.95 'Archivo',sans-serif;font-stretch:82%;text-transform:uppercase;letter-spacing:-.02em;margin:10px 0 10px}
body #bt3 #bang .so{font-family:'Space Mono',monospace}
body #bt3 button.nut{border-radius:0;min-height:44px;font:800 12px/1 'Archivo',sans-serif;font-stretch:90%;letter-spacing:.04em}
body #bt3 button.nut.chinh{background:#f4f3ee;border-color:#f4f3ee;color:#0b0b0c;box-shadow:none}

@media (max-width:700px){
  #kh{--trai:max(16px,env(safe-area-inset-left,0px))}
  #khThanh{top:calc(var(--tren) + 10px);gap:4px}
  #khThanh i{height:3px}
  #khThanh i span{display:none}
  #khDau{top:calc(var(--tren) + 26px)}
  #khTen{font-size:26px}
  #khCanh{margin-top:8px;font-size:10px}
  #khGoi{bottom:calc(env(safe-area-inset-bottom,0px) + var(--thanh,0px) + 128px)}
  body #naoHud #tp,body #bt3 #bTp{top:calc(env(safe-area-inset-top,0px) + 26px);right:16px}
  body #naoHud #dt{top:calc(env(safe-area-inset-top,0px) + 92px);left:16px}
  body #naoHud #veToi{bottom:calc(env(safe-area-inset-bottom,0px) + var(--thanh,0px) + 76px)}
  body #bt3 #goiY{top:calc(env(safe-area-inset-top,0px) + 96px)}
  #am.goc.dp{right:max(12px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + var(--thanh,0px) + 12px);min-width:104px;font-size:12px}
  #nutNhac{right:calc(max(12px,env(safe-area-inset-right,0px)) + 112px);bottom:calc(env(safe-area-inset-bottom,0px) + var(--thanh,0px) + 12px);top:auto;font-size:10px;padding:0 10px}
  #naoNhac{right:calc(max(12px,env(safe-area-inset-right,0px)) + 112px)!important;bottom:calc(env(safe-area-inset-bottom,0px) + var(--thanh,0px) + 12px)!important;font-size:10px!important;padding:0 10px!important;max-width:calc(100vw - 140px);overflow:hidden;white-space:nowrap}
  /* 13/11: --thanh = chiều cao thanh menu đáy của trang gộp (index.html đặt, mặc định 0) → mọi thứ bám đáy nhích lên trên thanh */
  /* bảo tàng trên điện thoại: nền mờ dưới nhãn cho dễ đọc, chừa 1 hàng nút ở đáy, nút ≥ 44 px */
  body #bt3 #bang{max-height:50vh;padding:44px 16px calc(env(safe-area-inset-bottom,0px) + var(--thanh,0px) + 68px)}
  body #bt3 #bang h2{font-size:clamp(30px,9vw,40px)}
  body #bt3 #muiTrai,body #bt3 #muiPhai{min-width:44px;min-height:44px}
  body #bt3 button{min-height:44px}
}
@media (prefers-reduced-motion:reduce){#kh .mix .l{opacity:1;animation:none!important}#khGoi i,#am.goc.dp::before{animation:none!important}}
`;
{ const st = document.createElement('style'); st.id = 'khCss'; st.textContent = css; document.head.appendChild(st); }

const goc = document.createElement('div'); goc.id = 'kh'; goc.setAttribute('aria-hidden', 'true');
goc.innerHTML = `<div id="khThanh">${CANH.slice(1).map(c => `<i><b></b><span>${c.so} ${c.ten}</span></i>`).join('')}</div>
<div id="khDau"><div class="mix" id="khTen"></div><div id="khCanh"><b>01</b><span></span></div></div>
<div id="khThe"><div class="mix" id="khTheTen"></div><div class="phu" id="khThePhu"></div></div>
<div id="khGoi"><span>${cham ? 'swipe up' : 'scroll'}</span><i>${cham ? '↑' : '↓'}</i></div>`;
document.body.appendChild(goc);
const $ = id => document.getElementById(id);
function dungMix(el, chu, kieu, tre = .06) {
  el.innerHTML = [...chu].map((c, i) => `<span class="l k-${kieu[i] || 'dac'}" style="--tre:${(i * tre).toFixed(2)}s"><i>${c}</i></span>`).join('');
}
dungMix($('khTen'), 'BLUEZII', KIEU_CHINH, .05);
// chữ xáo kiểu máy đánh chữ (như web)
const KT = 'abcdefghijklmnopqrstuvwxyz0123456789';
function xao(el, chu, ms = 500) {
  if (giam) { el.textContent = chu; return; }
  const t0 = performance.now();
  (function b() { const p = Math.min(1, (performance.now() - t0) / ms), chot = Math.floor(p * chu.length); let h = '';
    for (let i = 0; i < chu.length; i++) h += chu[i] === ' ' || i < chot ? chu[i] : KT[(Math.random() * KT.length) | 0];
    el.textContent = h; if (p < 1) requestAnimationFrame(b); })();
}
// màn chờ trắng trước khi vào đầu
{ const the = $('the'); if (the && the.firstElementChild) { const d = document.createElement('div'); d.className = 'khCho'; the.firstElementChild.prepend(d);
    d.innerHTML = [...'HEAD'].map((c, i) => `<span class="l k-${CANH[2].kieu[i]}"><i>${c}</i></span>`).join(''); } }

const thanh = [...document.querySelectorAll('#khThanh i')], doan = thanh.map(i => i.querySelector('b')), truoc = [-1, -1, -1, -1];
let canh = 0, henThe = [], daCuon = false;
function theChuyen(c) {
  henThe.forEach(clearTimeout); henThe = [];
  const the = $('khThe'), ten = $('khTheTen');
  dungMix(ten, CANH[c].ten, CANH[c].kieu, .05); $('khThePhu').textContent = `${CANH[c].so} / 04 — ${CANH[c].phu}`;
  the.className = 'on'; ten.className = 'mix'; void ten.offsetWidth; ten.classList.add('vao');
  henThe.push(setTimeout(() => { ten.classList.remove('vao'); ten.classList.add('ra'); the.classList.add('ra'); }, giam ? 700 : 1150));
  henThe.push(setTimeout(() => { the.className = ''; }, giam ? 900 : 1650));
}
function doiCanh(c) {
  const cu = canh; canh = c;
  thanh.forEach((i, k) => i.classList.toggle('dang', k === c - 1));
  goc.classList.toggle('web', c === 4);
  $('khCanh').firstElementChild.textContent = CANH[c].so; xao($('khCanh').lastElementChild, `${CANH[c].ten} · ${innerWidth < 700 ? CANH[c].ngan : CANH[c].phu}`);
  if (cu && c !== 4) theChuyen(c);   // lần đầu (mở trang) và lúc sang web (web có màn nạp riêng) thì không hiện thẻ
}
function vong() {
  const b = document.body, c = b.classList.contains('oweb') ? 4 : b.classList.contains('bt') ? 3 : b.classList.contains('nao') ? 2 : 1;
  if (c !== canh) doiCanh(c);
  if (!goc.classList.contains('hien') && (b.classList.contains('hien') || c > 1)) { goc.classList.add('hien'); $('khTen').classList.add('vao'); }
  goc.classList.toggle('lop', c === 3 && !!document.querySelector('#bThe.mo, #finder.mo'));   // đang mở bảng thông tin / cửa sổ Finder ở bảo tàng → ẩn khung cho khỏi đè
  const p = c > 1 ? 1 : Math.min(1, window.__pPhong || 0), q = c > 2 ? 1 : c < 2 ? 0 : Math.min(1, window.__qNao || 0);
  let u = 0; if (c === 4) u = 1; else if (c === 3 && window.__btDemo) { try { u = Math.min(1, window.__btDemo.uC() / (window.__btDemo.tram.length - 1)); } catch (e) { } }
  const v = [p, q, u, c === 4 ? 1 : 0];
  for (let k = 0; k < 4; k++) { const x = Math.round(v[k] * 500) / 500; if (x !== truoc[k]) { truoc[k] = x; doan[k].style.transform = `scaleX(${x})`; } }
  // gợi ý cuộn: hiện ở phòng khi chữ đã gõ xong và khách chưa cuộn; hiện lại 1 nhịp lúc mới vào đầu
  if ((window.__pPhong || 0) > .03) daCuon = true;
  const goi = (c === 1 && b.classList.contains('hien') && !daCuon) || (c === 2 && (window.__qNao || 0) < .03);
  $('khGoi').classList.toggle('on', goi);
  requestAnimationFrame(vong);
}
requestAnimationFrame(vong);
window.__khung = { theChuyen, canh: () => canh };   // để kiểm
