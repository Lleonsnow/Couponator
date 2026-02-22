import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session)
    return NextResponse.json({ role: null, email: null });
  return NextResponse.json({
    id: session.sub,
    email: session.email,
    role: session.role,
    merchantId: session.merchantId,
  });
}
