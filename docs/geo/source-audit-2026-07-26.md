# 全站来源相关性复审 — 2026-07-26

方法:33 个内容页逐页提取外部来源,逐条抓取核验「来源讲的是否是同一对象、是否支持正文观点」。
Britannica 全域反爬(403),按 unverifiable 如实标注(经搜索索引/Wayback 旁证实体对口者保留),不当作死链。
chang-e 与 liaozhai 两页由补审完成(结论:全部 keep,见文末)。
本文档为审计证据存档:逐条 reason 全文保留,不做定长截断。

## 处置汇总

| 页面 | 来源 | 判定 | 处置 |
|---|---|---|---|
| fox-spirit | Britannica kitsune | irrelevant(日本狐) | 已删除 |
| fox-spirit | Britannica Fox 姐妹 | irrelevant(美国灵媒,关键词撞车) | 已删除 |
| qixi-festival | Britannica yangbanxi | irrelevant(样板戏「奇袭」≠七夕) | 已替换为 QUB 七夕来源;所倚跑题段一并删除 |
| butterfly-lovers | Wikipedia 协奏曲 | partial(年份出入) | 正文 composed in 1958 → premiered in 1959 |
| chang-e | (正文) | 来源不支持的松散翻译 | 删除 'Beautiful Moon' 释名 |

## 审计后站内变更(2026-07-26 落地)

- fox-spirit:移除 https://www.britannica.com/topic/kitsune 与 https://www.britannica.com/biography/Margaret-Fox-and-Catherine-Fox 两条来源。
- qixi-festival:移除 https://www.britannica.com/art/yangbanxi;新增已核验来源 https://blogs.qub.ac.uk/mandarinchinese/2020/08/24/happy-qixi-festival (Queen's University Belfast Language Centre,抓取核验通过)。
- butterfly-lovers:正文年份修正(premiered in 1959)。
- chang-e:meta description 与正文口径统一为 In one common version of the myth。

## 逐页明细

### changge.astro
- 主实体:Chang'e 嫦娥 — Chinese moon goddess of the Mid-Autumn Festival legend (wife of archer Hou Yi; swallowed the elixir of immortality and flew to the moon; Jade Rabbit; mooncakes/团圆)
- [unverifiable/keep] https://www.britannica.com/topic/Change-Chinese-deity
  - Direct fetch blocked by Cloudflare anti-bot (HTTP 403 'Just a moment...' challenge via both WebFetch and curl with browser UA), so content could not be read firsthand. Not dead: search-engine metadata confirms the URL resolves to Britannica's entry titled "Chang'e | Moon Goddess, Lunar Goddess, Chinese Mythology" — same primary entity (moon goddess, consort Hou Yi, elixir of immortality, Mid-Autumn Festival). Marked unverifiable per honesty rule rather than supports, since I never read the page body directly.
- [supports/keep] https://en.wikipedia.org/wiki/Chang%27e
  - Fetched OK. Same primary entity: Chang'e, moon goddess, wife of Hou Yi, elixir of immortality, ascent to the moon. Explicitly covers both story versions the page relies on (older 'she stole the elixir' vs. 'she swallowed it to keep it from Fengmeng'), the Jade Rabbit, and the Mid-Autumn Festival connection. Not found in this fetch: Queen Mother of the West as elixir source, Wu Gang, mooncake origin specifics — minor gaps; core claims supported.
- [supports/keep] https://en.wikipedia.org/wiki/Hou_Yi
  - Fetched OK. Same story-world entity the page cites him for: Hou Yi the archer who shot down the extra suns, husband of Chang'e, gifted the pill of immortality, after which Chang'e ate it and flew to the moon; mentions Chang'e being honored at the Mid-Autumn Festival. Supports the page's ten-suns and elixir claims. Note: article says elixir was 'gifted by the gods' without naming the Queen Mother of the West specifically.
- 备注:No irrelevant or dead sources found; no replacements needed. The Britannica link is behind Cloudflare bot protection — normal human visitors will load it fine, and third-party metadata (search result title and EBSCO/other mirrors of the topic) confirms it is the correct Chang'e (Chinese deity) entry, so keeping it is low-risk despite the unverifiable verdict. One content nuance: the search snippet of Britannica's entry tells the 'she stole the drug of immortality' version, while the page foregrounds the gentler protective version — the page already discloses this variance in its 'Did Chang'e steal the elixir?' FAQ and Sources disclaimer, so no conflict. The page's specific claim that the elixir came from the Queen Mother of the West was not confirmed by either fetched Wikipedia article (Hou Yi article says 'gifted by the gods'); it is a common folk variant, but none of the three cited sources was verified to state it.

### explainers/butterfly-lovers.astro
- 主实体:中国民间传说《梁祝》/ Butterfly Lovers（梁山伯与祝英台，Liáng Zhù）
- [supports/keep] https://en.wikipedia.org/wiki/Butterfly_Lovers
  - 已抓取。词条正是梁祝传说本体：祝英台女扮男装求学、与梁山伯相恋、被许配马文才、梁病亡、祝跳入裂开的坟墓、双双化蝶，并明确提到'中国的罗密欧与朱丽叶'称呼、地区变体和各类改编（含1958年立项的小提琴协奏曲）。覆盖页面核心观点。
- [supports/keep] https://sites.gatech.edu/china-cultural-odyssey/2025/04/15/the-butterfly-lovers-chinese-romeo-juliet/
  - 已抓取。讲的就是梁祝传说及其与《罗密欧与朱丽叶》的对比：女扮男装求学、错许他人、殉情化蝶、爱情超越死亡等主题，另有1963年《梁山伯与祝英台》电影改编分析。支持页面'中国的罗密欧与朱丽叶'一节的观点。注意它是 Georgia Tech 课程学生博客，权威性一般但主题完全对口。
- [partial/keep] https://en.wikipedia.org/wiki/Butterfly_Lovers%27_Violin_Concerto
  - 已抓取。同一传说的协奏曲改编词条，证实中西融合（五声音阶、模仿二胡/琵琶音色、越剧元素、西方协奏曲结构）与叙事对应梁祝故事。但该词条称作品写于1959年（1958年只是发起该创作项目、1959-05-27首演），页面正文写'composed in 1958'，日期这一点与该来源不完全吻合。
- [unverifiable/keep] https://www.britannica.com/topic/Madama-Butterfly
  - WebFetch 两次和 curl（浏览器 UA）均返回 HTTP 403，属 Britannica 反爬拦截，抓不到正文，无法核验内容；403 是拦截而非证明词条不存在，故不标 dead。另注：该引用本就指向另一部作品《蝴蝶夫人》，是页面'Clearing Up Common Confusions'一节刻意用来做区分澄清的，不属于错配来源。
- 备注:页面核心事实观点：(1) 梁祝故事主线（女扮男装求学、相恋、错许、殉情、化蝶）；(2) 常被称'中国的罗密欧与朱丽叶'但文化主题不同；(3) 有多种改编，尤其小提琴协奏曲（页面称1958年作曲，中西音乐融合）；(4) 澄清与普契尼《蝴蝶夫人》无关、且非确证历史。内容侧发现一处待修：Wikipedia 协奏曲词条记载作品写于1959年（1958年为项目发起年），页面 butterfly-lovers.astro:56 写'composed in 1958'，建议改为'composed in 1958–59'或'premiered in 1959'。Britannica 链接因403反爬无法核验，未按 dead 处理、也未编造替代来源；如需可另找可抓取的权威《蝴蝶夫人》词条替换，但本次未核验任何替代 URL，故不给 replace。

### explainers/chinese-calligraphy-vs-painting.astro
- 主实体:中国书法（书法 shūfǎ）——写汉字的艺术，及其与中国画的区别。
- [supports/keep] https://www.britannica.com/art/Chinese-calligraphy
  - 直接 WebFetch 与 curl 均被 Cloudflare 反爬拦截（403），但通过该 URL 的 Wayback 快照（20260513011312，HTTP 200）核验了实际内容：词条定义书法为 'the stylized artistic writing of Chinese characters'，明确说 'calligraphy is considered supreme among the visual arts in China, it sets the standard by which Chinese painting is judged. Indeed, the two arts are closely related'，并详述隶书等书体。命中页面的核心观点（书法与画的关系、书法为衡量中国画的标准、书体演变）。链接本身是活的（拦截页非死链，近期快照为 200）。
- [supports/keep] https://www.metmuseum.org/essays/chinese-calligraphy
  - 直接 WebFetch 与 curl 均被限流/反爬拦截（429，返回 blocked 页），但通过该 URL 的 Wayback 快照（20260510062438，HTTP 200）核验了实际内容：Met 论文说 'Calligraphy, or the art of writing, was the visual art form prized above all others in traditional China'，书画同源共用笔墨、书法先于绘画被尊为 fine art，并覆盖 seal/clerical(lishu)/running(xingshu)/cursive(caoshu)/standard(kaishu) 五种书体。全面支持页面观点。链接本身是活的（近期快照为 200）。
- [supports/keep] https://en.wikipedia.org/wiki/Chinese_calligraphy
  - WebFetch 实抓成功。词条讲的正是中国书法：书法与水墨画'closely related…similar tools and techniques'（同笔墨）、书法关乎修身养性与人格外显（对应'见字如见人'与高艺术地位的观点）、并完整覆盖篆/隶/楷/行/草五体。支持页面全部核心观点。
- 备注:页面外部链接仅 Sources 区 3 条（yaopulife-site 页面 line 93-95）；正文与 Related reading 均为站内链接，已按要求忽略。核验方法说明（诚实披露）：Britannica 与 Met 两个域名对本机直接抓取全程反爬（分别 403 Cloudflare 质询页、429 blocked 页，curl 换 UA 亦同），无法以活页抓取核验；改用 Wayback Machine 对同一 URL 的 2026-05 快照核验实际内容，两者内容均完整命中主实体与页面观点，且 availability API 显示近期快照状态 200，故判 supports 而非 unverifiable/dead。若审计标准严格要求"仅认活页直抓"，这两条应降级为 unverifiable（但内容证据已如上留存于快照）。三条均无需替换或删除。

### explainers/chinese-gods-vs-western-gods.astro
- 主实体:中国神祇概念（神 shén）——中国神作为天庭官僚体系中的"官员"（可升降职、凡人可封神、玉帝为最高行政者而非造物主），与西方/亚伯拉罕/希腊神观的对比。
- [supports/keep] https://en.wikipedia.org/wiki/Chinese_gods_and_immortals
  - 已抓取。词条讲的正是中国神祇与仙人：明确覆盖天庭等级体系（gods organised in a complex celestial hierarchy）、凡人因功德成神（many gods are ancestors or men who became deities，含关羽被神格化）、玉帝为天的拟人化代表而非唯一造物主、道释民间三教神祇混同、各司其职的职能神（火神/河神/财神等）。与页面全部核心观点吻合。
- [supports/keep] https://en.wikipedia.org/wiki/Chinese_mythology
  - 已抓取。词条覆盖天界如人间官府的等级政府（hierarchical government run by a supreme emperor）、关帝等历史人物封神、玉帝为天界统治者而非造物主、儒释道与民间信仰的融合、灶神/城隍/气象神等职能域神。支持页面引用它的所有观点。
- 备注:页面外部链接仅 Sources 区块的两条 Wikipedia 链接（chinese-gods-vs-western-gods.astro:72-73）；正文无内嵌外部引用，Related reading 全为站内相对链接，已按要求忽略。两条来源均实际用 WebFetch 抓取核验，均判 supports，无需替换或删除。

### explainers/dragon-boat-festival.astro
- 主实体:中国端午节 Dragon Boat Festival (Duānwǔ Jié / Double Fifth)
- [supports/keep] https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/videos/dragon-boat-festival/
  - WebFetch 抓取成功。Smithsonian 国立亚洲艺术博物馆页面，正是讲端午节：确认五月初五/Double Fifth、屈原投江与村民划船施救的赛龙舟起源、粽子（糯米裹竹叶）、雄黄酒与五彩丝线等驱邪防病习俗、2000+ 年历史。未提汨罗江与投米细节，但该细节由 Smithsonian Magazine 来源覆盖。
- [supports/keep] https://www.smithsonianmag.com/arts-culture/the-legends-behind-the-dragon-boat-festival-135634582/
  - WebFetch 抓取成功。Smithsonian Magazine 文章全面覆盖页面核心观点：屈原公元前 278 年投汨罗江、村民投米防鱼食其身并演化为粽子、赛龙舟在公元 5-6 世纪才与屈原传说挂钩（早于传说已存在）、五月初五日期、仲夏不吉时节的护佑性起源。与页面 'Legend of Qu Yuan' 一节逐点对应。
- [unverifiable/keep] https://www.britannica.com/topic/Dragon-Boat-Festival
  - 直接抓取失败：WebFetch 与带浏览器 UA 的 curl 均返回 403（Britannica 反爬），Wayback 在本环境被禁。未能亲抓正文，如实标 unverifiable。旁证（WebSearch 索引）显示该 URL 现存、标题与页面锚文本一致，摘要涉及 Duanwu/Double Fifth、五月初五、屈原、粽子、至少 1500 年历史——与主实体和页面观点吻合，且是权威词条，故建议保留而非删除。
- [unverifiable/keep] https://www.britannica.com/video/dragon-boating-introduction-boat-sport-team-paddlers/-219569
  - 直接抓取失败：WebFetch 与带浏览器 UA 的 curl 均返回 403（Britannica 反爬）。未能亲抓，如实标 unverifiable。旁证（WebSearch 索引）显示该视频页现存、标题一致，摘要描述龙舟为多至 20 名桨手加鼓手同步的团队划桨运动——正对应页面 'Dragon Boat Racing' 一节的观点，故建议保留。
- 备注:页面核心事实性观点：端午节为农历五月初五的中国传统节日（又称 Double Fifth），2000+ 年历史；习俗为赛龙舟（龙头龙尾长船、多人划桨、鼓手控节奏）和吃粽子；常见起源传说为屈原投汨罗江、村民划船施救并投米防鱼（粽子由来）；学者认为赛龙舟早于屈原传说（传说约公元 5-6 世纪才附会），更古老根源是仲夏驱病避邪仪式（挂艾草菖蒲、饮雄黄酒、佩香囊），至少 1500 年前。核验方法：4 个外链全部尝试 WebFetch；两个 Smithsonian 来源抓取成功且均支持页面观点；两个 Britannica 来源被反爬 403 挡住（WebFetch、浏览器 UA curl 均 403，web.archive.org 在本环境被禁止抓取），按规则如实标 unverifiable 不猜测——但 WebSearch 索引旁证两个 URL 现存且讲同一主实体，非死链非跑题，无需替换或删除。站内链接（yaopulife.com 相对路径）按要求忽略。无 irrelevant/dead 来源，未提出任何 replace。本审计只读，未修改任何文件。

### explainers/erlang-shen.astro
- 主实体:中国二郎神 Erlang Shen（三眼战神/水神，含李二郎、杨戬变体，哮天犬，三尖两刃枪，西游记大战孙悟空）
- [supports/keep] https://en.wikipedia.org/wiki/Erlang_Shen
  - WebFetch 抓取成功。词条即讲 Erlang Shen 本尊，逐点覆盖页面全部核心观点：第三只真视之眼；李二郎（李冰之子、都江堰/斩蛟治水）与杨戬两种身份变体；哮天犬 Xiaotian Quan；三尖两刃枪；水患治理；西游记中与孙悟空斗法、借哮天犬咬腿协助擒获美猴王。
- [unverifiable/keep] https://www.britannica.com/topic/Sun-Wukong
  - 反爬拦截抓不到内容：WebFetch 返回 HTTP 403，curl 带浏览器 UA 亦 403，本会话浏览器面板不可用（安全分类器暂时下线，重试两次失败）。未抓到不敢标 supports。附注：仅从标题看该词条主语是孙悟空而非二郎神，页面引它是为背书'西游记大战'一节，属相邻实体引用；建议下次会话用浏览器实抓复核后再定去留。
- 备注:页面仅 Sources 区块两条外链（erlang-shen.astro:72-73），正文无内嵌外部引用，站内链接已忽略。Wikipedia 一条实抓核验通过，六个核心事实点全部命中。Britannica 一条被 403 反爬墙挡住（WebFetch + curl 双路径均 403，浏览器面板因分类器不可用无法兜底），按诚实原则标 unverifiable 而非猜测；因非 irrelevant/dead，未强制替换。风险提示：该 Britannica 链接标题显示为 Sun Wukong 词条，非主实体 Erlang Shen 本尊，若后续实抓确认其未提及二郎神擒猴情节，宜替换为 Britannica 或 World History Encyclopedia 的 Erlang/JTTW 相关词条（需实抓核验后再换，本次未编造替代 URL）。

### explainers/fox-spirit.astro
- 主实体:中国狐狸精 huli jing（Chinese fox spirit）——核心观点：能修炼化形（美女/老者/书生）、善恶皆有、吸收精气/灵气修行、与日本 kitsune 是不同传统、现代俚语被贬义化为"狐狸精=小三"
- [supports/keep] https://en.wikipedia.org/wiki/Huli_jing
  - WebFetch 抓取成功。词条正是讲中国狐狸精：化形为美女/男子/灵媒、善恶皆可、吸食精气与修炼成天狐，与页面第1、2节核心观点一致；kitsune 仅在 See also 提及。未覆盖现代俚语一点，但该点由另一条来源覆盖。
- [partial/keep] https://en.wikipedia.org/wiki/Foxes_in_popular_culture
  - WebFetch 抓取成功。是全球狐狸文化总览而非狐狸精专文，但明确覆盖：狐狸作为狡猾/trickster 的全球原型、欧洲列那狐等民间故事、东亚 huli jing 与 kitsune 化形诱人、以及现代中文里 huli jing 贬指婚外情第三者——正好支撑页面第3节与第4节俚语观点。
- [irrelevant/remove] https://www.britannica.com/topic/kitsune
  - 内容抓取被 Britannica 反爬拦截（HTTP 403），但词条主题由 URL 与标题即可确定：日本 kitsune，属别国同类概念，不是本页主实体中国狐狸精。按本次审计口径判 irrelevant。细微处：它确实能佐证页面第2节/FAQ2 里关于 kitsune（神道神社、稻荷、神使）的对比句，是否保留作对比来源可由上游裁量。未找到可核验的同主实体权威替代（Britannica 无 huli jing 词条，WHE 无相关文章），故建议 remove。
- [irrelevant/remove] https://www.britannica.com/biography/Margaret-Fox-and-Catherine-Fox
  - 内容抓取被 Britannica 反爬拦截（HTTP 403），但词条主题由 URL 与锚文本即可确定：Fox 姐妹，19世纪美国通灵术士（spiritualist mediums），系 "fox"+"spirit(ualist)" 关键词撞车导致的错误引用，与中国狐狸精毫无关系。替代来源核验全部失败：Britannica 无 huli jing 词条；World History Encyclopedia 无狐狸精文章（仅一篇小说书评）；folklore.usc.edu 整站超时；Muhlenberg 大学开放教材章节 403；OhioLINK 论文抓到并阅读后确认是创意写作多文体论文（诗歌/戏仿/闪小说），不适合作权威引用。故不给未核验的 replace，建议 remove；页面核心观点仍有 Wikipedia Huli jing 词条支撑。
- 备注:核验方法与诚实声明：两条 Wikipedia 来源均经 WebFetch 实抓并核对内容。两条 Britannica 来源内容抓取均被 403 反爬拦截（浏览器工具本次会话持续不可用），其 irrelevant 判定不基于猜测内容，而基于词条身份本身（URL slug + 锚文本标题）即可确定主题为"日本 kitsune"和"美国通灵 Fox 姐妹"，均非本页主实体；若上游要求严格按"抓不到即 unverifiable"处理，这两条可降级为 unverifiable，但那会漏掉 Fox 姐妹这条明显的错误引用。替代来源搜索已尽力：Britannica 无 huli jing 词条；World History Encyclopedia 无对应文章；USC 民俗档案（.edu）整站超时；Muhlenberg 开放教材 403（未伪装 UA 绕过反爬）；OhioLINK 论文已实抓阅读、确认不适格。因此无 replacement_verified=true 的替代可给，两条问题链接均建议 remove。移除 kitsune 来源后，页面第2节与 FAQ2 的 kitsune 对比句将失去直接引用，建议后续找到可访问的权威对比来源（如可从浏览器访问 Britannica kitsune 时）再补。站内链接（yaopulife.com 相对路径）按要求忽略；正文无其他外链，全部外链集中在 Sources 区块。

### explainers/is-the-story-of-mulan-real.astro
- 主实体:中国花木兰 Hua Mulan（《木兰辞》传说女英雄）
- [unverifiable/keep] https://www.britannica.com/biography/Hua-Mulan
  - 直接抓取被反爬拦截：WebFetch 与带浏览器 UA 的 curl 均返回 HTTP 403（Britannica 惯常 bot 屏蔽），未能读到页面正文，故按诚实原则不标 supports。但限定 britannica.com 域的搜索确认该 URL 存活，标题为 'Hua Mulan | Plot, Ballad, History, & Legacy | Britannica'，索引摘要与页面主实体及核心观点一致（传说女英雄、女扮男装替父从军、《木兰辞》、最早版本存于宋代《乐府诗集》、1998 迪士尼电影）。非死链、非异实体，无需替换。
- [supports/keep] https://en.wikipedia.org/wiki/Hua_Mulan
  - 已实际抓取。词条讲的正是同一主实体花木兰，且逐条支持页面核心观点：学界普遍视其为虚构人物、史料无载（'Scholars generally consider Mulan to be a fictional character'）；《木兰辞》约作于北魏（北朝）；现存最早文本出自宋代郭茂倩编《乐府诗集》（11-12 世纪）；女扮男装替年迈父亲从军、从军多年后归家；核心是孝道；迪士尼 1998 动画与 2020 真人版均为改编。与页面 Sources 区块注明的引用点（'on her legendary, unconfirmed historicity'）完全吻合。
- 备注:页面外部链接仅 Sources 区块两条（page 94-95 行）；正文无其他外链，站内链接（/nezha、/wukong、/myths 等）与 og:image、schema.org 上下文均按要求忽略。页面核心事实性观点：木兰为传说/文学人物、历史真实性未证实；故事源自北朝《木兰辞》；最早传世版本存于宋代选集；替父从军体现孝道；电影为改编非史源。Wikipedia 全部覆盖并支持。Britannica 因 403 反爬无法直接核验正文，但搜索证据（URL 存活、标题与摘要匹配同一主实体）表明它是正确词条，建议保留；无 irrelevant/dead 项，故无 replace/remove 处置。尝试用浏览器面板真实加载 Britannica 页面失败（本会话浏览器工具不可用），如需 100% 核验可人工打开该 URL 复核。

### explainers/nuwa.astro
- 主实体:中国神话创世女神女娲（Nüwa / Nu Gua, 女娲）
- [supports/keep] https://en.wikipedia.org/wiki/N%C3%BCwa
  - Live fetch succeeded. Article is about the same entity and covers nearly all page claims: hand-molding humans from yellow clay, the rope/string-through-mud method (with the commoner-class variant), patching the sky with five-colored stones, cutting the great turtle's legs as pillars, Fu Xi as sister-and-wife plus inventing marriage, snake-bodied depictions, and her status as a goddess in Chinese folk religion, Buddhism, Confucianism and Taoism. Only the exact 'patroness of matchmakers' phrasing is not present (covered by the Britannica source instead).
- [partial/keep] https://www.britannica.com/topic/Nu-Gua
  - Live URL returns HTTP 403 to both WebFetch and curl (Britannica anti-bot; not a dead link — the entry exists and the title matches the anchor). Content verified via a 2025 Wayback Machine snapshot of this exact URL: entry is about the same entity (Nu Gua, Chinese mythology) and confirms patroness of matchmakers, wife/sister of Fu Xi + marriage norms with go-betweens, human head with snake body, and repairing the pillars of heaven using tortoise feet and melted five-coloured stones. It does not cover the clay creation of humanity, so partial rather than full support.
- [partial/keep] https://folklore.usc.edu/nuwas-creation-of-humanity-chinese-myth/
  - Live host folklore.usc.edu is unreachable from this network (DNS resolves to 68.181.13.155 but connections time out on both the article URL and the site root — no HTTP status returned, so not confirmably dead). Content verified via a 2025 Wayback Machine snapshot of this exact URL: USC Digital Folklore Archives entry about the same entity, covering yellow-clay molding of the first humans, the string-dragged-through-mud shortcut, the noble-vs-commoner class variant, sky patching, and the Prometheus clay parallel. It does not cover Fu Xi, matchmakers, serpent symbolism, or religious worship, so partial. Liveness should be rechecked from another network before deciding to remove.
- 备注:Only 3 external links exist, all in the Sources block; body text has no external inline citations (Gaia/Prometheus/Fu Xi mentions are unlinked, yaopulife.com internal links ignored). No source is irrelevant — all three are about Nüwa herself, no kitsune/opera/same-name confusion. No replacements proposed. Two caveats: (1) Britannica blocks non-browser clients with 403, so automated link checkers will flag it as broken even though it is fine in a real browser; (2) folklore.usc.edu timed out entirely from this (China-side) network at audit time — content was verified only via a 2025 Wayback snapshot, so if it also fails from a US network over multiple days, consider swapping it for an archive.org permalink of the same page.

### explainers/qin-shi-huang.astro
- 主实体:秦始皇 Qin Shi Huang（嬴政，秦朝开国皇帝、公元前221年首次统一中国的第一位皇帝）
- [unverifiable/keep] https://www.britannica.com/summary/Qin-Shi-Huang
  - WebFetch 抓取返回 HTTP 403；连同 britannica.com/biography/Qin-Shi-Huang 也是 403，属 Britannica 站点级反爬拦截，不是该 URL 独有问题。无法确认页面内容，如实标 unverifiable，不猜测其是否支持页面观点。词条主题名（Qin Shi Huang / Shihuangdi）与主实体一致。
- [supports/keep] https://en.wikipedia.org/wiki/Qin_Shi_Huang
  - 抓取成功。词条就是秦始皇本人，覆盖页面全部核心观点：本名嬴政、李斯辅佐、前230-221年灭六国统一、自创 huangdi 帝号、统一文字/度量衡/车轨、修长城、行法家、焚书坑儒之争、求长生不老、兵马俑陵墓。
- [partial/keep] https://scalar.usc.edu/works/terracotta-army/life-and-death-of-the-first-emperor
  - 抓取成功。同一主实体（秦始皇），USC scalar 兵马俑专题页，覆盖页面部分观点：统一成就、严苛统治与多疑、焚书（留医药与长生类）、坑杀460儒生、求长生（汞中毒致死说）、兵马俑与陵墓。但不涉及 huangdi 帝号来源、度量衡/文字标准化细节、与奥古斯都的类比。
- 备注:页面核心事实观点：嬴政在李斯辅佐下于前221年统一中国；自创皇帝(huangdi)称号自号始皇帝；统一文字、度量衡、车轨；连接旧防御工事成早期长城；以法家严刑治国、焚书杀儒；痴迷长生，建兵马俑护卫陵墓。三个外链全部在 Sources 区块，正文无内嵌外链，站内链接已按要求忽略。无 irrelevant/dead 判定，故无需 replace/remove；Britannica 因反爬无法核验，未编造替代来源。本次为只读审计，未修改任何文件。

### explainers/qixi-festival.astro
- 主实体:Qixi Festival (七夕, Double Seventh Festival, "Chinese Valentine's Day")
- [supports/keep] https://en.wikipedia.org/wiki/Qixi_Festival
  - Fetched and verified. The article covers all core claims of the page: 7th day of 7th lunar month date, Niulang/Zhinü legend with Milky Way separation and magpie bridge, qiqiao needle-threading customs, the 'Chinese Valentine's Day' framing, and the Altair/Vega star association.
- [irrelevant/replace] https://www.britannica.com/art/yangbanxi
  - Direct fetch is 403-blocked by Britannica anti-bot (both WebFetch and curl with browser UA), so content could not be read; but the entity mismatch is decisive from the citation itself: the entry (slug /art/yangbanxi, title 'Yangbanxi | Revolutionary Opera, Propaganda, Mao Zedong') is about Cultural Revolution model operas, not the Qixi Festival. It only props up the page's 'Linguistic Footprint' section about the opera 'Qixi baihutuan' (奇袭白虎团) — where 'qixi' is 奇袭 'surprise attack', different characters entirely, unrelated to 七夕. This is the same-name-different-entity/unrelated-opera category and cannot support the page's subject.
- 备注:Replacement verification detail: I fetched the QUB page via WebFetch and confirmed it is about the same primary entity — Qixi as Chinese Valentine's Day on the 7th day of the 7th lunar month, the Niulang/Zhinü reunion legend, Han dynasty origins, and girls demonstrating needlework/weaving skills. It is university-hosted (.ac.uk) but shallow (a language-centre blog post). Stronger candidates were all fetch-blocked and therefore could NOT be proposed per the verification rule: Britannica's own Qixi entry (https://www.britannica.com/topic/Qixi-Festival, HTTP 403), Harvard ChinaX Double Seventh page (HTTP 403), Smithsonian NMAA 'Goddess of Seventh Night' object page (HTTP 403). World History Encyclopedia has no Qixi/Zhinü article per site-restricted search. A verified same-entity alternative on an already-used domain is Wikipedia's 'The Cowherd and the Weaver Girl' (https://en.wikipedia.org/wiki/The_Cowherd_and_the_Weaver_Girl), if domain diversity is not required. Separate content issue: if the yangbanxi citation goes, the 'Linguistic Footprint' section (qixi-festival.astro:57) loses its only backing, and its claim is misleading regardless — the opera's 'Qixi' is 奇袭 (surprise attack), not a lunar-date reference as the paragraph speculates; consider cutting that section.

### explainers/three-kingdoms.astro
- 主实体:中国三国时期 (Three Kingdoms / Sān Guó, 220–280 AD: 曹魏、蜀汉、东吴) 及《三国演义》文化影响。
- [supports/keep] https://en.wikipedia.org/wiki/Three_Kingdoms
  - WebFetch 成功。词条即中国三国 (220–280 AD)，覆盖汉亡后魏/蜀汉/吴三分、曹操、孙权 (229 年称帝建吴)、罗贯中《三国演义》为最著名文学改编——与页面核心事实全部吻合。
- [supports/keep] https://www.britannica.com/biography/Cao-Cao
  - WebFetch 直接抓取返回 403 (Britannica 反爬)，改用 WebSearch 取回该词条正文核验：确认曹操为汉末最伟大的将领之一、其领地即魏国、在 14 世纪《三国演义》中被塑造成奸雄反派——正是页面引用它支撑的观点 (历史上的军事/行政才能 vs 小说中的反派形象)。页面另称其为诗人，取回的正文片段未明确提及，但主引用点已证实。
- [supports/keep] https://sunypress.edu/Books/T/Three-Kingdoms-and-Chinese-Culture
  - WebFetch 成功。SUNY 出版社学术论文集页面，主题就是《三国演义》及其在中国和东亚的文化影响 (戏剧、艺术、现代影视游戏)，明言小说对中国人日常行为乃至语言有深远影响——支撑页面'文学史诗与文化神话'一节的观点。
- [supports/keep] https://www.britannica.com/topic/Three-Kingdoms-period
  - WebFetch 直接抓取返回 403 (反爬)，改用 WebSearch 取回该词条正文核验：内容为朝鲜三国 (约 57 BCE–668 CE，新罗/高句丽/百济，668 年新罗统一)。虽是与主实体不同的实体，但该引用是页面刻意为'易混淆点：韩国的三国时期'一节所加，锚文本也如实标注 Korea——取回的年代与三国名与页面该节陈述完全一致，属正确且必要的对照引用，不是误引。
- 备注:4 个外部链接全部核验，全部 keep，无需 remove/replace。方法说明：两个 Britannica 链接直接 WebFetch 均 403 (Britannica 常规反爬，非死链——搜索索引确认页面存活)，通过 WebSearch 取回了两条词条的实际正文并逐点比对，未做任何猜测；如审计标准要求'仅认直接抓取'，可将这两条降级为 unverifiable，但处置仍是 keep。判断说明：第 4 条 (Britannica 朝鲜三国词条) 按字面规则可被判 irrelevant (非主实体)，但它是页面'Korea's Three Kingdoms 易混淆'章节的定向引用且内容完全支撑该节事实 (57 BCE–668 CE、新罗/高句丽/百济)，删除反而会让该节失去出处，故判 supports/keep。顺带发现 (超出来源审计范围)：three-kingdoms.astro:47 正文里 *Romance of the Three Kingdoms* 用了 Markdown 星号，在 Astro HTML 中会按字面渲染星号而非斜体。

### explainers/what-is-a-yao.astro
- 主实体:中国民间信仰中的妖 (yāo / yaoguai)——由动物、植物或器物经长期修炼获得力量并常化人形的精怪类别。
- [supports/keep] https://en.wikipedia.org/wiki/Yaoguai
  - WebFetch 实抓确认：词条主题即妖/妖怪，明确说 'demon' 这个流行译法 'can be very misleading'，覆盖长期修炼/吸收精气化人形（含白蛇、狐妖例子），并专章区分妖/鬼(gui)/魔(mo)/怪(guai)——与页面核心观点逐条对应。唯一弱点：词条对妖的道德中立性只部分覆盖（承认妖 'capable of sympathy, love, repentance' 但更强调危险性），不影响整体支持判定。
- [partial/keep] https://en.wikipedia.org/wiki/List_of_supernatural_beings_in_Chinese_folklore
  - WebFetch 实抓确认：页面存在且正常，是中国民间超自然存在列表，含狐狸精（'through spiritual cultivation, of assuming human form'）、蛇妖/白娘子（白蛇传主角）等条目，支持页面举例部分。但只部分覆盖核心论点：该列表自述收录的是 'inherently evil or tend towards malevolence' 的存在，与页面'妖在道德上开放、可为英雄'的中心观点不完全一致，也不涉及'demon 是误译'的翻译论证。同一主实体领域，故为 partial 而非 irrelevant。
- 备注:两个外部来源均为 Sources 区块链接，正文无其他外部域名链接（/whitesnake、/shanhaijing、/myths、/explainers/* 均为站内）。两条均实抓核验，无需替换或删除。次要观察（非本次审计范围）：List 来源的自我定位偏'恶性存在'，若日后想让来源与'妖非恶'论点更贴合，可考虑补一个讲狐狸精/白蛇的正面权威来源，但现状不构成 irrelevant。

### explainers/what-is-heaven-in-chinese-mythology.astro
- 主实体:中国神话中的"天/天庭"（Tian / the Heavenly Court）——天作为天空、宇宙秩序与神圣朝廷的多义概念；核心观点：天庭是玉皇大帝统领的天界官僚体系而非死后天堂，天命(Mandate of Heaven)将天与人间统治合法性绑定，众神如官员可升降赏罚，亡者归地府另一套系统管辖。
- [unverifiable/keep] https://www.britannica.com/topic/tian
  - WebFetch 两次均返回 HTTP 403（Britannica 反爬拦截），无法取得正文内容核验。该 URL 路径 /topic/tian 与页面主实体（中国天的概念）在字面上对应，但未实际读到内容，按诚实原则标 unverifiable，不猜测 supports。
- [partial/keep] https://en.wikipedia.org/wiki/Tian
  - 抓取成功，讲的正是同一主实体（中国的天 Tian）。支持页面多数观点：天的多义性（天空/宇宙秩序/至上神）、天命 Tianming 作为王朝合法性来源、天子与治理的关系、玉皇大帝作为至上神的称呼、天与死后/仙界的关系。但对页面核心论点'天庭是一套有品级衙门的天界官僚体系'仅零星提及（Jade Emperor 出现但无详细 celestial bureaucracy 论述），故为 partial 而非完全 supports。
- 备注:页面仅 Sources 区块有 2 个外部链接（均带 rel=nofollow），正文无其他外域内嵌引用；站内链接（/wukong、/myths、/explainers/why-chinese-dragons-are-not-evil 等）按要求忽略。Britannica 链接为反爬 403 而非确认死链，按任务定义归 unverifiable（抓不到），不属于 irrelevant/dead，故不给 replace/remove 处置；若后续需要人工确认，可在浏览器手动打开 https://www.britannica.com/topic/tian 验证词条是否存在且讲中国之'天'。另注：页面'celestial bureaucracy/天庭官僚体系'这一核心论点目前两个来源都未强支撑，若要加固可考虑补充讲中国民间宗教官僚神系的权威来源，但本次审计未抓取核验任何候选替代 URL，故不在 sources 中给出未核验的替代链接。

### explainers/what-is-journey-to-the-west.astro
- 主实体:中国明代小说《西游记》(Journey to the West / Xiyouji)
- [unverifiable/keep] https://www.britannica.com/topic/Journey-to-the-West
  - WebFetch 与带浏览器 UA 的 curl 均返回 403（Britannica 反爬拦截，拦在路由之前，403 不能证明页面死或活）。无法读取内容，不能确认该 URL 是否为《西游记》正确词条（Britannica 该小说词条常见规范 URL 是 /topic/Xiyouji，但这一点同样未核验）。诚实标注为抓不到。
- [unverifiable/keep] https://www.britannica.com/biography/Wu-Chengen
  - 同样被 Britannica 403 反爬拦截（WebFetch 与 curl 均 403），无法读取内容，无法确认词条是否存在及是否覆盖'署名有争议'这一观点。诚实标注为抓不到，不猜测。
- [supports/keep] https://en.wikipedia.org/wiki/Journey_to_the_West
  - 抓取成功，讲的正是明代小说《西游记》，且支持页面全部核心观点：吴承恩为传统署名但有争议（材料源自民间故事）、现存最早刻本为1592年、四位取经人（唐三藏/孙悟空/猪八戒/沙悟净）及英译名 Tripitaka/Pigsy/Sandy 等、以及玄奘公元7世纪赴印度取经的真实历史原型（小说为其虚构化）。
- 备注:页面核心事实观点：①明代白话小说，非宗教经典；②唐三藏率孙悟空/猪八戒/沙悟净西行取经；③传统署名吴承恩但有争议、初版匿名、20世纪初才由文本分析论证署名；④现存最早版本1592年；⑤松散取材于真实取经僧（玄奘）的历史行程；⑥英译人名随译本变化（Tripitaka/Monkey/Pigsy/Sandy）。外部链接共3个，全在 Sources 区块；正文内嵌链接（/wukong、/nezha、/myths、/explainers/...）均为站内，已按要求忽略。两条 Britannica 链接因反爬 403 无法核验——403 是站点级拦截而非针对具体路径的 404，故不判 dead；未提供 replace，因为我没有实际抓通任何替代 URL（包括疑似规范词条 britannica.com/topic/Xiyouji），按规则不编造。建议人工浏览器确认这两条 Britannica URL 是否正确落到对应词条。

### explainers/what-is-the-mid-autumn-festival.astro
- 主实体:中秋节 Mid-Autumn Festival (Zhongqiu Jie / Moon Festival) — Chinese reunion festival on the 15th day of the 8th lunar month, with full-moon symbolism, mooncakes, and the Chang'e legend。
- [unverifiable/keep] https://www.britannica.com/topic/Zhongqiu-Jie
  - Direct fetch blocked: WebFetch and curl both got HTTP 403; Britannica 403s ALL automated requests from this environment (homepage and a fake URL also 403), so this is blanket anti-bot, not a dead link. WebSearch corroborates the entry exists at exactly this URL with title 'Zhongqiu Jie | Chinese festival | Britannica', and search snippets match the page's claims (15th day of 8th lunar month, family reunion, moon gazing, mooncakes, Chang'e). Not marked supports because the page content itself could not be fetched.
- [unverifiable/keep] https://www.britannica.com/topic/moon-cake
  - Direct fetch blocked: HTTP 403 from Britannica's blanket anti-bot (same 403 for homepage and nonexistent URLs, so status code is uninformative). WebSearch corroborates the entry exists at exactly this URL with title 'Mooncake | Meaning, Recipe, Mold, & Moon Festival | Britannica', and snippets align with the page's mooncake claims (round pastry, lotus-seed paste filling, gifting, tie to the Moon Festival). Not marked supports because the page content itself could not be fetched.
- [supports/keep] https://en.wikipedia.org/wiki/Mid-Autumn_Festival
  - Fetched successfully. Substantive Wikipedia article on the same primary entity. Confirms the page's core claims: 15th day of 8th lunar month, family reunion as the festival's central meaning, moon viewing/worship, round mooncakes symbolizing completeness and family unity, and the Chang'e legend explicitly presented in two differing versions — which also backs the page's 'several versions, treat as folklore' framing.
- 备注:Only 3 external links on the page, all in the Sources section (lines 93-95). All in-body links are internal (/festivals, /explainers/why-red-means-luck-in-china, /houyi) and were ignored per instructions; og:image and schema.org URLs are metadata, not citations. Core factual claims of the page: reunion festival; date = 15th day of 8th lunar month (Gregorian date shifts, Sept-early Oct); full moon = wholeness/family unity; mooncakes as signature food with sweet-bean/lotus-seed fillings, shared and gifted; Chang'e legend has multiple versions; 'Chinese Thanksgiving' label is misleading (this last is editorial framing, not sourced to any citation). Wikipedia alone substantiates every sourced factual claim. The two Britannica verdicts are unverifiable due to anti-bot blocking, not because of any doubt about relevance — search-engine evidence strongly indicates both are live, on-topic entries, so keep is the right action; no replacements needed. Browser-pane verification was attempted twice but the tool was temporarily unavailable in this session.

### explainers/what-is-yin-and-yang.astro
- 主实体:阴阳 yin and yang（中国哲学概念，互补对立而非善恶对抗）
- [unverifiable/keep] https://www.britannica.com/topic/yinyang
  - WebFetch 和带浏览器 UA 的 curl 均返回 HTTP 403，属 Britannica 反爬拦截，抓不到正文，无法核验内容。该 URL 是 Britannica 已知的 yinyang 词条路径，403 不等于页面不存在，故按诚实原则标 unverifiable 而非 dead。
- [supports/keep] https://en.wikipedia.org/wiki/Yin_and_yang
  - 抓取成功。词条讲的正是中国哲学的阴阳：对立互补、相互依存而非善恶对抗；阴=暗/冷/被动/受纳，阳=亮/暖/主动；太极图两点表示阴中有阳、阳中有阴；并覆盖道教、中医、风水、武术等应用——与页面全部核心观点一致。
- 备注:页面核心观点：阴阳是互补的两半而非善恶之争；阴=暗/冷/静/受纳，阳=亮/暖/动/主动；两者互相转化、各含对方的种子（太极图中的两点）；源自中国思想尤其道教，影响中医、饮食、风水、武术。外部链接仅 Sources 区块两条（britannica.com、en.wikipedia.org），正文无其他外链，站内链接已忽略。Wikipedia 完整支持全部核心观点；Britannica 因 403 反爬无法核验，但 URL 为该主题的标准词条路径且非 irrelevant/dead，建议保留。无需替换来源，未编造任何 URL。

### explainers/white-snake.astro
- 主实体:中国民间传说《白蛇传》(Legend of the White Snake, Bái Shé Zhuàn)——白素贞/许仙/法海的人蛇禁恋故事及其从唐代到现代影视的流变。
- [supports/keep] https://en.wikipedia.org/wiki/Legend_of_the_White_Snake
  - 抓取确认：词条即讲白蛇传，覆盖页面全部核心观点——四大民间传说地位、白素贞/许仙/法海/小青人物设定、唐代起源(807年李黄)经明清文学与戏曲到现代影视的流变、禁恋主题及法海形象由正转反的演变(对应页面[6][7][8]处引用)。
- [supports/keep] https://sites.gatech.edu/china-cultural-odyssey/2025/04/04/white-snake-legend-to-modern-animation/
  - 抓取确认：讲同一传说，明确提到唐代起源、9世纪《博异志》最早文字记载、故事从警世寓言演变为禁恋叙事，并详述2019动画电影改编——正好支撑页面[7]处'源于唐代、历经演变、现代动画改编'的观点。
- [supports/keep] https://pages.ucsd.edu/~dkjordan/chin/chtales/story010.html
  - 抓取确认：UCSD 教授 David Jordan 的白蛇传全文复述——白蛇绿蛇修炼千年化人形、断桥相遇、成婚开药铺、法海(Dharma Sea)拆散、雷峰塔收压，与页面[8][6]处引用的故事情节逐条吻合。
- [unverifiable/keep] https://www.britannica.com/animal/snake
  - 两次 WebFetch(含 www/裸域两种写法)均返回 HTTP 403，属 Britannica 反爬拦截，页面本身大概率存活，故不判 dead。未抓到内容不下 supports/irrelevant 结论。但需人工复核：URL 路径 /animal/snake 和标题'Description, Facts, & Types'表明这是蛇的动物学词条，而页面在[2]处引用它支撑'西方传统中蛇象征欺诈/邪恶'的文化象征观点，主题对口程度存疑。
- 备注:1) 页面正文除 Sources 区块外没有其他外部链接（导航和 /editorial-policy 均为站内）。2) 正文引用标记为 [2][6][7][8]，但 Sources 只列了 4 条且无编号——编号最高到 8，说明原始来源清单可能有 8 条后被裁剪，现有标记与来源已无法一一对应，建议修复编号或改为无编号引用。3) Britannica 链接即使存活，按标题看是动物学词条而非白蛇传/蛇文化象征词条，与它所支撑的[2]处'西方蛇象征欺诈'论断关联较弱；因 Britannica 全域 403 反爬，我无法核验其正文是否含文化象征章节，也无法核验任何 Britannica 替代词条，按'不许猜/替代必须实抓核验'的规则不给 replace，交由人工决定。4) 其余三条来源均实抓核验且全部支撑页面核心观点，无 irrelevant/dead 项。

### explainers/why-chinese-dragons-are-not-evil.astro
- 主实体:中国龙 (Chinese dragon, 龙 lóng)
- [unverifiable/keep] https://www.britannica.com/question/What-does-the-Chinese-dragon-represent
  - WebFetch 直接抓取返回 403（Britannica 反爬），无法核验页面正文。旁证：WebSearch 限定 britannica.com 检索到该 URL 的确存在，标题为 'What does the Chinese dragon represent? | Britannica'，搜索摘要显示内容讲中国龙象征 yang、原为雨神、与欧洲恶龙相反是 beneficent、曾为帝室徽记——与页面观点一致。但按诚实原则，未实际抓到正文即标 unverifiable。
- [unverifiable/keep] https://www.britannica.com/topic/long
  - WebFetch 直接抓取返回 403（Britannica 反爬），无法核验页面正文。旁证：WebSearch 限定 britannica.com 检索确认该 URL 存在且就是中国龙词条（'Long | Folklore, Legends & Myths | Britannica'），摘要讲 long 居于江河湖海、原为雨神、beneficent、四类龙与龙王（Longwang）——同一主实体且与页面观点一致。未实际抓到正文，如实标 unverifiable。
- [supports/keep] https://en.wikipedia.org/wiki/Chinese_dragon
  - WebFetch 抓取成功。词条正是中国龙（long/龙），内容支持页面几乎全部核心观点：本性 benevolent（佛教传入后才有个别恶龙说法，与页面'非本性为恶、龙王可为对手'的措辞兼容）、司水与降雨、四海龙王、五爪龙为明清帝王专属且龙椅称 Dragon Throne、象征吉祥好运、'Descendants of the Dragon'（龙的传人）为民族认同、复合形体（鹿角蛇身鲤鳞鹰爪等）、生肖龙年生育高峰、与西方龙'aggressive connotations'形成鲜明对比。
- 备注:页面核心事实性观点：中国龙（龙 lóng）本性仁善吉祥、是司水司雨之神（龙王）、象征皇权（真龙天子/龙袍/龙椅）、生肖中最尊贵、中国人以'龙的传人'自称、形体为多种瑞兽复合体、'恶龙'是西方概念，两者只是共用一个英文词 dragon 的翻译事故。三个外链主实体全部对口，无同名异实体（如日本 kitsune、蝴蝶夫人式）污染。Britannica 两条因站点反爬 403 无法直接抓取正文，按规则标 unverifiable 而非猜测为 supports；WebSearch 旁证（标题+摘要）强烈表明两条均存在且内容与页面一致，故建议 keep 而非 remove。注意：因 Britannica 全站对本工具 403，即使想换成其他 Britannica 词条（如 /topic/long-Chinese-mythology 之类）也无法完成'实际抓取核验'，所以不给任何 replace。Wikipedia 一条为 supports。无 irrelevant/dead 项，无需替换或删除。

### explainers/why-red-means-luck-in-china.astro
- 主实体:红色在中国文化中的吉祥象征（red as the color of luck/joy/protection in Chinese culture），核心事实点：年兽 Nian 怕巨响/火/红色故贴红放炮；红包 hóngbāo；婚礼穿红；白色（非黑色）是丧色；本命年穿红；红属火/阳。
- [unverifiable/keep] https://www.britannica.com/topic/Chinese-New-Year
  - WebFetch 与 curl（含浏览器 UA）均被 Britannica Cloudflare 反爬拦截返回 403/'Just a moment...'；对照测试显示 Britannica 对不存在的 URL 也返回 403，状态码无法区分死链。未能直接抓取正文，按诚实原则标 unverifiable。旁证：WebSearch 确认该 URL 存在，标题 'Chinese New Year | Summary, History, Traditions, Zodiac, & Facts | Britannica'，搜索摘要含年兽 Nian 怕巨响/亮光/红色的传说，与页面引用观点吻合，无删除或替换理由。
- [unverifiable/keep] https://www.britannica.com/topic/Nian-Chinese-mythology
  - 同样被 Britannica Cloudflare 反爬拦截（403 + 'Just a moment...' 挑战页），无法直接抓取正文，按诚实原则标 unverifiable。旁证：WebSearch 确认该精确 URL 存在，标题 'Nian | legendary beast | Britannica'，搜索摘要称 Nian 怕红色、巨响与火，人们贴红纸、点灯笼、放爆竹驱赶——与页面第 42 行的核心引用观点一致，无删除或替换理由。
- [supports/keep] https://en.wikipedia.org/wiki/Nian
  - WebFetch 抓取成功。词条讲的正是中国神话年兽 Nian：怕巨响、火、红色；村民挂红灯笼、贴春联、放爆竹驱赶，演化为春节习俗——完整支持页面引用它的年兽/红色驱邪观点。词条另注 Nian 作为具体生物的最早文字记载见于 20 世纪初，与页面把它作为传说呈现不矛盾。
- 备注:1) 正文无外链，仅 Sources 区块 3 条外链；站内链接（/festivals、/zodiac、/explainers/what-is-yin-and-yang、/myths）按要求忽略。2) 两条 Britannica 链接标 unverifiable 是因反爬（Cloudflare 403 挑战页），不是死链：对照测试证明 403 为全站无差别拦截，且 WebSearch 独立确认两个精确 URL 均存在且主题、内容摘要与页面引用观点吻合，故均建议 keep，不构成 replace/remove 条件。浏览器面板（可绕过反爬做直接核验）因分类器服务临时不可用重试 5 次未果。3) 覆盖面提示：三条来源只覆盖年兽/春节红色驱邪这一部分观点；红包、婚礼穿红、白色丧色、本命年穿红等观点没有对应来源，页面自己用 'General cultural knowledge backed by the reputable references above' 兜底——这些说法本身是常识级且无可疑之处，但严格说属于无来源背书的部分。

### explainers/zhuge-liang.astro
- 主实体:诸葛亮 Zhuge Liang（三国时期蜀汉丞相、刘备首席军师，"卧龙"；页面核心观点：真实历史政治家/战略家，被14世纪《三国演义》浪漫化为近乎神机妙算的智慧象征，代表忠诚+智谋的文化理想，军事思想家但实际战绩有限）
- [supports/keep] https://en.wikipedia.org/wiki/Zhuge_Liang
  - WebFetch 实抓成功。词条即讲诸葛亮本人：蜀汉丞相/刘备与刘禅的辅政、卧龙别号、《三国演义》14世纪小说将其塑造为智慧与忠诚化身、出师表/木牛流马/八阵图等发明与军事著述——覆盖页面全部核心观点。
- [unverifiable/keep] https://www.britannica.com/topic/Romance-of-the-Three-Kingdoms
  - WebFetch 与 curl（浏览器 UA）均返回 HTTP 403，响应体为 Cloudflare 'Just a moment...' 反爬质询页，说明是反爬拦截而非页面不存在；浏览器面板因临时故障不可用，无法完成人机验证。内容未能核验，如实标注 unverifiable。URL 路径形态与 Britannica 真实词条命名一致，主题（《三国演义》小说）与页面引用意图匹配，但这只是路径推断，不构成内容核验。
- [unverifiable/keep] https://www.britannica.com/biography/Zhuge-Liang
  - 同上：WebFetch 与 curl 均被 Cloudflare 403 质询页拦截（robots.txt 反而是 Allow: /，纯反爬行为），浏览器面板临时不可用。未抓到正文，不猜测内容，如实标注 unverifiable。URL 为 Britannica biography 词条命名格式且锚文本与 Britannica 标题格式一致，主实体名匹配，但未经实抓核验。
- [supports/keep] https://academic.mu.edu/meissnerd/kruse1.html
  - WebFetch 实抓成功。Marquette 大学（academic.mu.edu）学生研究页 'Zhuge Liang: The Sleeping Dragon'（作者 Aaron Kruse），讲的正是同一主实体：刘备三顾出山、军事谋略与忠诚、其在通俗文化（小说/游戏）中的传奇化——支持页面关于历史角色与智慧象征的观点。注意这是学生课程作业页而非机构权威出版物，权威性偏弱，但判定维度上属 supports。
- 备注:4 个外部链接全部核验或如实标注：2 个实抓成功且 supports（Wikipedia、academic.mu.edu），2 个 Britannica 链接被 Cloudflare 反爬 403 拦截（'Just a moment...' 质询页，非 404/死链），标 unverifiable 而非 dead。尝试过：WebFetch、curl 带浏览器 UA、浏览器面板（3 次均因 classifier 临时不可用失败）。无 irrelevant/dead，故无 replace/remove 处置。站内 yaopulife.com 链接按指示忽略。未修改任何文件。

### festivals.astro
- 主实体:中国传统节日 (Chinese traditional festivals: 春节/元宵/清明/端午/七夕/中元/中秋/重阳/冬至)
- 无外链:本页无任何外部来源链接(证据见备注)。
- 备注:该页面没有任何外部来源链接：没有 Sources 区块，正文/FAQ 也没有内嵌外部引用。文件里仅有的外部 URL 是 JSON-LD 的 https://schema.org 上下文声明和站点自身的 yaopulife.com canonical/og 地址（属站内，按任务要求忽略），所有 <a> 链接均为站内路径（/、/changge、/zodiac、/myths、/festivals 锚点）。因此无来源可核验，sources 为空。核心事实性观点（供后续补源参考）：九大节日的日期（含 2026 春节 2 月 17 日）、对应传说（年兽、屈原、牛郎织女、嫦娥）、代表食物与习俗、重阳为中国官方老年节、农历/阴阳合历导致公历日期浮动。未修改任何文件。

### houyi.astro
- 主实体:Hou Yi (后羿), the divine archer of Chinese mythology who shot down nine of the ten suns, husband of Chang'e。
- [unverifiable/keep] https://www.britannica.com/topic/Hou-Yi
  - WebFetch returned HTTP 403 (Britannica anti-bot blocking); direct content fetch failed, so per honesty rule this cannot be marked supports. Corroborating evidence short of a fetch: Google-indexed result confirms the URL is live, titled 'Hou Yi | Archer, Sun-Shooting, Immortal | Britannica', with snippet content matching the same entity and the page's claims (shot 9 of 10 suns, husband of Chang'e, pill of immortality, Chang'e taking refuge in the moon). Browser-pane verification was attempted but the tool was unavailable in this session.
- [supports/keep] https://en.wikipedia.org/wiki/Hou_Yi
  - Fetched successfully. Article is about the same entity (Hou Yi 后羿, legendary Chinese archer) and supports the page's core claims: ten suns scorching the earth, nine shot down and revealed as three-legged crows, one sun spared, elixir/pill of immortality, apprentice Feng Meng attempting to seize it, Chang'e swallowing it and floating to the moon, and the Mid-Autumn Festival connection. Minor variant difference (Wikipedia gives an additional motive variant for Chang'e), which the page itself acknowledges by noting multiple folk versions.
- 备注:Only 2 external links on the page, both in the Sources section (lines 174-175 of houyi.astro). All other links are internal site paths (/changge, /festivals, /zodiac, /myths, /wukong, /nezha, /jingwei, /xingtian) and were ignored per instructions. No inline external citations in the body. Neither source is irrelevant or dead, so no replacements were needed. Britannica could not be fetched directly (403 anti-bot) and is honestly marked unverifiable rather than supports, but search-engine indexing strongly indicates it is the correct, live entry for this same entity, so keep is recommended over remove.

### jingwei.astro
- 主实体:精卫 Jingwei（精卫填海，炎帝之女女娃溺于东海化鸟填海的中国神话）
- [supports/keep] https://en.wikipedia.org/wiki/Jingwei
  - 已抓取核验：词条正是中国神话精卫。逐点覆盖页面核心事实——炎帝之女女娃、在东海嬉水溺亡、化为鸟（花头/白喙/红足）、日衔石子树枝填东海、出自《山海经》、成语精卫填海意为百折不挠的毅力。与页面全部主张一致。
- [partial/keep] https://en.wikipedia.org/wiki/Classic_of_Mountains_and_Seas
  - 已抓取核验：词条是《山海经》本尊，支持页面对该书的描述（上古文本、约公元前4世纪已有早期版本、神怪地理志、满是怪兽）。但词条正文未提及精卫故事本身，只覆盖'来源之书'这一部分观点，精卫故事的支撑由第一条来源补齐。
- 备注:页面仅有 2 个外部链接，均在 Sources 区块，正文无其他外链（/shanhaijing、/wukong 等为站内链接已忽略）。两条均已用 WebFetch 实际抓取成功，无 dead/irrelevant/unverifiable，无需替换。页面正文事实（女娃、炎帝、东海、鸟形特征、填海、成语含义、女娃≠女娲的辨析）与 Jingwei 词条完全吻合。

### nezha.astro
- 主实体:中国神话儿童神哪吒 (Nezha / 哪吒, the Third Prince / Lotus Prince)
- [supports/keep] https://en.wikipedia.org/wiki/Nezha
  - 已实抓。词条即哪吒本尊，逐点覆盖页面核心观点：三年半怀胎生肉球、李靖疑为妖举剑、乾坤圈/混天绫/风火轮、杀敖丙抽龙筋、剔骨还父割肉还母自尽、太乙真人莲花重塑、父子冲突、2019动画电影爆红。唯一细微出入：'龙王水淹陈塘关'的威胁在词条中主要归于1979年动画改编而非原著小说，页面把它当传统情节讲，属常见通俗版本，不构成实体错配。
- [supports/keep] https://en.wikipedia.org/wiki/Investiture_of_the_Gods
  - 已实抓。词条为《封神演义》——哪吒故事的文学源头，且直接讲述页面主线：哪吒为李靖三子、灵珠子转世、七岁杀敖丙、自尽还身、太乙真人莲花化身、与父李靖冲突后和解。与页面主实体同源同事，支撑页面引用。
- 备注:页面全部外链仅 Sources 区块两条（nezha.astro:279-280），正文无其他外域链接（正文链接均为站内相对路径）。两条均实抓核验，同为哪吒主实体，无 irrelevant/dead/unverifiable。一处事实性小瑕疵供参考：页面 #price 段与 Beat 04 把'四海龙王威胁水淹陈塘关'当传统情节，Wikipedia Nezha 词条指出该情节主要出自 1979 年动画《哪吒闹海》而非《封神演义》原著（原著中龙王是上天庭告状施压）；不影响来源判定，但若追求严谨可加一句改编说明。

### shanhaijing.astro
- 主实体:山海经 Shan Hai Jing (Classic of Mountains and Seas) — the ancient Chinese text (Warring States–Han, ~2,000+ years old), a geography/bestiary/myth catalogue by unknown compilers, source of creatures like the nine-tailed fox, Zhulong, Kui, Hundun, Qiongqi。
- [unverifiable/keep] https://www.britannica.com/topic/Shanhaijing
  - Direct fetch blocked by Cloudflare anti-bot (HTTP 403 'Just a moment...' via WebFetch and curl with browser UA; browser pane unavailable this session), so page content could not be read and verified. Not dead: search engine results confirm the exact URL resolves to a live Britannica entry titled 'Shanhaijing | Chinese classic' about this same text (dated 3rd c. BCE–1st c. CE), so the link almost certainly points to the correct entity. Keeping per honesty rule — cannot claim 'supports' without having read it.
- [supports/keep] https://en.wikipedia.org/wiki/Classic_of_Mountains_and_Seas
  - Fetched and verified: the Wikipedia article is about exactly this text and supports the page's core claims — dating from ~4th c. BCE with present form reached in early Han (matches 'Warring States to Han, 2,000+ years old'), compiled over centuries by multiple unknown authors, nature as combined geography/bestiary/mythology compilation (550+ mountains, 300 channels, 400+ creatures), and it names the nine-tailed fox and Qiongqi among its preserved mythological beings.
- 备注:Only two external links exist on the page, both in the Sources section (src/pages/shanhaijing.astro:167-168). Body text, sidebar, related-reading and JSON-LD contain only internal/yaopulife.com or schema.org links — nothing else to audit. No irrelevant or dead sources found, so no replacements proposed. Britannica caveat: its Cloudflare wall blocks automated fetching generally; a human loading the URL in a normal browser should see the correct 'Shanhaijing (Chinese classic)' entry per search-engine confirmation, but this audit could not read the live content and honestly labels it unverifiable rather than supports.

### whitesnake.astro
- 主实体:中国民间传说《白蛇传》(Legend of the White Snake) 及其主角白素贞 (Bai Suzhen)
- [supports/keep] https://en.wikipedia.org/wiki/Legend_of_the_White_Snake
  - WebFetch 实际抓取，200 加载成功。词条即讲《白蛇传》，逐点覆盖页面全部核心事实：四大民间传说之一、白蛇修炼化为白素贞、与许仙相恋成婚、法海反对并将许仙囚于金山寺、端午雄黄酒现原形致许仙惊死、盗仙草救夫、水漫金山、被镇雷峰塔、部分版本中儿子救母、青蛇小青。
- [supports/keep] https://en.wikipedia.org/wiki/Bai_Suzhen
  - WebFetch 实际抓取，正常加载且是独立词条（非重定向）。词条讲的正是白素贞：千年白蛇精、化人形、嫁许仙、法海识破、镇雷峰塔、义妹小青、儿子许仕林救母，与页面主实体和观点一致；另含民间信仰与改编作品等补充内容。
- 备注:页面外部链接仅 Sources 区块两条（均 en.wikipedia.org），正文内嵌链接全为站内相对路径（/changge、/myths、/explainers/what-is-a-yao 等），按要求忽略。两条来源均已核验为 supports，无需替换或删除。页面的解释性观点（妖≠demon、法海作为规则化身被观众判为反派、故事的"同情外来者"主题）属评论性阐释，Wikipedia 词条覆盖其叙事事实基础；页面末尾也自述"多版本民间故事取其常见版本"，与来源性质相符。

### wukong.astro
- 主实体:孙悟空 Sun Wukong（美猴王/齐天大圣，《西游记》主角）
- [partial/keep] https://www.britannica.com/topic/Sun-Wukong
  - 直接 WebFetch 与浏览器 UA curl 均 403（Britannica 反爬），经 r.jina.ai 阅读代理抓到全文确认：词条就是孙悟空本尊，覆盖石头出生、持棒、反抗玉帝天庭、被压五行山、变化神通、现代改编（含黑神话悟空）。但代理全文中未见页面引用的若干具体情节：齐天大圣称号、弼马温职位、生死簿销名、紧箍咒、炼丹炉四十九天、金箍棒名号与变尺寸。同一主实体、只覆盖部分观点，判 partial。
- [supports/keep] https://en.wikipedia.org/wiki/Sun_Wukong
  - WebFetch 抓取成功，词条即孙悟空，逐项覆盖页面全部核心观点：花果山石生、如意金箍棒、生死簿销名、齐天大圣（Qitian Dasheng）、弼马温、大闹天宫、老君炉四十九天、五行山下五百年、紧箍咒金箍、七十二变、筋斗云十万八千里、长生不老、现代改编含黑神话悟空。
- 备注:页面外链只有 Sources 区块两条（wukong.astro:294-295），正文无其他外部引用；/nezha、/myths、/explainers/* 为站内链接已忽略。两条来源均指向正确主实体，无 irrelevant/dead，无需替换。Britannica 的 403 是 TLS 指纹级反爬（换浏览器 UA 仍 403），非死链；内容经代理实抓核验，故按内容判 partial 而非 dead/unverifiable。页面自述"General cultural knowledge backed by the reputable references above"，两条 keep 足以支撑；若想让每个具体情节（弼马温、生死簿、紧箍咒）都有来源背书，Wikipedia 一条已全覆盖。

### xingtian.astro
- 主实体:Xingtian 刑天 — the headless warrior/giant of Chinese mythology who challenged the Yellow Emperor, was beheaded (head buried in Changyang Mountain), grew eyes from his nipples and a mouth from his navel, and kept fighting with shield and axe; famed via Tao Yuanming's line 刑天舞干戚，猛志固常在。
- [supports/keep] https://en.wikipedia.org/wiki/Xingtian
  - Fetched and verified: article is about the same Xingtian 刑天. Confirms every core claim on the page — challenge to the Yellow Emperor/Supreme Divinity, beheading, head buried on Changyang Mountain, nipples as eyes and navel as mouth, brandishing shield and axe, Shanhaijing chapter 7 as source, and Tao Qian (Tao Yuanming) poem celebrating his indomitable will.
- [partial/keep] https://en.wikipedia.org/wiki/Classic_of_Mountains_and_Seas
  - Fetched and verified: article is about the Shanhaijing, the ancient text the page cites as preserving the Xingtian story — same entity as the claim it anchors. It confirms the text's nature (ancient Chinese compilation of mythic geography and creatures) but does not itself mention Xingtian or the headless-warrior episode, so it covers only part of the page's claims.
- 备注:Only 2 external links on the page, both in the Sources block; no external links in body text (all other links are site-internal: /shanhaijing, /jingwei, /wukong, etc.). Both fetched successfully via WebFetch. The Xingtian Wikipedia entry fully corroborates the page's facts including the Tao Yuanming quote and Changyang Mountain burial. The Shanhaijing entry is a valid source-text citation but does not name Xingtian, hence partial rather than supports. No irrelevant, dead, or unverifiable sources; no replacements needed.

### zodiac.astro
- 主实体:中国十二生肖 Chinese zodiac (生肖 shengxiao)
- [unverifiable/keep] https://www.britannica.com/topic/Chinese-zodiac
  - WebFetch 与带浏览器 UA 的 curl 均返回 403（Britannica 反爬），未能读取正文，按规则不猜测内容故标 unverifiable。旁证：WebSearch 索引确认该 URL 存活且词条为 'Chinese zodiac | History, Animals, Personalities, & Signs'，搜索摘要覆盖 12 年周期、12 动物、春节换年、赛跑传说、2026 马年——与本页主实体和观点一致，非同名异实体，非死链。
- [partial/keep] https://en.wikipedia.org/wiki/Chinese_zodiac
  - 已抓取。同一主实体，覆盖本页核心观点：12 动物顺序（Rat…Pig）、按年配属、农历新年起算、赛跑传说、猫落选（被鼠推下水）、性格/相配关联、东亚文化背景。未覆盖本页部分细节：本命年（穿红）、丙午火马、2026-02-17 起始日、与西方占星的详细对比。作为『General cultural knowledge』的总引用成立，故 keep。
- 备注:页面外部链接仅 Sources 区块两条（zodiac.astro:151-152），正文无外链内嵌引用，站内链接（/festivals、/changge、/wukong、/myths、/zodiac/year-of-the-horse-2026）按要求忽略。页面核心事实性观点：12 动物按年循环及顺序；生肖按农历年、以农历新年（1月下旬-2月中旬）起算；2026 为马年且是丙午火马，2026-02-17 起始；赛跑传说与猫落选；本命年穿红习俗；与西方占星"按年 vs 按月"的区别；性格特质是文化联想非命定。核验过程：Wikipedia 直接抓取成功；Britannica 直抓 403（WebFetch 与 curl 均 403，浏览器渲染通道因安全分类器临时不可用无法尝试），改用 WebSearch 旁证确认 URL 存活且主题正确（来源：https://www.britannica.com/topic/Chinese-zodiac 的搜索索引条目），因此判 unverifiable 而非 dead，无需 replace/remove。两条来源均无同名异实体/跑题问题。未修改任何文件。

### zodiac/year-of-the-horse-2026.astro
- 主实体:2026 中国生肖马年（丙午火马年）Year of the Fire Horse 2026。
- 无外链:本页无任何外部来源链接(证据见备注)。
- 备注:该页面没有任何外部来源链接：无 Sources 区块，正文/FAQ/Related reading 全部为站内相对链接（/zodiac、/festivals、/myths、/explainers/...）。文件中仅有的外部域名是 JSON-LD 的 schema.org context URI（结构化数据规范引用，非引用来源）；引入的共享组件 SiteAnalytics.astro 里有 googletagmanager.com 的 GA 脚本（分析埋点，非来源）。因此 sources 为空数组，无需任何核验/替换/删除动作。页面核心事实性观点（供后续补源参考）：马年始于 2026-02-17 农历新年、止于 2027-02-05；2026 为丙午火马年，五行 60 年一循环，上一个火马年 1966、下一个 2086；马象征能量/自由/速度/独立；马年年份 1942/1954/1966/1978/1990/2002/2014/2026/2038；本命年戴红习俗；成语马到成功、龙马精神。这些均未挂任何外部引用。

### explainers/chang-e.astro(补审)
- 主实体:中国月神嫦娥。
- [supports/keep] https://en.wikipedia.org/wiki/Chang%27e
  - 直接抓取成功。词条即中国神话月神嫦娥:后羿之妻、不死药、玉兔捣药、中秋节起源、中国探月工程以其命名——与页面核心实体与主要故事线吻合。
- [unverifiable(经搜索索引旁证)/keep] https://www.britannica.com/topic/Change-Chinese-deity
  - WebFetch 与带浏览器 UA 的 curl 均 403(站点级反爬,非死链);搜索索引确认该 URL 存活,标题 'Chang'e | Moon Goddess, Lunar Goddess, Chinese Mythology' 与页面锚文本逐字一致,词条内容为同一主实体(月神、后羿、中秋节)
- [unverifiable(经搜索索引旁证)/keep] https://www.britannica.com/technology/Change-Chinese-lunar-probes
  - 同上 403;搜索索引确认 URL 存活,标题 'Chang'e | Missions & Facts' 与页面锚文本一致,内容为以嫦娥命名的中国探月系列(含嫦娥四号首次着陆月背),支持页面 Modern Legacy in Space 一节。
- [unverifiable(经搜索索引旁证)/keep] https://www.britannica.com/topic/Change-4
  - 同上 403;搜索索引确认 URL 存活,标题 'Chang'e 4 | Chinese lunar probe',内容证实 2019-01-03 首次着陆月球背面冯·卡门撞击坑(南极-艾特肯盆地),与页面表述一致。
- 备注:正文未发现与来源冲突的事实性错误;灵药故事采用防盗贼版并明示变体,兼容两源的不同版本。唯一小瑕疵:'Beautiful Moon' 释名在所引来源中无依据,已删(见审计后变更)

### explainers/liaozhai-strange-tales.astro(补审)
- 主实体:蒲松龄《聊斋志异》(Strange Tales from a Chinese Studio,清代)。
- [unverifiable(经Wayback旁证)/keep] https://www.britannica.com/topic/Strange-Stories-from-a-Chinese-Studio
  - 直接抓取遇 Cloudflare 反爬(403 'Just a moment...',站点存活仅拦机器人);经 Wayback 快照(2024-11-27)核验同一 URL:词条即 'Strange Stories from a Chinese Studio | work by Pu Songling',别名 Liaozhai zhiyi,明确 completed in 1679,与页面主实体和观点一致。注:索引型词条非完整文章,实体正确可用。
- [supports/keep] https://blogs.loc.gov/international-collections/2018/10/the-strange-tales-from-liaozhai/
  - 实抓 HTTP 200(WebFetch 被 403 拦,浏览器 UA curl 正常)。内容即国会图书馆亚洲部对《聊斋志异》的介绍:蒲松龄 1640–1715、文言、清初、491 篇 16 卷、fox-fairies/flower-spirits/ghosts/goblins 主题、贪官污吏欺压百姓(席方平)。页面 491 上限、主题措辞、社会讽刺说法均直接出自此源。
- [unverifiable(经Wayback旁证)/keep] https://www.britannica.com/biography/Pu-Songling
  - 同为 Cloudflare 反爬(403);经 Wayback 快照(2025-02-13)核验同一 URL:蒲松龄传记,生卒 1640-06-05–1715-02-25,431 tales,largely completed by 1679、1707 年仍在增补,文言(classical idiom)。页面 431 下限、1679 年基本完成并终生增补均直接对应此源。
- 备注:正文未发现与来源冲突的事实性错误。431–491 篇区间为两源数字(Britannica 431 / LOC 491)的如实合并;Liaozhai=Studio of Leisure 释义属通行译法不构成冲突。提醒:两条 Britannica 链接对普通浏览器可访问,对自动抓取器返回 403,死链巡检需按反爬处理。
