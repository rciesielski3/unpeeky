import { normalizeRevealOrder, shuffleTileIds } from "./tiles";
import { DEFAULT_AVATAR_ID, getAvatar } from "./avatar";
import type { AvatarId } from "./avatar";

export const TILE_OPTIONS = [8, 12, 16, 20, 24, 28, 32, 36] as const;
export const DEFAULT_TILE_COUNT = 16;
export const FREE_GOAL_LIMIT = 2;
export const TILE_COLOR_OPTIONS = [
  { id: "lavender", color: "#6366F1", labelKey: "lavender" },
  { id: "mint", color: "#5EEAD4", labelKey: "mint" },
  { id: "peach", color: "#FDBA74", labelKey: "peach" },
  { id: "rose", color: "#FDA4AF", labelKey: "rose" },
  { id: "sky", color: "#93C5FD", labelKey: "sky" },
  { id: "vanilla", color: "#FDE68A", labelKey: "vanilla" },
  { id: "lilac", color: "#C4B5FD", labelKey: "lilac" },
  { id: "lime", color: "#BEF264", labelKey: "lime" }
] as const;

export type TileCount = (typeof TILE_OPTIONS)[number];
export type AppMode = "singleDevice" | "twoDevices";
export type TileColorId = (typeof TILE_COLOR_OPTIONS)[number]["id"];

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
  appMode: AppMode | null;
  tileColorId: TileColorId;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  isPremium: false,
  notificationTime: "18:00",
  childName: "",
  parentPin: "",
  appMode: null,
  tileColorId: "lavender"
};

export type GoalDraft = Pick<Goal, "childName" | "rewardName" | "imageUri" | "totalTasks" | "avatarId">;
export type PersistedGoal = Omit<Goal, "avatarId" | "revealOrder"> &
  Partial<Pick<Goal, "completed" | "revealOrder">> & {
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

export function updateGoal(goal: Goal, draft: GoalDraft): Goal {
  const completedTasks = Math.min(goal.completedTasks, draft.totalTasks);

  return {
    ...goal,
    ...draft,
    completedTasks,
    completed: completedTasks >= draft.totalTasks,
    revealOrder: normalizeRevealOrder(draft.totalTasks, goal.revealOrder)
  };
}

export function normalizeGoal(goal: PersistedGoal): Goal {
  return {
    ...goal,
    avatarId: goal.avatarId ? getAvatar(goal.avatarId).id : DEFAULT_AVATAR_ID,
    completed: isGoalComplete(goal),
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
    appMode: isAppMode(nextSettings.appMode) ? nextSettings.appMode : null,
    parentPin: isParentPinValid(nextSettings.parentPin) ? nextSettings.parentPin : generateParentPin(),
    tileColorId: isTileColorId(nextSettings.tileColorId) ? nextSettings.tileColorId : DEFAULT_APP_SETTINGS.tileColorId
  };
}

export function generateParentPin(): string {
  return `${Math.floor(1000 + Math.random() * 9000)}`;
}

export function isParentPinValid(parentPin: string): boolean {
  return /^\d{4}$/.test(parentPin);
}

export function isAppMode(appMode: unknown): appMode is AppMode {
  return appMode === "singleDevice" || appMode === "twoDevices";
}

export function getTileColor(tileColorId: TileColorId): string {
  return TILE_COLOR_OPTIONS.find((tileColor) => tileColor.id === tileColorId)?.color ?? TILE_COLOR_OPTIONS[0].color;
}

export function isTileColorId(tileColorId: unknown): tileColorId is TileColorId {
  return TILE_COLOR_OPTIONS.some((tileColor) => tileColor.id === tileColorId);
}

export function getGoalProgress(goal: Pick<Goal, "completedTasks" | "totalTasks">): number {
  if (goal.totalTasks <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, goal.completedTasks / goal.totalTasks));
}

export function isGoalComplete(goal: Pick<Goal, "completedTasks" | "totalTasks"> & { completed?: boolean }): boolean {
  return goal.completed === true || goal.completedTasks >= goal.totalTasks;
}

export function completeTask(goal: Goal): Goal {
  const completedTasks = Math.min(goal.totalTasks, goal.completedTasks + 1);

  return {
    ...goal,
    completedTasks,
    completed: completedTasks === goal.totalTasks
  };
}
