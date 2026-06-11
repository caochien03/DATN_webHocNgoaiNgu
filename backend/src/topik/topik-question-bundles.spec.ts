import { partitionPoolIntoUnits } from './topik-question-bundles';

describe('partitionPoolIntoUnits', () => {
  it('keeps bundled questions together as one unit', () => {
    const pool = [
      { id: 'a', bundleId: 'pair-1', questionNo: 25 },
      { id: 'b', questionNo: 1 },
      { id: 'c', bundleId: 'pair-1', questionNo: 26 },
    ];
    const units = partitionPoolIntoUnits(pool);
    expect(units).toHaveLength(2);
    const bundle = units.find((u) => u.length === 2);
    expect(bundle?.map((q) => q.id).sort()).toEqual(['a', 'c']);
    expect(bundle?.map((q) => q.questionNo)).toEqual([25, 26]);
  });

  it('treats questions without bundleId as singleton units', () => {
    const pool = [
      { id: 'x', questionNo: 1 },
      { id: 'y', questionNo: 2 },
    ];
    expect(partitionPoolIntoUnits(pool)).toEqual([[pool[0]], [pool[1]]]);
  });
});
