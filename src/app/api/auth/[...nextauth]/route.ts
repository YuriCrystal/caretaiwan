import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const { GET: authGet, POST: authPost } = handlers;

async function wrap(handler: (req: NextRequest) => Promise<Response>, req: NextRequest) {
  try {
    return await handler(req);
  } catch (err) {
    // Capture and surface the underlying error so we can debug
    const e = err as Error & { type?: string; code?: string; cause?: unknown };
    const params = new URLSearchParams({
      error: e.type ?? e.name ?? "Unknown",
      message: e.message ?? "",
      cause: typeof e.cause === "object" ? JSON.stringify(e.cause) : String(e.cause ?? ""),
    });
    console.error("[Auth handler caught]", e);
    const url = new URL(`/auth-error?${params}`, req.url);
    return NextResponse.redirect(url);
  }
}

export const GET = (req: NextRequest) => wrap(authGet, req);
export const POST = (req: NextRequest) => wrap(authPost, req);
