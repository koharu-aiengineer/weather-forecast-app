import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentWeather, fetchForecast } from "@/lib/openweather";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    return NextResponse.json({ error: "lat and lon must be numbers" }, { status: 400 });
  }

  try {
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(latNum, lonNum),
      fetchForecast(latNum, lonNum),
    ]);
    return NextResponse.json({ current, forecast });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
