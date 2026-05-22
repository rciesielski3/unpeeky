import { useEffect, useMemo } from "react";
import type { DimensionValue } from "react-native";
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
};

export function TileGrid({ imageUri, totalTiles = DEFAULT_TILE_COUNT, revealedCount, revealOrder }: TileGridProps) {
  const tiles = useMemo(() => createTileIds(totalTiles), [totalTiles]);
  const revealedTileIds = useMemo(() => getRevealedTileIds(revealOrder, revealedCount), [revealOrder, revealedCount]);
  const layout = useMemo(() => getTileGridLayout(totalTiles), [totalTiles]);
  const tileBasis = `${100 / layout.columns}%` as DimensionValue;
  const tileHeight = `${100 / layout.rows}%` as DimensionValue;

  return (
    <ImageBackground source={{ uri: imageUri }} resizeMode="cover" style={styles.image} imageStyle={styles.imageRadius}>
      <View style={styles.grid}>
        {tiles.map((tile) => {
          return (
            <View key={tile} style={[styles.tileSlot, { flexBasis: tileBasis, height: tileHeight }]}>
              <AnimatedTile isRevealed={revealedTileIds.has(tile)} />
            </View>
          );
        })}
      </View>
    </ImageBackground>
  );
}

type AnimatedTileProps = {
  isRevealed: boolean;
};

function AnimatedTile({ isRevealed }: AnimatedTileProps) {
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

  return <Animated.View style={[styles.tile, animatedStyle]} />;
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
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  tileSlot: {
    overflow: "hidden"
  },
  tile: {
    backgroundColor: colors.tile,
    flex: 1
  }
});
