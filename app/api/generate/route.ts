import { NextResponse } from "next/server";

import { runCopywriterAgent } from "@/agents/copywriter-agent";
import { runEditorAgent } from "@/agents/editor-agent";
import { runResearchAgent } from "@/agents/research-agent";
import type {
  AgentActivity,
  AgentActivityStage,
  AgentActivityStatus,
  CampaignAttempt,
  CampaignRequest,
  CampaignResponse,
  CopywriterAgentResult,
  EditorAgentResult,
} from "@/types/campaign";

const MAX_INPUT_LENGTH = 8_000;
const MAX_ATTEMPTS = 3;

export async function POST(request: Request) {
  const activities: AgentActivity[] = [];

  try {
    const body = (await request.json()) as CampaignRequest | null;
    if (!body) {
      return createErrorResponse("Invalid JSON payload.", activities, 400);
    }

    const trimmedNotes = body.notes?.trim() ?? "";
    const trimmedFileContent = body.fileContent?.trim() ?? "";

    if (!trimmedNotes && !trimmedFileContent && !body.referenceUrl) {
      return createErrorResponse(
        "Provide product notes, upload a supported file, or include a reference URL.",
        activities,
        400,
      );
    }

    if (trimmedNotes.length > MAX_INPUT_LENGTH || trimmedFileContent.length > MAX_INPUT_LENGTH) {
      return createErrorResponse(
        "Input is too long. Please shorten the notes or file content and try again.",
        activities,
        400,
      );
    }

    logActivity(activities, "received_input", "Input received and validated.", "approved");

    const urlContent = body.referenceUrl ? await fetchReferenceContent(body.referenceUrl) : null;

    logActivity(activities, "research", "Research Agent is parsing sources for factual data.", "thinking");
    const research = await runResearchAgent({
      input: {
        ...body,
        notes: trimmedNotes,
        fileContent: trimmedFileContent,
      },
      urlContent,
    });
    logActivity(activities, "research", "Research Agent extracted facts.", "approved");
    logActivity(activities, "fact_sheet", "Fact sheet compiled as source of truth.", "approved");

    const attempts: CampaignAttempt[] = [];
    let attempt = 0;
    let editor: EditorAgentResult | null = null;
    let finalCopy: CopywriterAgentResult | null = null;
    let correctionNotes: string[] = [];

    while (attempt < MAX_ATTEMPTS) {
      attempt += 1;
      const stageStatus: AgentActivityStatus = attempt === 1 ? "processing" : "thinking";
      logActivity(
        activities,
        attempt === 1 ? "copywriting" : "regeneration",
        attempt === 1
          ? "Copywriter Agent drafting campaign assets from fact sheet."
          : `Copywriter Agent revising assets (attempt ${attempt}).`,
        stageStatus,
        attempt,
      );

      const copy = await runCopywriterAgent({
        research,
        audienceHint: body.audienceHint,
        tone: body.tone,
        correctionNotes,
      });

      logActivity(
        activities,
        attempt === 1 ? "copywriting" : "regeneration",
        attempt === 1
          ? "Copywriter Agent completed first draft."
          : `Copywriter Agent submitted revised draft (attempt ${attempt}).`,
        "approved",
        attempt,
      );

      logActivity(
        activities,
        "editor_review",
        attempt === 1
          ? "Editor Agent auditing generated assets."
          : `Editor Agent auditing revised assets (attempt ${attempt}).`,
        "reviewing",
        attempt,
      );
      editor = await runEditorAgent({ research, copy, attempt });

      const editorStatus: AgentActivityStatus = editor.status === "APPROVED" ? "approved" : "rejected";
      logActivity(
        activities,
        "editor_review",
        editor.status === "APPROVED"
          ? "Editor Agent approved the campaign assets."
          : "Editor Agent rejected the campaign assets.",
        editorStatus,
        attempt,
      );

      attempts.push({ copy, editor, attempt });

      if (editor.status === "APPROVED") {
        finalCopy = copy;
        break;
      }

      correctionNotes = editor.correction_notes ?? [];
      if (!correctionNotes.length) {
        break;
      }
    }

    if (!editor || editor.status !== "APPROVED" || !finalCopy) {
      logActivity(
        activities,
        "completed",
        "Workflow ended without editor approval. Review notes and try again.",
        "rejected",
      );
      return createErrorResponse(
        "Editor Agent was unable to approve the campaign after multiple attempts. See correction notes for guidance.",
        activities,
        422,
      );
    }

    logActivity(activities, "completed", "Campaign generation finished successfully.", "approved");

    const response: CampaignResponse = {
      success: true,
      data: {
        research,
        finalOutput: finalCopy,
        editor,
        attempts,
      },
      activity: activities,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    logActivity(activities, "completed", message, "error");
    return createErrorResponse(message, activities, 500);
  }
}

async function fetchReferenceContent(referenceUrl: string): Promise<string | null> {
  try {
    const response = await fetch(referenceUrl, {
      headers: {
        "User-Agent": "Autonomous-Content-Factory/1.0",
        Accept: "text/html, text/plain",
      },
    });
    if (!response.ok) {
      return null;
    }
    const text = await response.text();
    return text.slice(0, 20_000);
  } catch (error) {
    console.warn("Failed to fetch reference URL", error);
    return null;
  }
}

function logActivity(
  activities: AgentActivity[],
  stage: AgentActivityStage,
  message: string,
  status: AgentActivityStatus,
  attempt?: number,
) {
  activities.push({
    stage,
    message,
    status,
    attempt,
    timestamp: new Date().toISOString(),
  });
}

function createErrorResponse(message: string, activities: AgentActivity[], status = 500) {
  const response: CampaignResponse = {
    success: false,
    error: message,
    activity: activities,
  };

  return NextResponse.json(response, { status });
}
