import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua dudi
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const dudiToken = verifyToken(authHeader); // validasi token

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const skip = (page - 1) * limit;

    // ambil jumlah data dudi aktif dan nonaktif
    const aktif = await prisma.dudi.count({ where: { status: "aktif" } });
    const nonaktif = await prisma.dudi.count({ where: { status: "nonaktif" } });

    const [dudi, total] = await Promise.all([
      prisma.dudi.findMany({
        skip,
        take: limit,
        orderBy: { created_at: "asc" },
        include: {
          guru: {
            select: {
              id: true, nama:true, nip: true,
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
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data dudi", error: error.message }, { status: 500 });
  }
}

// Method POST: Tambah dudi baru
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const dudiToken = verifyToken(authHeader); // validasi token

    const body = await req.json();
    const { nama_perusahaan, guru_id, tentang_perusahaan, bidang_usaha, alamat, telepon, email, penanggung_jawab, kouta_magang, status } = body;

    // Cek email sudah terdaftar
    const existingEmail = await prisma.dudi.findFirst({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    // Cek kouta magang tidak boleh kurang dari nol
    if (kouta_magang < 0) {
      return NextResponse.json({ message: "Kouta magang tidak boleh kurang dari nol" }, { status: 400 });
    }

    // Cek data lengkap
    if (!nama_perusahaan || !alamat || !telepon || !email || !penanggung_jawab) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Cek status dudi valid
    const validStatus = ["pending", "aktif", "nonaktif"];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    // Simpan dudi
    const newDUDI = await prisma.dudi.create({
      data: {
        nama_perusahaan,
        guru_id,
        tentang_perusahaan,
        bidang_usaha,
        alamat,
        telepon,
        email,
        penanggung_jawab,
        kouta_magang: Number(kouta_magang),
        status
      },
    });

    return NextResponse.json({ message: "Tambah dudi berhasil", data: newDUDI }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Tambah dudi gagal", error: error.message }, { status: 500 });
  }
}