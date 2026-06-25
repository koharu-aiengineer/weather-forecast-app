import type { ChildProfile } from "@/types/child";

type AgeStage = "乳児" | "幼児" | "未就学児" | "小学生以降";
type TempBand = "極寒" | "寒" | "普通" | "暑";

const ADVICE: Record<AgeStage, Record<TempBand, string>> = {
  乳児: {
    極寒: "厚手のカバーオール＋おくるみ。肌着を1枚多めに重ねて",
    寒: "長袖ロンパース＋カーディガン。靴下は必ず",
    普通: "薄手の長袖ロンパース。重ね着で調整を",
    暑: "半袖ロンパース1枚。こまめに汗を拭いて",
  },
  幼児: {
    極寒: "厚手のアウター＋重ね着。帽子・手袋も忘れずに",
    寒: "長袖トップス＋薄手のジャケット。靴下を忘れずに",
    普通: "長袖または薄手の重ね着。脱ぎ着しやすい服で",
    暑: "半袖＋通気性のよい素材。こまめに水分補給を",
  },
  未就学児: {
    極寒: "厚手のコート＋重ね着。帽子・手袋・マフラーも",
    寒: "長袖＋ジャケット。動くと暑くなるので脱ぎ着しやすく",
    普通: "長袖Tシャツ＋薄手のパーカー。天気次第で羽織りを",
    暑: "半袖＋通気性の良い帽子。汗拭きタオル必須",
  },
  小学生以降: {
    極寒: "厚手のコート＋重ね着。帽子・手袋も忘れずに",
    寒: "長袖＋上着。前開きで脱ぎ着しやすいものを",
    普通: "長袖またはTシャツ＋薄手の羽織り",
    暑: "半袖＋帽子。水筒を持たせて熱中症対策を",
  },
};

function getTotalMonths(birthYear: number, birthMonth: number): number {
  const now = new Date();
  return (now.getFullYear() - birthYear) * 12 + (now.getMonth() + 1 - birthMonth);
}

function getAgeStage(totalMonths: number): AgeStage {
  if (totalMonths < 12) return "乳児";
  const years = Math.floor(totalMonths / 12);
  if (years <= 2) return "幼児";
  if (years <= 6) return "未就学児";
  return "小学生以降";
}

function getTempBand(temp: number): TempBand {
  if (temp < 10) return "極寒";
  if (temp < 18) return "寒";
  if (temp < 25) return "普通";
  return "暑";
}

export function isInfant(child: ChildProfile): boolean {
  return getTotalMonths(child.birthYear, child.birthMonth) < 12;
}

export function getAgeDisplay(child: ChildProfile): string {
  const months = getTotalMonths(child.birthYear, child.birthMonth);
  if (months < 0) return "—";
  if (months < 12) return `${months}か月`;
  return `${Math.floor(months / 12)}歳`;
}

export function getClothingAdvice(child: ChildProfile, temp: number): string {
  const months = getTotalMonths(child.birthYear, child.birthMonth);
  if (months < 0) return "生年月を確認してください";
  return ADVICE[getAgeStage(months)][getTempBand(temp)];
}
