import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Cari user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    if (!user.email_verified_at || user.email_verified_at === null) {
      return NextResponse.json(
        { error: "Email belum diverifikasi, silakan konfirmasi ke Admin Sistem" },
        { status: 403 }
      );
    }

    // Cek password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Password salah" }, { status: 401 });

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role, email: user.email },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1d" }
    );

    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json({ error: "Login gagal" }, { status: 500 });
  }
}
