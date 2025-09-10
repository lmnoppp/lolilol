import MarketingDashboard from "./MarketingDashboard";

export default function Dashboard() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1>Marketing Dashboard</h1>
        <EnvironmentBadge />
      </header>
      <MarketingDashboard />
    </div>
  );
}

function EnvironmentBadge() {
  const env = import.meta.env.VITE_ENVIRONMENT || "development";
  const color = env === "production" ? "#10b981" : env === "staging" ? "#f59e0b" : "#3b82f6";
  return (
    <span style={{ background: color, color: "white", padding: "4px 8px", borderRadius: 999, fontSize: 12 }}>{env}</span>
  );
}

