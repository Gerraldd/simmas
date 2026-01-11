import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua data dudi
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const dudiToken = verifyToken(authHeader); // validasi token

    const dudi = await prisma.dudi.findMany({
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json(
      {
        message: "Berhasil mengambil data dudi",
        status: "success",
        data: dudi
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data dudi", error: error.message }, { status: 500 });
  }
}