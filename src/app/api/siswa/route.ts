import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua data siswa
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const siswaToken = verifyToken(authHeader); // validasi token

    const siswa = await prisma.siswa.findMany();

    return NextResponse.json(
      {
        message: "Berhasil mengambil data siswa",
        status: "success",
        data: siswa
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data siswa", error: error.message }, { status: 500 });
  }
}