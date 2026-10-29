"use client";

import { useState } from "react";
import { callClaude } from "./actions";

export default function Home() {
  const [message, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      setMsg(await callClaude());
    } catch {
      setMsg("Something went wrong calling Claude. Check the server logs.");
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
