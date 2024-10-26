import { unstable_flag as flag } from "@vercel/flags/next";

export const showAnthropic = flag({
  key: "showAnthropic",
  decide: () => process.env.SHOW_ANTHROPIC === "true",
});

export const showGemini = flag({
  key: "showGemini",
  decide: () => process.env.SHOW_GEMINI === "true",
});

export const showPerplexity = flag({
  key: "showPerplexity",
  decide: () => process.env.SHOW_PERPLEXITY === "true",
});
