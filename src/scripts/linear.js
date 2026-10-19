const $ = (id) => document.getElementById(`lin-${id}`);
const fmt = (n) => (Math.abs(n) < 1e-9 ? "0" : Number(n.toFixed(3)).toString());
const vectorText = ([x, y]) => `(${fmt(x)}, ${fmt(y)})`;
const number = (id) => Number($(id).value);
const ns = "http://www.w3.org/2000/svg";
function element(tag, attrs, text) {
  const node = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([key, value]) =>
    node.setAttribute(key, String(value)),
  );
  if (text !== undefined) node.textContent = text;
  return node;
}
function plot(id, extent) {
  const svg = $(id);
  // 重绘时保留供辅助技术读取的图标题。
  while (svg.children.length > 1) svg.lastElementChild.remove();
  const scale = 155 / extent;
  const point = ([x, y]) => [260 + x * scale, 200 - y * scale];
  const line = (a, b, attrs = {}) => {
    const [x1, y1] = point(a),
      [x2, y2] = point(b);
    svg.append(
      element("line", {
        x1,
        y1,
        x2,
        y2,
        stroke: "#687b75",
        "stroke-width": 1,
        ...attrs,
      }),
    );
  };
  const label = (v, text, attrs = {}) => {
    const [x, y] = point(v);
    svg.append(
      element(
        "text",
        { x: x + 7, y: y - 9, fill: "#1c332c", "font-size": 15, ...attrs },
        text,
      ),
    );
  };
  line([-extent * 1.4, 0], [extent * 1.4, 0], { stroke: "#9ea9a5" });
  line([0, -extent * 1.1], [0, extent * 1.1], { stroke: "#9ea9a5" });
  label([extent * 1.35, 0], "x");
  label([0, extent * 1.05], "y");
  label([0, 0], "0");
  svg.append(
    element(
      "text",
      { x: 16, y: 382, fill: "#435b51", "font-size": 14 },
      `横纵同尺度；参考刻度 ${fmt(extent)}`,
    ),
  );
  line([extent, -extent * 0.025], [extent, extent * 0.025]);
  label([extent, 0], fmt(extent));
  const arrow = (v, text, color = "#176b51", from = [0, 0], dash = false) => {
    const attrs = { stroke: color, "stroke-width": 3 };
    if (dash) attrs["stroke-dasharray"] = "6 4";
    line(from, v, attrs);
    const [x, y] = point(v),
      [sx, sy] = point(from),
      angle = Math.atan2(y - sy, x - sx);
    if (Math.hypot(x - sx, y - sy) > 0.1)
      svg.append(
        element("path", {
          d: `M ${x - 10 * Math.cos(angle - 0.4)} ${y - 10 * Math.sin(angle - 0.4)} L ${x} ${y} L ${x - 10 * Math.cos(angle + 0.4)} ${y - 10 * Math.sin(angle + 0.4)}`,
          fill: "none",
          stroke: color,
          "stroke-width": 3,
        }),
      );
    if (text) label(v, text, { fill: color });
  };
  const polygon = (points) =>
    svg.append(
      element("polygon", {
        points: points.map((p) => point(p).join(",")).join(" "),
        fill: "#a7d2bf",
        "fill-opacity": 0.4,
        stroke: "#176b51",
        "stroke-width": 2,
      }),
    );
  return { line, label, arrow, polygon };
}
function initMap() {
  if (!$("map-svg")) return;
  function render() {
    const [a, b, c, d] = ["a", "b", "c", "d"].map((key) =>
      number(`map-${key}`),
    );
    ["a", "b", "c", "d"].forEach(
      (key) => ($(`map-${key}-out`).textContent = fmt(number(`map-${key}`))),
    );
    const x = [number("map-x"), number("map-y")],
      transform = ([u, v]) => [a * u + b * v, c * u + d * v];
    const y = transform(x),
      extent = Math.max(
        3,
        Math.abs(y[0]) + 1,
        Math.abs(y[1]) + 1,
        2 * (Math.abs(a) + Math.abs(b)),
        2 * (Math.abs(c) + Math.abs(d)),
      );
    const p = plot("map-svg", extent);
    for (let k = -2; k <= 2; k++) {
      p.line([k, -2], [k, 2], { stroke: "#b7c0bc", "stroke-dasharray": "4 4" });
      p.line([-2, k], [2, k], { stroke: "#b7c0bc", "stroke-dasharray": "4 4" });
      p.line(transform([k, -2]), transform([k, 2]), { stroke: "#76a18e" });
      p.line(transform([-2, k]), transform([2, k]), { stroke: "#76a18e" });
    }
    p.polygon([
      [0, 0],
      [a, c],
      [a + b, c + d],
      [b, d],
    ]);
    p.arrow(x, "x", "#65746e");
    p.arrow(y, "Ax");
    const det = a * d - b * c;
    $("map-result").textContent =
      `x = ${vectorText(x)}，Ax = ${vectorText(y)}。det A = ${fmt(det)}，面积乘以 ${fmt(Math.abs(det))}。${Math.abs(det) < 1e-9 ? "矩阵不可逆，两个列向量线性相关。" : det < 0 ? "定向翻转，矩阵可逆。" : "定向保持，矩阵可逆。"}`;
  }
  ["a", "b", "c", "d", "x", "y"].forEach((key) =>
    $(`map-${key}`).addEventListener("input", render),
  );
  function set(values) {
    ["a", "b", "c", "d", "x", "y"].forEach(
      (key, i) => ($(`map-${key}`).value = values[i]),
    );
    render();
  }
  $("map-reset").addEventListener("click", () => set([1, 1, 0, 1, 1, 1]));
  $("map-collapse").addEventListener("click", () => set([1, 2, 0.5, 1, 1, 1]));
  render();
}
function initBasis() {
  if (!$("basis-svg")) return;
  function render() {
    const s = number("basis-s"),
      h = number("basis-h");
    $("basis-s-out").textContent = fmt(s);
    $("basis-h-out").textContent = fmt(h);
    const singular = Math.abs(h) < 1e-9,
      beta = singular ? 0 : 1 / h,
      alpha = singular ? 0 : 1 - s / h;
    const p = plot(
      "basis-svg",
      Math.max(
        2.5,
        Math.abs(alpha) + 0.7,
        Math.abs(s) + 0.7,
        Math.abs(h) + 0.7,
      ),
    );
    if (!singular) {
      p.arrow([alpha, 0], "αb₁", "#65746e", [0, 0], true);
      p.arrow([1, 1], "", "#65746e", [alpha, 0], true);
    }
    p.arrow([1, 0], "b₁", "#9a4c26");
    p.arrow([s, h], "b₂", "#476b85");
    p.arrow([1, 1], "v");
    $("basis-result").textContent = singular
      ? "det B = h = 0。这两个向量不构成基；它们的组合都落在横轴上，无法表示 v = (1,1)。"
      : `det B = ${fmt(h)}；[v]ᵦ = (α, β) ≈ ${vectorText([alpha, beta])}（显示至小数点后三位）。代回：${fmt(alpha)} + (${fmt(s)}) × (${fmt(beta)}) ≈ 1，(${fmt(h)}) × (${fmt(beta)}) ≈ 1。`;
  }
  ["s", "h"].forEach((key) =>
    $(`basis-${key}`).addEventListener("input", render),
  );
  $("basis-reset").addEventListener("click", () => {
    $("basis-s").value = 1;
    $("basis-h").value = 1;
    render();
  });
  $("basis-singular").addEventListener("click", () => {
    $("basis-h").value = 0;
    render();
  });
  render();
}
function initEigen() {
  if (!$("eigen-svg")) return;
  let count = 0,
    plus = 0,
    minus = 0,
    initial = [1, 0],
    stopped = false;
  function render() {
    const t = number("eigen-t"),
      v = [(plus + minus) / Math.SQRT2, (plus - minus) / Math.SQRT2];
    const p = plot("eigen-svg", 1.4);
    p.line([-1.2, -1.2], [1.2, 1.2], { "stroke-dasharray": "6 4" });
    p.line([-1.2, 1.2], [1.2, -1.2], { "stroke-dasharray": "6 4" });
    p.label([1.15, 1.15], "q₊");
    p.label([1.15, -1.15], "q₋");
    p.arrow(initial, "v₀", "#82938c");
    if (!stopped) p.arrow(v, `v${count}`);
    $("eigen-t-out").textContent = fmt(t);
    $("eigen-angle-out").textContent = $("eigen-angle").value;
    $("eigen-step").disabled = stopped;
    $("eigen-result").textContent =
      `已作用 ${count} 次。λ₊ = ${fmt(2 + t)}，λ₋ = ${fmt(2 - t)}。${stopped ? "结果是零向量，长度为 0，无法归一化。调整参数或重置后再试。" : `当前单位向量 ${vectorText(v)}；沿 q₊、q₋ 的系数分别为 ${fmt(plus)}、${fmt(minus)}。`}`;
  }
  function reset() {
    const angle = (number("eigen-angle") * Math.PI) / 180;
    initial = [Math.cos(angle), Math.sin(angle)];
    plus = (initial[0] + initial[1]) / Math.SQRT2;
    minus = (initial[0] - initial[1]) / Math.SQRT2;
    // 精确的特征方向不应因浮点舍入而混入另一个特征方向。
    if (Math.abs(plus) < 1e-14) plus = 0;
    if (Math.abs(minus) < 1e-14) minus = 0;
    count = 0;
    stopped = false;
    render();
  }
  ["t", "angle"].forEach((key) =>
    $(`eigen-${key}`).addEventListener("input", reset),
  );
  $("eigen-reset").addEventListener("click", reset);
  $("eigen-step").addEventListener("click", () => {
    const t = number("eigen-t"),
      p = (2 + t) * plus,
      m = (2 - t) * minus,
      length = Math.hypot(p, m);
    count++;
    if (length < 1e-14) {
      stopped = true;
      plus = 0;
      minus = 0;
    } else {
      plus = p / length;
      minus = m / length;
    }
    render();
  });
  reset();
}
const feedback = {
  map: {
    correct: "1",
    yes: "正确。det A = 1×1 − 2×0 = 1。剪切改变角度和边长，单位正方形的像仍有面积 1。",
    no: "再试一次：面积因子是 |ad − bc|。把 1、2、0、1 代入；横向剪切量 2 不直接等于面积因子。",
  },
  basis: {
    correct: "half",
    yes: "正确。½(1,0) + ½(1,2) = (1,1)。坐标 (½,½) 记录的是两个基向量各自的系数。",
    no: "先看竖直分量：2β = 1，所以 β = ½；再解 α + β = 1。选出这两个系数。",
  },
  eigen: {
    correct: "minus",
    yes: "正确。λ₋ = 1，因此 Aq₋ = q₋。初始向量的 q₊ 分量为 0，迭代始终保持 q₋。",
    no: "用特征方程直接计算：t = 1 时，Aq₋ = (2−1)q₋ = q₋。即使 λ₊ 更大，初始 q₊ 分量为 0 时也不会出现。",
  },
};
function init() {
  initMap();
  initBasis();
  initEigen();
  document.querySelectorAll("[data-lin-quiz]").forEach((button) =>
    button.addEventListener("click", () => {
      const key = button.dataset.linQuiz,
        quiz = feedback[key];
      $(`${key}-feedback`).textContent =
        button.dataset.answer === quiz.correct ? quiz.yes : quiz.no;
    }),
  );
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
