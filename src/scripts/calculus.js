// Each experiment computes its plot and readings from the same input state.
const byId = (id) => document.getElementById(`calc-${id}`);
const value = (id) => Number(byId(id).value);
const format = (n, digits = 4) =>
  n !== 0 && Math.abs(n) < 0.5 * 10 ** -digits
    ? n.toExponential(2)
    : n.toFixed(digits);
const ink = "#2463ba";
const neutral = "#526172";
const line = (x1, y1, x2, y2, color = neutral, extra = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" ${extra}/>`;
const label = (x, y, text, anchor = "middle") =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="#374151" font-size="14">${text}</text>`;
const point = (x, y, fill = ink) =>
  `<circle cx="${x}" cy="${y}" r="5" fill="${fill}"/>`;
function curve(fn, xmin, xmax, X, Y) {
  return `<path d="${Array.from({ length: 161 }, (_, i) => {
    const x = xmin + ((xmax - xmin) * i) / 160;
    return `${i ? "L" : "M"}${X(x)},${Y(fn(x))}`;
  }).join(" ")}" fill="none" stroke="${ink}" stroke-width="3"/>`;
}
function cartesian(X, Y, xticks, yticks, width = 620, height = 330) {
  return (
    yticks
      .map(
        (y) =>
          line(48, Y(y), width - 22, Y(y), "#e2e6eb") +
          label(40, Y(y) + 5, format(y, 1), "end"),
      )
      .join("") +
    line(48, Y(0), width - 22, Y(0)) +
    line(X(0), 20, X(0), height - 35) +
    xticks.map((x) => label(X(x), height - 12, format(x, 1))).join("") +
    label(width - 12, Y(0) - 8, "x", "end")
  );
}
function setupLocal() {
  if (!byId("local-plot")) return;
  function render() {
    const a = value("a"),
      h = value("h"),
      target = a + h,
      approx = a * a + 2 * a * h,
      exact = target * target;
    const X = (x) => 48 + ((x + 2.6) / 5.2) * 550,
      Y = (y) => 285 - ((y + 2) / 9) * 260;
    let svg = cartesian(X, Y, [-2, 0, 2], [-2, 0, 2, 4, 6]);
    svg += curve((x) => x * x, -2.6, 2.6, X, Y);
    // Clip the tangent to the data rectangle so extreme slopes stay inside the plot.
    svg += `<defs><clipPath id="calc-local-clip"><rect x="48" y="20" width="550" height="265"/></clipPath></defs><g clip-path="url(#calc-local-clip)">`;
    svg += line(
      X(-2.6),
      Y(a * a + 2 * a * (-2.6 - a)),
      X(2.6),
      Y(a * a + 2 * a * (2.6 - a)),
      neutral,
      'stroke-width="2" stroke-dasharray="7 5"',
    );
    svg +=
      line(
        X(target),
        Y(approx),
        X(target),
        Y(exact),
        "#b54750",
        'stroke-width="4"',
      ) + "</g>";
    svg +=
      point(X(a), Y(a * a)) +
      point(X(target), Y(exact)) +
      point(X(target), Y(approx), neutral);
    svg +=
      label(X(a), Y(a * a) - 12, "a") +
      label(X(target), Math.min(Y(exact), Y(approx)) - 14, "a+h");
    byId("local-plot").innerHTML = svg;
    byId("a-out").textContent = format(a, 2);
    byId("h-out").textContent = format(h, 4);
    byId("local-reading").textContent =
      `真实值 ${format(exact)}；线性近似 ${format(approx)}；误差 E=${format(h * h)}。`;
    byId("local-ratio").textContent =
      h === 0
        ? "h=0 时近似与真实值重合。差商在此不定义；导数由 h→0 的极限给出。"
        : `|E|/|h|=${format(Math.abs(h))}。h 减半后，误差从 ${format(h * h)} 变为 ${format((h * h) / 4)}，恰为原来的 1/4。`;
    byId("half").disabled = Math.abs(h) < 0.0001;
  }
  ["a", "h"].forEach((id) => byId(id).addEventListener("input", render));
  byId("half").addEventListener("click", () => {
    byId("h").value = String(value("h") / 2);
    render();
  });
  byId("local-reset").addEventListener("click", () => {
    byId("a").value = "1";
    byId("h").value = "0.8";
    render();
  });
  render();
}
function setupGradient() {
  if (!byId("gradient-plot")) return;
  let exactAngle = null;
  function render() {
    const x = value("gx"),
      y = value("gy"),
      angle = exactAngle ?? value("angle"),
      r = (angle * Math.PI) / 180,
      ux = Math.cos(r),
      uy = Math.sin(r),
      gx = 2 * x,
      gy = 4 * y,
      norm = Math.hypot(gx, gy),
      rawRate = gx * ux + gy * uy,
      rate = Math.abs(rawRate) < 1e-12 ? 0 : rawRate;
    const X = (x) => 310 + 58 * x,
      Y = (y) => 195 - 58 * y;
    let svg = `<defs><marker id="calc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${ink}"/></marker><marker id="calc-gray-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${neutral}"/></marker></defs>`;
    svg +=
      line(55, Y(0), 570, Y(0), "#aab4c0") +
      line(X(0), 25, X(0), 365, "#aab4c0") +
      label(580, Y(0) - 8, "x") +
      label(X(0) + 15, 25, "y");
    for (const c of [1, 2, 4, 8, 12])
      svg +=
        `<ellipse cx="310" cy="195" rx="${58 * Math.sqrt(c)}" ry="${58 * Math.sqrt(c / 2)}" fill="none" stroke="#bdc8d8"/>` +
        label(X(-Math.sqrt(c)), Y(0) - 7, `c=${c}`);
    for (const t of [-2, -1, 1, 2])
      svg +=
        label(X(t), Y(0) + 21, String(t)) +
        label(X(0) - 12, Y(t) + 5, String(t), "end");
    if (norm > 0)
      svg += line(
        X(x),
        Y(y),
        X(x + gx / norm),
        Y(y + gy / norm),
        neutral,
        'stroke-width="2" stroke-dasharray="5 4" marker-end="url(#calc-gray-arrow)"',
      );
    svg +=
      line(
        X(x),
        Y(y),
        X(x + ux),
        Y(y + uy),
        ink,
        'stroke-width="3" marker-end="url(#calc-arrow)"',
      ) +
      point(X(x), Y(y)) +
      label(X(x), Y(y) + 23, "p") +
      label(X(x + ux) + 12, Y(y + uy) - 10, "u");
    byId("gradient-plot").innerHTML = svg;
    ["gx", "gy"].forEach(
      (id) => (byId(`${id}-out`).textContent = format(value(id), 1)),
    );
    byId("angle-out").textContent = format(angle, 1);
    byId("gradient-reading").textContent =
      `p=(${format(x, 1)}, ${format(y, 1)})，f(p)=${format(x * x + 2 * y * y, 2)}；∇f=(${format(gx, 1)}, ${format(gy, 1)})；Dᵤf=${format(rate)}。${Math.abs(rate) < 1e-9 ? "沿此方向的一阶变化率为零。" : rate > 0 ? "沿此方向局部上升。" : "沿此方向局部下降。"}`;
    byId("gradient-max").textContent =
      norm === 0
        ? "原点的梯度为零，各方向导数均为零，没有唯一的最快上升方向。"
        : `最大方向导数为 ‖∇f‖=${format(norm)}。虚箭头只显示方向，长度统一为 1。`;
    byId("steepest").disabled = norm === 0;
  }
  ["gx", "gy", "angle"].forEach((id) =>
    byId(id).addEventListener("input", () => {
      exactAngle = null;
      render();
    }),
  );
  byId("steepest").addEventListener("click", () => {
    exactAngle =
      ((Math.atan2(4 * value("gy"), 2 * value("gx")) * 180) / Math.PI + 360) %
      360;
    byId("angle").value = String(exactAngle);
    render();
  });
  byId("gradient-reset").addEventListener("click", () => {
    exactAngle = null;
    byId("gx").value = "1";
    byId("gy").value = "0.5";
    byId("angle").value = "0";
    render();
  });
  render();
}
function setupIntegral() {
  if (!byId("integral-plot")) return;
  function render() {
    const b = value("b"),
      n = value("n"),
      method = byId("method").value,
      offset = { left: 0, right: 1, mid: 0.5 }[method],
      dx = b / n;
    const X = (x) => 48 + (x / 3.2) * 550,
      Y = (y) => 285 - (y / 10) * 260;
    let svg = cartesian(X, Y, [0, 1, 2, 3], [0, 3, 6, 9]),
      sum = 0;
    for (let i = 0; i < n; i++) {
      const sample = (i + offset) * dx,
        height = sample * sample;
      sum += height * dx;
      svg += `<rect x="${X(i * dx)}" y="${Y(height)}" width="${X(dx) - X(0)}" height="${Y(0) - Y(height)}" fill="#2463ba" fill-opacity="0.13" stroke="#526172" stroke-width="0.7"/>`;
    }
    svg +=
      curve((x) => x * x, 0, b, X, Y) +
      line(
        X(b),
        Y(0),
        X(b),
        Y(b * b),
        ink,
        'stroke-width="1" stroke-dasharray="4 4"',
      ) +
      label(X(b), Y(b * b) - 12, "b");
    const exact = (b * b * b) / 3,
      error = sum - exact;
    byId("integral-plot").innerHTML = svg;
    byId("b-out").textContent = format(b, 1);
    byId("n-out").textContent = String(n);
    byId("integral-reading").textContent =
      `Δx=${format(dx)}；矩形和 S=${format(sum)}；积分 I=${format(exact)}；S−I=${format(error)}。`;
    byId("integral-error").textContent =
      `${method === "right" ? "右端点高估" : "此取样低估"}。${method === "mid" ? "中点误差的绝对值为 b³/(12n²)，n 加倍会缩小到 1/4。" : "x² 在 [0,b] 上递增；左端点给出每段最低高度，右端点给出最高高度。"}`;
    byId("double").disabled = n > 40;
    byId("double").title =
      n > 40 ? "分段数上限为 80；请先把 n 调至 40 或以下。" : "";
  }
  ["b", "n", "method"].forEach((id) =>
    byId(id).addEventListener("input", render),
  );
  byId("double").addEventListener("click", () => {
    byId("n").value = String(Math.min(80, value("n") * 2));
    render();
  });
  byId("integral-reset").addEventListener("click", () => {
    byId("b").value = "2";
    byId("n").value = "6";
    byId("method").value = "mid";
    render();
  });
  render();
}
function setupExercises() {
  const questions = [
    ["local", 4.4, "f(2)+f′(2)×0.1=4+4×0.1=4.4。真实值为 4.41，误差为 0.01。"],
    [
      "gradient",
      4.4,
      "∇f(1,1)=(2,4)，与 (3/5,4/5) 点积得到 6/5+16/5=22/5=4.4。",
    ],
    [
      "integral",
      4,
      "基本定理给出 A′(2)=f(2)=2²=4。A(2)=8/3 是面积；这里求的是面积随右端点变化的速率。",
    ],
  ];
  questions.forEach(([id, answer, explanation]) => {
    const form = byId(`${id}-exercise`);
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = byId(`${id}-answer`);
      const correct =
        input.value.trim() !== "" &&
        Math.abs(Number(input.value) - answer) < 0.0001;
      byId(`${id}-feedback`).textContent =
        `${correct ? "正确。" : "再试一次。"}${explanation}`;
    });
  });
}
setupLocal();
setupGradient();
setupIntegral();
setupExercises();
