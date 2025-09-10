import MarketingMetrics from "./MarketingMetrics";
import CRMPipeline from "./CRMPipeline";
import ContentHub from "./ContentHub";
import ChatAgent from "./ChatAgent";

export default function MarketingDashboard() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
      <div style={{ display: "grid", gap: 16 }}>
        <section style={cardStyle}>
          <h2>Marketing</h2>
          <MarketingMetrics />
        </section>
        <section style={cardStyle}>
          <h2>CRM</h2>
          <CRMPipeline />
        </section>
        <section style={cardStyle}>
          <h2>Contenu</h2>
          <ContentHub />
        </section>
      </div>
      <aside style={cardStyle}>
        <ChatAgent />
      </aside>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #eaeaea",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
  boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
};

