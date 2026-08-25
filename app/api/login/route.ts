import { NextRequest, NextResponse } from "next/server";
import {
  isAdminCredentials,
  createSession,
  verifyPassword,
} from "@/lib/auth";
import { findUser } from "@/lib/github";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Check admin first
    if (isAdminCredentials(username, password)) {
      await createSession({ username, role: "admin" });
      return NextResponse.json({
        success: true,
        role: "admin",
        username,
      });
    }

    // Check regular user
    const user = await findUser(username);
    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    await createSession({ username: user.username, role: "user" });
    return NextResponse.json({
      success: true,
      role: "user",
      username: user.username,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
