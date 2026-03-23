import { getTrending } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getTrending("all", "week");
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
