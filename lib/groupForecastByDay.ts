import type { DayForecast, ForecastItem, ForecastResponse } from "@/types/weather";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function buildLabel(dateStr: string, index: number): string {
  if (index === 0) return "今日";
  if (index === 1) return "明日";
  const [, m, d] = dateStr.split("-");
  const date = new Date(`${dateStr}T00:00:00`);
  const w = WEEKDAYS[date.getDay()];
  return `${parseInt(m)}/${parseInt(d)}(${w})`;
}

export function groupForecastByDay(forecast: ForecastResponse): DayForecast[] {
  const grouped = new Map<string, ForecastItem[]>();

  for (const item of forecast.list) {
    const date = item.dt_txt.slice(0, 10);
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(item);
  }

  const days: DayForecast[] = [];
  let index = 0;

  for (const [date, items] of grouped) {
    const tempMax = Math.max(...items.map((i) => i.main.temp_max));
    const tempMin = Math.min(...items.map((i) => i.main.temp_min));
    const maxPop = Math.max(...items.map((i) => i.pop));

    // 代表天気: 12:00〜15:00のアイテムを優先、なければ最高気温時刻
    const noonItem =
      items.find((i) => i.dt_txt.includes("12:00:00")) ??
      items.find((i) => i.dt_txt.includes("15:00:00")) ??
      items[Math.floor(items.length / 2)];

    days.push({
      date,
      label: buildLabel(date, index),
      items,
      tempMax: Math.round(tempMax),
      tempMin: Math.round(tempMin),
      maxPop: Math.round(maxPop * 100),
      representativeWeather: noonItem.weather[0],
    });

    index++;
    if (index >= 5) break;
  }

  return days;
}
