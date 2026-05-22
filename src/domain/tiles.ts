export function createTileIds(totalTiles: number): number[] {
  return Array.from({ length: Math.max(0, totalTiles) }, (_, index) => index);
}

export function shuffleTileIds(totalTiles: number): number[] {
  const tileIds = createTileIds(totalTiles);

  for (let index = tileIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentTile = tileIds[index];
    const swapTile = tileIds[swapIndex];

    if (currentTile === undefined || swapTile === undefined) {
      continue;
    }

    tileIds[index] = swapTile;
    tileIds[swapIndex] = currentTile;
  }

  return tileIds;
}

export function getRevealedTileIds(revealOrder: number[], revealedCount: number): Set<number> {
  return new Set(revealOrder.slice(0, Math.max(0, revealedCount)));
}

export type TileGridLayout = {
  columns: number;
  rows: number;
};

export function getTileGridLayout(totalTiles: number): TileGridLayout {
  const safeTileCount = Math.max(1, totalTiles);
  let bestColumns = safeTileCount;
  let bestRows = 1;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let rows = 1; rows <= safeTileCount; rows += 1) {
    const columns = Math.ceil(safeTileCount / rows);
    const slotCount = rows * columns;
    const emptySlots = slotCount - safeTileCount;
    const shapeDelta = Math.abs(columns - rows);
    const score = emptySlots * safeTileCount + shapeDelta;

    if (score < bestScore) {
      bestColumns = columns;
      bestRows = rows;
      bestScore = score;
    }
  }

  return {
    columns: bestColumns,
    rows: bestRows
  };
}

export function normalizeRevealOrder(totalTiles: number, revealOrder?: number[]): number[] {
  const tileIds = createTileIds(totalTiles);

  if (!revealOrder || revealOrder.length !== tileIds.length) {
    return shuffleTileIds(totalTiles);
  }

  const expectedTileIds = new Set(tileIds);
  const uniqueRevealIds = new Set(revealOrder);

  if (uniqueRevealIds.size !== tileIds.length) {
    return shuffleTileIds(totalTiles);
  }

  return revealOrder.every((tileId) => expectedTileIds.has(tileId)) ? revealOrder : shuffleTileIds(totalTiles);
}
