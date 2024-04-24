export function removeNull<T>(value: T | null): value is T {
  return value !== null;
}
