"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { addMonths, subMonths } from "date-fns";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "./button";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	numberOfMonths = 1,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	const [month, setMonthState] = React.useState<Date>(
		props.defaultMonth ?? new Date()
	);

	const handlePrevMonth = () => {
		setMonthState(subMonths(month, 1));
	};

	const handleNextMonth = () => {
		setMonthState(addMonths(month, 1));
	};

	return (
		<div className={cn("p-3", className)}>
			{/* Navigation header */}
			<div className="flex items-center justify-between mb-4">
				<button
					type="button"
					onClick={handlePrevMonth}
					className={cn(
						buttonVariants({ variant: "outline", size: "icon-sm" })
					)}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
					<span className="sr-only">Previous month</span>
				</button>
				<button
					type="button"
					onClick={handleNextMonth}
					className={cn(
						buttonVariants({ variant: "outline", size: "icon-sm" })
					)}
				>
					<HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
					<span className="sr-only">Next month</span>
				</button>
			</div>
			<DayPicker
				month={month}
				onMonthChange={setMonthState}
				showOutsideDays={showOutsideDays}
				numberOfMonths={numberOfMonths}
				classNames={{
					months: "flex flex-row gap-8",
					month: "flex flex-col gap-4",
					month_caption: "flex justify-center pt-1 relative items-center mb-2",
					caption_label: "text-sm font-medium",
					nav: "hidden",
					month_grid: "w-full border-collapse space-y-1",
					weekdays: "flex",
					weekday:
						"text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
					week: "flex w-full mt-2",
					day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
					day_button: cn(
						buttonVariants({ variant: "ghost" }),
						"size-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
					),
					selected:
						"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
					today: "bg-accent text-accent-foreground rounded-md",
					outside:
						"day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
					disabled: "text-muted-foreground opacity-50",
					range_middle:
						"aria-selected:bg-accent aria-selected:text-accent-foreground",
					range_start: "rounded-l-md",
					range_end: "rounded-r-md",
					hidden: "invisible",
					...classNames,
				}}
				{...props}
			/>
		</div>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
