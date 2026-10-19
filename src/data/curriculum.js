export const units = [
  {
    id: "linear",
    name: "线性代数",
    description: "向量、坐标与线性结构",
    lessons: [
      ["linear-map", "线性变换与矩阵", "用基向量的像确定整个变换"],
      ["linear-basis", "基与坐标变换", "同一个向量的不同坐标"],
      ["linear-eigen", "特征方向与迭代", "寻找变换保持的方向"],
    ],
  },
  {
    id: "calculus",
    name: "微积分",
    description: "局部变化与整体累积",
    lessons: [
      ["calculus-local", "导数与局部线性近似", "量化线性近似的误差"],
      ["calculus-gradient", "梯度与方向导数", "计算沿任意方向的变化率"],
      ["calculus-integral", "积分与累积量", "从有限求和走向极限"],
    ],
  },
  {
    id: "probability",
    name: "概率论",
    description: "随机变量及其数量特征",
    lessons: [
      ["probability-distribution", "随机变量与分布", "从样本结果得到概率质量"],
      ["probability-expectation", "期望与线性性", "用联合分布计算平均值"],
      ["probability-variance", "方差与独立性", "区分波动与共同变化"],
    ],
  },
  {
    id: "algorithm",
    name: "算法分析",
    description: "选学应用 · 摊还分析",
    lessons: [
      ["aggregate", "聚合分析", "求出一串操作的总成本"],
      ["banker", "记账法", "建立前缀余额不变量"],
      ["potential", "势能法", "用状态函数证明上界"],
      ["hysteresis", "应用：扩缩容", "检验分析的适用条件"],
    ],
  },
];
