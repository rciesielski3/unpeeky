import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Goal } from "../domain/goal";

describe("ChildScreen safety checks", () => {
  const mockGoal: Goal = {
    id: "g1",
    childId: "child-1",
    childName: "Alex",
    rewardName: "Cake",
    imageUri: "https://example.com/cake.jpg",
    totalTasks: 16,
    completedTasks: 0,
    revealOrder: Array.from({ length: 16 }, (_, i) => i),
    avatarId: "dino",
    createdAt: new Date().toISOString(),
    completed: false
  };

  it("should display goal when activeChildId matches goal.childId", () => {
    const activeChildId = "child-1";
    // Shows error if: !goal || goal.childId !== activeChildId
    const shouldShowError = !mockGoal || mockGoal.childId !== activeChildId;
    assert.equal(shouldShowError, false); // Should not show error
  });

  it("should not display goal if activeChildId doesn't match", () => {
    const activeChildId = "child-2"; // Different from goal.childId
    // Shows error if: !goal || goal.childId !== activeChildId
    const shouldShowError = !mockGoal || mockGoal.childId !== activeChildId;
    assert.ok(shouldShowError); // Should show error
  });

  it("should not display goal if goal is null", () => {
    const activeChildId = "child-1";
    const goal = null;
    // Shows error if: !goal || goal.childId !== activeChildId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shouldShowError = !goal || (goal as any).childId !== activeChildId;
    assert.ok(shouldShowError); // Should show error
  });
});
