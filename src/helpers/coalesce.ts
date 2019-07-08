export function coalesce(getter, fallback) {
  try {
    const value = getter();

    if (value === null || value === undefined || Number.isNaN(value)) {
      return fallback;
    }

    return value;
  } catch (e) {
    return fallback;
  }
}
