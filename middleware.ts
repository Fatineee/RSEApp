// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed store
const ipRequests = new Map<string, { count: number; timestamp: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds  
const RATE_LIMIT_MAX = 3; // Maximum 3 requests per minute

export function middleware(request: NextRequest) {
  // Extract the client's IP address
  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    'anonymous';

  // Only apply rate limiting to the scraper endpoint
  if (request.nextUrl.pathname.startsWith('/api/scrape-news')) {
    const now = Date.now();
    const record = ipRequests.get(ip);

    // Clean up old records every 5 minutes
    if (now % (5 * 60 * 1000) < 1000) {
      for (const [key, value] of ipRequests.entries()) {
        if (now - value.timestamp > RATE_LIMIT_WINDOW) {
          ipRequests.delete(key);
        }
      }
    }

    // If this IP has made requests before
    if (record) {
      // If within the current time window
      if (now - record.timestamp < RATE_LIMIT_WINDOW) {
        // Increment the count
        record.count++;
        ipRequests.set(ip, record);

        // If over the limit, return 429 (Too Many Requests)
        if (record.count > RATE_LIMIT_MAX) {
          return NextResponse.json(
            {
              success: false,
              error: 'Rate limit exceeded. Please try again later.',
            },
            { status: 429 }
          );
        }
      } else {
        // Outside the window, reset the count
        ipRequests.set(ip, { count: 1, timestamp: now });
      }
    } else {
      // First request from this IP
      ipRequests.set(ip, { count: 1, timestamp: now });
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run only for specific paths
export const config = {
  matcher: '/api/scrape-news',
};
