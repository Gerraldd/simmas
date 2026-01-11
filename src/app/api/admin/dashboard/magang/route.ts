import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua data magang
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const magangToken = verifyToken(authHeader); // validasi token

    const magang = await prisma.magang.findMany({
        orderBy: { created_at: "asc" },
        include: {
          siswa: { select: { id: true, user_id: true, nama: true, nis: true, kelas: true, jurusan: true } },
          guru: { select: { id: true, user_id: true, nama: true, nip: true } },
          dudi: { select: { id: true, nama_perusahaan: true, alamat: true, penanggung_jawab: true } }
        }
    });

    return NextResponse.json(
      {
        message: "Berhasil mengambil data magang",
        status: "success",
        data: magang
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data magang", error: error.message }, { status: 500 });
  }
}