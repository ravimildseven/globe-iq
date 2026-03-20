/** Returns the flag emoji for an ISO alpha-2 country code */
export function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  const base = 0x1F1E6 - 65;
  return String.fromCodePoint(base + code.charCodeAt(0), base + code.charCodeAt(1));
}
