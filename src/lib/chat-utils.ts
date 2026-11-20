export function generateConversationTitle(message: string): string {
  const cleaned = message
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "New conversation";
  }

  // Prefer the first complete sentence.
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0];

  const title = firstSentence.length <= 55
    ? firstSentence
    : firstSentence.slice(0, 52).replace(/\s+\S*$/, "") + "...";

  return title || "New conversation";
}