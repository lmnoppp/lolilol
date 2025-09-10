import { useMemo } from "react";
import { useRealtimeData } from "../hooks/useRealtimeData";

export default function CRMPipeline() {
  const { data, loading, error } = useRealtimeData("leads", 20000);

  const columns = ["Prospect", "Email", "Score", "Statut", "Valeur Est."];
  const rows = useMemo(() => (data?.leads || []).map((l) => ({
    name: l.name,
    email: l.email,
    score: l.score,
    status: l.status,
    estimated_value: l.estimated_value
  })), [data]);

  return (
    <div>
      <h3>CRM - Pipeline</h3>
      {loading && <div>Chargement…</div>}
      {error && <div style={{ color: "tomato" }}>Erreur: {error}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{r.name}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{r.email}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{r.score}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{r.status}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{formatCurrency(r.estimated_value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value || 0));
}

