import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil data logbook siswa yang dibimbing
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const logbookToken = verifyToken(authHeader); // validasi token

    const { searchParams } = new URL(req.url);

    const guruId = searchParams.get("guru_id");
    const siswaId = searchParams.get("siswa_id");

    const where = {
      magang: {
        ...(guruId ? { guru_id: Number(guruId) } : {}),
        ...(siswaId ? { siswa_id: Number(siswaId) } : {}),
      }
    };

    const [logbook, total] = await Promise.all([
      prisma.logbook.findMany({
        where,
        orderBy: { tanggal: "desc" },
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
      }),
      prisma.logbook.count({ where }),
    ]);

    return NextResponse.json({
      message: "Berhasil mengambil data logbook",
      status: "success",
      data: logbook,
      total,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data logbook", error: error.message }, { status: 500 });
  }
}