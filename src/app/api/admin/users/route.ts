import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth";

// Method GET: Ambil semua users
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const user = verifyToken(authHeader); // validasi token

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.users.count(),
    ]);

    return NextResponse.json(
      {
        message: "Berhasil mengambil data users",
        status: "success",
        data: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data users", error: error.message }, { status: 500 });
  }
}

// Method POST: Tambah users baru
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const user = verifyToken(authHeader); // validasi token

    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      email_verified_at,
      // Data siswa
      nis,
      kelas,
      jurusan,
      alamat_siswa,
      telepon_siswa,
      // Data guru
      nip,
      alamat_guru,
      telepon_guru
    } = body;

    // Cek email sudah terdaftar
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    // Cek data lengkap
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Cek role valid
    const validRoles = ["admin", "guru", "siswa"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ message: "Role tidak valid" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan users
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        email_verified_at: email_verified_at ? new Date() : null
      },
    });

    // Simpan data tambahan berdasarkan role
    if (role === "siswa") {
      await prisma.siswa.create({
        data: {
          user_id: newUser.id,
          nama: name,
          nis: nis || null,
          kelas: kelas || null,
          jurusan: jurusan || null,
          alamat: alamat_siswa || null,
          telepon: telepon_siswa || null
        }
      });
    } else if (role === "guru") {
      await prisma.guru.create({
        data: {
          user_id: newUser.id,
          nama: name,
          nip: nip || null,
          alamat: alamat_guru || null,
          telepon: telepon_guru || null
        }
      });
    }

    return NextResponse.json({ message: "Tambah users berhasil", data: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Tambah users gagal", error: error.message }, { status: 500 });
  }
}
