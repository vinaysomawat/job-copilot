import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from the environment (.env.local at the project root)
const client = new Anthropic();

const encoder = new TextEncoder();

export async function POST() {
  const stream = client.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 64000,
    system: "You are a helpful coding assistant specializing in Python.",
    messages: [
      {
        role: "user",
        content: "How do I sort a list of dictionaries by key?",
      },
    ],
  });

  const body = new ReadableStream({
    async start(controller) {
      try {
        // Forward only text deltas; thinking deltas are skipped
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const message = await stream.finalMessage();
        if (message.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("\n\nClaude declined to answer this request."),
          );
        }
        controller.close();
      } catch (error) {
        console.error("Claude stream failed:", error);
        controller.error(error);
      }
    },
    cancel() {
      // Client navigated away or aborted; stop the upstream request
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
