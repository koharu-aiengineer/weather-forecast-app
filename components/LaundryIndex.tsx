"use client";

import { calcLaundryIndex, type LaundryRating } from "@/lib/laundryIndex";

type Props = {
  pop: number;
  humidity: number;
  windSpeed: number;
};

const RATING_STYLES: Record<LaundryRating, { bg: string; text: string; border: string }> = {
  "◎": { bg: "#2a4a1a", text: "#90d870", border: "#5a9040" },
  "○": { bg: "#4a3a10", text: "#d4b040", border: "#a08020" },
  "△": { bg: "#4a2020", text: "#d47060", border: "#a03020" },
};

export default function LaundryIndex({ pop, humidity, windSpeed }: Props) {
  const result = calcLaundryIndex(pop, humidity, windSpeed);
  const style = RATING_STYLES[result.rating];

  return (
    <div className="rounded-2xl px-4 py-4 bg-[#4a5a38]">
      <p className="text-xs text-[#c8d9b0] mb-3">洗濯指数</p>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: style.bg, color: style.text, border: `2px solid ${style.border}` }}
        >
          {result.rating}
        </div>
        <div>
          <p className="font-semibold text-[#F5EFE0] text-sm">{result.label}</p>
          <p className="text-xs text-[#c8d9b0] mt-0.5">{result.reason}</p>
        </div>
      </div>
    </div>
  );
}
