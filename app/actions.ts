"use server";

import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from the environment (.env.local at the project root)
const client = new Anthropic();

export async function callClaude() {
  const message = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    system: "You are a helpful coding assistant specializing in Python.",
    messages: [
      {
        role: "user",
        content: "How do I sort a list of dictionaries by key?",
      },
    ],
  });

  if (message.stop_reason === "refusal") {
    return "Claude declined to answer this request.";
  }

  // Content can include thinking blocks; keep only the text the model wrote
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}
