import { aiClient, ensureApiKey, getDefaultModel } from "@/lib/ai";
import { messageContentToString } from "@/lib/ai-utils";
import { extractJson, parseJson } from "@/lib/json";
import { researchAgentSystemPrompt } from "@/prompts/research-agent";
import type { CampaignRequest, ResearchAgentResult } from "@/types/campaign";

interface ResearchAgentParams {
  input: CampaignRequest;
  urlContent?: string | null;
}

export async function runResearchAgent({ input, urlContent = null }: ResearchAgentParams): Promise<ResearchAgentResult> {
  ensureApiKey();

  const payload = {
    sources: {
      notes: input.notes?.trim() || null,
      file: {
        name: input.fileName ?? null,
        content: input.fileContent?.trim() || null,
      },
      url: {
        referenceUrl: input.referenceUrl ?? null,
        content: urlContent,
      },
    },
  };

  const response = await aiClient.chat.completions.create({
    model: getDefaultModel(),
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: researchAgentSystemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(payload, null, 2),
      },
    ],
  });

  const completion = response.choices[0];
  if (!completion || completion.finish_reason === "length") {
    throw new Error("Research Agent response was truncated. Try again with shorter input.");
  }

  const content = messageContentToString(completion.message.content);
  const json = parseJson<ResearchAgentResult>(extractJson(content), "Research Agent");

  return json;
}
