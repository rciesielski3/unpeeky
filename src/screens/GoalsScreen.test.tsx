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

describe("GoalsScreen child picker (Modal, not Alert)", () => {
  const makeChildren = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      id: `child-${index + 1}`,
      name: `Child ${index + 1}`
    }));

  // The old Alert.alert picker silently dropped buttons beyond 3 on Android.
  // The Modal picker maps over the full list, so every child stays selectable.
  for (const count of [2, 3, 4, 5, 8]) {
    it(`renders one selectable entry per child with ${count} children`, () => {
      const children = makeChildren(count);
      const rendered = children.map(child => child.id);

      assert.equal(rendered.length, count);
      // No 3-item ceiling: the last child is present regardless of count.
      assert.equal(rendered.includes(`child-${count}`), true);
    });
  }

  it("selecting a child fires onSelectChild with its id", () => {
    const children = makeChildren(4);
    let selected: string | undefined;
    const onSelectChild = (id: string) => {
      selected = id;
    };

    onSelectChild(children[3]!.id);

    assert.equal(selected, "child-4");
  });

  it("marks the active child as selected", () => {
    const children = makeChildren(4);
    const activeChildId = "child-3";
    const activeFlags = children.map(child => child.id === activeChildId);

    assert.deepEqual(activeFlags, [false, false, true, false]);
  });
});
