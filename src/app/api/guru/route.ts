import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua data guru
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const guruIdToken = verifyToken(authHeader); // validasi token

    const guru = await prisma.guru.findMany();

    return NextResponse.json(
      {
        message: "Berhasil mengambil data guru",
        status: "success",
        data: guru
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data guru", error: error.message }, { status: 500 });
  }
}