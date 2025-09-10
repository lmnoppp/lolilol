import { useState } from "react";
import useN8NWebhook from "../hooks/useN8NWebhook";

export default function ContentHub() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const [tone, setTone] = useState("professionnel");
  const [result, setResult] = useState("");
  const { call, loading, error } = useN8NWebhook();

  async function onGenerate(e) {
    e.preventDefault();
    const payload = {
      action: "generate_content",
      data: {
        type: "post",
        platform,
        tone,
        keywords: topic.split(",").map((s) => s.trim()).filter(Boolean)
      },
      timestamp: new Date().toISOString(),
      session_id: String(Date.now())
    };
    const res = await call("contentScheduler", payload);
    setResult(res?.data?.result || JSON.stringify(res, null, 2));
  }

  return (
    <div>
      <h3>Hub de Contenu</h3>
      <form onSubmit={onGenerate} style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px 120px", gap: 8, alignItems: "center" }}>
        <input placeholder="Mots-clés (séparés par des virgules)" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="linkedin">LinkedIn</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
        </select>
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="professionnel">Professionnel</option>
          <option value="convivial">Convivial</option>
          <option value="inspirant">Inspirant</option>
        </select>
        <button type="submit" disabled={loading}>Générer</button>
      </form>
      {error && <div style={{ color: "tomato", marginTop: 8 }}>Erreur: {error}</div>}
      <textarea style={{ width: "100%", height: 220, marginTop: 12 }} value={result} readOnly />
    </div>
  );
}

