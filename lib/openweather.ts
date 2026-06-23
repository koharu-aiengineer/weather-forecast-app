import type { CityCandidate, CurrentWeather, ForecastResponse } from "@/types/weather";

const BASE = "https://api.openweathermap.org";

function apiKey(): string {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) throw new Error("OPENWEATHER_API_KEY is not set");
  return key;
}

export async function geocode(query: string): Promise<CityCandidate[]> {
  const url = `${BASE}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
  return res.json();
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const url = `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Current Weather API error: ${res.status}`);
  return res.json();
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const url = `${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
  return res.json();
}
