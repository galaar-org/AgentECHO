"use client";

import {
	Button,
	Calendar,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Separator,
} from "@/components/ui";
import {
	type CustomDateRange,
	type TimeRangePreset,
	useFilters,
} from "@/lib/filter-context";
import { TIME_RANGE_PRESETS } from "@/lib/time-range-presets";
import { cn } from "@/lib/utils";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, subMonths } from "date-fns";
import * as React from "react";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
	className?: string;
}

export function DateRangePicker({ className }: DateRangePickerProps) {
	const {
		timeRangePreset,
		customDateRange,
		timeRangeLabel,
		setTimeRangePreset,
		setCustomDateRange,
	} = useFilters();

	const [open, setOpen] = React.useState(false);
	const [showCalendar, setShowCalendar] = React.useState(false);
	const [pendingRange, setPendingRange] = React.useState<DateRange | undefined>(
		customDateRange
			? { from: customDateRange.from, to: customDateRange.to }
			: undefined
	);

	const handlePresetSelect = (preset: TimeRangePreset) => {
		setTimeRangePreset(preset);
		setShowCalendar(false);
		setOpen(false);
	};

	const handleCustomClick = () => {
		setShowCalendar(true);
		setPendingRange(
			customDateRange
				? { from: customDateRange.from, to: customDateRange.to }
				: undefined
		);
	};

	const handleRangeSelect = (range: DateRange | undefined) => {
		setPendingRange(range);
	};

	const handleApplyCustomRange = () => {
		if (pendingRange?.from && pendingRange?.to) {
			setCustomDateRange({
				from: pendingRange.from,
				to: pendingRange.to,
			} as CustomDateRange);
			setOpen(false);
			setShowCalendar(false);
		}
	};

	const handleCancelCustom = () => {
		setShowCalendar(false);
		setPendingRange(undefined);
	};

	// Format the display text
	const displayText = React.useMemo(() => {
		if (customDateRange) {
			return `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d, yyyy")}`;
		}
		return timeRangeLabel;
	}, [customDateRange, timeRangeLabel]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"justify-start text-left font-normal gap-2",
						className
					)}
				>
					<HugeiconsIcon icon={Calendar01Icon} className="size-4" />
					<span className="text-sm">{displayText}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="end">
				<div className="flex">
					{/* Presets Sidebar */}
					<div className="flex flex-col border-r p-2 min-w-[140px]">
						<div className="text-xs font-medium text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
							Quick Select
						</div>
						{TIME_RANGE_PRESETS.map((preset) => (
							<Button
								key={preset.id}
								variant={
									timeRangePreset === preset.id && !showCalendar
										? "secondary"
										: "ghost"
								}
								size="sm"
								className="justify-start h-8 px-2 font-normal"
								onClick={() => handlePresetSelect(preset.id)}
							>
								{preset.label}
							</Button>
						))}
						<Separator className="my-2" />
						<Button
							variant={showCalendar || customDateRange ? "secondary" : "ghost"}
							size="sm"
							className="justify-start h-8 px-2 font-normal"
							onClick={handleCustomClick}
						>
							Custom Range
						</Button>
					</div>

					{/* Calendar Panel (shown when Custom Range selected) */}
					{showCalendar && (
						<div className="p-3">
							<Calendar
								mode="range"
								selected={pendingRange}
								onSelect={handleRangeSelect}
								numberOfMonths={2}
								defaultMonth={pendingRange?.from ?? subMonths(new Date(), 1)}
								disabled={{ after: new Date() }}
							/>
							<Separator className="my-2" />
							<div className="flex items-center justify-between px-2">
								<div className="text-sm text-muted-foreground">
									{pendingRange?.from && pendingRange?.to ? (
										<>
											{format(pendingRange.from, "MMM d, yyyy")} -{" "}
											{format(pendingRange.to, "MMM d, yyyy")}
										</>
									) : (
										"Select a date range"
									)}
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={handleCancelCustom}
									>
										Cancel
									</Button>
									<Button
										size="sm"
										onClick={handleApplyCustomRange}
										disabled={!pendingRange?.from || !pendingRange?.to}
									>
										Apply
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
