// 13/11/2026 · Trang admin "sửa ngay trên trang" (chỉ tải khi mở web/index.html?sua).
// Chữ có viền đứt: bấm vào gõ sửa luôn. Trang dự án có thêm khung: nhóm, ảnh (thêm/xếp/xoá), phần chữ của bảo tàng, ẩn/xếp dự án.
// Bấm "Lưu lên web": ghi bao-tang/noi-dung.json + ảnh mới (web/anh/up/) vào GitHub trong 1 lần (1 commit). Web thật đổi sau ~1–2 phút.
// Mã GitHub (fine-grained token, chỉ quyền Contents của repo này) lưu trong trình duyệt của máy này (localStorage 'bz_ma').
(() => {
const B = window.__bz, esc = B.esc;
const doc = document;
let ban = 0;                    // số thay đổi chưa lưu
const anhMoi = {};              // ten -> Blob (ảnh mới chờ lưu)

// ---------- giao diện ----------
const st = doc.createElement('style');
st.textContent = `
body.dangSua [data-sua]{outline:1.5px dashed rgba(17,18,20,.45);outline-offset:3px;cursor:text;border-radius:2px;min-width:1.5em;display:inline-block}
body.dangSua [data-sua]:hover{outline-color:#111214;background:rgba(255,230,0,.18)}
body.dangSua [data-sua]:focus{outline:2px solid #111214;background:rgba(255,230,0,.28)}
body.dangSua [data-sua]:empty::before{content:'(trống, bấm để gõ)';opacity:.45;font-style:italic;text-transform:none}
body.dangSua .da [data-sua]{min-height:1em}
#szThanh{position:fixed;z-index:120;left:50%;bottom:14px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;flex-wrap:nowrap;white-space:nowrap;justify-content:center;
  padding:8px 10px;background:#111214;color:#fff;font:500 13px/1.2 'Inter Tight',system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25);max-width:calc(100vw - 20px)}
#szThanh b{font-weight:700;letter-spacing:.02em}
#szThanh .dem{opacity:.75;font-family:'Space Mono',monospace;font-size:11px;text-transform:uppercase}
#szThanh button,.szNut{min-height:36px;padding:0 12px;border:1px solid currentColor;background:none;color:inherit;font:600 12px/1 'Inter Tight',system-ui,sans-serif;cursor:pointer;letter-spacing:.02em}
#szThanh button.chinh{background:#fff;color:#111214;border-color:#fff}
#szThanh button:disabled{opacity:.4;cursor:default}
#szBao{position:fixed;z-index:121;left:50%;bottom:72px;transform:translateX(-50%);max-width:min(520px,calc(100vw - 20px));padding:10px 14px;background:#fff;color:#111214;border:1.5px solid #111214;font:500 13px/1.45 'Inter Tight',system-ui,sans-serif;display:none}
#szBao.hien{display:block}#szBao.loi{border-color:#c4161c;color:#c4161c}
.szKhung{margin:48px 0 0;padding:20px;border:1.5px dashed #111214;background:#fffbe6;color:#111214;font:400 14px/1.5 'Inter Tight',system-ui,sans-serif;text-transform:none;letter-spacing:0}
.szKhung h3{font:800 13px/1 'Archivo',sans-serif;text-transform:uppercase;letter-spacing:.04em;margin:0 0 4px}
.szKhung .goiy{font-size:12px;opacity:.65;margin:0 0 14px}
.szKhung section{padding:14px 0;border-top:1px solid rgba(17,18,20,.15)}
.szKhung section:first-of-type{border-top:0;padding-top:4px}
.szKhung label{display:block;font:700 11px/1 'Space Mono',monospace;text-transform:uppercase;letter-spacing:.04em;margin:10px 0 4px}
body.dangSua .szKhung .o{display:block;min-height:1.5em;padding:6px 8px;background:#fff;white-space:pre-wrap}
.szKhung select{min-height:36px;font:inherit;padding:0 8px;border:1.5px solid #111214;background:#fff}
.szKhung .hang{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.szAnh{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:8px}
.szAnh figure{margin:0;background:#fff;border:1px solid rgba(17,18,20,.2)}
.szAnh .h{aspect-ratio:1;background:#eee center/cover no-repeat;position:relative}
.szAnh .h span{position:absolute;left:4px;top:4px;background:#111214;color:#fff;font:700 10px/1 'Space Mono',monospace;padding:3px 5px}
.szAnh figcaption{display:flex;justify-content:space-between}
.szAnh figcaption button{flex:1;min-height:36px;border:0;border-right:1px solid rgba(17,18,20,.15);background:none;cursor:pointer;font-size:14px}
.szAnh figcaption button:last-child{border-right:0}
.szAnh figcaption button:hover{background:#111214;color:#fff}
.szThem{aspect-ratio:1;display:grid;place-items:center;text-align:center;border:1.5px dashed #111214;background:#fff;cursor:pointer;font:700 12px/1.3 'Inter Tight',sans-serif;padding:8px}
.szThem input{display:none}
.szNut{border-color:#111214;color:#111214;background:#fff}
.szNut:hover{background:#111214;color:#fff}
.szNut.do{border-color:#c4161c;color:#c4161c}
.szDs{margin-top:18px}
#szHop{position:fixed;inset:0;z-index:130;background:rgba(17,18,20,.6);display:none;place-items:center;padding:16px}
#szHop.mo{display:grid}
#szHop .giay{background:#fff;color:#111214;max-width:520px;width:100%;padding:22px;font:400 14px/1.5 'Inter Tight',system-ui,sans-serif;max-height:calc(100vh - 32px);overflow:auto}
#szHop h3{font:800 18px/1.1 'Archivo',sans-serif;text-transform:uppercase;margin:0 0 10px}
#szHop ol{padding-left:1.2em;margin:8px 0 14px}#szHop li{margin:4px 0}
#szHop a{text-decoration:underline}
#szHop input{width:100%;min-height:44px;padding:0 10px;border:1.5px solid #111214;font:14px 'Space Mono',monospace;margin:4px 0 12px}
#szHop .hang{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
@media (max-width:760px){#szThanh{bottom:calc(env(safe-area-inset-bottom,0px) + 64px);font-size:12px;gap:6px}#szThanh button{padding:0 9px}#szThanh .dai{display:none}#szThanh .dem{font-size:10px}#szBao{bottom:calc(env(safe-area-inset-bottom,0px) + 160px)}}
`;
doc.head.appendChild(st);
doc.body.classList.add('dangSua');

const thanh = doc.createElement('div'); thanh.id = 'szThanh';
thanh.innerHTML = `<b>✎<span class="dai"> Admin</span></b><span class="dem" id="szDem">Chưa sửa gì</span><button type="button" class="chinh" id="szLuu" disabled>Lưu<span class="dai"> lên web</span></button><button type="button" id="szBo" disabled>Bỏ<span class="dai"> thay đổi</span></button><button type="button" id="szMa" title="Mã GitHub">⚙ Mã</button><button type="button" id="szThoat" title="Xem như khách">Thoát</button>`;
doc.body.appendChild(thanh);
const bao = doc.createElement('div'); bao.id = 'szBao'; bao.setAttribute('role', 'status'); doc.body.appendChild(bao);
let henBao;
function thongBao(t, loi, giu){ bao.textContent = t; bao.className = 'hien' + (loi ? ' loi' : ''); clearTimeout(henBao); if (!giu) henBao = setTimeout(() => bao.className = '', 5000); }
function doiDem(){ ban++; capNhatThanh(); }
function capNhatThanh(){ doc.getElementById('szDem').textContent = ban ? `${ban} chưa lưu` : 'Chưa sửa gì'; doc.getElementById('szLuu').disabled = !ban; doc.getElementById('szBo').disabled = !ban; }
addEventListener('beforeunload', e => { if (ban) { e.preventDefault(); e.returnValue = ''; } });
doc.getElementById('szThoat').onclick = () => { location.href = location.pathname; };
doc.getElementById('szBo').onclick = () => { if (confirm('Bỏ hết thay đổi chưa lưu?')) { ban = 0; location.reload(); } };

// ---------- đọc/ghi theo đường dẫn "du_an.antimusic.web.ten" ----------
function nut(duong){   // trả [đối tượng cha, khoá]
  const ps = duong.split('.'); let o = B.ND;
  for (let i = 0; i < ps.length - 1; i++) {
    let p = ps[i];
    if (Array.isArray(o) && isNaN(+p)) o = o.find(x => x && x.id === p);
    else { if (o[p] == null) o[p] = isNaN(+ps[i + 1]) ? {} : []; o = o[p]; }
    if (!o) return [null];
  }
  return [o, ps[ps.length - 1]];
}
function dat(duong, v){ const [o, k] = nut(duong); if (o) o[k] = v; }
function lay(duong){ const [o, k] = nut(duong); return o ? o[k] : undefined; }

// ---------- chữ sửa trực tiếp ----------
const TAG_OK = /^(B|STRONG|I|EM|U|S|SPAN|BR|WBR)$/;
function sachHTML(el){   // chỉ giữ vài thẻ định dạng chữ (đậm, nghiêng, gạch...) và class
  const c = el.cloneNode(true);
  c.querySelectorAll('*').forEach(n => { if (!TAG_OK.test(n.tagName)) n.replaceWith(...n.childNodes); else [...n.attributes].forEach(a => a.name !== 'class' && n.removeAttribute(a.name)); });
  return c.innerHTML.trim();
}
function batSua(root){
  root.querySelectorAll('[data-sua]:not([contenteditable])').forEach(el => {
    el.setAttribute('contenteditable', el.hasAttribute('data-html') ? 'true' : 'plaintext-only');
    if (el.contentEditable !== 'plaintext-only' && !el.hasAttribute('data-html')) el.setAttribute('contenteditable', 'true');
    el.spellcheck = false;
  });
}
batSua(doc.body);
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && batSua(n.parentNode || n)))).observe(doc.body, {childList:true, subtree:true});
doc.addEventListener('input', e => {
  const el = e.target.closest && e.target.closest('[data-sua]'); if (!el) return;
  let v = el.hasAttribute('data-html') ? sachHTML(el) : el.innerText.replace(/ /g, ' ');
  if (!el.hasAttribute('data-nhieu')) v = v.replace(/\s*\n\s*/g, ' ');
  if (el.hasAttribute('data-ds')) v = v.split('\n').map(x => x.trim()).filter(Boolean);
  else if (typeof v === 'string') v = v.trim();
  dat(el.dataset.sua, v);
  if (!el._daDem) { el._daDem = 1; doiDem(); } else capNhatThanh();
  B.taoSP();
}, true);
doc.addEventListener('keydown', e => {
  const el = e.target.closest && e.target.closest('[data-sua]');
  if (el && e.key === 'Enter' && !el.hasAttribute('data-nhieu')) { e.preventDefault(); el.blur(); }
}, true);
// bấm vào chữ đang sửa nằm trong link/nút → không mở link
doc.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-sua]'); if (el && el.closest('a,button,[data-sp],[data-trang]')) { e.preventDefault(); e.stopPropagation(); } }, true);
doc.addEventListener('focusout', e => { const el = e.target.closest && e.target.closest('[data-sua]'); if (!el) return; B.veKy(); B.ve(); B.veDs(); }, true);

// ---------- khung thêm ở từng trang ----------
const o = (duong, v, nhieu, ds) => `<span class="o" data-sua="${duong}"${nhieu ? ' data-nhieu' : ''}${ds ? ' data-ds' : ''}>${esc(v)}</span>`;
window.__sauDung = (loai, s) => {
  if (loai === 'du-an') khungDuAn(s);
  else if (loai === 'ds') khungDs();
  else if (loai === 'about') khungAbout();
};
function khungDuAn(s){
  const d = s.d, g = `du_an.${d.id}`, w = B.ND.web, vt = w.thu_tu.indexOf(d.id);
  const k = doc.createElement('div'); k.className = 'szKhung';
  k.innerHTML = `<h3>Admin · ${esc(s.ten)}</h3><p class="goiy">Chữ ở trên (tên, năm, vai, việc, câu mô tả) bấm vào sửa luôn. Năm và câu mô tả dùng chung với bảo tàng. Gõ "– nay" ở năm thì web tự hiện "– now".</p>
  <section><label>Nhóm (bộ lọc ở trang Work)</label><select id="szKy">${w.ky.map((x, i) => `<option value="${i}"${+d.web.ky === i ? ' selected' : ''}>${esc(x.ten)}</option>`).join('')}</select></section>
  <section><label>Ảnh · ảnh số 1 là ảnh bìa · ← → để đổi chỗ</label><div class="szAnh" id="szAnh"></div></section>
  <section><label>Trong bảo tàng · tên</label>${o(g + '.ten', d.ten)}
    <label>Trong bảo tàng · vai trò</label>${o(g + '.vai_tro', d.vai_tro)}
    <label>Câu chuyện (The story)</label>${o(g + '.mo_ta_web', d.mo_ta_web === '[...]' ? '' : d.mo_ta_web, 1)}
    <label>Đã làm gì · mỗi dòng 1 ý</label>${o(g + '.lam_gi', (d.lam_gi || []).filter(x => x !== '[...]').join('\n'), 1, 1)}
    <label>Link</label>${o(g + '.link', d.link)}</section>
  <section><label>Vị trí trên web · đang là số ${vt + 1} / ${w.thu_tu.length}</label><div class="hang">
    <button type="button" class="szNut" id="szLen"${vt <= 0 ? ' disabled' : ''}>↑ Lên trước</button><button type="button" class="szNut" id="szXuong"${vt >= w.thu_tu.length - 1 ? ' disabled' : ''}>↓ Xuống sau</button>
    <button type="button" class="szNut do" id="szAn">Ẩn dự án khỏi web</button></div></section>`;
  const tiep = B.da.querySelector('.tiep'); tiep ? tiep.before(k) : B.da.appendChild(k);
  k.querySelector('#szKy').onchange = e => { d.web.ky = +e.target.value; doiDem(); B.dungLai(); moLai(s); };
  const doiCho = b => { const a = w.thu_tu; const i = a.indexOf(d.id), j = i + b; [a[i], a[j]] = [a[j], a[i]]; doiDem(); B.dungLai(); moLai(s); };
  k.querySelector('#szLen').onclick = () => doiCho(-1);
  k.querySelector('#szXuong').onclick = () => doiCho(1);
  k.querySelector('#szAn').onclick = () => { if (!confirm(`Ẩn "${s.ten}" khỏi web? (Không xoá, hiện lại được ở cuối trang Work.)`)) return; w.thu_tu = w.thu_tu.filter(x => x !== d.id); doiDem(); B.dong(); B.dungLai(); };
  veAnh(s);
}
function moLai(s){   // dựng lại trang dự án đang mở (không chạy màn chuyển)
  const moi = B.SP.find(x => x.id === s.id); if (!moi) return; const y = B.da.scrollTop; B.dungTrang(moi); B.da.classList.add('vao'); B.da.querySelectorAll('.hien').forEach(n => n.classList.add('thay')); B.da.scrollTop = y;
}
function veAnh(s){
  const d = s.d, h = B.da.querySelector('#szAnh'); if (!h) return; d.anh = d.anh || [];
  const url = n => B.ANH_TAM[n] || `anh/${n}.webp`;
  h.innerHTML = d.anh.map((n, i) => `<figure><div class="h" style="background-image:url('${url(n)}')"><span>${i + 1}${i ? '' : ' · bìa'}</span></div><figcaption>
    <button type="button" data-l="${i}" aria-label="Đổi chỗ sang trái"${i ? '' : ' disabled'}>←</button><button type="button" data-r="${i}" aria-label="Đổi chỗ sang phải"${i < d.anh.length - 1 ? '' : ' disabled'}>→</button><button type="button" data-x="${i}" aria-label="Bỏ ảnh">✕</button></figcaption></figure>`).join('')
    + `<label class="szThem">+ Thêm ảnh<br><small>chọn 1 hoặc nhiều ảnh, máy tự nén</small><input type="file" accept="image/*" multiple></label>`;
  h.onclick = e => {
    const b = e.target.closest('button'); if (!b) return; const a = d.anh;
    if (b.dataset.l) { const i = +b.dataset.l; [a[i - 1], a[i]] = [a[i], a[i - 1]]; }
    else if (b.dataset.r) { const i = +b.dataset.r; [a[i + 1], a[i]] = [a[i], a[i + 1]]; }
    else if (b.dataset.x) { if (!confirm('Bỏ ảnh này khỏi dự án? (File ảnh vẫn nằm trên GitHub, chỉ không hiện nữa.)')) return; a.splice(+b.dataset.x, 1); }
    doiDem(); B.dungLai(); moLai(s);
  };
  h.querySelector('input').onchange = async e => {
    const fs = [...e.target.files]; if (!fs.length) return;
    thongBao(`Đang nén ${fs.length} ảnh…`, 0, 1);
    for (const f of fs) {
      try { const blob = await nen(f); const ten = `up/${d.id}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
        anhMoi[ten] = blob; B.ANH_TAM[ten] = URL.createObjectURL(blob); d.anh.push(ten); doiDem();
      } catch (er) { thongBao(`Không đọc được ảnh ${f.name}. Thử ảnh JPG/PNG khác.`, 1); }
    }
    thongBao(`Đã thêm ${fs.length} ảnh. Bấm "Lưu lên web" để đưa lên.`);
    B.dungLai(); moLai(s);
  };
}
async function nen(f){   // nén trong trình duyệt: cạnh dài tối đa 1600 px, WebP chất lượng .82 (máy không hỗ trợ WebP thì JPEG .85)
  const bm = await createImageBitmap(f);
  const k = Math.min(1, 1600 / Math.max(bm.width, bm.height)), cw = Math.round(bm.width * k), ch = Math.round(bm.height * k);
  const cv = doc.createElement('canvas'); cv.width = cw; cv.height = ch; cv.getContext('2d').drawImage(bm, 0, 0, cw, ch);
  let b = await new Promise(r => cv.toBlob(r, 'image/webp', .82));
  if (!b || b.type !== 'image/webp') b = await new Promise(r => cv.toBlob(r, 'image/jpeg', .85));
  return b;
}
function khungDs(){   // cuối danh sách Work: thêm dự án, hiện lại dự án đã ẩn
  const dsW = doc.getElementById('dsW'); if (!dsW || dsW.querySelector('.szKhung')) return;
  const w = B.ND.web, an = B.ND.du_an.filter(d => d.web && !w.thu_tu.includes(d.id));
  const k = doc.createElement('div'); k.className = 'szKhung szDs';
  k.innerHTML = `<h3>Admin · danh sách dự án</h3><p class="goiy">Bấm vào 1 dự án để sửa chữ, ảnh, thứ tự. Thêm dự án mới ở đây.</p>
    <div class="hang"><button type="button" class="szNut" id="szMoi">+ Thêm dự án mới</button></div>
    ${an.length ? `<label>Đang ẩn khỏi web</label><div class="hang">${an.map(d => `<button type="button" class="szNut" data-hien="${esc(d.id)}">↺ Hiện lại: ${esc(d.web.ten || d.ten)}</button>`).join('')}</div>` : ''}`;
  dsW.querySelector('.ds').after(k);
  k.querySelector('#szMoi').onclick = () => {
    const ten = (prompt('Tên dự án mới?') || '').trim(); if (!ten) return;
    let id = ten.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'du-an';
    while (B.ND.du_an.some(d => d.id === id)) id += '-2';
    B.ND.du_an.splice(B.ND.du_an.findIndex(d => d.id === 'va-nua') >>> 0, 0, {id, ten, nam:'', vai_tro:'', mot_dong:'', mo_ta_web:'', lam_gi:[], link:'', anh:[], web:{ten, vai:'', viec:'', ky:0, mau:'#111111', r:1, chu:1, logo:0}});
    w.thu_tu.push(id); doiDem(); B.dungLai();
    const s = B.SP.find(x => x.id === id); B.mo(s);
    thongBao('Đã tạo. Điền năm, vai, mô tả và thêm ảnh ở trang dự án.');
  };
  k.querySelectorAll('[data-hien]').forEach(b => b.onclick = () => { w.thu_tu.push(b.dataset.hien); doiDem(); B.dungLai(); });
}
function khungAbout(){
  const ul = B.da.querySelector('.ab ul'); if (!ul) return;
  const k = doc.createElement('div'); k.className = 'szKhung';
  k.innerHTML = `<h3>Admin · danh sách vai trò</h3><p class="goiy">Sửa chữ ngay trên danh sách. Đoạn giới thiệu: bôi đen chữ rồi Ctrl+B / Ctrl+I để in đậm, nghiêng.</p><div class="hang">
    <button type="button" class="szNut" id="szThemVai">+ Thêm dòng</button><button type="button" class="szNut do" id="szBotVai">− Bỏ dòng cuối</button></div>`;
  ul.after(k);
  const lai = () => { doiDem(); B.dungMenu('about'); B.da.classList.add('vao'); B.da.querySelectorAll('.mix').forEach(m => m.classList.add('vao')); B.da.querySelectorAll('.hien').forEach(n => n.classList.add('thay')); };
  k.querySelector('#szThemVai').onclick = () => { B.ND.web.about_vai.push(['Brand', 'Role']); lai(); };
  k.querySelector('#szBotVai').onclick = () => { if (B.ND.web.about_vai.length && confirm('Bỏ dòng cuối?')) { B.ND.web.about_vai.pop(); lai(); } };
}
// trang đang mở sẵn lúc admin vừa tải → gắn khung luôn
khungDs();

// ---------- mã GitHub ----------
const hop = doc.createElement('div'); hop.id = 'szHop';
doc.body.appendChild(hop);
const layMa = () => { try { return localStorage.getItem('bz_ma') || ''; } catch (e) { return ''; } };
function moHop(sauKhi){
  const kho = B.khoGH();
  hop.innerHTML = `<div class="giay" role="dialog" aria-label="Mã GitHub"><h3>Mã GitHub để lưu</h3>
    <p>Chỉ cần làm 1 lần trên mỗi máy. Mã nằm trong trình duyệt của máy này, không gửi đi đâu ngoài GitHub.</p>
    <ol><li>Mở <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">trang tạo mã của GitHub</a> (đã đăng nhập GitHub).</li>
    <li>Token name: <b>bluezii-admin</b>. Expiration: 1 năm (hoặc tuỳ anh).</li>
    <li>Repository access: <b>Only select repositories</b> → chọn <b>${esc(kho.split('/')[1])}</b>.</li>
    <li>Permissions → Repository permissions → <b>Contents: Read and write</b>. Bấm Generate token, chép mã (bắt đầu bằng <code>github_pat_</code>).</li></ol>
    <label for="szO">Dán mã vào đây</label><input id="szO" type="password" autocomplete="off" placeholder="github_pat_…" value="${esc(layMa())}">
    <label for="szK">Repo (thường để nguyên)</label><input id="szK" type="text" value="${esc(kho)}">
    <div class="hang"><button type="button" class="szNut do" id="szQuen">Quên mã trên máy này</button><button type="button" class="szNut" id="szHuy">Đóng</button><button type="button" class="szNut" id="szGiu" style="background:#111214;color:#fff">Lưu mã</button></div></div>`;
  hop.classList.add('mo');
  const dong = () => hop.classList.remove('mo');
  hop.querySelector('#szHuy').onclick = dong;
  hop.querySelector('#szQuen').onclick = () => { try { localStorage.removeItem('bz_ma'); } catch (e) {} hop.querySelector('#szO').value = ''; thongBao('Đã xoá mã khỏi máy này.'); };
  hop.querySelector('#szGiu').onclick = async () => {
    const ma = hop.querySelector('#szO').value.trim(), k = hop.querySelector('#szK').value.trim();
    if (!ma) return;
    try { localStorage.setItem('bz_ma', ma); if (k && k !== B.khoGH()) localStorage.setItem('bz_kho', k); } catch (e) {}
    const r = await gh(`/repos/${B.khoGH()}`).catch(er => er);
    if (r instanceof Error) { thongBao('Mã chưa dùng được: ' + r.message, 1, 1); return; }
    if (!(r.permissions && r.permissions.push)) { thongBao('Mã đọc được repo nhưng chưa có quyền ghi. Kiểm lại bước 4 (Contents: Read and write).', 1, 1); return; }
    dong(); thongBao('Mã dùng được. Giờ bấm "Lưu lên web".'); sauKhi && sauKhi();
  };
}
doc.getElementById('szMa').onclick = () => moHop();

// ---------- lưu: 1 commit gồm noi-dung.json + ảnh mới ----------
async function gh(duong, opt = {}){
  const r = await fetch('https://api.github.com' + duong, {...opt, cache:'no-store', headers:{Authorization:'Bearer ' + layMa(), Accept:'application/vnd.github+json', 'Content-Type':'application/json', ...(opt.headers || {})}});
  if (!r.ok) { let m = ''; try { m = (await r.json()).message; } catch (e) {} throw new Error(r.status === 401 ? 'mã sai hoặc hết hạn' : r.status === 403 || r.status === 404 ? 'mã không có quyền với repo này' : `GitHub báo lỗi ${r.status} ${m}`); }
  return r.json();
}
const b64 = blob => new Promise((ok, loi) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1]); fr.onerror = loi; fr.readAsDataURL(blob); });
async function luu(){
  if (!layMa()) { moHop(luu); return; }
  doc.activeElement && doc.activeElement.blur && doc.activeElement.blur();
  const nutLuu = doc.getElementById('szLuu'); nutLuu.disabled = true;
  try {
    const kho = B.khoGH();
    const dung = Object.keys(anhMoi).filter(n => B.ND.du_an.some(d => (d.anh || []).includes(n)));   // ảnh đã thêm rồi bỏ thì không tải lên
    thongBao(`Đang lưu${dung.length ? ` (kèm ${dung.length} ảnh)` : ''}…`, 0, 1);
    const ref = await gh(`/repos/${kho}/git/ref/heads/main`);
    const cm = await gh(`/repos/${kho}/git/commits/${ref.object.sha}`);
    const cay = [];
    for (const n of dung) {
      const bl = await gh(`/repos/${kho}/git/blobs`, {method:'POST', body:JSON.stringify({content: await b64(anhMoi[n]), encoding:'base64'})});
      cay.push({path:`web/anh/${n}.webp`, mode:'100644', type:'blob', sha:bl.sha});
    }
    const json = JSON.stringify(B.ND, null, 1) + '\n';
    const bj = await gh(`/repos/${kho}/git/blobs`, {method:'POST', body:JSON.stringify({content:json, encoding:'utf-8'})});
    cay.push({path:'bao-tang/noi-dung.json', mode:'100644', type:'blob', sha:bj.sha});
    const t = await gh(`/repos/${kho}/git/trees`, {method:'POST', body:JSON.stringify({base_tree:cm.tree.sha, tree:cay})});
    const moi = await gh(`/repos/${kho}/git/commits`, {method:'POST', body:JSON.stringify({message:`Admin: sửa nội dung (${ban} thay đổi${dung.length ? `, ${dung.length} ảnh` : ''})`, tree:t.sha, parents:[ref.object.sha]})});
    await gh(`/repos/${kho}/git/refs/heads/main`, {method:'PATCH', body:JSON.stringify({sha:moi.sha})});
    dung.forEach(n => delete anhMoi[n]);
    ban = 0; doc.querySelectorAll('[data-sua]').forEach(el => el._daDem = 0); capNhatThanh();
    thongBao('Đã lưu lên GitHub. Web thật đổi sau khoảng 1–2 phút (tải lại trang để xem).', 0, 1);
  } catch (er) {
    thongBao('Chưa lưu được: ' + er.message + '. Thay đổi vẫn còn trên trang, thử lại sau.', 1, 1); nutLuu.disabled = false;
  }
}
doc.getElementById('szLuu').onclick = luu;
window.__sua = {luu, lay, dat, get ban(){ return ban; }};
thongBao(layMa() ? 'Chế độ sửa. Bấm vào chữ có viền đứt để sửa.' : 'Chế độ sửa. Bấm vào chữ có viền đứt để sửa. Lần đầu lưu sẽ hỏi mã GitHub.');
})();
