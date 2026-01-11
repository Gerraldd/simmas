import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET data settings
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const settingsToken = verifyToken(authHeader); // validasi token

    const settings = await prisma.school_settings.findFirst(); // ambil record pertama

    if (!settings) {
      return NextResponse.json({ message: "Data settings tidak ada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Berhasil menampilkan settings", settings }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: "Gagal ambil settings", error: err.message }, { status: 500 });
  }
}

// Method PUT: update kalau ada, create kalau belum ada
export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const settingsToken = verifyToken(authHeader); // validasi token

    const body = await req.json();

    const updated = await prisma.school_settings.upsert({
      where: { id: 1 }, // asumsinya cuma ada 1 row utama dengan id 1
      update: {
        logo_url: body.logo_url,
        nama_sekolah: body.nama_sekolah,
        alamat: body.alamat,
        telepon: body.telepon,
        email: body.email,
        website: body.website,
        kepala_sekolah: body.kepala_sekolah,
        npsn: body.npsn,
        updated_at: new Date(),
      },
      create: {
        logo_url: body.logo_url,
        nama_sekolah: body.nama_sekolah,
        alamat: body.alamat,
        telepon: body.telepon,
        email: body.email,
        website: body.website,
        kepala_sekolah: body.kepala_sekolah,
        npsn: body.npsn,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ message: "Berhasil simpan settings", settings: updated }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: "Gagal simpan settings", error: err.message }, { status: 500 });
  }
}
