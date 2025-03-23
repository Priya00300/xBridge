import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://li.quest/v1/tokens");
    if (!response.ok) {
      throw new Error(`Failed to fetch tokens: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json({ error: "Failed to fetch tokens from Li.Fi" }, { status: 500 });
  }
}
