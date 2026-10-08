const API = "https://wlhzcocwgmzcrtzhefic.supabase.co/functions/v1/api";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsaHpjb2N3Z216Y3J0emhlZmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzQ4ODYsImV4cCI6MjEwNjQ1MDg4Nn0.-Y1jYFT1NO9Nm1SgzNU7QYBA1E8zTZr8aXA768-5cd8";
const QR_DATA = "https://qr.nspk.ru/AS1A000O3A23ARQ8A8A0SPB6FL0FRMHG";
const QR_IMG = "https://i.ibb.co/TMF49Cp8/IMG-1508.jpg" + encodeURIComponent(QR_DATA);
const tg = Telegram.WebApp; tg.ready(); tg.expand();
tg.setHeaderColor("#0d0d0d"); tg.setBackgroundColor("#0d0d0d");
const app = document.getElementById("app");
const tgUser = tg.initDataUnsafe.user || {};
const ava = tgUser.photo_url || "";
const q = id => document.getElementById(id);

async function call(action, extra = {}) {
  const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 15000);
  try {
    const r = await fetch(API, { method: "POST", signal: ac.signal,
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: "Bearer " + ANON },
      body: JSON.stringify({ action, initData: tg.initData, ...extra }) });
    let d = {}; try { d = await r.json(); } catch (_) { d = { error: "http_" + r.status }; }
    if (!r.ok) { d.status = d.status || r.status; throw d; }
    return d;
  } catch (e) {
    if (e.name === "AbortError") throw { error: "timeout" };
    if (e instanceof TypeError) throw { error: "network", detail: e.message };
    throw e;
  } finally { clearTimeout(tm); }
}
const errText = e => ({ tag_not_found: "Тег не найден", tag_taken: "Этот аккаунт уже привязан", bad_auth: "Открой приложение из Telegram", timeout: "Сервер не отвечает (таймаут)", network: "Нет связи с сервером" }[e.error] || "Ошибка, попробуй ещё раз");
const RPCB = "https://wlhzcocwgmzcrtzhefic.supabase.co/rest/v1/rpc/";
const rpc = (a, b) => rpcTo("tg_do", a, b);
const pay = (a, b) => rpcTo("tg_pay", a, b);
const wd  = (a, b) => rpcTo("tg_wd", a, b);
const cwd = (a, b) => rpcTo("tg_wdc", a, b);
async function wdStatus() {
  const a = await wd("status");
  let c = { pending: [], recent: [] };
  try { c = await cwd("status"); } catch (_) {}
  return { ...a, pending: [...(a.pending || []), ...(c.pending || [])], recent: [...(a.recent || []), ...(c.recent || [])] };
}
const ms  = (a, b) => rpcTo("tg_ms", a, b);

async function rpcTo(fn, action, args = {}) {
  const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 25000);
  try {
    const r = await fetch(RPCB + fn, { method: "POST", signal: ac.signal,
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: "Bearer " + ANON },
      body: JSON.stringify({ p_init: tg.initData, p_action: action, p_args: args }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      let msg = (d && (d.message || d.error || d.hint || d.details)) || "rpc_error";
      msg = String(msg).replace(/^P\d{4}:\s*/, "").trim();
      throw { error: msg };
    }
    return d;
  } catch (e) {
    if (e.name === "AbortError") throw { error: "timeout" };
    if (e instanceof TypeError) throw { error: "network" };
    throw e;
  } finally { clearTimeout(tm); }
}

async function cryptoTopup(amountCrypto, currency) {
  const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 20000);
  try {
    const r = await fetch("https://wlhzcocwgmzcrtzhefic.supabase.co/functions/v1/clever-action", {
      method: "POST", signal: ac.signal,
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: "Bearer " + ANON },
      body: JSON.stringify({ initData: tg.initData, amount: amountCrypto, currency })
    });
    const d = await r.json();
    if (!r.ok || !d.url) throw { error: d.error || "crypto_error", detail: d };
    return d.url;
  } catch (e) {
    if (e && e.name === "AbortError") throw { error: "timeout" };
    throw e;
  } finally { clearTimeout(tm); }
}

const LERR = { bad_mission: "Такой миссии нет", mission_not_ready: "Миссия ещё не выполнена", mission_claimed: "Награда уже получена", bad_amount_wd: "Минимальная сумма вывода — 50 ₽", bad_phone: "Введи российский номер: +7 900 000-00-00", bad_bank: "Укажи банк получателя", wd_gone: "Заявка уже обработана", bad_amount: "Сумма от 50 до 50 000 ₽", topup_pending: "У тебя уже есть заявка на пополнение", topup_gone: "Заявка уже обработана", promo_invalid: "Промокод не найден или отключён", promo_used_up: "Промокод уже закончился", promo_already: "Ты уже использовал этот промокод", too_many: "Слишком много попыток. Попробуй позже", bad_tag: "Неверный тег", bad_code: "Код: 3–32 символа", bad_promo: "Проверь сумму и количество использований", promo_exists: "Такой промокод уже есть", forbidden: "Нет доступа", bad_link: "Нужна ссылка вида https://link.brawlstars.com/…", no_link_yet: "Создатель ещё не прислал ссылку", bad_image: "Нужно изображение", image_too_big: "Файл слишком большой", auth_expired: "Сессия устарела — открой заново", bad_auth: "Открой из Telegram", no_bot_token: "Сервер не настроен", bad_winner: "Неверный победитель", no_balance: "Недостаточно средств", already_in_lobby: "Ты уже в лобби", lobby_unavailable: "Лобби уже недоступно", bad_stake: "Неверная ставка", bad_mode: "Неверный режим", no_maps: "Нет карт для ШД", not_verified: "Аккаунт не верифицирован", not_in_lobby: "Тебя нет в лобби", rpc_error: "Ошибка сервера", bad_text: "Напиши сообщение", ft_gone: "Турнир уже недоступен", ft_in: "Ты уже участвуешь в турнире", ft_full: "Турнир заполнен", ft_not_member: "Ты не участник турнира", bad_map: "Укажи карту (до 60 символов)", bad_prizes: "Проверь призы: от 1 до 10 призёров, суммы больше 0", banned: "Аккаунт заблокирован администратором", muted: "Тебе временно запрещён поиск матчей", bad_network: "Выбери сеть", bad_address: "Проверь адрес кошелька", already_submitted: "Ты уже прикрепил скриншот", not_your_turn: "Сейчас не твой ход", already_banned: "Этот боец уже запрещён", bad_brawler: "Неверный боец", ban_done: "Все бойцы уже запрещены" };
const eText = e => LERR[e.error] || errText(e) || (e && e.error ? ("Ошибка: " + e.error) : "Ошибка");

const USER_SVG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
const money = n => Number(n || 0).toLocaleString("ru-RU") + " ₽";
const modeName = m => (m === "1v1" ? "1×1" : m === "sd" ? "ШД" : (m || "Поиск…"));
const avatar = p => p ? `<div class="av ${p.confirmed ? "ok" : ""}">${p.photo ? `<img src="${p.photo}" alt="">` : USER_SVG}</div>` : '<div class="av empty"></div>';
const ICONS = {
  matches: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
  top: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4"/><path d="M12 13v4M10 17h4M8 21h8"/></svg>'
};

function extractLobbyLink(text) {
  if (!text) return null;
  const m = String(text).match(/https?:\/\/link\.brawlstars\.com\/[^\s<>"'`]+/i);
  if (!m) return null;
  return m[0].replace(/[.,;:!?)\]]+$/, "");
}

function toast(t) {
  const el = document.createElement("div"); el.className = "toast"; el.textContent = t;
  document.body.appendChild(el); setTimeout(() => el.remove(), 2600);
}
function viewImg(src) {
  const v = document.createElement("div"); v.className = "viewer"; v.innerHTML = `<img src="${src}" alt="">`;
  v.onclick = () => v.remove(); document.body.appendChild(v);
}
const WL = "#0289PYLQGRJCUVO";
function makeCanvas(img, sx, sy, sw, sh, k, mode) {
  const c = document.createElement("canvas");
  c.width = Math.round(sw * k); c.height = Math.round(sh * k);
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height), px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    let v = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    if (mode === "t100") v = v > 100 ? 255 : 0;
    if (mode === "t90inv") v = v > 90 ? 0 : 255;
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  x.putImageData(d, 0, 0);
  return c;
}
async function readTags(file) {
  const img = await createImageBitmap(file);
  const reads = [];
  const grab = (t, strict) => {
    const re = strict ? /#\s*([0289PYLQGRJCUVO]{5,11})/g : /([0289PYLQGRJCUVO]{6,11})/g;
    for (const m of t.toUpperCase().matchAll(re)) reads.push(m[1].replace(/O/g, "0"));
  };
  const w = await Tesseract.createWorker("eng");
  try {
    await w.setParameters({ tessedit_char_whitelist: WL, tessedit_pageseg_mode: "11" });
    const sc = img.width < 1500 ? 1500 / img.width : 1;
    let box = null;
    for (const m of ["gray", "t100", "t90inv"]) {
      const { data } = await w.recognize(makeCanvas(img, 0, 0, img.width, img.height, sc, m));
      grab(data.text, true);
      if (!box) { const wd2 = (data.words || []).find(q => q.text.includes("#")); if (wd2) box = wd2.bbox; }
    }
    if (box) {
      await w.setParameters({ tessedit_pageseg_mode: "7" });
      const h = box.y1 - box.y0, pad = h * 0.6;
      const sx = Math.max(0, (box.x0 - pad) / sc), sy = Math.max(0, (box.y0 - pad) / sc);
      const sw = Math.min(img.width - sx, (box.x1 - box.x0 + 2 * pad) / sc), sh = Math.min(img.height - sy, (h + 2 * pad) / sc);
      for (const m of ["gray", "t90inv", "t100"]) for (const k of [3, 4]) {
        const { data } = await w.recognize(makeCanvas(img, sx, sy, sw, sh, k, m));
        grab(data.text, false);
      }
    }
  } finally { await w.terminate(); }
  const cnt = {}; reads.forEach(r => cnt[r] = (cnt[r] || 0) + 1);
  return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || Math.abs(a.length - 9) - Math.abs(b.length - 9)).slice(0, 8);
}
function withVariants(list) {
  const out = [];
  for (const t of list) {
    out.push(t);
    for (let i = 1; i < t.length; i++) if (t[i] === t[i - 1]) out.push(t.slice(0, i) + t.slice(i + 1));
  }
  return [...new Set(out)].slice(0, 20);
}
function upload() {
  app.innerHTML = `<div class="icon">🛡️</div><h1>Верификация аккаунта</h1>
  <p>Подтверди, что аккаунт Brawl Stars принадлежит тебе</p>
  <div class="steps"><i class="on"></i><i></i><i></i></div>
  <input type="file" id="f" accept="image/*" class="hidden">
  <button class="drop" id="pick"><b>📷</b>Загрузить скриншот профиля<small>Мы сами найдём твой #ТЕГ</small></button>
  <p id="st"></p>
  <input type="text" id="manual" class="hidden" placeholder="#ТЕГ вручную">
  <button class="btn hidden" id="go">Продолжить</button>`;
  const f = q("f"), st = q("st");
  let found = [];
  q("pick").onclick = () => f.click();
  f.onchange = async () => {
    if (!f.files[0]) return;
    st.textContent = "Распознаём тег…"; st.className = "";
    let err = ""; found = [];
    try { found = await readTags(f.files[0]); } catch (e) { err = " (" + (e.message || e) + ")"; }
    q("manual").value = found[0] ? "#" + found[0] : "";
    st.textContent = found[0] ? "Проверь тег и нажми «Продолжить»" : "Тег не распознан — введи вручную" + err;
    q("manual").classList.remove("hidden"); q("go").classList.remove("hidden");
  };
  q("go").onclick = async () => {
    q("go").disabled = true; st.className = "";
    const raw = q("manual").value.toUpperCase().replace(/^#/, "").replace(/O/g, "0").replace(/[^0289PYLQGRJCUV]/g, "");
    const cands = withVariants(raw === found[0] ? found : [raw]);
    let last;
    for (const t of cands) {
      st.textContent = "Ищем аккаунт…";
      try { return render((await call("start", { tag: t })).player); }
      catch (e) { last = e; if (e.error !== "tag_not_found") break; }
    }
    st.textContent = errText(last || {}); st.className = "err"; q("go").disabled = false;
  };
}
function pending(p) {
  app.innerHTML = `<div class="icon">🔑</div><h1>Подтверди аккаунт</h1>
  <div class="steps"><i class="on"></i><i class="on"></i><i></i></div>
  <div class="found"><div style="font-weight:800;font-size:18px">${p.bs_name}</div><div class="tag">${p.bs_tag}</div></div>
  <p>Зайди в Brawl Stars и <b style="color:var(--or2)">смени аватарку</b>. Затем нажми кнопку ниже.</p>
  <button class="btn" id="chk">Я сменил аватарку</button>
  <p id="st"></p><p><a href="#" id="back" style="color:var(--mut)">Другой аккаунт</a></p>`;
  q("chk").onclick = async () => {
    q("chk").disabled = true; q("st").textContent = "Проверяем…";
    try {
      const d = await call("check");
      if (d.player.status === "verified") return render(d.player);
      q("st").textContent = "Аватарка не изменилась. Подожди ~30 сек."; q("st").className = "err";
    } catch (e) { q("st").textContent = errText(e); q("st").className = "err"; }
    q("chk").disabled = false;
  };
  q("back").onclick = e => { e.preventDefault(); upload(); };
}
function render(p) {
  const v = p.status === "verified";
  if (!v && p.status !== "pending") return enterGuest();
  guest = false;
  document.body.classList.toggle("shell", v);
  document.getElementById("nav").classList.toggle("hidden", !v);
  document.getElementById("sup").classList.toggle("hidden", !v);
  if (p.status === "verified") return profile(p);
  if (p.status === "pending") return pending(p);
  return upload();
}

let curTab = "profile", cur = null;
let isAdmin = false, isMain = false, adminSec = "games", adminGameId = null, adminKey = "";
let snap = null, off = 0, pollT = null, cdT = null, lastKey = "", busy = false, pickStake = 100;
let pollN = 0, admTop = 0, topupPending = null, admWd = 0, wdPending = [], adminStats = null;
let onlineStats = null;
let bansDone = false, bansT = null, banBusy = false;
let BRAWLERS = [];

function profile(p) {
  cur = p; showTab(curTab); startPoll(); supBadge(); cryptoCheck(); loadBrawlers();
  rpc("whoami").then(d => { isAdmin = !!d.admin; isMain = !!d.main; document.getElementById("navadmin").classList.toggle("hidden", !isAdmin); }).catch(() => {});
}
async function loadBrawlers() {
  if (BRAWLERS.length) return;
  try { const d = await rpcTo("tg_brawlers", "get", {}); BRAWLERS = d.brawlers || []; } catch (e) {}
}
function showTab(t) {
  curTab = t; app.dataset.adm = "0";
  app.classList.toggle("chatmode", t === "chat" && !guest);
  document.getElementById("sup").classList.toggle("hidden", t === "chat" || guest);
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
  if (guest) { if (t === "matches") return guestMatches(); if (t !== "top") return guestGate(t); }
  if (t === "matches") { renderMatches(); return; }
  if (t === "missions") { renderMissions(); return; }
  if (t === "admin") { renderAdmin(); return; }
  if (t === "top") { renderTop(); return; }
  if (t === "chat") { renderChat(); return; }
  const w = cur.wins || 0, l = cur.losses || 0, g = w + l;
  const wr = g ? Math.round(w / g * 100) + "%" : "—";
  const bal = Number(cur.balance || 0).toLocaleString("ru-RU");
  app.innerHTML = `<img class="ava" src="${ava || cur.tg_photo_url || ""}" alt="">
  <div class="nick">${cur.bs_name}</div>
  <p class="tag">${cur.bs_tag}</p>${leagueHTML(w)}
  <div class="stats"><div class="stat w"><b>${w}</b><span>Победы</span></div><div class="stat l"><b>${l}</b><span>Поражения</span></div><div class="stat r"><b>${wr}</b><span>Винрейт</span></div></div>
  <div class="wallet"><div style="width:100%">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Основной</span><b id="wb" style="font-size:20px">${bal} ₽</b></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Бонусный <small id="bg" style="color:var(--mut)">${cur.bonus_games || 0}/50</small></span><b id="wbb" style="font-size:20px;color:var(--or2)">${Number(cur.bonus_balance || 0).toLocaleString("ru-RU")} ₽</b></div>
    <div class="bonusbar"><i id="bgbar"></i></div><p class="bonushint" id="bgh"></p>
  </div><div class="wbtns"><button class="btn" id="topup">＋ Пополнить</button><button class="btn ghost" id="wdbtn">Вывод</button></div></div>
  <div id="tpbox"></div><div id="wdbox"></div>
  <div class="sec">Промокод</div><div class="promo"><input type="text" id="pc" placeholder="Введи промокод"><button class="btn" id="pb">Активировать</button></div>
  <div class="chart"><div class="ch-title">История выигрыша</div><div id="chbox"><p>Загрузка…</p></div></div>
  <div class="sec">История матчей</div><div id="hlist" class="mlist"></div>`;
  fillBonus(cur.bonus_games || 0);
  q("topup").onclick = openTopup;
  q("wdbtn").onclick = openWithdraw;
  renderWdBox();
  wdStatus().then(applyWdState).catch(() => {});
  renderTopupBox();
  pay("status").then(applyTopupState).catch(() => {});
  q("pb").onclick = async () => {
    const code = q("pc").value.trim(); if (!code) return;
    q("pb").disabled = true;
    try {
      const d = await rpc("promo_redeem", { code });
      if (d.error) toast(LERR[d.error] || d.error);
      else { cur.bonus_balance = d.bonus_balance; const wbb = q("wbb"); if (wbb) wbb.textContent = money(d.bonus_balance); q("pc").value = ""; hap("success"); confetti(); toast("Промокод активирован: +" + money(d.amount) + " на бонусный баланс"); }
    } catch (e) { toastE(eText(e)); }
    q("pb").disabled = false;
  };
  loadProfileHistory();
}

function applySnap(sn) {
  if (!sn) return;
  const ms0 = snap && snap.mine ? snap.mine.status : null;
  snap = sn; off = new Date(sn.now).getTime() - Date.now();
  const ms1 = sn.mine ? sn.mine.status : null;
  if (ms1 !== ms0 && (ms1 === "confirming" || ms1 === "live")) hap(ms1 === "confirming" ? "warning" : "success");
  if (cur) { cur.balance = sn.balance; cur.bonus_balance = sn.bonus_balance; cur.bonus_games = sn.bonus_games; }
  const wbb = document.getElementById("wbb"); if (wbb) wbb.textContent = money(sn.bonus_balance);
  fillBonus(sn.bonus_games || 0);
  const wbe = document.getElementById("wb"); if (wbe) { const bt = money(sn.balance); if (wbe.textContent !== bt) { wbe.textContent = bt; popEl(wbe); } }
  const key = JSON.stringify([sn.mine, sn.open, sn.balance]);
  if (key !== lastKey) { lastKey = key; if (curTab === "matches") renderMatches(); }
  if (sn.mine && (sn.mine.status === "confirming" || sn.mine.status === "live") && curTab !== "matches") showTab("matches");
}
async function poll() {
  if (busy) return;
  if (++pollN % 3 === 0) extraPoll();
  if (curTab === "matches" && pollN % 2 === 0) ftLoad();
  try { applySnap((await call("lobbies")).snap); } catch (e) {}
  if (isAdmin && curTab === "admin" && !adminGameId && (adminSec === "games" || adminSec === "topups" || adminSec === "withdrawals")) renderAdmin();
}
function startPoll() { if (pollT) return; poll(); pollT = setInterval(poll, 2500); cdT = setInterval(tick, 250); }
async function lobbyCall(action, extra = {}) {
  if (busy) return; busy = true;
  try { const d = await call(action, extra); busy = false; applySnap(d.snap); if (d.error) toast(LERR[d.error] || d.error); if (d.snap) renderMatches(); }
  catch (e) { busy = false; toastE(errText(e)); }
}
function tick() {
  if (!snap || !snap.mine) return;
  const m = snap.mine;
  if (m.status === "waiting" && m.search_deadline) {
    const el = document.getElementById("cd"), ring = document.getElementById("ring");
    const total = (m.search_seconds || 150) * 1000;
    const left = Math.max(0, new Date(m.search_deadline).getTime() - (Date.now() + off));
    if (el) { const s = Math.ceil(left / 1000); el.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
    if (ring) ring.style.strokeDashoffset = 565 * (1 - left / total);
    if (left <= 0 && !tick.f) { tick.f = true; setTimeout(() => { tick.f = false; poll(); }, 700); }
    return;
  }
  if (m.status === "confirming") {
    const el = document.getElementById("cd"); if (!el) return;
    const total = (snap.confirm_seconds || 30) * 1000;
    const left = Math.max(0, new Date(m.deadline).getTime() - (Date.now() + off));
    el.textContent = Math.ceil(left / 1000);
    const ring = document.getElementById("ring");
    if (ring) ring.style.strokeDashoffset = 565 * (1 - left / total);
    if (left <= 0 && !tick.f) { tick.f = true; setTimeout(() => { tick.f = false; poll(); }, 700); }
  }
}

async function renderMatches() {
  if (curTab !== "matches") return;
  if (!snap) { app.innerHTML = '<h1>Матчи</h1><p>Загрузка…</p>'; return; }
  const m = snap.mine, bal = snap.balance;
  if (m && m.status === "confirming") {
    const me = m.players.find(p => p.me), ready = m.players.filter(p => p.confirmed).length;
    const cap = m.capacity || m.players.length;
    const potWin = Math.round(m.stake * cap * 0.85);
    app.innerHTML = `<div class="ringwrap"><svg viewBox="0 0 200 200"><circle class="r-bg" cx="100" cy="100" r="90"/><circle class="r-fg" id="ring" cx="100" cy="100" r="90"/></svg><div class="cd" id="cd"></div></div>
    <h1 class="big">Матч найден</h1><p>${modeName(m.mode)}<br>Ставка <b style="color:var(--tx)">${money(m.stake)}</b> с каждого</p>
    <div class="avs ${cap > 2 ? "many" : ""}">${m.players.map(avatar).join("")}</div>
    <div class="ready"><b>${ready}</b> / ${cap} готовы</div>
    <div class="note" style="text-align:center;margin-top:14px"><b>Потенциальный выигрыш: ${money(potWin)}</b></div>
    <button class="btn" id="conf" ${me && me.confirmed ? "disabled" : ""}>${me && me.confirmed ? "Ждём соперника…" : "✓ Подтвердить"}</button>`;
    q("conf").onclick = () => lobbyCall("lobby_confirm", { id: m.id });
    tick(); return;
  }
  if (m && m.status === "waiting") {
    const cnt = m.players.length;
    const cap = m.capacity || 2;
    const potWin = Math.round(m.stake * cap * 0.85);
    app.innerHTML = `<div class="ringwrap"><svg viewBox="0 0 200 200"><circle class="r-bg" cx="100" cy="100" r="90"/><circle class="r-fg" id="ring" cx="100" cy="100" r="90"/></svg><div class="cd" id="cd">2:30</div></div>
    <h1 class="big">Поиск соперника</h1>
    <p>Ставка <b style="color:var(--tx)">${money(m.stake)}</b> с каждого<br>Найдено игроков: <b style="color:var(--tx)">${cnt}</b></p>
    <div class="avs ${cnt > 2 ? "many" : ""}">${m.players.map(avatar).join("")}${cnt === 1 ? '<div class="av empty"></div>' : ''}</div>
    <div class="note" style="text-align:center;margin-top:14px"><b>Потенциальный выигрыш: ${money(potWin)}</b></div>
    <button class="btn ghost" id="leave">Отменить поиск (вернуть ${money(m.stake)})</button>`;
    q("leave").onclick = () => lobbyCall("lobby_leave", { id: m.id });
    tick(); return;
  }
  if (m && (m.status === "live" || m.status === "review")) {
    if (!m.link && !bansDone) { showBanModal(m); return; }
    let body;
    if (!m.link && m.creator) {
      body = `<div class="note"><b>Ты создатель лобби.</b> Создай лобби в Brawl Stars на карте «${escH(m.map)}», скопируй ссылку и вставь сюда.</div>
      <input type="text" id="lk" placeholder="https://link.brawlstars.com/invite/..." style="font-size:14px;letter-spacing:0;text-transform:none">
      <p id="lkerr" class="err hidden" style="font-size:12px"></p><button class="btn" id="sendlk">Отправить ссылку</button>`;
    } else if (!m.link) {
      body = `<div class="note"><span class="pulse"></span><b>Ждём ссылку на лобби.</b> Создатель создаёт комнату.</div>`;
    } else {
      body = `<div class="note"><b>Ссылка на лобби получена.</b><br>1. Зайди в комнату.<br>2. Сыграйте.<br>3. Прикрепи скриншот.</div>
      <button class="btn" id="openlk">Открыть лобби в Brawl Stars</button>
      <input type="file" id="shot" accept="image/*" class="hidden">
      <button class="drop" id="pickshot"><b>📷</b>Прикрепить результат матча<small>Скриншот экрана с итогом игры</small></button>
      <button class="btn ghost" id="skipshot" style="margin-top:10px;opacity:.65">Я не сделал скриншот</button>`;
    }
    if (!m.bans || !m.bans.length) {
      try {
        const bd = await rpcTo("tg_bans", "get", { id: m.id });
        if (bd && bd.bans) m.bans = bd.bans.map(b => ({ ...b, me: b.tg === tgUser.id }));
      } catch (_) {}
    }
    const bannedHTML = (m.bans && m.bans.length) ? `
      <div class="sec">Этих персонажей нельзя брать</div>
      <div class="banned-inline">
        ${m.bans.map(b => b.brawler ? `
          <div class="bp ${b.me ? "by-me" : ""}" title="${escH(b.name)} · запретил ${escH(b.who || "—")}">
            <img src="${escH(b.img)}" alt="">
          </div>` : "").join("")}
      </div>
      <div style="font-size:11.5px;color:var(--mut);text-align:center;margin-top:6px">
        ${m.bans.filter(b => b.brawler).map(b => `<b style="color:var(--or2)">${escH(b.name)}</b> — ${escH(b.who || "—")}`).join(" · ")}
      </div>` : "";
    app.innerHTML = `<div class="lobby-hero"><div class="num">МАТЧ #${m.id}</div><div class="map">${escH(m.map || "—")}</div><div class="mode">${modeName(m.mode)} · Ставка ${money(m.stake)}</div></div>
      <div class="lobby-players">${(m.players || []).map(p => `<div class="lp ${p.me ? "me" : ""}"><div class="av ${p.confirmed ? "ok" : ""}">${p.photo ? `<img src="${escH(p.photo)}" alt="">` : USER_SVG}</div><b>${escH(p.name || "Игрок")}</b>${p.me ? '<span class="me-tag">ТЫ</span>' : ""}</div>`).join("")}</div>
      ${bannedHTML}${body}`;
    if (q("sendlk")) q("sendlk").onclick = async () => {
      const url = extractLobbyLink(q("lk").value);
      const errEl = q("lkerr");
      if (!url) { errEl.textContent = "Не нашёл ссылку link.brawlstars.com"; errEl.classList.remove("hidden"); return; }
      errEl.classList.add("hidden");
      q("sendlk").disabled = true;
      try { await rpc("set_link", { id: m.id, link: url }); await poll(); }
      catch (e) { toastE(eText(e)); q("sendlk").disabled = false; }
    };
    if (q("openlk")) q("openlk").onclick = () => tg.openLink(m.link);
    if (q("pickshot")) {
      q("pickshot").onclick = () => q("shot").click();
      q("shot").onchange = async ev => {
        const f = ev.target.files[0]; if (!f) return;
        q("pickshot").disabled = true; q("pickshot").textContent = "Загружаем…";
        try { const img = await shrink(f); await rpc("submit_result", { id: m.id, img }); hap("success"); toast("Результат отправлен"); await poll(); renderMatches(); }
        catch (e) { toastE(eText(e)); renderMatches(); }
      };
    }
    if (q("skipshot")) q("skipshot").onclick = () => askOk("Выйти без скрина? Ставка не вернётся.", async () => {
      try { await rpcTo("lobby_skip_shot", "call", { id: m.id }); toast("Вышел из лобби"); await poll(); renderMatches(); }
      catch (e) { toastE(eText(e)); }
    });
    if (m.link) {
      app.insertAdjacentHTML("beforeend", `<div class="sec">Чат матча</div>
        <div id="matchchat" style="background:#0a0a0a;border:1px solid #1e1e1e;border-radius:12px;padding:10px;max-height:26vh;overflow-y:auto;margin-top:6px"><p style="font-size:12px;color:var(--mut)">Загрузка…</p></div>
        <div style="display:flex;gap:6px;margin-top:8px"><input type="text" id="chatinp" placeholder="Сообщение…" style="flex:1;margin:0;font-size:14px;letter-spacing:0;text-transform:none;text-align:left;padding:10px"><button class="btn" id="chatsend" style="width:auto;margin:0;padding:10px 16px">→</button></div>`);
      let chatLast = 0, chatTimer = null;
      const loadChat = async () => {
        try {
          const d = await rpcTo("match_msg_list", "call", { lobby: m.id, since: chatLast });
          const box = q("matchchat"); if (!box) { clearInterval(chatTimer); return; }
          if (d.messages && d.messages.length) {
            if (box.querySelector("p")) box.innerHTML = "";
            d.messages.forEach(msg => { chatLast = Math.max(chatLast, Number(msg.id) || 0); const el = document.createElement("div"); el.className = "chatmsg"; el.innerHTML = `<b>${escH(msg.name || "Игрок")}</b>${escH(msg.text)}`; box.appendChild(el); });
            box.scrollTop = box.scrollHeight;
          }
        } catch (e) { clearInterval(chatTimer); }
      };
      loadChat();
      chatTimer = setInterval(() => { if (curTab !== "matches" || !snap || !snap.mine || (snap.mine.status !== "live" && snap.mine.status !== "review")) { clearInterval(chatTimer); return; } loadChat(); }, 3000);
      q("chatsend").onclick = async () => { const t = q("chatinp").value.trim(); if (!t) return; q("chatinp").value = ""; try { await rpcTo("match_msg_send", "call", { lobby: m.id, text: t }); await loadChat(); } catch (e) { toastE(eText(e)); } };
      q("chatinp").addEventListener("keydown", e => { if (e.key === "Enter") q("chatsend").click(); });
    }
    return;
  }
  const stakes = (snap.stakes && snap.stakes.length) ? snap.stakes : [50, 100, 200];
  if (!stakes.includes(pickStake)) pickStake = stakes[0];
  const pend = (snap.pending || []).map(x => `<div class="lrow"><div class="li"><b>На проверке</b><span>${modeName(x.mode)}</span></div><div class="st">${money(x.stake)}</div></div>`).join("");
  const cols = Math.min(stakes.length, 4);
  app.innerHTML = `<h1>Матчи</h1><p>Нажми «Поиск» — подберём соперника автоматически</p>
  <div class="balrow dual"><div><span>Бонусный</span><b>${money(snap.bonus_balance || 0)}</b></div><i></i><div><span>Основной</span><b>${money(bal)}</b></div></div>
  <div class="sec">Найти матч</div>
  <div class="chips" style="grid-template-columns:repeat(${cols},1fr)">${stakes.map(x => `<button class="chip${x === pickStake ? " on" : ""}" data-s="${x}">${x} ₽</button>`).join("")}</div>
  <button class="btn" id="mk" ${(bal + (snap.bonus_balance || 0)) < pickStake ? "disabled" : ""}>${(bal + (snap.bonus_balance || 0)) < pickStake ? "Не хватает баланса" : "🔍 Поиск · " + money(pickStake)}</button>
  <div id="pubbox">${pubHTML()}</div>
  ${pend ? `<div class="sec">Ждут решения</div>${pend}` : ""}<div id="ftbox"></div>`;
  renderFt(); ftLoad(); loadPub();
  app.querySelectorAll(".chip").forEach(c => c.onclick = () => { pickStake = +c.dataset.s; renderMatches(); });
  q("mk").onclick = async () => {
    q("mk").disabled = true;
    try {
      const fresh = (await call("lobbies")).snap; if (fresh) applySnap(fresh);
      const openList = snap.open || [];
      const target = openList.find(l => l.stake === pickStake && (l.count || 0) < 10);
      if (target) await call("lobby_join", { id: target.id }); else await rpc("create", { stake: pickStake });
      await poll(); renderMatches();
    } catch (e) {
      const detail = (e && (e.error || e.message)) || JSON.stringify(e).slice(0,150);
      toast("Причина: " + detail);
      const msg = String(detail).toLowerCase();
      if (msg.includes("lobby_unavailable") || msg.includes("already_in_lobby")) {
        try { await rpc("create", { stake: pickStake }); await poll(); renderMatches(); return; }
        catch (e2) { toast("Повтор не удался: " + ((e2 && (e2.error || e2.message)) || "?")); await poll(); renderMatches(); return; }
      }
      await poll(); renderMatches();
    }
  };
}

function showBanModal(m) {
  if (q("banstage")) return;
  const el = document.createElement("div"); el.id = "banstage"; el.className = "banstage";
  document.body.appendChild(el);
  bansDone = false;
  const renderBan = (st) => {
    if (!st) { el.innerHTML = `<div class="bans-wait">Загрузка…</div>`; return; }
    const turn = st.turn, deadline = st.deadline ? new Date(st.deadline).getTime() : 0;
    const turnPlayer = st.players && st.players.find(p => p.tg === turn);
    const isMe = turn === tgUser.id;
    el.innerHTML = `<div class="bantop"><h2>Запрет бойцов · Матч #${m.id}</h2>
      <div class="banturn"><div class="av ${turnPlayer && turnPlayer.me ? "ok" : ""}">${turnPlayer && turnPlayer.photo ? `<img src="${escH(turnPlayer.photo)}">` : USER_SVG}</div>
        <div class="btx"><b>${st.done ? "Все бойцы запрещены" : (isMe ? "Твой ход" : "Ход: " + escH(turnPlayer ? (turnPlayer.name || "Игрок") : "—"))}</b><small>${st.done ? "Сейчас начнётся матч" : `Запрещено: ${(st.bans||[]).length} / ${st.total}`}</small></div>
        <div class="bantimer ${st.done ? "" : (deadline && deadline - Date.now() < 7000 ? "low" : "")}" id="bantm">${st.done ? "✓" : ""}</div></div>
      ${(st.bans||[]).length ? `<div class="banslist">${st.bans.map(b => `<div class="bchip"><img src="${escH(b.img)}">${escH(b.name)}</div>`).join("")}</div>` : ""}</div>
      <div class="bangrid">${BRAWLERS.map(b => { const banned = (st.bans || []).find(x => x.brawler === b.id); return `<div class="bcard ${banned ? "dis" : ""}" data-id="${b.id}" data-name="${escH(b.name)}" data-img="${escH(b.img)}"><img src="${escH(b.img)}" alt="${escH(b.name)}" loading="lazy"><small>${escH(b.name)}</small></div>`; }).join("")}</div>`;
    if (deadline && !st.done) {
      const tEl = q("bantm");
      const tickBan = () => {
        const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        if (tEl && left >= 0) tEl.textContent = left + "с";
        if (left <= 0) { clearInterval(bansT); bansT = setTimeout(() => banPull(), 800); }
      };
      clearInterval(bansT); tickBan(); bansT = setInterval(tickBan, 500);
    } else { clearInterval(bansT); }
    if (st.done) { setTimeout(() => { if (q("banstage")) q("banstage").remove(); bansDone = true; showTab("matches"); }, 1800); return; }
    el.querySelectorAll(".bcard").forEach(card => {
      if (card.classList.contains("dis")) return;
      card.onclick = async () => {
        if (banBusy || !isMe) return;
        banBusy = true;
        try { const r = await rpcTo("tg_bans", "ban", { id: m.id, brawler: card.dataset.id, name: card.dataset.name, img: card.dataset.img }); if (r.error) toastE(LERR[r.error] || r.error); else hap("light"); }
        catch (e) { toastE(eText(e)); }
        banBusy = false; banPull();
      };
    });
  };
  window.banPull = async () => { try { const st = await rpcTo("tg_bans", "get", { id: m.id }); if (st.error) return; renderBan(st); } catch (e) {} };
  window.banPull();
}

async function shrink(file) {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 1100 / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.62);
}
const fmtD = d => new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");
const sgn = n => (n > 0 ? "+" : "") + n;
function fillStats() { const w = cur.wins || 0, l = cur.losses || 0, g = w + l; const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; }; set("sw", w); set("sl", l); set("sr", g ? Math.round(w / g * 100) + "%" : "—"); }
async function loadProfileHistory() {
  let d = null; try { d = await rpc("history"); } catch (e) {}
  const box = document.getElementById("chbox"), hl = document.getElementById("hlist");
  if (!box || curTab !== "profile") return;
  if (!d) { box.innerHTML = "<p>История недоступна.</p>"; return; }
  cur.wins = d.wins; cur.losses = d.losses; fillStats();
  { let s = 0; for (let i = d.matches.length - 1; i >= 0 && d.matches[i].result === "win"; i--) s++;
    const lg = document.querySelector(".league");
    if (lg && s >= 2 && !document.querySelector(".streak")) lg.insertAdjacentHTML("afterend", streakHTML(s)); }
  drawChart(box, d.matches);
  hl.innerHTML = d.matches.length ? d.matches.slice().reverse().slice(0, 20).map(m => {
    const w = m.result === "win";
    const dt = new Date(m.created_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const gross = w ? (Number(m.stake) + Number(m.profit)) : Number(m.profit);
    return `<div class="mrow"><div class="mres ${w ? "win" : "loss"}">${w ? "Победа" : "Поражение"}</div><div class="minfo"><b>${modeName(m.mode)} · ${escH(m.map || "")}</b><span>${m.mode === "sd" ? (m.place ? m.place + " место" : "вне призов") : "vs " + escH(m.opponent || "—")} · ${dt}</span></div><div class="mdelta ${m.profit >= 0 ? "up" : "down"}">${w ? "+" + gross + " ₽" : sgn(m.profit) + " ₽"}</div></div>`;
  }).join("") : "<p>Матчей пока нет.</p>";
}
function drawChart(box, msArr) {
  if (!msArr.length) { box.innerHTML = "<p>Пока нет матчей.</p>"; return; }
  const W = box.clientWidth || 320, H = 150, pt = 12, pb = 8, n = msArr.length;
  const vals = msArr.map(m => Number(m.total));
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min -= 10; max += 10; }
  const pad = (max - min) * 0.15; min -= pad; max += pad;
  const X = i => n === 1 ? W / 2 : i * (W / (n - 1));
  const Y = v => pt + (H - pt - pb) * (1 - (v - min) / (max - min));
  const line = "M" + msArr.map((m, i) => X(i).toFixed(1) + "," + Y(Number(m.total)).toFixed(1)).join(" L");
  const area = line + ` L${X(n - 1).toFixed(1)},${H} L${X(0).toFixed(1)},${H} Z`;
  const col = vals[n - 1] >= vals[0] ? "#6ee787" : "#ff6b6b";
  const grid = [0, 1, 2, 3].map(k => { const y = (pt + (H - pt - pb) * k / 3).toFixed(1); return `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#222" stroke-width="1"/>`; }).join("");
  box.innerHTML = `<div class="ch-head"><div><b id="chv"></b><span id="chd"></span></div><span id="cht"></span></div><svg id="chsvg" viewBox="0 0 ${W} ${H}" height="${H}"><defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#gf)"/><path d="${line}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><line id="cl" y1="0" y2="${H}" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-dasharray="4 4"/><circle id="cc" r="6" fill="#0d0d0d" stroke="${col}" stroke-width="3"/></svg><div class="ch-foot"><span>${fmtD(msArr[0].created_at)}</span><span>${fmtD(msArr[n - 1].created_at)}</span></div>`;
  const svg = box.querySelector("#chsvg"), cl = box.querySelector("#cl"), cc = box.querySelector("#cc");
  const set = i => { const m = msArr[i], x = X(i); cl.setAttribute("x1", x); cl.setAttribute("x2", x); cc.setAttribute("cx", x); cc.setAttribute("cy", Y(Number(m.total))); box.querySelector("#chv").textContent = money(m.total); const d = box.querySelector("#chd"); d.textContent = sgn(m.profit) + " ₽"; d.className = m.profit >= 0 ? "up" : "down"; box.querySelector("#cht").textContent = fmtD(m.created_at); };
  let drag = false;
  const move = e => { const r = svg.getBoundingClientRect(); const i = n === 1 ? 0 : Math.round((e.clientX - r.left) / r.width * (n - 1)); set(Math.max(0, Math.min(n - 1, i))); };
  svg.addEventListener("pointerdown", e => { drag = true; svg.setPointerCapture(e.pointerId); move(e); });
  svg.addEventListener("pointermove", e => { if (drag) move(e); });
  ["pointerup", "pointercancel"].forEach(ev => svg.addEventListener(ev, () => drag = false));
  set(n - 1);
}

async function renderMissions() {
  app.innerHTML = '<h1>Миссии</h1><p>Загрузка…</p>';
  let d; try { d = await ms("missions"); } catch (e) { if (curTab === "missions") app.innerHTML = `<h1>Миссии</h1><p class="err">${eText(e)}</p>`; return; }
  if (curTab !== "missions") return;
  cur.balance = d.balance;
  const cards = d.missions.map(m => { const done = m.progress >= m.target; return `<div class="mis ${done && !m.claimed ? "done" : ""}"><div class="mh"><span>${m.title}: ${m.progress}/${m.target}</span><span class="rw">+${money(m.reward)}</span></div><div class="bar"><i style="width:${Math.min(100, m.progress / m.target * 100)}%"></i></div>${m.claimed ? '<div class="pg"><span>Награда получена ✓</span></div>' : done ? `<button class="btn sm" data-claim="${m.id}">Забрать ${money(m.reward)}</button>` : `<div class="pg"><span>Осталось: ${m.target - m.progress}</span></div>`}</div>`; }).join("");
  const r = d.ref;
  app.innerHTML = `<div class="icon ico"><svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/></svg></div><h1>Миссии</h1><p>Выполняй задания и получай ₽ на бонусный баланс</p><div class="sec">Задания</div>${cards}
  <div class="sec">Пригласи друзей</div><div class="mis"><div class="mh"><span>За каждого нового игрока</span><span class="rw">+${money(1.5)}</span></div><p style="font-size:13px">Друг заходит по твоей ссылке и подтверждает аккаунт Brawl Stars.</p><div class="pg"><span>Приглашено: ${r.invited}</span><span>Ждут: ${r.waiting}</span></div><div class="pg" style="margin-top:4px"><span>Заработано: ${money(r.invited * 1.5)}</span></div>${r.link ? `<div class="refbox">${r.link}</div><div class="row2"><button class="btn sm" id="rcopy">Копировать</button><button class="btn sm" id="rshare">Поделиться</button></div>` : '<p class="err" style="font-size:12px">Ссылка ещё не настроена.</p>'}</div>`;
  app.querySelectorAll("[data-claim]").forEach(b => b.onclick = async () => { b.disabled = true; try { const x = await ms("claim", { id: b.dataset.claim }); cur.bonus_balance = x.bonus_balance; hap("success"); confetti(); toast("Награда получена: +" + money(x.reward) + " на бонусный баланс"); renderMissions(); } catch (e) { toastE(eText(e)); b.disabled = false; } });
  if (q("rcopy")) { q("rcopy").onclick = () => { try { navigator.clipboard.writeText(r.link); toast("Скопировано"); } catch (_) {} }; q("rshare").onclick = () => tg.openTelegramLink("https://t.me/share/url?url=" + encodeURIComponent(r.link) + "&text=" + encodeURIComponent("Играй со мной!")); }
}

async function renderTop() {
  app.innerHTML = '<h1>Топ игроков</h1><p>Загрузка…</p>';
  let d; try { d = await rpc("top"); } catch (e) { if (curTab === "top") app.innerHTML = `<h1>Топ игроков</h1><p class="err">${eText(e)}</p>`; return; }
  if (curTab !== "top") return;
  const pl = d.players;
  const pod = pl.length ? `<div class="pod">${[1, 0, 2].filter(i => pl[i]).map(i => { const p = pl[i]; return `<div class="pod-i p${i + 1} ${p.me ? "me" : ""}"><span class="rk">${i + 1}</span><div class="av">${p.photo ? `<img src="${escH(p.photo)}" alt="">` : USER_SVG}</div><b>${escH(p.name || "Игрок")}</b><div class="w">${p.wins}</div><small>побед</small></div>`; }).join("")}</div>` : "";
  const rows = pl.slice(3).map((p, k) => `<div class="top-row ${p.me ? "me" : ""}"><div class="pl">${k + 4}</div><div class="av">${p.photo ? `<img src="${escH(p.photo)}" alt="">` : USER_SVG}</div><div class="li"><b>${escH(p.name || "Игрок")}</b><span>Поражений: ${p.losses}</span></div><div class="w">${p.wins}</div></div>`).join("");
  app.innerHTML = `<div class="icon ico">${ICONS.top}</div><h1>Топ игроков</h1><p>Рейтинг по победам</p>${pod}<div class="mlist">${rows}${pl.length ? "" : "<p>Пока никого нет.</p>"}</div>`;
}

const adminSeg = () => `<div class="balrow" style="margin-top:10px"><span>Зарегистрировано</span><b id="astatv">${adminStats ? adminStats.verified : "…"}</b></div><p id="astatt" style="font-size:12px;margin:6px 0 10px">${adminStats ? `За сутки +${adminStats.today} · всего открывали: ${adminStats.total}` : ""}</p><div id="onlineBox"></div>
  <div class="bc"><div class="sec">Рассылка в бота</div><textarea class="sta" id="bctxt" rows="2" maxlength="1000" placeholder="Текст сообщения для всех игроков…"></textarea><button class="btn sm" id="bcsend">Отправить рассылку</button></div>
  <div class="seg adm">
  <button data-sec="games" class="${adminSec === "games" ? "on" : ""}">Игры</button>
  <button data-sec="topups" class="${adminSec === "topups" ? "on" : ""}">Пополнения${admTop ? " (" + admTop + ")" : ""}</button>
  <button data-sec="withdrawals" class="${adminSec === "withdrawals" ? "on" : ""}">Выводы${admWd ? " (" + admWd + ")" : ""}</button>
  <button data-sec="promo" class="${adminSec === "promo" ? "on" : ""}">Промокоды</button>
  <button data-sec="stakes" class="${adminSec === "stakes" ? "on" : ""}">Ставки</button>
  <button data-sec="players" class="${adminSec === "players" ? "on" : ""}">Игроки</button>
  <button data-sec="ft" class="${adminSec === "ft" ? "on" : ""}">Турниры</button>
  ${isMain ? `<button data-sec="admins" class="${adminSec === "admins" ? "on" : ""}">Админы</button>` : ""}</div>`;
const bindSeg = () => { app.querySelectorAll("[data-sec]").forEach(b => b.onclick = () => { adminSec = b.dataset.sec; app.dataset.adm = "0"; adminKey = ""; renderAdmin(); }); bindBc(); loadTotals(); loadOnlineStats(); };
const askOk = (msg, go) => tg.showConfirm ? tg.showConfirm(msg, ok => ok && go()) : (confirm(msg) && go());
async function loadAdminStats() { try { adminStats = await ms("admin_stats"); const v = document.getElementById("astatv"), t = document.getElementById("astatt"); if (v) v.textContent = adminStats.verified; if (t) t.textContent = `За сутки +${adminStats.today} · всего открывали: ${adminStats.total}`; } catch (e) {} }
async function loadOnlineStats() { try { onlineStats = await rpcTo("admin_online_stats", "get", {}); const box = document.getElementById("onlineBox"); if (!box || !onlineStats) return; const o = Number(onlineStats.online) || 0; const s = Number(onlineStats.searching) || 0; const m = Number(onlineStats.in_match) || 0; box.innerHTML = `<div class="sec">Активность</div><div class="online-row green"><span class="lbl">🟢 В сети сейчас</span><span class="num">${o}</span></div><div class="online-row blue"><span class="lbl">🔍 В поиске матча</span><span class="num">${s}</span></div><div class="online-row orange"><span class="lbl">⚔️ В матче</span><span class="num">${m}</span></div>`; } catch (e) {} }
async function renderAdmin() {
  if (curTab !== "admin") return;
  if (!isAdmin) { app.innerHTML = "<h1>Нет доступа</h1>"; return; }
  loadAdminStats();
  if (adminSec === "promo") return renderPromo();
  if (adminSec === "topups") return renderTopups();
  if (adminSec === "withdrawals") return renderWithdrawals();
  if (adminSec === "stakes") return renderStakes();
  if (adminSec === "players") return renderPlayers();
  if (adminSec === "ft") return renderFtAdmin();
  if (adminSec === "admins" && isMain) return renderAdmins();
  adminSec = "games"; adminGameId = null;
  let d; try { d = await rpc("admin_games"); } catch (e) { if (curTab === "admin") app.innerHTML = `<h1>Админ-меню</h1><p class="err">${eText(e)}</p>`; return; }
  const key = JSON.stringify(d.games);
  if (curTab !== "admin" || adminGameId || adminSec !== "games") return;
  if (key === adminKey && app.dataset.adm === "1") return;
  adminKey = key; app.dataset.adm = "1";
  const rows = d.games.map(g => `<div class="lrow" data-g="${g.id}" style="cursor:pointer"><div class="li"><b>${g.mode === "sd" ? "ШД · " + g.players.length : g.players.join(" vs ")}</b><span>${g.map} · скринов: ${g.shots}/${g.players.length}</span></div><div class="st">${money(g.stake)}</div></div>`).join("");
  app.innerHTML = `<div class="icon ico">${ICONS.matches}</div><h1>Админ-меню</h1>${adminSeg()}<p>Игры на проверке</p><div class="mlist">${rows || "<p>Нет игр на проверке.</p>"}</div>`;
  bindSeg();
  app.querySelectorAll("[data-g]").forEach(r => r.onclick = () => openGame(+r.dataset.g));
}
async function renderStakes() {
  let d; try { d = await rpc("admin_stakes"); } catch (e) { toastE(eText(e)); return; }
  if (curTab !== "admin" || adminSec !== "stakes") return;
  const current = (d.stakes || []).join(", ");
  app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<div class="sec">Доступные ставки</div><p>Введи суммы через запятую.</p><input type="text" id="samounts" value="${current}" placeholder="50,100,200" style="text-transform:none"><button class="btn" id="ssave">Сохранить</button>`;
  bindSeg();
  q("ssave").onclick = async () => { const raw = q("samounts").value.replace(/\s/g, ""); if (!raw) { toast("Введи хотя бы одну сумму"); return; } const arr = raw.split(",").map(x => parseInt(x, 10)).filter(x => x > 0); if (!arr.length) { toast("Некорректные суммы"); return; } q("ssave").disabled = true; try { await rpc("admin_stakes_set", { stakes: arr.join(",") }); toast("Ставки сохранены: " + arr.join(", ")); renderStakes(); } catch (e) { toastE(eText(e)); q("ssave").disabled = false; } };
}
async function renderTopups() {
  adminGameId = null;
  let d; try { d = await pay("admin_list"); } catch (e) { if (curTab === "admin" && adminSec === "topups") { app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<p class="err">${eText(e)}</p>`; bindSeg(); } return; }
  if (curTab !== "admin" || adminSec !== "topups") return;
  const key = JSON.stringify(d.topups);
  if (key === adminKey && app.dataset.adm === "t") return;
  adminKey = key; app.dataset.adm = "t"; admTop = d.topups.length;
  const rows = d.topups.map(t => { const dt = new Date(t.created_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); return `<div class="lrow" style="flex-wrap:wrap"><div class="li"><b>${t.name || "Игрок"} · ${t.tag}</b><span>${dt}${t.ref ? " · код " + t.ref : ""}</span></div><div class="st">${money(t.amount)}</div><div style="display:flex;gap:8px;width:100%;margin-top:8px"><button class="btn sm" style="margin:0" data-ok="${t.id}" data-n="${t.amount}">Пополнить</button><button class="btn sm ghost" style="margin:0" data-no="${t.id}" data-n="${t.amount}">Отклонить</button></div></div>`; }).join("");
  app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<p>Заявки на пополнение</p><div class="mlist">${rows || "<p>Новых заявок нет.</p>"}</div>`;
  bindSeg(); loadCrypto();
  const decide = (id, approve, n) => askOk(approve ? `Пополнить на ${money(+n)}?` : `Отклонить перевод на ${money(+n)}?`, async () => { try { await pay("admin_decide", { id: +id, approve }); toast(approve ? "Пополнено" : "Отклонено"); } catch (e) { toastE(eText(e)); } app.dataset.adm = "0"; renderTopups(); });
  app.querySelectorAll("[data-ok]").forEach(b => b.onclick = () => decide(b.dataset.ok, true, b.dataset.n));
  app.querySelectorAll("[data-no]").forEach(b => b.onclick = () => decide(b.dataset.no, false, b.dataset.n));
}
async function renderWithdrawals() {
  adminGameId = null;
  let d; try { d = await wd("admin_list"); } catch (e) { if (curTab === "admin" && adminSec === "withdrawals") { app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<p class="err">${eText(e)}</p>`; bindSeg(); } return; }
  if (curTab !== "admin" || adminSec !== "withdrawals") return;
  loadCryptoWd();
  const key = JSON.stringify(d.items);
  if (key === adminKey && app.dataset.adm === "w") return;
  adminKey = key; app.dataset.adm = "w"; admWd = d.items.length;
  const rows = d.items.map(t => { const dt = new Date(t.created_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); return `<div class="lrow" style="flex-wrap:wrap"><div class="li"><b>${t.name || "Игрок"} · ${t.tag}</b><span>${dt}</span></div><div class="st">${money(t.amount)}</div><div style="width:100%;margin-top:6px;font-size:14px">${t.phone}<button class="copy" data-cp="${t.phone}">Копировать</button><br><span style="color:var(--mut);font-size:13px">Банк: ${t.bank}</span></div><div style="display:flex;gap:8px;width:100%;margin-top:8px"><button class="btn sm" style="margin:0" data-pay="${t.id}" data-n="${t.amount}">Вывести</button><button class="btn sm ghost" style="margin:0" data-rej="${t.id}" data-n="${t.amount}">Отменить</button></div></div>`; }).join("");
  app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<p>Заявки на вывод</p><div class="mlist">${rows || "<p>Новых заявок нет.</p>"}</div>`;
  bindSeg();
  app.querySelectorAll("[data-cp]").forEach(b => b.onclick = () => { try { navigator.clipboard.writeText(b.dataset.cp); toast("Скопировано"); } catch (_) {} });
  cwKey = ""; loadCryptoWd();
  const decide = (id, pay_, msg) => askOk(msg, async () => { try { await wd("admin_decide", { id: +id, pay: pay_ }); toast(pay_ ? "Выполнено" : "Отменено"); } catch (e) { toastE(eText(e)); } app.dataset.adm = "0"; renderWithdrawals(); });
  app.querySelectorAll("[data-pay]").forEach(b => b.onclick = () => decide(b.dataset.pay, true, `Отметить вывод ${money(+b.dataset.n)} выполненным?`));
  app.querySelectorAll("[data-rej]").forEach(b => b.onclick = () => decide(b.dataset.rej, false, `Вернуть ${money(+b.dataset.n)} игроку?`));
}
let cwKey = "";
async function loadCryptoWd() {
  let d; try { d = await cwd("admin_list"); } catch (e) { return; }
  if (curTab !== "admin" || adminSec !== "withdrawals") return;
  const k = JSON.stringify(d.items);
  if (k === cwKey && q("cwsec")) return;
  cwKey = k;
  const old = q("cwsec"); if (old) old.remove();
  const rows = d.items.map(t => `<div class="lrow" style="flex-wrap:wrap"><div class="li"><b>${escH(t.name || "Игрок")} · ${escH(t.tag || "")}</b><span>${fmtT(t.created_at)} · ${escH(t.network)}</span></div><div class="st">${Number(t.usdt).toFixed(2)} USDT</div><div style="width:100%;margin-top:6px;font-size:13px;word-break:break-all">${escH(t.address)}<button class="copy" data-cpa="${escH(t.address)}">Копировать</button><br><span style="color:var(--mut)">${money(t.amount)}</span></div><div style="display:flex;gap:8px;width:100%;margin-top:8px"><button class="btn sm" style="margin:0" data-cwp="${escH(t.id)}" data-n="${t.usdt}">Отправил</button><button class="btn sm ghost" style="margin:0" data-cwr="${escH(t.id)}" data-n="${t.amount}">Отклонить</button></div></div>`).join("");
  addSec(`<div id="cwsec"><div class="sec">Крипто-выводы (USDT)</div><div class="mlist">${rows || "<p>Заявок нет.</p>"}</div></div>`);
  app.querySelectorAll("[data-cpa]").forEach(b => b.onclick = () => { try { navigator.clipboard.writeText(b.dataset.cpa); toast("Скопировано"); } catch (_) {} });
  const dec = (id, pay_, msg) => askOk(msg, async () => { try { await cwd("admin_decide", { id, pay: pay_ }); hap("success"); toast(pay_ ? "Вывод отмечен выполненным" : "Отклонено"); } catch (e) { toastE(eText(e)); } cwKey = ""; loadCryptoWd(); });
  app.querySelectorAll("[data-cwp]").forEach(b => b.onclick = () => dec(b.dataset.cwp, true, `Ты отправил ${Number(b.dataset.n).toFixed(2)} USDT?`));
  app.querySelectorAll("[data-cwr]").forEach(b => b.onclick = () => dec(b.dataset.cwr, false, `Отклонить и вернуть ${money(+b.dataset.n)} игроку?`));
}
async function renderPromo() {
  let d; try { d = await rpc("promo_list"); } catch (e) { toastE(eText(e)); return; }
  if (curTab !== "admin" || adminSec !== "promo") return;
  const rows = d.codes.map(c => `<div class="lrow"><div class="li"><b>${c.code}</b><span>${money(c.amount)} · ${c.used}/${c.max_uses}${c.active ? "" : " · выключен"}</span></div><button class="btn" data-pc="${c.code}" style="${c.active ? "" : "opacity:.6"}">${c.active ? "Выкл" : "Вкл"}</button></div>`).join("");
  app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<div class="sec">Создать промокод</div><input type="text" id="pcode" placeholder="Код (пусто — случайный)" style="font-size:15px;text-transform:uppercase"><input type="text" id="pamt" inputmode="numeric" placeholder="Сумма, ₽"><input type="text" id="pmax" inputmode="numeric" placeholder="Кол-во использований"><button class="btn" id="pmk">Создать промокод</button><div class="sec">Промокоды</div><div class="mlist">${rows || "<p>Пока нет.</p>"}</div>`;
  bindSeg();
  q("pmk").onclick = async () => { const amount = q("pamt").value.replace(/\D/g, ""), max = q("pmax").value.replace(/\D/g, ""); if (!amount || !max) { toast("Укажи сумму и количество"); return; } q("pmk").disabled = true; try { const r = await rpc("promo_create", { code: q("pcode").value, amount, max_uses: max }); try { navigator.clipboard.writeText(r.code); } catch (_) {} toast("Создан " + r.code); renderPromo(); } catch (e) { toastE(eText(e)); q("pmk").disabled = false; } };
  app.querySelectorAll("[data-pc]").forEach(b => b.onclick = async () => { try { await rpc("promo_toggle", { code: b.dataset.pc }); renderPromo(); } catch (e) { toastE(eText(e)); } });
}
async function renderAdmins() {
  let d; try { d = await rpc("admins_list"); } catch (e) { toastE(eText(e)); return; }
  if (curTab !== "admin" || adminSec !== "admins") return;
  const rows = d.admins.map(a => `<div class="lrow"><div class="li"><b>${a.name || "—"}</b><span>${a.tag}${a.main ? " · главный" : ""}</span></div>${a.main ? "" : `<button class="btn" data-da="${a.tag}">Убрать</button>`}</div>`).join("");
  app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<div class="sec">Добавить админа</div><input type="text" id="atag" placeholder="#ТЕГ" style="text-transform:uppercase"><button class="btn" id="aadd">Сделать админом</button><div class="sec">Админы</div><div class="mlist">${rows}</div>`;
  bindSeg();
  q("aadd").onclick = async () => { if (!q("atag").value.trim()) return; q("aadd").disabled = true; try { await rpc("admin_add", { tag: q("atag").value }); toast("Добавлен"); renderAdmins(); } catch (e) { toastE(eText(e)); q("aadd").disabled = false; } };
  app.querySelectorAll("[data-da]").forEach(b => b.onclick = () => askOk(`Убрать ${b.dataset.da}?`, async () => { try { await rpc("admin_del", { tag: b.dataset.da }); renderAdmins(); } catch (e) { toastE(eText(e)); } }));
}
const adm = (a, b) => rpcTo("tg_admin", a, b);
const KIND = { topup: "Пополнения", withdraw: "Выводы", withdraw_refund: "Возвраты вывода", win: "Выигрыши", stake: "Ставки", refund: "Возвраты ставок", promo: "Промокоды", mission: "Миссии", referral: "Рефералы", bonus_settle: "Перенос бонуса" };
let plQ = "";
async function renderPlayers() {
  app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<input type="text" id="plq" placeholder="Имя, #ТЕГ, @ник или ID" style="text-transform:none;font-size:15px"><div class="mlist" id="pllist"><p>Загрузка…</p></div>`;
  bindSeg();
  const inp = q("plq"); inp.value = plQ;
  let t = null;
  inp.oninput = () => { clearTimeout(t); t = setTimeout(() => { plQ = inp.value.trim(); loadPlayers(); }, 400); };
  loadPlayers();
}
async function loadPlayers() {
  const box = q("pllist"); if (!box) return;
  let d; try { d = await adm("players", { q: plQ }); } catch (e) { box.innerHTML = `<p class="err">${eText(e)}</p>`; return; }
  const b2 = q("pllist"); if (!b2) return;
  b2.innerHTML = d.players.map(p => `<div class="lrow" data-pl="${p.tg_id}" style="cursor:pointer"><div class="av ${p.status === "verified" ? "ok" : ""}">${p.photo ? `<img src="${escH(p.photo)}" alt="">` : USER_SVG}</div><div class="li"><b>${escH(p.name || "Игрок")}</b><span>${escH(p.tag || "")} · ${p.wins || 0} П / ${p.losses || 0} Пр</span></div><div class="st">${money(p.balance)}</div></div>`).join("") || "<p>Никого не найдено.</p>";
  b2.querySelectorAll("[data-pl]").forEach(r => r.onclick = () => openPlayer(+r.dataset.pl));
}
async function openPlayer(tg) {
  let d; try { d = await adm("player", { tg }); } catch (e) { toastE(eText(e)); return; }
  if (!d.p) { toast("Игрок не найден"); return; }
  const p = d.p, w = p.wins || 0, l = p.losses || 0, g = w + l, wr = g ? Math.round(w / g * 100) + "%" : "—";
  const dt = t => new Date(t).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const av = p.photo ? `<img class="ava" src="${escH(p.photo)}" alt="">` : `<div class="av" style="width:116px;height:116px;margin:0 auto">${USER_SVG}</div>`;
  const kinds = d.kinds.map(k => `<div class="balrow"><span>${KIND[k.kind] || escH(k.kind)} · ${k.n}</span><b>${money(k.sum)}</b></div>`).join("");
  const ops = (arr, label) => arr.map(x => `<div class="lrow"><div class="li"><b>${label}${x.bank ? " · " + escH(x.bank) : ""}</b><span>${dt(x.created_at)} · ${escH(x.status)}</span></div><div class="st">${money(x.amount)}</div></div>`).join("");
  const ms = d.matches.map(m => { const win = m.result === "win"; return `<div class="mrow"><div class="mres ${win ? "win" : "loss"}">${win ? "Победа" : "Поражение"}</div><div class="minfo"><b>${modeName(m.mode)} · ${escH(m.map || "")}</b><span>${m.mode === "sd" ? (m.place ? m.place + " место" : "вне призов") : "vs " + escH(m.opponent || "—")} · ${dt(m.created_at)}</span></div><div class="mdelta ${m.profit >= 0 ? "up" : "down"}">${sgn(m.profit)} ₽</div></div>`; }).join("");
  app.innerHTML = `${av}<div class="nick">${escH(p.name || "Игрок")}</div><p class="tag">${escH(p.tag || "")}</p><p style="font-size:12px">ID ${p.tg_id}${p.username ? " · @" + escH(p.username) : ""} · ${p.status === "verified" ? "верифицирован" : escH(p.status || "")}</p>
  <div class="stats"><div class="stat w"><b>${w}</b><span>Победы</span></div><div class="stat l"><b>${l}</b><span>Поражения</span></div><div class="stat r"><b>${wr}</b><span>Винрейт</span></div></div>
  <div class="balrow"><span>Основной</span><b>${money(p.balance)}</b></div><div class="balrow"><span>Бонусный · ${p.bonus_games || 0}/50</span><b>${money(p.bonus_balance)}</b></div>
  <div class="balrow"><span>Приглашено · ждут${d.refs.by ? " · пригласил " + escH(d.refs.by) : ""}</span><b>${d.refs.invited} · ${d.refs.waiting}</b></div>
  <div class="sec">Операции по типам</div>${kinds || "<p>Операций нет.</p>"}
  <div class="sec">Последние пополнения</div>${ops(d.topups, "Пополнение") || "<p>Нет.</p>"}
  <div class="sec">Последние выводы</div>${ops(d.wds, "Вывод") || "<p>Нет.</p>"}
  <div class="sec">Матчи (последние 30)</div><div class="mlist">${ms || "<p>Матчей нет.</p>"}</div>
  <div class="sec">Модерация</div><div id="modbox"><p>Загрузка…</p></div>
  <button class="btn ghost" id="plback">← К игрокам</button>`;
  q("plback").onclick = () => { adminSec = "players"; renderPlayers(); };
  renderMod(tg);
}
const cry = (a, b) => rpcTo("tg_crypto", a, b);
async function loadCrypto() {
  let d; try { d = await cry("list"); } catch (e) { return; }
  if (curTab !== "admin" || adminSec !== "topups") return;
  const old = q("crsec"); if (old) old.remove();
  const rows = d.items.map(c => `<div class="lrow" style="flex-wrap:wrap"><div class="li"><b>${escH(c.name || "Игрок")} · ${escH(c.tag || "")}</b><span>Счёт ${escH(c.id)} · ${fmtT(c.created_at)}</span></div><div class="st">${money(c.amount)}</div><div style="width:100%;margin-top:8px"><button class="btn sm" style="margin:0" data-cr="${escH(c.id)}" data-n="${c.amount}">Зачислить</button></div></div>`).join("");
  addSec(`<div id="crsec"><div class="sec">Крипто-счета xRocket без зачисления</div><div class="mlist">${rows || "<p>Неоплаченных счетов нет.</p>"}</div></div>`);
  app.querySelectorAll("[data-cr]").forEach(b => b.onclick = () => askOk(`Счёт ${b.dataset.cr}: зачислить ${money(+b.dataset.n)}?`, async () => { try { const r = await cry("credit", { id: b.dataset.cr }); hap("success"); toast(r.credited ? "Зачислено" : "Уже зачислено"); } catch (e) { toastE(eText(e)); } loadCrypto(); }));
}
async function openGame(id) {
  adminGameId = id; app.dataset.adm = "0";
  let g; try { g = await rpc("admin_game", { id }); } catch (e) { toastE(eText(e)); adminGameId = null; return renderAdmin(); }
  const sd = g.mode === "sd", picks = [], need = sd ? (g.players.length <= 4 ? 2 : 3) : 1;
  let au = null; try { au = (await rpcTo("tg_auto", "get", { id })).r; } catch (e) {}
  const auBox = au && !au.applied ? `<div class="note"><b>Результат из журнала Brawl Stars</b><br>${au.winners.map((w, k) => `${k + 1} место: ${escH(w.name)}`).join("<br>")}<button class="btn sm" id="aubtn">Применить результат</button></div>` : "";
  const ps = g.players.map(p => `<div class="sec" style="margin-top:14px">${escH(p.name)} · ${escH(p.tag)}</div>${p.img ? `<img class="shot" src="${p.img}" data-v="1" alt="">` : "<p>Скриншот не прикреплён</p>"}${sd ? `<div class="pk">${Array.from({ length: need }, (_, k) => `<button class="btn sm" data-p="${k + 1}" data-id="${p.tg_id}">${k + 1} место</button>`).join("")}</div>` : ""}`).join("");
  app.innerHTML = `<h1>Игра #${g.id}</h1><p>${modeName(g.mode)} · ${escH(g.map)} · ${money(g.stake)}</p>${auBox}${ps}<div class="sec">${sd ? "Выбери призёров (" + need + ")" : "Кто победил?"}</div>${sd ? '<button class="btn" id="done" disabled>Подтвердить</button>' : g.players.map(p => `<button class="btn" data-w="${p.tg_id}">Победил ${escH(p.name)}</button>`).join("")}<button class="btn ghost" id="cancelgame" style="color:#ff6b6b;border-color:#ff6b6b66">🚫 Отменить игру</button><button class="btn ghost" id="back">← Назад</button>`;
  app.querySelectorAll("[data-v]").forEach(i => i.onclick = () => viewImg(i.src));
  q("back").onclick = () => { app.dataset.adm = "0"; renderAdmin(); };
  if (q("cancelgame")) q("cancelgame").onclick = () => askOk("Отменить игру и вернуть ставки?", async () => { try { await rpcTo("admin_cancel_lobby", "call", { id }); hap("success"); toast("Игра отменена"); } catch (e) { toastE(eText(e)); } adminGameId = null; app.dataset.adm = "0"; renderAdmin(); });
  if (q("aubtn")) q("aubtn").onclick = () => askOk("Применить результат?", async () => { try { await rpcTo("tg_auto", "apply", { id }); hap("success"); toast("Матч засчитан"); } catch (e) { toastE(eText(e)); } adminGameId = null; app.dataset.adm = "0"; renderAdmin(); });
  const finish = async winners => { try { await rpc("admin_pick", { id, winners }); toast("Подтверждено"); } catch (e) { toastE(eText(e)); } adminGameId = null; app.dataset.adm = "0"; renderAdmin(); };
  const ask = (msg, go) => tg.showConfirm ? tg.showConfirm(msg, ok => ok && go()) : (confirm(msg) && go());
  if (sd) {
    app.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { const place = +b.dataset.p - 1, pid = +b.dataset.id; for (let k = 0; k < need; k++) if (picks[k] === pid) picks[k] = undefined; picks[place] = pid; app.querySelectorAll("[data-p]").forEach(x => x.classList.toggle("on", picks[+x.dataset.p - 1] === +x.dataset.id)); q("done").disabled = !Array.from({ length: need }, (_, k) => picks[k]).every(Boolean); });
    q("done").onclick = () => { const nm = id2 => g.players.find(p => p.tg_id === id2).name; const w = picks.slice(0, need); ask(w.map((id3, k) => `${k + 1} место: ${nm(id3)}`).join("\n") + "\nПодтвердить?", () => finish(w)); };
  } else {
    app.querySelectorAll("[data-w]").forEach(b => b.onclick = () => { const name = g.players.find(p => String(p.tg_id) === b.dataset.w).name; ask(`Победитель: ${name}. Подтвердить?`, () => finish([+b.dataset.w])); });
  }
}
function renderTopupBox() { const box = document.getElementById("tpbox"); if (!box) return; if (!topupPending) { box.innerHTML = ""; return; } box.innerHTML = `<div class="note"><span class="pulse"></span><b>Ожидание оплаты</b> · ${money(topupPending.amount)}</div><button class="link" id="tpc">Отменить заявку</button>`; q("tpc").onclick = async () => { try { await pay("cancel"); topupPending = null; renderTopupBox(); toast("Отменено"); } catch (e) { toastE(eText(e)); } }; }
function applyTopupState(st) { const prev = topupPending; topupPending = st.pending ? { amount: st.pending.amount, ref: st.pending.ref } : null; if (prev && !topupPending && st.last) toast(st.last.status === "approved" ? "Баланс пополнен на " + money(st.last.amount) : "Перевод отклонён"); renderTopupBox(); }
function renderWdBox() { const box = document.getElementById("wdbox"); if (!box) return; box.innerHTML = wdPending.map(w => `<div class="note"><span class="pulse"></span><b>Вывод в обработке</b> · ${money(w.amount)}${w.bank ? " · " + w.bank : ""}</div>`).join(""); }
function applyWdState(st) { const prev = wdPending; wdPending = st.pending || []; prev.filter(p => !wdPending.some(n => n.id === p.id)).forEach(p => { const r = (st.recent || []).find(x => x.id === p.id); if (r) toast(r.status === "paid" ? "Вывод " + money(r.amount) + " выполнен" : "Вывод отменён, " + money(r.amount) + " вернулись"); }); renderWdBox(); }
async function extraPoll() {
  supBadge(); chatPeek(); ftLoad();
  if (curTab === "matches") loadPub();
  if (cryptoWait > Date.now()) cryptoCheck();
  if (isAdmin) {
    loadAdminStats();
    if (curTab === "admin") loadOnlineStats();
    try { const c = await pay("admin_counts"), w = await wd("admin_count"); const n = Number(c.topups) + Number(c.games) + Number(w.withdrawals); const bdg = document.getElementById("admbdg"); bdg.textContent = n; bdg.classList.toggle("hidden", n === 0); if (Number(c.topups) > admTop) toast("Новая заявка на пополнение"); if (Number(w.withdrawals) > admWd) toast("Новая заявка на вывод"); admTop = Number(c.topups); admWd = Number(w.withdrawals); } catch (e) {}
  }
  if (cur && (topupPending || curTab === "profile")) { try { applyTopupState(await pay("status")); } catch (e) {} }
  if (cur && (wdPending.length || curTab === "profile")) { try { applyWdState(await wdStatus()); } catch (e) {} }
}
function openTopup() {
  if (topupPending) { toast("Уже есть заявка"); return; }
  const el = document.createElement("div"); el.className = "sheet"; el.innerHTML = `<div class="sheet-in" id="sh"></div>`;
  document.body.appendChild(el); el.onclick = e => { if (e.target === el) el.remove(); };
  const sh = el.querySelector("#sh");
  const stepAmount = (def = 300) => {
    sh.innerHTML = `<h1>Пополнение</h1><p>Выбери сумму</p><div class="chips">${[100, 300, 500, 1000].map(a => `<button class="chip${a === def ? " on" : ""}" data-a="${a}">${a} ₽</button>`).join("")}</div><input type="text" id="amt" inputmode="numeric" value="${def}" placeholder="Своя сумма"><p id="tst"></p><button class="btn" id="pay">Перейти к оплате</button><button class="btn ghost" id="paycrypto">Оплатить Xrocket</button><button class="link" id="cls">Отмена</button>`;
    const inp = sh.querySelector("#amt"), tst = sh.querySelector("#tst");
    sh.querySelectorAll(".chip").forEach(c => c.onclick = () => { sh.querySelectorAll(".chip").forEach(x => x.classList.remove("on")); c.classList.add("on"); inp.value = c.dataset.a; });
    sh.querySelector("#cls").onclick = () => el.remove();
    sh.querySelector("#paycrypto").onclick = async () => { const amount = parseInt(inp.value.replace(/\D/g, ""), 10); if (!amount || amount < 50 || amount > 50000) { tst.textContent = "Сумма от 50 до 50 000 ₽"; tst.className = "err"; return; } const cur = (tg.showPopup && await new Promise(res => tg.showPopup({ title: "Валюта", message: "USDT", buttons: [{ id: "USDT", type: "default", text: "USDT" }] }, (id) => res(id)))) || "USDT"; const rates = { USDT: 100 }; const amountCrypto = +(amount / rates[cur]).toFixed(4); tst.className = ""; tst.textContent = "Создаём счёт…"; try { const url = await cryptoTopup(amountCrypto, cur); tg.openLink(url); cryptoWait = Date.now() + 40 * 60 * 1000; el.remove(); toast("Открой оплату в xRocket"); } catch (e) { tst.textContent = "Ошибка: " + (e.error || "unknown"); tst.className = "err"; } };
    sh.querySelector("#pay").onclick = () => { const amount = parseInt(inp.value.replace(/\D/g, ""), 10); if (!amount || amount < 50 || amount > 50000) { tst.textContent = "Сумма от 50 до 50 000 ₽"; tst.className = "err"; return; } stepQr(amount); };
  };
  const stepQr = amount => {
    const ref = String(1000 + Math.floor(Math.random() * 9000));
    sh.innerHTML = `<h1>Переведи ${money(amount)}</h1><p>Переведи ровно <b style="color:var(--tx)">${money(amount)}</b></p>${QR_IMG ? `<img class="qr" src="${QR_IMG}" alt="QR">` : ""}<p style="margin-top:12px">Оставь в комментарии код:</p><div class="refcode">${ref}</div><p id="tst"></p><button class="btn" id="ok">Подтвердить перевод</button><button class="link" id="back">← Изменить сумму</button>`;
    sh.querySelector("#back").onclick = () => stepAmount(amount);
    sh.querySelector("#ok").onclick = async () => { const ok = sh.querySelector("#ok"), tst = sh.querySelector("#tst"); ok.disabled = true; tst.className = ""; tst.textContent = "Отправляем…"; try { await pay("request", { amount, ref }); el.remove(); topupPending = { amount, ref }; renderTopupBox(); hap("success"); toast("Заявка отправлена"); } catch (e) { tst.textContent = eText(e); tst.className = "err"; ok.disabled = false; } };
  };
  stepAmount();
}
const normPhone = v => { const d = v.replace(/\D/g, ""); if (d.length === 11 && (d[0] === "7" || d[0] === "8")) return "+7" + d.slice(1); if (d.length === 10 && d[0] === "9") return "+7" + d; return null; };
function openWithdraw() {
  const bal = Math.floor(Number(cur.balance || 0));
  const el = document.createElement("div"); el.className = "sheet";
  el.innerHTML = `<div class="sheet-in"><h1>Вывод</h1><p>Доступно: <b style="color:var(--tx)">${money(bal)}</b></p><div class="seg"><button class="on" data-m="bank">Карта / СБП</button><button data-m="crypto">Криптовалюта</button></div><input type="text" id="wamt" inputmode="numeric" placeholder="Сумма, ₽"><div id="wbk"><input type="text" id="wph" inputmode="tel" placeholder="Телефон" value="+7"><input type="text" id="wbank" placeholder="Банк"></div><div id="wcr" class="hidden"><div class="chips" style="grid-template-columns:repeat(4,1fr)">${["TON","TRC20","BEP20","xRocket"].map((n,i)=>`<button class="chip${i?"":" on"}" data-net="${n}">${n}</button>`).join("")}</div><input type="text" id="waddr" placeholder="Адрес или @username" style="font-size:14px;letter-spacing:0;text-transform:none"><p id="wusdt" style="font-size:12px"></p></div><p id="tst" style="font-size:12px">Сумма спишется сразу. Если отменят — вернётся.</p><button class="btn" id="ok">Подтвердить вывод</button><button class="link" id="cls">Отмена</button></div>`;
  document.body.appendChild(el); el.onclick = e => { if (e.target === el) el.remove(); };
  const tst = el.querySelector("#tst"), ok = el.querySelector("#ok"), amtEl = el.querySelector("#wamt");
  const bad = t => { tst.textContent = t; tst.className = "err"; };
  let mode = "bank", net = "TON";
  el.querySelector("#cls").onclick = () => el.remove();
  el.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; el.querySelectorAll("[data-m]").forEach(x => x.classList.toggle("on", x === b)); el.querySelector("#wbk").classList.toggle("hidden", mode !== "bank"); el.querySelector("#wcr").classList.toggle("hidden", mode !== "crypto"); });
  el.querySelectorAll("[data-net]").forEach(b => b.onclick = () => { net = b.dataset.net; el.querySelectorAll("[data-net]").forEach(x => x.classList.toggle("on", x === b)); });
  amtEl.oninput = () => { const a = parseInt(amtEl.value.replace(/\D/g, ""), 10) || 0; el.querySelector("#wusdt").textContent = a ? "≈ " + (a/100).toFixed(2) + " USDT" : ""; };
  ok.onclick = async () => {
    const amount = parseInt(amtEl.value.replace(/\D/g, ""), 10);
    if (!amount || amount < 1000) return bad("Минимум 1000 ₽");
    if (amount > bal) return bad("Недостаточно средств");
    let doReq, label;
    if (mode === "bank") { const phone = normPhone(el.querySelector("#wph").value); const bank = el.querySelector("#wbank").value.trim(); if (!phone) return bad("Введи номер +7 900 000-00-00"); if (bank.length < 2) return bad("Укажи банк"); doReq = () => wd("request", { amount, phone, bank }); label = bank; }
    else { const address = el.querySelector("#waddr").value.trim(); if (address.length < 3) return bad("Укажи адрес"); doReq = () => rpcTo("tg_wdc", "request", { amount, address, network: net }); label = "USDT " + net; }
    ok.disabled = true; tst.className = ""; tst.textContent = "Создаём…";
    try { const d = await doReq(); cur.balance = d.balance; const wbe = document.getElementById("wb"); if (wbe) wbe.textContent = money(d.balance); wdPending.push({ id: d.id, amount, bank: label }); renderWdBox(); el.remove(); hap("success"); toast("Заявка создана"); } catch (e) { bad(eText(e)); ok.disabled = false; }
  };
}

const hap = k => { try { const h = tg.HapticFeedback; if (!h) return; if (k === "success" || k === "error" || k === "warning") h.notificationOccurred(k); else if (k === "select") h.selectionChanged(); else h.impactOccurred(k || "light"); } catch (_) {} };
const toastE = t => { hap("error"); toast(t); };
document.addEventListener("click", e => {
  const t = e.target.closest && e.target.closest(".btn,.chip,.seg button,#nav button,.sup,.lrow[data-g],.lrow[data-pl],.bcard");
  if (t && !t.disabled) hap(t.matches("#nav button,.seg button,.chip,.bcard") ? "select" : "light");
});
function fillBonus(g) {
  const bg = document.getElementById("bg"); if (bg) bg.textContent = g + "/50";
  const bar = document.getElementById("bgbar"); if (bar) bar.style.width = Math.min(100, g / 50 * 100) + "%";
  const h = document.getElementById("bgh"); if (!h) return;
  if (g >= 50) { h.textContent = "Условие выполнено: бонусный баланс автоматически перейдёт в основной."; return; }
  const n = 50 - g, one = n % 10 === 1 && n % 100 !== 11, few = [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100);
  h.textContent = (one ? "Осталась " : "Осталось ") + n + " " + (one ? "игра" : few ? "игры" : "игр") + " до того, как бонусный баланс перейдёт в основной.";
}

let cryptoWait = 0, cryptoBusy = false;
async function cryptoCheck() {
  if (cryptoBusy || !cur) return;
  cryptoBusy = true;
  try { const r = await fetch("https://wlhzcocwgmzcrtzhefic.supabase.co/functions/v1/clever-action", { method: "POST", headers: { "Content-Type": "application/json", apikey: ANON, Authorization: "Bearer " + ANON }, body: JSON.stringify({ initData: tg.initData, action: "check" }) }); const d = await r.json(); if (d.credited > 0) { hap("success"); toast("Баланс пополнен через xRocket"); } cryptoWait = d.pending > 0 ? (cryptoWait || Date.now() + 40 * 60 * 1000) : 0; } catch (e) {}
  cryptoBusy = false;
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && cur) cryptoCheck(); });

const ft = (a, b) => rpcTo("tg_ft", a, b);
let ftSt = null, ftKey = "", ftBusy = false, ftDraft = "";
const prizeStr = pr => (pr || []).map((x, i) => `${["🥇","🥈","🥉"][i] || (i+1)+"."} ${money(x)}`).join(" · ");
async function ftLoad(force) {
  if ((ftBusy && !force) || !cur) return;
  if (force) ftKey = "";
  ftBusy = true;
  try { const d = await ft("list"); const prev = ftSt && ftSt.mine ? ftSt.mine.status : null; ftSt = d; if (prev === "open" && d.mine && d.mine.status === "live") { hap("warning"); toast("Турнир начался!"); } const key = JSON.stringify(d); if (key !== ftKey) { ftKey = key; renderFt(); } } catch (e) {}
  ftBusy = false;
}
const ftAct = async (a, args, msg) => { try { await ft(a, args); if (msg) { hap("success"); toast(msg); } } catch (e) { toastE(eText(e)); } ftLoad(true); };
function renderFt() {
  const box = q("ftbox"); if (!box || curTab !== "matches") return;
  if (!ftSt) { box.innerHTML = ""; ftLoad(); return; }
  const m = ftSt.mine;
  if (!m && !(ftSt.items || []).length) { box.innerHTML = ""; return; }
  let html = '<div class="sec">Бесплатные турниры</div>';
  if (m) {
    const ava = (m.players || []).map(p => `<div class="av ${p.me ? "ok" : ""}">${p.photo ? `<img src="${escH(p.photo)}" alt="">` : USER_SVG}</div>`).join("");
    let body;
    if (m.status === "open") body = `<p>Ждём игроков: <b>${m.count}/${m.capacity}</b>.</p><button class="btn ghost" id="ftleave">Выйти из турнира</button>`;
    else if (!m.link && m.creator) body = `<div class="note"><b>Ты создаёшь лобби.</b> Вставь ссылку.</div><input type="text" id="ftlk" placeholder="https://link.brawlstars.com/invite/..." style="font-size:14px;letter-spacing:0;text-transform:none"><button class="btn" id="ftsend">Отправить ссылку</button>`;
    else if (!m.link) body = `<div class="note"><span class="pulse"></span><b>Ждём ссылку на лобби.</b></div>`;
    else body = `<div class="note"><b>Ссылка получена.</b><br>1. Зайди в комнату.<br>2. Сыграйте.<br>3. Прикрепи скриншот.</div><button class="btn" id="ftopen">Открыть лобби</button>` + (m.submitted ? '<div class="note"><b>Скриншот отправлен ✓</b></div>' : `<input type="file" id="ftshot" accept="image/*" class="hidden"><button class="drop" id="ftpick"><b>📷</b>Прикрепить результат</button>`);
    html += `<div class="ftcard"><b>${m.status === "open" ? "Ты в турнире" : "Турнир идёт"} · ${escH(m.map)}</b><span>${prizeStr(m.prizes)}</span><div class="avs many">${ava}</div>${body}</div>`;
  } else {
    const items = ftSt.items || [];
    html += items.map(t => `<div class="ftcard"><b>${escH(t.map)}</b><span>${prizeStr(t.prizes)}</span><div class="ftrow"><em>${t.count}/${t.capacity} игроков</em><button class="btn sm" data-fj="${t.id}">Участвовать</button></div></div>`).join("");
  }
  box.innerHTML = html;
  box.querySelectorAll("[data-fj]").forEach(b => b.onclick = () => { b.disabled = true; ftAct("join", { id: +b.dataset.fj }); });
  if (q("ftleave")) q("ftleave").onclick = () => ftAct("leave", { id: m.id });
  if (q("ftlk")) { q("ftlk").value = ftDraft; q("ftlk").oninput = e => { ftDraft = e.target.value; }; }
  if (q("ftsend")) q("ftsend").onclick = () => { const url = extractLobbyLink(q("ftlk").value); if (!url) { toast("Не нашёл ссылку"); return; } q("ftsend").disabled = true; ftAct("set_link", { id: m.id, link: url }, "Ссылка отправлена"); };
  if (q("ftopen")) q("ftopen").onclick = () => tg.openLink(m.link);
  if (q("ftpick")) { q("ftpick").onclick = () => q("ftshot").click(); q("ftshot").onchange = async ev => { const f = ev.target.files[0]; if (!f) return; q("ftpick").disabled = true; q("ftpick").textContent = "Загружаем…"; try { await ft("submit", { id: m.id, img: await shrink(f) }); hap("success"); toast("Результат отправлен"); } catch (e) { toastE(eText(e)); } ftLoad(true); }; }
}
async function renderFtAdmin() {
  let d; try { d = await ft("a_list"); } catch (e) { toastE(eText(e)); return; }
  if (curTab !== "admin" || adminSec !== "ft") return;
  const rows = d.items.map(t => `<div class="lrow" data-ft="${t.id}" style="cursor:pointer"><div class="li"><b>${escH(t.map)} · ${t.status === "open" ? "набор" : "идёт"}</b><span>${prizeStr(t.prizes)} · скринов ${t.shots}/${t.capacity}</span></div><div class="st">${t.count}/${t.capacity}</div></div>`).join("");
  app.innerHTML = `<h1>Админ-меню</h1>${adminSeg()}<div class="sec">Создать бесплатный турнир (ШД, 10 игроков)</div><input type="text" id="ftmap" placeholder="Карта" maxlength="60" style="text-transform:none;font-size:15px"><input type="text" id="ftn" inputmode="numeric" value="3" placeholder="Сколько победителей (1–10)" style="font-size:15px"><div id="ftpz"></div><button class="btn" id="ftmk">Создать турнир</button><div class="sec">Активные турниры</div><div class="mlist">${rows || "<p>Нет активных турниров.</p>"}</div>`;
  bindSeg();
  const drawPz = () => { const n = Math.max(1, Math.min(10, parseInt(q("ftn").value.replace(/\D/g, ""), 10) || 1)); const old = [...document.querySelectorAll("#ftpz input")].map(i => i.value); q("ftpz").innerHTML = Array.from({ length: n }, (_, i) => `<input type="text" inputmode="numeric" data-pz placeholder="${i + 1} место, ₽" value="${escH(old[i] || "")}" style="font-size:15px">`).join(""); };
  q("ftn").oninput = drawPz; drawPz();
  q("ftmk").onclick = async () => { const map = q("ftmap").value.trim(); const prizes = [...document.querySelectorAll("#ftpz [data-pz]")].map(i => parseInt(i.value.replace(/\D/g, ""), 10)); if (!map) { toast("Укажи карту"); return; } if (prizes.some(x => !x || x <= 0)) { toast("Укажи приз"); return; } q("ftmk").disabled = true; try { await ft("a_create", { map, prizes }); hap("success"); toast("Турнир создан"); renderFtAdmin(); } catch (e) { toastE(eText(e)); q("ftmk").disabled = false; } };
  app.querySelectorAll("[data-ft]").forEach(r => r.onclick = () => openFtAdmin(+r.dataset.ft));
}
async function openFtAdmin(id) {
  let d; try { d = await ft("a_get", { id }); } catch (e) { toastE(eText(e)); return; }
  const t = d.t, pl = d.players, need = t.prizes.length, picks = [], live = t.status === "live";
  const ps = pl.map(p => `<div class="sec" style="margin-top:14px">${escH(p.name || "Игрок")} · ${escH(p.tag || "")}${p.creator ? " · создатель лобби" : ""}</div>${p.img ? `<img class="shot" src="${escH(p.img)}" data-v="1" alt="">` : "<p>Скриншот не прикреплён</p>"}${live ? `<div class="pk" style="flex-wrap:wrap">${t.prizes.map((z, k) => `<button class="btn sm" data-p="${k + 1}" data-id="${p.tg}">${k + 1} · ${money(z)}</button>`).join("")}</div>` : ""}`).join("");
  app.innerHTML = `<h1>Турнир #${t.id}</h1><p>${escH(t.map)} · ${live ? "идёт" : "набор"} · ${pl.length}/${t.capacity}<br>${prizeStr(t.prizes)}</p>${ps || "<p>Игроков пока нет.</p>"}${live ? `<div class="sec">Выбери победителей (${need})</div><button class="btn" id="ftdone" disabled>Подтвердить и выдать призы</button>` : ""}<button class="btn ghost" id="ftcancel">Отменить турнир</button><button class="btn ghost" id="ftback">← Назад</button>`;
  app.querySelectorAll("[data-v]").forEach(i => i.onclick = () => viewImg(i.src));
  q("ftback").onclick = () => renderFtAdmin();
  q("ftcancel").onclick = () => askOk("Отменить турнир?", async () => { try { await ft("a_cancel", { id }); toast("Турнир отменён"); } catch (e) { toastE(eText(e)); } renderFtAdmin(); });
  if (live) {
    app.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { const place = +b.dataset.p - 1, pid = +b.dataset.id; for (let k = 0; k < need; k++) if (picks[k] === pid) picks[k] = undefined; picks[place] = pid; app.querySelectorAll("[data-p]").forEach(x => x.classList.toggle("on", picks[+x.dataset.p - 1] === +x.dataset.id)); q("ftdone").disabled = !Array.from({ length: need }, (_, k) => picks[k]).every(Boolean); });
    q("ftdone").onclick = () => { const nm = tg2 => (pl.find(p => p.tg === tg2) || {}).name || "Игрок"; const w = picks.slice(0, need); askOk(w.map((x, k) => `${k + 1} место: ${nm(x)} (+${money(t.prizes[k])})`).join("\n"), async () => { try { await ft("a_settle", { id, winners: w }); hap("success"); toast("Призы выданы"); } catch (e) { toastE(eText(e)); } renderFtAdmin(); }); };
  }
}

const bc = (a, b) => rpcTo("tg_bc", a, b);
let bcDraft = "";
function bindBc() { const t = q("bctxt"), b = q("bcsend"); if (!t || !b) return; t.value = bcDraft; t.oninput = () => { bcDraft = t.value; }; b.onclick = () => { const text = t.value.trim(); if (!text) { toast("Напиши текст"); return; } askOk("Отправить всем?", async () => { b.disabled = true; try { const r = await bc("send", { text }); bcDraft = ""; t.value = ""; hap("success"); toast("Рассылка: " + r.n); } catch (e) { toastE(eText(e)); } b.disabled = false; }); }; }
const modRpc = (a, b) => rpcTo("tg_mod", a, b);
const adStat = (a, b) => rpcTo("tg_stat", a, b);
const addSec = html => { const tb = q("totbox"); if (tb) tb.insertAdjacentHTML("beforebegin", html); else app.insertAdjacentHTML("beforeend", html); };
async function loadTotals() { if (!q("totbox")) app.insertAdjacentHTML("beforeend", '<div id="totbox"></div>'); let d; try { d = await adStat("get"); } catch (e) { return; } const box = q("totbox"); if (!box) return; box.innerHTML = `<div class="sec">Статистика</div><div class="balrow"><span>Пополнено · ${d.topups_n}</span><b>${money(d.topups)}</b></div><div class="balrow"><span>Выведено · ${d.wd_paid_n}</span><b>${money(d.wd_paid)}</b></div><div class="balrow"><span>Ждут вывода</span><b>${money(d.wd_wait)}</b></div>`; }
async function renderMod(tg) { const box = q("modbox"); if (!box) return; let s; try { s = await modRpc("get", { tg }); } catch (e) { box.innerHTML = `<p class="err">${eText(e)}</p>`; return; } const until = s.mute_until ? new Date(s.mute_until) : null; const forever = until && until.getFullYear() >= 2900; box.innerHTML = `<div class="balrow"><span>Статус</span><b style="font-size:15px">${s.banned ? "⛔ Забанен" : until ? "🔇 Мут " + (forever ? "навсегда" : "до " + fmtT(s.mute_until)) : "Без ограничений"}</b></div><button class="btn sm ${s.banned ? "" : "ghost"}" id="mdban">${s.banned ? "Разбанить" : "Забанить"}</button><div class="sec">Мут</div><div class="chips" style="grid-template-columns:repeat(4,1fr)">${[[1,"1 ч"],[24,"24 ч"],[168,"7 д"],[0,"Навсегда"]].map(x => `<button class="chip" data-mh="${x[0]}">${x[1]}</button>`).join("")}</div>${until ? '<button class="btn sm ghost" id="mdun">Снять мут</button>' : ""}`; const run = async (a, args, msg) => { try { await modRpc(a, { tg, ...args }); hap("success"); toast(msg); } catch (e) { toastE(eText(e)); } renderMod(tg); }; q("mdban").onclick = () => askOk(s.banned ? "Разбанить?" : "Забанить?", () => run("ban", { on: !s.banned }, s.banned ? "Разбанен" : "Забанен")); box.querySelectorAll("[data-mh]").forEach(b => b.onclick = () => run("mute", { hours: +b.dataset.mh || null }, "Мут выдан")); if (q("mdun")) q("mdun").onclick = () => run("mute", { off: true }, "Мут снят"); }
const sup = (a, b) => rpcTo("tg_support", a, b);
let supN = -1;
function setSupBadge(n) { const b = q("supbdg"); if (!b) return; b.textContent = n; b.classList.toggle("hidden", !n); }
async function supBadge() { try { const d = await sup("badge"), n = Number(d.n) || 0; if (supN >= 0 && n > supN) toast(d.admin ? "Новое обращение" : "Ответ от поддержки"); supN = n; setSupBadge(n); } catch (e) {} }
const fmtT = t => new Date(t).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const escH = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function openSupport() { const el = document.createElement("div"); el.className = "sheet"; el.innerHTML = '<div class="sheet-in" id="ssh"></div>'; document.body.appendChild(el); el.onclick = e => { if (e.target === el) el.remove(); }; const sh = el.querySelector("#ssh"); let timer = null, peer = null; const stop = () => { if (timer) { clearInterval(timer); timer = null; } }; const bubbles = ms => ms.length ? ms.map(m => `<div class="sb ${m.admin === isAdmin ? "me" : "them"}">${escH(m.text)}<small>${fmtT(m.at)}</small></div>`).join("") : "<p>Сообщений пока нет.</p>"; const loadThread = async force => { const d = peer ? await sup("user_thread", { tg: peer.tg }) : await sup("thread"); const box = sh.querySelector("#smsgs"); if (!box) return; const atEnd = force || box.scrollHeight - box.scrollTop - box.clientHeight < 40; box.innerHTML = bubbles(d.messages); if (atEnd) box.scrollTop = box.scrollHeight; supBadge(); }; const threadView = () => { sh.innerHTML = `<h1>${peer ? escH(peer.name) : "Поддержка"}</h1><p>${peer ? escH(peer.tag || "") : "Опиши проблему"}</p><div class="smsgs" id="smsgs"><p>Загрузка…</p></div><textarea class="sta" id="stxt" rows="2" maxlength="1000" placeholder="Сообщение…"></textarea><button class="btn" id="ssend">Отправить</button>${peer ? '<button class="link" id="sback">← К обращениям</button>' : '<button class="link" id="scls">Закрыть</button>'}`; if (peer) sh.querySelector("#sback").onclick = () => { stop(); inboxView(); }; else sh.querySelector("#scls").onclick = () => { stop(); el.remove(); }; sh.querySelector("#ssend").onclick = async () => { const t = sh.querySelector("#stxt").value.trim(); if (!t) return; const b = sh.querySelector("#ssend"); b.disabled = true; try { if (peer) await sup("reply", { tg: peer.tg, text: t }); else await sup("send", { text: t }); sh.querySelector("#stxt").value = ""; await loadThread(true); } catch (e) { toastE(eText(e)); } b.disabled = false; }; loadThread(true).catch(e => toastE(eText(e))); stop(); timer = setInterval(() => { if (!document.body.contains(el)) { stop(); return; } if (sh.querySelector("#smsgs")) loadThread(false).catch(() => {}); }, 4000); }; const inboxView = async () => { peer = null; stop(); sh.innerHTML = "<h1>Поддержка</h1><p>Загрузка…</p>"; let d; try { d = await sup("inbox"); } catch (e) { toastE(eText(e)); el.remove(); return; } const byTg = {}; d.items.forEach(x => byTg[x.tg] = x); const rows = d.items.map(x => `<div class="lrow" data-u="${x.tg}" style="cursor:pointer"><div class="li"><b>${escH(x.name)}</b><span>${escH(x.last || "")}</span></div>${x.unread ? `<div class="st">${x.unread}</div>` : ""}</div>`).join(""); sh.innerHTML = `<h1>Поддержка</h1><p>Обращения</p><div class="smsgs">${rows || "<p>Обращений пока нет.</p>"}</div><button class="link" id="scls">Закрыть</button>`; sh.querySelector("#scls").onclick = () => el.remove(); sh.querySelectorAll("[data-u]").forEach(r => r.onclick = () => { peer = byTg[r.dataset.u]; threadView(); }); }; if (isAdmin) inboxView(); else threadView(); }
q("sup").onclick = openSupport;

const chat = (a, b) => rpcTo("tg_chat", a, b);
Object.assign(LERR, { chat_link: "Ссылки запрещены", chat_spam: "Не флуди", chat_slow: "Не так быстро", chat_dup: "Уже отправлено", chat_muted: "Ты в муте" });
let chatT = null, chatLast = 0, chatSeen = 0, chatMsgs = [], chatMute = null, chatBusy = false, chatSending = false, chatForce = false;
const hm = t => new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
const nearEnd = b => b.scrollHeight - b.scrollTop - b.clientHeight < 60;
function chatBad(t) { const n = t.toLowerCase().replace(/\s*(\.|\(dot\)|\[dot\]|точка)\s*/g, "."); if (/(https?:|www\.|t\.me|tg:|@[a-z0-9_]{3,}|[a-zа-я0-9]\.(ru|com|net|org|me|io|gg|xyz|su|ly|cc|tk|рф|site|online|click|top|club|info|co|tv|app|pro|shop|store|link|bio)(?![a-zа-я]))/i.test(n) || /\d[\d ()+-]{8,}\d/.test(t)) return LERR.chat_link; if (/(.)\1{6,}/.test(t)) return LERR.chat_spam; return null; }
function renderChat() { clearInterval(chatT); chatLast = 0; chatMsgs = []; chatBusy = false; chatForce = true; const b = q("chatbdg"); if (b) b.classList.add("hidden"); app.innerHTML = `<div class="chat"><div class="chat-h"><h1>Чат</h1><small></small></div><div class="cmsgs" id="cmsgs"><p style="text-align:center;margin-top:40px">Загрузка…</p></div><button class="cnew hidden" id="cnew">↓ Новые</button><div id="cfoot"></div></div>`; const box = q("cmsgs"); box.onscroll = () => { if (nearEnd(box)) q("cnew").classList.add("hidden"); }; q("cnew").onclick = () => { box.scrollTo({ top: box.scrollHeight, behavior: "smooth" }); q("cnew").classList.add("hidden"); }; drawFoot(); chatPull(true); chatT = setInterval(() => { if (curTab !== "chat") { clearInterval(chatT); return; } if (!document.hidden) chatPull(false); }, 2000); }
function drawMsgs() { const box = q("cmsgs"); if (!box) return; if (!chatMsgs.length) { box.innerHTML = '<p style="text-align:center;margin-top:40px">Пока тихо.</p>'; return; } let prev = null; box.innerHTML = chatMsgs.map(m => { const me = m.tg === tgUser.id; const cont = prev && prev.tg === m.tg && (new Date(m.at) - new Date(prev.at) < 120000); prev = m; return `<div class="cm${me ? " me" : ""}${cont ? " cont" : ""}"><div class="av">${m.photo ? `<img src="${escH(m.photo)}" alt="">` : USER_SVG}</div><div class="cb">${!me && !cont ? `<div class="cn">${escH(m.name || "Игрок")}${m.admin ? '<span class="ca">ADMIN</span>' : ""}</div>` : ""}${escH(m.text)}<time>${hm(m.at)}</time></div></div>`; }).join(""); }
async function chatPull(first) { if (chatBusy) return; chatBusy = true; try { const d = await chat("list", { since: chatLast }); const box = q("cmsgs"); if (curTab !== "chat" || !box) return; chatMute = d.mute_until && new Date(d.mute_until) > new Date() ? d.mute_until : null; drawFoot(); const gone = new Set(d.gone || []), fresh = d.messages || []; const hadGone = chatMsgs.some(m => gone.has(m.id)); if (!fresh.length && !hadGone && !first) return; const stick = first || chatForce || nearEnd(box); chatMsgs = chatMsgs.filter(m => !gone.has(m.id)).concat(fresh).slice(-150); if (fresh.length) chatSeen = chatLast = fresh[fresh.length - 1].id; drawMsgs(); chatForce = false; if (stick) box.scrollTop = box.scrollHeight; } catch (e) {} finally { chatBusy = false; } }
function drawFoot() { const f = q("cfoot"); if (!f) return; const key = chatMute || ""; if (f.dataset.k === key && f.firstChild) return; f.dataset.k = key; if (chatMute) { f.innerHTML = `<div class="cmuted">🔇 Ты в муте ${new Date(chatMute).getFullYear() >= 2900 ? "навсегда" : "до " + fmtT(chatMute)}</div>`; return; } f.innerHTML = `<div class="cbar"><input type="text" id="cin" placeholder="Сообщение…" maxlength="200" autocomplete="off"><button class="csend" id="csend"><svg viewBox="0 0 24 24"><path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4 18-7z"/></svg></button></div><div class="ccount" id="ccnt"></div>`; q("cin").oninput = () => { const n = q("cin").value.length; q("ccnt").textContent = n > 150 ? n + "/200" : ""; }; q("cin").addEventListener("keydown", e => { if (e.key === "Enter") chatSend(); }); q("csend").onclick = chatSend; }
async function chatSend() { const i = q("cin"); if (!i || chatSending) return; const t = i.value.replace(/\s+/g, " ").trim(); if (!t) return; const bad = chatBad(t); if (bad) { toastE(bad); return; } chatSending = true; q("csend").disabled = true; try { const d = await chat("send", { text: t }); if (d.error) { if (d.error === "chat_muted" && d.until) { chatMute = d.until; drawFoot(); } toastE(LERR[d.error] || d.error); } else { i.value = ""; q("ccnt").textContent = ""; chatForce = true; hap("light"); } } catch (e) { toastE(eText(e)); } chatPull(false); setTimeout(() => { chatSending = false; const b = q("csend"); if (b) b.disabled = false; }, 1200); }
async function chatPeek() { if (curTab === "chat" || !cur) return; try { const d = await chat("peek", { since: chatSeen }); if (!chatSeen) { chatSeen = d.last || 0; return; } const b = q("chatbdg"); if (!b) return; b.textContent = d.n > 99 ? "99+" : d.n; b.classList.toggle("hidden", !d.n); } catch (e) {} }

/* ===== Кнопки навигации (обязательно!) ===== */
document.querySelectorAll("#nav button").forEach(b => b.onclick = () => { if (cur || guest) showTab(b.dataset.t); });

/* ===== ЖИВАЯ СТАТИСТИКА ПЛАТФОРМЫ ===== */
let pubSt = null, pubBusy = false;
const fmtN = n => (n == null ? "—" : Number(n).toLocaleString("ru-RU"));
function pubHTML() {
  const v = pubSt || {};
  const cell = (k, label, cls) => `<div class="pb-c ${cls}"><b data-k="${k}" data-v="${Number(v[k]) || 0}">${fmtN(v[k])}</b><span>${label}</span></div>`;
  return `<div class="pubboard"><div class="pb-h"><i class="live"></i>Сейчас на платформе</div>
  <div class="pb-g">${cell("searching", "В поиске", "s")}${cell("in_match", "В матче", "m")}</div>
  <div class="pb-t"><span>Игр засчитано на проекте</span><b data-k="games" data-v="${Number(v.games) || 0}">${fmtN(v.games)}</b></div></div>`;
}
function countTo(el, to) {
  const from = Number(el.dataset.v) || 0; el.dataset.v = to;
  if (from === to) { el.textContent = fmtN(to); return; }
  const t0 = performance.now(), dur = 650;
  const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmtN(Math.round(from + (to - from) * e)); if (k < 1 && el.isConnected) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
async function loadPub() {
  if (pubBusy) return; pubBusy = true;
  try {
    const d = await rpcTo("tg_public_stats", "get", {});
    if (d && !d.error) { pubSt = d; const box = q("pubbox"); if (box) { if (!box.querySelector(".pubboard")) box.innerHTML = pubHTML(); box.querySelectorAll("[data-k]").forEach(el => countTo(el, Number(pubSt[el.dataset.k]) || 0)); } }
  } catch (e) { const box = q("pubbox"); if (box && !pubSt) box.innerHTML = ""; }
  pubBusy = false;
}
setInterval(() => { if (guest && curTab === "matches") loadPub(); }, 5000);
/* ===== /ЖИВАЯ СТАТИСТИКА ===== */

/* ===== ГОСТЕВОЙ РЕЖИМ ===== */
let guest = false;
const GATE = {
  profile: ["🔑", "Зарегистрируйся", "Привяжи аккаунт Brawl Stars — откроются профиль, статистика, баланс и история матчей."],
  missions: ["⭐", "Зарегистрируйся", "Привяжи аккаунт Brawl Stars, чтобы выполнять миссии, получать награды и приглашать друзей."],
  chat: ["💬", "Зарегистрируйся", "Общий чат доступен после привязки аккаунта Brawl Stars."]
};
function enterGuest() {
  guest = true; cur = null; curTab = "profile";
  document.body.classList.add("shell");
  document.getElementById("nav").classList.remove("hidden");
  document.getElementById("sup").classList.add("hidden");
  showTab("profile");
}
function startReg() {
  document.querySelectorAll(".sheet").forEach(x => x.remove());
  curTab = "profile";
  document.body.classList.remove("shell");
  document.getElementById("nav").classList.add("hidden");
  document.getElementById("sup").classList.add("hidden");
  upload();
  app.insertAdjacentHTML("beforeend", '<p><a href="#" id="gback" style="color:var(--mut)">← Посмотреть приложение</a></p>');
  q("gback").onclick = e => { e.preventDefault(); enterGuest(); };
}
function guestGate(t) {
  const g = GATE[t] || GATE.profile;
  const preview = t === "profile" ? `<div class="stats" style="opacity:.55"><div class="stat w"><b>—</b><span>Победы</span></div><div class="stat l"><b>—</b><span>Поражения</span></div><div class="stat r"><b>—</b><span>Винрейт</span></div></div>` : "";
  app.innerHTML = `<div class="icon">${g[0]}</div><h1>${g[1]}</h1><p>${g[2]}</p>${preview}<button class="btn" id="greg">Зарегистрироваться</button>`;
  q("greg").onclick = startReg;
}
function askRegister() {
  const el = document.createElement("div"); el.className = "sheet";
  el.innerHTML = '<div class="sheet-in"><div class="icon">🔒</div><h1>Нужна регистрация</h1><p>Чтобы играть, привяжи аккаунт Brawl Stars. Это займёт минуту.</p><button class="btn" id="rg">Зарегистрироваться</button><button class="link" id="rl">Позже</button></div>';
  document.body.appendChild(el);
  el.onclick = e => { if (e.target === el) el.remove(); };
  el.querySelector("#rl").onclick = () => el.remove();
  el.querySelector("#rg").onclick = startReg;
}
function guestMatches() {
  const stakes = [50, 100, 200];
  if (!stakes.includes(pickStake)) pickStake = 100;
  app.innerHTML = `<h1>Матчи</h1><p>Нажми «Поиск» — подберём соперника автоматически</p>
  <div class="balrow dual"><div><span>Бонусный</span><b>0 ₽</b></div><i></i><div><span>Основной</span><b>0 ₽</b></div></div>
  <div class="sec">Найти матч</div>
  <div class="chips" style="grid-template-columns:repeat(3,1fr)">${stakes.map(x => `<button class="chip${x === pickStake ? " on" : ""}" data-s="${x}">${x} ₽</button>`).join("")}</div>
  <button class="btn" id="mk">🔍 Поиск · ${money(pickStake)}</button>
  <div id="pubbox">${pubHTML()}</div>`;
  loadPub();
  app.querySelectorAll(".chip").forEach(c => c.onclick = () => { pickStake = +c.dataset.s; guestMatches(); });
  q("mk").onclick = askRegister;
}
/* ===== /ГОСТЕВОЙ РЕЖИМ ===== */

/* ===== PREMIUM: лиги, серия, конфетти ===== */
const LEAGUES = [
  { n: "Бронза", cls: "", min: 0 }, { n: "Серебро", cls: "silver", min: 10 },
  { n: "Золото", cls: "gold", min: 30 }, { n: "Алмаз", cls: "diamond", min: 75 },
  { n: "Мифик", cls: "mythic", min: 150 }
];
function leagueHTML(wins) {
  let i = 0; LEAGUES.forEach((l, k) => { if (wins >= l.min) i = k; });
  const cu = LEAGUES[i], nx = LEAGUES[i + 1];
  const pct = nx ? Math.round((wins - cu.min) / (nx.min - cu.min) * 100) : 100;
  return `<div class="league ${cu.cls}"><i></i>${cu.n}</div><div class="lg-prog"><div class="bar"><i style="width:${pct}%"></i></div><small><span>${wins} побед</span><span>${nx ? "до " + nx.n + ": " + (nx.min - wins) : "макс. лига"}</span></small></div>`;
}
const streakHTML = n => n >= 2 ? `<span class="streak"><i></i>${n} подряд</span>` : "";
function confetti(n = 60) {
  const w = document.createElement("div"); w.className = "confetti";
  const cols = ["#ff7a00", "#ffa040", "#ffd54a", "#ff4d00", "#fff"];
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%"; p.style.background = cols[i % cols.length];
    p.style.setProperty("--x", (Math.random() * 160 - 80) + "px");
    p.style.setProperty("--r", (Math.random() * 900 - 300) + "deg");
    p.style.setProperty("--t", (1.8 + Math.random() * 1.4) + "s");
    p.style.animationDelay = Math.random() * .35 + "s";
    w.appendChild(p);
  }
  document.body.appendChild(w); setTimeout(() => w.remove(), 3800);
}
function popEl(el) { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
/* ===== /PREMIUM ===== */

function boot() {
  app.innerHTML = "<h1>Загрузка…</h1>";
  const t = setTimeout(() => { app.innerHTML = `<div class="icon">⚠️</div><h1>Сервер не отвечает</h1><p>Через 15 сек ответа нет.</p><button class="btn" onclick="boot()">Повторить</button>`; }, 15000);
  call("me").then(d => { clearTimeout(t); render(d.player); ms("ref_touch").catch(() => {}); }).catch(e => { clearTimeout(t); app.innerHTML = `<div class="icon">⚠️</div><h1>Ошибка загрузки</h1><p class="err">${errText(e)}</p><button class="btn" onclick="boot()">Повторить</button>`; });
}
function showChannelTip() {
  const CH = "https://t.me/BsCrHub";
  const el = document.createElement("div"); el.className = "tip";
  el.innerHTML = '<div class="ti"><svg viewBox="0 0 24 24"><path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4 18-7z"/></svg></div><div class="tt"><b>Подпишитесь на Telegram-канал</b><span></span></div><button class="tx" aria-label="Скрыть"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>';
  document.body.appendChild(el);
  let gone = false, timer = null, x0 = null;
  const hide = () => { if (gone) return; gone = true; clearTimeout(timer); el.classList.remove("in"); el.classList.add("out"); setTimeout(() => el.remove(), 450); };
  el.onclick = () => { try { tg.openTelegramLink(CH); } catch (_) { tg.openLink(CH); } };
  el.querySelector(".tx").onclick = e => { e.stopPropagation(); hide(); };
  el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  el.addEventListener("touchend", e => { if (x0 !== null && e.changedTouches[0].clientX - x0 > 40) hide(); x0 = null; }, { passive: true });
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));
  timer = setTimeout(hide, 12000);
}
setTimeout(showChannelTip, 900);
boot();
