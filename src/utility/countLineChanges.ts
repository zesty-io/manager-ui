export type LineChanges = { added: number; removed: number };

// Past this many edits the Myers pass stops and the count falls back to a
// multiset comparison, which ignores line order. Keeps a whole-file rewrite of
// a large view off the main thread's critical path.
const MAX_EDITS = 1000;

// Lines added and removed between two versions of a file: the shortest
// insert/delete script (Myers), so a moved line counts once each way.
export const countLineChanges = (
  before: string,
  after: string
): LineChanges => {
  const a = before ? before.split("\n") : [];
  const b = after ? after.split("\n") : [];

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) {
    start++;
  }
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const n = endA - start;
  const m = endB - start;
  if (!n || !m) return { added: m, removed: n };

  const limit = Math.min(n + m, MAX_EDITS);
  const offset = limit + 1;
  const furthest = new Int32Array(2 * limit + 3);

  for (let d = 0; d <= limit; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x =
        k === -d ||
        (k !== d && furthest[offset + k - 1] < furthest[offset + k + 1])
          ? furthest[offset + k + 1]
          : furthest[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[start + x] === b[start + y]) {
        x++;
        y++;
      }
      furthest[offset + k] = x;
      if (x >= n && y >= m) {
        const common = (n + m - d) / 2;
        return { added: m - common, removed: n - common };
      }
    }
  }

  const remaining = new Map<string, number>();
  for (let i = start; i < endA; i++) {
    remaining.set(a[i], (remaining.get(a[i]) ?? 0) + 1);
  }
  let added = 0;
  for (let j = start; j < endB; j++) {
    const count = remaining.get(b[j]) ?? 0;
    if (count) remaining.set(b[j], count - 1);
    else added++;
  }
  let removed = 0;
  remaining.forEach((count) => (removed += count));
  return { added, removed };
};
