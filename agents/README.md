# QODER Agent Pipeline - 执行手册

## 一、系统架构

```
用户 → GitHub Actions (定时/手动) → agent-dispatcher.js → 各 Agent 执行脚本
                                            ↓
                                      pipeline-state.json (状态追踪)
                                            ↓
                                      ops/state/ (状态文件)
                                      ops/reports/ (报告)
                                      ops/content/ (内容)
                                      src/content/blog/ (博客文章)
                                      content/social/ (社媒文案)
```

## 二、Agent 角色与分工

| Agent ID | 角色 | 执行频率 | 产出 |
|----------|------|---------|------|
| QODER | 总调度 | 持续 | 任务派发、状态更新、异常处理 |
| S-COPY | 文案撰写 | 每周 | 2篇博客文章 |
| M-SOCIAL | 社媒运营 | 每周 | 10条Pinterest Pin文案 |
| M-EMAIL | 邮件营销 | 每周 | 1封EDM Campaign |
| A-DATA | 数据分析 | 每周 | 周报 |
| R-COMP | 竞品分析 | 每月 | 竞品报告 |
| S-SEO | SEO优化 | 每月 | SEO健康检查 |
| ED-DEVIL | 对抗审查 | 按需 | 风险预警 |

## 三、每周执行流程

### 触发方式 1: GitHub Actions 定时（自动）

```yaml
# 每周一 09:00 北京时间自动运行
- cron: '0 1 * * 1'  # = UTC 01:00 Monday
```

### 触发方式 2: 手动触发

```bash
# 运行全部 Agent
node scripts/agent-dispatcher.js

# 运行指定 Agent
node scripts/agent-dispatcher.js --agent=S-COPY

# 预览将要执行的任务（不实际运行）
node scripts/agent-dispatcher.js --dry-run
```

## 四、各 Agent 详细说明

### S-COPY（文案撰写）
- 生成 2 篇 SEO 博客文章
- 主题从预定义的 12 周内容日历中轮换
- 文章结构: 引言 + 3-5 个 H2 + 产品推荐 + CTA
- 输出到: `src/content/blog/[slug].md`
- 内链: 自动链接到相关产品页

### M-SOCIAL（社媒运营）
- 生成 10 条 Pinterest Pin 文案
- 每周一个主题（礼品/家居/宠物/节日）
- 输出到: `content/social/pinterest/week-[N].md`
- 内容包含: 标题/描述/图片路径/链接/标签

### M-EMAIL（邮件营销）
- 生成 1 封 EDM Campaign 文案
- 包含 2 个主题行候选（A/B 测试）
- 输出到: `content/edm/week-[N].md`

### A-DATA（数据分析）
- 检查 Cloudflare Analytics 数据（如配置）
- 检查 GSC 索引状态
- 生成周报: `ops/reports/[date]_weekly-report.md`
- 更新 pipeline-state.json 的 KPI

### R-COMP（竞品分析）
- 月度运行
- 检查竞品定价、新品、促销活动
- 生成报告: `ops/reports/competitor/[date]_competitor-report.md`

## 五、状态追踪

所有状态存储在 `ops/state/pipeline-state.json`：

```json
{
  "currentStage": "S5",
  "thisWeek": {
    "weekNumber": 2,
    "tasks": {
      "S-COPY": { "status": "pending", "items": [...] }
    }
  },
  "kpis": {
    "weekVisitors": { "value": null, "target": 50 }
  },
  "pendingActions": [...]
}
```

QODER 每次执行后更新此文件。

## 六、GitHub Actions 配置

在 GitHub 仓库设置中需要配置以下 Secrets:

| Secret | 用途 |
|--------|------|
| GH_TOKEN | 自动提交新内容（可选） |
| CF_API_TOKEN | Cloudflare Analytics 读取 |

## 七、运行测试

```bash
# 本地测试 dispatcher
cd yaopulife-site
node scripts/agent-dispatcher.js --dry-run

# 本地运行全部 Agent
node scripts/agent-dispatcher.js

# 查看当前状态
cat ops/state/pipeline-state.json
```

## 八、日志与报告

- Agent 执行日志: 在 GitHub Actions 运行日志中
- 周报: `ops/reports/[date]_weekly-report.md`
- 竞品报告: `ops/reports/competitor/[date]_competitor-report.md`
- 内容产出: `src/content/blog/` + `content/social/`

## 九、异常处理

| 异常 | 处理方式 |
|------|---------|
| GitHub Actions 运行失败 | 检查 Node 版本、npm 依赖 |
| 内容未生成 | 检查文件路径权限 |
| 提交失败 | 手动 git push |

## 十、扩展 Agent

添加新 Agent 方法：
1. 在 `agents/agent-registry.json` 注册新 Agent
2. 在 `scripts/agent-dispatcher.js` 添加执行函数
3. 在 `ops/state/pipeline-state.json` 添加任务配置