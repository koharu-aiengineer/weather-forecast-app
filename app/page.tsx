"use client";

import { useCallback, useEffect, useState } from "react";
import CitySearch from "@/components/CitySearch";
import CityCandidateList from "@/components/CityCandidateList";
import WeatherDisplay from "@/components/WeatherDisplay";
import WeatherIllustration from "@/components/WeatherIllustration";
import { groupForecastByDay } from "@/lib/groupForecastByDay";
import type { CityCandidate, CurrentWeather, DayForecast, ForecastResponse } from "@/types/weather";

type WeatherState = {
  cityName: string;
  current: CurrentWeather;
  days: DayForecast[];
};

const DEFAULT_CITY: CityCandidate = {
  name: "Tokyo",
  local_names: { ja: "東京" },
  lat: 35.6895,
  lon: 139.6917,
  country: "JP",
};

export default function Home() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [candidates, setCandidates] = useState<CityCandidate[]>([]);
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (candidate: CityCandidate) => {
    setWeatherLoading(true);
    setError(null);
    setCandidates([]);
    try {
      const res = await fetch(`/api/weather?lat=${candidate.lat}&lon=${candidate.lon}`);
      if (!res.ok) throw new Error("天気データの取得に失敗しました");
      const data: { current: CurrentWeather; forecast: ForecastResponse } = await res.json();
      const days = groupForecastByDay(data.forecast);
      const cityName = candidate.local_names?.ja ?? candidate.name;
      setWeather({ cityName, current: data.current, days });
      setSelectedDate(days[0]?.date ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(DEFAULT_CITY);
  }, [loadWeather]);

  const handleSearch = async (query: string) => {
    setSearchLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("都市の検索に失敗しました");
      const data: CityCandidate[] = await res.json();
      if (data.length === 0) {
        setError("該当する都市が見つかりませんでした");
        setCandidates([]);
      } else if (data.length === 1) {
        await loadWeather(data[0]);
      } else {
        setCandidates(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen px-4 py-8 flex flex-col items-center gap-6"
      style={{ background: "linear-gradient(160deg, #6B7A52 0%, #5C6B4A 50%, #4a5a38 100%)" }}
    >
      <h1 className="font-display text-4xl text-[#F5EFE0] tracking-wide">Weather</h1>

      <CitySearch onSearch={handleSearch} isLoading={searchLoading} />

      {candidates.length > 0 && (
        <CityCandidateList candidates={candidates} onSelect={loadWeather} />
      )}

      {error && (
        <p className="text-[#f0a080] text-sm bg-[#4a3030] px-4 py-2 rounded-full">{error}</p>
      )}

      {weatherLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#c8d9b0] animate-pulse">読み込み中…</p>
        </div>
      ) : weather ? (
        <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-8 items-start mt-4">
          <div className="flex justify-center w-full sm:w-auto">
            <WeatherIllustration />
          </div>
          <div className="flex-1 min-w-0">
            <WeatherDisplay
              cityName={weather.cityName}
              current={weather.current}
              days={weather.days}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
