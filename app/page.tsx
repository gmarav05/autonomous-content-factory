import Link from "next/link";

import { ActivityFeed } from "@/components/activity-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Source-of-truth extraction",
    description:
      "Research Agent distills messy product notes into reliable structured facts so downstream AI stays grounded.",
  },
  {
    title: "Multi-channel content",
    description:
      "Copywriter Agent turns the fact sheet into a blog summary, LinkedIn post, and snackable teaser in one pass.",
  },
  {
    title: "Claim validation",
    description:
      "Editor Agent flags exaggerations, unsupported claims, and risky language before anything ships.",
  },
];

const workflowSteps = [
  {
    id: "research",
    label: "Research Agent",
    description: "Extracts canonical product data, pricing, and risks.",
  },
  {
    id: "factsheet",
    label: "Fact Sheet",
    description: "Builds a markdown-ready dossier for every marketing channel.",
  },
  {
    id: "copywriter",
    label: "Copywriter Agent",
    description: "Drafts channel-specific assets with optional tone and audience hints.",
  },
  {
    id: "editor",
    label: "Editor Agent",
    description: "Approves or returns revisions with confidence scoring.",
  },
];

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16 md:px-10 lg:py-20">
        <HeroSection />
        <section className="grid gap-10 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/70 bg-card/80 p-8 shadow-[0_0_30px_rgba(124,58,237,0.08)] transition-colors hover:border-primary/60 hover:bg-card"
            >
              <Badge variant="outline" className="mb-4 text-primary">
                {feature.title.split(" ")[0]}
              </Badge>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-[0_0_40px_rgba(59,130,246,0.05)]">
            <Badge variant="outline" className="mb-4 text-primary">
              Workflow
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Three trusted agents, one shipping-ready pipeline
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Paste raw notes or upload markdown, guide the tone and audience, and ship a complete campaign
              with confidence. Each agent leaves a traceable artifact, so every claim is easy to verify during the
              interview walkthrough.
            </p>
            <div className="mt-8 grid gap-6">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="grid gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className={cn("flex items-center justify-between", index === 0 ? "text-primary" : "")}
                  >
                    <span className="text-sm font-semibold tracking-tight">{step.label}</span>
                    <span className="text-xs text-muted-foreground">Phase {index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-[0_0_40px_rgba(94,98,255,0.08)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Live activity feed
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Every run captures research, generation, and QA checkpoints for the interview demo.
            </p>
            <ActivityFeed
              className="mt-6"
              items={workflowSteps.map((step, index) => ({
                id: step.id,
                label: step.label,
                description: step.description,
                status: index === 0 ? "processing" : "idle",
              }))}
            />
          </aside>
        </section>

        <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Ready to build your interview-ready campaign?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Launch the builder, drop in your product notes, and walk recruiters through a clean, auditable AI
            workflow.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 md:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/builder">
                Start campaign build
                <span aria-hidden>→</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/results">Preview results layout</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-center">
      <div className="space-y-6">
        <Badge className="bg-primary/20 text-primary">Internship Ready</Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Autonomous Content Factory
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          A lean AI production line that turns raw product context into validated marketing assets. Explain the
          workflow in minutes, demo it end-to-end, and hand over dependable campaign outputs.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/builder">
              Launch Campaign Builder
              <span aria-hidden>→</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="#workflow">Explore the workflow</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
          <span>Research Agent</span>
          <span>Copywriter Agent</span>
          <span>Editor Agent</span>
          <span>Fact Sheet</span>
        </div>
      </div>
      <div
        id="workflow"
        className="relative rounded-3xl border border-border/80 bg-gradient-to-br from-background/80 via-background/40 to-primary/10 p-6 shadow-[0_10px_60px_rgba(30,64,175,0.25)]"
      >
        <div className="rounded-2xl border border-border/70 bg-background/80 p-6">
          <p className="text-sm font-medium text-muted-foreground">Latest Run Snapshot</p>
          <div className="mt-6 space-y-4">
            {["Notes ingested", "Facts synthesized", "Campaign drafted", "Claims validated"].map(
              (item, index) => (
                <div key={item} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item}</span>
                  <span className={cn("font-semibold", index < 3 ? "text-emerald-400" : "text-primary")}>
                    {index < 3 ? "Complete" : "Ready"}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
