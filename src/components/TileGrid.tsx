import { useEffect, useMemo } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { DEFAULT_TILE_COUNT } from "../domain/goal";
import { createTileIds, getRevealedTileIds, getTileGridLayout } from "../domain/tiles";
import { colors } from "../ui/theme";

type TileGridProps = {
  imageUri: string;
  totalTiles?: number;
  revealedCount: number;
  revealOrder: number[];
  tileColor?: string;
};

export function TileGrid({
  imageUri,
  totalTiles = DEFAULT_TILE_COUNT,
  revealedCount,
  revealOrder,
  tileColor = colors.tile
}: TileGridProps) {
  const tiles = useMemo(() => createTileIds(totalTiles), [totalTiles]);
  const revealedTileIds = useMemo(() => getRevealedTileIds(revealOrder, revealedCount), [revealOrder, revealedCount]);
  const layout = useMemo(() => getTileGridLayout(totalTiles), [totalTiles]);
  const tileRows = useMemo(() => createTileRows(tiles, layout.columns), [layout.columns, tiles]);

  return (
    <ImageBackground source={{ uri: imageUri }} resizeMode="cover" style={styles.image} imageStyle={styles.imageRadius}>
      <View style={styles.grid}>
        {tileRows.map((rowTiles, rowIndex) => {
          return (
            <View key={rowIndex} style={styles.tileRow}>
              {rowTiles.map((tile) => (
                <View key={tile} style={styles.tileSlot}>
                  <AnimatedTile isRevealed={revealedTileIds.has(tile)} tileColor={tileColor} />
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </ImageBackground>
  );
}

function createTileRows(tiles: number[], columns: number): number[][] {
  const rows: number[][] = [];

  for (let startIndex = 0; startIndex < tiles.length; startIndex += columns) {
    rows.push(tiles.slice(startIndex, startIndex + columns));
  }

  return rows;
}

type AnimatedTileProps = {
  isRevealed: boolean;
  tileColor: string;
};

function AnimatedTile({ isRevealed, tileColor }: AnimatedTileProps) {
  const progress = useSharedValue(isRevealed ? 0 : 1);

  useEffect(() => {
    progress.value = withSpring(isRevealed ? 0 : 1, {
      damping: 12,
      stiffness: 180
    });
  }, [isRevealed, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ scale: progress.value }]
    };
  });

  return <Animated.View style={[styles.tile, { backgroundColor: tileColor }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  image: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    overflow: "hidden",
    width: "100%"
  },
  imageRadius: {
    borderRadius: 8
  },
  grid: {
    flex: 1
  },
  tileRow: {
    flex: 1,
    flexDirection: "row"
  },
  tileSlot: {
    flex: 1,
    overflow: "hidden"
  },
  tile: {
    flex: 1
  }
});
