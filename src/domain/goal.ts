import { normalizeRevealOrder, shuffleTileIds } from "./tiles";
import { DEFAULT_AVATAR_ID, getAvatar } from "./avatar";
import type { AvatarId } from "./avatar";

export const TILE_OPTIONS = [8, 12, 16, 20, 24, 28, 32, 36] as const;
export const DEFAULT_TILE_COUNT = 16;

export type TileCount = (typeof TILE_OPTIONS)[number];

export type Goal = {
  id: string;
  childName: string;
  rewardName: string;
  imageUri: string;
  totalTasks: TileCount;
  completedTasks: number;
  revealOrder: number[];
  avatarId: AvatarId;
  createdAt: string;
  completed: boolean;
};

export type AppSettings = {
  isPremium: boolean;
  notificationTime: string;
  childName: string;
  parentPin: string;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  isPremium: false,
  notificationTime: "18:00",
  childName: "",
  parentPin: ""
};

export type GoalDraft = Pick<Goal, "childName" | "rewardName" | "imageUri" | "totalTasks" | "avatarId">;
export type PersistedGoal = Omit<Goal, "avatarId" | "revealOrder"> &
  Partial<Pick<Goal, "revealOrder">> & {
    avatarId?: string;
  };

export function createGoal(draft: GoalDraft, now = new Date()): Goal {
  return {
    ...draft,
    id: `${now.getTime()}`,
    completedTasks: 0,
    revealOrder: shuffleTileIds(draft.totalTasks),
    createdAt: now.toISOString(),
    completed: false
  };
}

export function normalizeGoal(goal: PersistedGoal): Goal {
  return {
    ...goal,
    avatarId: goal.avatarId ? getAvatar(goal.avatarId).id : DEFAULT_AVATAR_ID,
    revealOrder: normalizeRevealOrder(goal.totalTasks, goal.revealOrder)
  };
}

export function normalizeSettings(settings: Partial<AppSettings> | null | undefined): AppSettings {
  const nextSettings = {
    ...DEFAULT_APP_SETTINGS,
    ...settings
  };

  return {
    ...nextSettings,
    parentPin: isParentPinValid(nextSettings.parentPin) ? nextSettings.parentPin : generateParentPin()
  };
}

export function generateParentPin(): string {
  return `${Math.floor(1000 + Math.random() * 9000)}`;
}

export function isParentPinValid(parentPin: string): boolean {
  return /^\d{4}$/.test(parentPin);
}

export function getGoalProgress(goal: Pick<Goal, "completedTasks" | "totalTasks">): number {
  if (goal.totalTasks <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, goal.completedTasks / goal.totalTasks));
}

export function completeTask(goal: Goal): Goal {
  const completedTasks = Math.min(goal.totalTasks, goal.completedTasks + 1);

  return {
    ...goal,
    completedTasks,
    completed: completedTasks === goal.totalTasks
  };
}
