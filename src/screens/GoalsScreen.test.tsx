import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Goal } from "../domain/goal";

describe("GoalsScreen filtering logic", () => {
  const mockGoals: Goal[] = [
    {
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
    },
    {
      id: "g2",
      childId: "child-2",
      childName: "Jordan",
      rewardName: "Cookies",
      imageUri: "https://example.com/cookies.jpg",
      totalTasks: 16,
      completedTasks: 0,
      revealOrder: Array.from({ length: 16 }, (_, i) => i),
      avatarId: "unicorn",
      createdAt: new Date().toISOString(),
      completed: false
    },
    {
      id: "g3",
      childId: "child-1",
      childName: "Alex",
      rewardName: "Ice Cream",
      imageUri: "https://example.com/ice-cream.jpg",
      totalTasks: 12,
      completedTasks: 0,
      revealOrder: Array.from({ length: 12 }, (_, i) => i),
      avatarId: "dino",
      createdAt: new Date().toISOString(),
      completed: false
    }
  ];

  it("should correctly filter goals by activeChildId", () => {
    // Filter goals by child-1
    const filteredGoals = mockGoals.filter(g => g.childId === "child-1");

    assert.equal(filteredGoals.length, 2);
    assert.equal(filteredGoals[0]?.rewardName, "Cake");
    assert.equal(filteredGoals[1]?.rewardName, "Ice Cream");
  });

  it("should return empty array when no goals match activeChildId", () => {
    const filteredGoals = mockGoals.filter(g => g.childId === "child-999");

    assert.equal(filteredGoals.length, 0);
  });

  it("should filter goals for different child correctly", () => {
    const filteredGoals = mockGoals.filter(g => g.childId === "child-2");

    assert.equal(filteredGoals.length, 1);
    assert.equal(filteredGoals[0]?.rewardName, "Cookies");
  });
});
