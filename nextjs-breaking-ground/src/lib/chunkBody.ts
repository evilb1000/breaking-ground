/**
 * Splits a Portable Text body array into chunks for ad injection.
 *
 * Rules:
 *  - ≤ 5 blocks  → 1 chunk  → 1 ad at the end
 *  - ≤ 10 blocks → 2 chunks → ads after block 3 and at the end
 *  - > 10 blocks → 3 chunks → ads after block 3, at midpoint, and at the end
 */
export function threeAdChunks(body: unknown[]): unknown[][] {
  if (!Array.isArray(body) || body.length === 0) return [[]];

  const n = body.length;

  if (n <= 5) {
    // 1 ad — end only
    return [body];
  }

  if (n <= 10) {
    // 2 ads — after block 3 and at the end
    return [
      body.slice(0, 3),
      body.slice(3),
    ];
  }

  // 3 ads — after block 3, at midpoint, at the end
  const mid = Math.max(4, Math.floor(n / 2));
  return [
    body.slice(0, 3),
    body.slice(3, mid),
    body.slice(mid),
  ].filter((c) => c.length > 0);
}
