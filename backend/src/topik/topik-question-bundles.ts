type Bundled = {
  id: string;
  bundleId?: string | null;
  questionNo?: number;
};

/** Gom câu cùng bundleId trong pool thành một đơn vị (luyện dạng random). */
export function partitionPoolIntoUnits<T extends Bundled>(pool: T[]): T[][] {
  const usedIds = new Set<string>();
  const units: T[][] = [];

  for (const q of pool) {
    if (usedIds.has(q.id)) continue;

    if (q.bundleId) {
      const members = pool
        .filter((p) => p.bundleId === q.bundleId)
        .sort((a, b) => (a.questionNo ?? 0) - (b.questionNo ?? 0));
      for (const m of members) usedIds.add(m.id);
      units.push(members);
    } else {
      usedIds.add(q.id);
      units.push([q]);
    }
  }

  return units;
}
