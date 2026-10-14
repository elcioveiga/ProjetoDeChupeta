"use strict";

/*
  AVENTURA DOS NÚMEROS
  Índice:
   1. DADOS DO JOGO
   2. ARMAZENAMENTO
   3. SOM
   4. ARTE
   5. QUIZ
   6. JOGO
   7. INTERFACE
   8. EVENTOS
   9. INÍCIO

  A ordem das seções importa: cada uma usa o que as anteriores definem.
*/

/* ============================================================
   1. DADOS DO JOGO
   Fases, acessórios, medalhas, frases e caminhos das imagens
   ============================================================ */

const IMG = { logo: "assets/logotipo.webp", luma: "assets/luma.webp", pipo: "assets/pipo.webp" };
const PLANETS = [1, 2, 3, 4, 5].map((i) => `assets/planeta${i}.webp`);

/*
  Onde cada acessório fica em cada pose da Luma.
  x, y = posição em % da largura/altura da imagem; w (e h) = tamanho em % da imagem.
  coroa: x,y = topo do capacete. oculos: x,y = centro dos olhos.
  capa e asas ficam atrás do corpo e usam ACC_BODY, igual para todas as poses.
*/
const ACC_LAYOUT = {
  neutra: { coroa: { x: 54, y: 8, w: 30 }, oculos: { x: 58, y: 25, w: 26 } },
  feliz: { coroa: { x: 50, y: 8, w: 30 }, oculos: { x: 53, y: 25, w: 24 } },
  pensativa: { coroa: { x: 51, y: 8, w: 30 }, oculos: { x: 52, y: 25, w: 28 } },
  surpresa: { coroa: { x: 50, y: 11, w: 30 }, oculos: { x: 56, y: 26, w: 24 } },
  comemorando: { coroa: { x: 52, y: 9, w: 30 }, oculos: { x: 50, y: 21.5, w: 27 } },
  encorajadora: { coroa: { x: 48, y: 8, w: 30 }, oculos: { x: 49, y: 25, w: 27 } },
  acenando: { coroa: { x: 52, y: 11, w: 30 }, oculos: { x: 54, y: 26, w: 26 } },
};
const ACC_BODY = {
  capa: { x: 52, y: 30, w: 66, h: 48 },
  asas: { x: 50, y: 36, w: 150, h: 34 },
};

/* Poses da Luma usadas durante o jogo (a tela inicial usa IMG.luma, que está acenando) */
const LUMA_POSES = {
  neutra: {
    src: "assets/luma-neutra.webp",
    alt: "Luma, a exploradora espacial, com um sorriso tranquilo",
  },
  feliz: { src: "assets/luma-feliz.webp", alt: "Luma feliz, de braços levantados" },
  pensativa: { src: "assets/luma-pensativa.webp", alt: "Luma pensativa, com a mão no queixo" },
  surpresa: { src: "assets/luma-surpresa.webp", alt: "Luma surpresa, de boca aberta" },
  comemorando: { src: "assets/luma-comemorando.webp", alt: "Luma pulando e comemorando" },
  encorajadora: { src: "assets/luma-encorajadora.webp", alt: "Luma com o polegar levantado" },
};

const LEVELS = [
  {
    n: "Planeta das Estrelas",
    sym: "+",
    em: "🌟",
    c: "#2ecc71",
    al: "Zizi",
    ac: "#5dd65d",
    story: "Zizi precisa somar estrelas para acender a nave! Ajude-a a juntar todas.",
  },
  {
    n: "Planeta do Deserto",
    sym: "−",
    em: "🏜️",
    c: "#ff9f43",
    al: "Teco",
    ac: "#ff9f43",
    story: "Teco perdeu parte do tesouro na areia. Subtraia para descobrir quanto sobrou!",
  },
  {
    n: "Planeta dos Cristais",
    sym: "×",
    em: "💎",
    c: "#a55eea",
    al: "Lili",
    ac: "#a55eea",
    story: "Lili guarda cristais em grupos iguais. Multiplique para contar todos!",
  },
  {
    n: "Planeta do Gelo",
    sym: "÷",
    em: "❄️",
    c: "#45aaf2",
    al: "Nino",
    ac: "#8fd3ff",
    story: "Nino quer dividir os blocos de gelo igualmente entre os amigos. Divida com cuidado!",
  },
];
const ACC = [
  { id: "coroa", n: "Coroa Estelar", e: "👑" },
  { id: "oculos", n: "Óculos do Deserto", e: "🕶️" },
  { id: "capa", n: "Capa de Cristal", e: "🦸" },
  { id: "asas", n: "Asas de Gelo", e: "🪽" },
];
const MEDALS = [
  { id: "m1", n: "Primeira estrela", e: "🥇", ok: (s) => s.stars.some((x) => x > 0) },
  { id: "m2", n: "Sequência de 5", e: "🔥", ok: (s) => s.bestStreak >= 5 },
  { id: "m3", n: "Fase perfeita", e: "💯", ok: (s) => s.perfect > 0 },
  { id: "m4", n: "100 pontos", e: "🎯", ok: (s) => s.points >= 100 },
  { id: "m5", n: "Super explorador", e: "🚀", ok: (s) => s.stars.every((x) => x > 0) },
  { id: "m6", n: "Troféu Galáctico", e: "🏆", ok: (s) => s.stars.every((x) => x == 3) },
];
const OKS = ["Uau!", "Incrível!", "Você arrasou!", "Isso mesmo!"],
  BADS = ["Quase!", "Vamos nessa!", "Errar também ensina!", "Na próxima você acerta!"];

/* ============================================================
   2. ARMAZENAMENTO
   Salva e carrega o progresso no localStorage
   ============================================================ */

const KEY = "aventura-dos-numeros-v1";
const def = () => ({
  stars: [0, 0, 0, 0],
  unlocked: 1,
  points: 0,
  correct: 0,
  bestStreak: 0,
  perfect: 0,
  acc: [],
  equipped: null,
  sound: true,
  anim: true,
  played: false,
});
const Store = {
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      return Object.assign(def(), d || {});
    } catch (e) {
      return def();
    }
  },
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
  },
  reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
    S = def();
  },
};
let S = Store.load();

/* ============================================================
   3. SOM
   Efeitos sonoros simples gerados pelo navegador
   ============================================================ */

const Snd = {
  ctx: null,
  t(f, d = 0.12, at = 0) {
    if (!S.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = this.ctx.createOscillator(),
        g = this.ctx.createGain();
      o.frequency.value = f;
      g.gain.value = 0.07;
      o.connect(g);
      g.connect(this.ctx.destination);
      const s = this.ctx.currentTime + at;
      o.start(s);
      o.stop(s + d);
    } catch (e) {}
  },
  ok() {
    this.t(660);
    this.t(880, 0.18, 0.12);
  },
  bad() {
    this.t(330, 0.25);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => this.t(f, 0.18, i * 0.14));
  },
};

/* ============================================================
   4. ARTE
   Personagens desenhados em SVG
   ============================================================ */

const Art = {
  pipo() {
    return `<svg viewBox="0 0 100 110" role="img" aria-label="Pipo, o robô"><line x1="50" y1="8" x2="50" y2="22" stroke="#1abc9c" stroke-width="3"/><circle cx="50" cy="8" r="5" fill="#ff6b81"/><rect x="18" y="22" width="64" height="46" rx="20" fill="#fff" stroke="#1abc9c" stroke-width="4"/><rect x="27" y="31" width="46" height="28" rx="14" fill="#0b2a3a"/><circle cx="40" cy="45" r="6" fill="#3ee6d0"/><circle cx="60" cy="45" r="6" fill="#3ee6d0"/><path d="M44 54 Q50 58 56 54" stroke="#3ee6d0" stroke-width="2" fill="none"/><rect x="30" y="70" width="40" height="28" rx="12" fill="#1abc9c"/><circle cx="50" cy="84" r="5" fill="#fff"/><rect x="10" y="74" width="14" height="10" rx="5" fill="#fff" stroke="#1abc9c" stroke-width="2"/><rect x="76" y="74" width="14" height="10" rx="5" fill="#fff" stroke="#1abc9c" stroke-width="2"/></svg>`;
  },
  alien(c, name) {
    return `<svg viewBox="0 0 100 110" role="img" aria-label="${name}, alienígena"><line x1="38" y1="14" x2="34" y2="28" stroke="${c}" stroke-width="3"/><line x1="62" y1="14" x2="66" y2="28" stroke="${c}" stroke-width="3"/><circle cx="38" cy="12" r="5" fill="#ffe066"/><circle cx="62" cy="12" r="5" fill="#ffe066"/><path d="M14 70 Q14 24 50 24 Q86 24 86 70 Q86 100 50 100 Q14 100 14 70Z" fill="${c}" stroke="#0003" stroke-width="2"/><circle cx="38" cy="58" r="11" fill="#fff"/><circle cx="62" cy="58" r="11" fill="#fff"/><circle cx="40" cy="60" r="6" fill="#222"/><circle cx="64" cy="60" r="6" fill="#222"/><circle cx="42" cy="57" r="2" fill="#fff"/><circle cx="66" cy="57" r="2" fill="#fff"/><path d="M38 80 Q50 92 62 80" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  },
};

/* ----- Desenhos dos acessórios (layer: "back" = atrás da Luma, "front" = na frente) ----- */
const ACC_ART = {
  coroa: {
    layer: "front",
    svg: `<svg viewBox="0 0 100 60"><path d="M6 56 L10 14 L30 34 L50 4 L70 34 L90 14 L94 56Z" fill="#ffd32a" stroke="#b8860b" stroke-width="4" stroke-linejoin="round"/><rect x="6" y="46" width="88" height="12" rx="4" fill="#ffb300" stroke="#b8860b" stroke-width="3"/><circle cx="50" cy="52" r="5" fill="#ff5c8a"/><circle cx="26" cy="52" r="3.5" fill="#4dd0e1"/><circle cx="74" cy="52" r="3.5" fill="#4dd0e1"/><circle cx="10" cy="13" r="4.5" fill="#fff6c8" stroke="#b8860b" stroke-width="2"/><circle cx="50" cy="5" r="4.5" fill="#fff6c8" stroke="#b8860b" stroke-width="2"/><circle cx="90" cy="13" r="4.5" fill="#fff6c8" stroke="#b8860b" stroke-width="2"/></svg>`,
  },
  oculos: {
    layer: "front",
    svg: `<svg viewBox="0 0 100 36"><path d="M0 12H6M94 12H100" stroke="#d4a017" stroke-width="3"/><path d="M6 10 H46 Q46 34 26 34 Q6 34 6 10Z" fill="#2b1d0e" fill-opacity=".85" stroke="#d4a017" stroke-width="3" stroke-linejoin="round"/><path d="M54 10 H94 Q94 34 74 34 Q54 34 54 10Z" fill="#2b1d0e" fill-opacity=".85" stroke="#d4a017" stroke-width="3" stroke-linejoin="round"/><path d="M46 14 Q50 8 54 14" stroke="#d4a017" stroke-width="3" fill="none"/><path d="M12 17 L22 15M60 17 L70 15" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  capa: {
    layer: "back",
    svg: `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="gcp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e84393"/><stop offset="1" stop-color="#7c4dff"/></linearGradient></defs><path d="M26 0 H74 Q96 45 100 100 Q50 90 0 100 Q4 45 26 0Z" fill="url(#gcp)" stroke="#5b2a9c" stroke-width="2" vector-effect="non-scaling-stroke"/><path d="M50 8 Q52 50 50 92" stroke="#ffffff66" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/></svg>`,
  },
  asas: {
    layer: "back",
    svg: `<svg viewBox="0 0 200 100" preserveAspectRatio="none"><defs><linearGradient id="gwg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eefaff"/><stop offset="1" stop-color="#7cc4ff"/></linearGradient><path id="wg" d="M92 72 C70 55 40 34 6 14 C14 32 14 38 22 46 C20 54 30 58 38 62 C40 70 58 74 92 80Z" fill="url(#gwg)" stroke="#4a9be0" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></defs><use href="#wg"/><use href="#wg" transform="translate(200 0) scale(-1 1)"/></svg>`,
  },
};

/* ============================================================
   5. QUIZ
   Geração e verificação das perguntas
   ============================================================ */

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const shuf = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const Quiz = {
  make(l, i) {
    // l = operação (0..3), i = índice 0..9 (dificuldade cresce com i)
    let a, b, ans, text, hint, expl;
    const A = [9, 10, 12, 15, 20, 30, 45, 60, 80, 99],
      T = [3, 4, 5, 6, 7, 8, 9, 10, 10, 12],
      U = [5, 5, 6, 6, 8, 9, 10, 10, 12, 12],
      Q = [5, 6, 8, 9, 10, 10, 12, 12, 12, 12];
    if (l == 0) {
      a = rnd(3, A[i]);
      b = rnd(2, A[i]);
      ans = a + b;
      text = `${a} + ${b} = ?`;
      hint = `Comece em ${Math.max(a, b)} e conte mais ${Math.min(a, b)} para a frente. Dica: some as dezenas e depois as unidades.`;
      expl = `${a} + ${b} = ${ans}.`;
    } else if (l == 1) {
      a = rnd(6, A[i] + 10);
      b = rnd(1, a - 1);
      ans = a - b;
      text = `${a} − ${b} = ?`;
      hint = `Comece em ${a} e volte ${b}. Ou pense: ${b} + quanto = ${a}?`;
      expl = `${a} − ${b} = ${ans}, porque ${b} + ${ans} = ${a}.`;
    } else if (l == 2) {
      a = rnd(2, T[i]);
      b = rnd(2, U[i]);
      ans = a * b;
      text = `${a} × ${b} = ?`;
      hint = `${a} × ${b} quer dizer ${a} grupos com ${b} em cada. Some ${b} um total de ${a} vezes.`;
      expl = `${a} × ${b} = ${ans}. Conferindo: ${ans} ÷ ${b} = ${a}.`;
    } else {
      b = rnd(2, T[i]);
      const q = rnd(2, Q[i]);
      a = b * q;
      ans = q;
      text = `${a} ÷ ${b} = ?`;
      hint = `Pense: ${b} vezes qual número dá ${a}?`;
      expl = `${a} ÷ ${b} = ${ans}, porque ${b} × ${ans} = ${a}.`;
    }
    const pool = shuf([
      ans + 1,
      ans - 1,
      ans + 2,
      ans - 2,
      ans + 10,
      ans - 10,
      ans + b,
      ans - b,
      ans + a,
      ans + 3,
    ]).filter((v, k, r) => v >= 0 && v !== ans && r.indexOf(v) === k);
    let n = 3;
    while (pool.length < 3) pool.push(ans + n++);
    const opts = shuf([ans, ...pool.slice(0, 3)]);
    return { text, ans, opts, hint, expl, key: text };
  },
  set(l) {
    const used = new Set(),
      qs = [];
    for (let i = 0; i < 10; i++) {
      let q,
        t = 0;
      do {
        q = this.make(l, i);
      } while (used.has(q.key) && ++t < 25);
      used.add(q.key);
      qs.push(q);
    }
    return qs;
  },
  stars: (c) => (c >= 9 ? 3 : c >= 7 ? 2 : c >= 5 ? 1 : 0),
};
window.selfTest = () => {
  let bad = 0;
  for (let l = 0; l < 4; l++)
    for (let r = 0; r < 500; r++)
      for (let i = 0; i < 10; i++) {
        const q = Quiz.make(l, i),
          m = q.text.match(/(\d+) (.) (\d+)/),
          x = +m[1],
          y = +m[3];
        const v = { "+": x + y, "−": x - y, "×": x * y, "÷": x / y }[m[2]];
        if (
          v !== q.ans ||
          !Number.isInteger(v) ||
          v < 0 ||
          new Set(q.opts).size !== 4 ||
          q.opts.filter((o) => o === q.ans).length !== 1 ||
          q.opts.some((o) => o < 0)
        )
          bad++;
      }
  console.log(bad ? "FALHAS: " + bad : "OK: 20.000 perguntas verificadas");
  return bad;
};

/* ============================================================
   6. JOGO
   Estado da partida, pontos, sequência, dicas e fim de fase
   ============================================================ */

let G = null,
  paused = false;
const medalsNow = () => MEDALS.filter((m) => m.ok(S)).map((m) => m.id);
const Game = {
  start(l) {
    G = { l, qs: Quiz.set(l), i: 0, pts: 0, corr: 0, streak: 0, max: 0, hint: false, done: false };
    paused = false;
    S.played = true;
    UI.question();
  },
  answer(k) {
    if (!G || G.done || paused) return;
    const q = G.qs[G.i];
    G.done = true;
    const ok = q.opts[k] === q.ans;
    let gain = 0;
    if (ok) {
      G.corr++;
      G.streak++;
      G.max = Math.max(G.max, G.streak);
      gain = (G.hint ? 5 : 10) + (G.streak > 1 ? Math.min(G.streak - 1, 5) * 2 : 0);
      G.pts += gain;
      Snd.ok();
    } else {
      G.streak = 0;
      Snd.bad();
    }
    UI.feedback(k, ok, gain);
  },
  hint() {
    if (!G || G.done || G.hint || paused) return;
    G.hint = true;
    const q = G.qs[G.i];
    const wrong = q.opts.map((o, k) => k).filter((k) => q.opts[k] !== q.ans);
    shuf(wrong)
      .slice(0, 2)
      .forEach((k) => {
        const b = document.querySelector(`.opt[data-arg="${k}"]`);
        b.disabled = true;
        b.classList.add("off");
      });
    document.getElementById("fb").className = "fb";
    document.getElementById("fb").textContent =
      "💡 " + q.hint + " (Eliminei duas respostas! Acertar com dica vale 5 pontos.)";
    document.getElementById("hb").disabled = true;
    setMood("encorajadora"); // incentiva ao pedir dica
  },
  next() {
    G.i++;
    G.done = false;
    G.hint = false;
    G.i >= 10 ? this.finish() : UI.question();
  },
  finish() {
    const before = medalsNow(),
      st = Quiz.stars(G.corr),
      l = G.l;
    S.stars[l] = Math.max(S.stars[l], st);
    if (st > 0) S.unlocked = Math.max(S.unlocked, Math.min(4, l + 2));
    S.points += G.pts;
    S.correct += G.corr;
    S.bestStreak = Math.max(S.bestStreak, G.max);
    if (G.corr == 10) S.perfect++;
    let newAcc = null;
    if (st > 0 && !S.acc.includes(ACC[l].id)) {
      S.acc.push(ACC[l].id);
      newAcc = ACC[l];
      S.equipped = ACC[l].id; // a Luma já passa a usar o acessório novo
    }
    const newM = MEDALS.filter((m) => m.ok(S) && !before.includes(m.id));
    Store.save();
    G.st = st;
    G.newAcc = newAcc;
    G.newM = newM;
    st > 0 ? Snd.win() : Snd.bad();
    UI.complete();
  },
};

/* ============================================================
   7. INTERFACE
   Desenho de cada tela
   ============================================================ */

const app = document.getElementById("app"),
  $ = (s) => document.querySelector(s);
const total = () => S.stars.reduce((a, b) => a + b, 0);
function go(name, html, focus = "h1,h2") {
  app.innerHTML = `<main class="screen ${name}">${html}</main>`;
  document.body.classList.toggle("noanim", !S.anim);
  document.body.dataset.s = name;
  const h = app.querySelector(focus);
  if (h) {
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
  }
}
const star = (n) => "⭐".repeat(n) + "☆".repeat(3 - n);
function confetti() {
  if (!S.anim) return;
  const r = $(".opt.ok")?.getBoundingClientRect() || { left: innerWidth / 2, top: innerHeight / 2 };
  ["⭐", "✨", "🎉", "🌟"].forEach((e, k) => {
    for (let j = 0; j < 3; j++) {
      const s = document.createElement("span");
      s.className = "conf";
      s.textContent = e;
      s.style.left = r.left + 20 + j * 25 + "px";
      s.style.top = r.top + "px";
      s.style.setProperty("--x", k * 30 - 50 + j * 20 + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1300);
    }
  });
}
/* ----- Luma: expressões e animações ----- */

// Monta a Luma (imagem da pose) já vestindo o acessório equipado, se houver.
// O acessório é um SVG posicionado por cima (coroa, óculos) ou por trás (capa, asas) da imagem.
function lumaFigure(pose, src, alt, cls = "") {
  const id = S.equipped;
  const art = ACC_ART[id];
  const pos = (ACC_LAYOUT[pose] || {})[id] || ACC_BODY[id];
  let back = "";
  let front = "";
  if (art && pos) {
    const size = `width:${pos.w}%;` + (pos.h ? `height:${pos.h}%;` : "");
    const el = `<span class="acc acc-${id}" style="left:${pos.x}%;top:${pos.y}%;${size}" aria-hidden="true">${art.svg}</span>`;
    if (art.layer === "back") back = el;
    else front = el;
  }
  return `<span class="luma-fig ${cls}">${back}<img class="luma-img" src="${src}" alt="${alt}" />${front}</span>`;
}

// Devolve o HTML da imagem da Luma na expressão pedida.
function lumaImg(mood) {
  const p = LUMA_POSES[mood] || LUMA_POSES.neutra;
  return lumaFigure(mood, p.src, p.alt);
}

// Troca a expressão da Luma (#lm). Com backAfter, volta à neutra depois desse tempo (ms).
// Com hop, ela dá um pequeno salto.
function setMood(mood, backAfter = 0, hop = false) {
  const box = $("#lm");
  if (!box) return;
  clearTimeout(setMood.timer);
  box.innerHTML = lumaImg(mood);
  if (hop) {
    box.classList.remove("hop");
    void box.offsetWidth; // reinicia a animação
    box.classList.add("hop");
  }
  if (backAfter) {
    setMood.timer = setTimeout(() => {
      if ($("#lm") === box) box.innerHTML = lumaImg("neutra");
    }, backAfter);
  }
}

// Chuva de estrelas (conclusão de fase e resumo final).
function starRain() {
  if (!S.anim) return;
  const icons = ["⭐", "✨", "🌟"];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement("span");
    s.className = "rain";
    s.textContent = icons[i % 3];
    s.setAttribute("aria-hidden", "true");
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 18 + Math.random() * 22 + "px";
    s.style.animationDuration = 2 + Math.random() * 2 + "s";
    s.style.animationDelay = Math.random() * 1.2 + "s";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 5000);
  }
}

const UI = {
  menu() {
    go(
      "menu",
      `<button class="gear" data-act="set" aria-label="Configurações">⚙️</button>
  <h1 class="mlogo"><img src="${IMG.logo}" alt="Aventura dos Números"></h1>
  <div class="mrow"><div class="mchars">${lumaFigure("acenando", IMG.luma, "Luma, a exploradora espacial, acenando", "mluma")}<img class="mpipo" src="${IMG.pipo}" alt="Pipo, o robô flutuante"></div>
  <nav class="mbtns" aria-label="Menu principal"><button class="mbtn play" data-act="levels"><span class="tri" aria-hidden="true"></span>Jogar</button>${S.played ? '<button class="mbtn cont" data-act="cont">▶ Continuar aventura</button>' : ""}<button class="mbtn how" data-act="how">📖 Como jogar</button><button class="mbtn ach" data-act="ach">🏆 Minhas conquistas</button></nav></div>
  <div class="mprog" role="status"><span>⭐ ${total()} de 12 estrelas</span><div class="bar" aria-hidden="true"><i style="width:${(total() / 12) * 100}%"></i></div></div>`,
    );
  },
  how() {
    go(
      "how",
      `<h2 class="logo" style="font-size:2.2rem">Como Jogar</h2><div class="panel" style="text-align:left;font-size:1.15rem;line-height:1.6"><p>1. Escolha um planeta no mapa.</p><p>2. Leia a conta e toque na resposta certa (ou use as teclas <b>1</b> a <b>4</b>).</p><p>3. Precisa de ajuda? Toque em <b>💡 Dica</b> (ou tecle <b>H</b>). A dica tira duas respostas erradas!</p><p>4. Acertos seguidos dão pontos extras 🔥. Cada fase tem 10 desafios.</p><p>5. Ganhe ⭐ estrelas, 🏅 medalhas, baús 🧰 e acessórios para a Luma. Tecle <b>P</b> para pausar.</p></div><button class="btn" data-act="menu">⬅ Voltar</button>`,
    );
  },
  levels() {
    go(
      "levels",
      `<h2 class="logo" style="font-size:2.2rem">Escolha seu planeta</h2><div class="grid">${LEVELS.map(
        (L, k) => {
          const lock = k >= S.unlocked;
          return `<button class="lv" style="background:linear-gradient(160deg,${L.c},${L.c}bb)" data-act="intro" data-arg="${k}" ${lock ? "disabled" : ""} aria-label="${L.n}, ${["adição", "subtração", "multiplicação", "divisão"][k]}, ${lock ? "bloqueado" : S.stars[k] + " estrelas"}"><span class="em">${lock ? "🔒" : L.em}</span><b>${k + 1}. ${L.n}</b><span class="op">${L.sym}</span><span>${lock ? "Complete a fase anterior" : star(S.stars[k])}</span></button>`;
        },
      ).join("")}</div><button class="btn" data-act="menu">⬅ Menu</button>`,
    );
  },
  intro(l) {
    const L = LEVELS[l];
    go(
      "intro",
      `<div class="chars"><div class="lm-box lm-big">${lumaImg("feliz")}</div><div class="bob2">${Art.alien(L.ac, L.al)}</div></div><div class="panel"><h2>${L.em} ${L.n}</h2><p style="font-size:1.25rem"><b>Missão:</b> ${L.story}</p><p>Responda 10 desafios. Acertando 5 você ganha ⭐, 7 ganha ⭐⭐ e 9 ganha ⭐⭐⭐!</p></div><div class="row"><button class="btn green big" data-act="start" data-arg="${l}">Começar!</button><button class="btn alt" data-act="levels">⬅ Mapa</button></div>`,
    );
  },
  question() {
    const L = LEVELS[G.l],
      q = G.qs[G.i];
    go(
      "challenge",
      `<header class="top"><button class="btn small" data-act="pause" aria-label="Pausar (tecla P)">⏸ Pausa</button><div class="pill" aria-label="Pontos">⭐ <b>${G.pts}</b></div><div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${G.i}" aria-label="Progresso da fase"><i style="width:${G.i * 10}%"></i></div><div class="pill" aria-label="Acertos seguidos">🔥 ${G.streak}</div></header>
  <section class="stage"><div class="chars"><div id="lm" class="lm-box">${lumaImg("neutra")}</div><div style="width:clamp(70px,14vw,120px)">${Art.alien(L.ac, L.al)}</div></div>
  <div class="panel"><p class="kicker">Desafio ${G.i + 1} de 10 · ${L.n}</p><h2 class="qtext" aria-label="${q.text.replace("?", "quanto?")}">${q.text}</h2><div class="opts">${q.opts.map((o, k) => `<button class="btn opt" data-act="ans" data-arg="${k}"><kbd>${k + 1}</kbd>${o}</button>`).join("")}</div><div class="row" style="margin-top:12px"><button id="hb" class="btn small alt" data-act="hint">💡 Dica (H)</button></div><div id="fb" class="fb" role="status" aria-live="polite"></div><button id="nx" class="btn green big hide" data-act="next">${G.i == 9 ? "Ver resultado 🏁" : "Continuar ➜"}</button></div></section>`,
      ".qtext",
    );
    if (G.i === 0) setMood("feliz", 1000, true); // ao iniciar a fase: pequeno salto
  },
  feedback(k, ok, gain) {
    const q = G.qs[G.i];
    document.querySelectorAll(".opt").forEach((b, j) => {
      b.disabled = true;
      if (q.opts[j] === q.ans) b.classList.add("ok");
      else if (j === k) b.classList.add("bad");
    });
    const fb = $("#fb");
    fb.className = "fb " + (ok ? "ok" : "bad");
    $("#hb").disabled = true;
    fb.innerHTML = ok
      ? `🎉 ${OKS[rnd(0, 3)]} +${gain} pontos${G.streak > 1 ? ` · 🔥 ${G.streak} seguidas!` : ""}<br>${q.expl}`
      : `💜 ${BADS[rnd(0, 3)]} A resposta é <b>${q.ans}</b>.<br>${q.expl}<br>💡 ${q.hint}`;
    if (ok)
      setMood("comemorando", 900, true); // comemora e volta ao normal
    else setMood("pensativa", 1500); // fica pensativa e logo volta ao normal
    if (ok) confetti();
    $(".pill b").textContent = G.pts;
    $(".pill:last-child").textContent = "🔥 " + G.streak;
    const nx = $("#nx");
    nx.classList.remove("hide");
    nx.focus();
  },
  pause() {
    if (!G || paused) return;
    paused = true;
    const d = document.createElement("div");
    d.className = "over";
    d.id = "ov";
    d.innerHTML = `<div class="panel" role="dialog" aria-modal="true" aria-labelledby="pt"><h2 id="pt">⏸ Jogo pausado</h2><button class="btn green" data-act="resume">▶ Continuar</button><button class="btn alt" data-act="restart">🔄 Reiniciar fase</button><button class="btn" data-act="levels">🗺 Sair para o mapa</button></div>`;
    document.body.appendChild(d);
    d.querySelector("#pt").tabIndex = -1;
    d.querySelector("button").focus();
  },
  resume() {
    paused = false;
    $("#ov")?.remove();
    ($("#nx:not(.hide)") || $(".opt:not(:disabled)") || $(".qtext"))?.focus();
  },
  complete() {
    if (G.st > 0) starRain();
    if (G.newAcc) {
      // encontrou um tesouro: surpresa, depois comemora
      setTimeout(() => {
        if (app.querySelector(".done")) setMood("comemorando");
      }, 1300);
    }
    const L = LEVELS[G.l],
      all = S.stars.every((x) => x > 0);
    go(
      "done",
      `<h2 class="logo" style="font-size:2.2rem">${G.st > 0 ? "Fase concluída!" : "Quase lá, explorador!"}</h2><div class="stars" aria-label="${G.st} de 3 estrelas">${star(G.st)}</div><div id="lm" class="lm-box lm-big">${lumaImg(G.st > 0 ? (G.newAcc ? "surpresa" : "comemorando") : "encorajadora")}</div>
  <div class="panel"><p style="font-size:1.3rem"><b>${G.corr}</b> de 10 acertos · <b>${G.pts}</b> pontos · melhor sequência 🔥 ${G.max}</p>
  ${G.st > 0 ? `<div class="chest" aria-hidden="true">🧰</div><p style="font-size:1.2rem">${G.newAcc ? `Você ganhou o acessório <b>${G.newAcc.e} ${G.newAcc.n}</b> para a Luma. Ela já está usando!` : "Você já tem o acessório desta fase. Continue explorando!"}</p>` : `<p style="font-size:1.2rem">Com 5 acertos você ganha a primeira estrela e o baú. Que tal tentar de novo? Você consegue! 💪</p>`}
  ${G.newM.map((m) => `<p>🏅 Nova medalha: <b>${m.e} ${m.n}</b></p>`).join("")}</div>
  <div class="row">${G.st > 0 && G.l < 3 ? `<button class="btn green big" data-act="intro" data-arg="${G.l + 1}">Próximo planeta ➜</button>` : ""}${all && G.st > 0 ? `<button class="btn green big" data-act="final">🏆 Resumo final</button>` : ""}<button class="btn alt" data-act="start" data-arg="${G.l}">🔄 Jogar de novo</button><button class="btn" data-act="levels">🗺 Mapa</button></div>`,
    );
  },
  ach() {
    const earned = medalsNow();
    go(
      "ach",
      `<h2 class="logo" style="font-size:2.2rem">Minhas Conquistas</h2><div class="panel"><p style="font-size:1.2rem">⭐ ${total()}/12 estrelas · ${S.points} pontos · ${S.correct} acertos</p>
  <h3>Medalhas e troféu</h3><div class="badges">${MEDALS.map((m) => `<div class="bd ${earned.includes(m.id) ? "" : "lock"}"><span class="e">${m.e}</span>${m.n}</div>`).join("")}</div>
  <h3>Acessórios da Luma <small>(toque para vestir)</small></h3><div class="badges">${ACC.map(
    (a) => {
      const own = S.acc.includes(a.id);
      return `<button class="bd ${own ? "" : "lock"} ${S.equipped === a.id ? "eq" : ""}" data-act="equip" data-arg="${a.id}" ${own ? "" : "disabled"} aria-pressed="${S.equipped === a.id}"><span class="e">${a.e}</span>${a.n}</button>`;
    },
  ).join("")}</div>
  <div class="lm-box lm-big" style="margin:12px auto 0">${lumaImg("feliz")}</div></div><button class="btn" data-act="menu">⬅ Voltar</button>`,
    );
  },
  set() {
    go(
      "set",
      `<h2 class="logo" style="font-size:2.2rem">Configurações</h2><div class="panel" style="display:grid;gap:18px"><label class="t"><input type="checkbox" data-act="tsound" ${S.sound ? "checked" : ""}> Sons do jogo</label><label class="t"><input type="checkbox" data-act="tanim" ${S.anim ? "checked" : ""}> Animações</label><button class="btn alt" data-act="reset">🗑 Apagar progresso</button></div><button class="btn" data-act="menu">⬅ Voltar</button>`,
    );
  },
  final() {
    starRain();
    go(
      "final",
      `<h2 class="logo" style="font-size:2.4rem">Missão cumprida!</h2><div class="chars"><div class="lm-box lm-big">${lumaImg("comemorando")}</div><div class="bob2" style="width:100px">${Art.pipo()}</div></div><div class="panel"><div class="chest" aria-hidden="true">🏆</div><p style="font-size:1.3rem">Luma e Pipo visitaram os 4 planetas!</p><p style="font-size:1.2rem">⭐ ${total()}/12 estrelas · ${S.points} pontos · ${S.correct} acertos · 🔥 melhor sequência ${S.bestStreak}</p><p>${S.stars.every((x) => x == 3) ? "Você ganhou o Troféu Galáctico com 3 estrelas em tudo! 🏅" : "Repita as fases para conquistar 3 estrelas em todos os planetas e ganhar o Troféu Galáctico!"}</p></div><div class="row"><button class="btn" data-act="levels">🗺 Mapa</button><button class="btn alt" data-act="menu">Menu</button></div>`,
    );
  },
};

/* ============================================================
   8. EVENTOS
   Cliques e teclado
   ============================================================ */

const first = () => {
  const k = [0, 1, 2, 3].find((i) => i < S.unlocked && S.stars[i] < 3);
  return k;
};
const A = {
  menu: () => UI.menu(),
  levels: () => {
    paused = false;
    $("#ov")?.remove();
    UI.levels();
  },
  how: () => UI.how(),
  ach: () => UI.ach(),
  set: () => UI.set(),
  final: () => {
    Snd.win();
    UI.final();
  },
  cont() {
    const k = first();
    k === undefined ? UI.levels() : UI.intro(k);
  },
  intro: (l) => UI.intro(+l),
  start: (l) => {
    $("#ov")?.remove();
    Game.start(+l);
  },
  ans: (k) => Game.answer(+k),
  hint: () => Game.hint(),
  next: () => Game.next(),
  pause: () => UI.pause(),
  resume: () => UI.resume(),
  restart: () => {
    $("#ov")?.remove();
    Game.start(G.l);
  },
  equip(id) {
    S.equipped = S.equipped === id ? null : id;
    Store.save();
    UI.ach();
  },
  tsound() {
    S.sound = !S.sound;
    Store.save();
  },
  tanim() {
    S.anim = !S.anim;
    document.body.classList.toggle("noanim", !S.anim);
    Store.save();
  },
  reset() {
    if (confirm("Apagar todo o progresso?")) {
      Store.reset();
      UI.menu();
    }
  },
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b || b.disabled || b.tagName === "INPUT" || b.dataset.busy) return;
  const run = () => A[b.dataset.act](b.dataset.arg);
  if (b.classList.contains("mbtn") && S.anim) {
    b.dataset.busy = 1;
    b.classList.add("press");
    setTimeout(run, 170);
  } else run();
});
document.addEventListener("change", (e) => {
  const b = e.target.closest("input[data-act]");
  if (b) A[b.dataset.act]();
});
document.addEventListener("keydown", (e) => {
  if (!app.querySelector(".challenge")) return;
  const k = e.key.toLowerCase();
  if (k === "p" || k === "escape") {
    paused ? UI.resume() : UI.pause();
    return;
  }
  if (paused) return;
  if (["1", "2", "3", "4"].includes(k)) {
    const b = $(`.opt[data-arg="${+k - 1}"]`);
    if (b && !b.disabled) Game.answer(+k - 1);
  } else if (k === "h") Game.hint();
});

/* ============================================================
   9. INÍCIO
   Cria os planetas decorativos e abre o menu
   ============================================================ */

// Pré-carrega as poses para a troca de expressão ser instantânea
Object.values(LUMA_POSES).forEach((p) => {
  new Image().src = p.src;
});

PLANETS.forEach((u, i) => {
  const p = document.createElement("img");
  p.src = u;
  p.alt = "";
  p.setAttribute("aria-hidden", "true");
  p.className = "planet p" + (i + 1);
  document.body.insertBefore(p, app);
});
UI.menu();
