import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET by ID: ambil magang by ID
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const magangToken = verifyToken(authHeader); // validasi token

        const magangId = Number(params.id);

        // cek data magang ada
        const existingId = await prisma.magang.findUnique({ where: { id: magangId } });
        if (!existingId) {
            return NextResponse.json({ message: "Data magang tidak ditemukan" }, { status: 400 });
        }

        const magang = await prisma.magang.findUnique({
            where: { id: magangId },
            include: {
                siswa: { select: { id: true, user_id: true, nama: true, nis: true, kelas: true, jurusan: true } },
                guru: { select: { id: true, user_id: true, nama: true, nip: true } },
                dudi: { select: { id: true, nama_perusahaan: true, alamat: true, penanggung_jawab: true } }
            }
        });
        
        return NextResponse.json(
            {
                message: "Berhasil mengambil data magang",
                status: "success",
                data: magang
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: "Gagal mengambil data magang", error: error.message }, { status: 500 });
    }
}

// Method PUT: Update magang by ID
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const magangToken = verifyToken(authHeader); // validasi token 

        const magangId = Number(params.id);

        // cek data magang ada
        const existingId = await prisma.magang.findUnique({ where: { id: magangId } });
        if (!existingId) {
            return NextResponse.json({ message: "Data magang tidak ditemukan" }, { status: 400 });
        }

        const body = await req.json();
        const { siswa_id, guru_id, dudi_id, tanggal_mulai, tanggal_selesai, status, nilai_akhir } = body;

        // Cek data lengkap
        if (!siswa_id || !guru_id || !dudi_id || !tanggal_mulai || !tanggal_selesai) {
            return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
        }

        // Cek status valid
        const validStatus = ["pending", "diterima", "ditolak", "berlangsung", "selesai", "dibatalkan"];
        if (!validStatus.includes(status)) {
            return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
        }

        if (nilai_akhir < 0 || nilai_akhir > 100 ) {
            return NextResponse.json({ message: "Nilai tidak valid" }, { status: 400 });
        }

        // Update magang utama
        const updatedMagang = await prisma.magang.update({
            where: { id: Number(magangId) },
            data: {
                siswa_id,
                guru_id,
                dudi_id,
                tanggal_mulai,
                tanggal_selesai,
                status,
                nilai_akhir
            },
        });

        return NextResponse.json(
            {
                message: "Berhasil memperbarui data magang",
                status: "success",
                data: updatedMagang
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: "Update data magang gagal", error: error.message }, { status: 500 });
    }
}

// Method DELETE by ID: Hapus magang by ID
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const magangToken = verifyToken(authHeader); // validasi token

        const magangId = Number(params.id);

        // cek data magang ada
        const existingId = await prisma.magang.findUnique({ where: { id: magangId } });
        if (!existingId) {
            return NextResponse.json({ message: "Data magang tidak ditemukan" }, { status: 400 });
        }

        // Hapus magang utama
        await prisma.magang.delete({
            where: { id: magangId },
        });

        return NextResponse.json({ message: "Berhasil menghapus magang" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Hapus magang gagal", error: error.message }, { status: 500 });
    }
}