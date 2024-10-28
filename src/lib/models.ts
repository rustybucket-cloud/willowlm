import { PERPLEXITY_MODELS } from "~/server/providers/perplexity";
import { OPENAI_MODELS } from "~/server/providers/openAI";

export const MODELS = [...OPENAI_MODELS, ...PERPLEXITY_MODELS] as const;
