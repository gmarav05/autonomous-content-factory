import { useCallback, useSyncExternalStore } from "react";

import type { CampaignResponse } from "@/types/campaign";

export interface CampaignSnapshot {
  request: {
    notes: string;
    audienceHint?: string;
    tone?: string;
    fileName: string | null;
    referenceUrl: string | null;
  };
  response: CampaignResponse;
}

let snapshot: CampaignSnapshot | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function setCampaignSnapshot(next: CampaignSnapshot | null) {
  snapshot = next;
  notify();
}

export function useCampaignStore() {
  const storeSnapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const updateSnapshot = useCallback((next: CampaignSnapshot | null) => {
    setCampaignSnapshot(next);
  }, []);

  const clear = useCallback(() => setCampaignSnapshot(null), []);

  return {
    snapshot: storeSnapshot,
    setSnapshot: updateSnapshot,
    clear,
  };
}
