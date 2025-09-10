import { format } from "date-fns";

export function formatMetricTimeSeries(rows = []) {
  return rows.map((row) => ({
    date: row.date ? format(new Date(row.date), "yyyy-MM-dd") : "",
    revenue: numberOrZero(row.revenue),
    spend: numberOrZero(row.spend),
    conversions: numberOrZero(row.conversions),
    roi: numberOrZero(row.roi)
  }));
}

export function computeKpis(rows = []) {
  const totals = rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + numberOrZero(r.revenue),
      spend: acc.spend + numberOrZero(r.spend),
      conversions: acc.conversions + numberOrZero(r.conversions),
      impressions: acc.impressions + numberOrZero(r.impressions || 0),
      clicks: acc.clicks + numberOrZero(r.clicks || 0)
    }),
    { revenue: 0, spend: 0, conversions: 0, impressions: 0, clicks: 0 }
  );
  const roi = totals.spend > 0 ? (totals.revenue - totals.spend) / totals.spend : 0;
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  return { ...totals, roi, ctr, cpa };
}

function numberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

