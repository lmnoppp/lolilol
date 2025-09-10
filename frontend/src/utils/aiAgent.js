export function buildAgentPayloadFromMessage(message, context = {}) {
  return {
    action: "chat",
    data: {
      user_id: context.userId || "anonymous",
      parameters: {},
      context: { message, ...context }
    },
    timestamp: new Date().toISOString(),
    session_id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())
  };
}

export function normalizeAgentResponse(response) {
  if (!response) return { text: "", toolsUsed: [], recommendations: [] };
  const data = response.data || {};
  const result = data.result || {};
  return {
    text: typeof result === "string" ? result : (result.text || JSON.stringify(result)),
    toolsUsed: data.tools_used || [],
    recommendations: data.recommendations || []
  };
}

