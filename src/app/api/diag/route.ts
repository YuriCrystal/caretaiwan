import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Diagnostic endpoint: returns which env vars are loaded (boolean only, no values).
export async function GET() {
  const check = (v: string | undefined) => ({
    set: typeof v === "string" && v.length > 0,
    length: v ? v.length : 0,
  });

  return NextResponse.json({
    LINE_CHANNEL_ID: check(process.env.LINE_CHANNEL_ID),
    LINE_CHANNEL_SECRET: check(process.env.LINE_CHANNEL_SECRET),
    AUTH_SECRET: check(process.env.AUTH_SECRET),
    NEXT_PUBLIC_SUPABASE_URL: check(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: check(process.env.SUPABASE_SERVICE_ROLE_KEY),
    // Vercel-injected
    NEXTAUTH_URL: check(process.env.NEXTAUTH_URL),
    AUTH_URL: check(process.env.AUTH_URL),
    VERCEL_URL: check(process.env.VERCEL_URL),
    NODE_ENV: process.env.NODE_ENV,
  });
}
