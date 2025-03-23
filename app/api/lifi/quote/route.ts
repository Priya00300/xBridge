import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromChain = searchParams.get("fromChain");
  const toChain = searchParams.get("toChain");
  const fromToken = searchParams.get("fromToken");
  const toToken = searchParams.get("toToken");
  const fromAmount = searchParams.get("fromAmount");
  const fromAddress = searchParams.get("fromAddress");

  if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || !fromAddress) {
    return NextResponse.json({ error: "Missing required query parameters" }, { status: 400 });
  }

  const queryParams = new URLSearchParams({
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAmount,
    fromAddress,
  });

  try {
    const response = await fetch(`https://li.quest/v1/quote?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch quote: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("LiFi Quote Response:", JSON.stringify(data, null, 2)); // Debug
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json({ error: "Failed to fetch quote from Li.Fi" }, { status: 500 });
  }
}
