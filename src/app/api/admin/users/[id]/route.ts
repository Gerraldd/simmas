import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET by ID: ambil users by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const user = verifyToken(authHeader); // validasi token

    const userId = Number(params.id);

    // cek data user ada
    const existingId = await prisma.users.findUnique({ where: { id: userId } });
    if (!existingId) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const users = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        siswa: {
          select: {
            nis: true,
            kelas: true,
            jurusan: true,
            alamat: true,
            telepon: true,
          }
        },
        guru: {
          select: {
            nip: true,
            alamat: true,
            telepon: true,
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: "Berhasil mengambil data user",
        status: "success",
        data: users
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal mengambil data user", error: error.message },
      { status: 500 }
    );
  }
}

// Method PUT: Update users by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const user = verifyToken(authHeader); // validasi token
    
    const userId = Number(params.id);

    if (!userId) {
      return NextResponse.json({ message: "ID users tidak ada di URL" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      email,
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

    // Ambil user lama
    const oldUser = await prisma.users.findUnique({
      where: { id: userId },
      include: { siswa: true, guru: true }
    });

    if (!oldUser) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // Update tabel utama users
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name: name ? name : oldUser?.name,
        email: email ? email : oldUser?.email,
        role: role ? role : oldUser?.role,
        email_verified_at: email_verified_at ? new Date : null,
      },
    });

    // Jika role berubah, hapus record lama
    if (oldUser.role !== role) {
      if (oldUser.role === "siswa" && oldUser.siswa) {
        await prisma.siswa.delete({ where: { user_id: oldUser.id } });
      } else if (oldUser.role === "guru" && oldUser.guru) {
        await prisma.guru.delete({ where: { user_id: oldUser.id } });
      }
    }

    // Tambahkan / update role baru sesuai role
    if (role === "siswa") {
      await prisma.siswa.upsert({
        where: { user_id: updatedUser.id },
        update: { 
          nama: name, 
          nis: nis ?? oldUser.siswa?.nis ?? null,
          kelas: kelas ?? oldUser.siswa?.kelas ?? null,
          jurusan: jurusan ?? oldUser.siswa?.jurusan ?? null,
          alamat: alamat_siswa ?? oldUser.siswa?.alamat ?? null,
          telepon: telepon_siswa ?? oldUser.siswa?.telepon ?? null,
        },
        create: { 
          user_id: updatedUser.id, 
          nama: name, 
          nis: nis ?? null,
          kelas: kelas ?? null,
          jurusan: jurusan ?? null,
          alamat: alamat_siswa ?? null,
          telepon: telepon_siswa ?? null,
        },
      });
    } else if (role === "guru") {
      await prisma.guru.upsert({
        where: { user_id: updatedUser.id },
        update: { 
          nama: name, 
          nip: nip ?? oldUser.guru?.nip ?? null,
          alamat: alamat_guru ?? oldUser.guru?.alamat ?? null,
          telepon: telepon_guru ?? oldUser.guru?.telepon ?? null,
        },
        create: { user_id: updatedUser.id, nama: name, nip: nip ?? null },
      });
    }

    return NextResponse.json(
      {
        message: "Berhasil memperbarui data users",
        status: "success",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Update users gagal", error: error.message },
      { status: 500 }
    );
  }
}

// Method DELETE by ID: Hapus users by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const user = verifyToken(authHeader); // validasi token
    
    const userId = Number(params.id);

    if (!userId) {
      return NextResponse.json({ message: "ID user tidak valid" }, { status: 400 });
    }

    // Hapus record di tabel terkait
    await prisma.siswa.deleteMany({ where: { user_id: userId } });
    await prisma.guru.deleteMany({ where: { user_id: userId } });

    // Hapus user utama
    await prisma.users.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Berhasil menghapus user" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Hapus user gagal", error: error.message }, { status: 500 });
  }
}