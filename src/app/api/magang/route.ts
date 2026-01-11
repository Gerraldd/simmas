import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua magang
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const magangToken = verifyToken(authHeader); // validasi token

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const skip = (page - 1) * limit;

    const guruId = searchParams.get("guru_id");
    const siswaId = searchParams.get("siswa_id");

    const where: any = {};
    if (guruId) where.guru_id = Number(guruId);
    if (siswaId) where.siswa_id = Number(siswaId);

    const [magang, total] = await Promise.all([
      prisma.magang.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "asc" },
        include: {
          siswa: { select: { id: true, user_id: true, nama: true, nis: true, kelas: true, jurusan: true } },
          guru: { select: { id: true, user_id: true, nama: true, nip: true } },
          dudi: { select: { id: true, nama_perusahaan: true, alamat: true, penanggung_jawab: true } }
        }
      }),
      prisma.magang.count({ where }),
    ]);

    return NextResponse.json(
      {
        message: "Berhasil mengambil data magang",
        status: "success",
        data: magang,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data magang", error: error.message }, { status: 500 });
  }
}

// Method POST: Tambah magang baru
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const magangToken = verifyToken(authHeader); // validasi token

    const body = await req.json();
    const { siswa_id, guru_id, dudi_id, tanggal_mulai, tanggal_selesai, status } = body;

    // Cek data lengkap
    if (!siswa_id || !guru_id || !dudi_id) {
      return NextResponse.json({ message: `Data tidak lengkap, siswa_id: ${siswa_id}, guru_id: ${guru_id}, dudi_id: ${dudi_id}` }, { status: 400 });
    }

    // Cek status valid
    const validStatus = ["pending", "diterima", "ditolak", "berlangsung", "selesai", "dibatalkan"];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    // Simpan data magang
    const newMagang = await prisma.magang.create({
      data: {
        siswa_id,
        guru_id,
        dudi_id,
        tanggal_mulai,
        tanggal_selesai,
        status
      },
    });

    return NextResponse.json({ message: "Tambah magang berhasil", data: newMagang }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Tambah magang gagal", error: error.message }, { status: 500 });
  }
}