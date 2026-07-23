import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createGoal, migrateGoalV1ToV2 } from "./goal";

describe("Goal", () => {
  describe("Goal.childId", () => {
    it("should have childId field", () => {
      const goal = createGoal({
        childName: "Alex",
        rewardName: "Ice Cream",
        imageUri: "...",
        totalTasks: 16,
        avatarId: "avatar-1"
      }, "child-12345");
      assert.ok(Object.hasOwn(goal, "childId"), "goal should have childId property");
      assert.strictEqual(typeof goal.childId, "string", "childId should be a string");
      assert.strictEqual(goal.childId, "child-12345", "childId should match provided value");
    });

    it("migrateGoalV1ToV2 should assign childId to goal", () => {
      const oldGoal: any = {
        id: "goal-123",
        childName: "Alex",
        rewardName: "Cake",
        imageUri: "...",
        totalTasks: 12,
        completedTasks: 0,
        revealOrder: [0, 1, 2],
        avatarId: "avatar-1",
        createdAt: new Date().toISOString(),
        completed: false
      };
      const migratedGoal = migrateGoalV1ToV2(oldGoal, "child-12345");
      assert.strictEqual(migratedGoal.childId, "child-12345", "migratedGoal.childId should match provided childId");
      assert.strictEqual(migratedGoal.id, oldGoal.id, "migratedGoal.id should match oldGoal.id");
    });
  });
});
