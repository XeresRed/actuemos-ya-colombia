import { NextResponse } from 'next/server';
import { getDb } from '@/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const result = db.prepare('SELECT 1 AS healthy').get() as { healthy: number } | undefined;

    if (!result || result.healthy !== 1) {
      return NextResponse.json(
        {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          database: 'unresponsive',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database: 'connected',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
        message: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 503 }
    );
  }
}
