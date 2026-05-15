import { aiClient, ensureApiKey, getDefaultModel } from "@/lib/ai";
import { messageContentToString } from "@/lib/ai-utils";
import { extractJson, parseJson } from "@/lib/json";
import { copywriterAgentSystemPrompt } from "@/prompts/copywriter-agent";
import type { CopywriterAgentResult, ResearchAgentResult } from "@/types/campaign";

interface CopywriterAgentParams {
  research: ResearchAgentResult;
  audienceHint?: string;
  tone?: string;
  correctionNotes?: string[];
}

export async function runCopywriterAgent({
  research,
  audienceHint = "",
  tone = "Professional",
  correctionNotes = [],
}: CopywriterAgentParams): Promise<CopywriterAgentResult> {
  ensureApiKey();

  const payload = {
    fact_sheet: research.factSheet,
    audience_hint: audienceHint,
    requested_tone: tone,
    correction_notes: correctionNotes,
  };

  const response = await aiClient.chat.completions.create({
    model: getDefaultModel(),
    temperature: correctionNotes.length > 0 ? 0.4 : 0.55,
    messages: [
      {
        role: "system",
        content: copywriterAgentSystemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(payload, null, 2),
      },
    ],
  });

  const completion = response.choices[0];
  if (!completion || completion.finish_reason === "length") {
    throw new Error("Copywriter Agent response was truncated. Try again with shorter input.");
  }

  const content = messageContentToString(completion.message.content);
  const json = parseJson<CopywriterAgentResult>(extractJson(content), "Copywriter Agent");

  return json;
}
