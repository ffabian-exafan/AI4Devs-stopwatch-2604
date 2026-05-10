/* =========================================================
   Timer & Countdown — vanilla JS
   - All DOM is built programmatically from this file.
   - Three views: selector, stopwatch, countdown.
   - Timer logic uses requestAnimationFrame + performance.now()
     so there is no setInterval drift.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Mount point ---------- */
  // The page already contains an <h1>. We append a fresh root <div> to body
  // and render every view inside it. The <h1> is hidden via CSS.
  const root = document.createElement("div");
  root.className = "app__root";
  document.body.appendChild(root);

  /* =========================================================
     Time formatting helpers
     ========================================================= */

  /**
   * Convert a millisecond amount into the fields the display needs.
   * Negative values are clamped to 0.
   */
  function splitTime(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor(ms % 1000);
    return { hours, minutes, seconds, millis };
  }

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function pad3(n) { return n < 10 ? "00" + n : n < 100 ? "0" + n : "" + n; }

  // Hours field grows beyond 2 digits when needed (e.g. "100:40:39"),
  // matching the reference where 7-digit input shifts the hours position.
  function padHours(n) { return n < 10 ? "0" + n : "" + n; }

  function formatHMS({ hours, minutes, seconds }) {
    return padHours(hours) + ":" + pad2(minutes) + ":" + pad2(seconds);
  }

  /* =========================================================
     Timer module — independent of rendering.
     Drives both the stopwatch (counting up) and the countdown
     (counting down). Caller supplies `onTick` and `onFinish`.
     ========================================================= */

  function createTimer({ direction, durationMs = 0, onTick, onFinish }) {
    // direction: "up" for stopwatch, "down" for countdown.
    let running = false;
    let startTs = 0;            // performance.now() at last start
    let accumulated = 0;        // ms elapsed before the last start
    let rafId = 0;

    function currentMs() {
      const elapsed = accumulated + (running ? performance.now() - startTs : 0);
      if (direction === "up") return elapsed;
      // Countdown: remaining time.
      return Math.max(0, durationMs - elapsed);
    }

    function loop() {
      if (!running) return;
      const value = currentMs();
      if (typeof onTick === "function") onTick(value);
      if (direction === "down" && value <= 0) {
        running = false;
        if (typeof onFinish === "function") onFinish();
        return;
      }
      rafId = requestAnimationFrame(loop);
    }

    return {
      start() {
        if (running) return;
        running = true;
        startTs = performance.now();
        rafId = requestAnimationFrame(loop);
      },
      stop() {
        if (!running) return;
        accumulated += performance.now() - startTs;
        running = false;
        cancelAnimationFrame(rafId);
      },
      reset(newDurationMs) {
        running = false;
        cancelAnimationFrame(rafId);
        accumulated = 0;
        if (typeof newDurationMs === "number") durationMs = newDurationMs;
        if (typeof onTick === "function") onTick(currentMs());
      },
      isRunning() { return running; },
      get value() { return currentMs(); }
    };
  }

  /* =========================================================
     Small DOM helpers (no innerHTML with user data anywhere)
     ========================================================= */

  function el(tag, className, textContent) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent !== undefined) node.textContent = textContent;
    return node;
  }

  function clearRoot() { while (root.firstChild) root.removeChild(root.firstChild); }

  /* SVG arrows for the selector — built with createElementNS
     so we don't rely on innerHTML. */
  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    const n = document.createElementNS(SVG_NS, tag);
    if (attrs) Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
    return n;
  }

  /**
   * Build a chunky cartoon arrow (up or down) with a vertical light->dark
   * gradient like in the reference. `up=true` for green up, false for red down.
   */
  function buildArrowSVG(up, color, gradientId) {
    const svg = svgEl("svg", {
      class: "selector__arrow",
      viewBox: "0 0 200 240",
      xmlns: SVG_NS
    });

    const defs = svgEl("defs");
    const grad = svgEl("linearGradient", {
      id: gradientId, x1: "0", y1: "0", x2: "1", y2: "0"
    });
    // Left side: a lighter pastel; right side: the strong color.
    // This mirrors the highlight visible in the reference arrows.
    const lighter = mix(color, "#ffffff", 0.55);
    const stop1 = svgEl("stop", { offset: "0%",   "stop-color": lighter });
    const stop2 = svgEl("stop", { offset: "55%",  "stop-color": color });
    const stop3 = svgEl("stop", { offset: "100%", "stop-color": lighter });
    grad.appendChild(stop1); grad.appendChild(stop2); grad.appendChild(stop3);
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Path: a chunky arrow with rounded corners.
    // Up arrow path (head at top, shaft to bottom).
    const upPath =
      "M100 12 " +                        // top tip
      "C108 12 116 18 124 28 " +
      "L176 92 " +
      "C184 102 178 116 166 116 " +
      "L138 116 " +
      "L138 212 " +
      "C138 222 130 230 120 230 " +
      "L80 230 " +
      "C70 230 62 222 62 212 " +
      "L62 116 " +
      "L34 116 " +
      "C22 116 16 102 24 92 " +
      "L76 28 " +
      "C84 18 92 12 100 12 Z";

    // Down arrow path (head at bottom, shaft to top).
    const downPath =
      "M100 228 " +
      "C92 228 84 222 76 212 " +
      "L24 148 " +
      "C16 138 22 124 34 124 " +
      "L62 124 " +
      "L62 28 " +
      "C62 18 70 10 80 10 " +
      "L120 10 " +
      "C130 10 138 18 138 28 " +
      "L138 124 " +
      "L166 124 " +
      "C178 124 184 138 176 148 " +
      "L124 212 " +
      "C116 222 108 228 100 228 Z";

    const path = svgEl("path", {
      d: up ? upPath : downPath,
      fill: "url(#" + gradientId + ")",
      stroke: "#2a2a2a",
      "stroke-width": "6",
      "stroke-linejoin": "round"
    });
    svg.appendChild(path);
    return svg;
  }

  /** Mix two #rrggbb colors. t=0 returns a, t=1 returns b. */
  function mix(a, b, t) {
    const pa = parseHex(a), pb = parseHex(b);
    const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
    const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
    const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
    return "#" + toHex(r) + toHex(g) + toHex(bl);
  }
  function parseHex(h) {
    return [parseInt(h.slice(1, 3), 16),
            parseInt(h.slice(3, 5), 16),
            parseInt(h.slice(5, 7), 16)];
  }
  function toHex(n) { const s = n.toString(16); return s.length === 1 ? "0" + s : s; }

  /* =========================================================
     Shared bottom navy bar with "Back" button
     ========================================================= */

  function buildNavbar(onBack) {
    const bar = el("div", "app__navbar");
    const back = document.createElement("button");
    back.className = "app__back";
    back.type = "button";
    back.setAttribute("aria-label", "Back to selector");
    const arrow = el("span", "app__back-arrow");
    arrow.setAttribute("aria-hidden", "true");
    const label = el("span", "app__back-label", "Back");
    back.appendChild(arrow);
    back.appendChild(label);
    back.addEventListener("click", onBack);
    bar.appendChild(back);
    return bar;
  }

  /* =========================================================
     Display widget — used by both stopwatch and countdown.
     Returns a DOM node and a setter that updates digits.
     ========================================================= */

  function buildDisplay() {
    const wrap = el("div", "display");
    const main = el("div", "display__main", "00:00:00");
    const ms = el("div", "display__ms", "000");
    wrap.appendChild(main);
    wrap.appendChild(ms);
    return {
      node: wrap,
      set(ms_value) {
        const parts = splitTime(ms_value);
        main.textContent = formatHMS(parts);
        ms.textContent = pad3(parts.millis);
      },
      // Direct text setter — used during countdown input where the digits
      // are shown literally (e.g. "99:99:99") rather than normalized.
      setText(mainText, msText) {
        main.textContent = mainText;
        ms.textContent = msText;
      },
      flashRed() {
        // 3 visual blinks via a CSS animation (alternating colors 6 steps).
        wrap.classList.remove("display--blink");
        // Force reflow so the animation can be retriggered reliably.
        void wrap.offsetWidth;
        wrap.classList.add("display--blink");
        const onEnd = () => {
          wrap.classList.remove("display--blink");
          wrap.removeEventListener("animationend", onEnd);
        };
        wrap.addEventListener("animationend", onEnd);
      }
    };
  }

  /* =========================================================
     View 1 — Selector
     ========================================================= */

  function renderSelector() {
    clearRoot();

    const app = el("div", "app");

    // Slim navy strip on top (visible in the reference).
    const topBar = el("div", "app__navbar app__navbar--top");
    app.appendChild(topBar);

    const content = el("div", "app__content");
    const selector = el("div", "selector");

    // Left panel — Stopwatch
    const left = el("div", "selector__panel selector__panel--stopwatch");
    left.setAttribute("role", "button");
    left.setAttribute("tabindex", "0");
    left.appendChild(el("div", "selector__title", "Stopwatch"));
    left.appendChild(buildArrowSVG(true, "#00c800", "grad-up"));
    left.addEventListener("click", renderStopwatch);
    left.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); renderStopwatch(); }
    });

    // Right panel — Countdown
    const right = el("div", "selector__panel selector__panel--countdown");
    right.setAttribute("role", "button");
    right.setAttribute("tabindex", "0");
    right.appendChild(el("div", "selector__title", "Countdown"));
    right.appendChild(buildArrowSVG(false, "#e81c1c", "grad-down"));
    right.addEventListener("click", renderCountdownInput);
    right.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); renderCountdownInput(); }
    });

    selector.appendChild(left);
    selector.appendChild(right);
    content.appendChild(selector);
    app.appendChild(content);

    // Bottom navy bar (no Back here — there's no previous view).
    app.appendChild(el("div", "app__navbar"));

    root.appendChild(app);
  }

  /* =========================================================
     View 2 — Stopwatch
     ========================================================= */

  function renderStopwatch() {
    clearRoot();

    const app = el("div", "app");
    const content = el("div", "app__content");
    const wrap = el("div", "timer");

    const display = buildDisplay();
    wrap.appendChild(display.node);

    // Controls row
    const controls = el("div", "stopwatch__controls");
    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "btn btn--primary";
    startBtn.textContent = "Start";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "btn btn--danger";
    clearBtn.textContent = "Clear";

    controls.appendChild(startBtn);
    controls.appendChild(clearBtn);
    wrap.appendChild(controls);

    content.appendChild(wrap);
    app.appendChild(content);

    // Timer
    const timer = createTimer({
      direction: "up",
      onTick: v => display.set(v)
    });

    function syncStartLabel() {
      startBtn.textContent = timer.isRunning() ? "Stop" : "Start";
    }

    startBtn.addEventListener("click", () => {
      if (timer.isRunning()) timer.stop();
      else timer.start();
      syncStartLabel();
    });

    clearBtn.addEventListener("click", () => {
      timer.reset();
      display.set(0);
      syncStartLabel();
    });

    // Bottom bar with Back
    app.appendChild(buildNavbar(() => {
      timer.reset();
      renderSelector();
    }));

    root.appendChild(app);
    display.set(0);
  }

  /* =========================================================
     View 3a — Countdown input (keypad)
     Lets the user type up to 8 digits. Pressing Set transitions
     to the running view (3b). Digits are stored as-is — the
     reference allows e.g. "99:99:99" or "100:40:39".
     ========================================================= */

  // Keep the entered digits across input ↔ running transitions so that
  // pressing Stop and Back-to-keypad would, conceptually, retain context.
  // (Currently only used to seed the input view if needed.)
  const COUNTDOWN_MAX_DIGITS = 8;

  /**
   * Convert a digit buffer into a millisecond duration.
   * The buffer is read right-to-left as SS, MM, HH...
   * Allows hours, minutes, seconds to take any non-negative value.
   */
  function countdownBufferToMs(buffer) {
    if (!buffer) return 0;
    const s = parseInt(buffer.slice(-2) || "0", 10);
    const m = parseInt(buffer.slice(-4, -2) || "0", 10);
    const h = parseInt(buffer.slice(0, -4) || "0", 10);
    return ((h * 3600) + (m * 60) + s) * 1000;
  }

  /**
   * Render the buffer on the display as raw, unnormalized digits.
   * The reference image shows that typing 9·9·9·9·9·9 yields the literal
   * "99:99:99" — values are NOT collapsed to canonical HH:MM:SS until
   * the user presses Set. We bypass display.set() (which formats from ms)
   * and write the digit string directly into the digits node.
   */
  function drawCountdownBuffer(display, buffer) {
    if (!buffer) { display.set(0); return; }
    // Right-pad would be wrong; we want the digits to grow right-to-left,
    // so left-pad to at least 6 chars and split as HH+...:MM:SS.
    const padded = buffer.length < 6 ? buffer.padStart(6, "0") : buffer;
    const ss = padded.slice(-2);
    const mm = padded.slice(-4, -2);
    const hh = padded.slice(0, -4);            // 2+ chars
    display.setText(hh + ":" + mm + ":" + ss, "000");
  }

  function renderCountdownInput() {
    clearRoot();

    const app = el("div", "app");
    const content = el("div", "app__content");
    const wrap = el("div", "timer");

    const display = buildDisplay();
    wrap.appendChild(display.node);

    // Keypad layout matches the reference exactly:
    //   Top:    5 6 7 8 9 Set
    //   Bottom: 0 1 2 3 4 Clear
    const pad = el("div", "countdown__pad");
    const layout = [
      ["5", "6", "7", "8", "9", "Set"],
      ["0", "1", "2", "3", "4", "Clear"]
    ];

    let buffer = "";

    function pressDigit(d) {
      if (buffer.length >= COUNTDOWN_MAX_DIGITS) return;
      // Suppress purely-leading zeros to avoid "0000005" kind of input.
      if (buffer === "" && d === "0") { drawCountdownBuffer(display, buffer); return; }
      buffer += d;
      drawCountdownBuffer(display, buffer);
    }

    function pressClear() {
      buffer = "";
      display.set(0);
    }

    function pressSet() {
      const ms = countdownBufferToMs(buffer);
      if (ms <= 0) return;                 // do nothing on empty / zero input
      renderCountdownRunning(ms);
    }

    layout.forEach(row => {
      row.forEach(label => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "key";
        btn.textContent = label;
        if (label === "Clear") btn.classList.add("key--clear");
        if (label === "Set")   btn.classList.add("key--set");

        btn.addEventListener("click", () => {
          if (label === "Clear") pressClear();
          else if (label === "Set") pressSet();
          else pressDigit(label);
        });

        pad.appendChild(btn);
      });
    });

    wrap.appendChild(pad);
    content.appendChild(wrap);
    app.appendChild(content);

    app.appendChild(buildNavbar(renderSelector));

    root.appendChild(app);
    display.set(0);
  }

  /* =========================================================
     View 3b — Countdown running
     Same layout as the stopwatch: display + Start/Clear + Back.
     The countdown is loaded with the duration set by the user
     and waits for Start (so it can be reviewed first, matching
     the reference where the running view shows "Start").
     ========================================================= */

  function renderCountdownRunning(durationMs) {
    clearRoot();

    const app = el("div", "app");
    const content = el("div", "app__content");
    const wrap = el("div", "timer");

    const display = buildDisplay();
    wrap.appendChild(display.node);

    const controls = el("div", "stopwatch__controls");
    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "btn btn--primary";
    startBtn.textContent = "Start";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "btn btn--danger";
    clearBtn.textContent = "Clear";

    controls.appendChild(startBtn);
    controls.appendChild(clearBtn);
    wrap.appendChild(controls);

    content.appendChild(wrap);
    app.appendChild(content);

    const timer = createTimer({
      direction: "down",
      durationMs: durationMs,
      onTick: v => display.set(v),
      onFinish: () => {
        display.set(0);
        display.flashRed();
        startBtn.textContent = "Start";  // reset label after finish
      }
    });

    function syncStartLabel() {
      startBtn.textContent = timer.isRunning() ? "Stop" : "Start";
    }

    startBtn.addEventListener("click", () => {
      // If we're already at zero, Start does nothing.
      if (timer.value <= 0) return;
      if (timer.isRunning()) timer.stop();
      else timer.start();
      syncStartLabel();
    });

    // Clear: stop the countdown and go back to the keypad.
    clearBtn.addEventListener("click", () => {
      timer.reset(0);
      renderCountdownInput();
    });

    app.appendChild(buildNavbar(() => {
      timer.reset(0);
      renderSelector();
    }));

    root.appendChild(app);
    // Show the duration immediately, ready to be started.
    display.set(durationMs);
  }

  /* =========================================================
     Boot
     ========================================================= */
  renderSelector();
})();
