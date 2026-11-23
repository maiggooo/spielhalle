// Spielhallen-Effekte für alle Seiten: Neon, Lauflicht, Vibration, Konfetti/Münzen, Kippkarten, Gold-Schimmer, Ziffern-Walzen.
// Einbinden mit <script src="fx.js" defer></script>. Bei „Bewegung reduzieren“ bleiben nur ruhige Varianten.
(() => {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = `
  .fx-neon { color:#FFF6D6 !important; text-shadow:0 0 4px #fff, 0 0 12px #FFD86B, 0 0 26px #E8B83A, 0 0 48px #FF9D00; }
  .fx-neon em { color:#FFE1F0 !important; text-shadow:0 0 4px #fff, 0 0 12px #FF4FA3, 0 0 28px #FF2D87; }
  .fx-flicker { animation:fx-flicker 5s infinite; }
  @keyframes fx-flicker { 0%,17%,21%,24%,61%,64%,100% { opacity:1; } 19%,23%,62% { opacity:.3; text-shadow:none; } }

  .fx-bulbs { position:absolute; inset:5px; pointer-events:none; z-index:1; }
  .fx-bulbs i { position:absolute; width:9px; height:9px; border-radius:50%; transform:translate(-50%,-50%);
    background:#6B4A10; animation:fx-chase 1.1s infinite steps(1); }
  .fx-bulbs i:nth-child(even) { animation-delay:-.55s; }
  @keyframes fx-chase { 0%,49% { background:#FFF2B8; box-shadow:0 0 5px #fff, 0 0 12px #FFD86B; } 50%,100% { background:#6B4A10; box-shadow:none; } }

  .fx-shine { background:linear-gradient(110deg, #C08A17 20%, #FFE9A3 40%, #fff 50%, #FFE9A3 60%, #C08A17 80%) 0 0 / 250% 100%;
    -webkit-background-clip:text; background-clip:text; color:transparent !important; -webkit-text-fill-color:transparent;
    animation:fx-sweep 2.8s linear infinite; }
  @keyframes fx-sweep { to { background-position:-250% 0; } }

  .fx-tilt { transition:transform .2s ease-out; will-change:transform; position:relative; }
  .fx-glare { position:absolute; inset:0; border-radius:16px; pointer-events:none; z-index:5; opacity:0; transition:opacity .2s;
    mix-blend-mode:overlay; background:radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.7), transparent 55%); }
  .fx-tilt:hover .fx-glare, .fx-tilt.fx-touch .fx-glare { opacity:1; }

  .fx-d { display:inline-block; height:1.15em; line-height:1.15em; overflow:hidden; vertical-align:bottom; }
  .fx-d > span { display:block; transition:transform .9s cubic-bezier(.2,.9,.25,1.08); }
  .fx-d > span > span { display:block; height:1.15em; }

  .fx-deal { animation:fx-deal .6s cubic-bezier(.34,1.56,.64,1) backwards; }
  @keyframes fx-deal { from { opacity:0; transform:translate(var(--dx,0), 60px) rotate(var(--dr,0deg)) scale(.7); } }

  .btn:active { transform:translateY(3px) scale(.98); }

  #fx-canvas { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:9999; }
  @media (prefers-reduced-motion: reduce) { .fx-flicker, .fx-bulbs i, .fx-shine, .fx-deal { animation:none !important; } }`;
  document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

  // 1 Neon: Spielname im Kopf jeder Spielseite leuchtet, der hervorgehobene Teil flackert.
  document.querySelectorAll(".mast .brand").forEach(b => { b.classList.add("fx-neon"); b.querySelector("em")?.classList.add("fx-flicker"); });

  // 2 Lauflicht: Glühbirnen rund um ein Element (braucht position:relative o. ä.).
  function bulbs(el, gap = 22) {
    let box = el.querySelector(":scope > .fx-bulbs");
    if (!box) { box = document.createElement("div"); box.className = "fx-bulbs"; box.setAttribute("aria-hidden", "true"); el.appendChild(box); }
    const w = box.clientWidth, h = box.clientHeight, per = 2 * (w + h), n = Math.max(4, Math.floor(per / gap / 2) * 2);
    box.innerHTML = "";
    for (let i = 0; i < n; i++) {
      let d = i * per / n, x, y;
      if (d < w) { x = d; y = 0; } else if ((d -= w) < h) { x = w; y = d; } else if ((d -= h) < w) { x = w - d; y = h; } else { x = 0; y = h - (d - w); }
      const b = document.createElement("i"); b.style.left = x + "px"; b.style.top = y + "px"; box.appendChild(b);
    }
  }
  const bulbEls = () => document.querySelectorAll("[data-fx-bulbs]");
  addEventListener("load", () => bulbEls().forEach(el => bulbs(el)));
  addEventListener("resize", () => bulbEls().forEach(el => bulbs(el)));

  // 3 Tasten: kurzes Vibrieren auf Android (iPhones können das im Browser nicht).
  addEventListener("pointerdown", e => { if (e.target.closest("button, .btn, [role=button], a.cell, a.card")) navigator.vibrate?.(10); }, { passive: true });

  // 4 Konfetti und Münzregen
  let cv, cx, parts = [], running = false;
  function burst(kind = "confetti", amount = 1) {
    if (calm) return;
    if (!cv) { cv = document.createElement("canvas"); cv.id = "fx-canvas"; document.body.appendChild(cv); cx = cv.getContext("2d"); }
    cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
    const colors = kind === "boom" ? ["#FF4A1C", "#FFB347", "#FFD86B", "#C8371D", "#fff"] : ["#FFD86B", "#E8B83A", "#C4283A", "#fff", "#2FBF71"];
    const coins = kind === "coins", n = Math.round((coins ? 60 : 150) * amount);
    for (let i = 0; i < n; i++) parts.push({
      coins, x: coins ? Math.random() * innerWidth : innerWidth / 2, y: coins ? -20 - Math.random() * 400 : innerHeight * .55,
      vx: coins ? 0 : (Math.random() - .5) * 16, vy: coins ? 2 + Math.random() * 3 : -9 - Math.random() * 11,
      r: Math.random() * 6.3, vr: (Math.random() - .5) * .3, c: colors[i % colors.length], s: coins ? 13 : 8
    });
    navigator.vibrate?.([20, 40, 20]);
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.y < innerHeight + 40);
    for (const p of parts) {
      p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
      if (p.coins) {
        cx.scale(Math.abs(Math.cos(p.r * 2)) + .05, 1);
        cx.beginPath(); cx.arc(0, 0, p.s, 0, 6.3); cx.fillStyle = "#E8B83A"; cx.fill();
        cx.lineWidth = 3; cx.strokeStyle = "#9A6B10"; cx.stroke();
        cx.fillStyle = "#FFE9A3"; cx.font = "bold 14px Outfit, sans-serif"; cx.textAlign = "center"; cx.fillText("S", 0, 5);
      } else { cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
      cx.restore();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  // 5 Kippkarte: kippt mit Maus oder Finger, ein Lichtreflex wandert mit.
  function tilt(el) {
    if (calm || el.classList.contains("fx-tilt")) return;
    el.classList.add("fx-tilt");
    const g = document.createElement("div"); g.className = "fx-glare"; el.appendChild(g);
    const move = e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateY(${(px - .5) * 22}deg) rotateX(${(.5 - py) * 22}deg)`;
      el.style.setProperty("--gx", px * 100 + "%"); el.style.setProperty("--gy", py * 100 + "%");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") el.classList.add("fx-touch"); move(e); });
    const reset = () => { el.style.transform = ""; el.classList.remove("fx-touch"); };
    el.addEventListener("pointerleave", reset); el.addEventListener("pointerup", reset); el.addEventListener("pointercancel", reset);
  }
  document.querySelectorAll("[data-fx-tilt]").forEach(tilt);

  // 7 Ziffern-Walzen: Ziffern rollen vom alten zum neuen Wert, andere Zeichen bleiben stehen.
  function roll(el, text) {
    text = String(text);
    if (calm) { el.textContent = text; return; }
    const old = el.dataset.fxText ?? el.textContent; el.dataset.fxText = text;
    if (old === text) return;
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text].map((ch, i) => {
      if (!/\d/.test(ch)) return `<span aria-hidden="true">${ch}</span>`;
      const from = /\d/.test(old[old.length - text.length + i] ?? "") ? +old[old.length - text.length + i] : 0;
      return `<span class="fx-d" aria-hidden="true"><span style="transform:translateY(-${from * 10}%)" data-to="${ch}">${
        [...Array(10).keys()].map(k => `<span>${k}</span>`).join("")}</span></span>`;
    }).join("");
    el.offsetHeight;
    el.querySelectorAll("[data-to]").forEach((s, i) => { s.style.transitionDelay = i * 60 + "ms"; s.style.transform = `translateY(-${s.dataset.to * 10}%)`; });
  }

  // 8 Austeilen: Karten fliegen gefächert nacheinander herein.
  function deal(els) {
    if (calm) return;
    els.forEach((el, i) => {
      el.style.setProperty("--dr", (i % 2 ? 1 : -1) * (8 + i * 3) + "deg");
      el.style.setProperty("--dx", (i % 2 ? 40 : -40) + "px");
      el.style.animationDelay = 120 + i * 90 + "ms";
      el.classList.add("fx-deal");
    });
  }

  window.fx = { burst, tilt, bulbs, roll, deal };
})();
