import { useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { AvatarBadge } from "../components/AvatarBadge";
import { Button } from "../components/Button";
import { ParentAdSlot } from "../components/ParentAdSlot";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenDecorations } from "../components/ScreenDecorations";
import { FREE_GOAL_LIMIT, getGoalProgress, isGoalComplete } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import type { AppTheme } from "../ui/appTheme";
import { defaultAppTheme } from "../ui/appTheme";
import { colors, fonts, radii, spacing } from "../ui/theme";

// React Native bundles static image assets through require().
// eslint-disable-next-line @typescript-eslint/no-var-requires
const INFO_ICON_SOURCE = require("../../assets/icons/settings-info.png");

type GoalsScreenProps = {
  goals: Goal[];
  isPremium: boolean;
  onAddGoal: () => void;
  onDeleteGoal: (goalId: string) => void;
  onEditGoal: (goalId: string) => void;
  onOpenGoal: (goalId: string) => void;
  onOpenSettings: () => void;
  theme?: AppTheme;
};

export function GoalsScreen({
  goals,
  isPremium,
  onAddGoal,
  onDeleteGoal,
  onEditGoal,
  onOpenGoal,
  onOpenSettings,
  theme = defaultAppTheme
}: GoalsScreenProps) {
  const [openMenuGoalId, setOpenMenuGoalId] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const activeGoalsCount = goals.filter((goal) => !isGoalComplete(goal)).length;
  const hasReachedFreeLimit = !isPremium && activeGoalsCount >= FREE_GOAL_LIMIT;
  const sortedGoals = useMemo(() => [...goals].sort(compareGoalsByStatus), [goals]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.parentBackground }]}>
      <View style={[styles.glowTop, { backgroundColor: theme.accentSoft }]} />
      <View style={[styles.glowBottom, { backgroundColor: theme.accentSoft }]} />
      <ScreenDecorations variant="stars" />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.hello}>{strings.goals.greeting}</Text>
          <Text style={styles.title}>{strings.goals.title}</Text>
        </View>
        <Pressable
          accessibilityLabel={strings.goals.infoButton}
          accessibilityRole="button"
          onPress={() => setIsInfoOpen(true)}
          style={[styles.settingsCircle, { backgroundColor: theme.accentSoft }]}
        >
          <View style={[styles.infoIconGlow, { backgroundColor: theme.accent }]} />
          <Image source={INFO_ICON_SOURCE} style={[styles.settingsIcon, { tintColor: theme.accentDark }]} />
          <Text style={styles.infoSparkle}>✦</Text>
        </Pressable>
      </View>

      <FlatList
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{strings.goals.emptyTitle}</Text>
            <Text style={styles.emptyText}>{strings.goals.emptyText}</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        data={sortedGoals}
        keyExtractor={(goal) => goal.id}
        renderItem={({ item }) => {
          const isCompleted = isGoalComplete(item);
          const progress = getGoalProgress(item);
          const progressPercent = Math.round(progress * 100);
          const progressColor = getGoalAccent(item.id, theme);
          const isMenuOpen = openMenuGoalId === item.id;

          return (
            <View style={[styles.card, isCompleted && styles.completedCard]}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setOpenMenuGoalId(null);
                  onOpenGoal(item.id);
                }}
                style={styles.cardContent}
              >
                <View style={styles.cardHeader}>
                  <Image
                    accessibilityLabel={strings.goals.thumbnailLabel(item.rewardName)}
                    accessibilityRole="image"
                    source={{ uri: item.imageUri }}
                    style={styles.thumbnail}
                  />
                  <View style={styles.cardCopy}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{item.rewardName}</Text>
                    </View>
                    <View style={styles.childRow}>
                      <AvatarBadge avatarId={item.avatarId} size="sm" />
                      <Text style={styles.childName}>{item.childName}</Text>
                    </View>
                    <Text style={styles.tasksText}>
                      <Text style={[styles.completedTasks, { color: progressColor }]}>{item.completedTasks}</Text>
                      {strings.goals.tasksTotal(item.totalTasks)}
                    </Text>
                    <View style={styles.progressRow}>
                      <View style={styles.progressWrap}>
                        <ProgressBar color={progressColor} progress={progress} />
                      </View>
                      <Text style={styles.percent}>{progressPercent}%</Text>
                    </View>
                    {isCompleted ? (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>{strings.goals.completedBadge}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
              <Pressable
                accessibilityLabel={`${strings.goals.editButton}, ${strings.goals.deleteButton}`}
                accessibilityRole="button"
                accessibilityState={{ expanded: isMenuOpen }}
                onPress={() => setOpenMenuGoalId(isMenuOpen ? null : item.id)}
                style={styles.menuButton}
              >
                <Text style={styles.menuDots}>⋮</Text>
              </Pressable>
              {isMenuOpen ? (
                <View style={styles.cardMenu}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setOpenMenuGoalId(null);
                      onEditGoal(item.id);
                    }}
                    style={styles.menuItem}
                  >
                    <Text style={styles.menuItemText}>{strings.goals.editButton}</Text>
                  </Pressable>
                  <View style={styles.menuDivider} />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setOpenMenuGoalId(null);
                      onDeleteGoal(item.id);
                    }}
                    style={styles.menuItem}
                  >
                    <Text style={[styles.menuItemText, styles.deleteMenuItemText]}>{strings.goals.deleteButton}</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        }}
      />

      {hasReachedFreeLimit ? (
        <View style={styles.limitCard}>
          <Text style={styles.limitTitle}>{strings.goals.freeLimitTitle}</Text>
          <Text style={styles.limitText}>{strings.goals.freeLimitText(FREE_GOAL_LIMIT)}</Text>
          <Button label={strings.goals.freeLimitButton} onPress={onOpenSettings} variant="ghost" />
        </View>
      ) : null}

      {!isPremium ? (
        <View style={styles.adSlotWrap}>
          <ParentAdSlot isPremium={isPremium} />
        </View>
      ) : null}

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          disabled={hasReachedFreeLimit}
          onPress={onAddGoal}
          style={[styles.addButton, { backgroundColor: theme.accent }, hasReachedFreeLimit && styles.disabledButton]}
        >
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addButtonText}>{strings.goals.newGoalButton}</Text>
        </Pressable>
      </View>

      <InfoModal onClose={() => setIsInfoOpen(false)} theme={theme} visible={isInfoOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.parentBackground,
    overflow: "hidden",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl
  },
  glowTop: {
    backgroundColor: colors.parentBackgroundSoft,
    borderRadius: 180,
    height: 220,
    position: "absolute",
    right: -72,
    top: 72,
    width: 220
  },
  glowBottom: {
    backgroundColor: colors.parentBackgroundSoft,
    borderRadius: 220,
    bottom: 84,
    height: 260,
    left: -92,
    position: "absolute",
    width: 260
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    minHeight: 124
  },
  headerCopy: {
    flex: 1,
    paddingRight: spacing.lg
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40
  },
  hello: {
    color: colors.text,
    fontSize: 24,
    marginBottom: spacing.xs,
    lineHeight: 30
  },
  settingsCircle: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: 64,
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    width: 64
  },
  settingsIcon: {
    height: 30,
    width: 30,
    zIndex: 2
  },
  infoIconGlow: {
    borderRadius: radii.pill,
    height: 42,
    opacity: 0.18,
    position: "absolute",
    width: 42
  },
  infoSparkle: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 3
  },
  list: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingBottom: spacing.xl
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 220,
    padding: spacing.lg
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center"
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    position: "relative",
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20
  },
  cardContent: {
    alignSelf: "stretch",
    gap: spacing.sm
  },
  completedCard: {
    backgroundColor: colors.successSurface,
    borderColor: colors.successBorder
  },
  cardHeader: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: spacing.md
  },
  thumbnail: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    height: 116,
    width: 116
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: "center",
    paddingRight: spacing.lg,
    paddingVertical: spacing.xs
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  childRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  cardTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: "800"
  },
  childName: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600"
  },
  tasksText: {
    color: colors.text,
    fontSize: 13
  },
  completedTasks: {
    fontWeight: "800"
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  progressWrap: {
    flex: 1
  },
  percent: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700"
  },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    minHeight: 44,
    minWidth: 44,
    zIndex: 2
  },
  menuDots: {
    color: colors.textMuted,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 28
  },
  cardMenu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 132,
    overflow: "hidden",
    position: "absolute",
    right: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    top: 48,
    zIndex: 3
  },
  menuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  menuItemText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  deleteMenuItemText: {
    color: colors.warningDark
  },
  menuDivider: {
    backgroundColor: colors.border,
    height: 1
  },
  completedBadge: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  completedBadgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800"
  },
  footer: {
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm
  },
  adSlotWrap: {
    paddingTop: spacing.sm
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
    minHeight: 60,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20
  },
  disabledButton: {
    opacity: 0.45
  },
  addIcon: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 34
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800"
  },
  limitCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  limitTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  limitText: {
    color: colors.textMuted,
    fontSize: 13
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: colors.modalOverlay,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  infoCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.xl,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: "100%"
  },
  infoIcon: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 64,
    justifyContent: "center",
    width: 64
  },
  infoIconText: {
    fontFamily: fonts.heading,
    fontSize: 34,
    fontWeight: "800"
  },
  infoTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  infoBody: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center"
  },
  infoButton: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 54
  },
  infoButtonText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "800"
  }
});

function InfoModal({ onClose, theme, visible }: { onClose: () => void; theme: AppTheme; visible: boolean }) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.infoCard}>
          <View style={[styles.infoIcon, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.infoIconText, { color: theme.accentDark }]}>i</Text>
          </View>
          <Text style={styles.infoTitle}>{strings.goals.infoTitle}</Text>
          <Text style={styles.infoBody}>{strings.goals.infoBody}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={[styles.infoButton, { backgroundColor: theme.accent }]}
          >
            <Text style={styles.infoButtonText}>{strings.goals.infoClose}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function compareGoalsByStatus(firstGoal: Goal, secondGoal: Goal): number {
  return Number(isGoalComplete(firstGoal)) - Number(isGoalComplete(secondGoal));
}

function getGoalAccent(goalId: string, theme: AppTheme): string {
  const accents = [theme.accent, colors.warning, colors.accent] as const;
  const hash = goalId.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return accents[hash % accents.length] ?? theme.accent;
}
