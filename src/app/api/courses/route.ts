import { NextRequest, NextResponse } from "next/server";
import { courses } from "@/data/courses";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const level = searchParams.get("level");
  const format = searchParams.get("format");
  const search = searchParams.get("search");

  let filtered = [...courses];

  if (category) {
    filtered = filtered.filter((c) => c.category === category);
  }

  if (level) {
    filtered = filtered.filter((c) => c.level === level);
  }

  if (format) {
    filtered = filtered.filter((c) => c.format === format);
  }

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower) ||
        c.topics.some((t) => t.toLowerCase().includes(lower)) ||
        c.provider.toLowerCase().includes(lower)
    );
  }

  return NextResponse.json({ courses: filtered, total: filtered.length });
}
