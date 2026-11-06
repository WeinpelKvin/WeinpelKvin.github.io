// Interactive liquid gradient for the home hero.
// Plain WebGL, no libraries. Moving the pointer pushes the colors around.
// Change COLORS to restyle it. Falls back to the CSS gradient on the canvas
// if WebGL is unavailable, and draws a single still frame for reduced motion.

const COLORS = ["#ff3d5a", "#d01fae", "#3d8bff", "#2a5cff"];
const SPEED = 0.08;          // idle animation speed
const POINTER_STRENGTH = 1.6; // how strongly the pointer bends the flow

const canvas = document.querySelector("[data-gradient]");
const gl = canvas && canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });

if (gl) init();

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function init() {
  const vert = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const frag = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime;
    uniform vec2 uPointer;   // pointer position, aspect-corrected space
    uniform vec2 uPush;      // smoothed pointer velocity
    uniform vec3 uC1, uC2, uC3, uC4;

    void main() {
      float m = min(uRes.x, uRes.y);
      vec2 p = (gl_FragCoord.xy * 2.0 - uRes) / m;

      // Pointer bends the field locally
      vec2 d = p - uPointer;
      p -= uPush * exp(-dot(d, d) * 2.5);

      float t = uTime;
      vec2 q = p * 1.3;
      for (float i = 1.0; i < 7.0; i++) {
        q.x += 0.55 / i * sin(i * q.y + t + i * 1.7);
        q.y += 0.55 / i * cos(i * q.x - t * 1.3 + i * 0.9);
      }

      float a = 0.5 + 0.5 * sin(q.x);
      float b = 0.5 + 0.5 * sin(q.y);
      float c = 0.5 + 0.5 * sin(q.x + q.y);

      vec3 col = mix(uC1, uC2, a);
      col = mix(col, uC3, b);
      col = mix(col, uC4, c * 0.5);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const prog = gl.createProgram();
  try {
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  } catch (e) {
    console.warn("Gradient shader failed; using CSS fallback.", e);
    return;
  }
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name) => gl.getUniformLocation(prog, name);
  const uRes = u("uRes"), uTime = u("uTime"), uPointer = u("uPointer"), uPush = u("uPush");
  ["uC1", "uC2", "uC3", "uC4"].forEach((n, i) => gl.uniform3fv(u(n), hexToRgb(COLORS[i])));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: 0, y: 0 };
  const push = { x: 0, y: 0 };
  let last = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }

  function toField(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    const m = Math.min(r.width, r.height);
    return {
      x: ((clientX - r.left) * 2 - r.width) / m,
      y: (r.height - (clientY - r.top) * 2) / m,
    };
  }

  window.addEventListener("pointermove", (e) => {
    const f = toField(e.clientX, e.clientY);
    if (last) {
      push.x += (f.x - last.x) * POINTER_STRENGTH;
      push.y += (f.y - last.y) * POINTER_STRENGTH;
    }
    pointer.x = f.x;
    pointer.y = f.y;
    last = f;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reduceMotion.matches) requestAnimationFrame(frame);
  }).observe(canvas);

  const start = performance.now();
  function draw(now) {
    resize();
    push.x *= 0.94;
    push.y *= 0.94;
    gl.uniform1f(uTime, ((now - start) / 1000) * SPEED + 3.0);
    gl.uniform2f(uPointer, pointer.x, pointer.y);
    gl.uniform2f(uPush, push.x, push.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    if (!visible || reduceMotion.matches) return;
    draw(now);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => reduceMotion.matches && draw(performance.now()));
  reduceMotion.addEventListener("change", () => requestAnimationFrame(reduceMotion.matches ? draw : frame));

  // Paint once immediately, then animate
  draw(performance.now());
  canvas.style.background = "none";
  if (!reduceMotion.matches) requestAnimationFrame(frame);
}
