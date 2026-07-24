import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  completeTask,
  createGoal,
  getGoalProgress,
  isGoalComplete,
  normalizeGoal,
  updateGoal,
  migrateGoalV1ToV2
} from "./goal";
import type { Goal, GoalDraft, PersistedGoal } from "./goal";
import { DEFAULT_AVATAR_ID } from "./avatar";

function makeDraft(overrides: Partial<GoalDraft> = {}): GoalDraft {
  return {
    childName: "Zosia",
    rewardName: "Ice cream",
    imageUri: "file://reward.png",
    totalTasks: 8,
    avatarId: "dino",
    ...overrides
  };
}

// getGoalProgress/isGoalComplete accept Pick<Goal, ...> where totalTasks is typed as
// TileCount, but they must also defend against malformed data read from storage
// (e.g. before normalizeGoal runs). Cast to exercise those runtime guards.
function progressInput(completedTasks: number, totalTasks: number): Parameters<typeof getGoalProgress>[0] {
  return { completedTasks, totalTasks } as Parameters<typeof getGoalProgress>[0];
}

function completeInput(
  completedTasks: number,
  totalTasks: number,
  completed?: boolean
): Parameters<typeof isGoalComplete>[0] {
  return { completedTasks, totalTasks, completed } as Parameters<typeof isGoalComplete>[0];
}

describe("createGoal", () => {
  it("creates a goal with the correct initial state", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const childId = "child-123";
    const draft = makeDraft();
    const goal = createGoal(draft, childId, now);

    assert.equal(goal.id, `${now.getTime()}`);
    assert.equal(goal.childId, childId);
    assert.equal(goal.childName, draft.childName);
    assert.equal(goal.rewardName, draft.rewardName);
    assert.equal(goal.imageUri, draft.imageUri);
    assert.equal(goal.totalTasks, draft.totalTasks);
    assert.equal(goal.avatarId, draft.avatarId);
    assert.equal(goal.completedTasks, 0);
    assert.equal(goal.completed, false);
    assert.equal(goal.createdAt, now.toISOString());
    assert.equal(goal.revealOrder.length, draft.totalTasks);
    assert.deepEqual(
      [...goal.revealOrder].sort((a, b) => a - b),
      Array.from({ length: draft.totalTasks }, (_, i) => i)
    );
  });
});

describe("completeTask", () => {
  function makeGoal(overrides: Partial<Goal> = {}): Goal {
    return {
      id: "1",
      childId: "child-1",
      childName: "Zosia",
      rewardName: "Ice cream",
      imageUri: "file://reward.png",
      totalTasks: 8,
      completedTasks: 0,
      revealOrder: [0, 1, 2, 3, 4, 5, 6, 7],
      avatarId: "dino",
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      completed: false,
      ...overrides
    };
  }

  it("marks a task complete and advances the reveal count", () => {
    const goal = makeGoal();
    const nextGoal = completeTask(goal);

    assert.equal(nextGoal.completedTasks, 1);
    assert.equal(nextGoal.completed, false);
  });

  it("marks the goal completed once all tasks are done", () => {
    const goal = makeGoal({ completedTasks: 7 });
    const nextGoal = completeTask(goal);

    assert.equal(nextGoal.completedTasks, 8);
    assert.equal(nextGoal.completed, true);
  });

  it("never advances completedTasks past totalTasks", () => {
    const goal = makeGoal({ completedTasks: 8, completed: true });
    const nextGoal = completeTask(goal);

    assert.equal(nextGoal.completedTasks, 8);
    assert.equal(nextGoal.completed, true);
  });

  it("moves a selected tile to the next reveal slot", () => {
    const goal = makeGoal({ completedTasks: 0, revealOrder: [0, 1, 2, 3, 4, 5, 6, 7] });
    const nextGoal = completeTask(goal, 2);

    assert.equal(nextGoal.revealOrder[0], 2);
    assert.deepEqual(
      [...nextGoal.revealOrder].sort((a, b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7]
    );
  });

  it("leaves reveal order unchanged when the selected tile is already revealed", () => {
    const goal = makeGoal({ completedTasks: 2, revealOrder: [0, 1, 2, 3, 4, 5, 6, 7] });
    const nextGoal = completeTask(goal, 0);

    assert.deepEqual(nextGoal.revealOrder, [0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("leaves reveal order unchanged when the selected tile does not exist", () => {
    const goal = makeGoal({ completedTasks: 0, revealOrder: [0, 1, 2, 3, 4, 5, 6, 7] });
    const nextGoal = completeTask(goal, 99);

    assert.deepEqual(nextGoal.revealOrder, [0, 1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("getGoalProgress", () => {
  it("calculates progress correctly", () => {
    assert.equal(getGoalProgress(progressInput(0, 8)), 0);
    assert.equal(getGoalProgress(progressInput(4, 8)), 0.5);
    assert.equal(getGoalProgress(progressInput(8, 8)), 1);
  });

  it("clamps progress between 0 and 1", () => {
    assert.equal(getGoalProgress(progressInput(-3, 8)), 0);
    assert.equal(getGoalProgress(progressInput(20, 8)), 1);
  });

  it("returns 0 when totalTasks is not positive", () => {
    assert.equal(getGoalProgress(progressInput(0, 0)), 0);
    assert.equal(getGoalProgress(progressInput(3, -1)), 0);
  });
});

describe("isGoalComplete", () => {
  it("is true when the completed flag is set", () => {
    assert.equal(isGoalComplete(completeInput(0, 8, true)), true);
  });

  it("is true when completedTasks reaches totalTasks even without the flag", () => {
    assert.equal(isGoalComplete(completeInput(8, 8)), true);
  });

  it("is false when the goal is still in progress", () => {
    assert.equal(isGoalComplete(completeInput(4, 8, false)), false);
  });
});

describe("normalizeGoal", () => {
  it("defensively reads well-formed stored data", () => {
    const persisted: PersistedGoal = {
      id: "1",
      childId: "child-1",
      childName: "Zosia",
      rewardName: "Ice cream",
      imageUri: "file://reward.png",
      totalTasks: 8,
      completedTasks: 4,
      completed: false,
      avatarId: "dino",
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      revealOrder: [0, 1, 2, 3, 4, 5, 6, 7]
    };

    const goal = normalizeGoal(persisted);

    assert.equal(goal.avatarId, "dino");
    assert.equal(goal.completed, false);
    assert.deepEqual(goal.revealOrder, [0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("falls back to the default avatar when avatarId is missing or unknown", () => {
    const base: PersistedGoal = {
      id: "1",
      childId: "child-1",
      childName: "Zosia",
      rewardName: "Ice cream",
      imageUri: "file://reward.png",
      totalTasks: 8,
      completedTasks: 0,
      completed: false,
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString()
    };

    assert.equal(normalizeGoal(base).avatarId, DEFAULT_AVATAR_ID);
    assert.equal(normalizeGoal({ ...base, avatarId: "not-a-real-avatar" }).avatarId, DEFAULT_AVATAR_ID);
  });

  it("repairs a missing or malformed reveal order", () => {
    const base: PersistedGoal = {
      id: "1",
      childId: "child-1",
      childName: "Zosia",
      rewardName: "Ice cream",
      imageUri: "file://reward.png",
      totalTasks: 8,
      completedTasks: 0,
      completed: false,
      avatarId: "dino",
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString()
    };

    const repaired = normalizeGoal(base);
    assert.equal(repaired.revealOrder.length, 8);
    assert.deepEqual(
      [...repaired.revealOrder].sort((a, b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7]
    );

    const withDuplicates = normalizeGoal({ ...base, revealOrder: [0, 0, 1, 2, 3, 4, 5, 6] });
    assert.deepEqual(
      [...withDuplicates.revealOrder].sort((a, b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7]
    );

    const withWrongLength = normalizeGoal({ ...base, revealOrder: [0, 1] });
    assert.equal(withWrongLength.revealOrder.length, 8);
  });

  it("derives completed from completedTasks/totalTasks when reading legacy data", () => {
    const base: PersistedGoal = {
      id: "1",
      childId: "child-1",
      childName: "Zosia",
      rewardName: "Ice cream",
      imageUri: "file://reward.png",
      totalTasks: 8,
      completedTasks: 8,
      completed: false,
      avatarId: "dino",
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      revealOrder: [0, 1, 2, 3, 4, 5, 6, 7]
    };

    assert.equal(normalizeGoal(base).completed, true);
  });
});

describe("updateGoal", () => {
  function makeGoal(overrides: Partial<Goal> = {}): Goal {
    return {
      id: "1",
      childId: "child-1",
      childName: "Zosia",
      rewardName: "Ice cream",
      imageUri: "file://reward.png",
      totalTasks: 12,
      completedTasks: 10,
      revealOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      avatarId: "dino",
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      completed: false,
      ...overrides
    };
  }

  it("clamps completedTasks when shrinking totalTasks below the current progress", () => {
    const goal = makeGoal({ completedTasks: 10, totalTasks: 12 });
    const nextGoal = updateGoal(goal, makeDraft({ totalTasks: 8 }));

    assert.equal(nextGoal.completedTasks, 8);
    assert.equal(nextGoal.completed, true);
    assert.equal(nextGoal.revealOrder.length, 8);
  });

  it("applies draft fields onto the existing goal", () => {
    const goal = makeGoal({ totalTasks: 8, completedTasks: 2, revealOrder: [0, 1, 2, 3, 4, 5, 6, 7] });
    const nextGoal = updateGoal(goal, makeDraft({ childName: "Kuba", totalTasks: 8 }));

    assert.equal(nextGoal.childName, "Kuba");
    assert.equal(nextGoal.id, goal.id);
  });
});

// New childId tests
describe("Goal", () => {
  describe("Goal.childId", () => {
    it("should have childId field", () => {
      const goal = createGoal(
        {
          childName: "Alex",
          rewardName: "Ice Cream",
          imageUri: "...",
          totalTasks: 16,
          avatarId: "dino"
        },
        "child-12345"
      );
      assert.ok(Object.hasOwn(goal, "childId"), "goal should have childId property");
      assert.strictEqual(typeof goal.childId, "string", "childId should be a string");
      assert.strictEqual(goal.childId, "child-12345", "childId should match provided value");
    });

    it("migrateGoalV1ToV2 should assign childId to goal", () => {
      const oldGoal: Omit<Goal, "childId"> = {
        id: "goal-123",
        childName: "Alex",
        rewardName: "Cake",
        imageUri: "...",
        totalTasks: 12,
        completedTasks: 0,
        revealOrder: [0, 1, 2],
        avatarId: "dino",
        createdAt: new Date().toISOString(),
        completed: false
      };
      const migratedGoal = migrateGoalV1ToV2(oldGoal, "child-12345");
      assert.strictEqual(migratedGoal.childId, "child-12345", "migratedGoal.childId should match provided childId");
      assert.strictEqual(migratedGoal.id, oldGoal.id, "migratedGoal.id should match oldGoal.id");
    });
  });
});
