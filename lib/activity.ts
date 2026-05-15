import type { ActivityItem } from "@/components/activity-feed";
import type { AgentActivity, AgentActivityStage } from "@/types/campaign";

const BASE_ITEMS: Readonly<ActivityItem[]> = [
  {
    id: "input",
    label: "Input received",
    description: "Validating text, file, or URL inputs.",
    status: "idle",
  },
  {
    id: "research",
    label: "Research Agent",
    description: "Extracting product facts and risks.",
    status: "idle",
  },
  {
    id: "fact_sheet",
    label: "Fact sheet",
    description: "Building the structured source of truth.",
    status: "idle",
  },
  {
    id: "copywriting",
    label: "Copywriter Agent",
    description: "Drafting blog, social thread, and email teaser.",
    status: "idle",
  },
  {
    id: "regeneration",
    label: "Regeneration",
    description: "Revising drafts based on editor feedback.",
    status: "idle",
  },
  {
    id: "editor_review",
    label: "Editor-in-Chief",
    description: "Auditing outputs for accuracy and tone.",
    status: "idle",
  },
  {
    id: "completed",
    label: "Campaign completed",
    description: "Outputs approved and ready to export.",
    status: "idle",
  },
];

const STAGE_TO_ID: Record<AgentActivityStage, ActivityItem["id"] | null> = {
  received_input: "input",
  research: "research",
  fact_sheet: "fact_sheet",
  copywriting: "copywriting",
  editor_review: "editor_review",
  regeneration: "regeneration",
  completed: "completed",
};

export function createBaseActivityItems(): ActivityItem[] {
  return BASE_ITEMS.map((item) => ({ ...item }));
}

export function mergeActivitiesIntoFeed(activities?: AgentActivity[]): ActivityItem[] {
  const items = createBaseActivityItems();
  if (!activities?.length) {
    return items;
  }

  const lookup = new Map(items.map((item) => [item.id, item]));

  for (const activity of activities) {
    const id = STAGE_TO_ID[activity.stage];
    if (!id) {
      continue;
    }
    const item = lookup.get(id);
    if (!item) {
      continue;
    }
    item.status = activity.status;
    item.description = activity.message;
    item.attempt = activity.attempt;
  }

  return items;
}

export function setActivityStatus(
  items: ActivityItem[],
  id: ActivityItem["id"],
  status: ActivityItem["status"],
  description?: string,
  attempt?: number,
) {
  const item = items.find((entry) => entry.id === id);
  if (item) {
    item.status = status;
    if (description) {
      item.description = description;
    }
    if (attempt !== undefined) {
      item.attempt = attempt;
    }
  }
}
