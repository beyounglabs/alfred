export function coalesce(getter, fallback) {
  try {
    return getter();
  } catch (e) {
    return fallback;
  }
}
