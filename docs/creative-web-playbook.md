# 高级 HTML5 创意网站设计技法库 · Creative Web Playbook v1

> 拆解 12 个世界级创意站的**结构/动效节奏/交互逻辑/技术表达**（只学方法，不抄素材/品牌/文案/视觉资产）。最后落到 yaopulife「中国文化故事出海」互动站方案 + 移动端。

---

## 一、12 标杆拆解（核心手法 · 可偷的点 · 技术 · 对我们的启发）

| 站 | 核心手法 | 可偷的点 | 技术栈 |
|---|---|---|---|
| **Bruno Simon** | 可开车的 3D 世界，导航即游戏 | 用**一个可操作的隐喻**贯穿全站；玩性=记忆点 | Three.js + cannon-es 物理 |
| **Lusion v3** | 电影级 WebGL，光标反应流体/粒子，无缝转场 | cursor-reactive **氛围层**；全屏 shader **转场遮罩**；克制的高级感 | Three.js + GLSL + 平滑滚动 |
| **Active Theory v4/v5** | 沉浸式 agency，WebGL 页面转场 + 声音 + 编排 | 页面切换当**镜头切换**；统一 motion 语言；声音强化沉浸 | 自研 Frame/Hydra 框架 |
| **Prometheus Fuels** | 长卷 scrollytelling，把工业/科学讲成英雄旅程 | **scroll 分章 + 情绪推进**；暗调电影感 + 大字 + 留白 | GSAP ScrollTrigger |
| **Lando Norris** | 大胆 kinetic typography，速度/能量感 | **动态排版作主视觉**；强对比色块；惯性 motion | GSAP + WebGL 点缀 |
| **Messenger by abeto** | 插画 + 角色 + 微交互，俏皮有温度 | **角色化 + 微交互**的亲切感；小惊喜 | SVG/Canvas + GSAP |
| **E.C.H.O. (AT)** | 第一人称沉浸叙事体验 | 沉浸 + 引导动线；声音叙事 | WebGL + WebAudio |
| **Resn** | 实验性 WebGL，暗黑 playful，奇观时刻 | 敢于实验的**一个"奇观"时刻** | Three.js + 自写 shader |
| **In Pieces / Species in Pieces** | 纯 CSS 多边形 morph，30 物种，公益叙事 | **一个母题(碎片/几何)做 morph 叙事**；CSS-only 也能惊艳、轻量 | CSS clip-path/transform only |
| **The Boat (SBS)** | 交互式图像小说，scroll + 声音 + 动画讲难民故事 | **scrollytelling + 插画 + 声音**讲沉重题材；情绪节奏；沉浸阅读 | Canvas + 视差 + WebAudio |
| **Patatap** | 联觉：键盘→声音+视觉，生成式 | 一个可"**演奏/把玩**"的同步声画模块 | paper.js + Web Audio (Howler) |
| **Robby Leonardi** | 横版游戏化简历，视差关卡 | 把线性信息做成**可探索的关卡**；视差分层；游戏化 | jQuery + 视差(可现代化为 GSAP) |

**三条主"流派"**：① Scrollytelling 长卷叙事（Prometheus/The Boat）② Playground 自由探索（Bruno/Robby）③ Immersive WebGL agency（Lusion/AT/Resn）。第四类是 Toy 单点把玩（Patatap）与 CSS-only 奇观（In Pieces）——证明**轻量也能高级**。

---

## 二、五维报告（跨站综合）

### 视觉设计
- **色彩**：克制 2–3 色 + 1 强调色；高级底常用**暗调电影感**或**极简留白**二选一，不二者皆要。品牌靠**单色锤**（一抹标志色）建立记忆。
- **字体排版**：大字 display 与正文强对比；kinetic type 作主视觉；中英混排留呼吸；衬线=气质，无衬线=现代，挑一条主线别混乱。
- **留白与节奏**：留白即气；**一屏一主体**；节奏=静→张→放交替，避免每屏都满。
- **画面层次**：前景(内容) / 中景(主视觉) / 背景(氛围层：粒子/shader/视差) **三层**分离 → 立体且高级。
- **品牌记忆点**：一个可玩/可看的**"奇观"时刻** + 全站**一致的 motion 语言** + 一个贯穿**母题**。

### 交互设计
- **首屏钩子**：一个**动作邀请**（拖/滚/hover 的明确提示）+ 3 秒情绪钩子；别一上来塞信息。
- **输入分工**：scroll 是叙事主线；cursor 做氛围与反馈（磁吸/拖尾/视差）；键盘/点击做**彩蛋**；移动端=触摸 + 可选陀螺仪。
- **转场**：全屏遮罩 / shader wipe / 共享元素过渡——**绝不白屏硬跳**。
- **高级感微交互**：磁性按钮、光标吸附、hover 位移/置换、惯性与弹性 easing、数字滚动、sticky→fixed。
- **用户路径**：线性引导(scrollytelling) vs 自由探索(playground)——选一主轴，并永远给清晰"下一步"。

### 动效设计
- **入场**：mask reveal / 文字逐行 / staggered 揭幕 / preloader 转主场。
- **滚动**：ScrollTrigger **pin + scrub**；parallax；scrollytelling 章节绑定。
- **WebGL**：粒子场 / 流体 / 置换(displacement) / 景深；重计算走 **GPGPU**。
- **SVG/CSS**：path draw、morph、clip-path、transform/perspective。
- **声音/反馈**：Web Audio 点睛（**可静音**）；移动端 haptic；节奏配合情绪。
- **铁律**：**动效服务叙事与情绪，不炫技**；每个动效有意义；克制 > 堆砌；`prefers-reduced-motion` 必须尊重。

### 内容叙事
- **普通信息→故事**：套**英雄旅程 / 冲突—代价 / 一句话 high-concept**。
- **分章**：scroll 章节 + 锚点 + 进度指示。
- **情绪推进**：明暗、疏密、快慢的对比制造起伏（静→冲突→代价→余味）。
- **海外可懂**：**先情绪后文化**；用普世母题（孤独/归属/失去/不屈）；视觉桥不靠文字。
- **复杂概念视觉化**：隐喻 + 逐步揭示 + 数据可视。

---

## 三、可复用技法库

**适合项目**：品牌站 / 作品集 / 叙事产品 / 文化 IP / 活动页。**不适合**：信息密集后台、电商 SKU 列表（会拖累转化）。

**页面结构模板**
- A·Scrollytelling 长卷：Hero(钩子) → 章节(pin+scrub) → 高潮 → 收束 CTA。
- B·Playground 探索：世界/关卡 + 可操作隐喻 + 彩蛋 + 出口指引。
- C·Immersive：全屏镜头序列 + WebGL 转场 + 作品/章节流。
- D·Toy 单点：一个可把玩模块 + 生成式 + 分享。

**组件清单**：平滑滚动容器(Lenis) · 章节/进度指示 · 磁性按钮 · 自定义光标 · mask-reveal 文本 · 视差层 · WebGL 氛围层(粒子/流体) · 全屏转场遮罩 · 可静音声音管理器 · 滚动编排器 · preloader · 移动端手势层。

**动效清单**：mask reveal · line-by-line text · pin+scrub · parallax · magnetic · cursor-trail · morph/path-draw · particle field · displacement hover · page wipe · counter · sticky-to-fixed。

**技术栈建议**：HTML5 语义化；CSS3(clip-path / transform / scroll-snap / `prefers-reduced-motion`)；**GSAP + ScrollTrigger**(编排主力)；**Lenis**(平滑滚动)；**Three.js / OGL**(OGL 更轻)；自写 GLSL(粒子/流体/置换)；SVG(path/morph)；**Web Audio / Howler**；Canvas2D(轻量生成式)。

**移动端适配**：触摸优先（去 hover 依赖，hover→tap/in-view）；WebGL 降粒子数与 DPR；陀螺仪可选；字号 ≥16px、触控区 ≥44px；scroll-snap；首屏轻量；sticky 视情况改静态。

**性能优化**：首屏预算（JS<200KB、LCP<2.5s）；懒加载 + code-split；WebGL 按设备 **tier 分级**；统一 rAF；离屏 `IntersectionObserver` 暂停；纹理压缩；`will-change` 克制；Lighthouse 守门。

**降级方案**：`prefers-reduced-motion` 关动效；无 WebGL → 静态海报/CSS；低端 tier-down；**SSR 首屏内容可读**(SEO + 无 JS 可看)；渐进增强（内容先行、动效后挂）。

---

## 四、yaopulife「中国文化故事出海」互动站方案

**定位**：国际审美 + 东方意境 + 强故事 + 强互动，**不堆中国元素**。先共情，再东方。

**母题（视觉锤，贯穿全站）= 一道朱砂红线 ＝ 命运 / 故事线 / 牵引**（复用我们已有的 Fate Thread）。配「留白即气」「巨幕淡墨汉字」「蒲印」。整个体验是**一条命运之线**把所有神话串起来。

**结构（Scrollytelling 为主 + 轻 Playground 点睛）**
1. **首屏**：暗调留白 + 一道朱砂红线自上垂下 + 巨幕汉字呼吸 + 一句普世钩子（"Everyone wants a name that matters."）+ 牵引/滚动提示。一个动作邀请（顺红线下滑）。
2. **故事卷**：每个神话＝一章 scrollytelling。红线牵引视线，pin+scrub 推进；**我们刚建的扁平立意插画**随滚动 mask-reveal / path-draw 揭幕；Native Note 作"东方注释"轻浮现；情绪节奏静→冲突→代价→余味。
3. **章节转场**：红线收束 → 下一章，全屏朱砂 wipe 或留白呼吸，如**卷轴展开**。
4. **互动点睛（克制·一章一爽点·服务叙事非炫技）**：悟空"销名"时点击划掉名字；嫦娥"奔月"时拖动让她升起；后羿"射日"时拉弓松手熄一个红日。可选 Web Audio 古琴单音（可静音）。
5. **收束**：命运之线汇成一张可探索的**"神话星图"**，CTA 关注/下一章。

**技术**：**SSR 内容先行**（SEO + 海外无 JS 可读，复用现有 Astro 站）→ 渐进增强 GSAP + ScrollTrigger + Lenis；红线 = SVG path-draw（scrub）；立意插画 = 现成 SVG；氛围层用轻量 Canvas/OGL 雾光粒子或纯 CSS。**不重做站，叠一层"体验增强"**；`prefers-reduced-motion` 与无 WebGL 自动降级到当前静态站。

**海外可懂**：先情绪后典故（已有海外化 SOP）；普世母题；英文为体、中文为锤。

**移动端**：触摸顺红线牵引；滚动驱动；减粒子；微互动用 tap；字号/触控区达标；首屏轻。

---

## 五、移动端优化（当前站，先做）
见随附改动：触控区/字号/首屏密度/滚动顺滑/减少 hover 依赖/视觉锤在小屏的呼吸。逐条记录在 commit 与 HANDOFF。
