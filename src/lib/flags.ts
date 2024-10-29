import { unstable_flag as flag } from "@vercel/flags/next";

export const showGemini = flag({
  key: "showGemini",
  decide: () => process.env.SHOW_GEMINI === "true",
});
