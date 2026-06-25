export type ScheduleEntry = {
  id: string;
  time: string; // "09:00"
  cityName: string;
  lat: number;
  lon: number;
};

export type ScheduleWeatherEntry = ScheduleEntry & {
  temp: number | null;
  pop: number | null;
  description: string | null;
  windSpeed: number | null;
};

export type PackingItem = {
  id: string;
  label: string;
  emoji: string;
};
