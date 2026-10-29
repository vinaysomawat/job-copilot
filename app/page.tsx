"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/claude", { method: "POST" });
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        // stream: true keeps multi-byte characters split across chunks intact
        const chunk = decoder.decode(value, { stream: true });
        setMsg((prev) => prev + chunk);
      }
    } catch {
      setMsg((prev) =>
        prev + "\n\nSomething went wrong calling Claude. Check the server logs.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Thinking..." : "Call Claude"}
      </button>
      <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>
    </>
  );
}
