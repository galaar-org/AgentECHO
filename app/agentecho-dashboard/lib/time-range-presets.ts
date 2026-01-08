import {
	endOfDay,
	startOfDay,
	startOfHour,
	subDays,
	subHours,
	subMonths,
	subYears,
} from "date-fns";

export type TimeRangePreset =
	| "last_hour"
	| "today"
	| "yesterday"
	| "last_7_days"
	| "last_14_days"
	| "last_30_days"
	| "last_3_months"
	| "last_6_months"
	| "last_year"
	| "all_time";

export type ChartBucket = "minute" | "hour" | "day" | "week" | "month";

export interface TimeRangePresetConfig {
	id: TimeRangePreset;
	label: string;
	getDateRange: () => { from: Date; to: Date };
	bucket: ChartBucket;
	chartLabelFormat: string;
	limit: number; // Default data point limit for this preset
}

export const TIME_RANGE_PRESETS: TimeRangePresetConfig[] = [
	{
		id: "last_hour",
		label: "Last Hour",
		getDateRange: () => ({
			from: subHours(new Date(), 1),
			to: new Date(),
		}),
		bucket: "minute",
		chartLabelFormat: "HH:mm",
		limit: 60,
	},
	{
		id: "today",
		label: "Today",
		getDateRange: () => ({
			from: startOfDay(new Date()),
			to: new Date(),
		}),
		bucket: "hour",
		chartLabelFormat: "HH:mm",
		limit: 24,
	},
	{
		id: "yesterday",
		label: "Yesterday",
		getDateRange: () => {
			const yesterday = subDays(new Date(), 1);
			return {
				from: startOfDay(yesterday),
				to: endOfDay(yesterday),
			};
		},
		bucket: "hour",
		chartLabelFormat: "HH:mm",
		limit: 24,
	},
	{
		id: "last_7_days",
		label: "Last 7 Days",
		getDateRange: () => ({
			from: subDays(startOfDay(new Date()), 6),
			to: new Date(),
		}),
		bucket: "day",
		chartLabelFormat: "EEE", // Mon, Tue, Wed
		limit: 7,
	},
	{
		id: "last_14_days",
		label: "Last 14 Days",
		getDateRange: () => ({
			from: subDays(startOfDay(new Date()), 13),
			to: new Date(),
		}),
		bucket: "day",
		chartLabelFormat: "MMM d", // Jan 1
		limit: 14,
	},
	{
		id: "last_30_days",
		label: "Last 30 Days",
		getDateRange: () => ({
			from: subDays(startOfDay(new Date()), 29),
			to: new Date(),
		}),
		bucket: "day",
		chartLabelFormat: "MMM d",
		limit: 30,
	},
	{
		id: "last_3_months",
		label: "Last 3 Months",
		getDateRange: () => ({
			from: subMonths(startOfDay(new Date()), 3),
			to: new Date(),
		}),
		bucket: "month",
		chartLabelFormat: "MMM", // Oct, Nov, Dec
		limit: 4,
	},
	{
		id: "last_6_months",
		label: "Last 6 Months",
		getDateRange: () => ({
			from: subMonths(startOfDay(new Date()), 6),
			to: new Date(),
		}),
		bucket: "month",
		chartLabelFormat: "MMM", // Jul, Aug, Sep...
		limit: 7,
	},
	{
		id: "last_year",
		label: "Last Year",
		getDateRange: () => ({
			from: subYears(startOfDay(new Date()), 1),
			to: new Date(),
		}),
		bucket: "month",
		chartLabelFormat: "MMM", // Jan, Feb
		limit: 13,
	},
	{
		id: "all_time",
		label: "All Time",
		getDateRange: () => ({
			from: new Date(0), // Unix epoch
			to: new Date(),
		}),
		bucket: "month",
		chartLabelFormat: "MMM yyyy", // Jan 2024
		limit: 120,
	},
];

export function getPresetConfig(id: TimeRangePreset): TimeRangePresetConfig {
	const preset = TIME_RANGE_PRESETS.find((p) => p.id === id);
	if (!preset) {
		// Default to "today" if not found
		return TIME_RANGE_PRESETS.find((p) => p.id === "today")!;
	}
	return preset;
}

// Calculate appropriate chart config for custom date ranges
export function getCustomRangeConfig(from: Date, to: Date): {
	bucket: ChartBucket;
	chartLabelFormat: string;
	limit: number;
} {
	const spanMs = to.getTime() - from.getTime();
	const spanDays = spanMs / (1000 * 60 * 60 * 24);

	if (spanDays <= 1) {
		return { bucket: "hour", chartLabelFormat: "HH:mm", limit: 24 };
	}
	if (spanDays <= 7) {
		return { bucket: "day", chartLabelFormat: "EEE", limit: 7 };
	}
	if (spanDays <= 14) {
		return { bucket: "day", chartLabelFormat: "MMM d", limit: 14 };
	}
	if (spanDays <= 30) {
		return { bucket: "day", chartLabelFormat: "MMM d", limit: 30 };
	}
	if (spanDays <= 90) {
		return { bucket: "month", chartLabelFormat: "MMM", limit: 4 };
	}
	if (spanDays <= 180) {
		return { bucket: "month", chartLabelFormat: "MMM", limit: 7 };
	}
	if (spanDays <= 365) {
		return { bucket: "month", chartLabelFormat: "MMM", limit: 13 };
	}
	return { bucket: "month", chartLabelFormat: "MMM yyyy", limit: 120 };
}
