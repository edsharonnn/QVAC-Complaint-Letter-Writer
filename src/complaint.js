// QVAC Complaint Letter Writer — core logic.
// completion() drafts one firm-but-polite complaint letter opening
// from a user-described situation. A draft to personalize, never a
// finished letter — same principle as Wedding Toast Writer.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  if (text.length > 800) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

const FALLBACK =
  "I'm writing to formally raise an issue that has not been resolved through " +
  "normal channels. I expect a clear response and a concrete timeline for how " +
  "this will be fixed.";

export async function generate(modelId, situation) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "Write one firm but polite complaint letter opening (3-4 sentences) " +
          `for this situation: ${situation}. No insults, stay professional, ` +
          "state the issue clearly and what resolution is expected. Reply with " +
          "ONLY the letter opening, no greeting, no signature.",
      },
      { role: "user", content: `Situation: ${situation}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.7, maxTokens: 200 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();

  const letter = looksUnusable(text) ? FALLBACK : text;
  return { letter };
}
