"use client";

import { type ReactNode, createContext, useContext, useMemo, useState } from "react";
import {
	type ChartBucket,
	type TimeRangePreset,
	TIME_RANGE_PRESETS,
	getCustomRangeConfig,
	getPresetConfig,
} from "./time-range-presets";

// Re-export for convenience
export type { TimeRangePreset, ChartBucket };

export interface CustomDateRange {
	from: Date;
	to: Date;
}

interface FilterState {
	route: string | null;
	timeRangePreset: TimeRangePreset | null; // null when using custom range
	customDateRange: CustomDateRange | null; // set when using custom range
}

interface FilterContextType extends FilterState {
	setRoute: (route: string | null) => void;
	setTimeRangePreset: (preset: TimeRangePreset) => void;
	setCustomDateRange: (range: CustomDateRange) => void;
	clearFilters: () => void;
	// Computed values
	dateRange: { from: Date; to: Date };
	timeRangeLabel: string;
	chartBucket: ChartBucket;
	chartLabelFormat: string;
	dataLimit: number;
	isCustomRange: boolean;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
	const [route, setRoute] = useState<string | null>(null);
	const [timeRangePreset, setTimeRangePresetState] = useState<TimeRangePreset | null>("today");
	const [customDateRange, setCustomDateRangeState] = useState<CustomDateRange | null>(null);

	const setTimeRangePreset = (preset: TimeRangePreset) => {
		setTimeRangePresetState(preset);
		setCustomDateRangeState(null);
	};

	const setCustomDateRange = (range: CustomDateRange) => {
		setCustomDateRangeState(range);
		setTimeRangePresetState(null);
	};

	const clearFilters = () => {
		setRoute(null);
		setTimeRangePresetState("today");
		setCustomDateRangeState(null);
	};

	// Compute current values based on preset or custom range
	const computed = useMemo(() => {
		if (customDateRange) {
			const config = getCustomRangeConfig(customDateRange.from, customDateRange.to);
			return {
				dateRange: customDateRange,
				timeRangeLabel: "Custom Range",
				chartBucket: config.bucket,
				chartLabelFormat: config.chartLabelFormat,
				dataLimit: config.limit,
				isCustomRange: true,
			};
		}

		const preset = getPresetConfig(timeRangePreset ?? "today");
		return {
			dateRange: preset.getDateRange(),
			timeRangeLabel: preset.label,
			chartBucket: preset.bucket,
			chartLabelFormat: preset.chartLabelFormat,
			dataLimit: preset.limit,
			isCustomRange: false,
		};
	}, [timeRangePreset, customDateRange]);

	return (
		<FilterContext.Provider
			value={{
				route,
				timeRangePreset,
				customDateRange,
				setRoute,
				setTimeRangePreset,
				setCustomDateRange,
				clearFilters,
				...computed,
			}}
		>
			{children}
		</FilterContext.Provider>
	);
}

export function useFilters() {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error("useFilters must be used within a FilterProvider");
	}
	return context;
}

// Legacy function for backward compatibility during migration
// This can be removed once all components are updated
export function getTimeRangeDates(timeRange: TimeRangePreset): { from: Date; to: Date } {
	const preset = TIME_RANGE_PRESETS.find((p) => p.id === timeRange);
	if (!preset) {
		// Default to today
		const now = new Date();
		const midnight = new Date(now);
		midnight.setHours(0, 0, 0, 0);
		return { from: midnight, to: now };
	}
	return preset.getDateRange();
}
