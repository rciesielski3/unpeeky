import { DimensionValue, ImageBackground, StyleSheet, View } from "react-native";

import { DEFAULT_TILE_COUNT } from "../domain/goal";
import { colors } from "../ui/theme";

type TileGridProps = {
  imageUri: string;
  totalTiles?: number;
  revealedCount: number;
};

export function TileGrid({ imageUri, totalTiles = DEFAULT_TILE_COUNT, revealedCount }: TileGridProps) {
  const tiles = Array.from({ length: totalTiles }, (_, index) => index);
  const columns = Math.ceil(Math.sqrt(totalTiles));
  const tileBasis = `${100 / columns}%` as DimensionValue;

  return (
    <ImageBackground source={{ uri: imageUri }} resizeMode="cover" style={styles.image} imageStyle={styles.imageRadius}>
      <View style={styles.grid}>
        {tiles.map((tile) => {
          const isRevealed = tile < revealedCount;

          return (
            <View key={tile} style={[styles.tileSlot, { flexBasis: tileBasis }]}>
              <View style={[styles.tile, isRevealed && styles.revealed]} />
            </View>
          );
        })}
      </View>
    </ImageBackground>
  );
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
    flexWrap: "wrap",
    padding: 3
  },
  tileSlot: {
    aspectRatio: 1,
    padding: 1.5
  },
  tile: {
    backgroundColor: colors.tile,
    borderRadius: 4,
    flex: 1,
    opacity: 0.96
  },
  revealed: {
    opacity: 0
  }
});
