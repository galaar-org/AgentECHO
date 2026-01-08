// React Query hooks for API data fetching with polling

import {
  type FilterParams,
  type OpportunityEstimateResponse,
  type OverviewData,
  type TimeseriesPoint,
  type TopBot,
  type TopRoute,
  getAvailableRoutes,
  getOpportunityEstimate,
  getOverview,
  getTimeseries,
  getTopBots,
  getTopRoutes,
} from "@/lib/actions";
import { useFilters } from "@/lib/filter-context";
import type { ChartBucket } from "@/lib/time-range-presets";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addWeeks,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfWeek,
} from "date-fns";

const POLLING_INTERVAL = 10000; // 10 seconds

// Normalize timestamp to a key based on bucket type for comparison
// Uses local time consistently since date generation (startOfMonth, etc.) uses local time
function normalizeTimestamp(ts: string, bucket: ChartBucket): string {
  const date = new Date(ts);
  switch (bucket) {
    case "minute":
      // YYYY-MM-DDTHH:mm
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    case "hour":
      // YYYY-MM-DDTHH
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}`;
    case "day":
      // YYYY-MM-DD
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    case "month":
      // YYYY-MM (aggregate by month)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    case "week":
    default:
      // YYYY-MM-DD
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
}

// Generate all expected time buckets for a date range and fill in zeros for missing data
function fillMissingTimePoints(
  data: TimeseriesPoint[],
  from: Date,
  to: Date,
  bucket: ChartBucket,
): TimeseriesPoint[] {
  // Create a map of existing data points by normalized timestamp key
  // For month bucket, this aggregates all daily data into monthly totals
  const dataMap = new Map<string, TimeseriesPoint>();
  for (const point of data) {
    const key = normalizeTimestamp(point.ts, bucket);
    if (!dataMap.has(key)) {
      dataMap.set(key, {
        ts: bucket === "month" ? startOfMonth(new Date(point.ts)).toISOString() : point.ts,
        total: point.total,
        ai: point.ai,
      });
    } else {
      // Aggregate data points with the same key
      const existing = dataMap.get(key)!;
      dataMap.set(key, {
        ts: existing.ts,
        total: existing.total + point.total,
        ai: existing.ai + point.ai,
      });
    }
  }

  // Generate all expected time points
  const allPoints: TimeseriesPoint[] = [];
  let current: Date;
  const endDate = to;

  // Start from the beginning of the appropriate period
  switch (bucket) {
    case "minute":
      current = new Date(from);
      current.setSeconds(0, 0);
      break;
    case "hour":
      current = startOfHour(from);
      break;
    case "day":
      current = startOfDay(from);
      break;
    case "week":
      current = startOfWeek(from);
      break;
    case "month":
      current = startOfMonth(from);
      break;
    default:
      current = startOfDay(from);
  }

  // Iterate through all time points
  while (current <= endDate) {
    const key = normalizeTimestamp(current.toISOString(), bucket);
    const existingPoint = dataMap.get(key);

    if (existingPoint) {
      allPoints.push(existingPoint);
    } else {
      // Add zero-filled point for missing data
      allPoints.push({
        ts: current.toISOString(),
        total: 0,
        ai: 0,
      });
    }

    // Advance to next bucket
    switch (bucket) {
      case "minute":
        current = addMinutes(current, 1);
        break;
      case "hour":
        current = addHours(current, 1);
        break;
      case "day":
        current = addDays(current, 1);
        break;
      case "week":
        current = addWeeks(current, 1);
        break;
      case "month":
        current = addMonths(current, 1);
        break;
      default:
        current = addDays(current, 1);
    }
  }

  return allPoints;
}

// Cache keys for React Query - using serialized dates for proper cache invalidation
export const queryKeys = {
  overview: (from: string, to: string, route: string | null) =>
    ["overview", from, to, route] as const,
  timeseries: (from: string, to: string, limit: number, route: string | null) =>
    ["timeseries", from, to, limit, route] as const,
  topRoutes: (from: string, to: string, limit: number, route: string | null) =>
    ["top-routes", from, to, limit, route] as const,
  topBots: (from: string, to: string, limit: number, route: string | null) =>
    ["top-bots", from, to, limit, route] as const,
  availableRoutes: ["available-routes"] as const,
  opportunityEstimate: (from: string, to: string, prices: Record<string, number>) =>
    ["opportunity-estimate", from, to, prices] as const,
};

// All hooks auto-apply current filter context and poll every 10s

export function useOverview() {
  const { route, dateRange } = useFilters();
  const fromStr = dateRange.from.toISOString();
  const toStr = dateRange.to.toISOString();

  return useQuery<OverviewData>({
    queryKey: queryKeys.overview(fromStr, toStr, route),
    queryFn: () => {
      const filters: FilterParams = {
        route,
        from: fromStr,
        to: toStr,
      };
      return getOverview(filters);
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useTimeseries(limit?: number) {
  const { route, dateRange, dataLimit, chartBucket } = useFilters();
  const fromStr = dateRange.from.toISOString();
  const toStr = dateRange.to.toISOString();
  const effectiveLimit = limit ?? dataLimit;

  // Map chartBucket to API bucket (API only supports "hour" or "day")
  const apiBucket: "hour" | "day" =
    chartBucket === "minute" || chartBucket === "hour" ? "hour" : "day";

  return useQuery<TimeseriesPoint[], Error, TimeseriesPoint[]>({
    queryKey: queryKeys.timeseries(fromStr, toStr, effectiveLimit, route),
    queryFn: () => {
      const filters: FilterParams = {
        route,
        from: fromStr,
        to: toStr,
      };
      return getTimeseries(apiBucket, effectiveLimit, filters);
    },
    // Fill in missing time points with zero values
    select: (data) => fillMissingTimePoints(data, dateRange.from, dateRange.to, chartBucket),
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useTopRoutes(limit = 10) {
  const { route, dateRange } = useFilters();
  const fromStr = dateRange.from.toISOString();
  const toStr = dateRange.to.toISOString();

  return useQuery<TopRoute[]>({
    queryKey: queryKeys.topRoutes(fromStr, toStr, limit, route),
    queryFn: () => {
      const filters: FilterParams = {
        route,
        from: fromStr,
        to: toStr,
      };
      return getTopRoutes(limit, filters);
    },
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useTopBots(limit = 10) {
  const { route, dateRange } = useFilters();
  const fromStr = dateRange.from.toISOString();
  const toStr = dateRange.to.toISOString();

  return useQuery<TopBot[]>({
    queryKey: queryKeys.topBots(fromStr, toStr, limit, route),
    queryFn: () => {
      const filters: FilterParams = {
        route,
        from: fromStr,
        to: toStr,
      };
      return getTopBots(limit, filters);
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useAvailableRoutes() {
  return useQuery<string[]>({
    queryKey: queryKeys.availableRoutes,
    queryFn: () => getAvailableRoutes(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000,
  });
}

// Only runs when prices are set (enabled: hasAnyPrices)
export function useOpportunityEstimate(prices: Record<string, number>) {
  const { dateRange } = useFilters();
  const fromStr = dateRange.from.toISOString();
  const toStr = dateRange.to.toISOString();
  const hasAnyPrices = Object.keys(prices).length > 0;

  return useQuery<OpportunityEstimateResponse>({
    queryKey: queryKeys.opportunityEstimate(fromStr, toStr, prices),
    queryFn: () => {
      return getOpportunityEstimate({
        from: fromStr,
        to: toStr,
        route_prices: prices,
        pay_through: 1,
      });
    },
    enabled: hasAnyPrices,
    staleTime: 30 * 1000, // 30 seconds
  });
}
