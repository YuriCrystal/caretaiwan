import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ loggedIn: false });
  }
  const lineUserId = (session.user as { lineUserId?: string }).lineUserId;
  return NextResponse.json({
    loggedIn: true,
    name: session.user.name ?? null,
    picture: session.user.image ?? null,
    lineUserId: lineUserId ?? null,
  });
}
