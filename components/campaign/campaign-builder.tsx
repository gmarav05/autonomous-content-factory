"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload } from "lucide-react";

import { ActivityFeed, type ActivityItem } from "@/components/activity-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBaseActivityItems, mergeActivitiesIntoFeed, setActivityStatus } from "@/lib/activity";
import { useCampaignStore } from "@/hooks/use-campaign-store";
import type { CampaignResponse } from "@/types/campaign";

interface CampaignBuilderProps {
  onSuccess?: (response: CampaignResponse) => void;
}

const toneOptions = [
  "Informative",
  "Energetic",
  "Visionary",
  "Confident",
  "Playful",
];

export function CampaignBuilder({ onSuccess }: CampaignBuilderProps) {
  const router = useRouter();
  const { setSnapshot } = useCampaignStore();
  const [notes, setNotes] = useState("");
  const [audienceHint, setAudienceHint] = useState("");
  const [tone, setTone] = useState(toneOptions[0]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(() => createBaseActivityItems());
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return notes.trim().length > 0 || !!fileName || referenceUrl.trim().length > 0;
  }, [notes, fileName, referenceUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName(null);
      return;
    }

    if (!/(md|txt)$/i.test(file.name.split(".").pop() ?? "")) {
      setFileName(null);
      alert("Please upload a .txt or .md file.");
      return;
    }

    setFileName(file.name);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Add notes, upload a .txt/.md file, or provide a reference URL to continue.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const file = (formData.get("file") as File | null) ?? null;
    const fileContent = file ? await file.text() : undefined;

    setIsSubmitting(true);
    const baseActivities = createBaseActivityItems();
    setActivityStatus(baseActivities, "input", "processing", "Validating inputs and sources...");
    setActivityItems(baseActivities);

    try {
      const trimmedReferenceUrl = referenceUrl.trim();
      const payload = {
        notes,
        audienceHint,
        tone,
        fileName: file?.name ?? fileName ?? undefined,
        fileContent,
        referenceUrl: trimmedReferenceUrl ? trimmedReferenceUrl : undefined,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as CampaignResponse;
      setActivityItems(mergeActivitiesIntoFeed(data.activity));

      if (!response.ok || !data.success || !data.data) {
        setError(data.error ?? "Unable to generate campaign. Please try again.");
        return;
      }

      setSnapshot({
        request: {
          notes,
          audienceHint,
          tone,
          fileName: file?.name ?? fileName ?? null,
          referenceUrl: trimmedReferenceUrl || null,
        },
        response: data,
      });

      onSuccess?.(data);
      router.push("/results");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      const failedActivities = createBaseActivityItems();
      setActivityStatus(
        failedActivities,
        "completed",
        "error",
        "Workflow interrupted before completion. Please try again.",
      );
      setActivityItems(failedActivities);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:px-10 lg:grid-cols-[1.6fr_1fr]">
      <section className="space-y-6">
        <header className="space-y-2">
          <BadgeLabel>Campaign Builder</BadgeLabel>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Grounded marketing assets in minutes
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Paste customer research, upload product docs, or mix both. Choose a tone and audience hint, then let the
            agents synthesize a shareable campaign package.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-[0_0_40px_rgba(89,86,233,0.06)]"
        >
          {error ? (
            <div className="mb-6 rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Paste product notes</Label>
              <Textarea
                id="notes"
                placeholder="Drop product context here. Calls to action, key features, pricing, differentiators..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We recommend ~2-4 short paragraphs. The Research Agent will extract structured facts.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="audience">Audience hint</Label>
                <Input
                  id="audience"
                  placeholder="e.g. Growth marketing leads at Series B SaaS startups"
                  value={audienceHint}
                  onChange={(event) => setAudienceHint(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <div className="relative">
                  <select
                    id="tone"
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {toneOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    ▼
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceUrl">Reference URL (optional)</Label>
              <Input
                id="referenceUrl"
                placeholder="https://example.com/product-brief"
                type="url"
                value={referenceUrl}
                onChange={(event) => setReferenceUrl(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We’ll fetch up to 20k characters from this page to enrich the fact sheet.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Upload reference file (optional)</Label>
              <label
                htmlFor="file"
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-10 text-center transition hover:border-primary/60"
              >
                <div className="rounded-full border border-border/70 bg-card/70 p-3 text-primary">
                  <Upload className="h-5 w-5" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Drop a .txt or .md file</p>
                  <p className="text-xs text-muted-foreground">
                    Supports meeting transcripts, release notes, and product briefs.
                  </p>
                </div>
                {fileName ? (
                  <div className="mt-2 flex items-center gap-2 rounded-full border border-border/50 bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    <span className="truncate" title={fileName}>
                      {fileName}
                    </span>
                  </div>
                ) : null}
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".txt,.md"
                className="sr-only"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              We never send files to third-party storage. Uploads are streamed directly to the OpenRouter workflow.
            </p>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button type="submit" size="lg" className="min-w-[180px]" disabled={isSubmitting || !isValid}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Generating...
                  </span>
                ) : (
                  "Generate campaign"
                )}
              </Button>
              {!isValid ? (
                <span className="text-xs text-muted-foreground">
                  Add notes, upload a reference file, or provide a URL to enable generation.
                </span>
              ) : null}
            </div>
          </div>
        </form>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-card/80 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Activity feed
          </h2>
          <ActivityFeed items={activityItems} className="mt-5" />
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/80 p-6">
          <h3 className="text-sm font-semibold text-foreground">Passing the interview demo</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• Start with a real or anonymized product brief for credibility.</li>
            <li>• Highlight how unsupported claims are caught before publishing.</li>
            <li>• Emphasize zero-database architecture—everything stays local.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function BadgeLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
      {children}
    </span>
  );
}
