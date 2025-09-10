export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "";
export const API_KEY = import.meta.env.VITE_API_KEY || "";

async function fetchJson(endpoint, payload) {
  const url = `${N8N_WEBHOOK_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed ${response.status}: ${text}`);
  }
  return response.json();
}

export const WebhookService = {
  callAgent: (action, data = {}) =>
    fetchJson("/marketing-assistant", {
      action,
      data,
      timestamp: new Date().toISOString(),
      session_id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())
    }),
  dataSync: (data = {}) => fetchJson("/data-sync", { action: "sync", data }),
  leadProcessing: (data = {}) => fetchJson("/lead-processing", { action: "process_leads", data }),
  contentScheduler: (data = {}) => fetchJson("/content-scheduler", { action: "generate_content", data }),
  campaignOptimizer: (data = {}) => fetchJson("/campaign-optimizer", { action: "optimize", data }),
  emailAutomation: (data = {}) => fetchJson("/email-automation", { action: "send_campaign", data })
};

export default WebhookService;

