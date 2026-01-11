import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { stat } from "fs";

// Method GET by ID: ambil logbook by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const logbookToken = verifyToken(authHeader); // validasi token

    const logbookId = Number(params.id);

    // cek data logbook ada
    const existingId = await prisma.logbook.findUnique({ where: { id: logbookId } });
    if (!existingId) {
      return NextResponse.json({ message: "Data logbook tidak ditemukan" }, { status: 400 });
    }

    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
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

// Method PUT: Update logbook by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const logbookToken = verifyToken(authHeader); // validasi token

    const logbookId = Number(params.id);
    if (isNaN(logbookId)) {
      return NextResponse.json(
        { message: "ID logbook tidak valid" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const tanggal = formData.get("tanggal");
    const kegiatan = formData.get("kegiatan");
    const kendala = formData.get("kendala");
    const file = formData.get("file") as File | null;
    const status_verifikasi = formData.get("status_verifikasi");
    const removeFile = formData.get("removeFile") === "true";

    if (!tanggal || !kegiatan || !kendala) {
      return NextResponse.json(
        { message: "Update gagal", error: "Field wajib diisi" },
        { status: 400 }
      );
    }

    const existingLogbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
    });

    if (!existingLogbook) {
      return NextResponse.json(
        { message: "Data logbook tidak ditemukan" },
        { status: 404 }
      );
    }

    const fs = require("fs");
    const path = require("path");
    let filePath = existingLogbook.file;

    // 🔹 kalau upload file baru
    if (file) {
      if (filePath) {
        const oldPath = path.join(process.cwd(), "public", filePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = file.name;
      const uploadPath = path.join(process.cwd(), "public/uploads", filename);
      fs.writeFileSync(uploadPath, buffer);
      filePath = `/uploads/${filename}`;
    }

    // 🔹 kalau hapus file lama
    if (removeFile && filePath) {
      const oldPath = path.join(process.cwd(), "public", filePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      filePath = null;
    }

    const updatedLogbook = await prisma.logbook.update({
      where: { id: logbookId },
      data: {
        tanggal: new Date(tanggal.toString()),
        kegiatan: kegiatan.toString(),
        kendala: kendala.toString(),
        status_verifikasi,
        file: filePath,
      },
    });

    return NextResponse.json(
      { message: "Logbook berhasil diperbarui", status: "success", data: updatedLogbook },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update logbook error:", error);
    return NextResponse.json(
      { message: "Gagal update logbook", error: error.message },
      { status: 500 }
    );
  }
}



// Method DELETE: Hapus logbook by ID + hapus file upload
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const logbookToken = verifyToken(authHeader); // validasi token

    const fs = require("fs");
    const path = require("path");
    const logbookId = Number(params.id);

    // cek logbook ada atau tidak
    const existingLogbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
    });

    if (!existingLogbook) {
      return NextResponse.json(
        { message: "Data logbook tidak ditemukan" },
        { status: 404 }
      );
    }

    // kalau ada file, hapus file fisiknya
    if (existingLogbook.file) {
      const filePath = path.join(process.cwd(), "public", existingLogbook.file);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("File berhasil dihapus:", filePath);
        }
      } catch (err) {
        console.error("Gagal menghapus file:", err);
      }
    }

    // hapus logbook di database
    await prisma.logbook.delete({
      where: { id: logbookId },
    });

    return NextResponse.json(
      {
        message: "Logbook berhasil dihapus",
        status: "success",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menghapus data logbook", error: error.message },
      { status: 500 }
    );
  }
}