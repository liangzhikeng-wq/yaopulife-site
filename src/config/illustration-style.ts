// yaopulife 视觉生产系统 · JSON 化风格配置
// Yaopu Agent OS 数字员工 / Claude Design 统一引用。色板规范源 src/styles/tokens.css。

export const yaopuIllustrationStyle = {
  brand: "yaopulife",
  styleName: "New Chinese Healing Narrative Illustration",
  version: "1.0.0",

  brandContext: {
    mission:
      "Tell authentic Chinese myths, zodiac, festivals and cultural stories for global readers.",
    audience:
      "International readers curious about Chinese culture, plus Chinese users who value poetic and authentic cultural storytelling.",
    tone:
      "warm, poetic, authentic, gentle, clean, slightly mystical, globally approachable",
  },

  palette: {
    paper: "#F7F1E8",
    warmPaper: "#EFE6D8",
    mist: "#D8CEC0",
    inkLight: "#8C8377",
    ink: "#2F2A26",
    deepInk: "#1D1A17",
    cinnabar: "#B6432A",
    vermilionLight: "#C95A3C",
    jade: "#6F8F85",
    bambooGreen: "#829B6E",
    moonGold: "#C9A96B",
  },

  visualRules: {
    maxMainColors: 4,
    negativeSpace: "60% to 75%",
    culturalSymbolsPerImage: "1 to 3",
    linework:
      "organic hand-drawn ink-inspired lines, slightly imperfect, soft edges, dry-brush texture",
    background:
      "warm rice paper texture, quiet and breathable, never pure flat white",
  },

  compositionTemplates: [
    {
      id: "central-character",
      name: "Central Character",
      useFor: ["zodiac", "animal persona", "character card"],
      rule:
        "Place the subject slightly below center with large negative space around it.",
    },
    {
      id: "moon-gate",
      name: "Moon Gate / Circle Frame",
      useFor: ["myths", "festivals", "poetic story covers"],
      rule:
        "Use a circle, moon gate, fan or round frame to hold a minimal poetic scene.",
    },
    {
      id: "one-line-small-world",
      name: "One-line Small World",
      useFor: ["knowledge card", "series illustration", "social media"],
      rule:
        "Use one horizontal line as ground, branch, water surface or table; characters interact around it.",
    },
    {
      id: "ink-animal-persona",
      name: "Ink Animal Persona",
      useFor: ["zodiac", "beasts", "mascot-like characters"],
      rule:
        "Animal subject takes 50% to 60% of image, with expressive posture and minimal background.",
    },
    {
      id: "editorial-story-cover",
      name: "Editorial Story Cover",
      useFor: ["article cover", "myth story", "festival explainer"],
      rule:
        "Use one narrative moment, one symbol and a clean editorial composition.",
    },
  ],

  culturalSymbols: [
    "red sun",
    "moon",
    "bamboo leaves",
    "distant mountains",
    "cloud pattern",
    "lantern",
    "moon gate",
    "seal stamp",
    "pine branch",
    "lotus leaf",
    "water ripple",
    "tiled roof",
    "small boat",
    "plum branch",
    "tea cup",
    "scroll",
    "fan",
  ],

  avoid: [
    "imitating any existing artist or influencer",
    "copying existing compositions",
    "famous copyrighted characters",
    "generic AI fantasy poster",
    "crowded guochao poster",
    "overusing red and gold",
    "low-age cartoon mascot style",
    "photorealistic rendering",
    "hard vector look",
  ],
} as const;

export type YaopuIllustrationStyle = typeof yaopuIllustrationStyle;
