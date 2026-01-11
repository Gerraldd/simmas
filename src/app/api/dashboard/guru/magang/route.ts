import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil data siswa magang yang dibimbing
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const magangToken = verifyToken(authHeader); // validasi token

    const { searchParams } = new URL(req.url);
    const guruId = searchParams.get("guru_id");
    const siswaId = searchParams.get("siswa_id");

    const where: any = {};
    if (guruId) where.guru_id = Number(guruId);
    if (siswaId) where.siswa_id = Number(siswaId);

    const [magang, total] = await Promise.all([
        prisma.magang.findMany({
            where,
            orderBy: { created_at: "asc" },
            include: {
            siswa: { select: { id: true, user_id: true, nama: true, nis: true, kelas: true, jurusan: true } },
            guru: { select: { id: true, user_id: true, nama: true, nip: true } },
            dudi: { select: { id: true, nama_perusahaan: true, alamat: true, telepon: true, penanggung_jawab: true } }
            }
        }),
        prisma.magang.count({ where }),
    ]);

    return NextResponse.json(
      {
        message: "Berhasil mengambil data magang",
        status: "success",
        data: magang,
        total
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data magang", error: error.message }, { status: 500 });
  }
}