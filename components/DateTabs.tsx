"use client";

import type { DayForecast } from "@/types/weather";

type Props = {
  days: DayForecast[];
  selectedDate: string;
  onSelect: (date: string) => void;
};

export default function DateTabs({ days, selectedDate, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((day) => {
        const isSelected = day.date === selectedDate;
        return (
          <button
            key={day.date}
            onClick={() => onSelect(day.date)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition active:scale-95 ${
              isSelected
                ? "bg-[#8B5E3C] text-[#F5EFE0] border border-[#8B5E3C]"
                : "bg-transparent text-[#c8d9b0] border border-[#7a8f60] hover:border-[#F5EFE0] hover:text-[#F5EFE0]"
            }`}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
