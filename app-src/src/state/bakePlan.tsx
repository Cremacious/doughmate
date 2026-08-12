// The active bake plan. At most one plan is armed at a time; arming replaces
// any prior plan. Steps are snapshotted at arm time so editing or deleting the
// recipe never corrupts a running plan.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { buildSchedule } from '@/lib/schedule';
import { storage } from '@/lib/storage';

export interface PlanStepSnapshot {
  text: string;
  time?: string;
  durationMs: number;
  isCheckpoint: boolean;
  startAt: number;
}

export interface BakePlan {
  id: string;
  recipeId: string;
  recipeName: string;
  finishAt: number;
  startAt: number;
  steps: PlanStepSnapshot[];
  createdAt: number;
}

export interface ArmPlanInput {
  recipeId: string;
  recipeName: string;
  steps: { text: string; time?: string }[];
  finishAt: number;
}

const STORAGE_KEY = 'doughmate.bakeplan.v1';

function loadPlan(): BakePlan | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BakePlan | null; // JSON.parse('null') === null
  } catch {
    return null;
  }
}

// storage only exposes getItem/setItem (no removeItem), so a cleared plan is
// persisted as the JSON literal null, which loadPlan reads back as null.
function savePlan(plan: BakePlan | null): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

interface BakePlanContextValue {
  plan: BakePlan | null;
  armPlan: (input: ArmPlanInput) => BakePlan;
  cancelPlan: () => void;
}

const BakePlanContext = createContext<BakePlanContextValue | null>(null);

export function BakePlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<BakePlan | null>(() => loadPlan());

  const value = useMemo<BakePlanContextValue>(
    () => ({
      plan,
      armPlan: (input) => {
        const schedule = buildSchedule(input.steps, input.finishAt);
        const next: BakePlan = {
          id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          recipeId: input.recipeId,
          recipeName: input.recipeName,
          finishAt: input.finishAt,
          startAt: schedule.startAt,
          steps: schedule.steps.map((s) => ({
            text: s.text,
            time: s.time,
            durationMs: s.durationMs,
            isCheckpoint: s.isCheckpoint,
            startAt: s.startAt,
          })),
          createdAt: Date.now(),
        };
        setPlan(next);
        savePlan(next);
        return next;
      },
      cancelPlan: () => {
        setPlan(null);
        savePlan(null);
      },
    }),
    [plan]
  );

  return <BakePlanContext.Provider value={value}>{children}</BakePlanContext.Provider>;
}

export function useBakePlan(): BakePlanContextValue {
  const ctx = useContext(BakePlanContext);
  if (!ctx) {
    throw new Error('useBakePlan must be used within a BakePlanProvider');
  }
  return ctx;
}
