#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""来源复审文档(source-audit-2026-07-26.md)离线完整性检查 v2——零网络。

v2 相对 v1 的修复(2026-07-26 最终审核阻断项 5/6):
  A. 逐页 URL 对账:每页站点 Sources 现状必须等于「该页文档小节 URL − 该页移除
     + 该页新增」;URL 出现在别的页面小节不算数(v1 是全局 URL 集,绑错页照过)。
  B. 审计后变更绑定页面:解析「## 审计后站内变更」的每页 bullet(移除/新增+URL)。
  C. 覆盖 33 个审计页(含零外链页),双向:清单页必须有小节且站点文件存在;
     站点任何带外部 Sources 的内容页必须在清单里;零外链页文档与站点两侧都必须为零。
  D. .astro 抽取:单/双引号 href、协议相对 //URL(按 https 归一)、scheme 大小写
     不敏感、hostname 严判站内(裸域/真子域;notyaopulife.com、路径含域名=外部)。
  E. 截断检测:句末无标点 之外,再抓「定长截断」——证据文本恰为 220/400 字符
     (历史生成器的 [:220]/[:400] 上限)即使句末带标点也标记;证据行匹配容忍
     项目符(-/*)与缩进漂移。

用法:
  python3 docs/geo/verify_source_audit.py             # 实检,0=通过
  python3 docs/geo/verify_source_audit.py --selftest  # 对抗样本自检,0=全部命中
"""
from __future__ import annotations

import pathlib
import re
import sys
from urllib.parse import urlparse

SITE = pathlib.Path(__file__).resolve().parents[2]
DOC = SITE / "docs/geo/source-audit-2026-07-26.md"

# 审计范围清单(2026-07-26 审计的 33 页,含零外链页)。新内容页带外部来源而不在
# 此清单 = 覆盖缺口,必须补审并入册。
AUDITED_PAGES = [
    "changge.astro", "festivals.astro", "houyi.astro", "jingwei.astro", "nezha.astro",
    "shanhaijing.astro", "whitesnake.astro", "wukong.astro", "xingtian.astro", "zodiac.astro",
    "zodiac/year-of-the-horse-2026.astro",
    "explainers/butterfly-lovers.astro", "explainers/chang-e.astro",
    "explainers/chinese-calligraphy-vs-painting.astro", "explainers/chinese-gods-vs-western-gods.astro",
    "explainers/dragon-boat-festival.astro", "explainers/erlang-shen.astro",
    "explainers/fox-spirit.astro", "explainers/is-the-story-of-mulan-real.astro",
    "explainers/liaozhai-strange-tales.astro", "explainers/nuwa.astro",
    "explainers/qin-shi-huang.astro", "explainers/qixi-festival.astro",
    "explainers/three-kingdoms.astro", "explainers/what-is-a-yao.astro",
    "explainers/what-is-heaven-in-chinese-mythology.astro",
    "explainers/what-is-journey-to-the-west.astro", "explainers/what-is-the-mid-autumn-festival.astro",
    "explainers/what-is-yin-and-yang.astro", "explainers/white-snake.astro",
    "explainers/why-chinese-dragons-are-not-evil.astro", "explainers/why-red-means-luck-in-china.astro",
    "explainers/zhuge-liang.astro",
]

TERMINAL = tuple("。.!?)】”\"）")
TRUNCATION_CAPS = (220, 400)  # 历史生成器 reason[:220] / notes[:400]

_HREF = re.compile(r"""href=["'](?P<u>(?:[Hh][Tt][Tt][Pp][Ss]?:)?//[^"']+)["']""")
_SECTION = re.compile(r"^### (\S+)", re.MULTILINE)
_SOURCE_LINE = re.compile(r"^\s*[-*]\s*\[[^\]]+/[^\]]+\]\s+(\S+)", re.MULTILINE)
_CHANGE_LINE = re.compile(r"^- (?P<page>[a-z0-9-]+):(?P<body>.+)$")
_URL_IN_TEXT = re.compile(r"[Hh][Tt][Tt][Pp][Ss]?://[^\s;,()（）。，、；：！？\"”'’]+")
_EVIDENCE = re.compile(r"^\s*[-*]\s+(?P<t>.+?)\s*$", re.MULTILINE)
_ACTION_OR_URL = re.compile(r"(?P<act>移除|新增)|(?P<url>[Hh][Tt][Tt][Pp][Ss]?://[^\s;,()（）。，、；：！？\"”'’]+)")


def _clean(u: str) -> str:
    u = u.rstrip('.,;:!?)"\'>）】]' + "。，、；：！？”’")
    u = re.sub(r"^[Hh][Tt][Tt][Pp][Ss]?:", lambda m: m.group(0).lower(), u)
    return "https:" + u if u.startswith("//") else u


def _is_internal(u: str) -> bool:
    try:
        host = (urlparse(u).hostname or "").lower()
    except ValueError:
        return False
    return host == "yaopulife.com" or host.endswith(".yaopulife.com")


def urls_from_sources_scope(astro_text: str) -> set[str]:
    """页面 Sources 区(id="sources" 到 </section>)里的外部 URL。
    单/双引号 href、协议相对、scheme 大小写不敏感、hostname 严判。"""
    m = re.search(r"""id=["']sources["'].*?</section>""", astro_text, re.DOTALL)
    scope = m.group(0) if m else ""
    return {_clean(x) for x in (mm.group("u") for mm in _HREF.finditer(scope))
            if not _is_internal(_clean(x))}


def truncation_problems(doc_text: str) -> list[str]:
    """证据行(容忍 -/* 与任意缩进):句末无标点,或文本恰为定长上限(220/400 字符,
    即使带标点)= 疑似定长截断。来源行([verdict/action] URL)与表格行不参与。"""
    out = []
    for m in _EVIDENCE.finditer(doc_text):
        t = m.group("t")
        payload = re.sub(r"^(?:主实体:|备注:)", "", t).strip()
        if not payload or (payload.startswith("[") and "] http" in payload.lower()):
            continue
        if payload.lower().startswith(("http://", "https://")):
            continue
        if not payload.endswith(TERMINAL):
            out.append(f"疑似截断(无句末标点): {payload[-60:]!r}")
        elif len(payload) in TRUNCATION_CAPS:
            out.append(f"疑似定长截断(len={len(payload)},历史上限,句末有标点不豁免): {payload[:60]!r}…")
    return out


def _consume_change_text(text: str, page: str, removed: set[str], added: set[str],
                         problems: list[str], action: str | None) -> str | None:
    """按动作标签(移除/新增)顺序归属 URL,返回收尾时的动作(供跨行继承)。
    不依赖分号,兼容中英文逗号/分号/换行/同 bullet 混排与逆序(新增→URL→移除→URL)。
    URL 在有效动作之前出现 = 无法可靠解析,fail-closed 记问题。"""
    for m in _ACTION_OR_URL.finditer(text):
        if m.group("act"):
            action = m.group("act")
        else:
            u = _clean(m.group("url"))
            if action == "移除":
                removed.add(u)
            elif action == "新增":
                added.add(u)
            else:
                problems.append(f"变更解析失败(fail-closed): {page} 的 URL {u} 无前置动作标签(移除/新增)")
    return action


def parse_doc(doc_text: str):
    """→ (sections: {页面路径: 小节文本},
         changes: {页面stem: (removed, added)}   # 同页多条记录合并,不覆盖
         problems: [解析失败清单,非空=fail-closed])"""
    sections: dict[str, str] = {}
    parts = re.split(r"^### ", doc_text, flags=re.MULTILINE)[1:]
    for part in parts:
        name = part.splitlines()[0].strip().replace("(补审)", "")
        sections[name] = sections.get(name, "") + part
    changes: dict[str, tuple[set[str], set[str]]] = {}
    problems: list[str] = []
    mm = re.search(r"^## 审计后站内变更.*?(?=^## |\Z)", doc_text, re.MULTILINE | re.DOTALL)
    if mm:
        # 跨行状态机(2026-07-26 终审阻断项):同时保存 current_page 与 current_action,
        # 支持「- page:移除」下一行只写 URL、动作与多个 URL 跨行、新增→URL→移除→URL
        # 逆序跨行。新页面 bullet / 无关 bullet / 变更节结束(块边界)一律重置动作,
        # 不误吞后续 URL;无法归属仍 fail-closed。
        current_page: str | None = None
        current_action: str | None = None
        for line in mm.group(0).splitlines():
            cm = _CHANGE_LINE.match(line)
            if cm:
                current_page = cm.group("page")
                removed, added = changes.setdefault(current_page, (set(), set()))
                current_action = _consume_change_text(
                    cm.group("body"), current_page, removed, added, problems, None)
                continue
            if line.startswith("- "):
                # 无关 bullet:重置页面与动作;带 URL 则 fail-closed
                if _URL_IN_TEXT.search(line):
                    problems.append(f"变更解析失败(fail-closed): 无法识别页面归属的变更行 {line[:60]!r}")
                current_page, current_action = None, None
                continue
            if _URL_IN_TEXT.search(line) or "移除" in line or "新增" in line:
                if current_page is None:
                    if _URL_IN_TEXT.search(line):
                        problems.append(f"变更解析失败(fail-closed): 无页面归属的行 {line[:60]!r}")
                    continue
                removed, added = changes[current_page]
                # 续行仅认「行首」动作词更新 current_action(2026-07-27 终审建议项):
                # 「说明:本次新增的是措辞」这类行中动作词是叙述,不得改变归属。
                s = line.strip()
                if s.startswith(("移除", "新增")):
                    act, rest = s[:2], s[2:]
                    if "移除" in rest or "新增" in rest:
                        problems.append(f"变更解析失败(fail-closed): 续行行首动作后又现行中动作词,"
                                        f"归属歧义 {line[:60]!r}")
                        continue
                    current_action = act
                    for u in _URL_IN_TEXT.findall(rest):
                        (removed if act == "移除" else added).add(_clean(u))
                    continue
                urls = _URL_IN_TEXT.findall(s)
                if not urls:
                    continue   # 纯叙述行(行中动作词不作数)
                if "移除" in s or "新增" in s:
                    problems.append(f"变更解析失败(fail-closed): 行中动作词与 URL 混排,"
                                    f"归属歧义 {line[:60]!r}")
                    continue
                for u in urls:
                    if current_action == "移除":
                        removed.add(_clean(u))
                    elif current_action == "新增":
                        added.add(_clean(u))
                    else:
                        problems.append(f"变更解析失败(fail-closed): {current_page} 的 URL "
                                        f"{_clean(u)} 无前置动作标签(移除/新增)")
    return sections, changes, problems


def run_checks(doc_text: str, site_root: pathlib.Path, audited: list[str]) -> list[str]:
    sections, changes, problems = parse_doc(doc_text)

    # C. 覆盖:清单页 ↔ 文档小节 ↔ 站点文件;站点带外源页 ⊆ 清单
    for page in audited:
        if page not in sections:
            problems.append(f"覆盖缺口: 清单页 {page} 在文档无小节")
        if not (site_root / "src/pages" / page).exists():
            problems.append(f"覆盖缺口: 清单页 {page} 站点文件不存在")
    site_sources: dict[str, set[str]] = {}
    for p in site_root.glob("src/pages/**/*.astro"):
        if p.name.startswith("_"):
            continue
        rel = str(p.relative_to(site_root / "src/pages"))
        urls = urls_from_sources_scope(p.read_text(encoding="utf-8"))
        site_sources[rel] = urls
        if urls and rel not in audited:
            problems.append(f"覆盖缺口: 站点页 {rel} 有外部 Sources 但不在审计清单(需补审)")

    # A+B. 逐页对账:站点现状 == 小节 URL − 该页移除 + 该页新增
    for page in audited:
        sec = sections.get(page)
        if sec is None:
            continue
        doc_urls = {_clean(u) for u in _SOURCE_LINE.findall(sec)}
        stem = pathlib.Path(page).stem
        removed, added = changes.get(stem, (set(), set()))
        expected = (doc_urls - removed) | added
        actual = site_sources.get(page, set())
        for u in sorted(actual - expected):
            problems.append(f"逐页对账缺口: {page} 站点有 {u} 但文档小节/变更节未绑定该页")
        for u in sorted(expected - actual):
            problems.append(f"逐页对账缺口: {page} 文档记 {u}(扣除移除/含新增)但站点已无")
        if not actual and "无外链" not in sec and doc_urls:
            problems.append(f"零外链口径冲突: {page} 站点无外链但文档记有来源且无变更绑定")
        if actual == set() and doc_urls == set() and "无外链" not in sec:
            problems.append(f"结构缺口: {page} 零外链页缺『无外链』说明")

    # E. 截断
    problems += truncation_problems(doc_text)
    return problems


# ── 对抗样本自检(离线,失败即 exit 1)────────────────────────────────────

def selftest() -> int:
    fails = []
    t220 = "证" * 219 + "。"
    assert len(t220) == 220
    t400 = "据" * 399 + "。"
    fixture = f"- 主实体:{t220}\n  - {t400}\n   * 缩进漂移且无句末标点的证据行\n"
    hits = truncation_problems(fixture)
    if not any("len=220" in h for h in hits):
        fails.append("未抓住 220 定长截断(带标点)")
    if not any("len=400" in h for h in hits):
        fails.append("未抓住 400 定长截断(带标点)")
    if not any("缩进漂移" in h for h in hits):
        fails.append("未抓住缩进/项目符漂移的无标点行")

    astro = ('<section><h2 id=\'sources\'>Sources</h2>'
             '<a href="HTTPS://External.example/CasePath">a</a>'
             "<a href='Http://ex.org/single-quote'>b</a>"
             '<a href="//cdn.example.com/lib.js">c</a>'
             '<a href="https://notyaopulife.com/x">d</a>'
             '<a href="https://evil.com/yaopulife.com/steal">e</a>'
             '<a href="HTTPS://WWW.YAOPULIFE.COM/internal">f</a></section>')
    urls = urls_from_sources_scope(astro)
    lower = {u.lower() for u in urls}
    if not any("external.example/casepath" in u for u in lower):
        fails.append("大写 scheme 未抽取")
    if not any("ex.org/single-quote" in u for u in lower):
        fails.append("单引号 href 未抽取")
    if "https://cdn.example.com/lib.js" not in lower:
        fails.append("协议相对 URL 未归一抽取")
    if not any("notyaopulife.com" in u for u in lower):
        fails.append("notyaopulife.com 被子串误豁免")
    if not any("evil.com/yaopulife.com" in u for u in lower):
        fails.append("路径含域名被子串误豁免")
    if any("://www.yaopulife.com" in u for u in lower):
        fails.append("站内真子域未豁免")

    # ── 变更解析:动作标签驱动 + 中文逗号混排 + 同页多 bullet 合并 + fail-closed ──
    doc_mix = ("## 审计后站内变更\n"
               "- page-a:移除 https://old.example/gone ，新增已核验来源 https://new.example/added。\n"
               "- page-a:移除 https://second.example/also-gone、新增 https://third.example/plus\n"
               "## 逐页明细\n### page-a.astro\n- 备注:好。\n")
    _, ch, pp = parse_doc(doc_mix)
    removed, added = ch.get("page-a", (set(), set()))
    if "https://new.example/added" not in added or "https://new.example/added" in removed:
        fails.append("『移除 old ，新增 new。』混排:新增仍被误归移除或带句号残留(原假绿反例)")
    if "https://old.example/gone" not in removed:
        fails.append("混排 bullet 的移除 URL 未归位")
    if any(u.endswith("。") or u.endswith("，") for u in removed | added):
        fails.append("URL 清理未覆盖中文句末标点")
    if "https://second.example/also-gone" not in removed or "https://third.example/plus" not in added:
        fails.append("同页多条变更记录被覆盖而非合并")
    if pp:
        fails.append(f"合法混排被误判 fail-closed: {pp}")
    # 无动作标签却带 URL → 必须 fail-closed
    _, _, pp_bad = parse_doc("## 审计后站内变更\n- page-x:调整 https://foo.example/x 的位置。\n## 逐页明细\n")
    if not pp_bad:
        fails.append("无法可靠解析的变更(无动作标签)未 fail-closed")

    # ── 跨行状态机:动作继承 / 逆序 / 边界重置(2026-07-26 终审阻断项)──────────
    doc_cross = ("## 审计后站内变更\n"
                 "- page-a:移除\n"
                 "  https://a.example/1\n"
                 "  https://a.example/2\n"
                 "  新增\n"
                 "  https://a.example/3\n"
                 "- page-b:新增\n"
                 "https://b.example/1\n"
                 "移除\n"
                 "https://b.example/2\n"
                 "## 逐页明细\n")
    _, ch_x, pp_x = parse_doc(doc_cross)
    ra, aa = ch_x.get("page-a", (set(), set()))
    rb, ab = ch_x.get("page-b", (set(), set()))
    if ra != {"https://a.example/1", "https://a.example/2"} or aa != {"https://a.example/3"}:
        fails.append(f"跨行动作继承失败: page-a removed={sorted(ra)} added={sorted(aa)}")
    if ab != {"https://b.example/1"} or rb != {"https://b.example/2"}:
        fails.append(f"逆序跨行(新增→URL→移除→URL)归属失败: page-b removed={sorted(rb)} added={sorted(ab)}")
    if pp_x:
        fails.append(f"合法跨行被误判 fail-closed: {pp_x}")

    # 新页面 bullet 必须重置动作:page-c 的 URL 不得继承 page-a 的『移除』
    _, ch_y, pp_y = parse_doc(
        "## 审计后站内变更\n- page-a:移除 https://a.example/1\n"
        "- page-c:https://c.example/no-action\n## 逐页明细\n")
    rc, ac = ch_y.get("page-c", (set(), set()))
    if rc or ac:
        fails.append("新页面 bullet 未重置动作,误吞后续 URL")
    if not any("no-action" in p for p in pp_y):
        fails.append("新页面无动作 URL 未 fail-closed")

    # 无关 bullet 必须重置页面与动作:孤儿 URL 不得归给上一页
    _, ch_z, pp_z = parse_doc(
        "## 审计后站内变更\n- page-a:移除\n- 备注说明行,与页面无关\n"
        "https://orphan.example/x\n## 逐页明细\n")
    rz, az = ch_z.get("page-a", (set(), set()))
    if rz or az:
        fails.append("无关 bullet 后孤儿 URL 被误归上一页")
    if not any("orphan.example" in p for p in pp_z):
        fails.append("无关 bullet 后孤儿 URL 未 fail-closed")

    # 续行仅认行首动作词:「说明:本次新增的是措辞」不得改变动作(2026-07-27 建议项)
    _, ch_m, pp_m = parse_doc(
        "## 审计后站内变更\n- page-a:移除\nhttps://m.example/1\n"
        "说明：本次新增的是措辞\nhttps://m.example/2\n## 逐页明细\n")
    rm, am = ch_m.get("page-a", (set(), set()))
    if rm != {"https://m.example/1", "https://m.example/2"} or am:
        fails.append(f"行中动作词污染归属: removed={sorted(rm)} added={sorted(am)}")
    if pp_m:
        fails.append(f"纯叙述行被误判 fail-closed: {pp_m}")
    # 行中动作词与 URL 同行混排 = 歧义,必须 fail-closed
    _, _, pp_amb = parse_doc(
        "## 审计后站内变更\n- page-a:移除\n本次新增 https://amb.example/x 一条\n## 逐页明细\n")
    if not any("歧义" in p for p in pp_amb):
        fails.append("行中动作词+URL 混排未按歧义 fail-closed")

    # ── 真正的绑错页夹具:URL 写在 page-a 文档小节,实际只挂在 page-b ──────────
    doc = ("## 审计后站内变更\n- page-a:移除 https://old.example/gone;新增已核验来源 https://new.example/added\n"
           "## 逐页明细\n"
           "### page-a.astro\n- [supports/keep] https://old.example/gone\n"
           "- [supports/keep] https://ex.org/misfiled-url\n- 备注:好。\n"
           "### page-b.astro\n- [supports/keep] https://ex.org/only-in-b\n- 备注:好。\n")
    import tempfile
    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)
        (base / "src/pages").mkdir(parents=True)
        (base / "src/pages/page-a.astro").write_text(
            '<h2 id="sources">s</h2><a href="https://new.example/added">x</a></section>', encoding="utf-8")
        (base / "src/pages/page-b.astro").write_text(
            '<h2 id="sources">s</h2><a href="https://ex.org/only-in-b">x</a>'
            '<a href="https://ex.org/misfiled-url">y</a></section>', encoding="utf-8")
        probs = run_checks(doc, base, ["page-a.astro", "page-b.astro"])
        if not any("page-b.astro" in p and "misfiled-url" in p and "未绑定" in p for p in probs):
            fails.append("绑错页:URL 挂在 page-b 却只记于 page-a 小节,page-b 侧未报未绑定")
        if not any("page-a.astro" in p and "misfiled-url" in p and "站点已无" in p for p in probs):
            fails.append("绑错页:page-a 小节记了 URL 但站点已无,page-a 侧未报")
        if any("added" in p and "page-a.astro" in p for p in probs):
            fails.append("变更绑定页面(移除+新增)未被认可,误报 page-a")

    if fails:
        print(f"SELFTEST FAIL: {len(fails)}")
        for f in fails:
            print(" -", f)
        return 1
    print("SELFTEST OK: 定长截断(220/400,带标点)/漂移行/大小写 scheme/单引号/协议相对/"
          "hostname 严判/『移除,新增』混排归属/同页多bullet合并/无动作标签 fail-closed/"
          "URL 中文标点清理/真绑错页双向报错 全部命中")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    if not DOC.exists():
        print(f"FAIL: 文档不存在 {DOC}")
        return 1
    problems = run_checks(DOC.read_text(encoding="utf-8"), SITE, AUDITED_PAGES)
    if problems:
        print(f"FAIL: {len(problems)} 个问题")
        for p in problems:
            print(" -", p)
        return 1
    print(f"OK: 33 页逐页对账通过(含零外链页),审计后变更已绑定页面,证据行无截断/无定长上限命中")
    return 0


if __name__ == "__main__":
    sys.exit(main())
