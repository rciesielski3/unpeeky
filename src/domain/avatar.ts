export const AVATARS = [
  { id: "dino", label: "Dino", color: "#8BD34B" },
  { id: "rocket", label: "Rocket", color: "#EF4444" },
  { id: "panda", label: "Panda", color: "#111827" },
  { id: "lion", label: "Lion", color: "#F59E0B" },
  { id: "star", label: "Star", color: "#FACC15" },
  { id: "unicorn", label: "Uni", color: "#D946EF" }
] as const;

export const DEFAULT_AVATAR_ID = AVATARS[0].id;

export type AvatarId = (typeof AVATARS)[number]["id"];

export type Avatar = {
  id: AvatarId;
  label: string;
  color: string;
};

export function getAvatar(avatarId: string): Avatar {
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? AVATARS[0];
}
