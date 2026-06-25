export type LaundryRating = "◎" | "○" | "△";

export type LaundryIndexResult = {
  rating: LaundryRating;
  label: string;
  reason: string;
};

function calcScore(pop: number, humidity: number, windSpeed: number): number {
  let s = 0;
  if (pop < 20) s += 2;
  else if (pop < 40) s += 1;

  if (humidity < 60) s += 2;
  else if (humidity < 80) s += 1;

  if (windSpeed >= 3) s += 2;
  else if (windSpeed >= 1) s += 1;

  return s;
}

export function calcLaundryIndex(
  pop: number,
  humidity: number,
  windSpeed: number
): LaundryIndexResult {
  // 降水確率50%以上は問答無用で△
  if (pop >= 50) {
    return {
      rating: "△",
      label: "外出時は注意",
      reason: "降水確率が高く、外干しは避けましょう",
    };
  }

  const s = calcScore(pop, humidity, windSpeed);
  if (s >= 5) {
    return {
      rating: "◎",
      label: "外干しOK",
      reason: "乾燥した風があり、よく乾きます",
    };
  }
  if (s >= 3) {
    return {
      rating: "○",
      label: "室内干し推奨",
      reason: "湿度やや高め、または風が弱め。急ぎでなければ室内干しを",
    };
  }
  return {
    rating: "△",
    label: "外出時は注意",
    reason: "降水確率・湿度が高く、外干しは避けましょう",
  };
}
