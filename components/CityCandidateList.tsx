"use client";

import type { CityCandidate } from "@/types/weather";

type Props = {
  candidates: CityCandidate[];
  onSelect: (candidate: CityCandidate) => void;
};

export default function CityCandidateList({ candidates, onSelect }: Props) {
  if (candidates.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <p className="text-sm text-[#c8d9b0] mb-2">候補地点を選択してください</p>
      <div className="flex flex-wrap gap-2">
        {candidates.map((c, i) => (
          <button
            key={i}
            onClick={() => onSelect(c)}
            className="px-4 py-1.5 rounded-full bg-[#4a5a38] border border-[#7a8f60] text-[#F5EFE0] text-sm hover:bg-[#5a6e45] hover:border-[#F5EFE0] active:scale-95 transition"
          >
            {c.local_names?.ja ?? c.name}
            {c.state ? `, ${c.state}` : ""} ({c.country})
          </button>
        ))}
      </div>
    </div>
  );
}
