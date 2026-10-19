"use strict";
import { units } from "../data/curriculum.js";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const shuffle = (items) =>
  items
    .map((value) => ({ value, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map((item) => item.value);
const records = [];
let appendTimer = null,
  bankerIndex = 0,
  potentialIndex = 0;
function appendRecord() {
  const previous = records.at(-1) || { n: 0, capacity: 0, total: 0, phi: 0 };
  const grows = previous.n === previous.capacity;
  const capacity = grows
    ? Math.max(1, previous.capacity * 2)
    : previous.capacity;
  const copies = grows ? previous.n : 0;
  const n = previous.n + 1,
    cost = 1 + copies,
    phi = 2 * n - capacity;
  records.push({
    n,
    capacity,
    copies,
    cost,
    total: previous.total + cost,
    phi,
    beforePhi: previous.phi,
    beforeCapacity: previous.capacity,
    amortized: cost + phi - previous.phi,
    grows,
  });
}
function stopAppend() {
  clearInterval(appendTimer);
  appendTimer = null;
  $("#append-play").textContent = "连续追加";
}
function fillRecords(target) {
  stopAppend();
  while (records.length < target) appendRecord();
  bankerIndex = records.length;
  potentialIndex = records.length;
  renderAppend();
}
function renderArray() {
  const record = records.at(-1);
  const root = $("#array-cells");
  root.replaceChildren();
  if (!record) {
    root.innerHTML =
      '<span class="empty-array">n = 0 · 尚未分配存储槽位</span>';
    return;
  }
  for (let index = 0; index < record.capacity; index++) {
    const cell = document.createElement("span");
    cell.className = `array-cell ${index < record.n ? "filled" : ""} ${index === record.n - 1 ? "new" : ""} ${record.copies > index ? "copied" : ""}`;
    cell.textContent = index < record.n ? String(index + 1) : "·";
    cell.setAttribute(
      "aria-label",
      `槽位 ${index + 1}：${index < record.n ? (index === record.n - 1 ? "刚写入" : record.grows ? "已复制" : "已有元素") : "空闲"}`,
    );
    root.append(cell);
  }
}
function costChart() {
  const root = $("#cost-chart");
  if (!records.length) {
    root.innerHTML =
      '<p class="chart-empty">追加后显示每步的写入与复制次数，柱高等于两者之和。</p>';
    return;
  }
  const width = 720,
    height = 210,
    left = 34,
    bottom = 25,
    plotHeight = 170,
    max = Math.max(4, ...records.map((r) => r.cost)),
    slot = (width - left - 12) / Math.max(17, records.length),
    barWidth = Math.min(25, slot * 0.72);
  let svg = `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true">`;
  [0, Math.ceil(max / 2), max].forEach((v) => {
    const y = height - bottom - (v / max) * plotHeight;
    svg += `<line x1="${left}" y1="${y}" x2="710" y2="${y}" class="grid-line"/><text x="25" y="${y + 4}" text-anchor="end" class="axis-label">${v}</text>`;
  });
  records.forEach((r, i) => {
    const x = left + i * slot + slot * 0.14,
      y = height - bottom - (r.cost / max) * plotHeight;
    svg += `<g data-record="${i}" tabindex="0" role="button" aria-label="第 ${i + 1} 次：基本操作 ${r.cost} 次，复制 ${r.copies}" class="cost-column"><rect x="${x}" y="${y}" width="${barWidth}" height="${(r.copies / max) * plotHeight}" class="copy-bar"/><rect x="${x}" y="${height - bottom - plotHeight / max}" width="${barWidth}" height="${plotHeight / max}" class="write-bar"/><rect x="${x - 2}" y="10" width="${slot}" height="${height - 20}" fill="transparent"/>${i === 0 || (i + 1) % 4 === 0 || r.grows ? `<text x="${x + barWidth / 2}" y="204" text-anchor="middle" class="axis-label">${i + 1}</text>` : ""}</g>`;
  });
  root.innerHTML = svg + "</svg>";
  root.querySelectorAll("[data-record]").forEach((bar) => {
    const show = () => {
      const r = records[Number(bar.dataset.record)];
      $("#cost-detail").textContent =
        `第 ${r.n} 次：写入 1 + 复制 ${r.copies} = ${r.cost}；操作后 n = ${r.n}，C = ${r.capacity}。`;
    };
    bar.addEventListener("click", show);
    bar.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        show();
      }
    });
  });
}
function renderAppend() {
  const r = records.at(-1) || { n: 0, capacity: 0, cost: 0, total: 0 };
  $("#append-step").textContent = `第 ${r.n} 次追加`;
  [
    ["#append-n", r.n],
    ["#append-capacity", r.capacity],
    ["#append-cost", r.cost],
    ["#append-total", r.total],
  ].forEach(([id, value]) => ($(id).textContent = value));
  $("#append-event").textContent = !r.n
    ? "空数组。追加第一个元素只写入一次。"
    : r.grows
      ? `容量 ${r.beforeCapacity} → ${r.capacity}。复制 ${r.copies} 个旧元素，再写入 1 个新元素，本次共执行 ${r.cost} 次基本操作。`
      : `容量不变，直接写入：本次写入 1 次。下一次扩容发生在容量 ${r.capacity} 被用完之后。`;
  renderArray();
  costChart();
  const copies = records.filter((r) => r.copies).map((r) => r.copies);
  $("#aggregate-sum").textContent =
    `复制次数 = ${copies.length ? copies.join(" + ") + " = " + (r.total - r.n) : "0"}`;
  $("#aggregate-bound").textContent = r.n
    ? `T(${r.n}) = ${r.n} + ${r.total - r.n} = ${r.total} < ${3 * r.n}`
    : "T(0) = 0";
  $("#aggregate-explain").textContent = r.n
    ? `每次追加平均执行 ${(r.total / r.n).toFixed(2)} 次基本操作，按 T(m) ÷ m 计算。`
    : "运行追加操作，查看各次扩容的复制次数。";
  $("#append-one").disabled = r.n >= 64;
  $("#append-play").disabled = r.n >= 64;
  $("#append-jump").disabled = r.n >= 17;
  $("#banker-range").max = r.n;
  $("#potential-range").max = Math.max(1, r.n);
  renderBanker();
  renderPotential();
}
$("#append-one").onclick = () => {
  stopAppend();
  if (records.length < 64) {
    appendRecord();
    bankerIndex = records.length;
    potentialIndex = records.length;
    renderAppend();
  }
};
$("#append-play").onclick = () => {
  if (appendTimer) {
    stopAppend();
    return;
  }
  $("#append-play").textContent = "暂停";
  appendTimer = setInterval(() => {
    appendRecord();
    bankerIndex = records.length;
    potentialIndex = records.length;
    renderAppend();
    if (records.length >= 64) stopAppend();
  }, 600);
};
$("#append-jump").onclick = () => fillRecords(17);
$("#append-reset").onclick = () => {
  stopAppend();
  records.length = 0;
  bankerIndex = 0;
  potentialIndex = 0;
  $("#cost-detail").textContent = "还没有操作。";
  renderAppend();
};
function renderBanker() {
  bankerIndex = Math.min(bankerIndex, records.length);
  const r = records[bankerIndex - 1] || { n: 0, total: 0, phi: 0, cost: 0 };
  const paid = 3 * r.n,
    balance = paid - r.total;
  $("#banker-range").value = bankerIndex;
  $("#banker-m").textContent = bankerIndex;
  $("#banker-paid").textContent = paid;
  $("#banker-spent").textContent = r.total;
  $("#banker-balance").textContent = balance;
  $("#credit-visual").innerHTML = paid
    ? `<div class="credit-spent" style="width:${(r.total / paid) * 100}%">已支付 ${r.total}</div><div class="credit-left" style="width:${(balance / paid) * 100}%">余额 ${balance}</div>`
    : '<p class="caption">还没有收支。</p>';
  $("#banker-event").innerHTML = r.n
    ? `<h4>第 ${r.n} 次：收 3，付 ${r.cost}</h4><p>本次余额变化 ${3 - r.cost >= 0 ? "+" : ""}${3 - r.cost}。${r.copies ? "扩容按复制次数扣除先前积累的信用。" : "本次写入消耗 1 点，剩余 2 点进入余额。"}</p><p>累计：${paid} − ${r.total} = ${balance} ≥ 0。</p><p class="caption">这里每次都收 3，所以 m ≥ 1 时 B(m) = Φ(m) + 1；它与第三课的势能相差 1。</p>`
    : "<h4>初始账户为 0</h4><p>先在第一课追加，或生成一段包含扩容的操作序列。</p>";
  $("#banker-prev").disabled = bankerIndex === 0;
  $("#banker-next").disabled = bankerIndex === records.length;
}
$("#banker-prepare").onclick = () => fillRecords(17);
$("#banker-range").oninput = (e) => {
  bankerIndex = Number(e.target.value);
  renderBanker();
};
$("#banker-prev").onclick = () => {
  bankerIndex--;
  renderBanker();
};
$("#banker-next").onclick = () => {
  bankerIndex++;
  renderBanker();
};
function renderPotential() {
  potentialIndex = Math.min(potentialIndex, records.length);
  const r = records[potentialIndex - 1];
  $("#potential-range").value = Math.max(1, potentialIndex);
  $("#potential-i").textContent = r ? potentialIndex : "—";
  $("#phi-before").textContent = r ? r.beforePhi : 0;
  $("#phi-after").textContent = r ? r.phi : 0;
  const scale = Math.max(4, r?.beforePhi || 0, r?.phi || 0);
  $("#phi-before-bar").style.height =
    `${r ? (r.beforePhi / scale) * 110 : 0}px`;
  $("#phi-after-bar").style.height = `${r ? (r.phi / scale) * 110 : 0}px`;
  $("#potential-operation").textContent = r
    ? r.grows
      ? `扩容 ${r.beforeCapacity} → ${r.capacity}`
      : "容量不变"
    : "先追加一个元素";
  $("#potential-equation").textContent = r
    ? `ĉ${r.n} = ${r.cost} + (${r.phi} − ${r.beforePhi}) = ${r.amortized}`
    : "ĉᵢ = cᵢ + Φᵢ − Φᵢ₋₁";
  $("#potential-reason").textContent = !r
    ? "先生成一段操作。"
    : r.n === 1
      ? "首次分配需要单独处理：成本 1，势能从 0 到 1，摊还成本为 2。"
      : r.copies
        ? `基本操作 ${r.cost} 次 包含复制；势能变化 ${r.phi - r.beforePhi} 把先前积累的预算计入本次，因此摊还成本仍为 3。`
        : "本次写入 1 次，势能增加 2，摊还成本为 1 + 2 = 3。";
  $("#potential-prev").disabled = potentialIndex <= 1;
  $("#potential-next").disabled = potentialIndex >= records.length;
}
$("#potential-prepare").onclick = () => fillRecords(17);
$("#potential-range").oninput = (e) => {
  potentialIndex = Number(e.target.value);
  renderPotential();
};
$("#potential-prev").onclick = () => {
  potentialIndex--;
  renderPotential();
};
$("#potential-next").onclick = () => {
  potentialIndex++;
  renderPotential();
};
let telescoped = false;
$("#telescope-toggle").onclick = () => {
  telescoped = !telescoped;
  $("#telescope-expression").classList.toggle("collapsed", telescoped);
  $("#telescope-toggle").textContent = telescoped ? "展开中间项" : "显示抵消";
};
const freshResize = () => ({
  n: 9,
  capacity: 16,
  total: 0,
  cost: 0,
  copies: 0,
  event: "初始状态：9 个元素，16 个槽位。",
  history: [0],
});
let bad = freshResize(),
  good = freshResize(),
  resizeCount = 0,
  resizeTimer = null,
  nextResize = "pop";
function resizeOperation(state, type, threshold) {
  let copies = 0;
  const before = state.capacity;
  if (type === "push") {
    if (state.n === state.capacity) {
      copies = state.n;
      state.capacity *= 2;
    }
    state.n++;
  } else {
    if (state.n === 0) return;
    state.n--;
    if (state.capacity > 2 && state.n <= state.capacity * threshold) {
      state.capacity = Math.max(2, state.capacity / 2);
      copies = state.n;
    }
  }
  state.cost = 1 + copies;
  state.copies = copies;
  state.total += state.cost;
  state.history.push(state.total);
  state.event = `${type === "push" ? "追加" : "删除"}：${before === state.capacity ? "容量不变" : `容量 ${before} → ${state.capacity}`}；1 + 复制 ${copies} = ${state.cost}。`;
}
function doResize(type) {
  if (
    resizeCount >= 80 ||
    (type === "pop" && bad.n === 0) ||
    (type === "push" && bad.n >= 40)
  )
    return;
  resizeOperation(bad, type, 0.5);
  resizeOperation(good, type, 0.25);
  resizeCount++;
  renderResize();
}
function stopResize() {
  clearInterval(resizeTimer);
  resizeTimer = null;
  $("#resize-play").textContent = "连续交替";
}
function resizeChart() {
  if (!resizeCount) {
    $("#resize-chart").innerHTML =
      '<p class="chart-empty">两种策略从相同状态开始，费用从 0 累积。</p>';
    return;
  }
  const w = 720,
    h = 200,
    left = 42,
    bottom = 25,
    max = Math.max(4, bad.total, good.total),
    count = Math.max(10, resizeCount);
  let svg = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">`;
  [0, Math.ceil(max / 2), max].forEach((v) => {
    const y = h - bottom - (v / max) * 155;
    svg += `<line class="grid-line" x1="${left}" y1="${y}" x2="710" y2="${y}"/><text class="axis-label" x="33" y="${y + 4}" text-anchor="end">${v}</text>`;
  });
  [bad, good].forEach((state, index) => {
    const points = state.history
      .map(
        (v, i) => `${left + (i / count) * 660},${h - bottom - (v / max) * 155}`,
      )
      .join(" ");
    svg += `<polyline points="${points}" class="${index ? "good-line" : "bad-line"}"/>`;
  });
  svg += `<text class="axis-label" x="${left}" y="198">0</text><text class="axis-label" x="${left + (resizeCount / count) * 660}" y="198" text-anchor="end">${resizeCount} 次操作</text></svg>`;
  $("#resize-chart").innerHTML = svg;
}
function renderResize() {
  [
    ["bad", bad],
    ["good", good],
  ].forEach(([name, state]) => {
    $(`#${name}-state`).textContent =
      `n = ${state.n}，C = ${state.capacity}，使用率 ${((100 * state.n) / state.capacity).toFixed(0)}%`;
    $(`#${name}-total`).textContent = state.total;
    $(`#${name}-event`).textContent = state.event;
    $(`#${name}-cells`).innerHTML = Array.from(
      { length: state.capacity },
      (_, i) =>
        `<span class="${i < state.n ? "occupied" : ""}" aria-hidden="true"></span>`,
    ).join("");
    $(`#${name}-cells`).setAttribute(
      "aria-label",
      `${state.n} 个元素，${state.capacity} 个槽位`,
    );
  });
  $("#resize-step").textContent = `${resizeCount} 次操作`;
  resizeChart();
  $("#resize-summary").textContent = resizeCount
    ? `同样 ${resizeCount} 次操作，1/2 策略累计 ${bad.total} 次，1/4 策略累计 ${good.total} 次。${bad.total > good.total ? "差额来自重复复制。" : "继续尝试边界附近的删除与追加。"}`
    : "先删除一个，再追加一个。观察两种策略各复制了多少元素。";
  $("#resize-pop").disabled = bad.n === 0 || resizeCount >= 80;
  $("#resize-push").disabled = bad.n >= 40 || resizeCount >= 80;
  $("#resize-pair").disabled = bad.n === 0 || resizeCount >= 79;
  $("#resize-play").disabled = resizeCount >= 80;
}
$("#resize-pop").onclick = () => {
  stopResize();
  doResize("pop");
};
$("#resize-push").onclick = () => {
  stopResize();
  doResize("push");
};
$("#resize-pair").onclick = () => {
  stopResize();
  doResize("pop");
  doResize("push");
};
$("#resize-play").onclick = () => {
  if (resizeTimer) {
    stopResize();
    return;
  }
  nextResize = bad.n === 0 ? "push" : "pop";
  $("#resize-play").textContent = "暂停";
  resizeTimer = setInterval(() => {
    doResize(nextResize);
    nextResize = nextResize === "pop" ? "push" : "pop";
    if (resizeCount >= 80) stopResize();
  }, 650);
};
$("#resize-reset").onclick = () => {
  stopResize();
  bad = freshResize();
  good = freshResize();
  resizeCount = 0;
  renderResize();
};
const quizzes = {
  aggregate: {
    answers: [
      "48：17 次写入，加上 1 + 2 + 4 + 8 + 16 次复制。",
      "34：每个元素最多被复制一次。",
      "51：摊还上界 3m 就是精确成本。",
    ],
    correct: 0,
    why: "实际执行 48 次基本操作。旧元素会在多次扩容中反复被复制；3m = 51 给出了这段序列的总次数上界。",
  },
  banker: {
    answers: [
      "第 5 次：共收 10，实际成本 12。",
      "第 3 次：成本很高，所以一定欠账。",
      "永远不会：每次写入只花 1。",
    ],
    correct: 0,
    why: "前四个前缀的实际总成本依次是 1、3、6、7；收 2 的余额是 1、1、0、1。第 5 次复制 4 个并写入 1 个，累计成本 12，余额变成 −2。",
  },
  potential: {
    answers: [
      "不能；必须保留并控制末态势能项 −Φₘ。",
      "能；摊还成本就是实际成本的另一个名字。",
      "能；负势能意味着算法产生了能量。",
    ],
    correct: 0,
    why: "恒等式是 T(m) = Σĉᵢ − Φₘ + Φ₀。这里 Φ₀ = 0，Φₘ = −m²，所以 T(m) = Σĉᵢ + m²。不能丢掉这个正的 m² 项。使用 T(m) ≤ Σĉᵢ 需要验证末态势能条件。",
  },
  resize: {
    answers: [
      "1/2 策略花 18；1/4 策略花 2。",
      "两种都花 2：只删除和追加各一次。",
      "1/2 策略花 10；1/4 策略花 2。",
    ],
    correct: 0,
    why: "1/2 策略删除后复制 8 个，下一次追加又复制 8 个，合计 (1+8)+(1+8)=18。1/4 策略两步都只执行 1 次基本操作，合计 2。",
  },
};
function renderQuiz(root) {
  const quiz = quizzes[root.dataset.quiz],
    options = root.querySelector(".quiz-options");
  options.replaceChildren();
  shuffle(quiz.answers.map((text, index) => ({ text, index }))).forEach(
    ({ text, index }) => {
      const button = document.createElement("button");
      button.textContent = text;
      button.className = "quiz-option";
      button.onclick = () => {
        [...options.children].forEach((b) => {
          b.classList.remove("selected");
          b.setAttribute("aria-pressed", "false");
        });
        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
        root.querySelector(".quiz-feedback").textContent =
          (index === quiz.correct ? "回答正确。" : "重新核对成本或边界。") +
          quiz.why;
      };
      options.append(button);
    },
  );
  root.querySelector(".quiz-feedback").textContent = "先选择，再核对推导。";
}
$$(".quiz").forEach((root) => {
  renderQuiz(root);
  root.querySelector(".quiz-reset").onclick = () => renderQuiz(root);
});
let progress = [];
try {
  const saved = JSON.parse(localStorage.getItem("math-amortized-v1") || "[]");
  if (Array.isArray(saved))
    progress = [...new Set(saved.filter((n) => [1, 2, 3, 4].includes(n)))];
} catch {}
function renderProgress() {
  $$(".complete").forEach((button) => {
    const done = progress.includes(Number(button.dataset.complete));
    button.classList.toggle("done", done);
    button.setAttribute("aria-pressed", String(done));
  });
  $("#progress-text").textContent = `已标记理解 ${progress.length} / 4 课`;
  $("#progress-fill").style.width = `${progress.length * 25}%`;
  try {
    localStorage.setItem("math-amortized-v1", JSON.stringify(progress));
  } catch {}
}
$$(".complete").forEach(
  (button) =>
    (button.onclick = () => {
      const id = Number(button.dataset.complete);
      progress = progress.includes(id)
        ? progress.filter((n) => n !== id)
        : [...progress, id];
      renderProgress();
    }),
);
$("#progress-reset").onclick = () => {
  progress = [];
  renderProgress();
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAppend();
    stopResize();
  }
});
renderAppend();
renderResize();
renderProgress();

// 使用原生 hash 保存当前课，支持深链接、前进和后退；切课保留实验数据。
const courseMenu = document.querySelector("#course-menu");
const menuOpen = document.querySelector("#course-menu-open");
menuOpen.addEventListener("click", () => courseMenu.showModal());
document
  .querySelector("#course-menu-close")
  .addEventListener("click", () => courseMenu.close());
courseMenu.addEventListener("click", (event) => {
  if (event.target !== courseMenu) return;
  const rect = courseMenu.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    courseMenu.close();
});
const courseSectionIds = [
  "overview",
  ...units.flatMap((unit) => unit.lessons.map((lesson) => lesson[0])),
];
function showCourseView() {
  const requested = window.location.hash.slice(1);
  const active = courseSectionIds.includes(requested) ? requested : "overview";
  stopAppend();
  stopResize();
  const unit = units.find((unit) =>
    unit.lessons.some((lesson) => lesson[0] === active),
  );
  const lesson = unit?.lessons.find((lesson) => lesson[0] === active);
  document.querySelector("#course-breadcrumbs").innerHTML =
    active === "overview"
      ? "<span>数学学习路线</span>"
      : `<a href="#overview">学习路线</a><span aria-hidden="true">›</span><span>${unit.name}</span><span aria-hidden="true">›</span><strong>${lesson[1]}</strong>`;
  courseSectionIds.forEach((id) => {
    document.getElementById(id).hidden = id !== active;
  });
  document.querySelector(".closing").hidden = active !== "hysteresis";
  document.querySelectorAll("[data-course-link]").forEach((link) => {
    const current = link.dataset.courseLink === active;
    link.classList.toggle("current", current);
    if (current) {
      link.setAttribute("aria-current", "page");
      let parent = link.parentElement;
      while (parent) {
        if (parent.tagName === "DETAILS") parent.open = true;
        parent = parent.parentElement;
      }
    } else link.removeAttribute("aria-current");
  });
  if (courseMenu.open) courseMenu.close();
  const currentView = document.getElementById(active);
  currentView.setAttribute("tabindex", "-1");
  currentView.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}
window.addEventListener("hashchange", showCourseView);
document.querySelectorAll("[data-course-link]").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.location.hash === link.getAttribute("href")) showCourseView();
  });
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 900 && courseMenu.open) courseMenu.close();
});
showCourseView();

// 同一学科的桌面目录与手机目录同步，其他学科保持独立。
units
  .map((unit) => unit.id)
  .concat("future")
  .forEach((id) => {
    const groups = [...document.querySelectorAll(`[data-directory="${id}"]`)];
    groups.forEach((group) =>
      group.addEventListener("toggle", () => {
        groups.forEach((other) => {
          if (other !== group && other.open !== group.open)
            other.open = group.open;
        });
      }),
    );
  });
