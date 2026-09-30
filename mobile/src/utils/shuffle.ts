/**
 * Shuffles an array using the modern Fisher-Yates (Knuth) algorithm.
 * 
 * Properties:
 * - Unbiased uniform distribution: Every permutation has an equal probability of 1 / n!.
 * - Linear time complexity: O(n) operations.
 * - Non-destructive: Returns a brand-new shuffled shallow copy, leaving the original array intact.
 * 
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: readonly T[] | T[]): T[] {
  if (!array || array.length <= 1) {
    return array ? [...array] : [];
  }

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
}
