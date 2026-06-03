export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Split players into N teams; sizes differ by at most 1. */
export function splitIntoTeams<T>(items: T[], teamCount: number): T[][] {
  if (teamCount < 1) throw new Error("Team count must be at least 1");
  if (items.length === 0) return Array.from({ length: teamCount }, () => []);

  const shuffled = shuffle(items);
  const base = Math.floor(shuffled.length / teamCount);
  const remainder = shuffled.length % teamCount;

  const teams: T[][] = [];
  let index = 0;
  for (let i = 0; i < teamCount; i++) {
    const size = base + (i < remainder ? 1 : 0);
    teams.push(shuffled.slice(index, index + size));
    index += size;
  }
  return teams;
}
