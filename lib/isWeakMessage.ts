// ------------------------------
// SMART SEARCH HELPERS
// ------------------------------

export function isWeakMessage(text: string) {
  const t = text.trim().toLowerCase();

  if (t.length < 4) return true;

  if (t.split(" ").length === 1) return true;

  const fillers = [
    "oui",
    "yes",
    "ok",
    "daccord",
    "d’accord",
    "merci",
    "thanks",
    "calgary",
    "edmonton",
    "vancouver",
    "montreal",
  ];

  if (fillers.includes(t)) return true;

  return false;
}

export function buildSearchQuery(messages: any[]) {
  const recent = messages.slice(-6);

  const useful = recent.filter(
    (m) => m.role === "user" && !isWeakMessage(m.content),
  );

  return useful.map((m) => m.content).join(" | ");
}
