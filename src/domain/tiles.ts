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
