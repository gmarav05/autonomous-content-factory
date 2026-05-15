"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CampaignSnapshot } from "@/hooks/use-campaign-store";
import type { AgentActivity, CampaignResult, EditorAgentResult, SocialThreadPost } from "@/types/campaign";

type RequestMeta = CampaignSnapshot["request"];

const CONTENT_TABS = ["blog", "social", "email"] as const;
type ContentTab = (typeof CONTENT_TABS)[number];

interface ResultsViewProps {
  title: string;
  request: RequestMeta;
  campaign: CampaignResult;
  activity: AgentActivity[];
  onReset?: () => void;
}

export function ResultsView({ title, request, campaign, activity, onReset }: ResultsViewProps) {
  const { research, finalOutput, editor, attempts } = campaign;
  const factSheet = research.factSheet;
  const blog = finalOutput.blog;
  const social = finalOutput.social_thread;
  const email = finalOutput.email_teaser;

  const campaignKitMarkdown = useMemo(() => buildCampaignKitMarkdown(title, factSheet, blog.body_markdown, social, email), [
    title,
    factSheet,
    blog.body_markdown,
    social,
    email,
  ]);

  const generatedTimestamp = useMemo(() => {
    const reversed = [...activity].reverse();
    const completed = reversed.find((entry) => entry.stage === "completed");
    const reference = completed ?? reversed[0];
    return reference?.timestamp ?? new Date().toISOString();
  }, [activity]);

  const formattedGeneratedAt = useMemo(() => formatTimestamp(generatedTimestamp), [generatedTimestamp]);

  const attemptsUsed = Math.max(attempts.length || 0, editor ? 1 : 0, 1);

  const quickStats = useMemo(
    () => [
      { label: "Blog", value: `${blog.word_count} words` },
      { label: "Social", value: `${social.length} posts` },
      { label: "Email", value: `${email.word_count} words` },
      { label: "Attempts", value: `${attemptsUsed}x` },
    ],
    [blog.word_count, social.length, email.word_count, attemptsUsed],
  );

  const timelineItems = useMemo(() => buildTimelineItems(activity), [activity]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ request, research, finalOutput, editor, attempts }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(title)}-campaign-kit.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadContent = (tab: ContentTab) => {
    let contents = "";
    let extension = "txt";

    if (tab === "blog") {
      contents = blog.body_markdown;
      extension = "md";
    } else if (tab === "social") {
      contents = social
        .map((post) => `Post ${post.post_number}: ${post.headline}\n${post.content}`)
        .join("\n\n");
    } else {
      contents = `${email.content}\n\nCTA: ${email.call_to_action}`;
    }

    const blob = new Blob([contents], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(title)}-${tab}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
      <HeroSummary
        title={title}
        subtitle={factSheet.core_value_proposition}
        generatedAt={formattedGeneratedAt}
        quickStats={quickStats}
        editor={editor}
        onReset={onReset}
        campaignKitMarkdown={campaignKitMarkdown}
        downloadJson={downloadJson}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SourceSummaryCard request={request} factSheet={factSheet} />
        <FactSheetSummaryCard factSheet={factSheet} markdown={research.factSheetMarkdown} />
        <EditorOverviewCard editor={editor} factSheet={factSheet} attemptsUsed={attemptsUsed} />
      </section>

      <section className="mt-8">
        <ContentTabsSection
          title={title}
          blog={blog}
          social={social}
          email={email}
          valueProp={factSheet.core_value_proposition}
          onDownload={downloadContent}
        />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <ActivityTimelineSection items={timelineItems} />
        <RegenerationSummary attempts={attempts} />
      </section>

      <section className="mt-8">
        <DeveloperDetails
          factSheetJson={research.factSheetJson}
          factSheetMarkdown={research.factSheetMarkdown}
          editor={editor}
          activity={activity}
          attempts={attempts}
          campaignKitMarkdown={campaignKitMarkdown}
          downloadJson={downloadJson}
        />
      </section>
    </div>
  );
}

function HeroSummary({
  title,
  subtitle,
  generatedAt,
  quickStats,
  editor,
  onReset,
  campaignKitMarkdown,
  downloadJson,
}: {
  title: string;
  subtitle: string | null;
  generatedAt: string;
  quickStats: Array<{ label: string; value: string }>;
  editor: EditorAgentResult;
  onReset?: () => void;
  campaignKitMarkdown: string;
  downloadJson: () => void;
}) {
  const issueCount = editor.issues_found.length;
  const statusIsApproved = editor.status === "APPROVED";

  return (
    <section className="rounded-2xl border border-border/70 bg-card/85 p-6 shadow-[0_10px_40px_rgba(46,33,137,0.25)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">Campaign summary</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground md:text-[28px]">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle ?? "Final campaign kit generated by Autonomous Content Factory."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">Generated {generatedAt}</span>
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">Confidence {Math.round(editor.confidence_score)}%</span>
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">Issues {issueCount}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickStats.map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs"
              >
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                <span className="font-medium text-foreground">{stat.value}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={campaignKitMarkdown} label="Copy campaign kit" variant="secondary" size="sm" />
            <Button type="button" variant="outline" size="sm" onClick={downloadJson}>
              Download JSON kit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onReset} disabled={!onReset}>
              {statusIsApproved ? "Run another campaign" : "Retry generation"}
            </Button>
          </div>
        </div>
        <ApprovalCard editor={editor} onReset={onReset} />
      </div>
    </section>
  );
}

function ApprovalCard({ editor, onReset }: { editor: EditorAgentResult; onReset?: () => void }) {
  const confidence = Math.round(editor.confidence_score);
  const issueCount = editor.issues_found.length;
  const statusIsApproved = editor.status === "APPROVED";
  const statusClasses = statusIsApproved ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-amber-300 bg-amber-500/10 border-amber-500/30";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border/70 bg-background/70 p-5 backdrop-blur">
      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", statusClasses)}>
          {statusIsApproved ? "Approved" : "Rejected"}
        </span>
        Editor verdict
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Confidence</p>
        <p className="text-3xl font-semibold text-foreground">{confidence}%</p>
        <ConfidenceBar value={confidence} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="rounded-xl border border-border/60 bg-background/70 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em]">Issues</p>
          <p className="mt-1 text-lg font-medium text-foreground">{issueCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/70 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em]">Checklist</p>
          <p className="mt-1 text-lg font-medium text-foreground">{editor.checklist.filter((item) => item.passed).length}/{editor.checklist.length}</p>
        </div>
      </div>
      <Button type="button" variant={statusIsApproved ? "secondary" : "outline"} size="sm" className="mt-4 w-full" onClick={onReset} disabled={!onReset}>
        {statusIsApproved ? "Launch new campaign" : "Regenerate copy"}
      </Button>
    </div>
  );
}

function SourceSummaryCard({ request, factSheet }: { request: RequestMeta; factSheet: CampaignResult["research"]["factSheet"] }) {
  const notesPreview = request.notes ? truncate(request.notes, 160) : "No notes provided.";
  const channels: string[] = [];
  if (request.notes) channels.push("Notes");
  if (request.fileName) channels.push("File");
  if (request.referenceUrl) channels.push("URL");
  const inputType = channels.length ? channels.join(" • ") : "None";
  const sourceLength = request.notes ? `${countWords(request.notes)} words` : request.fileName ? "File upload" : "—";

  return (
    <OverviewCard title="Source Summary" subtitle="What we ingested for this campaign">
      <p className="rounded-xl border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">{notesPreview}</p>
      <div className="grid gap-3 text-xs text-muted-foreground">
        <InfoRow label="Audience" value={request.audienceHint ?? "Not provided"} />
        <InfoRow label="Tone" value={request.tone ?? "Default"} />
        <InfoRow label="Input type" value={inputType} />
        <InfoRow label="Source length" value={sourceLength} />
        {factSheet.ambiguous_statements.length ? (
          <InfoRow label="Ambiguous claims" value={`${factSheet.ambiguous_statements.length}`} />
        ) : null}
      </div>
    </OverviewCard>
  );
}

function FactSheetSummaryCard({ factSheet, markdown }: { factSheet: CampaignResult["research"]["factSheet"]; markdown: string }) {
  const [expanded, setExpanded] = useState(false);
  const keyBenefits = factSheet.key_benefits.slice(0, 2).join(" • ") || "No key benefits captured";
  const pricingMention = factSheet.pricing[0] ?? "Pricing not provided";
  const targetAudience = factSheet.target_audience.slice(0, 2).join(" • ") || "Audience not captured";

  return (
    <OverviewCard title="Fact Sheet" subtitle="Highlights from the research agent">
      <div className="grid gap-3 text-xs text-muted-foreground">
        <InfoRow label="Product" value={factSheet.product_name ?? "Untitled product"} />
        <InfoRow label="Target audience" value={targetAudience} />
        <InfoRow label="Key benefits" value={keyBenefits} />
        <InfoRow label="Pricing" value={pricingMention} />
        <InfoRow label="Ambiguous claims" value={`${factSheet.ambiguous_statements.length}`} />
      </div>
      <button
        type="button"
        className="mt-3 inline-flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground hover:border-border"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span>View full fact sheet</span>
        <span className="text-sm text-foreground">{expanded ? "−" : "+"}</span>
      </button>
      {expanded ? (
        <div className="mt-3 space-y-3 rounded-xl border border-border/60 bg-background/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Full markdown</p>
            <CopyButton value={markdown} size="sm" />
          </div>
          <article className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>
        </div>
      ) : null}
    </OverviewCard>
  );
}

function EditorOverviewCard({ editor, factSheet, attemptsUsed }: { editor: EditorAgentResult; factSheet: CampaignResult["research"]["factSheet"]; attemptsUsed: number }) {
  const approvedClaims = factSheet.approved_claims.length;
  const hallucinationIssues = editor.issues_found.filter((issue) => issue.category === "hallucination").length;
  const unsupportedClaims = editor.issues_found.filter((issue) => issue.category === "value_proposition" || issue.category === "formatting").length;
  const revisions = attemptsUsed > 1 ? `${attemptsUsed - 1} revisions` : "Approved on first pass";

  return (
    <OverviewCard title="Editor Review" subtitle="Quality and compliance snapshot">
      <div className="grid gap-3 text-xs text-muted-foreground">
        <InfoRow label="Approved claims" value={`${approvedClaims}`} />
        <InfoRow label="Hallucination checks" value={hallucinationIssues ? `${hallucinationIssues} flagged` : "None"} />
        <InfoRow label="Unsupported claims" value={unsupportedClaims ? `${unsupportedClaims} flagged` : "None"} />
        <InfoRow label="Revision status" value={revisions} />
      </div>
      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Confidence</p>
        <div className="mt-2">
          <ConfidenceBar value={Math.round(editor.confidence_score)} />
        </div>
      </div>
    </OverviewCard>
  );
}

function ContentTabsSection({
  title,
  blog,
  social,
  email,
  valueProp,
  onDownload,
}: {
  title: string;
  blog: CampaignResult["finalOutput"]["blog"];
  social: SocialThreadPost[];
  email: CampaignResult["finalOutput"]["email_teaser"];
  valueProp: string | null;
  onDownload: (tab: ContentTab) => void;
}) {
  const [activeTab, setActiveTab] = useState<ContentTab>("blog");

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80">
      <div className="flex flex-wrap border-b border-border/70 bg-background/50 text-xs">
        {CONTENT_TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 min-w-[120px] px-4 py-3 font-medium uppercase tracking-[0.2em] transition",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "blog" ? "Blog" : tab === "social" ? "Social Thread" : "Email Teaser"}
            </button>
          );
        })}
      </div>
      <div className="space-y-4 p-6">
        {activeTab === "blog" ? (
          <BlogContent blog={blog} onDownload={() => onDownload("blog")} />
        ) : activeTab === "social" ? (
          <SocialContent posts={social} onDownload={() => onDownload("social")} />
        ) : (
          <EmailContent email={email} valueProp={valueProp} onDownload={() => onDownload("email")} />
        )}
        <div className="text-xs text-muted-foreground">Exported file names use the campaign slug derived from “{title}”.</div>
      </div>
    </div>
  );
}

function BlogContent({ blog, onDownload }: { blog: CampaignResult["finalOutput"]["blog"]; onDownload: () => void }) {
  const paragraphs = useMemo(
    () =>
      blog.body_markdown
        .split(/\n{2,}/)
        .map((segment) => segment.replace(/\n+/g, " ").trim())
        .filter(Boolean),
    [blog.body_markdown],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-foreground">{blog.title}</p>
          <p className="text-xs text-muted-foreground">Word count: {blog.word_count}</p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton value={blog.body_markdown} size="sm" />
          <Button type="button" variant="outline" size="sm" onClick={onDownload}>
            Download
          </Button>
        </div>
      </div>
      {blog.outline.length ? (
        <div className="rounded-xl border border-border/60 bg-background/60 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Outline</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {blog.outline.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="space-y-3 text-sm leading-7 text-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-pretty">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function SocialContent({ posts, onDownload }: { posts: SocialThreadPost[]; onDownload: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-foreground">Social Thread</p>
          <p className="text-xs text-muted-foreground">Exactly {posts.length} posts, ready to schedule.</p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton value={posts.map((post) => `Post ${post.post_number}: ${post.headline}\n${post.content}`).join("\n\n")} size="sm" />
          <Button type="button" variant="outline" size="sm" onClick={onDownload}>
            Download
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.post_number} className="rounded-xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-[0.2em] text-primary">Post {post.post_number}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{post.headline}</p>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailContent({ email, valueProp, onDownload }: { email: CampaignResult["finalOutput"]["email_teaser"]; valueProp: string | null; onDownload: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-foreground">Email Teaser</p>
          <p className="text-xs text-muted-foreground">Word count: {email.word_count}</p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton value={email.content} size="sm" />
          <Button type="button" variant="outline" size="sm" onClick={onDownload}>
            Download
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-background/60 p-5">
        <p className="text-sm text-muted-foreground whitespace-pre-line">{email.content}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>CTA</span>
          <span className="font-medium text-foreground">{email.call_to_action}</span>
        </div>
        {valueProp ? <p className="mt-3 text-xs text-muted-foreground">Anchored in: {valueProp}</p> : null}
      </div>
    </div>
  );
}

function ActivityTimelineSection({ items }: { items: TimelineItem[] }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Agent activity</p>
        <h2 className="text-xl font-semibold text-foreground">Workflow timeline</h2>
      </div>
      <ul className="space-y-6">
        {items.map((item, index) => (
          <li key={item.id} className="relative pl-8">
            {index !== items.length - 1 ? (
              <span className="absolute left-[6px] top-5 h-[calc(100%-12px)] w-px bg-gradient-to-b from-border/70 via-border/40 to-transparent" />
            ) : null}
            <span className="absolute left-0 top-3 flex h-4 w-4 items-center justify-center rounded-full border border-border/60 bg-card shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <span className={cn("h-2.5 w-2.5 rounded-full", indicatorClass(item.status))} />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                {item.attempt ? (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                    Attempt {item.attempt}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">{item.timestampLabel}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{item.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RegenerationSummary({ attempts }: { attempts: CampaignResult["attempts"] }) {
  if (!attempts.length) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/70 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Regeneration history</p>
        <p className="mt-2 text-sm text-muted-foreground">Editor approved the campaign on the first pass.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Regeneration history</p>
      <h3 className="mt-1 text-lg font-semibold text-foreground">{attempts.length} attempt{attempts.length > 1 ? "s" : ""}</h3>
      <div className="mt-4 space-y-3 text-xs text-muted-foreground">
        {attempts.map((attempt) => (
          <div key={attempt.attempt} className="rounded-xl border border-border/60 bg-background/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">Attempt {attempt.attempt}</p>
              <span className={cn("text-[11px] uppercase tracking-[0.2em]", attempt.editor.status === "APPROVED" ? "text-emerald-400" : "text-amber-300")}>Editor {attempt.editor.status.toLowerCase()}</span>
            </div>
            {attempt.editor.correction_notes.length ? (
              <ul className="mt-2 space-y-1">
                {attempt.editor.correction_notes.map((note, index) => (
                  <li key={index}>• {note}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2">No correction notes recorded.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DeveloperDetails({
  factSheetJson,
  factSheetMarkdown,
  editor,
  activity,
  attempts,
  campaignKitMarkdown,
  downloadJson,
}: {
  factSheetJson: CampaignResult["research"]["factSheet"];
  factSheetMarkdown: string;
  editor: EditorAgentResult;
  activity: AgentActivity[];
  attempts: CampaignResult["attempts"];
  campaignKitMarkdown: string;
  downloadJson: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-6 py-4 text-sm font-medium text-foreground hover:bg-background/60"
      >
        <span className="uppercase tracking-[0.2em] text-muted-foreground">Developer Details</span>
        <span className="text-2xl leading-none text-muted-foreground">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border/70 p-6">
          <div className="flex flex-wrap gap-2">
            <CopyButton value={campaignKitMarkdown} label="Copy campaign kit" size="sm" />
            <Button type="button" variant="outline" size="sm" onClick={downloadJson}>
              Download JSON kit
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fact sheet JSON</p>
                <CopyButton value={JSON.stringify(factSheetJson, null, 2)} size="sm" />
              </div>
              <pre className="mt-3 max-h-64 overflow-auto text-[11px] leading-relaxed text-muted-foreground">
{JSON.stringify(factSheetJson, null, 2)}
              </pre>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Editor checklist</p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {editor.checklist.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-2">
                    <span>{item.label}</span>
                    <span className={item.passed ? "text-emerald-400" : "text-amber-300"}>{item.passed ? "Pass" : "Flag"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Activity log</p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {activity.map((entry, index) => (
                <li key={`${entry.stage}-${entry.timestamp}-${index}`}>
                  {stageLabel(entry.stage)} — {entry.status} — {entry.message}
                </li>
              ))}
            </ul>
          </div>
          {attempts.length ? (
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Attempt payloads</p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {attempts.map((attempt) => (
                  <li key={attempt.attempt}>
                    Attempt {attempt.attempt}: {attempt.editor.status} — {attempt.editor.correction_notes.join("; ") || "No notes"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fact sheet markdown</p>
            <article className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{factSheetMarkdown}</ReactMarkdown>
            </article>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OverviewCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-background/60 px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const width = Math.min(Math.max(value, 0), 100);
  return (
    <div className="h-2 w-full rounded-full bg-border/60">
      <div className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/40" style={{ width: `${width}%` }} />
    </div>
  );
}

interface TimelineItem {
  id: string;
  label: string;
  message: string;
  status: AgentActivity["status"];
  attempt?: number;
  timestampLabel: string;
}

function buildTimelineItems(activity: AgentActivity[]): TimelineItem[] {
  if (!activity.length) {
    return [
      {
        id: "pending",
        label: "Awaiting workflow",
        message: "No activity logged yet.",
        status: "idle",
        timestampLabel: "—",
      },
    ];
  }

  return activity.map((entry, index) => ({
    id: `${entry.stage}-${entry.timestamp}-${index}`,
    label: stageLabel(entry.stage),
    message: entry.message,
    status: entry.status,
    attempt: entry.attempt,
    timestampLabel: formatTimestamp(entry.timestamp),
  }));
}

function stageLabel(stage: AgentActivity["stage"]): string {
  switch (stage) {
    case "received_input":
      return "Input received";
    case "research":
      return "Research agent";
    case "fact_sheet":
      return "Fact sheet";
    case "copywriting":
      return "Copywriter agent";
    case "editor_review":
      return "Editor-in-chief";
    case "regeneration":
      return "Regeneration";
    case "completed":
      return "Workflow complete";
    default:
      return stage;
  }
}

function indicatorClass(status: AgentActivity["status"]) {
  switch (status) {
    case "approved":
      return "bg-emerald-500/80";
    case "rejected":
      return "bg-amber-500/80";
    case "error":
      return "bg-destructive";
    case "reviewing":
      return "bg-primary/80";
    case "processing":
      return "bg-primary/60";
    case "thinking":
      return "bg-muted-foreground";
    default:
      return "bg-border";
  }
}

function buildCampaignKitMarkdown(
  title: string,
  factSheet: CampaignResult["research"]["factSheet"],
  blogMarkdown: string,
  social: SocialThreadPost[],
  email: CampaignResult["finalOutput"]["email_teaser"],
) {
  const socialText = social
    .map((post) => `Post ${post.post_number}:\n${post.headline}\n${post.content}`)
    .join("\n\n");

  return `# ${title} — Campaign Kit

## Fact Sheet JSON
${"```json"}\n${JSON.stringify(factSheet, null, 2)}\n${"```"}

## Blog Article
${blogMarkdown}

## Social Thread (5 posts)
${socialText}

## Email Teaser
${email.content}\n\nCTA: ${email.call_to_action}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function truncate(value: string, max: number) {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max)}…`;
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
