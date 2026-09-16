import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

import { ensureTables } from "@/db";

export async function GET() {
  try {
    await ensureTables();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
