import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createTileIds, getRevealedTileIds, getTileGridLayout, normalizeRevealOrder, shuffleTileIds } from "./tiles";

describe("createTileIds", () => {
  it("creates a sequential list of ids starting at 0", () => {
    assert.deepEqual(createTileIds(5), [0, 1, 2, 3, 4]);
  });

  it("returns an empty list for zero or negative counts", () => {
    assert.deepEqual(createTileIds(0), []);
    assert.deepEqual(createTileIds(-3), []);
  });
});

describe("shuffleTileIds", () => {
  it("returns all tile ids exactly once", () => {
    const shuffled = shuffleTileIds(16);

    assert.equal(shuffled.length, 16);
    assert.deepEqual(
      [...shuffled].sort((a, b) => a - b),
      Array.from({ length: 16 }, (_, index) => index)
    );
  });

  it("produces an unpredictable order across calls", () => {
    // A single shuffle could in principle match identity order, so sample
    // many shuffles and require at least one to differ from the identity order.
    const identity = createTileIds(32);
    const shuffles = Array.from({ length: 20 }, () => shuffleTileIds(32));

    const hasDifferentOrder = shuffles.some((shuffled) => shuffled.some((id, index) => id !== identity[index]));

    assert.equal(hasDifferentOrder, true);
  });

  it("handles zero tiles", () => {
    assert.deepEqual(shuffleTileIds(0), []);
  });
});

describe("getRevealedTileIds", () => {
  it("returns the first N ids from the reveal order as a set", () => {
    const revealed = getRevealedTileIds([3, 1, 2, 0], 2);

    assert.equal(revealed.size, 2);
    assert.equal(revealed.has(3), true);
    assert.equal(revealed.has(1), true);
    assert.equal(revealed.has(2), false);
  });

  it("clamps a negative revealed count to an empty set", () => {
    assert.deepEqual(getRevealedTileIds([0, 1, 2], -1), new Set());
  });

  it("returns the full set when revealedCount exceeds the length", () => {
    const revealed = getRevealedTileIds([0, 1], 10);
    assert.deepEqual(revealed, new Set([0, 1]));
  });
});

describe("normalizeRevealOrder", () => {
  it("returns the reveal order unchanged when it is already valid", () => {
    const revealOrder = [3, 1, 0, 2];
    assert.deepEqual(normalizeRevealOrder(4, revealOrder), revealOrder);
  });

  it("generates a fresh order when reveal order is missing", () => {
    const normalized = normalizeRevealOrder(4, undefined);

    assert.equal(normalized.length, 4);
    assert.deepEqual(
      [...normalized].sort((a, b) => a - b),
      [0, 1, 2, 3]
    );
  });

  it("regenerates the order when the length no longer matches totalTiles", () => {
    const normalized = normalizeRevealOrder(6, [0, 1, 2]);

    assert.equal(normalized.length, 6);
    assert.deepEqual(
      [...normalized].sort((a, b) => a - b),
      [0, 1, 2, 3, 4, 5]
    );
  });

  it("regenerates the order when it contains ids that no longer exist", () => {
    const normalized = normalizeRevealOrder(4, [0, 1, 2, 99]);

    assert.equal(normalized.length, 4);
    assert.deepEqual(
      [...normalized].sort((a, b) => a - b),
      [0, 1, 2, 3]
    );
  });

  it("regenerates the order when it contains duplicate ids", () => {
    const normalized = normalizeRevealOrder(4, [0, 0, 1, 2]);

    assert.equal(normalized.length, 4);
    assert.deepEqual(
      [...normalized].sort((a, b) => a - b),
      [0, 1, 2, 3]
    );
  });

  it("is idempotent for an already-valid reveal order", () => {
    const revealOrder = normalizeRevealOrder(8, undefined);
    const normalizedAgain = normalizeRevealOrder(8, revealOrder);

    assert.deepEqual(normalizedAgain, revealOrder);
  });
});

describe("getTileGridLayout", () => {
  it("returns a square grid for perfect squares", () => {
    assert.deepEqual(getTileGridLayout(16), { columns: 4, rows: 4 });
  });

  it("prefers a landscape-oriented grid (columns >= rows)", () => {
    assert.deepEqual(getTileGridLayout(8), { columns: 4, rows: 2 });
    assert.deepEqual(getTileGridLayout(12), { columns: 4, rows: 3 });
    assert.deepEqual(getTileGridLayout(20), { columns: 5, rows: 4 });
    assert.deepEqual(getTileGridLayout(24), { columns: 6, rows: 4 });
    assert.deepEqual(getTileGridLayout(28), { columns: 7, rows: 4 });
    assert.deepEqual(getTileGridLayout(32), { columns: 8, rows: 4 });
    assert.deepEqual(getTileGridLayout(36), { columns: 6, rows: 6 });
  });

  it("falls back to a single tile layout for zero or negative counts", () => {
    assert.deepEqual(getTileGridLayout(0), { columns: 1, rows: 1 });
    assert.deepEqual(getTileGridLayout(-5), { columns: 1, rows: 1 });
  });

  it("handles a single tile", () => {
    assert.deepEqual(getTileGridLayout(1), { columns: 1, rows: 1 });
  });
});
