import { useCallback, useState } from "react";
import { WebhookService } from "../components/WebhookService";

export function useN8NWebhook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (methodName, payload) => {
    setLoading(true);
    setError(null);
    try {
      if (!WebhookService[methodName]) {
        throw new Error(`Unknown webhook method: ${methodName}`);
      }
      const result = await WebhookService[methodName](payload);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
}

export default useN8NWebhook;

