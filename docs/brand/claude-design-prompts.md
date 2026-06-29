# Claude Design · yaopulife 英文终极提示词

> 给 Claude Design / 任意生图模型的母版提示词。镜像同步于 `prompts/illustration/master-style.md`。
> 原则:学方法不抄博主、文化服务叙事不堆砌、海外先共情再理解。

## 母版提示词 · Master Prompt

```text
Create an original illustration for yaopulife.com.

Brand context:
yaopulife tells authentic Chinese myths, zodiac, festivals and cultural stories for global readers. The illustration should help international audiences feel the beauty, emotion and meaning of Chinese culture without becoming cliché or overly decorative.

Core visual direction:
New Chinese healing narrative illustration.
Warm, poetic, clean, gentle, slightly mystical, culturally grounded, and globally approachable.

Style:
Ink-inspired hand-drawn linework, soft paper texture, restrained color palette, large negative space, simple but expressive forms, cute but not childish, elegant but not stiff.

Palette:
Use yaopulife brand tones:
- warm paper white or rice paper beige as the background
- deep ink brown-black for lines and textural details
- cinnabar red as the main accent
- jade green or bamboo green as a secondary accent
- muted moon gold only when necessary and very sparingly

Composition:
One clear main subject.
One clear emotion.
One to three Chinese cultural symbols only.
Use 60% to 75% negative space.
Avoid clutter.
The image should feel like a quiet story, not a busy poster.

Linework:
Organic hand-drawn ink lines.
Slightly imperfect.
Soft edges.
Subtle dry-brush texture.
No hard vector look.

Mood:
Choose one dominant emotion only:
warmth, courage, longing, calmness, joy, wonder, loneliness, mischief, resilience, reunion, mystery.

Output use:
Website hero sections, article covers, zodiac cards, festival cards, social media covers, Pinterest pins, and short-video cover art.

Avoid:
Do not imitate any existing artist or influencer.
Do not copy existing compositions.
Do not use famous copyrighted characters.
Do not make it look like a generic AI fantasy poster.
Do not overuse red, gold, dragons, clouds or lanterns.
Do not create a crowded guochao poster.
Do not make the character look like a low-age cartoon mascot.
```

## 可变量模板 · Variable Template

```text
Create an original yaopulife illustration.

Subject:
{{subject}}

Story theme:
{{story_theme}}

Audience:
{{audience}}

Main emotion:
{{emotion}}

Cultural symbols:
{{symbol_1}}, {{symbol_2}}, {{symbol_3}}

Format:
{{format}}

Caption style:
{{caption_style}}

Visual direction:
New Chinese healing narrative illustration.
Warm paper texture background.
Deep ink hand-drawn linework.
Large negative space.
Cinnabar red accent.
Optional jade green or bamboo green secondary accent.
Simple, poetic, globally understandable.

Composition:
{{composition}}

Character direction:
{{character_direction}}

Do not:
Do not imitate any existing artist.
Do not copy any online image.
Do not use copyrighted IP.
Do not create a crowded guochao poster.
Do not over-decorate.
Do not use more than four main colors.
```

变量字段:`subject` `story_theme` `audience` `emotion` `symbol_1` `symbol_2` `symbol_3` `format` `caption_style` `composition` `character_direction`
