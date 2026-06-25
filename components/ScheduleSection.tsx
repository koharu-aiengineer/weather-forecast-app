"use client";

import { useState, useEffect } from "react";
import type { ScheduleEntry, ScheduleWeatherEntry, PackingItem } from "@/types/schedule";
import type { CityCandidate, ForecastResponse } from "@/types/weather";
import { generatePackingList } from "@/lib/packingList";

const STORAGE_KEY = "weather-schedule-entries";
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function getScheduleDates(): { date: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label =
      i === 0 ? "今日" :
      i === 1 ? "明日" :
      `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]})`;
    return { date, label };
  });
}

type Props = {
  onWeatherReady?: (entries: ScheduleWeatherEntry[]) => void;
};

export default function ScheduleSection({ onWeatherReady }: Props) {
  const scheduleDates = getScheduleDates();

  const [scheduleDate, setScheduleDate] = useState(scheduleDates[0].date);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [timeInput, setTimeInput] = useState("09:00");
  const [cityInput, setCityInput] = useState("");
  const [candidates, setCandidates] = useState<CityCandidate[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [weatherEntries, setWeatherEntries] = useState<ScheduleWeatherEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleDateChange = (date: string) => {
    setScheduleDate(date);
    setPackingItems([]);
    setWeatherEntries([]);
  };

  const handleSearch = async () => {
    if (!cityInput.trim()) return;
    setSearchLoading(true);
    setError(null);
    setCandidates([]);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(cityInput.trim())}`);
      if (!res.ok) throw new Error("都市の検索に失敗しました");
      const raw: CityCandidate[] = await res.json();

      const seen = new Set<string>();
      const data = raw.filter((c) => {
        const key = `${c.local_names?.ja ?? c.name}|${c.state ?? ""}|${c.country}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (data.length === 0) {
        setError("都市が見つかりませんでした");
      } else if (data.length === 1) {
        addEntry(data[0]);
      } else {
        setCandidates(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSearchLoading(false);
    }
  };

  const addEntry = (city: CityCandidate) => {
    const entry: ScheduleEntry = {
      id: `${Date.now()}-${Math.random()}`,
      time: timeInput,
      cityName: city.local_names?.ja ?? city.name,
      lat: city.lat,
      lon: city.lon,
    };
    setEntries((prev) =>
      [...prev, entry].sort((a, b) => a.time.localeCompare(b.time))
    );
    setCandidates([]);
    setCityInput("");
    setPackingItems([]);
    setWeatherEntries([]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setPackingItems([]);
    setWeatherEntries([]);
  };

  const handleGenerate = async () => {
    if (entries.length === 0) return;
    setGenerating(true);
    setError(null);

    try {
      const uniqueKeys = new Map<string, { lat: number; lon: number }>();
      for (const entry of entries) {
        const key = `${entry.lat},${entry.lon}`;
        if (!uniqueKeys.has(key)) uniqueKeys.set(key, { lat: entry.lat, lon: entry.lon });
      }

      const forecastMap = new Map<string, ForecastResponse>();
      await Promise.all(
        Array.from(uniqueKeys.entries()).map(async ([key, { lat, lon }]) => {
          const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          if (!res.ok) throw new Error("天気データの取得に失敗しました");
          const data: { forecast: ForecastResponse } = await res.json();
          forecastMap.set(key, data.forecast);
        })
      );

      const [sy, sm, sd] = scheduleDate.split("-").map(Number);

      const enriched: ScheduleWeatherEntry[] = entries.map((entry) => {
        const forecast = forecastMap.get(`${entry.lat},${entry.lon}`);
        if (!forecast) return { ...entry, temp: null, pop: null, description: null, windSpeed: null };

        const [h, m] = entry.time.split(":").map(Number);
        const target = new Date(sy, sm - 1, sd, h, m, 0, 0);
        const targetTs = Math.floor(target.getTime() / 1000);

        let closest = forecast.list[0];
        let minDiff = Math.abs(forecast.list[0].dt - targetTs);
        for (const item of forecast.list) {
          const diff = Math.abs(item.dt - targetTs);
          if (diff < minDiff) {
            minDiff = diff;
            closest = item;
          }
        }

        return {
          ...entry,
          temp: Math.round(closest.main.temp),
          pop: Math.round(closest.pop * 100),
          description: closest.weather[0].description,
          windSpeed: closest.wind.speed,
        };
      });

      setWeatherEntries(enriched);
      setPackingItems(generatePackingList(enriched));
      setChecked(new Set());
      onWeatherReady?.(enriched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  };

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="font-display text-2xl text-[#F5EFE0]">1日のスケジュール</h2>

      {/* 日付タブ */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {scheduleDates.map(({ date, label }) => (
          <button
            key={date}
            onClick={() => handleDateChange(date)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              scheduleDate === date
                ? "bg-[#F5EFE0] text-[#4a5a38]"
                : "bg-[#4a5a38] text-[#c8d9b0] hover:bg-[#5a6a48]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 追加フォーム */}
      <div className="bg-[#4a5a38] rounded-2xl p-4 space-y-3">
        <p className="text-xs text-[#c8d9b0]">時間帯と都市を追加して、持ち物チェックリストを作成します</p>
        <div className="flex gap-2">
          <input
            type="time"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="bg-[#3a4a28] text-[#F5EFE0] rounded-xl px-3 py-2 text-sm w-28 border border-[#6a7a58]"
          />
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="都市名（例：大阪、札幌）"
            className="flex-1 bg-[#3a4a28] text-[#F5EFE0] rounded-xl px-3 py-2 text-sm border border-[#6a7a58] placeholder-[#8a9a78]"
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading || !cityInput.trim()}
            className="bg-[#6a7a58] hover:bg-[#7a8a68] text-[#F5EFE0] rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {searchLoading ? "…" : "追加"}
          </button>
        </div>

        {/* 候補リスト */}
        {candidates.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-[#c8d9b0]">都市を選択してください</p>
            {candidates.map((c) => (
              <button
                key={`${c.lat}-${c.lon}`}
                onClick={() => addEntry(c)}
                className="w-full text-left bg-[#3a4a28] hover:bg-[#5a6a48] rounded-xl px-3 py-2 text-sm text-[#F5EFE0] transition-colors"
              >
                {c.local_names?.ja ?? c.name}
                {c.state ? ` · ${c.state}` : ""} ({c.country})
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-[#f0a080]">{error}</p>}
      </div>

      {/* スケジュールリスト */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#4a5a38] rounded-2xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#c8d9b0] text-sm font-mono">{entry.time}</span>
                <span className="text-[#F5EFE0] text-sm font-semibold">{entry.cityName}</span>
              </div>
              <button
                onClick={() => removeEntry(entry.id)}
                className="text-[#8a9a78] hover:text-[#f0a080] text-xs transition-colors"
              >
                削除
              </button>
            </div>
          ))}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-[#6a7a58] hover:bg-[#7a8a68] text-[#F5EFE0] rounded-2xl py-3 text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {generating ? "天気を取得中…" : "持ち物チェックリストを作成"}
          </button>
        </div>
      )}

      {/* 持ち物チェックリスト */}
      {packingItems.length > 0 && (
        <div className="bg-[#4a5a38] rounded-2xl p-4 space-y-4">
          {/* 各地点の天気サマリー */}
          {weatherEntries.length > 0 && (
            <div>
              <p className="text-xs text-[#c8d9b0] mb-2">各地点の天気</p>
              <div className="space-y-1">
                {weatherEntries.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="text-[#c8d9b0] font-mono text-xs w-10">{e.time}</span>
                    <span className="text-[#F5EFE0] font-semibold w-16 truncate">{e.cityName}</span>
                    {e.temp !== null ? (
                      <>
                        <span className="text-[#F5EFE0]">{e.temp}°C</span>
                        <span className="text-[#b0c8e0] text-xs">雨{e.pop}%</span>
                        <span className="text-[#c8d9b0] text-xs">{e.description}</span>
                      </>
                    ) : (
                      <span className="text-[#8a9a78] text-xs">取得失敗</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* チェックリスト */}
          <div>
            <p className="text-xs text-[#c8d9b0] mb-2">持ち物リスト</p>
            <div className="space-y-2">
              {packingItems.map((item) => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggleCheck(item.id)}
                    className="w-4 h-4 rounded accent-[#90d870]"
                  />
                  <span
                    className={`text-sm transition-colors ${
                      checked.has(item.id) ? "line-through text-[#8a9a78]" : "text-[#F5EFE0]"
                    }`}
                  >
                    {item.emoji} {item.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-[#8a9a78] mt-3">
              {checked.size} / {packingItems.length} チェック済み
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
