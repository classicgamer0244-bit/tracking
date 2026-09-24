import { NextResponse } from "next/server";
import { Pool } from "pg";

function mask(value: string) {
  if (value.length <= 16) return "*".repeat(value.length);
  return `${value.slice(0, 8)}...(${value.length} chars total)...${value.slice(-8)}`;
}

export async function GET() {
  const connectionString = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";
  let parsedHost = "unparseable";
  try {
    parsedHost = new URL(connectionString).hostname;
  } catch {
    // ignore
  }

  const diag = {
    databaseUrlMasked: mask(connectionString),
    directUrlMasked: mask(directUrl),
    databaseUrlLength: connectionString.length,
  };

  try {
    const pool = new Pool({ connectionString, connectionTimeoutMillis: 8000 });
    const result = await pool.query("SELECT 1 as ok");
    await pool.end();
    return NextResponse.json({ ok: true, parsedHost, diag, rows: result.rows });
  } catch (err) {
    const e = err as { message?: string; code?: string; name?: string };
    return NextResponse.json(
      { ok: false, parsedHost, diag, message: e.message, code: e.code, name: e.name },
      { status: 500 },
    );
  }
}
