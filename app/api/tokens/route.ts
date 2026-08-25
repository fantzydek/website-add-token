import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTokensFile } from "@/lib/github";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await getTokensFile();

    if (session.role === "admin") {
      return NextResponse.json({ tokens: data.tokens });
    }

    // User hanya lihat token miliknya sendiri
    const own = data.tokens.filter(
      (t) => t.owner.toLowerCase() === session.username.toLowerCase()
    );
    return NextResponse.json({ tokens: own });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
