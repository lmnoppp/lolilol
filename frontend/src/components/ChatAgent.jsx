import { useEffect, useRef, useState } from "react";
import useN8NWebhook from "../hooks/useN8NWebhook";
import { buildAgentPayloadFromMessage, normalizeAgentResponse } from "../utils/aiAgent";

export default function ChatAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { call, loading, error } = useN8NWebhook();
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function onSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input.trim(), ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const payload = buildAgentPayloadFromMessage(userMsg.text);
    const response = await call("callAgent", payload);
    const normalized = normalizeAgentResponse(response);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: normalized.text,
        toolsUsed: normalized.toolsUsed,
        recommendations: normalized.recommendations,
        ts: Date.now()
      }
    ]);
  }

  return (
    <div className="chat-agent">
      <div className="chat-header">Agent IA Marketing</div>
      <div className="chat-body" ref={listRef} style={{ overflowY: "auto", height: 300, border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{m.role === "user" ? "Vous" : "Assistant"}</div>
            <div>{m.text}</div>
            {m.toolsUsed?.length ? (
              <div style={{ fontSize: 12, color: "#666" }}>Outils: {m.toolsUsed.join(", ")}</div>
            ) : null}
            {m.recommendations?.length ? (
              <ul style={{ fontSize: 12, color: "#666", paddingLeft: 16 }}>
                {m.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
        {loading && <div>Analyse en cours…</div>}
        {error && <div style={{ color: "tomato" }}>Erreur: {error}</div>}
      </div>
      <form onSubmit={onSend} style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          type="text"
          placeholder="Demandez une analyse, une action ou du contenu…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}

