export type CityCandidate = {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};

export type WeatherCondition = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

export type CurrentWeather = {
  dt: number;
  name: string;
  coord: { lat: number; lon: number };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number; deg: number };
  clouds: { all: number };
  visibility: number;
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
};

export type ForecastItem = {
  dt: number;
  dt_txt: string;
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number; deg: number };
  clouds: { all: number };
  pop: number; // 降水確率 0〜1
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
};

export type ForecastResponse = {
  city: {
    name: string;
    country: string;
    coord: { lat: number; lon: number };
  };
  list: ForecastItem[];
};

export type DayForecast = {
  date: string; // "YYYY-MM-DD"
  label: string; // "今日", "明日", "6/24(火)" など
  items: ForecastItem[];
  tempMax: number;
  tempMin: number;
  maxPop: number; // 最大降水確率
  representativeWeather: WeatherCondition;
};

export type WeatherApiResponse = {
  current: CurrentWeather;
  forecast: ForecastResponse;
};
