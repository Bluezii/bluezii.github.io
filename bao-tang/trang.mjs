// gop-3 (10/11/2026): scene 3 "bảo tàng Hy Lạp đêm" (demo B, vòng 6) gắn vào trang gộp. TẠO TỰ ĐỘNG bằng scratchpad/tao_trang.py
// từ scene-3/demo-b-3d/index.html (không sửa nguồn): CSS gói trong #bt3, id trùng đổi tên (gl→bGl, tt→bTt, tp→bTp, the→bThe, tai→bTai),
// sự kiện toàn cục chỉ chạy khi HD (đang ở bảo tàng). Lùi ở cổng gọi khiLui() để trang gộp quay về não.
const CSS = "#bt3 { position: fixed; inset: 0; z-index: 30; display: none; background: var(--nen); color: var(--chu); font: 400 13px/1.55 \"IBM Plex Mono\", ui-monospace, monospace; overscroll-behavior: none; }\n#bt3.hien { display: block; }\n\n#bt3 { --nen: #03080a; --chu: #e8f1f0; --mo: rgba(232,241,240,.6); --do: #ff4d5e; --xanh: #9cc2ff; --phos: #e2efff; --f-to: VT323, monospace; --teal: #7fe3d6; color-scheme: dark; }\n#bt3, #bt3 * { box-sizing: border-box; }\n#bt3 { margin: 0; height: 100%; overflow: hidden; background: var(--nen); color: var(--chu); font: 400 13px/1.55 \"IBM Plex Mono\", ui-monospace, monospace; overscroll-behavior: none; }\n#bt3 canvas#bGl { position: fixed; inset: 0; width: 100vw; height: 100vh; display: block; touch-action: none; }\n#bt3 canvas#bGl.tro { cursor: pointer; }\n#bt3 .hud { position: fixed; z-index: 3; pointer-events: none; letter-spacing: .12em; text-transform: uppercase; font-size: 11px; color: var(--mo); transition: opacity .8s; }\n#bt3 #bTt { top: 18px; left: max(16px, env(safe-area-inset-left)); }\n#bt3 #bTt b { color: var(--chu); font-weight: 500; }\n#bt3 #bTp { top: 18px; right: max(16px, env(safe-area-inset-right)); text-align: right; font-variant-numeric: tabular-nums; }\n#bt3 #bTp .to { display: block; font: 400 34px/1 VT323, monospace; color: var(--chu); letter-spacing: .04em; }\n#bt3 #goi { left: 0; right: 0; bottom: 12%; text-align: center; font: 500 12px/1.4 \"IBM Plex Mono\", monospace; letter-spacing: .2em; color: rgba(255,233,240,.7); }\n#bt3 #goi i { display: block; font-style: normal; color: var(--xanh); animation: nhay 1.6s ease-in-out infinite; }\n@keyframes nhay { 50% { transform: translateY(5px); opacity: .5; } }\n/* nhãn điểm dừng: máy tính cột phải, điện thoại dưới */\n#bt3 #bang { position: fixed; z-index: 4; right: 0; top: 0; bottom: 0; width: min(480px, 36vw); padding: 96px 44px 64px 30px; display: flex; flex-direction: column; justify-content: center;\n  background: linear-gradient(90deg, rgba(3,8,10,0) 0%, rgba(3,8,10,.6) 24%, rgba(3,8,10,.86) 100%); opacity: 0; transition: opacity .7s; pointer-events: none; }\n#bt3 #bang.hien { opacity: 1; }\n#bt3 #bang.hien button { pointer-events: auto; }   /* bản 5: vuốt trên vùng nhãn vẫn tới canvas */\n#bt3 #bang.giua { left: 0; right: 0; top: auto; width: auto; align-items: center; text-align: center; padding: 0 16px 56px; background: linear-gradient(180deg, rgba(3,8,10,0), rgba(3,8,10,.75)); }\n#bt3 #bang.giua .mot { margin-inline: auto; }\n#bt3 #bang .loi { font: 500 12px/1.7 \"IBM Plex Mono\", monospace; color: #ff8a95; letter-spacing: .04em; margin: 0 0 18px; text-shadow: 0 0 12px rgba(255,77,94,.4); }\n#bt3 #bang .loi span { display: block; animation: giat 2.6s steps(1) infinite; }\n#bt3 #bang .loi span:nth-child(2) { animation-delay: .7s; color: rgba(232,241,240,.55); }\n@keyframes giat { 0%, 100% { transform: none; opacity: 1; } 92% { transform: translateX(6px); opacity: .4; } 94% { transform: translateX(-4px); opacity: 1; } }\n/* bản 5: chữ \"– now\" trong chớp flash */\n/* bản 6: chữ \"– now\" hiện theo độ X-quang (gắn theo cuộn, JS đặt opacity) */\n#bt3 #flash { position: fixed; inset: 0; z-index: 7; display: grid; place-items: center; align-content: center; gap: 10px; pointer-events: none; opacity: 0; font: 400 clamp(64px, 16vw, 200px)/1 VT323, monospace; color: #e8f6ff; letter-spacing: .02em; text-shadow: 0 0 30px rgba(156,194,255,.8); }\n#bt3 #flash small { font: 500 11px/1.4 \"IBM Plex Mono\", monospace; letter-spacing: .3em; color: rgba(226,239,255,.75); text-shadow: none; }\n#bt3 #bang article { display: none; }\n#bt3 #bang article.dang { display: block; animation: vao .5s ease-out; }\n@keyframes vao { from { opacity: 0; transform: translateY(8px); } }\n#bt3 .so { font-size: 12px; letter-spacing: .2em; color: var(--mo); }\n#bt3 #bang h2 { font: 400 54px/.92 var(--f-to); margin: 10px 0 8px; letter-spacing: .01em; text-wrap: balance; }\n#bt3 .nam { font: 400 34px/1 var(--f-to); color: var(--xanh); }\n#bt3 .vai { color: var(--mo); margin: 6px 0 16px; font-size: 15px; }\n#bt3 .mot { font-size: 17px; line-height: 1.5; margin: 0 0 22px; max-width: 34ch; }\n#bt3 .trong { color: rgba(232,241,240,.34); }\n#bt3 button.nut { font: 500 12px/1 \"IBM Plex Mono\", monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--chu); background: rgba(3,8,10,.35); border: 1px solid rgba(226,239,255,.22); border-radius: 999px;\n  padding: 12px 14px; cursor: pointer; transition: border-color .2s, background .2s, color .2s; }\n#bt3 button.nut:hover { border-color: rgba(226,239,255,.7); background: rgba(226,239,255,.07); }\n#bt3 button.nut.chinh { border-color: var(--phos); background: var(--phos); color: #05080c; padding: 14px 20px; box-shadow: 0 0 24px rgba(156,194,255,.25); }\n#bt3 button.nut.chinh:hover { background: #fff; box-shadow: 0 0 32px rgba(156,194,255,.45); }\n#bt3 button.nut:focus-visible { outline: 2px solid var(--xanh); outline-offset: 2px; }\n/* ô ??? bám hố đen */\n#bt3 #hoi { position: fixed; z-index: 3; transform: translate(-50%, -50%); width: 120px; height: 120px; border-radius: 50%; background: none; border: 0; padding: 0; cursor: pointer; opacity: 0; pointer-events: none; }\n#bt3 #hoi.hien { opacity: 1; pointer-events: auto; }\n#bt3 #hoi:focus-visible { outline: 1px dashed var(--xanh); outline-offset: 4px; }\n/* mũi tên 2 bên logo: chỉ dấu, không khung */\n#bt3 .mui { position: fixed; z-index: 4; transform: translate(-50%, -50%); width: 56px; height: 72px; border: 0; background: none; color: var(--phos); cursor: pointer;\n  display: grid; place-items: center; opacity: 0; pointer-events: none; transition: opacity .4s, color .2s; padding: 0; }\n#bt3 .mui span { font: 400 64px/1 VT323, monospace; text-shadow: 0 0 14px rgba(156,194,255,.55), 0 2px 6px #000; transition: transform .2s; }\n#bt3 .mui small { position: absolute; top: 62px; font: 500 9px/1 \"IBM Plex Mono\", monospace; letter-spacing: .18em; text-transform: uppercase; color: var(--mo); white-space: nowrap; text-shadow: 0 1px 4px #000; }\n#bt3 .mui.hien { opacity: 1; pointer-events: auto; }\n#bt3 .mui:hover { color: #fff; }\n#bt3 #muiTrai:hover span { transform: translateX(-4px); } #bt3 #muiPhai:hover span { transform: translateX(4px); }\n#bt3 .mui:focus-visible { outline: 1px dashed var(--xanh); outline-offset: 2px; }\n#bt3 #muiPhai.hien span { animation: goiM 2.4s ease-in-out infinite; }\n@keyframes goiM { 50% { transform: translateX(5px); } }\n/* bong bóng chú thích khi trỏ/bấm vật */\n#bt3 #bong { position: fixed; z-index: 6; transform: translate(-50%, calc(-100% - 12px)); max-width: min(280px, 80vw); padding: 10px 14px; border-radius: 14px; background: rgba(232,226,208,.94); color: #14110a;\n  font: 400 13px/1.4 \"IBM Plex Mono\", monospace; pointer-events: none; opacity: 0; transition: opacity .25s; box-shadow: 0 8px 28px rgba(0,0,0,.5); }\n#bt3 #bong b { display: block; font: 400 22px/1 VT323, monospace; margin-bottom: 4px; }\n#bt3 #bong::after { content: \"\"; position: absolute; left: 50%; bottom: -7px; width: 14px; height: 14px; background: inherit; transform: translateX(-50%) rotate(45deg); }\n#bt3 #bong.hien { opacity: 1; }\n#bt3 #goiY { left: 50%; top: 64px; transform: translateX(-50%); padding: 7px 12px; border: 1px solid rgba(226,239,255,.22); border-radius: 999px; background: rgba(3,8,10,.45); opacity: 0; }\n#bt3 #goiY.hien { opacity: 1; }\n/* bảng thông tin dự án */\n#bt3 #bThe { position: fixed; inset: 0; z-index: 10; background: rgba(2,5,6,.86); backdrop-filter: blur(8px); display: none; overflow-y: auto; overscroll-behavior: contain; }\n#bt3 #bThe.mo { display: block; animation: vao .35s ease-out; }\n#bt3 #bThe .giay { max-width: 1060px; margin: 0 auto; padding: 72px max(16px, 4vw) 64px; }\n#bt3 #bThe header { display: grid; grid-template-columns: 120px 1fr; gap: 24px; align-items: center; border-bottom: 1px solid rgba(232,241,240,.14); padding-bottom: 24px; }\n#bt3 #bThe .huy { width: 120px; height: 120px; border-radius: 50%; display: grid; place-items: center; padding: 22px; background: radial-gradient(circle at 40% 35%, rgba(255,255,255,.16), rgba(127,227,214,.06) 60%, transparent 72%); border: 1px solid rgba(127,227,214,.25); }\n#bt3 #bThe .huy img { max-width: 100%; max-height: 100%; }\n#bt3 #bThe .huy span { font: 400 30px/1 VT323, monospace; text-align: center; }\n#bt3 #bThe h3 { font: 400 60px/.92 var(--f-to); margin: 4px 0 6px; text-wrap: balance; }\n#bt3 #dongThe { position: fixed; top: 16px; right: max(16px, env(safe-area-inset-right)); z-index: 11; background: rgba(2,5,6,.7); }\n#bt3 .tt { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1px; background: rgba(232,241,240,.12); border: 1px solid rgba(232,241,240,.12); margin: 24px 0; }\n#bt3 .tt > div { background: #050b0d; padding: 14px 16px; }\n#bt3 .tt dt { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--mo); margin-bottom: 4px; }\n#bt3 .tt dd { margin: 0; font-size: 15px; }\n#bt3 #bThe h4 { font: 400 28px/1 var(--f-to); letter-spacing: .06em; text-transform: uppercase; color: var(--xanh); margin: 32px 0 12px; }\n#bt3 #bThe .dai, #bt3 #bThe ul { max-width: 64ch; font-size: 15px; line-height: 1.65; }\n#bt3 #bThe ul { padding-left: 1.1em; margin: 0; }\n#bt3 .luoi { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }\n#bt3 .luoi figure { margin: 0; }\n#bt3 .luoi .o { aspect-ratio: 4 / 3; background: #0b1214; border: 1px dashed rgba(232,241,240,.18); display: grid; place-items: center; text-align: center; color: var(--mo); padding: 14px; font-size: 12px; overflow: hidden; }\n#bt3 .luoi .o.vid { aspect-ratio: 16 / 9; }\n#bt3 .luoi .o img, #bt3 .luoi .o video { width: 100%; height: 100%; object-fit: cover; display: block; }\n#bt3 .luoi .o:has(img), #bt3 .luoi .o:has(video) { border-style: solid; padding: 0; }\n#bt3 .luoi small { display: block; opacity: .6; margin-top: 4px; font-size: 10px; word-break: break-all; }\n#bt3 .luoi figcaption { font-size: 10px; letter-spacing: .14em; color: var(--mo); margin-top: 6px; }\n/* hết scene */\n#bt3 #ket { position: fixed; inset: 0; z-index: 8; display: none; place-items: center; text-align: center; background: #000; touch-action: none; }\n#bt3 #ket.mo { display: grid; animation: vao 1.2s ease-out; }\n#bt3.het .hud { opacity: 0; }\n#bt3 #ket p { font: 500 12px/1.6 \"IBM Plex Mono\", monospace; letter-spacing: .2em; color: rgba(255,233,240,.72); margin: 0 0 22px; }\n#bt3 #ket p i { display: block; font-style: normal; color: var(--xanh); }\n/* bản tĩnh: giảm chuyển động / không WebGL / mất context */\n#bt3 #tinh { position: fixed; inset: 0; z-index: 5; display: none; background: var(--nen) url(bao-tang/tinh-cong.jpg) center / cover no-repeat; }\n#bt3 #tinh.hien { display: block; }\n#bt3 #tinh ol { position: absolute; left: max(16px, env(safe-area-inset-left)); right: 16px; bottom: max(28px, 6vh); margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 8px 28px; }\n#bt3 #tinh li { font: 400 30px/1 VT323, monospace; text-shadow: 0 0 18px rgba(0,0,0,.9); }\n#bt3 #tinh li span { display: block; font: 400 11px/1.5 \"IBM Plex Mono\", monospace; letter-spacing: .22em; color: var(--mo); }\n@media (max-aspect-ratio: 1/1) {\n  #bt3 #bang { top: auto; left: 0; width: auto; height: auto; max-height: 42vh; padding: 40px 16px calc(18px + env(safe-area-inset-bottom)); justify-content: flex-start; overflow-y: auto;\n    background: linear-gradient(180deg, rgba(3,8,10,0) 0%, rgba(3,8,10,.86) 20%, rgba(3,8,10,.95) 100%); }\n  #bt3 #bang h2 { font-size: 36px; margin: 6px 0 4px; }\n  #bt3 .vai { margin: 2px 0 10px; font-size: 13px; } #bt3 .mot { margin-bottom: 14px; font-size: 15px; } #bt3 .nam { font-size: 30px; }\n  #bt3 #goi { bottom: 22%; }\n  #bt3 #bThe header { grid-template-columns: 76px 1fr; gap: 14px; } #bt3 #bThe .huy { width: 76px; height: 76px; padding: 14px; } #bt3 #bThe h3 { font-size: 42px; }\n  #bt3 .luoi { grid-template-columns: 1fr; }\n}\n@media (prefers-reduced-motion: reduce) { #bt3 #bang article.dang, #bt3 #bThe.mo, #bt3 #ket.mo, #bt3 #goi i, #bt3 #muiPhai.hien span, #bt3 #bang .loi span { animation: none; } #bt3 #flash { display: none; } }\n/* bản 6: loé ảnh project cũ ở MEMORY (1 nhịp rồi nhiễu mất) */\n#bt3 #loe { position: fixed; z-index: 6; width: 220px; transform: translate(-50%, -50%); pointer-events: none; opacity: 0; }\n#bt3 #loe img { display: block; width: 100%; aspect-ratio: 16 / 11; object-fit: cover; border: 1px solid rgba(255,138,149,.5); box-shadow: 0 0 30px rgba(255,77,94,.35); }\n#bt3 #loe span { display: block; margin-top: 4px; font: 500 10px/1.3 \"IBM Plex Mono\", monospace; letter-spacing: .16em; text-transform: uppercase; color: #ff8a95; }\n#bt3 #loe.hien { animation: loe .9s steps(1, end) forwards; }\n@keyframes loe { 0% { opacity: 0; } 6% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); filter: none; } 40% { opacity: 1; transform: translate(-50%, -50%); filter: none; }\n  48% { opacity: .9; transform: translate(-46%, -50%); filter: hue-rotate(80deg) contrast(2) saturate(3); clip-path: inset(10% 0 52% 0); }\n  56% { opacity: .8; transform: translate(-55%, -50%); filter: grayscale(1) contrast(3) brightness(1.6); clip-path: inset(48% 0 12% 0); }\n  66% { opacity: .6; transform: translate(-50%, -52%); filter: blur(2px) contrast(4); clip-path: inset(0 0 70% 0); }\n  78% { opacity: .35; filter: blur(4px) brightness(2); clip-path: inset(30% 0 40% 0); } 100% { opacity: 0; } }\n/* bản 6: con trỏ riêng khi rê vào hố đen (bị kéo nhẹ về tâm) */\n#bt3 #troHo { position: fixed; z-index: 7; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%; border: 1.5px solid rgba(255,190,170,.85); pointer-events: none; opacity: 0;\n  box-shadow: 0 0 12px rgba(255,90,80,.6); }\n#bt3 #troHo::after { content: \"\"; position: absolute; left: 50%; top: 50%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #fff; }\n#bt3.hutTro canvas#bGl, #bt3.hutTro #hoi { cursor: none; }\n@media (prefers-reduced-motion: reduce) { #bt3 #loe.hien { animation: none; opacity: 0; } }\n/* ---------- bản 6: cửa sổ kiểu Finder (macOS, dark mode) cho Other Projects. Font hệ thống kiểu SF cho giống Finder thật ---------- */\n#bt3 #finder { position: fixed; inset: 0; z-index: 12; display: none; place-items: center; background: rgba(0,0,0,.55); backdrop-filter: blur(6px); padding: 16px;\n  font: 400 13px/1.35 -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", system-ui, sans-serif; color: #e6e6e6; }\n#bt3 #finder.mo { display: grid; animation: fMo .22s ease-out; }\n@keyframes fMo { from { opacity: 0; transform: scale(.97); } }\n#bt3 #finder .cs { width: min(960px, 100%); height: min(600px, calc(100vh - 32px)); display: grid; grid-template-rows: auto 1fr auto; background: #1e1e1e; border: 1px solid #3a3a3a; border-radius: 12px; overflow: hidden;\n  box-shadow: 0 30px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.06); }\n#bt3 #finder header { display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 14px; background: #2a2a2a; border-bottom: 1px solid #111; }\n#bt3 #finder .den { display: flex; gap: 8px; margin-right: 8px; }\n#bt3 #finder .d { width: 12px; height: 12px; border-radius: 50%; border: 0; padding: 0; display: block; }\n#bt3 #finder .d.do { background: #ff5f57; cursor: pointer; } #bt3 #finder .d.vang { background: #febc2e; } #bt3 #finder .d.xanh { background: #28c840; }\n#bt3 #finder .d.do:hover { box-shadow: inset 0 0 0 4px #ff5f57, inset 0 0 0 12px #7a1c17; }\n#bt3 #finder .d.do:focus-visible, #bt3 #finder .fl:focus-visible, #bt3 #finder .tep:focus-visible, #bt3 #finder .duong button:focus-visible { outline: 2px solid #0a84ff; outline-offset: 2px; }\n#bt3 #finder .fl { width: 28px; height: 26px; border-radius: 6px; border: 0; background: none; color: #d0d0d0; font: 400 22px/1 -apple-system, system-ui, sans-serif; cursor: pointer; }\n#bt3 #finder .fl:hover:not(:disabled) { background: #3a3a3a; } #bt3 #finder .fl:disabled { color: #5a5a5a; cursor: default; }\n#bt3 #finder .duong { flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n#bt3 #finder .duong button { border: 0; background: none; color: #9a9a9a; font: inherit; cursor: pointer; padding: 2px 4px; border-radius: 4px; }\n#bt3 #finder .duong button:hover { background: #3a3a3a; color: #fff; } #bt3 #finder .duong b { font-weight: 600; color: #f2f2f2; overflow: hidden; text-overflow: ellipsis; }\n#bt3 #finder .duong i { font-style: normal; color: #6a6a6a; }\n#bt3 #finder .tim { display: flex; align-items: center; gap: 6px; width: 160px; height: 28px; padding: 0 8px; border-radius: 7px; background: #1b1b1b; border: 1px solid #3a3a3a; color: #777; font-size: 12px; }\n#bt3 #finder .fthan { display: grid; grid-template-columns: 190px 1fr; min-height: 0; }\n#bt3 #finder aside { background: rgba(40,40,40,.92); border-right: 1px solid #111; padding: 12px 10px; overflow-y: auto; }\n#bt3 #finder aside h5 { margin: 12px 8px 4px; font-size: 11px; font-weight: 600; color: #7c7c7c; }\n#bt3 #finder aside h5:first-child { margin-top: 2px; }\n#bt3 #finder aside a { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 6px; color: #dcdcdc; text-decoration: none; cursor: default; }\n#bt3 #finder aside a.chon { background: rgba(255,255,255,.1); }\n#bt3 #finder aside a svg { width: 16px; height: 16px; flex: none; color: #0a84ff; }\n#bt3 #finder aside .tag { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }\n#bt3 #finder main { overflow-y: auto; padding: 20px 22px; background: #1e1e1e; }\n#bt3 #finder .luoiF { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 18px 10px; align-content: start; }\n#bt3 #finder .tep { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px 4px; border: 0; border-radius: 8px; background: none; color: #e6e6e6; font: inherit; cursor: default; text-align: center; }\n#bt3 #finder .tep .hinh { width: 72px; height: 60px; display: grid; place-items: center; }\n#bt3 #finder .tep .hinh img, #bt3 #finder .tep .hinh video { max-width: 72px; max-height: 60px; border-radius: 3px; object-fit: cover; box-shadow: 0 1px 3px rgba(0,0,0,.6); }\n#bt3 #finder .tep span { font-size: 12px; line-height: 1.25; padding: 1px 5px; border-radius: 4px; max-width: 100%; word-break: break-word; }\n#bt3 #finder .tep small { font-size: 11px; color: #8a8a8a; margin-top: -4px; }\n#bt3 #finder .tep.chon .hinh { background: rgba(255,255,255,.1); border-radius: 6px; } #bt3 #finder .tep.chon span { background: #0a5fd1; color: #fff; }\n#bt3 #finder .tep .trongF { width: 64px; height: 52px; border: 1px dashed #555; border-radius: 4px; display: grid; place-items: center; color: #777; font: 11px/1 \"IBM Plex Mono\", monospace; }\n#bt3 #finder .moTaF { display: grid; gap: 4px; margin: 0 0 18px; padding: 0 0 14px; border-bottom: 1px solid #2e2e2e; }\n#bt3 #finder .moTaF b { font-size: 17px; font-weight: 600; } #bt3 #finder .moTaF span { color: #9a9a9a; }\n#bt3 #finder footer { height: 28px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #8a8a8a; background: #262626; border-top: 1px solid #111; }\n#bt3 #finder .xem { position: absolute; inset: 0; display: none; place-items: center; background: rgba(0,0,0,.85); }\n#bt3 #finder .xem.mo { display: grid; } #bt3 #finder .xem img, #bt3 #finder .xem video { max-width: 92%; max-height: 86%; border-radius: 6px; }\n#bt3 #finder .cs { position: relative; }\n@media (max-width: 700px) {\n  #bt3 #finder { padding: 0; } #bt3 #finder .cs { width: 100%; height: 100%; border-radius: 0; border: 0; }\n  #bt3 #finder .fthan { grid-template-columns: 1fr; } #bt3 #finder aside, #bt3 #finder .tim { display: none; }\n  #bt3 #finder header { padding-top: env(safe-area-inset-top); height: calc(52px + env(safe-area-inset-top)); }\n  #bt3 #finder .luoiF { grid-template-columns: repeat(3, 1fr); gap: 14px 4px; } #bt3 #finder main { padding: 16px 12px calc(16px + env(safe-area-inset-bottom)); }\n}\n@media (prefers-reduced-motion: reduce) { #bt3 #finder.mo { animation: none; } }\n\n#bt3 #goi { display: none; }   /* gop-3: gợi ý cuộn nằm trong nhãn cổng (khỏi đè chữ Night shift) */";
const HTML = "<canvas id=\"bGl\" aria-label=\"Greek museum at night, 3D: each Bluezii project is a logo carved in marble, newest to oldest\"></canvas>\n<div class=\"hud\" id=\"bTt\"><b>Projects</b><br>a museum in reverse</div>\n<div class=\"hud\" id=\"bTp\"><span class=\"to\" id=\"dem\">NOW</span><span id=\"demTong\"></span></div>\n<div class=\"hud\" id=\"goi\">Scroll or swipe<i>↓</i></div>\n<main id=\"bang\" aria-live=\"polite\"></main>\n<button id=\"hoi\" aria-label=\"Many more projects: enter the black hole\"></button>\n<button class=\"mui\" id=\"muiTrai\" aria-label=\"Newer project\"><span>‹</span><small>newer</small></button>\n<button class=\"mui\" id=\"muiPhai\" aria-label=\"Older project\"><span>›</span><small>older</small></button>\n<div id=\"bong\" role=\"status\"></div>\n<div class=\"hud\" id=\"goiY\">drag to look around</div>\n<div id=\"troHo\" aria-hidden=\"true\"></div>\n<div id=\"flash\" aria-hidden=\"true\">– now<small>X-RAY · KEEP SCROLLING</small></div>\n<div id=\"finder\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"fTieuDe\">\n  <div class=\"cs\">\n    <header><div class=\"den\"><button class=\"d do\" id=\"fDong\" aria-label=\"Close window\"></button><span class=\"d vang\"></span><span class=\"d xanh\"></span></div>\n      <button class=\"fl\" id=\"fLui\" aria-label=\"Back\" disabled>‹</button><button class=\"fl\" aria-label=\"Forward\" disabled>›</button>\n      <nav class=\"duong\" id=\"fDuong\" aria-label=\"Path\"></nav><div class=\"tim\" aria-hidden=\"true\">⌕ Search</div></header>\n    <div class=\"fthan\">\n      <aside aria-label=\"Sidebar\"><h5>Favorites</h5>\n        <a class=\"chon\"><svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M1 4.5A1.5 1.5 0 0 1 2.5 3h3.6l1.4 1.5h6A1.5 1.5 0 0 1 15 6v6.5A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5z\"/></svg>Other Projects</a>\n        <a><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"8\" cy=\"8\" r=\"6\"/><path d=\"M8 4.5V8l2.5 1.5\"/></svg>Recents</a>\n        <a><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"9\" rx=\"1.5\"/><path d=\"M5 14h6\"/></svg>Desktop</a>\n        <a><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M4 1.8h5.5L12.5 5v9.2H4z\"/></svg>Documents</a>\n        <a><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"8\" cy=\"8\" r=\"6\"/><path d=\"M8 4.5v6M5.5 8.5 8 11l2.5-2.5\"/></svg>Downloads</a>\n        <h5>Locations</h5><a><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"8\" rx=\"1\"/><path d=\"M1 13.5h14\"/></svg>Bluezii's Mac</a>\n        <h5>Tags</h5><a><i class=\"tag\" style=\"background:#ff5f57\"></i>Antimusic</a><a><i class=\"tag\" style=\"background:#a86bff\"></i>Experiments</a><a><i class=\"tag\" style=\"background:#28c840\"></i>Archive</a>\n      </aside>\n      <main id=\"fNoi\" tabindex=\"-1\"></main>\n    </div>\n    <footer id=\"fChan\"></footer>\n    <div class=\"xem\" id=\"fXem\" role=\"dialog\" aria-label=\"Preview\"></div>\n  </div>\n</div>\n<div id=\"bThe\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"theTen\"><button class=\"nut\" id=\"dongThe\">Close ✕</button><div class=\"giay\" id=\"theGiay\"></div></div>\n<div id=\"ket\" aria-live=\"polite\"><div><p>END OF THE MUSEUM<br><br>NEXT · SKILLS<i>↓</i></p><button class=\"nut\" id=\"luiRa\">‹ back out</button> <button class=\"nut\" id=\"lai\">↺ back to the gate</button></div></div>\n<div id=\"tinh\" role=\"img\" aria-label=\"Museum gate at night, still image\"><ol id=\"tinhDs\"></ol></div>";
export async function moBaoTang({ khiLui, khiXong } = {}) {
let HD = false;
{ const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); }
const GOC = document.createElement('div'); GOC.id = 'bt3'; GOC.innerHTML = HTML; document.body.appendChild(GOC);

const $ = id => document.getElementById(id);
const cv = $('bGl');
// ---------- nội dung: noi-dung.json, bỏ Diners, xếp năm giảm dần ----------
const COSO = new URL('./', import.meta.url).href;   // gop-3: mọi tài nguyên nằm trong bao-tang/
const nd = await fetch(COSO + 'noi-dung.json', { cache: 'no-cache' }).then(r => r.json());   // 13/11 admin: luôn hỏi lại bản mới (anh sửa qua ?sua)
const namDau = d => +((d.nam || '').match(/\d{4}/)?.[0] || 0);
// bản 6: thứ tự do chủ dự án chốt (không xếp theo năm). Other Projects chưa có trong noi-dung.json → tạo tại đây, nội dung chờ điền.
const THU_TU = ['antimusic', 'electric', 'dien-nang', 'gaztik', 'mikenco', 'freelance'];   // 13/11 anh: bỏ cột Other Projects
const OTHER = { id: 'other', ten: 'Other Projects', nam: '[...]', vai_tro: '[...]', mot_dong: 'Click to view more projects', mo_ta_web: '[...]', lam_gi: ['[...]'], link: '' };
const duAn = THU_TU.map(id => id === 'other' ? OTHER : nd.du_an.find(d => d.id === id)).filter(Boolean);
const nhieu = nd.du_an.find(d => d.id === 'va-nua') || { ten: '& many many more…' };   // 13/11: Entropy chưa có năm → không lấy 'dự án không năm' nữa
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
$('tinhDs').innerHTML = duAn.map((d, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(d.ten)}</li>`).join('');
// bản tĩnh trước khi tải three.js
const coGL = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; } })();
const tinh = () => { $('tinh').classList.add('hien'); cv.style.display = 'none'; ['goi', 'bang', 'muiTrai', 'muiPhai', 'hoi'].forEach(i => $(i).style.display = 'none'); };
if (matchMedia('(prefers-reduced-motion: reduce)').matches || !coGL) { tinh(); return { tinh: true, chay() {}, dung() {}, vao() {}, kichHoat(b) { HD = b; }, info: () => null }; }
const { khoiTao } = await import('./canh.mjs');
const bt = await khoiTao({ canvas: cv, coSo: COSO, duAn, cho: true });
bt.khiMatContext(tinh);

// ---------- điểm dừng ----------
// bản 5: 10 điểm dừng (hành lang cũ + phế tích gộp thành "MEMORY IS BROKEN")
const tram = [{ loai: 'cong' }, { loai: 'cua' }, ...duAn.map((da, i) => ({ loai: 'du-an', da, so: i + 1, k: i })), { loai: 'vo' }, { loai: 'ho-den', da: nhieu }];
const namHien = s => String(s ?? '').replace(/\s*[–-]\s*nay$/i, ' – now');
const bang = $('bang');
const trongHoac = s => (!s || s === '[...]') ? '' : esc(s);   // 13/11 anh: bỏ hết chữ nháp
const ANH_WEB = { antimusic: ['antimusic-1', 'am-bday', 'am-mieng', 'antimusic-2'], electric: ['el-full', 'el-back', 'el-store', 'el-noi'], 'dien-nang': ['dn-lua', 'diennang-1', 'dn-alien', 'dn-crowd'], gaztik: ['gz-sawadika', 'gaztik-1', 'gz-coming'], mikenco: ['mik-angel', 'mik-kv', 'mik-duo', 'mik-sofa'], freelance: ['fr-lavish', 'fr-hnx', 'fr-blackred', 'fr-hnx2'] };
bang.innerHTML = tram.map((t, i) => {
  if (t.loai === 'cong') return `<article data-i="${i}"><div class="so">THE GATE</div><h2>Night shift.</h2><p class="mot">Two guards, one open door. Newest work first, oldest last.</p><div class="so">SCROLL OR SWIPE <i style="font-style:normal;color:var(--xanh)">↓</i></div></article>`;
  if (t.loai === 'cua') return `<article data-i="${i}"><div class="so">THE DOOR</div><h2>Come in.</h2><p class="mot">Warm light inside. The museum runs backwards in time.</p></article>`;
  if (t.loai === 'vo') return `<article data-i="${i}"><div class="so">ERR 0x0000DEAD</div><h2>MEMORY IS BROKEN</h2><p class="loi"><span>&gt; read /archive/before-2019 … FAILED</span><span>&gt; 37 fragments recovered, 0 readable</span></p><p class="mot">The older it gets, the less it remembers. Keep going.</p></article>`;
  if (t.loai === 'ho-den') return `<article data-i="${i}"><div class="so">UNCATALOGUED</div><h2>${esc(t.da.ten)}</h2><p class="mot">Something in the frame is pulling. Touch the ??? if you dare.</p><button class="nut chinh" data-sup>Touch it</button></article>`;
  const d = t.da;
  if (d.id === 'other') return `<article data-i="${i}" id="other"><div class="so">PROJECT ${String(t.so).padStart(2, '0')} / ${String(duAn.length).padStart(2, '0')}</div>
    <h2>${esc(d.ten)}</h2><div class="nam">${trongHoac(d.nam)}</div><div class="vai">${trongHoac(d.vai_tro)}</div>
    <p class="mot">${esc(d.mot_dong)}</p><button class="nut chinh" data-finder>Open the folder ↗</button></article>`;
  return `<article data-i="${i}" id="${esc(d.id)}"><div class="so">PROJECT ${String(t.so).padStart(2, '0')} / ${String(duAn.length).padStart(2, '0')}</div>
    <h2>${esc(d.ten)}</h2><div class="nam">${esc(namHien(d.nam))}</div><div class="vai">${esc(d.vai_tro)}</div>
    <p class="mot">${esc(d.mot_dong)}</p><button class="nut chinh" data-mo="${i}">Open the file ↗</button></article>`;
}).join('');
let muc = 0;
function capNhat() {
  const t = tram[muc];
  bang.querySelectorAll('article').forEach(a => a.classList.toggle('dang', +a.dataset.i === muc));
  bang.classList.toggle('giua', t.loai === 'cong' || t.loai === 'cua');
  $('dem').textContent = giua() ? (uC < 1 ? 'X-RAY' : uC < IVO ? 'SCAN' : '····') : t.loai === 'du-an' ? (t.da.nam.match(/\d{4}/)?.[0] ?? 'MORE') : t.loai === 'vo' ? 'ERR' : t.loai === 'ho-den' ? '????' : 'NOW';
  $('demTong').textContent = `${String(muc + 1).padStart(2, '0')} / ${tram.length}`;
  $('goi').style.opacity = muc === 0 && !giua() ? 1 : 0;
}
// bản 6: 3 đoạn đi THEO CUỘN (lăn/vuốt tới đâu máy quay + hiệu ứng chạy tới đó, dừng là dừng):
//   cổng → cửa (X-quang, có nấc dừng giữa u = .5) · logo cuối → MEMORY (quét LiDAR + pixel sort) · MEMORY → hố đen (thấu kính kéo dần).
//   Các đoạn khác vẫn 1 lần lăn = 1 điểm dừng. uC = vị trí máy quay theo đơn vị điểm dừng.
const IVO = tram.findIndex(t => t.loai === 'vo'), IHO = tram.length - 1;
const DOAN_CUON = [[0, 1], [IVO - 1, IVO], [IVO, IHO]];
let uC = 0, khoa = 0, tich = 0;
// anh 11/11 (sửa cuộn): cả bảo tàng đi THEO CUỘN liền như phòng (scene 1): lăn tới đâu máy quay đi tới đó, dừng là dừng.
//   900 px lăn / điểm dừng (= tỉ lệ các đoạn cuộn cũ cổng→cửa, MEMORY→hố đen): 1 lần vuốt trackpad ≈ 1 điểm, chuột ~3 nấc là sang điểm kế.
//   Thả tay ~0,2 s thì máy quay trượt về điểm dừng (đi quá 1/4 quãng thì sang điểm kế theo hướng đang cuộn; nấc X-quang .5 vẫn là 1 điểm dừng) để nhãn hiện.
//   Ra 2 đầu (lùi về não / bị hút vào hố đen) chỉ khi lần lăn MỚI bắt đầu lúc đã đứng sẵn ở đầu đó → quán tính trackpad không đẩy qua.
// anh 13/11: cuộn bảo tàng giống scene 1–2: cuộn nhẹ cũng đi, dừng tay ở đâu đứng ở đó (bỏ trượt về điểm dừng), 520 px / điểm (cũ 900)
const PX_TRAM = +new URLSearchParams(location.search).get('pxTram') || 520;
const BAM_NAC = new URLSearchParams(location.search).has('bamNac');   // ?bamNac = bật lại kiểu cũ (thả tay trượt về điểm dừng)
const NAC_DUNG = [0, .5, ...tram.slice(1).map((_, i) => i + 1)];
const ganNac = v => NAC_DUNG.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
let tLanBT = 0, uDauCu = 0;
const moLop = () => $('bThe').classList.contains('mo') || $('finder').classList.contains('mo');
function giua() { return DOAN_CUON.some(([a, b]) => uC > a + .002 && uC < b - .002); }
function dangGiua() { return Math.abs(uC - ganNac(uC)) > .002 || uC === .5; }   // chưa đứng đúng 1 điểm dừng có nhãn
function keoTuDo(v) { uC = Math.max(0, Math.min(IHO, v)); bt.keoU(uC); muc = Math.max(0, Math.round(uC - .001)); capNhat(); }
const doanTai = (u0, h) => bt.dangDi() ? null : DOAN_CUON.find(([a, b]) => u0 >= a - .002 && u0 <= b + .002 && !(u0 >= b - .002 && h > 0) && !(u0 <= a + .002 && h < 0)) || null;
function keoDoan(v, d) {
  d = d || DOAN_CUON.find(([a, b]) => v >= a - .002 && v <= b + .002); if (!d) return;
  uC = Math.max(d[0], Math.min(d[1], v)); bt.keoU(uC);
  const tron = Math.round(uC); if (Math.abs(uC - tron) < .002 && tron !== muc) { muc = tron; khoa = performance.now() + 450; }
  capNhat();
}
function di(i) { if (bt.dangSup() || moLop()) return; i = Math.max(0, Math.min(tram.length - 1, i)); if (i === muc && !bt.dangDi() && !dangGiua()) return;
  muc = i; uC = i; bt.denDiem(i); capNhat(); }
// bản 6: bỏ datamosh (logo cuối → MEMORY → hố đen); thay bằng LiDAR + thấu kính hấp dẫn gắn theo u trong canh.mjs
capNhat();
// bản 6: đang/đã bị hút: lùi = tua ngược hiệu ứng hút về lại hố đen; tiến = hút tiếp
function luiRa() { $('ket').classList.remove('mo'); GOC.classList.remove('het'); bt.tuaLai(() => { muc = IHO; uC = IHO; capNhat(); }); }
const buoc = h => { if (bt.dangSup()) { if (h < 0) luiRa(); else bt.tienLai(); return; } if (bt.dangDi()) return;
  if (h < 0 && muc === 0 && uC <= .002) { khiLui && khiLui(); return; }   // gop-3: lùi ở cổng = về lại não
  const d = doanTai(uC, h);
  if (d) { const nac = d[0] === 0 ? [0, .5, 1] : d, v = h > 0 ? nac.find(x => x > uC + .01) : [...nac].reverse().find(x => x < uC - .01); if (v !== undefined) { keoDoan(v, d); return; } }
  if (h > 0 && muc === tram.length - 1) { sup(); return; } di(muc + h); };
// cuộn liền (thay bản nấc + hàng chờ choBuoc: hàng chờ biến quán tính trackpad thành nấc thứ 2 → lỗi "double scroll")
function cuonBT(d, moi) {
  if (moi) { uDauCu = uC; tich = 0; }
  if (d > 0 && uC >= IHO - .002) { if (uDauCu >= IHO - .002 && bt.u() >= IHO - .01) { tich += d; if (tich > 60) { tich = 0; uDauCu = -1; sup(); } } return; }   // hút: phải là lần lăn mới ở hố đen
  if (d < 0 && uC <= .002) { if (uDauCu <= .002 && bt.u() <= .01) { tich += d; if (tich < -60) { tich = 0; uDauCu = -1; khiLui && khiLui(); } } return; }   // gop-3: lùi ở cổng = về lại não
  keoTuDo(uC + d / PX_TRAM);
}
let choCuMoi = false; window.__btCuon = () => ({ uC, uDauCu, tLanBT, choCuMoi, HD });   // soi lỗi cuộn   // vừa vào bảo tàng: bỏ phần quán tính còn lại của cú vuốt chuyển cảnh, chờ lần vuốt mới
addEventListener('wheel', e => { const now = e.timeStamp || performance.now();   // giờ TẠO sự kiện: trang khựng (não khôi phục GPU) không làm 1 lần vuốt thành 2
  const moi = now - tLanBT > 220; tLanBT = now;   // ghi giờ cả khi chưa ở bảo tàng → biết được cú vuốt đang dở từ trước
  if (!HD || moLop()) return; e.preventDefault();
  if (choCuMoi) { if (!moi) return; choCuMoi = false; }
  const d = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 800 : 1);
  if (bt.dangSup()) { if (moi && Math.abs(d) > 4) buoc(Math.sign(d)); return; }   // đang/đã bị hút: lùi = tua ngược, tiến = hút tiếp
  if (bt.dangDi()) return;                                                           // đang đi bằng nút ‹ › / phím
  cuonBT(d, moi); }, { passive: false });
// thả tay → trượt về điểm dừng gần nhất
setInterval(() => { if (!BAM_NAC || !HD || moLop() || keo || bt.dangDi() || bt.dangSup() || performance.now() - tLanBT < 300) return;   // 300 ms: trang khựng giữa lần vuốt không làm hút sớm
  let n = ganNac(uC); const goc = ganNac(Math.max(0, uDauCu)), h = Math.sign(uC - goc);
  if (n === goc && h) { const ke = h > 0 ? (NAC_DUNG.find(x => x > goc + .01) ?? goc) : ([...NAC_DUNG].reverse().find(x => x < goc - .01) ?? goc);
    if (Math.abs(uC - goc) > .25 * Math.abs(ke - goc)) n = ke; }   // đi quá 1/4 quãng → sang điểm kế
  if (Math.abs(n - uC) > .0005) keoTuDo(n); }, 60);   // không đổi uDauCu: lỡ hút giữa chừng thì lần trượt sau vẫn tính từ điểm bắt đầu vuốt
addEventListener('touchmove', e => { if (HD && !e.target.closest('#bThe, #finder')) e.preventDefault(); }, { passive: false });
// bản 5, khoá trục: chạm và kéo > 10 px thì chốt 1 trục cho cả lần vuốt.
//   vuốt dọc = sang điểm dừng (không xoay nhìn), vuốt ngang = xoay nhìn quanh (không chuyển điểm). Chuột: kéo = nhìn tự do, lăn = chuyển điểm.
let keo = null;
cv.addEventListener('pointerdown', e => { keo = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), di: 0, cham: e.pointerType !== 'mouse', truc: null, u0: uC, keoDoan: false };
  if (e.pointerType !== 'mouse') { const c = bt.chonTai(e.clientX, e.clientY); if (c?.loai === 'ho') { bt.huHo(true); keo.giuHo = true; } }   /* điện thoại: chạm giữ hố đen = hút nhẹ */ try { cv.setPointerCapture(e.pointerId); } catch (_) { } });
cv.addEventListener('pointermove', e => {
  if (!keo) { if (e.pointerType === 'mouse') troVao(e.clientX, e.clientY); return; }
  const dx = e.clientX - keo.x, dy = e.clientY - keo.y; keo.x = e.clientX; keo.y = e.clientY;
  const tx = e.clientX - keo.x0, ty = e.clientY - keo.y0;
  keo.di = Math.max(keo.di, Math.hypot(tx, ty));
  if (!keo.truc && keo.di > (keo.cham ? 10 : 6)) keo.truc = !keo.cham ? 'tudo' : Math.abs(ty) > Math.abs(tx) * 1.15 ? 'doc' : 'ngang';
  if (keo.truc === 'tudo') { bt.nhinKeo(dx, dy); daKeo(); }
  else if (keo.truc === 'ngang') { bt.nhinKeo(dx * 1.15, dy * .25); daKeo(); }
  else if (keo.truc === 'doc' && !bt.dangSup() && !bt.dangDi()) {   // sửa cuộn 11/11: vuốt dọc = kéo liên tục theo ngón tay, cùng tỉ lệ ×2,4 như phòng / não
    keoTuDo(keo.u0 + (keo.y0 - e.clientY) * 2.4 / PX_TRAM); keo.keoDoan = true; tLanBT = performance.now(); uDauCu = keo.u0;
  }
});
cv.addEventListener('pointerup', e => {
  if (!keo) return; const k = keo; keo = null; bt.nhinTha();
  if (k.giuHo) { bt.huHo(false); if (performance.now() - k.t0 > 350 && !(k.truc === 'doc' && Math.abs(k.y0 - e.clientY) > 36)) return; }   // sửa lỗi 13/11 (điện thoại): vuốt lên bắt đầu ngay trên hố đen mà chậm hơn 0,35 s trước đây bị coi là "chạm giữ rồi thả" → không bị hút. Nay vuốt dọc > 36 px luôn tính là vuốt.
    // thả tay = nhả; giữ lâu thì không tính là bấm
  const dy = k.y0 - e.clientY;
  if (k.truc === 'doc') {   // vuốt ra 2 đầu: chỉ khi lúc chạm đã đứng sẵn ở đầu đó
    if (Math.abs(dy) > 36 && ((dy > 0 && k.u0 >= IHO - .002) || (dy < 0 && k.u0 <= .002) || bt.dangSup())) buoc(Math.sign(dy));
    return; }
  if (k.di < 8) bam(e.clientX, e.clientY);
});
cv.addEventListener('pointercancel', () => { keo = null; bt.nhinTha(); bt.huHo(false); });
cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') bt.huHo(false); });
// nghiêng máy (điện thoại): lệch nhẹ hướng nhìn
addEventListener('deviceorientation', e => { if (HD && e.gamma != null) bt.nghieng(e.gamma, e.beta); });
// gợi ý lần đầu
const goiY = $('goiY'); let daGoi = false; try { daGoi = localStorage.getItem('demoB-keo') === '1'; } catch (e) { }
if (!daGoi) setTimeout(() => goiY.classList.add('hien'), 1800);
function daKeo() { if (daGoi) return; daGoi = true; goiY.classList.remove('hien'); try { localStorage.setItem('demoB-keo', '1'); } catch (e) { } }
// ---------- tương tác: trỏ / bấm vật → viền sáng + bong bóng chú thích ----------
const CAU = {
  apollo: ['Apollo Belvedere', 'God of light. Still looking for the light switch.'],
  amazon: ['Wounded Amazon', 'Tripped over the velvet rope. Around 440 BC.'],
  zeus: ['Zeus', 'Head of the board. The rest of him is in a meeting.'],
  dio: ['Torso of Dionysos', 'Left his head at the afterparty.'],
  cogai: ['The Greek Slave', 'Politely ignoring you since 1844.'],
  banthan: ['Marble bust', 'All chin, no budget.'],
  binh: ['Neck amphorae', 'Used to hold wine. Now holds secrets.'],
  tu: ['Amphorae in a case', 'Fragile. Like the Wi-Fi in here.'],
  phu: ['Under restoration', 'Or hiding. We don’t ask.'],
  xuong0: ['Guard #1', ['Ticket? …Kidding. Go in.', 'I salute every visitor. My arm is tired.', 'Night shift pays in exposure.', 'Eyes up here. Well, sockets.']],
  xuong1: ['Guard #2', ['*yawns* …we close at never.', 'Don’t touch the art. Touch grass.', 'I’m not lazy, I’m load-bearing.', 'Baton? Decorative. Mostly.']],
  bien: ['Please do not touch', 'You touched it. Security has been notified.'],
};
let lanNoi = 0;
const bong = $('bong');
function hienBong(c, chu, tieuDe) { bong.innerHTML = `<b>${esc(tieuDe)}</b>${esc(chu)}`; bong.style.left = c.x + 'px'; bong.style.top = c.y + 'px'; bong.classList.add('hien'); clearTimeout(hienBong.h); hienBong.h = setTimeout(() => bong.classList.remove('hien'), 3200); }
function troVao(x, y) {
  if (bt.dangSup()) return; const c = bt.chonTai(x, y); bt.danhDau(c);
  cv.classList.toggle('tro', !!c);
  bt.huHo(c?.loai === 'ho');
  if (c?.loai === 'manh' && tram[muc].loai === 'vo') loeAnh(c.x, c.y);
  if (c && c.loai !== 'logo' && c.loai !== 'ho' && c.loai !== 'bien' && !c.loai.startsWith('xuong')) { const t = CAU[c.loai]; if (t && bong.dataset.loai !== c.loai) { hienBong(c, t[1], t[0]); bong.dataset.loai = c.loai; } }
  if (!c) bong.dataset.loai = '';
}
function bam(x, y) {
  const c = bt.chonTai(x, y); if (!c) return;
  if (c.loai === 'ho') { sup(); return; }
  if (c.loai === 'manh') { loeAnh(c.x, c.y); return; }
  if (c.loai === 'logo') { const i = 2 + c.k; if (i === muc && !bt.dangDi()) moThe(i); else di(i); return; }   // bấm quyển sách (Other Projects) khi đang đứng đó → mở Finder (moThe chuyển)
  bt.danhDau(c);
  const t = CAU[c.loai]; if (!t) return;
  if (c.loai === 'bien') { bt.canhBao(); hienBong(c, t[1], 'Hey!'); return; }
  const chu = Array.isArray(t[1]) ? t[1][lanNoi++ % t[1].length] : t[1];
  hienBong(c, chu, t[0]);
}
addEventListener('keydown', e => {
  if (!HD) return;
  if ($('finder').classList.contains('mo')) { if (e.key === 'Escape') { if ($('fXem').classList.contains('mo')) $('fXem').classList.remove('mo'); else dongFinder(); } return; }
  if ($('bThe').classList.contains('mo')) { if (e.key === 'Escape') dongThe(); return; }
  if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); buoc(1); }
  if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); buoc(-1); }
  if (e.key === 'Enter' && tram[muc]?.loai === 'du-an') moThe(muc);
});
bang.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.mo) moThe(+b.dataset.mo); if ('sup' in b.dataset) sup(); if ('finder' in b.dataset) moFinder(); });
$('hoi').onclick = () => { if ($('hoi').dataset.giu === '1') { $('hoi').dataset.giu = ''; return; } sup(); };
// bản 6: ô ??? cũng nhận rê chuột / chạm giữ (hố hút nhẹ); giữ lâu rồi thả thì không hút hẳn
$('hoi').addEventListener('pointerenter', () => bt.huHo(true)); $('hoi').addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') bt.huHo(false); });
$('hoi').addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { bt.huHo(true); $('hoi').dataset.t0 = performance.now(); $('hoi').dataset.y0 = e.clientY; } });
// sửa lỗi 13/11 (điện thoại): vuốt lên bắt đầu ngay trên ô ??? trước đây không làm gì (ô này che canvas nên canvas không nhận cú vuốt) → nay vuốt lên > 36 px = bị hút như vuốt ở chỗ khác
$('hoi').addEventListener('pointerup', e => { if (e.pointerType !== 'mouse' && +$('hoi').dataset.y0 - e.clientY > 36) { $('hoi').dataset.giu = ''; bt.huHo(false); sup(); } });
$('hoi').style.touchAction = 'none';
$('hoi').addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') { bt.huHo(false); if (performance.now() - +$('hoi').dataset.t0 > 350) $('hoi').dataset.giu = '1'; } });
// ---------- bản 6, C: MEMORY — rê/chạm mảnh vỡ → loé ảnh project cũ 1 nhịp rồi nhiễu mất ----------
// Ảnh thật lấy ở noi-dung/anh/<id>/1.jpg khi có; chưa có thì dùng ảnh mờ nhiễu vẽ tại chỗ (tên project + màu brand).
const MAU_DA = { antimusic: '#ff4a12', electric: '#1f6bff', 'dien-nang': '#39ff6a', gaztik: '#8a4dff', mikenco: '#ffa920', other: '#a86bff', freelance: '#22e0c4' };
const anhMoCache = {};
function anhMo(d) {
  if (anhMoCache[d.id]) return anhMoCache[d.id];
  const c = document.createElement('canvas'); c.width = 320; c.height = 220; const x = c.getContext('2d');
  x.fillStyle = '#0a0f10'; x.fillRect(0, 0, 320, 220); x.filter = 'blur(6px)';
  for (let i = 0; i < 9; i++) { x.fillStyle = MAU_DA[d.id] || '#9fd8d0'; x.globalAlpha = .15 + Math.random() * .35; x.fillRect(Math.random() * 300 - 40, Math.random() * 200 - 30, 60 + Math.random() * 160, 40 + Math.random() * 120); }
  x.filter = 'none'; x.globalAlpha = 1; const im = x.getImageData(0, 0, 320, 220);
  for (let i = 0; i < im.data.length; i += 4) { const n = (Math.random() - .5) * 70; im.data[i] += n; im.data[i + 1] += n; im.data[i + 2] += n; }
  x.putImageData(im, 0, 0); x.fillStyle = 'rgba(232,241,240,.85)'; x.font = '34px VT323, monospace'; x.fillText(d.ten.toUpperCase(), 14, 200);
  return (anhMoCache[d.id] = c.toDataURL('image/jpeg', .7));
}
const loe = document.createElement('div'); loe.id = 'loe'; loe.setAttribute('aria-hidden', 'true'); document.body.appendChild(loe);
let loeLuc = 0, loeLan = 0;
const LOE_ANH_THAT = false;   // đổi thành true khi đã có ảnh trong noi-dung/anh/<id>/1.jpg (để khỏi dò file chưa có → console báo 404)
async function loeAnh(x, y) {
  const now = performance.now(); if (now - loeLuc < 900) return; loeLuc = now;
  const d = duAn[(loeLan++ * 3 + 1) % duAn.length], f = LOE_ANH_THAT ? await doFile(d.id) : daDo[d.id];
  const src = f?.anh?.[0] || anhMo(d);
  loe.innerHTML = `<img src="${src}" alt=""><span>${esc(d.ten)} · ${esc(namHien(d.nam))}</span>`;
  loe.style.left = Math.max(120, Math.min(innerWidth - 120, x)) + 'px'; loe.style.top = Math.max(100, Math.min(innerHeight - 100, y)) + 'px';
  loe.classList.remove('hien'); void loe.offsetWidth; loe.classList.add('hien');
}
$('muiTrai').onclick = () => di(muc - 1); $('muiPhai').onclick = () => di(muc + 1);
// nhãn bám: hiện nhãn khi dừng, mũi tên 2 bên logo, ô ??? trên hố đen
(function bam() {
  if (!HD) { requestAnimationFrame(bam); return; }
  const dung = !bt.dangDi() && !bt.dangSup() && Math.abs(uC - ganNac(uC)) < .22 && uC !== .5;   // 13/11: không còn trượt về nấc → gần điểm dừng (±0,22) là hiện nhãn
  bang.classList.toggle('hien', dung);
  { const x = bt.xq(); $('flash').style.opacity = x > .01 ? Math.min(1, x * 1.1).toFixed(2) : 0; }
  const t = tram[muc], g = t.loai === 'du-an' && dung ? bt.viTriLogo(t.k) : null;
  ['muiTrai', 'muiPhai'].forEach(id => $(id).classList.toggle('hien', !!g));
  if (g) { const kc = Math.min(g.r * 2.1, innerWidth / 2 - 44), cx = Math.max(44 + kc, Math.min(innerWidth - 44 - kc, g.x));
    $('muiTrai').style.left = (cx - kc) + 'px'; $('muiPhai').style.left = (cx + kc) + 'px'; $('muiTrai').style.top = $('muiPhai').style.top = g.y + 'px'; }
  const h = bt.viTriHo(); const coHo = t.loai === 'ho-den' && dung && h.mo > .5;
  $('hoi').classList.toggle('hien', coHo); if (coHo) { $('hoi').style.left = h.x + 'px'; $('hoi').style.top = h.y + 'px'; }
  { const hx = bt.huX(), tr = $('troHo');   // bản 6: con trỏ riêng bị kéo nhẹ về tâm hố
    if (hx > .02 && chuotXY && !bt.dangSup()) { const k = .3 * Math.min(1, hx); tr.style.left = (chuotXY[0] + (h.x - chuotXY[0]) * k) + 'px'; tr.style.top = (chuotXY[1] + (h.y - chuotXY[1]) * k) + 'px'; tr.style.opacity = Math.min(1, hx * 1.5); GOC.classList.add('hutTro'); }
    else { tr.style.opacity = 0; GOC.classList.remove('hutTro'); } }
  requestAnimationFrame(bam);
})();
// ---------- hố đen: rung, đổ, hút vào → màn đen ----------
function sup() {
  if (bt.dangSup()) return;
  muc = tram.length - 1; capNhat(); bang.classList.remove('hien');
  bt.sup(() => { $('ket').classList.add('mo'); GOC.classList.add('het'); window.dispatchEvent(new CustomEvent('scene3:xong')); khiXong && khiXong(); });
}
$('luiRa').onclick = luiRa;
// vuốt trên màn kết (điện thoại): vuốt xuống = lùi ra khỏi hố
{ let y0 = null; $('ket').addEventListener('pointerdown', e => { y0 = e.clientY; }); $('ket').addEventListener('pointerup', e => { if (y0 !== null && e.clientY - y0 > 40) luiRa(); y0 = null; }); }
$('lai').onclick = () => { $('ket').classList.remove('mo'); GOC.classList.remove('het'); bt.datLai(); muc = 0; uC = 0; capNhat(); };
let chuotXY = null; addEventListener('pointermove', e => { if (HD && e.pointerType === 'mouse') chuotXY = [e.clientX, e.clientY]; });
// ---------- bảng thông tin (chép logic moThe của scene-3/index.html) ----------
const the = $('bThe'), theGiay = $('theGiay');
const LOGO = Object.fromEntries(['antimusic', 'dien-nang', 'electric', 'gaztik', 'mikenco', 'freelance'].map(k => [k, COSO + 'logo/' + k + '.png']));
// bản 6: Freelance đổi biểu tượng bút → đũa phép (vẽ SVG tại chỗ, teal); freelance.png giữ lại trong ../logo/
const HUY_SVG = { freelance: `<svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true"><g stroke-linecap="round"><path d="M12 54 46 20" stroke="#3a2416" stroke-width="6"/><path d="M12 54l7-7" stroke="#d8a64a" stroke-width="7"/><path d="M42 24l4-4" stroke="#22e0c4" stroke-width="6"/></g><circle cx="49" cy="17" r="4" fill="#bff8ef"/><g stroke="#22e0c4" stroke-width="2"><path d="M49 5v6M49 23v6M37 17h6M55 17h6M41 9l3 3M54 22l3 3M57 9l-3 3"/></g></svg>` };
const co = url => fetch(url, { method: 'HEAD' }).then(r => r.ok ? url : null).catch(() => null);
const daDo = {};
const CO_ANH = false;   // gop-3: chưa có folder noi-dung/anh trong gop-3 → không dò (khỏi 404 trong console). Có ảnh thì chép vào bao-tang/anh/<id>/ và đổi true
async function doFile(id) {
  if (daDo[id]) return daDo[id];
  if (!CO_ANH) return (daDo[id] = { anh: [], vid: [] });
  const [anh, vid] = await Promise.all([Promise.all(Array.from({ length: 12 }, (_, k) => co(`${COSO}anh/${id}/${k + 1}.jpg`))), Promise.all([1, 2, 3].map(k => co(`${COSO}anh/${id}/${k}.mp4`)))]);
  return (daDo[id] = { anh: anh.filter(Boolean), vid: vid.filter(Boolean) });
}
async function moThe(i) {
  const t = tram[i]; if (t?.loai !== 'du-an') return;
  if (t.da.id === 'other') { moFinder(); return; }
  const d = t.da, f = await doFile(d.id);
  const lam = (d.lam_gi || []).filter(x => x && x !== '[...]').map(x => `<li>${esc(x)}</li>`).join('');
  const dsAnh = d.anh || ANH_WEB[d.id];   // 13/11 admin: ảnh lấy từ noi-dung.json (chung với web), không có thì dùng danh sách cũ
  if (!f.anh.length && dsAnh) f.anh = dsAnh.map(n => COSO + '../web/anh/' + n + '.webp');
  const oTrong = (loai, k, duoi) => `<figure><div class="o${loai === 'Video' ? ' vid' : ''}">${loai} ${k} · not added yet<small>noi-dung/anh/${esc(d.id)}/${k}.${duoi}</small></div></figure>`;
  const anh = f.anh.length ? f.anh.map((u, k) => `<figure><div class="o"><img src="${u}" alt="${esc(d.ten)}, photo ${k + 1}" loading="lazy"></div><figcaption>${String(k + 1).padStart(2, '0')}</figcaption></figure>`).join('') : [1, 2, 3].map(k => oTrong('Photo', k, 'jpg')).join('');
  const vid = f.vid.length ? f.vid.map(u => `<figure><div class="o vid"><video src="${u}" controls playsinline preload="metadata"></video></div></figure>`).join('') : oTrong('Video', 1, 'mp4');
  theGiay.innerHTML = `
    <header><div class="huy">${HUY_SVG[d.id] || (LOGO[d.id] ? `<img src="${LOGO[d.id]}" alt="">` : `<span>${esc(d.ten)}</span>`)}</div>
      <div><div class="so">PROJECT ${String(t.so).padStart(2, '0')} · FILE</div><h3 id="theTen">${esc(d.ten)}</h3><div class="nam">${esc(namHien(d.nam))}</div></div></header>
    <dl class="tt"><div><dt>Role</dt><dd>${esc(d.vai_tro)}</dd></div><div><dt>Years</dt><dd>${esc(namHien(d.nam))}</dd></div><div><dt>In one line</dt><dd>${esc(d.mot_dong)}</dd></div>${d.link ? `<div><dt>Link</dt><dd><a href="${esc(d.link)}" target="_blank" rel="noopener">${esc(d.link)}</a></dd></div>` : ''}</dl>
    ${trongHoac(d.mo_ta_web) ? `<h4>The story</h4><p class="dai">${esc(d.mo_ta_web)}</p>` : ''}
    ${lam ? `<h4>What I did</h4><ul>${lam}</ul>` : ''}
    <h4>Photos${f.anh.length ? ` · ${f.anh.length}` : ''}</h4><div class="luoi">${anh}</div>
    ${f.vid.length ? `<h4>Video · ${f.vid.length}</h4><div class="luoi">${vid}</div>` : ''}`;
  the.classList.add('mo'); the.scrollTop = 0; $('dongThe').focus();
}
function dongThe() { the.classList.remove('mo'); the.querySelectorAll('video').forEach(v => v.pause()); }
$('dongThe').onclick = dongThe;
// ---------- bản 6: cửa sổ Finder cho Other Projects ----------
// CHỦ DỰ ÁN ĐIỀN SAU: mỗi phần tử = 1 thư mục project. tep: [{ ten: 'poster.jpg', loai: 'anh' | 'video' | 'file', src: '../../noi-dung/anh/<id>/1.jpg' }]
const DU_AN_KHAC = [
  { ten: '[...]', nam: '[...]', moTa: '[...]', tep: [] },
  { ten: '[...]', nam: '[...]', moTa: '[...]', tep: [] },
  { ten: '[...]', nam: '[...]', moTa: '[...]', tep: [] },
  { ten: '[...]', nam: '[...]', moTa: '[...]', tep: [] },
  { ten: '[...]', nam: '[...]', moTa: '[...]', tep: [] },
  { ten: '[...]', nam: '[...]', moTa: '[...]', tep: [] },
];
const IC = {
  thuMuc: `<svg viewBox="0 0 72 60" width="72" height="60" aria-hidden="true"><path d="M3 9a4 4 0 0 1 4-4h19l6 6h33a4 4 0 0 1 4 4v38a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#1f6fd1"/><path d="M3 18a4 4 0 0 1 4-4h58a4 4 0 0 1 4 4v35a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#4aa3ff"/><path d="M3 18a4 4 0 0 1 4-4h58a4 4 0 0 1 4 4v2H3z" fill="#7cbcff" opacity=".6"/></svg>`,
  file: `<svg viewBox="0 0 48 60" width="46" height="58" aria-hidden="true"><path d="M4 2h28l12 12v42a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#e9e9e9"/><path d="M32 2v10a2 2 0 0 0 2 2h10" fill="#bdbdbd"/><path d="M10 26h26M10 33h26M10 40h18" stroke="#9a9a9a" stroke-width="2"/></svg>`,
};
const fd = $('finder'), fNoi = $('fNoi');
let fDang = null, fChon = -1;   // fDang: chỉ số thư mục đang mở (null = gốc)
const laCham = matchMedia('(pointer: coarse)').matches;
function veFinder() {
  const duong = $('fDuong'); $('fLui').disabled = fDang === null;
  if (fDang === null) {
    duong.innerHTML = `<b id="fTieuDe">Other Projects</b>`;
    fNoi.innerHTML = `<div class="luoiF" role="list">${DU_AN_KHAC.map((p, i) => `<button class="tep" role="listitem" data-i="${i}" title="${esc(p.ten)}"><div class="hinh">${IC.thuMuc}</div><span>${trongHoac(p.ten)}</span><small>${trongHoac(p.nam)}</small></button>`).join('')}</div>`;
    $('fChan').textContent = `${DU_AN_KHAC.length} items`;
  } else {
    const p = DU_AN_KHAC[fDang];
    duong.innerHTML = `<button data-goc>Other Projects</button><i>›</i><b id="fTieuDe">${esc(p.ten)}</b>`;
    const tep = p.tep.length ? p.tep.map((f, k) => {
      const h = f.loai === 'anh' ? `<img src="${esc(f.src)}" alt="" loading="lazy">` : f.loai === 'video' ? `<video src="${esc(f.src)}" muted preload="metadata"></video>` : IC.file;
      return `<button class="tep" data-f="${k}"><div class="hinh">${h}</div><span>${esc(f.ten)}</span></button>`; }).join('')
      : ['Photo 1', 'Photo 2', 'Video 1'].map(n => `<div class="tep" aria-label="${n}, not added yet"><div class="hinh"><div class="trongF">[...]</div></div><span>${n}</span><small>not added yet</small></div>`).join('');
    fNoi.innerHTML = `<div class="moTaF"><b>${trongHoac(p.ten)}</b><span>${trongHoac(p.nam)}</span><span>${trongHoac(p.moTa)}</span></div><div class="luoiF">${tep}</div>`;
    $('fChan').textContent = `${p.tep.length || 0} items`;
  }
  fChon = -1;
}
function moThuMuc(i) { fDang = i; veFinder(); fNoi.querySelector('.tep')?.focus?.(); }
function moFinder() { if (fd.classList.contains('mo')) return; fDang = null; veFinder(); fd.classList.add('mo'); $('fDong').focus(); }
function dongFinder() { fd.classList.remove('mo'); $('fXem').classList.remove('mo'); $('fXem').innerHTML = ''; fd.querySelectorAll('video').forEach(v => v.pause()); }
$('fDong').onclick = dongFinder;
$('fLui').onclick = () => { if (fDang !== null) { const i = fDang; fDang = null; veFinder(); fNoi.querySelector(`[data-i="${i}"]`)?.focus(); } };
$('fDuong').addEventListener('click', e => { if (e.target.closest('[data-goc]')) $('fLui').onclick(); });
fd.addEventListener('click', e => { if (e.target === fd) dongFinder(); });
function xemTep(k) { const f = DU_AN_KHAC[fDang]?.tep[k]; if (!f || f.loai === 'file') { if (f?.src) window.open(f.src, '_blank', 'noopener'); return; }
  const x = $('fXem'); x.innerHTML = f.loai === 'anh' ? `<img src="${esc(f.src)}" alt="${esc(f.ten)}">` : `<video src="${esc(f.src)}" controls autoplay playsinline></video>`; x.classList.add('mo'); }
$('fXem').addEventListener('click', e => { if (e.target === $('fXem')) { $('fXem').classList.remove('mo'); $('fXem').innerHTML = ''; } });
fNoi.addEventListener('click', e => { const b = e.target.closest('button.tep'); fNoi.querySelectorAll('.tep.chon').forEach(x => x.classList.remove('chon')); if (!b) return; b.classList.add('chon');
  if (laCham) { if (b.dataset.i) moThuMuc(+b.dataset.i); else if (b.dataset.f) xemTep(+b.dataset.f); } });   // điện thoại: chạm 1 lần là mở
fNoi.addEventListener('dblclick', e => { const b = e.target.closest('button.tep'); if (!b) return; if (b.dataset.i) moThuMuc(+b.dataset.i); else if (b.dataset.f) xemTep(+b.dataset.f); });   // máy tính: bấm đúp
fNoi.addEventListener('keydown', e => { const b = e.target.closest('button.tep'); if (!b) return; if (e.key === 'Enter') { e.preventDefault(); if (b.dataset.i) moThuMuc(+b.dataset.i); else if (b.dataset.f) xemTep(+b.dataset.f); } if (e.key === 'Backspace' || (e.metaKey && e.key === 'ArrowUp')) $('fLui').onclick(); });
// để chụp kiểm: tua thẳng tới điểm (i có thể lẻ)
window.__btDemo = { denDiem(i, tuc = true) { muc = Math.round(i); uC = i; bt.denDiem(i, tuc); capNhat(); }, di, taiNen: () => bt.taiNen(), u: () => bt.u(), info: () => bt.info(), huy: () => bt.huy(), sup, moThe, tram, chon: (x, y) => bt.chonTai(x, y), bam, _go: bt._go,
  keoDoan, uC: () => uC, muc: () => muc, moFinder, moThuMuc, dongFinder, xq: () => bt.xq(), loeAnh, huHo: b => bt.huHo(b), keoU: v => bt.keoU(v) };
// ---------- gop-3: API cho trang gộp ----------
bt.khiMatContext(() => { tinh(); daMat = true; });
let daMat = false;
return {
  tinh: false,
  chay: () => { if (!daMat) bt.chay(); }, dung: () => bt.dung(), dangVe: () => bt.dangVe(),
  vao: r => bt.vao(r),
  kichHoat(b) { if (b && !HD) choCuMoi = true; HD = b; if (!b) { bang.classList.remove('hien'); ['muiTrai', 'muiPhai', 'hoi'].forEach(i => $(i).classList.remove('hien')); goiY.classList.remove('hien'); } },
  daMat: () => daMat,
  info: () => bt.info(), huy: () => bt.huy(), u: () => bt.u(), muc: () => muc,
  veGoi(a) { $('goi').style.opacity = a; },
};

}
