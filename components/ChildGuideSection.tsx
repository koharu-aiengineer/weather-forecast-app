"use client";

import { useState, useEffect } from "react";
import type { ChildProfile } from "@/types/child";
import type { ScheduleWeatherEntry } from "@/types/schedule";
import { getAgeDisplay, getClothingAdvice, isInfant } from "@/lib/clothingAdvice";
import { calcTempRange } from "@/lib/packingList";

const STORAGE_KEY = "weather-child-profiles";
const CURRENT_YEAR = new Date().getFullYear();

type Props = {
  displayTemp: number;
  scheduleWeatherEntries: ScheduleWeatherEntry[];
};

export default function ChildGuideSection({ displayTemp, scheduleWeatherEntries }: Props) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState(CURRENT_YEAR - 2);
  const [birthMonth, setBirthMonth] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChildren(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(children));
  }, [children]);

  const handleAdd = () => {
    const now = new Date();
    const totalMonths =
      (now.getFullYear() - birthYear) * 12 + (now.getMonth() + 1 - birthMonth);
    if (totalMonths < 0) {
      setError("生年月が未来の日付になっています");
      return;
    }
    const child: ChildProfile = {
      id: `${Date.now()}-${Math.random()}`,
      name: name.trim() || `お子さん${children.length + 1}`,
      birthYear,
      birthMonth,
    };
    setChildren((prev) => [...prev, child]);
    setName("");
    setError(null);
  };

  const removeChild = (id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id));
  };

  const hasSchedule = scheduleWeatherEntries.length > 0;
  const tempRange = calcTempRange(scheduleWeatherEntries);
  const hasLargeRange = tempRange >= 8;
  const maxPop = hasSchedule
    ? Math.max(...scheduleWeatherEntries.map((e) => e.pop ?? 0))
    : 0;
  const needsRainGear = maxPop >= 60;

  return (
    <div className="w-full space-y-4">
      <h2 className="font-display text-2xl text-[#F5EFE0]">子供の服装ガイド</h2>

      {/* 登録フォーム */}
      <div className="bg-[#4a5a38] rounded-2xl p-4 space-y-3">
        <p className="text-xs text-[#c8d9b0]">お子さんの情報を登録してください</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ニックネーム（任意）"
          className="w-full bg-[#3a4a28] text-[#F5EFE0] rounded-xl px-3 py-2 text-sm border border-[#6a7a58] placeholder-[#8a9a78]"
        />
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            className="bg-[#3a4a28] text-[#F5EFE0] rounded-xl px-3 py-2 text-sm border border-[#6a7a58]"
          >
            {Array.from({ length: 13 }, (_, i) => CURRENT_YEAR - i).map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            value={birthMonth}
            onChange={(e) => setBirthMonth(Number(e.target.value))}
            className="bg-[#3a4a28] text-[#F5EFE0] rounded-xl px-3 py-2 text-sm border border-[#6a7a58]"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
          <span className="text-[#c8d9b0] text-sm">生まれ</span>
          <button
            onClick={handleAdd}
            className="ml-auto bg-[#6a7a58] hover:bg-[#7a8a68] text-[#F5EFE0] rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            追加
          </button>
        </div>
        {error && <p className="text-xs text-[#f0a080]">{error}</p>}
      </div>

      {/* 服装アドバイスカード */}
      {children.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-[#c8d9b0]">
            現在の気温 <span className="text-[#F5EFE0] font-semibold">{displayTemp}°C</span> に基づくアドバイス
          </p>
          {children.map((child) => (
            <div key={child.id} className="bg-[#4a5a38] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#F5EFE0] font-semibold">{child.name}</span>
                  <span className="text-xs text-[#c8d9b0] bg-[#3a4a28] px-2 py-0.5 rounded-full">
                    {getAgeDisplay(child)}
                  </span>
                </div>
                <button
                  onClick={() => removeChild(child.id)}
                  className="text-[#8a9a78] hover:text-[#f0a080] text-xs transition-colors"
                >
                  削除
                </button>
              </div>

              <p className="text-sm text-[#F5EFE0]">
                👕 {getClothingAdvice(child, displayTemp)}
              </p>

              {/* 雨の日はレインコートを追加（乳児は除く） */}
              {needsRainGear && !isInfant(child) && (
                <p className="text-xs text-[#b0c8e0]">
                  ☂️ 雨の確率が高いため、子供用レインコート・カッパを持たせましょう
                </p>
              )}

              {/* 寒暖差8℃以上の注意（スケジュール連動） */}
              {hasLargeRange && (
                <p className="text-xs text-[#d4b040]">
                  ⚠️ 1日の寒暖差が {Math.round(tempRange)}°C あります。脱ぎ着しやすい重ね着がおすすめです
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
