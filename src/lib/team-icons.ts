/** Fitness-themed team icons (orange / energy / wellness). */
export const TEAM_ICONS = ["🍊", "🔥", "💪", "⚡", "🌟", "🏆", "🏃", "💧"] as const;

export function iconForTeamIndex(index: number): string {
  return TEAM_ICONS[index % TEAM_ICONS.length]!;
}

export function iconFromTeamName(name: string): string {
  const match = name.match(/Team\s*(\d+)/i);
  const idx = match ? Math.max(0, parseInt(match[1]!, 10) - 1) : 0;
  return iconForTeamIndex(idx);
}

export function formatTeamLabel(name: string, icon?: string | null): string {
  const emoji = icon ?? iconFromTeamName(name);
  if (name.startsWith(emoji)) return name;
  return `${emoji} ${name}`;
}
