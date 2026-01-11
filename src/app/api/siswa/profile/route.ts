import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Definisikan interface untuk JWT payload
interface JwtPayload {
  id: number;
  name: string;
  role: string;
  email?: string;
}

// GET: Ambil profil siswa yang sedang login
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const decoded = verifyToken(authHeader) as JwtPayload;

        // Ambil data siswa berdasarkan user_id dari token
        const siswa = await prisma.siswa.findFirst({
            where: {
                user_id: decoded.id // atau decoded.userId tergantung struktur token
            },
            include: {
                users: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                // Jika ada relasi ke tabel penempatan/magang
                // penempatans: {
                //   where: { status: 'aktif' },
                //   include: {
                //     dudi: {
                //       select: {
                //         nama: true,
                //         alamat: true
                //       }
                //     }
                //   },
                //   orderBy: {
                //     created_at: 'desc'
                //   },
                //   take: 1
                // },
                // jurnals: {
                //   orderBy: {
                //     tanggal: 'desc'
                //   },
                //   take: 5
                // }
            }
        });

        if (!siswa) {
            return NextResponse.json(
                {
                    message: "Data siswa tidak ditemukan",
                    success: false,
                    data: null
                },
                { status: 404 }
            );
        }

        // Format data untuk dashboard
        const dashboardData = {
            nama: siswa.users?.name || siswa.nama,
            nis: siswa.nis,
            kelas: siswa.kelas,
            jurusan: siswa.jurusan,
            email: siswa.users?.email,
            // Jika ada data magang
            // tempat_magang: siswa.penempatans?.[0]?.dudi?.nama || null,
            // status_magang: siswa.penempatans?.[0]?.status || 'Belum Magang',
            // jurnal_terbaru: siswa.jurnals || []
        };

        return NextResponse.json(
            {
                message: "Berhasil mengambil profil siswa",
                success: true,
                data: dashboardData
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching siswa profile:", error);
        return NextResponse.json(
            {
                message: "Gagal mengambil profil siswa",
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}