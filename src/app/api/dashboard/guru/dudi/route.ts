import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua dudi
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const dudiToken = verifyToken(authHeader); // validasi token

    const { searchParams } = new URL(req.url);

    const guruId = searchParams.get("guru_id");
    const siswaId = searchParams.get("siswa_id");

    const where: any = {};
    if (guruId) where.guru_id = Number(guruId);
    if (siswaId) where.siswa_id = Number(siswaId);

    // ambil jumlah data dudi aktif dan nonaktif
    const aktif = await prisma.dudi.count({ where: { status: "aktif" } });
    const nonaktif = await prisma.dudi.count({ where: { status: "nonaktif" } });

    const [dudi, total] = await Promise.all([
      prisma.dudi.findMany({
        where,
        orderBy: { created_at: "asc" },
        include: {
          guru: {
            select: {
              id: true, nama: true, nip: true,
            }
          }
        },
      }),
      prisma.dudi.count(),
    ]);

    return NextResponse.json(
      {
        message: "Berhasil mengambil data dudi",
        status: "success",
        data: dudi,
        aktif,
        nonaktif,
        total,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data dudi", error: error.message }, { status: 500 });
  }
}