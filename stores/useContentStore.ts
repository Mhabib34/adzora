/**
 * Zustand store for display content: running text and adzan audio config.
 * Slideshow images are fetched directly from IndexedDB (too large for localStorage).
 * Persisted to localStorage via persist middleware.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RunningTextItem, AdzanAudioConfig, EventItem } from "../types/content";

/** Shape stored in localStorage — Date serialized as ISO string */
interface PersistedRunningTextItem extends Omit<RunningTextItem, "createdAt"> {
  createdAt: string;
}

interface ContentState {
  runningTexts: RunningTextItem[];
  adzanAudio: AdzanAudioConfig;
  eventItem: EventItem;
  // Actions
  setRunningTexts: (items: RunningTextItem[]) => void;
  addRunningText: (item: RunningTextItem) => void;
  updateRunningText: (id: string, partial: Partial<RunningTextItem>) => void;
  deleteRunningText: (id: string) => void;
  reorderRunningTexts: (ids: string[]) => void;
  setAdzanAudio: (config: Partial<AdzanAudioConfig>) => void;
  setEventItem: (item: Partial<EventItem>) => void;
}

/** Shape that actually gets written to localStorage */
interface PersistedContentState {
  runningTexts: PersistedRunningTextItem[];
  adzanAudio: AdzanAudioConfig;
  eventItem: EventItem;
}

const defaultAdzanAudio: AdzanAudioConfig = {
  source: "adzan-makkah",
  volume: 0.8,
  useFajrAdzanForSubuh: false,
};

const defaultRunningTexts: RunningTextItem[] = [
  {
    id: "default-1",
    text: "Selamat datang di masjid kami. Mari kita jaga kebersihan dan ketertiban.",
    order: 0,
    isActive: true,
    createdAt: new Date(),
  },
];

const defaultEventItem: EventItem = {
  title: "Kajian Rutin",
  description: "Ba'da Maghrib",
  isActive: true,
};

/** Rehydrate persisted items — convert createdAt string back to Date */
function rehydrateItems(items: PersistedRunningTextItem[]): RunningTextItem[] {
  return items.map((t) => ({ ...t, createdAt: new Date(t.createdAt) }));
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      runningTexts: defaultRunningTexts,
      adzanAudio: defaultAdzanAudio,
      eventItem: defaultEventItem,

      setRunningTexts: (items) => set({ runningTexts: items }),

      addRunningText: (item) =>
        set((state) => ({
          runningTexts: [...state.runningTexts, item],
        })),

      updateRunningText: (id, partial) =>
        set((state) => ({
          runningTexts: state.runningTexts.map((t) =>
            t.id === id ? { ...t, ...partial } : t,
          ),
        })),

      deleteRunningText: (id) =>
        set((state) => ({
          runningTexts: state.runningTexts.filter((t) => t.id !== id),
        })),

      reorderRunningTexts: (ids) =>
        set((state) => ({
          runningTexts: ids
            .map((id, index) => {
              const item = state.runningTexts.find((t) => t.id === id);
              return item ? { ...item, order: index } : null;
            })
            .filter((item): item is RunningTextItem => item !== null),
        })),

      setAdzanAudio: (partial) =>
        set((state) => ({
          adzanAudio: { ...state.adzanAudio, ...partial },
        })),

      setEventItem: (partial) =>
        set((state) => ({
          eventItem: { ...state.eventItem, ...partial },
        })),
    }),
    {
      name: "adzora-content",
      // Only persist what we need, exclude actions
      partialize: (state): PersistedContentState => ({
        runningTexts: state.runningTexts.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
        })),
        adzanAudio: state.adzanAudio,
        eventItem: state.eventItem,
      }),
      // Convert ISO strings back to Date on load
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const raw = localStorage.getItem("adzora-content");
        if (!raw) return;
        const parsed = JSON.parse(raw) as {
          state: PersistedContentState;
        };
        if (parsed.state?.runningTexts) {
          state.runningTexts = rehydrateItems(parsed.state.runningTexts);
        }
      },
    },
  ),
);
