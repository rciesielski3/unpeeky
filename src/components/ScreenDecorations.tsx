import { StyleSheet, Text, View } from "react-native";

import { colors } from "../ui/theme";

type DecorationVariant = "stars" | "sunny" | "clouds" | "garden";

type ScreenDecorationsProps = {
  variant: DecorationVariant;
};

const DECORATIONS: Record<
  DecorationVariant,
  Array<{ color: string; label: string; size: number; x: number; y: number }>
> = {
  clouds: [
    { color: colors.decorationCloud, label: "☁", size: 58, x: 10, y: 14 },
    { color: colors.decorationCloud, label: "☁", size: 50, x: 78, y: 22 },
    { color: colors.decorationWarning, label: "★", size: 28, x: 76, y: 16 },
    { color: colors.decorationPrimary, label: "✦", size: 20, x: 18, y: 38 }
  ],
  garden: [
    { color: colors.decorationGreen, label: "✿", size: 42, x: 8, y: 68 },
    { color: colors.decorationWarning, label: "✿", size: 36, x: 82, y: 70 },
    { color: colors.decorationCloud, label: "☁", size: 58, x: 14, y: 60 },
    { color: colors.decorationCloud, label: "☁", size: 54, x: 74, y: 58 }
  ],
  stars: [
    { color: colors.decorationWarning, label: "★", size: 22, x: 28, y: 8 },
    { color: colors.decorationPrimary, label: "✦", size: 20, x: 78, y: 10 },
    { color: colors.decorationCloud, label: "☁", size: 50, x: 72, y: 16 },
    { color: colors.decorationWarning, label: "✦", size: 18, x: 12, y: 34 }
  ],
  sunny: [
    { color: colors.decorationWarning, label: "★", size: 54, x: 80, y: 6 },
    { color: colors.decorationWarning, label: "✦", size: 18, x: 12, y: 16 },
    { color: colors.decorationCloud, label: "☁", size: 46, x: 74, y: 74 },
    { color: colors.decorationPrimary, label: "✦", size: 18, x: 50, y: 8 }
  ]
};

export function ScreenDecorations({ variant }: ScreenDecorationsProps) {
  return (
    <View pointerEvents="none" style={styles.layer}>
      {DECORATIONS[variant].map((decoration, index) => (
        <Text
          key={`${decoration.label}-${index}`}
          style={[
            styles.decoration,
            {
              color: decoration.color,
              fontSize: decoration.size,
              left: `${decoration.x}%`,
              top: `${decoration.y}%`
            }
          ]}
        >
          {decoration.label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  decoration: {
    opacity: 0.42,
    position: "absolute"
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden"
  }
});
