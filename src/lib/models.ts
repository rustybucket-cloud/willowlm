import { PERPLEXITY_MODELS } from "~/server/providers/perplexity";
import { OPENAI_MODELS } from "~/server/providers/openAI";
import { ANTHROPIC_MODELS } from "~/server/providers/anthropic";

export const MODELS = [
  ...OPENAI_MODELS,
  ...PERPLEXITY_MODELS,
  ...ANTHROPIC_MODELS,
] as const;
