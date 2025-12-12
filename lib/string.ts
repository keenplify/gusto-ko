export function pluralize(string: string, count: number): string {
  if (count === 1) {
    return string;
  } else {
    if (
      string.endsWith("s") ||
      string.endsWith("x") ||
      string.endsWith("z") ||
      string.endsWith("ch") ||
      string.endsWith("sh")
    ) {
      return string + "es";
    } else {
      return string + "s";
    }
  }
}
