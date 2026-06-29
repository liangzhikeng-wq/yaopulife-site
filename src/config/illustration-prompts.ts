// yaopulife 首批插画 prompt 数据(12 生肖 + 6 神话 + 6 节日 = 24)
// 完整结构化版见 prompts/illustration/{zodiac,myths,festivals}.md。
// 每条 prompt 自包含,可直接喂 Claude Design / 本地 ComfyUI。

export type IllustrationPrompt = {
  id: string;
  series: "zodiac" | "myths" | "festivals";
  title: string;
  subject: string;
  emotion: string;
  symbols: string[];
  aspectRatio: "1:1" | "4:5" | "3:4" | "16:9" | "9:16";
  prompt: string;
};

const STYLE =
  "Style: New Chinese healing narrative illustration — organic hand-drawn ink lines, soft warm rice-paper texture, restrained palette (max 4 colors: paper, deep ink, cinnabar red, plus one of jade/bamboo-green/moon-gold), 60–75% negative space, cute but not childish, poetic and clean. Avoid: imitating any artist/influencer, copyrighted IP, crowded guochao poster, over-decoration, hard vector look, photorealism.";

export const illustrationPrompts: IllustrationPrompt[] = [
  // ---------- Zodiac ----------
  {
    id: "zodiac-rat", series: "zodiac", title: "Rat",
    subject: "A small clever rat with bright curious eyes, holding a tiny scroll.",
    emotion: "cleverness, alertness, quiet confidence",
    symbols: ["moonlight", "rice grains", "red seal stamp"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Rat. A small clever rat with bright curious eyes holding a tiny scroll, sitting slightly below center with large negative space above (central-character). Emotion: cleverness, alertness, quiet confidence. Symbols: moonlight, rice grains, a small red seal stamp. ${STYLE}`,
  },
  {
    id: "zodiac-ox", series: "zodiac", title: "Ox",
    subject: "A gentle strong ox resting beside a simple plow line.",
    emotion: "patience, strength, reliability",
    symbols: ["distant field line", "morning sun", "bamboo-green grass"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Ox. A gentle strong ox resting beside a single soft ink ground line (one-line small world). Emotion: patience, strength, reliability. Symbols: distant field line, morning cinnabar sun, restrained bamboo-green grass. ${STYLE}`,
  },
  {
    id: "zodiac-tiger", series: "zodiac", title: "Tiger",
    subject: "A round young tiger trying to look brave, soft but determined.",
    emotion: "courage with warmth",
    symbols: ["pine branch", "mountain stone", "cinnabar seal"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Tiger. A round young tiger trying to look brave with a soft determined expression, taking ~55% of the frame with minimal background (ink animal persona). Emotion: courage with warmth. Symbols: pine branch, mountain stone, cinnabar seal; dry-brush stripes, muted moon-gold only on the eyes. ${STYLE}`,
  },
  {
    id: "zodiac-rabbit", series: "zodiac", title: "Rabbit",
    subject: "A soft white rabbit looking up at the moon.",
    emotion: "gentleness, hope, quiet wonder",
    symbols: ["full moon", "osmanthus branch", "light cloud pattern"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Rabbit. A soft white rabbit below looking up at a full moon above with lots of breathing space (moon gate). Emotion: gentleness, hope, quiet wonder. Symbols: full moon, osmanthus branch, light cloud; pale jade shadow, tiny cinnabar seal. ${STYLE}`,
  },
  {
    id: "zodiac-dragon", series: "zodiac", title: "Dragon",
    subject: "A friendly young Chinese dragon curling through a small cloud.",
    emotion: "mystery, dignity, protection",
    symbols: ["cloud pattern", "water ripple", "cinnabar sun"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Dragon. A friendly young Chinese dragon curling through a small cloud, its curve leading the eye (editorial story cover). Emotion: mystery, dignity, protection. Symbols: cloud pattern, water ripple, cinnabar sun; muted jade. No Western dragon, no game monster, no gold-heavy imperial poster. ${STYLE}`,
  },
  {
    id: "zodiac-snake", series: "zodiac", title: "Snake",
    subject: "A graceful small snake coiled around a bamboo branch.",
    emotion: "wisdom, calmness, quiet mystery",
    symbols: ["bamboo leaves", "crescent moon", "seal stamp"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Snake. A graceful small snake coiled around a vertical bamboo branch (central character). Emotion: wisdom, calmness, quiet mystery. Symbols: bamboo leaves, crescent moon, seal stamp; jade green accent, cinnabar seal. No scary snake, no hyperrealistic scales, no horror mood. ${STYLE}`,
  },
  {
    id: "zodiac-horse", series: "zodiac", title: "Horse",
    subject: "A lively horse taking a joyful small leap.",
    emotion: "freedom, energy, optimism",
    symbols: ["wind line", "distant mountain", "red sun"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Horse. A lively horse taking a joyful small leap with open space in front of it (one-line small world). Emotion: freedom, energy, optimism. Symbols: a wind line, distant mountain, cinnabar sun; muted bamboo-green shadow. No racing poster, no realistic muscular horse. ${STYLE}`,
  },
  {
    id: "zodiac-goat", series: "zodiac", title: "Goat",
    subject: "A gentle goat holding a small plum branch.",
    emotion: "kindness, softness, peace",
    symbols: ["plum blossom", "mountain mist", "seal stamp"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Goat. A gentle goat with a soft rounded silhouette holding a small plum branch, large negative space (central character). Emotion: kindness, softness, peace. Symbols: plum blossom, mountain mist, seal stamp; very light jade and cinnabar. ${STYLE}`,
  },
  {
    id: "zodiac-monkey", series: "zodiac", title: "Monkey",
    subject: "A clever little monkey on a branch holding a peach, mischievous.",
    emotion: "mischief, wit, joyful rebellion",
    symbols: ["peach", "cloud curl", "cinnabar seal"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Monkey. A clever little monkey sitting on a branch (the horizontal line) holding a peach, looking mischievous (one-line small world). Emotion: mischief, wit, joyful rebellion. Symbols: peach, cloud curl, cinnabar seal; muted jade leaves. No direct Sun Wukong copying, no copyrighted cues. ${STYLE}`,
  },
  {
    id: "zodiac-rooster", series: "zodiac", title: "Rooster",
    subject: "A proud but funny rooster standing tall with tiny determined eyes.",
    emotion: "confidence, morning energy, humor",
    symbols: ["rising sun", "roof tile", "rice paper seal"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Rooster. A proud but funny rooster standing tall with tiny determined eyes, instantly recognizable silhouette, minimal background (central character). Emotion: confidence, morning energy, humor. Symbols: rising sun, roof tile, seal; cinnabar comb. No aggressive fighting rooster, no farm realism. ${STYLE}`,
  },
  {
    id: "zodiac-dog", series: "zodiac", title: "Dog",
    subject: "A loyal dog sitting quietly beside a small lantern.",
    emotion: "loyalty, warmth, protection",
    symbols: ["lantern", "moonlight", "tiled roof shadow"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Dog. A loyal dog sitting below with a soft lantern glow above (editorial story cover). Emotion: loyalty, warmth, protection. Symbols: lantern, moonlight, tiled-roof shadow; cinnabar lantern accent, soft muted gold glow. No modern pet portrait, no photoreal fur. ${STYLE}`,
  },
  {
    id: "zodiac-pig", series: "zodiac", title: "Pig",
    subject: "A round happy pig lying comfortably beside a tea cup.",
    emotion: "contentment, abundance, ease",
    symbols: ["tea cup", "small cloud pattern", "cinnabar seal"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife zodiac illustration of the Pig. A round happy pig lying comfortably beside a tea cup, large quiet negative space (central character). Emotion: contentment, abundance, ease. Symbols: tea cup, small cloud, cinnabar seal; cinnabar blush, jade tea cup. No greedy stereotype, no low-age cartoon. ${STYLE}`,
  },

  // ---------- Myths ----------
  {
    id: "myth-sun-wukong", series: "myths", title: "Sun Wukong",
    subject: "A stone-born monkey hero standing on a mountain rock, looking to the sky.",
    emotion: "rebellion, courage, destiny",
    symbols: ["mountain stone", "cloud pattern", "cinnabar sun"],
    aspectRatio: "3:4",
    prompt: `Create an original yaopulife myth illustration inspired by Sun Wukong. A stone-born monkey hero standing on a simple mountain rock looking toward the sky — small but powerful in large negative space (editorial story cover). Emotion: rebellion, courage, destiny. Symbols: mountain stone, cloud pattern, cinnabar sun; muted jade cloud, mythic but not aggressive. Do NOT copy any film/anime/game/book Wukong design, no golden-armor overload, no game poster. ${STYLE}`,
  },
  {
    id: "myth-change", series: "myths", title: "Chang'e",
    subject: "A graceful moon woman seen from behind, near the full moon.",
    emotion: "longing, loneliness, beauty",
    symbols: ["full moon", "osmanthus branch", "cloud ribbon"],
    aspectRatio: "3:4",
    prompt: `Create an original yaopulife myth illustration inspired by Chang'e. A graceful moon woman seen from behind standing quietly near a large full moon as the quiet emotional center (moon gate). Emotion: longing, loneliness, beauty. Symbols: full moon, osmanthus branch, cloud ribbon; pale jade shadow, tiny cinnabar seal, poetic and restrained. No glamorous fantasy princess, no crowded palace. ${STYLE}`,
  },
  {
    id: "myth-nezha", series: "myths", title: "Nezha",
    subject: "A young mythic child standing firmly with a determined expression.",
    emotion: "defiance, self-definition, fierce innocence",
    symbols: ["wind ribbon", "lotus", "flame-like cinnabar accent"],
    aspectRatio: "3:4",
    prompt: `Create an original yaopulife myth illustration inspired by Nezha. A young mythic child standing firmly and determined, with circular motion around the figure (central character). Emotion: defiance, self-definition, fierce innocence. Symbols: wind ribbon, lotus, a small flame-like cinnabar accent; muted jade lotus, strong but not violent. Do NOT copy any movie/animation Nezha, no fire-heavy action poster. ${STYLE}`,
  },
  {
    id: "myth-hou-yi", series: "myths", title: "Hou Yi",
    subject: "A calm archer lowering his bow after shooting the suns.",
    emotion: "heroism, sacrifice, quiet sadness",
    symbols: ["one remaining red sun", "distant mountains", "bow silhouette"],
    aspectRatio: "3:4",
    prompt: `Create an original yaopulife myth illustration inspired by Hou Yi. A calm archer below lowering his bow, one remaining red sun far above (editorial story cover). Emotion: heroism, sacrifice, quiet sadness. Symbols: one red sun, misty distant mountains, bow silhouette; poetic and heroic, restrained. No violent battlefield, no muscular fantasy warrior. ${STYLE}`,
  },
  {
    id: "myth-white-snake", series: "myths", title: "White Snake",
    subject: "A gentle white snake spirit near a bridge, half-symbolic in feeling.",
    emotion: "forbidden love, tenderness, fate",
    symbols: ["bridge", "mist", "water ripple", "pale moon"],
    aspectRatio: "3:4",
    prompt: `Create an original yaopulife myth illustration inspired by the White Snake legend. A gentle white snake spirit near a bridge, half-symbolic and half-human in feeling without being literal; mist and water as emotional space (moon gate / editorial). Emotion: forbidden love, tenderness, fate. Symbols: bridge, mist, water ripple, pale moon; jade water ripple, small cinnabar seal. No horror snake woman, no seductive fantasy poster, no film copying. ${STYLE}`,
  },
  {
    id: "myth-shanhaijing", series: "myths", title: "Classic of Mountains and Seas",
    subject: "A strange gentle mythical beast in a quiet ancient landscape.",
    emotion: "wonder, mystery, discovery",
    symbols: ["ancient mountain", "scroll edge", "cloud pattern"],
    aspectRatio: "3:4",
    prompt: `Create an original yaopulife illustration inspired by the Classic of Mountains and Seas. A strange gentle mythical beast as the clear subject in a quiet ancient landscape with a large empty paper background (editorial story cover). Emotion: wonder, mystery, discovery. Symbols: ancient mountain, scroll edge, cloud pattern; jade accent, cinnabar seal, ancient field-guide feeling but friendly and modern. No monster horror, no hyper-detailed creature, no game concept art. ${STYLE}`,
  },

  // ---------- Festivals ----------
  {
    id: "festival-mid-autumn", series: "festivals", title: "Mid-Autumn Festival",
    subject: "A small family silhouette sharing mooncakes under a full moon.",
    emotion: "reunion, longing, warmth",
    symbols: ["full moon", "mooncake", "lantern", "osmanthus branch"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife festival illustration for Mid-Autumn Festival. A small family silhouette below sharing mooncakes under a full moon above, large warm negative space (moon gate). Emotion: reunion, longing, warmth. Symbols: full moon, mooncake, lantern, osmanthus; cinnabar lantern accent, muted moon-gold glow. No commercial mooncake-ad look, no crowded poster. ${STYLE}`,
  },
  {
    id: "festival-lunar-new-year", series: "festivals", title: "Lunar New Year",
    subject: "A small child placing a red paper charm beside a quiet doorway.",
    emotion: "new beginning, protection, joy",
    symbols: ["red paper charm", "lantern", "door frame", "firecracker shape"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife festival illustration for Lunar New Year. A small child placing a red paper charm beside a quiet doorway used as a simple vertical frame (editorial story cover). Emotion: new beginning, protection, joy. Symbols: red paper charm, lantern, door frame, a tiny firecracker shape; cinnabar as main accent, muted gold sparingly. No overuse of red and gold, no crowded shopping poster. ${STYLE}`,
  },
  {
    id: "festival-dragon-boat", series: "festivals", title: "Dragon Boat Festival",
    subject: "A small dragon boat on quiet water with a wrapped zongzi nearby.",
    emotion: "memory, courage, river spirit",
    symbols: ["dragon boat", "water ripple", "zongzi leaf", "bamboo green"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife festival illustration for Dragon Boat Festival. A small dragon boat floating on a quiet water surface (the horizontal line) with a wrapped zongzi nearby (one-line small world). Emotion: memory, courage, river spirit. Symbols: dragon boat, water ripple, zongzi leaf; bamboo-green zongzi accent, cinnabar seal. No sports-event poster, no crowded race scene. ${STYLE}`,
  },
  {
    id: "festival-qingming", series: "festivals", title: "Qingming Festival",
    subject: "A small figure holding a willow branch on a misty path.",
    emotion: "remembrance, tenderness, spring rain",
    symbols: ["willow branch", "soft rain dots", "distant hill"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife festival illustration for Qingming Festival. A small figure holding a willow branch on a misty path, lots of misty negative space (editorial story cover). Emotion: remembrance, tenderness, spring rain. Symbols: willow branch, soft rain dots, distant hill; warm-gray paper, pale jade willow, very small cinnabar seal. No dark funeral mood, keep it gentle and respectful. ${STYLE}`,
  },
  {
    id: "festival-lantern", series: "festivals", title: "Lantern Festival",
    subject: "A child looking up at one glowing lantern.",
    emotion: "wonder, joy, completion",
    symbols: ["lantern", "full moon", "soft cloud pattern"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife festival illustration for Lantern Festival. A child below looking up at one glowing lantern above, plenty of warm empty space (central story moment). Emotion: wonder, joy, completion. Symbols: lantern, full moon, soft cloud; cinnabar lantern, muted moon-gold glow. No crowded lantern market, no neon lights. ${STYLE}`,
  },
  {
    id: "festival-qixi", series: "festivals", title: "Qixi Festival",
    subject: "Two small figures on opposite sides of a quiet river of stars.",
    emotion: "longing, love, distance",
    symbols: ["star river", "magpie bridge", "crescent moon"],
    aspectRatio: "4:5",
    prompt: `Create an original yaopulife festival illustration for Qixi Festival. Two small figures standing on opposite sides of a quiet river of stars that gently divides the composition (editorial story cover). Emotion: longing, love, distance. Symbols: star river, magpie bridge, crescent moon; muted jade night accent, tiny cinnabar seal. No Western Valentine cliché, no overly romantic fantasy poster. ${STYLE}`,
  },
];

export const promptsBySeries = {
  zodiac: illustrationPrompts.filter((p) => p.series === "zodiac"),
  myths: illustrationPrompts.filter((p) => p.series === "myths"),
  festivals: illustrationPrompts.filter((p) => p.series === "festivals"),
};
