import { aiClient, ensureApiKey, getDefaultModel } from "@/lib/ai";
import { messageContentToString } from "@/lib/ai-utils";
import { extractJson, parseJson } from "@/lib/json";
import { editorAgentSystemPrompt } from "@/prompts/editor-agent";
import type { CopywriterAgentResult, EditorAgentResult, ResearchAgentResult } from "@/types/campaign";

interface EditorAgentParams {
  research: ResearchAgentResult;
  copy: CopywriterAgentResult;
  attempt: number;
}

export async function runEditorAgent({ research, copy, attempt }: EditorAgentParams): Promise<EditorAgentResult> {
  ensureApiKey();

  const payload = {
    fact_sheet: research.factSheet,
    generated_content: copy,
    attempt,
  };

  const response = await aiClient.chat.completions.create({
    model: getDefaultModel(),
    temperature: 0,
    messages: [
      {
        role: "system",
        content: editorAgentSystemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(payload, null, 2),
      },
    ],
  });

  const completion = response.choices[0];
  if (!completion || completion.finish_reason === "length") {
    throw new Error("Editor Agent response was truncated. Try again with shorter input.");
  }

  const content = messageContentToString(completion.message.content);
  const json = parseJson<EditorAgentResult>(extractJson(content), "Editor Agent");

  return json;
}
