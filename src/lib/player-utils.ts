/** Player created within the last 24 hours */
export function isNewPlayer(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000;
}

export function habitLabelsFromCompletions(
  completions: { challenge: { name: string } }[]
): string[] {
  const counts = new Map<string, number>();
  for (const c of completions) {
    const name = c.challenge.name;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
}
