import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    // Decode the URL
    let decodedUrl = decodeURIComponent(url);

    // Handle IPFS URLs with an alternative gateway
    if (decodedUrl.startsWith("https://gateway.ipfs.io")) {
      decodedUrl = decodedUrl.replace(
        "https://gateway.ipfs.io",
        "https://cloudflare-ipfs.com"
      );
    }

    console.log(`Fetching from Proxy: ${decodedUrl}`);

    // Fetch the data
    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch: ${decodedUrl} - Status: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch data. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ error: "Invalid JSON response" }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
