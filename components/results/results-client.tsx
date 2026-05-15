"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { ResultsView } from "@/components/results/results-view";
import { setCampaignSnapshot, type CampaignSnapshot, useCampaignStore } from "@/hooks/use-campaign-store";
import type { CampaignResult } from "@/types/campaign";

interface ResultsClientProps {
  fallback: CampaignSnapshot;
}

export function ResultsClient({ fallback }: ResultsClientProps) {
  const router = useRouter();
  const { snapshot } = useCampaignStore();

  const activeSnapshot: CampaignSnapshot = useMemo(() => {
    if (snapshot?.response?.data) {
      return snapshot;
    }
    return fallback;
  }, [snapshot, fallback]);

  const campaign = activeSnapshot.response.data as CampaignResult | undefined;
  const activity = activeSnapshot.response.activity ?? [];

  if (!campaign) {
    return null;
  }

  const productName = campaign.research.factSheet.product_name ?? activeSnapshot.request.notes.split("\n")[0] ?? "Campaign";

  function handleReset() {
    setCampaignSnapshot(null);
    router.push("/builder");
  }

  return (
    <ResultsView
      title={productName}
      request={activeSnapshot.request}
      campaign={campaign}
      activity={activity}
      onReset={handleReset}
    />
  );
}
