# 一点一点 · 第一单元：数学的语言

用图形和交互重新理解数学的语言：命题、谓词、量词、蕴含、反例与证明。面向学过本科数学、想从直觉重新开始的成年学习者。

## 本地运行

建议使用 Node.js 24。

```sh
npm ci
npm run dev
```

打开终端显示的地址，并进入 `/math/`。生产构建与预览：

```sh
npm run check:js
npm run build
npm run preview
```

## 发布

仓库：`Yikai-Liao/math`。部署地址：<https://yikai-liao.github.io/math/>。

Astro 已配置 `site: https://yikai-liao.github.io` 和 `base: /math`。在仓库设置中将 GitHub Pages 的发布来源设为 **GitHub Actions**。推送到 `main` 后，`.github/workflows/deploy.yml` 使用 Astro 和 GitHub Pages 官方工作流构建并发布 `dist`。

## 可以动手做什么

- 首屏灯光实验：关闭一盏灯，观察“全部亮着”的真假变化。
- 句子分拣：区分真命题、假命题、问题或要求、开放语句。
- 六块积木：切换颜色，观察全称量词、存在量词及其否定；逐个检查遇到反例时停下。
- 人与书的表格：比较“每个人都有喜欢的书”和“有一本书人人喜欢”。
- 蕴含的四种情况：逐步或自动演示 P、Q 的真假组合。
- 反例探测器：实际计算并检查质数，跟踪检查范围，在反例处暂停。
- 偶数相加的证明：用成对的点和代数式分三步解释。
- 三道可打乱选项、附解释的练习，以及最后的开放式自测。

## 使用与无障碍

进度只保存在当前浏览器的 `localStorage`，可以随时清除。页面不上传学习数据，没有分析追踪、远程字体或外部接口调用。

按钮支持键盘与触屏。颜色状态同时有文字说明。播放由学习者主动开启，支持暂停；离开当前标签页时自动暂停。减少动态效果偏好会关闭过渡效果。

## 项目结构

- `src/pages/index.astro`：课程内容与页面结构
- `public/style.css`：响应式样式
- `public/app.js`：交互实验与本地学习进度
- `astro.config.mjs`：静态构建与 GitHub Pages 路径
- `AGENTS.md`：课程写作、实现与验证要求
- `SKILLS.md`：项目技能的来源、版本与许可

页面使用 Astro、CSS、SVG 和浏览器 JavaScript。项目技能保留上游原文和许可；课程、项目说明与维护注释使用中文。
