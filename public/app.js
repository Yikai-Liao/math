"use strict";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const shuffle = (a) =>
  a
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.v);
const statements = [
  {
    text: "7 是偶数。",
    answer: "f",
    why: "这是命题，值为假。它清楚地陈述了一件可以判断对错的事。",
  },
  {
    text: "你吃饭了吗？",
    answer: "n",
    why: "这是疑问句。回答可能有真假，但问题本身不是一个真或假的陈述。",
  },
  {
    text: "x > 3。",
    answer: "o",
    why: "这里没有指定 x，也没有量词约束 x。若 x = 5 则真，x = 2 则假；它还不是一个封闭的命题。",
  },
  {
    text: "每个整数都是偶数。",
    answer: "f",
    why: "范围是整数，量词是“每个”。这是一个为假的命题，比如整数 3 就不符合。",
  },
  {
    text: "存在一个整数大于 3。",
    answer: "t",
    why: "这是为真的命题。找出整数 4，就足以确认“至少有一个”。",
  },
  {
    text: "请把门关上。",
    answer: "n",
    why: "这是一个要求，不能给这个要求本身贴上“真”或“假”的标签。",
  },
  {
    text: "5 > 3。",
    answer: "t",
    why: "给 x 指定具体数值 5 后，开放语句 x > 3 变成命题 5 > 3，它为真。",
  },
  {
    text: "0 是偶数。",
    answer: "t",
    why: "真。偶数是能写成 2k（k 为整数）的数，而 0 = 2 × 0。",
  },
];
const categories = [
  ["t", "命题 · 真"],
  ["f", "命题 · 假"],
  ["n", "不是命题 · 问题或要求"],
  ["o", "开放语句 · x 还未确定"],
];
let si = 0;
function renderStatement() {
  const s = statements[si];
  $("#statement-count").textContent = `句子 ${si + 1} / ${statements.length}`;
  $("#statement-text").textContent = s.text;
  $("#statement-options").replaceChildren();
  shuffle(categories).forEach(([id, label]) => {
    const b = document.createElement("button");
    b.className = "option";
    b.textContent = label;
    b.addEventListener("click", () => {
      $$("#statement-options button").forEach((x) => {
        x.classList.remove("chosen");
        x.setAttribute("aria-pressed", "false");
      });
      b.classList.add("chosen");
      b.setAttribute("aria-pressed", "true");
      $("#statement-feedback").textContent =
        (id === s.answer ? "判断正确。" : "再想一步：") + s.why;
    });
    $("#statement-options").append(b);
  });
  $("#statement-feedback").textContent = "先做一个判断。猜错也没关系。";
}
$("#statement-next").onclick = () => {
  si = (si + 1) % statements.length;
  renderStatement();
};
$("#statement-reset").onclick = () => {
  si = 0;
  renderStatement();
};
renderStatement();
let blocks = [true, true, true, true, false, true],
  scanTimer = null,
  scanIndex = -1;
function truthLine(label, value) {
  return `<div><span>${label}</span><strong class="${value ? "" : "no"}">${value ? "✓ 真" : "× 假"}</strong></div>`;
}
function stopScan() {
  clearInterval(scanTimer);
  scanTimer = null;
  scanIndex = -1;
  $("#blocks-play").textContent = "▶ 逐个检查";
  $$(".block").forEach((b) => b.classList.remove("checking"));
}
function renderBlocks() {
  const root = $("#blocks");
  root.replaceChildren();
  blocks.forEach((v, i) => {
    const b = document.createElement("button");
    b.className = `block ${v ? "" : "orange"}`;
    b.dataset.num = String(i + 1).padStart(2, "0");
    b.textContent = v ? "青色" : "橙色";
    b.setAttribute(
      "aria-label",
      `第 ${i + 1} 块：${v ? "青色" : "橙色"}，点击切换`,
    );
    b.setAttribute("aria-pressed", String(v));
    b.onclick = () => {
      stopScan();
      blocks[i] = !blocks[i];
      renderBlocks();
      $("#blocks-scan").textContent = blocks.every(Boolean)
        ? "每一块都符合。有限的六块已经全部检查。"
        : `第 ${blocks.findIndex((x) => !x) + 1} 块不是青色，它就是“全部青色”的反例。`;
    };
    root.append(b);
  });
  const all = blocks.every(Boolean),
    some = blocks.some(Boolean);
  $("#quantifier-results").innerHTML =
    truthLine("∀：每一块都是青色", all) +
    truthLine("∃：至少一块是青色", some) +
    truthLine("¬∀：至少一块不是青色", !all) +
    truthLine("¬∃：一块青色也没有", !some);
}
$("#blocks-all").onclick = () => {
  stopScan();
  blocks.fill(true);
  renderBlocks();
  $("#blocks-scan").textContent = "全部青色：“所有”和“存在”都为真。";
};
$("#blocks-none").onclick = () => {
  stopScan();
  blocks.fill(false);
  renderBlocks();
  $("#blocks-scan").textContent = "没有青色：“存在青色”的否定为真。";
};
$("#blocks-play").onclick = () => {
  if (scanTimer) {
    stopScan();
    return;
  }
  scanIndex = -1;
  $("#blocks-play").textContent = "Ⅱ 暂停检查";
  const tick = () => {
    $$(".block").forEach((b) => b.classList.remove("checking"));
    scanIndex++;
    if (scanIndex >= 6) {
      stopScan();
      $("#blocks-scan").textContent =
        "六块全部通过。在这个只有六块的世界，“全部青色”是真的。";
      return;
    }
    $$(".block")[scanIndex].classList.add("checking");
    if (!blocks[scanIndex]) {
      clearInterval(scanTimer);
      scanTimer = null;
      $("#blocks-play").textContent = "▶ 再检查一遍";
      $("#blocks-scan").textContent =
        `停！第 ${scanIndex + 1} 块是橙色。只需这一个反例，“全部青色”就为假。`;
    } else
      $("#blocks-scan").textContent =
        `第 ${scanIndex + 1} 块通过。但还没检查的积木，仍然需要检查。`;
  };
  scanTimer = setInterval(tick, 900);
  tick();
};
renderBlocks();
let books = [
  [true, false, false],
  [false, true, false],
  [false, false, true],
];
function renderBooks() {
  const root = $("#book-grid");
  root.replaceChildren();
  ["", "📘 蓝书", "📙 橙书", "📗 绿书"].forEach((t) => {
    const e = document.createElement("span");
    e.className = "grid-label";
    e.textContent = t;
    root.append(e);
  });
  ["小林", "小陈", "小王"].forEach((name, r) => {
    const label = document.createElement("span");
    label.className = "grid-label";
    label.textContent = name;
    root.append(label);
    books[r].forEach((v, c) => {
      const b = document.createElement("button");
      b.className = `book-cell ${v ? "on" : ""}`;
      b.textContent = v ? "♥" : "·";
      b.setAttribute(
        "aria-label",
        `${name}${v ? "喜欢" : "不喜欢"}${["蓝书", "橙书", "绿书"][c]}，点击切换`,
      );
      b.setAttribute("aria-pressed", String(v));
      b.onclick = () => {
        books[r][c] = !books[r][c];
        renderBooks();
      };
      root.append(b);
    });
  });
  const every = books.every((row) => row.some(Boolean));
  const same = [0, 1, 2].some((c) => books.every((row) => row[c]));
  $("#book-results").innerHTML =
    truthLine("∀人 ∃书：每个人都有喜欢的书", every) +
    truthLine("∃书 ∀人：有一本书人人都喜欢", same) +
    `<p class="feedback">${same ? "有一整列都亮着：同一本书让每个人都点了心。" : every ? "每一行至少有一个心，但没有一整列全是心。各有所爱，也能满足第一句。" : "至少有一个人所在的行没有心。这个人就让第一句不成立。"}</p>`;
}
$("#books-separate").onclick = () => {
  books = [
    [true, false, false],
    [false, true, false],
    [false, false, true],
  ];
  renderBooks();
};
$("#books-shared").onclick = () => {
  books = [
    [true, false, false],
    [true, false, false],
    [true, false, false],
  ];
  renderBooks();
};
$("#books-clear").onclick = () => {
  books = Array.from({ length: 3 }, () => [false, false, false]);
  renderBooks();
};
renderBooks();
const cases = [
  {
    p: true,
    q: true,
    title: "没有违约 · 蕴含为真",
    text: "例如 n = 8：是 4 的倍数，也是偶数。条件发生了，承诺也兑现了。",
    example: "n = 8",
  },
  {
    p: true,
    q: false,
    title: "唯一的违约 · 蕴含为假",
    text: "假如有一个数是 4 的倍数，却不是偶数，它就推翻规则。但在整数中找不到这样的数：4k = 2(2k)。这是一个用于理解真值表的假想组合。",
    example: "整数中无此例",
  },
  {
    p: false,
    q: true,
    title: "没有违约 · 蕴含为真",
    text: "例如 n = 6：不是 4 的倍数，但仍是偶数。规则从未承诺“只有 4 的倍数才是偶数”。",
    example: "n = 6",
  },
  {
    p: false,
    q: false,
    title: "没有违约 · 蕴含为真",
    text: "例如 n = 3：不是 4 的倍数，也不是偶数。前提没有发生，规则对它没有提出要求。注意：这没有让“3 是偶数”变真。",
    example: "n = 3",
  },
];
let ci = 0,
  caseTimer = null;
function renderCase() {
  const x = cases[ci];
  $("#implication-cases").replaceChildren();
  cases.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = `case-button ${i === ci ? "active" : ""}`;
    b.textContent = `P ${c.p ? "真" : "假"} / Q ${c.q ? "真" : "假"}`;
    b.setAttribute("aria-pressed", String(i === ci));
    b.onclick = () => {
      stopCases();
      ci = i;
      renderCase();
    };
    $("#implication-cases").append(b);
  });
  $("#implication-display").innerHTML =
    `<div class="logic-flow"><span class="logic-pill ${x.p ? "" : "false"}">P ${x.p ? "真" : "假"}</span><span>⇒</span><span class="logic-pill ${x.q ? "" : "false"}">Q ${x.q ? "真" : "假"}</span></div><p class="eyebrow">${x.example}</p><h4>${x.title}</h4><p>${x.text}</p>`;
}
function stopCases() {
  clearInterval(caseTimer);
  caseTimer = null;
  $("#implication-play").textContent = "▶ 自动演示";
}
$("#implication-next").onclick = () => {
  stopCases();
  ci = (ci + 1) % 4;
  renderCase();
};
$("#implication-play").onclick = () => {
  if (caseTimer) {
    stopCases();
    return;
  }
  $("#implication-play").textContent = "Ⅱ 暂停演示";
  caseTimer = setInterval(() => {
    ci = (ci + 1) % 4;
    renderCase();
  }, 3500);
};
renderCase();
let n = 1,
  numberTimer = null,
  checked = new Set();
function factor(v) {
  for (let d = 2; d * d <= v; d++) if (v % d === 0) return d;
  return null;
}
function renderNumber() {
  checked.add(n);
  const v = n * n + n + 41,
    d = factor(v);
  $("#number-range").value = n;
  $("#number-label").textContent = n;
  $("#machine-result").className = `machine-result ${d ? "failed" : ""}`;
  $("#machine-result").innerHTML =
    `<span>${n}² + ${n} + 41 =</span><strong>${v} ${d ? "· 不是质数" : "· 是质数"}</strong><span>${d ? `${v} = ${d} × ${v / d}。找到了反例。` : "这个输入通过了，但它只代表自己。"}</span>`;
  $("#number-trail").innerHTML = Array.from(
    { length: 45 },
    (_, i) =>
      `<span class="trail-dot ${checked.has(i + 1) ? (factor((i + 1) ** 2 + i + 1 + 41) ? "fail" : "pass") : ""}" title="n=${i + 1}${checked.has(i + 1) ? " 已检查" : " 尚未检查"}"></span>`,
  ).join("");
  $("#checked-count").textContent =
    `已检查 ${checked.size} / 45 个展示值；正整数有无限多个。`;
  const hasCounter = [...checked].some((k) => factor(k * k + k + 41));
  $("#machine-lesson").textContent = d
    ? "“对所有正整数都成立”已被推翻。一个有效反例就够了。"
    : hasCounter
      ? "已经找到过反例。后面再次通过，也不能挽救“所有都成立”的猜想。"
      : "目前检查的输入都通过。下一次会怎样？这还不是一般性证明。";
  $("#number-next").disabled = n === 45;
}
function stopNumbers() {
  clearInterval(numberTimer);
  numberTimer = null;
  $("#number-play").textContent = "▶ 连续检查";
}
$("#number-range").oninput = (e) => {
  stopNumbers();
  n = Number(e.target.value);
  renderNumber();
};
$("#number-next").onclick = () => {
  stopNumbers();
  n = Math.min(45, n + 1);
  renderNumber();
};
$("#number-reset").onclick = () => {
  stopNumbers();
  n = 1;
  checked.clear();
  renderNumber();
};
$("#number-play").onclick = () => {
  if (numberTimer) {
    stopNumbers();
    return;
  }
  if (n === 45) {
    n = 1;
    checked.clear();
    renderNumber();
  }
  $("#number-play").textContent = "Ⅱ 暂停检查";
  numberTimer = setInterval(() => {
    n++;
    renderNumber();
    if (n === 45 || factor(n * n + n + 41)) stopNumbers();
  }, 220);
};
renderNumber();
const proof = [
  {
    title: "偶数，就是能两两成组",
    text: "不先挑某个具体的数。任意两个偶数，都能写成 2a 和 2b，其中 a、b 是整数。",
    formula: "2a　与　2b",
    pairs: 5,
    merged: false,
  },
  {
    title: "把两堆放到一起",
    text: "每一对都还在，合起来也不会多出落单的点。用代数写下来，就是把共同的 2 提出来。",
    formula: "2a + 2b = 2(a + b)",
    pairs: 5,
    merged: true,
  },
  {
    title: "结论覆盖任意两个偶数",
    text: "整数相加还是整数，所以 a + b 是整数。和仍然是“2 × 某个整数”，因此它是偶数。",
    formula: "a + b ∈ ℤ ⇒ 2(a + b) 是偶数",
    pairs: 5,
    merged: true,
  },
];
let pi = 0;
function renderProof() {
  const p = proof[pi];
  $("#proof-step-label").textContent = `证明步骤 0${pi + 1}`;
  $("#proof-title").textContent = p.title;
  $("#proof-text").textContent = p.text;
  $("#proof-formula").textContent = p.formula;
  $("#proof-count").textContent = `${pi + 1} / 3`;
  $("#proof-prev").disabled = pi === 0;
  $("#proof-next").disabled = pi === 2;
  $("#proof-visual").className = `proof-visual ${p.merged ? "merged" : ""}`;
  $("#proof-visual").innerHTML = Array.from(
    { length: 5 },
    (_, i) =>
      `<span class="pair-group ${i > 1 ? "coral-pair" : ""}" style="${pi === 0 && i === 2 ? "margin-left:22px" : ""}"><i class="pair-dot"></i><i class="pair-dot"></i></span>`,
  ).join("");
}
$("#proof-prev").onclick = () => {
  pi = Math.max(0, pi - 1);
  renderProof();
};
$("#proof-next").onclick = () => {
  pi = Math.min(2, pi + 1);
  renderProof();
};
renderProof();
const quizzes = {
  negation: {
    options: [
      "存在一个人，一本书都不喜欢。",
      "所有人都不喜欢任何书。",
      "每个人都至少有一本不喜欢的书。",
    ],
    correct: 0,
    why: "否定“每个人都有”，只需找到一个例外：这个人没有任何喜欢的书。依次否定量词：¬∀人∃书 → ∃人∀书¬喜欢。",
  },
  condition: {
    options: ["必要但不充分", "充分但不必要", "既充分又必要"],
    correct: 0,
    why: "是 4 的倍数，一定得是偶数，所以偶数是必要条件。但只有“是偶数”还不够，例如 6，所以不充分。",
  },
  proof: {
    options: [
      "这前一百万个输入都符合；其他输入尚未由此证明。",
      "所有正整数都符合，因为一百万足够多。",
      "这个命题一定是假命题，因为不能穷举。",
    ],
    correct: 0,
    why: "正确结论要守住已检查的范围。还没证明全部，不代表全部为假；它只是仍然缺少覆盖其余输入的论证。",
  },
};
function renderQuiz(el) {
  const q = quizzes[el.dataset.quiz],
    root = el.querySelector(".quiz-options");
  root.replaceChildren();
  shuffle(q.options.map((text, i) => ({ text, i }))).forEach(({ text, i }) => {
    const b = document.createElement("button");
    b.className = "option";
    b.textContent = text;
    b.onclick = () => {
      [...root.children].forEach((x) => {
        x.classList.remove("chosen");
        x.setAttribute("aria-pressed", "false");
      });
      b.classList.add("chosen");
      b.setAttribute("aria-pressed", "true");
      el.querySelector(".quiz-feedback").textContent =
        (i === q.correct ? "对，就是这个范围。" : "再检查一下量词或范围。") +
        q.why;
    };
    root.append(b);
  });
  el.querySelector(".quiz-feedback").textContent = "选一个答案，再查看解释。";
}
$$(".quiz").forEach((el) => {
  renderQuiz(el);
  el.querySelector(".quiz-reset").onclick = () => renderQuiz(el);
});
let progress = [];
try {
  const value = JSON.parse(localStorage.getItem("math-week-one-v1") || "[]");
  if (Array.isArray(value))
    progress = value.filter((n) => [1, 2, 3, 4].includes(n));
} catch {}
function renderProgress() {
  progress = [...new Set(progress)];
  $$(".complete").forEach((b) => {
    const yes = progress.includes(Number(b.dataset.complete));
    b.classList.toggle("done", yes);
    b.setAttribute("aria-pressed", String(yes));
    b.textContent = b.textContent.replace(/^[○✓]/, yes ? "✓" : "○");
  });
  $("#progress-text").textContent = `已标记理解 ${progress.length} / 4 章`;
  $("#progress-fill").style.width = `${progress.length * 25}%`;
  try {
    localStorage.setItem("math-week-one-v1", JSON.stringify(progress));
  } catch {}
}
$$(".complete").forEach(
  (b) =>
    (b.onclick = () => {
      const v = Number(b.dataset.complete);
      progress = progress.includes(v)
        ? progress.filter((x) => x !== v)
        : [...progress, v];
      renderProgress();
    }),
);
$("#progress-reset").onclick = () => {
  progress = [];
  renderProgress();
};
renderProgress();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopCases();
    stopNumbers();
    stopScan();
  }
});
