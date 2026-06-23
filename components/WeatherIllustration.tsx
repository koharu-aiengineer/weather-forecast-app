"use client";

import Image from "next/image";
import { useState } from "react";

export default function WeatherIllustration() {
  const [error, setError] = useState(false);

  return (
    <div
      className="relative overflow-hidden flex-shrink-0"
      style={{
        width: "clamp(200px, 45vw, 280px)",
        height: "clamp(228px, 51vw, 320px)",
        borderRadius: "50% 50% 0 0 / 40% 40% 0 0",
      }}
    >
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-[#4a5a38] text-6xl">
          ☀️
        </div>
      ) : (
        <Image
          src="/illustrations/weather-main.png"
          alt="天気イラスト"
          fill
          style={{ objectFit: "cover", objectPosition: "center", transform: "scale(1.08)" }}
          onError={() => setError(true)}
          priority
        />
      )}
    </div>
  );
}
