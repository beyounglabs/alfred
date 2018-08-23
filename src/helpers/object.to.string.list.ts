export function objectToStringList(item: any) {
  try {
    return Object.keys(item)
      .map(key => key + '=' + item[key])
      .join(', ');
  } catch (e) {
    return '';
  }
}
