import { NextRequest, NextResponse } from "next/server";
import { getClassLocked, guruAuthorized, setClassLocked } from "@/lib/server-helpers";

export const dynamic = "force-dynamic";

// Teacher Focus Lock — status kunci layar klasikal
export async function GET() {
  const isLocked = await getClassLocked();
  return NextResponse.json({ ok: true, isLocked });
}

export async function POST(req: NextRequest) {
  if (!guruAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "PIN diperlukan" }, { status: 401 });
  }
  try {
    const b = await req.json();
    const isLocked = !!b.isLocked;
    await setClassLocked(isLocked);
    return NextResponse.json({ ok: true, isLocked });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
