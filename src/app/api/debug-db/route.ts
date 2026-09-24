import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const connectionString = process.env.DATABASE_URL ?? "";
  let parsedHost = "unparseable";
  try {
    parsedHost = new URL(connectionString).hostname;
  } catch {
    // ignore
  }

  try {
    const pool = new Pool({ connectionString, connectionTimeoutMillis: 8000 });
    const result = await pool.query("SELECT 1 as ok");
    await pool.end();
    return NextResponse.json({ ok: true, parsedHost, rows: result.rows });
  } catch (err) {
    const e = err as { message?: string; code?: string; name?: string };
    return NextResponse.json(
      { ok: false, parsedHost, message: e.message, code: e.code, name: e.name },
      { status: 500 },
    );
  }
}
