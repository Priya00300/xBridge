import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { searchParams } = new URL(request.url);
  
  // Construct the target URL with all query parameters
  const queryString = Array.from(searchParams.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  const targetUrl = `https://li.fi/v1/${params.path.join('/')}${
    queryString ? '?' + queryString : ''
  }`;
  
  try {
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Forward the request to Li.Fi API
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 10 }, // Cache for 10 seconds
    });
    
    if (!response.ok) {
      console.error(`Error from Li.Fi API: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Error from Li.Fi API: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return the response with appropriate headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Li.Fi API' }, {
      status: 500,
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
