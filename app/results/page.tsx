import { ResultsClient } from "@/components/results/results-client";
import type { CampaignSnapshot } from "@/hooks/use-campaign-store";
import type { CampaignResponse } from "@/types/campaign";

const factSheetData = {
  product_name: "SageFlow Analytics",
  product_category: "Revenue intelligence platform",
  core_value_proposition: "Transforms siloed GTM telemetry into weekly narratives leadership trusts.",
  target_audience: ["RevOps leaders", "Marketing analytics directors", "Growth-stage SaaS teams"],
  features: [
    "Unified customer telemetry across product, marketing, and sales systems",
    "Attribution modeling workspace",
    "Automated QBR narrative generation",
  ],
  technical_specs: ["Integrates with HubSpot, Salesforce, and NetSuite", "Exports to Slack and Google Slides", "SOC 2 Type II compliant"],
  pricing: ["Pilot tier from $1,250/month including implementation"],
  integrations: ["Salesforce", "HubSpot", "NetSuite", "Snowflake"],
  key_benefits: ["Removes manual spreadsheet reconciliation", "Creates leadership-ready stories", "Keeps teams aligned on one source of truth"],
  limitations: ["Requires clean CRM opportunity stages", "Advanced attribution features need Snowflake connection"],
  ambiguous_statements: ["Best-in-class insights"],
  approved_claims: [
    "Pilot tier from $1,250/month",
    "Integrates with HubSpot, Salesforce, and NetSuite",
    "Generates weekly narratives for leadership",
  ],
};

const placeholderResponse: CampaignResponse = {
  success: true,
  activity: [
    { stage: "received_input", status: "approved", message: "Sample input validated.", timestamp: new Date().toISOString() },
    { stage: "research", status: "approved", message: "Research Agent extracted facts for demo.", timestamp: new Date().toISOString() },
    { stage: "fact_sheet", status: "approved", message: "Fact sheet compiled from demo data.", timestamp: new Date().toISOString() },
    { stage: "copywriting", status: "approved", message: "Copywriter Agent drafted campaign assets.", timestamp: new Date().toISOString() },
    { stage: "editor_review", status: "approved", message: "Editor Agent approved the assets.", timestamp: new Date().toISOString() },
    { stage: "completed", status: "approved", message: "Demo campaign ready to share.", timestamp: new Date().toISOString() },
  ],
  data: {
    research: {
      factSheet: factSheetData,
      factSheetMarkdown: `## SageFlow Analytics Fact Sheet

### Product
- SageFlow Analytics — revenue intelligence platform for growth-stage SaaS

### Core Value Proposition
- Transforms siloed go-to-market telemetry into weekly narratives leadership trusts.

### Target Audience
- RevOps leaders
- Marketing analytics directors
- Growth-stage SaaS teams

### Features
- Unified customer telemetry across product, marketing, and sales systems
- Attribution modeling workspace
- Automated QBR narrative generation

### Technical Specs
- Integrates with HubSpot, Salesforce, and NetSuite
- Exports to Slack and Google Slides
- SOC 2 Type II compliant

### Pricing
- Pilot tier from $1,250/month including implementation

### Integrations
- Salesforce
- HubSpot
- NetSuite
- Snowflake

### Key Benefits
- Removes manual spreadsheet reconciliation
- Creates leadership-ready stories
- Keeps teams aligned on one source of truth

### Limitations
- Requires clean CRM opportunity stages
- Advanced attribution features need Snowflake connection

### Ambiguous Statements
- "Best-in-class insights"
`,
      factSheetJson: factSheetData,
    },
    finalOutput: {
      blog: {
        title: "How SageFlow Analytics gives RevOps leaders a weekly command center",
        word_count: 512,
        outline: [
          "Introduction: Leadership-ready narratives without spreadsheet chaos",
          "Problem: Fragmented telemetry stalls revenue reviews",
          "Features: Unified data flows, attribution workspace, automated storytelling",
          "Value Proposition: Weekly narratives grounded in shared facts",
          "Audience Relevance: RevOps teams at growth-stage SaaS",
          "Conclusion & CTA: Run a pilot and ship your first QBR narrative",
        ],
        body_markdown: `# How SageFlow Analytics gives RevOps leaders a weekly command center

## Introduction
Growth-stage SaaS teams rarely suffer from a lack of data. Instead, go-to-market telemetry sprawls across product analytics, CRM dashboards, campaign reports, and countless spreadsheets. SageFlow Analytics replaces that hodgepodge with a shared command center that translates telemetry into a weekly leadership story built on facts your teams already trust.

## Problem
When every revenue meeting begins with reconciling conflicting numbers, leaders never reach decisions quickly. Marketing depends on campaign platforms, product uses its own dashboards, and RevOps carries the burden of merging it all together. Analysts burn late nights stitching CSV exports while stakeholders lose confidence in the metrics.

## Features
- Unified customer telemetry that pulls product usage, opportunity stages, and marketing performance into a single surface.
- An attribution modeling workspace that lets RevOps compare influence scenarios while keeping live backing data intact.
- Automated narrative generation tuned for weekly QBRs so every section of the deck references one shared fact sheet.

## Value Proposition
SageFlow Analytics transforms siloed GTM telemetry into weekly narratives leadership trusts. The platform keeps every metric anchored in the same fact sheet so executives spend their time responding to trends, not questioning the numbers.

## Audience Relevance
RevOps leaders, marketing analytics directors, and broader revenue teams at growth-stage SaaS companies finally ship reports that align marketing spend, product activation, and sales velocity. Because the workspace integrates with Salesforce, HubSpot, NetSuite, and Snowflake, RevOps does not need to rebuild data pipelines to adopt it.

## Conclusion & CTA
Launch a pilot tier for $1,250 per month and ship your first automated QBR narrative in under three weeks. Your leadership team receives one command center, one story, and one source of truth every Monday.
`,
      },
      social_thread: [
        {
          post_number: 1,
          headline: "Leadership-ready revenue stories without spreadsheet chaos",
          content: "RevOps teams use SageFlow Analytics to unify product, marketing, and sales telemetry. One workspace, one fact sheet, one weekly narrative leadership actually trusts.",
        },
        {
          post_number: 2,
          headline: "Telemetry finally lives in one command center",
          content: "Integrates with Salesforce, HubSpot, NetSuite, and Snowflake so you never rebuild dashboards. Attribution, usage, and pipeline sync automatically.",
        },
        {
          post_number: 3,
          headline: "QBR decks that update themselves",
          content: "Automated narratives translate metrics into decisions. No more scrambling to reconcile conflicting spreadsheets before leadership meetings.",
        },
        {
          post_number: 4,
          headline: "Built for growth-stage SaaS RevOps",
          content: "Designed for teams scaling revenue motions across product-led and sales-led motions. SOC 2 Type II compliant so security teams sign off quickly.",
        },
        {
          post_number: 5,
          headline: "Pilot tier ships in under three weeks",
          content: "$1,250/month including implementation. See your first unified narrative before the next board prep cycle. DM for the fact sheet.",
        },
      ],
      email_teaser: {
        word_count: 94,
        content: "Hi team,\n\nRevenue reviews do not need to start with spreadsheet triage. SageFlow Analytics pulls product usage, campaign performance, and pipeline telemetry into one fact sheet so you publish a leadership-ready narrative every week. RevOps leaders at growth-stage SaaS companies trust it because attribution models and alerts stay inside the systems you already manage.\n\nReady to see how the pilot tier works?",
        call_to_action: "Book a 30-minute pilot walkthrough",
      },
      regeneration_notes: [],
    },
    editor: {
      status: "APPROVED",
      confidence_score: 94,
      issues_found: [],
      correction_notes: [],
      checklist: [
        { label: "Blog length 500-550 words", passed: true },
        { label: "Blog tone professional/trustworthy", passed: true },
        { label: "Social thread has 5 distinct posts", passed: true },
        { label: "Core value proposition present in all assets", passed: true },
        { label: "No hallucinated claims", passed: true },
        { label: "Email teaser under 120 words with CTA", passed: true },
      ],
      approvals: [
        { asset: "blog", status: "APPROVED" },
        { asset: "social_thread", status: "APPROVED" },
        { asset: "email_teaser", status: "APPROVED" },
      ],
    },
    attempts: [],
  },
};

const placeholderSnapshot: CampaignSnapshot = {
  request: {
    notes: "SageFlow Analytics is a revenue intelligence platform for RevOps leaders who need weekly leadership narratives.",
    audienceHint: "RevOps teams at growth-stage SaaS companies",
    tone: "Informative",
    fileName: null,
    referenceUrl: null,
  },
  response: placeholderResponse,
};

export default function ResultsPage() {
  return <ResultsClient fallback={placeholderSnapshot} />;
}
