import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteTokenById } from "@/lib/github";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Hanya admin yang boleh hapus
  if (session.role !== "admin") {
    return NextResponse.json(
      { error: "Hanya admin yang dapat menghapus token" },
      { status: 403 }
    );
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID token wajib" }, { status: 400 });
    }

    await deleteTokenById(id);
    return NextResponse.json({
      success: true,
      message: "Token berhasil dihapus",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
