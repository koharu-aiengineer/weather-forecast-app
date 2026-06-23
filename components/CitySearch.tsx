"use client";

import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
  isLoading: boolean;
};

export default function CitySearch({ onSearch, isLoading }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (q) onSearch(q);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="都市名を入力（例：東京、大阪）"
        className="flex-1 px-4 py-2 rounded-full bg-[#4a5a38] text-[#F5EFE0] placeholder-[#b8c9a0] border border-[#7a8f60] focus:outline-none focus:border-[#F5EFE0] transition"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="px-5 py-2 rounded-full bg-[#8B5E3C] text-[#F5EFE0] font-semibold hover:bg-[#a0724e] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "検索中…" : "検索"}
      </button>
    </form>
  );
}
