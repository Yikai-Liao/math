const byId = (id) => document.getElementById(id);
const fixed = (value) => (Math.abs(value) < 1e-10 ? 0 : value).toFixed(2);
const put = (id, value) => {
  const node = byId(id);
  if (node) node.textContent = value;
};

function updateDistribution() {
  const p = Number(byId("prob-p").value) / 100;
  const outcomes = [(1 - p) ** 2, (1 - p) * p, p * (1 - p), p ** 2];
  const masses = [outcomes[0], outcomes[1] + outcomes[2], outcomes[3]];
  put("prob-p-value", fixed(p));
  // Four decimal places preserve exact decimal products at this slider's 0.05 step.
  outcomes.forEach((probability, index) =>
    put(`prob-outcome-${index}`, probability.toFixed(4)),
  );
  masses.forEach((probability, index) =>
    put(`prob-mass-${index}`, probability.toFixed(4)),
  );
  put(
    "prob-distribution-reading",
    `P(X=1) = ${outcomes[1].toFixed(4)} + ${outcomes[2].toFixed(4)} = ${masses[1].toFixed(4)}；三个概率的和 = 1。`,
  );
  console.assert(
    Math.abs(masses.reduce((a, b) => a + b, 0) - 1) < 1e-10,
    "概率质量之和必须为 1",
  );
}

function relation(q) {
  if (q === 0) return "X 与 Y 总是相反，S 恒为 1。";
  if (q === 0.5) return "X 与 Y 总是相同，S 只取 0 或 2。";
  if (q === 0.25) return "四个联合概率都是 1/4，此时 X 与 Y 独立。";
  return q < 0.25
    ? "X 与 Y 取不同值的概率大于取相同值的概率。"
    : "X 与 Y 取相同值的概率大于取不同值的概率。";
}

function updateExpectation() {
  const q = Number(byId("prob-expect-q").value) / 100;
  put("prob-expect-q-value", fixed(q));
  [
    ["00", q],
    ["01", 0.5 - q],
    ["10", 0.5 - q],
    ["11", q],
  ].forEach(([key, value]) => put(`prob-joint-${key}`, fixed(value)));
  put(
    "prob-expect-reading",
    `${relation(q)} E[X] = E[Y] = 0.50，E[X+Y] = 1.00。`,
  );
  put(
    "prob-expect-calculation",
    `E[S] = 0 × ${fixed(q)} + 1 × ${fixed(1 - 2 * q)} + 2 × ${fixed(q)} = 1.00`,
  );
}

function updateVariance() {
  const q = Number(byId("prob-var-q").value) / 100;
  const masses = [q, 1 - 2 * q, q];
  put("prob-var-q-value", fixed(q));
  masses.forEach((probability, index) => {
    const height = 180 * probability;
    byId(`prob-var-bar-${index}`).setAttribute("height", String(height));
    byId(`prob-var-bar-${index}`).setAttribute("y", String(205 - height));
    byId(`prob-var-label-${index}`).setAttribute("y", String(195 - height));
    put(`prob-var-label-${index}`, fixed(probability));
  });
  put(
    "prob-var-reading",
    `${relation(q)} E[S] = 1；Var(S) = ${fixed(2 * q)}；Cov(X,Y) = ${fixed(q - 0.25)}。`,
  );
  put(
    "prob-var-calculation",
    `Var(S) = (0−1)² × ${fixed(q)} + (1−1)² × ${fixed(1 - 2 * q)} + (2−1)² × ${fixed(q)} = ${fixed(2 * q)}`,
  );
  console.assert(
    Math.abs(
      masses.reduce((sum, mass, x) => sum + mass * (x - 1) ** 2, 0) - 2 * q,
    ) < 1e-10,
    "方差应等于 2q",
  );
}

const feedback = {
  distribution: {
    half: "正确。反正与正反各有 1/4 的概率，二者互斥，相加得到 1/2。",
    quarter:
      "1/4 只计算了一个结果。X=1 包含反正与正反；把它们的概率相加，再试一次。",
    third:
      "三个数值并不等概率。1 对应两个试验结果，0 与 2 各对应一个。再列出四个等概率结果。",
  },
  expectation: {
    fourhalf: "正确。3×1/2−2×1/2+4=4.5。线性性对依赖的随机变量同样成立。",
    depends:
      "q 改变联合分布，但两个边缘期望保持 1/2。直接使用线性性即可；不需要独立。",
    five: "分别乘上系数：3×1/2=1.5，−2×1/2=−1，再加常数 4。请再算一次。",
  },
  variance: {
    constant:
      "正确。只有 (0,1) 和 (1,0) 有正概率，S 恒为 1。Cov=−1/4，所以 1/4+1/4+2×(−1/4)=0。",
    independent:
      "此时二者完全相反，并不独立。独立对应 q=1/4；q=0 时，和恒定使方差为 0。",
    zero: "X 与 Y 各自仍以 1/2 的概率取 0 或 1，各自方差都是 1/4。请查看和 S 的可能取值。",
  },
};

if (byId("prob-p")) {
  [
    ["prob-p", "prob-distribution-reset", 50, updateDistribution],
    ["prob-expect-q", "prob-expect-reset", 25, updateExpectation],
    ["prob-var-q", "prob-var-reset", 25, updateVariance],
  ].forEach(([inputId, resetId, initial, update]) => {
    byId(inputId).addEventListener("input", update);
    byId(resetId).addEventListener("click", () => {
      byId(inputId).value = String(initial);
      update();
    });
    update();
  });
  document.querySelectorAll("[data-prob-exercise]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const answer = form.querySelector("select").value;
      form.querySelector(".prob-feedback").textContent =
        feedback[form.dataset.probExercise][answer] ||
        "请先选择一个答案，再检查推理。";
    });
  });
}
