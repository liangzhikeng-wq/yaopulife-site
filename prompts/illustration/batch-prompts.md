# 首批批量插画清单 · Batch Index

> 首批 24 张核心资产总览。结构化数据见 `src/config/illustration-prompts.ts`,落库 schema 见 `docs/brand/illustration-metadata-schema.json`。
> 全部走 `master-style.md` 母版 + 各自 series 文件的完整 prompt。

## 生肖 Zodiac(12 · 见 zodiac.md)
| id | 主体 | 核心情绪 | 构图 | 比例 |
|---|---|---|---|---|
| zodiac-rat | 持小卷轴的机敏鼠 | 机敏·自信 | central-character | 4:5 |
| zodiac-ox | 耕线旁歇息的牛 | 耐心·可靠 | one-line-small-world | 4:5 |
| zodiac-tiger | 故作勇敢的圆胖虎 | 勇气带暖 | ink-animal-persona | 4:5 |
| zodiac-rabbit | 望月的白兔 | 温柔·希望 | moon-gate | 4:5 |
| zodiac-dragon | 穿云的友善幼龙 | 神秘·守护 | editorial-story-cover | 4:5 |
| zodiac-snake | 绕竹的优雅小蛇 | 智慧·宁静 | central-character | 4:5 |
| zodiac-horse | 欢跃小跳的马 | 自由·乐观 | one-line-small-world | 4:5 |
| zodiac-goat | 衔梅枝的温和羊 | 善良·平和 | central-character | 4:5 |
| zodiac-monkey | 持桃顽皮猴 | 顽皮·机智 | one-line-small-world | 4:5 |
| zodiac-rooster | 神气又好笑的鸡 | 自信·幽默 | central-character | 4:5 |
| zodiac-dog | 灯笼旁忠犬 | 忠诚·温暖 | editorial-story-cover | 4:5 |
| zodiac-pig | 茶杯旁惬意猪 | 满足·丰足 | central-character | 4:5 |

## 神话 Myths(6 · 见 myths.md)
| id | 主体 | 核心情绪 | 构图 | 比例 |
|---|---|---|---|---|
| myth-sun-wukong | 石生猴立山石望天 | 反抗·命运 | editorial-story-cover | 3:4 |
| myth-change | 背影望满月的月中人 | 思念·孤独 | moon-gate | 3:4 |
| myth-nezha | 坚定而立的神话少年 | 逆命·赤诚 | central-character | 3:4 |
| myth-hou-yi | 射日后垂弓的射手 | 英雄·静伤 | editorial-story-cover | 3:4 |
| myth-white-snake | 桥畔温柔白蛇灵 | 禁忌爱·宿命 | moon-gate | 3:4 |
| myth-shanhaijing | 古景中温和异兽 | 惊奇·神秘 | editorial-story-cover | 3:4 |

## 节日 Festivals(6 · 见 festivals.md)
| id | 主体 | 核心情绪 | 构图 | 比例 |
|---|---|---|---|---|
| festival-mid-autumn | 月下分月饼的小家庭剪影 | 团圆·思念 | moon-gate | 4:5 |
| festival-lunar-new-year | 门旁贴红符的孩子 | 新始·守护 | editorial-story-cover | 4:5 |
| festival-dragon-boat | 静水上龙舟与粽 | 怀念·勇气 | one-line-small-world | 4:5 |
| festival-qingming | 烟雨路上持柳枝者 | 追忆·温柔 | editorial-story-cover | 4:5 |
| festival-lantern | 仰望一盏灯的孩子 | 惊喜·圆满 | central-character | 4:5 |
| festival-qixi | 星河两岸两小身影 | 思念·爱·距离 | editorial-story-cover | 4:5 |

## 用法
1. 取 `src/config/illustration-prompts.ts` 对应条目 → 拼 master-style + 完整 prompt → Claude Design / 本地 ComfyUI 生图。
2. 按 SOP(`yaopu-agent-illustration-workflow.md`)10 项评分,≥9 入库。
3. 元数据按 schema 落 `id/series/topic/subject/emotion/symbols/palette/aspect_ratio/prompt/caption/status`。
