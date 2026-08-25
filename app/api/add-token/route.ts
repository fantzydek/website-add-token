import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addTokenEntry } from "@/lib/github";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string" || !token.includes(":")) {
      return NextResponse.json(
        { error: "Format token tidak valid (contoh: 123456:AAH...)" },
        { status: 400 }
      );
    }

    const entry = await addTokenEntry(token.trim(), session.username);

    return NextResponse.json({
      success: true,
      message: "Token berhasil ditambahkan!",
      entry,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
