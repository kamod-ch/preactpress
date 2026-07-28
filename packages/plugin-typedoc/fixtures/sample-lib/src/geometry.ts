/** Secondary module for monorepo-style entry coverage. */
export interface Point {
  x: number;
  y: number;
}

/** @since 1.1.0 */
export function distance(origin: Point, target: Point): number {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  return Math.sqrt(dx * dx + dy * dy);
}
