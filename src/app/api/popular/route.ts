import { getPopular } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  if (type !== "movie" && type !== "tv") {
    return NextResponse.json({ error: "type must be movie or tv" }, { status: 400 });
  }
  try {
    const data = await getPopular(type);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
