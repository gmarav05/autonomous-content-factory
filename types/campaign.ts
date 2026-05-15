export interface CampaignRequest {
  notes: string;
  audienceHint?: string;
  tone?: string;
  fileName?: string;
  fileContent?: string;
  referenceUrl?: string;
}

export interface FactSheet {
  product_name: string | null;
  product_category: string | null;
  core_value_proposition: string | null;
  target_audience: string[];
  features: string[];
  technical_specs: string[];
  pricing: string[];
  integrations: string[];
  key_benefits: string[];
  limitations: string[];
  ambiguous_statements: string[];
  approved_claims: string[];
}

export interface ResearchAgentResult {
  factSheet: FactSheet;
  factSheetMarkdown: string;
  factSheetJson: FactSheet;
  sourceSummary?: {
    referenceUrl?: string | null;
    urlContentExcerpt?: string | null;
    uploadedFileName?: string | null;
  };
}

export interface BlogArticle {
  title: string;
  word_count: number;
  body_markdown: string;
  outline: string[];
}

export interface SocialThreadPost {
  post_number: number;
  headline: string;
  content: string;
}

export interface EmailTeaser {
  word_count: number;
  content: string;
  call_to_action: string;
}

export interface CopywriterAgentResult {
  blog: BlogArticle;
  social_thread: SocialThreadPost[];
  email_teaser: EmailTeaser;
  regeneration_notes?: string[];
}

export type EditorStatus = "APPROVED" | "REJECTED";

export interface EditorIssue {
  category: "hallucination" | "length" | "tone" | "value_proposition" | "formatting" | "other";
  message: string;
}

export interface EditorChecklistItem {
  label: string;
  passed: boolean;
}

export interface EditorAgentResult {
  status: EditorStatus;
  confidence_score: number;
  issues_found: EditorIssue[];
  correction_notes: string[];
  checklist: EditorChecklistItem[];
  approvals?: Array<{
    asset: "blog" | "social_thread" | "email_teaser";
    status: "APPROVED" | "REJECTED";
    notes?: string;
  }>;
}

export interface CampaignAttempt {
  copy: CopywriterAgentResult;
  editor: EditorAgentResult;
  attempt: number;
}

export interface CampaignResult {
  research: ResearchAgentResult;
  finalOutput: CopywriterAgentResult;
  editor: EditorAgentResult;
  attempts: CampaignAttempt[];
}

export interface CampaignResponse {
  success: boolean;
  data?: CampaignResult;
  activity?: AgentActivity[];
  error?: string;
}

export type AgentActivityStage =
  | "received_input"
  | "research"
  | "fact_sheet"
  | "copywriting"
  | "editor_review"
  | "regeneration"
  | "completed";

export type ActivityItemId =
  | "input"
  | "research"
  | "fact_sheet"
  | "copywriting"
  | "editor_review"
  | "regeneration"
  | "completed";

export type AgentActivityStatus =
  | "idle"
  | "thinking"
  | "processing"
  | "reviewing"
  | "approved"
  | "rejected"
  | "error";

export interface AgentActivity {
  stage: AgentActivityStage;
  status: AgentActivityStatus;
  message: string;
  timestamp: string;
  attempt?: number;
}
