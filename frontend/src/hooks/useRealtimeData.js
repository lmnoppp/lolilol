import { useEffect, useRef, useState } from "react";
import { WebhookService } from "../components/WebhookService";

export function useRealtimeData(resource, intervalMs = 15000, params = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        let res;
        switch (resource) {
          case "metrics":
            res = await WebhookService.callAgent("analytics", { metric: params.metric || "roi", period: params.period || "7d" });
            break;
          case "leads":
            res = await WebhookService.leadProcessing({ action: "score" });
            break;
          case "content":
            res = await WebhookService.callAgent("content_overview", {});
            break;
          default:
            res = null;
        }

        if (!isMounted) return;
        setData(res?.data?.result ?? res?.data ?? res);
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    fetchData();
    timerRef.current = setInterval(fetchData, intervalMs);

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resource, intervalMs, params.metric, params.period]);

  return { data, error, loading };
}

export default useRealtimeData;

