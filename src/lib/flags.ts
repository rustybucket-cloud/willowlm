import { unstable_flag as flag } from "@vercel/flags/next";

export const showAnthropic = flag({
  key: "show-anthropic",
  decide: () => false,
});

export const showGemini = flag({
  key: "show-gemini",
  decide: () => false,
});

export const showPerplexity = flag({
  key: "show-perplexity",
  decide: () => false,
});
