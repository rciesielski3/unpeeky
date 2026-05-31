export const AVATARS = [
  { id: "dino", labelKey: "dino", emoji: "🦖" },
  { id: "unicorn", labelKey: "unicorn", emoji: "🦄" },
  { id: "rocket", labelKey: "rocket", emoji: "🚀" },
  { id: "panda", labelKey: "panda", emoji: "🐼" },
  { id: "lion", labelKey: "lion", emoji: "🦁" },
  { id: "fox", labelKey: "fox", emoji: "🦊" },
  { id: "rabbit", labelKey: "rabbit", emoji: "🐰" },
  { id: "frog", labelKey: "frog", emoji: "🐸" },
  { id: "dolphin", labelKey: "dolphin", emoji: "🐬" },
  { id: "butterfly", labelKey: "butterfly", emoji: "🦋" },
  { id: "star", labelKey: "star", emoji: "⭐" },
  { id: "rainbow", labelKey: "rainbow", emoji: "🌈" }
] as const;

export const FREE_AVATAR_LIMIT = 5;
export const DEFAULT_AVATAR_ID = AVATARS[0].id;
export type AvatarId = (typeof AVATARS)[number]["id"];

export type Avatar = {
  id: AvatarId;
  labelKey: AvatarLabelKey;
  emoji: string;
};

export type AvatarLabelKey = (typeof AVATARS)[number]["labelKey"];

export function getAvailableAvatars(isPremium: boolean): readonly Avatar[] {
  return isPremium ? AVATARS : AVATARS.slice(0, FREE_AVATAR_LIMIT);
}

export function getAvatar(avatarId: string): Avatar {
  return (AVATARS.find((avatar) => avatar.id === avatarId) ?? AVATARS[0]) as Avatar;
}
