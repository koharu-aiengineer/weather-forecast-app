"use client";

import type { CurrentWeather, DayForecast } from "@/types/weather";
import DateTabs from "./DateTabs";
import LaundryIndex from "./LaundryIndex";

type Props = {
  cityName: string;
  current: CurrentWeather;
  days: DayForecast[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

function WindDirection(deg: number): string {
  const dirs = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export default function WeatherDisplay({ cityName, current, days, selectedDate, onSelectDate }: Props) {
  const selectedDay = days.find((d) => d.date === selectedDate) ?? days[0];
  const isToday = selectedDate === days[0]?.date;

  const displayTemp = isToday ? Math.round(current.main.temp) : selectedDay.tempMax;
  const displayHumidity = isToday ? current.main.humidity : Math.round(
    selectedDay.items.reduce((s, i) => s + i.main.humidity, 0) / selectedDay.items.length
  );
  const displayWeather = isToday ? current.weather[0].description : selectedDay.representativeWeather.description;
  const displayPop = isToday
    ? Math.round((selectedDay?.maxPop ?? 0))
    : selectedDay.maxPop;

  const laundryPop = displayPop;
  const laundryHumidity = isToday
    ? current.main.humidity
    : Math.round(selectedDay.items.reduce((s, i) => s + i.main.humidity, 0) / selectedDay.items.length);
  const laundryWindSpeed = isToday
    ? current.wind.speed
    : selectedDay.items.reduce((s, i) => s + i.wind.speed, 0) / selectedDay.items.length;

  return (
    <div className="w-full space-y-6">
      {/* 都市名 */}
      <h2 className="font-display text-3xl text-[#F5EFE0]">{cityName}</h2>

      {/* 日付タブ */}
      <DateTabs days={days} selectedDate={selectedDate} onSelect={onSelectDate} />

      {/* メイン天気情報 */}
      <div className="space-y-2">
        <p className="text-[#c8d9b0] text-sm capitalize">{displayWeather}</p>
        <p className="font-display text-7xl text-[#F5EFE0]">
          {displayTemp}<span className="text-4xl">°C</span>
        </p>

        {!isToday && (
          <p className="text-[#c8d9b0] text-sm">
            最高 {selectedDay.tempMax}° / 最低 {selectedDay.tempMin}°
          </p>
        )}
        {isToday && (
          <p className="text-[#c8d9b0] text-sm">
            体感 {Math.round(current.main.feels_like)}° / 最高 {Math.round(current.main.temp_max)}° 最低 {Math.round(current.main.temp_min)}°
          </p>
        )}
      </div>

      {/* 洗濯指数 */}
      <LaundryIndex pop={laundryPop} humidity={laundryHumidity} windSpeed={laundryWindSpeed} />

      {/* 詳細情報グリッド */}
      <div className="grid grid-cols-2 gap-3">
        <DetailCard label="湿度" value={`${displayHumidity}%`} />
        <DetailCard label="降水確率" value={`${displayPop}%`} />
        {isToday && (
          <>
            <DetailCard label="風速" value={`${current.wind.speed} m/s`} />
            <DetailCard label="風向" value={WindDirection(current.wind.deg)} />
            <DetailCard label="気圧" value={`${current.main.pressure} hPa`} />
            <DetailCard label="視程" value={`${(current.visibility / 1000).toFixed(1)} km`} />
          </>
        )}
      </div>

      {/* 3時間刻み予報 */}
      {selectedDay.items.length > 1 && (
        <div>
          <p className="text-[#c8d9b0] text-xs mb-2">3時間ごとの予報</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {selectedDay.items.map((item) => (
              <div key={item.dt} className="flex-shrink-0 text-center space-y-1">
                <p className="text-xs text-[#c8d9b0]">{item.dt_txt.slice(11, 16)}</p>
                <p className="text-sm text-[#F5EFE0] font-semibold">{Math.round(item.main.temp)}°</p>
                <p className="text-xs text-[#b0c8e0]">{Math.round(item.pop * 100)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#4a5a38] rounded-2xl px-4 py-3">
      <p className="text-xs text-[#c8d9b0] mb-1">{label}</p>
      <p className="text-[#F5EFE0] font-semibold">{value}</p>
    </div>
  );
}
