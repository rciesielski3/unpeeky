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
  avatarId: string;
  createdAt: string;
  completed: boolean;
};

export type AppSettings = {
  isPremium: boolean;
  notificationTime: string;
  childName: string;
};

export type GoalDraft = Pick<Goal, "childName" | "rewardName" | "imageUri" | "totalTasks" | "avatarId">;

export function createGoal(draft: GoalDraft, now = new Date()): Goal {
  return {
    ...draft,
    id: `${now.getTime()}`,
    completedTasks: 0,
    createdAt: now.toISOString(),
    completed: false
  };
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

export function createDemoGoal(): Goal {
  return {
    id: "demo-goal",
    childName: "Kacper",
    rewardName: "Lego Dinozaur",
    imageUri: "https://images.unsplash.com/photo-1587654780291-39c9404d746b",
    totalTasks: DEFAULT_TILE_COUNT,
    completedTasks: 6,
    avatarId: "dino",
    createdAt: new Date().toISOString(),
    completed: false
  };
}
