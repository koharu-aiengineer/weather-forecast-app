import type { PackingItem, ScheduleWeatherEntry } from "@/types/schedule";

export function generatePackingList(entries: ScheduleWeatherEntry[]): PackingItem[] {
  const valid = entries.filter((e) => e.temp !== null && e.pop !== null);
  if (valid.length === 0) return [];

  const temps = valid.map((e) => e.temp as number);
  const pops = valid.map((e) => e.pop as number);
  const winds = valid.filter((e) => e.windSpeed !== null).map((e) => e.windSpeed as number);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const maxPop = Math.max(...pops);
  const maxWindSpeed = winds.length > 0 ? Math.max(...winds) : 0;
  const tempRange = maxTemp - minTemp;

  let nextId = 0;
  const add = (label: string, emoji: string): PackingItem => ({
    id: String(++nextId),
    label,
    emoji,
  });

  const items: PackingItem[] = [];

  // 雨対策（確率が上がるほど本格的な傘に）
  if (maxPop >= 60) {
    items.push(add("傘（しっかりした傘）", "☂️"));
  } else if (maxPop >= 30) {
    items.push(add("折りたたみ傘", "☂️"));
  }

  // 暑さ対策
  if (maxTemp >= 25) {
    items.push(add("水筒・飲み物（多めに）", "🫙"));
    items.push(add("汗拭きタオル", "🧻"));
  }
  if (maxTemp >= 28) items.push(add("冷感スプレー・冷却シート", "💨"));
  if (maxTemp >= 25 && maxPop < 40) items.push(add("日傘・サングラス", "☀️"));

  // 寒さ対策
  if (minTemp < 5) {
    items.push(add("厚手のコート", "🧥"));
    items.push(add("手袋・マフラー", "🧤"));
  } else if (minTemp < 10) {
    items.push(add("厚手のコート", "🧥"));
    // 10℃未満かつ風速7m/s以上は体感が大幅に下がるため追加
    if (maxWindSpeed >= 7) items.push(add("手袋・マフラー", "🧤"));
  } else if (minTemp < 18) {
    items.push(add("ジャケット・上着", "🧣"));
  } else if (minTemp < 22) {
    items.push(add("薄手のカーディガン", "👚"));
  }

  // 寒暖差対策（機能③との連動にも使用）
  if (tempRange >= 8) items.push(add("脱ぎ着しやすい重ね着", "👗"));

  return items;
}

// 機能③（子供服装ガイド）から温度差を参照するためのユーティリティ
export function calcTempRange(entries: ScheduleWeatherEntry[]): number {
  const temps = entries.filter((e) => e.temp !== null).map((e) => e.temp as number);
  if (temps.length < 2) return 0;
  return Math.max(...temps) - Math.min(...temps);
}
