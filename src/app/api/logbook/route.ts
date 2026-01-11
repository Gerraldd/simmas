import { prisma } from "@/lib/db";
import { LogbookStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua data logbook
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const logbookToken = verifyToken(authHeader); // validasi token

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

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
        skip,
        take: limit,
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
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data logbook", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const logbookToken = verifyToken(authHeader); // validasi token

    const formData = await req.formData();

    const magangId = formData.get("magang_id");
    const tanggal = formData.get("tanggal");
    const kegiatan = formData.get("kegiatan");
    const kendala = formData.get("kendala");
    const status = formData.get("status_verifikasi");
    const file = formData.get("file") as File | null;

    if (!magangId || !tanggal || !kegiatan || !kendala) {
      return NextResponse.json(
        { message: "Tambah logbook gagal", error: "Field wajib diisi" },
        { status: 400 }
      );
    }

    // cek angka valid
    const magangIdNum = Number(magangId);
    if (isNaN(magangIdNum)) {
      return NextResponse.json(
        { message: "Tambah logbook gagal", error: "magang_id harus angka" },
        { status: 400 }
      );
    }

    // simpan file opsional
    let filePath: string | null = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = file.name;

      const fs = require("fs");
      const path = require("path");
      const uploadPath = path.join(process.cwd(), "public/uploads", filename);
      fs.writeFileSync(uploadPath, buffer);

      filePath = `/uploads/${filename}`;
    }

    // simpan ke DB
    const newLogbook = await prisma.logbook.create({
      data: {
        magang_id: magangIdNum,
        tanggal: new Date(tanggal.toString()), // pastikan dari ISO string
        kegiatan: kegiatan.toString(),
        kendala: kendala.toString(),
        status_verifikasi: (status as LogbookStatus) || LogbookStatus.pending,
        file: filePath,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Logbook berhasil ditambahkan",
        data: newLogbook,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { message: "Tambah logbook gagal", error: err.message },
      { status: 500 }
    );
  }
}