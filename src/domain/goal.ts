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
  childId: string;
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

export type ChildSettings = {
  parentLabel: string;
  notificationTime: string;
  tileColorId: TileColorId;
};

export type GlobalSettings = {
  pin: string;
  isPremium: boolean;
  exportData: Goal[];
  appMode: AppMode | null;
  isReminderEnabled?: boolean;
};

export type AppSettings = {
  children: Array<{
    id: string;
    name: string;
    settings: ChildSettings;
  }>;
  globalSettings: GlobalSettings;
};

export const DEFAULT_CHILD_SETTINGS: ChildSettings = {
  parentLabel: "Rodzicu",
  notificationTime: "18:00",
  tileColorId: "lavender"
};

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  pin: "",
  isPremium: false,
  exportData: [],
  appMode: null,
  isReminderEnabled: false
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  children: [
    {
      id: "child-1",
      name: "",
      settings: DEFAULT_CHILD_SETTINGS
    }
  ],
  globalSettings: DEFAULT_GLOBAL_SETTINGS
};

export type GoalDraft = Pick<Goal, "childName" | "rewardName" | "imageUri" | "totalTasks" | "avatarId">;
export type PersistedGoal = Omit<Goal, "avatarId" | "revealOrder"> &
  Partial<Pick<Goal, "completed" | "revealOrder">> & {
    avatarId?: string;
  };

export function createGoal(draft: GoalDraft, childId: string, now = new Date()): Goal {
  return {
    ...draft,
    childId,
    id: `${now.getTime()}`,
    completedTasks: 0,
    revealOrder: shuffleTileIds(draft.totalTasks),
    createdAt: now.toISOString(),
    completed: false
  };
}

export function migrateGoalV1ToV2(oldGoal: Omit<Goal, "childId">, childId: string): Goal {
  return {
    ...oldGoal,
    childId
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
  if (!settings || !settings.children) {
    return DEFAULT_APP_SETTINGS;
  }

  // Normalize children array
  const normalizedChildren = settings.children.map((child) => ({
    id: child.id || `child-${Date.now()}`,
    name: typeof child.name === "string" ? child.name : "Child",
    settings: {
      parentLabel: normalizeParentLabel(child.settings?.parentLabel),
      notificationTime: isNotificationTime(child.settings?.notificationTime)
        ? child.settings.notificationTime
        : DEFAULT_CHILD_SETTINGS.notificationTime,
      tileColorId: isTileColorId(child.settings?.tileColorId)
        ? child.settings.tileColorId
        : DEFAULT_CHILD_SETTINGS.tileColorId
    }
  }));

  // Normalize global settings
  const globalSettings = settings.globalSettings || DEFAULT_GLOBAL_SETTINGS;
  const isStoredReminderEnabled = typeof globalSettings?.isReminderEnabled === "boolean";

  return {
    children: normalizedChildren,
    globalSettings: {
      pin: isParentPinValid(globalSettings.pin) ? globalSettings.pin : generateParentPin(),
      isPremium: Boolean(globalSettings.isPremium),
      exportData: Array.isArray(globalSettings.exportData) ? globalSettings.exportData : [],
      appMode: isAppMode(globalSettings.appMode) ? globalSettings.appMode : null,
      isReminderEnabled: isStoredReminderEnabled ? Boolean(globalSettings.isReminderEnabled) : false
    }
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

function isNotificationTime(notificationTime: unknown): notificationTime is string {
  return typeof notificationTime === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(notificationTime);
}

function normalizeParentLabel(parentLabel: unknown): string {
  if (typeof parentLabel !== "string") {
    return DEFAULT_CHILD_SETTINGS.parentLabel;
  }

  const normalizedParentLabel = parentLabel.trim().slice(0, 24);

  return normalizedParentLabel || DEFAULT_CHILD_SETTINGS.parentLabel;
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

export function completeTask(goal: Goal, selectedTileId?: number): Goal {
  const revealOrder =
    selectedTileId === undefined
      ? goal.revealOrder
      : moveTileToNextReveal(goal.revealOrder, goal.completedTasks, selectedTileId);
  const completedTasks = Math.min(goal.totalTasks, goal.completedTasks + 1);

  return {
    ...goal,
    revealOrder,
    completedTasks,
    completed: completedTasks === goal.totalTasks
  };
}

function moveTileToNextReveal(revealOrder: number[], completedTasks: number, selectedTileId: number): number[] {
  const selectedIndex = revealOrder.indexOf(selectedTileId);

  if (selectedIndex < completedTasks || selectedIndex === -1) {
    return revealOrder;
  }

  const nextRevealOrder = [...revealOrder];
  const [selectedTile] = nextRevealOrder.splice(selectedIndex, 1);

  if (selectedTile === undefined) {
    return revealOrder;
  }

  nextRevealOrder.splice(completedTasks, 0, selectedTile);

  return nextRevealOrder;
}
