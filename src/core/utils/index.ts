export function getDeltaTime(delta: number, minus?: boolean): number {
  return Date.now() + (minus ? -delta : delta);
}
