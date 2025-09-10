import { useMemo } from "react";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { computeKpis, formatMetricTimeSeries } from "../utils/dataFormatter";

export default function MarketingMetrics() {
  const { data, loading, error } = useRealtimeData("metrics", 15000, { metric: "roi", period: "7d" });

  const series = useMemo(() => formatMetricTimeSeries(data?.timeseries || []), [data]);
  const kpis = useMemo(() => computeKpis(data?.timeseries || []), [data]);

  return (
    <div>
      <h3>Marketing - Métriques</h3>
      {loading && <div>Chargement…</div>}
      {error && <div style={{ color: "tomato" }}>Erreur: {error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Kpi label="Revenu" value={formatCurrency(kpis.revenue)} />
        <Kpi label="Dépenses" value={formatCurrency(kpis.spend)} />
        <Kpi label="ROI" value={`${(kpis.roi * 100).toFixed(1)}%`} />
        <Kpi label="CPA" value={formatCurrency(kpis.cpa)} />
      </div>
      <div style={{ marginTop: 16 }}>
        <SmallTable rows={series.slice(-10)} />
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function SmallTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <Th>Date</Th>
          <Th>Revenu</Th>
          <Th>Dépenses</Th>
          <Th>Conversions</Th>
          <Th>ROI</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <Td>{r.date}</Td>
            <Td>{formatCurrency(r.revenue)}</Td>
            <Td>{formatCurrency(r.spend)}</Td>
            <Td>{r.conversions}</Td>
            <Td>{(r.roi * 100).toFixed(1)}%</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Th({ children }) {
  return (
    <th style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>{children}</th>
  );
}

function Td({ children }) {
  return (
    <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8 }}>{children}</td>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value || 0));
}

