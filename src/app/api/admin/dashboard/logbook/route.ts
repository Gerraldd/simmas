import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua data logbook
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const logbookToken = verifyToken(authHeader); // validasi token

    const logbook = await prisma.logbook.findMany({
      orderBy: { created_at: "asc" },
      include: {
        magang: {
          include: {
            siswa: {
              select: {
                id: true,
                nama: true,
                nis: true,
                kelas: true,
                jurusan: true,
              }
            },
            dudi: {
              select: {
                id: true,
                nama_perusahaan: true,
                alamat: true,
                penanggung_jawab: true
              }
            },
            guru: {
              select: {
                id: true,
                nama: true,
                nip: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: "Berhasil mengambil data logbook",
        status: "success",
        data: logbook
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data logbook", error: error.message }, { status: 500 });
  }
}