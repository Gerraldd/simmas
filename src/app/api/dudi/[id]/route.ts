import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method GET by ID: ambil dudi by ID
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const dudiToken = verifyToken(authHeader); // validasi token

        const dudiId = Number(params.id);

        // cek data dudi ada
        const existingId = await prisma.dudi.findUnique({ where: { id: dudiId } });
        if (!existingId) {
            return NextResponse.json({ message: "DUDI tidak ditemukan" }, { status: 400 });
        }

        const dudi = await prisma.dudi.findUnique({ where: { id: dudiId } });
        return NextResponse.json(
            {
                message: "Berhasil mengambil data dudi",
                status: "success",
                data: dudi
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: "Gagal mengambil data dudi", error: error.message }, { status: 500 });
    }
}

// Method PUT: Update dudi by ID
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const dudiToken = verifyToken(authHeader); // validasi token

        const dudiId = Number(params.id);

        if (!dudiId) {
            return NextResponse.json({ message: "ID dudi tidak ada di URL" }, { status: 400 });
        }

        const body = await req.json();
        const { nama_perusahaan, tentang_perusahaan, bidang_usaha, alamat, telepon, email, penanggung_jawab, kouta_magang, status } = body;

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

        // Update dudi utama
        const updatedDUDI = await prisma.dudi.update({
            where: { id: Number(dudiId) },
            data: {
                nama_perusahaan,
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

        return NextResponse.json(
            {
                message: "Berhasil memperbarui data dudi",
                status: "success",
                data: updatedDUDI
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: "Update dudi gagal", error: error.message }, { status: 500 });
    }
}

// Method DELETE by ID: Hapus dudi by ID
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const dudiToken = verifyToken(authHeader); // validasi token

        const dudiId = Number(params.id);

        if (!dudiId) {
            return NextResponse.json({ message: "ID dudi tidak valid" }, { status: 400 });
        }

        const dudi = await prisma.dudi.findUnique({ where: { id: dudiId }, select: { id: true, kouta_magang: true }, });

        if (!dudi) {
            return NextResponse.json(
                { message: "DUDI tidak ditemukan" },
                { status: 404 }
            );
        }

        const kouta = dudi.kouta_magang ?? 0;

        if (kouta > 0) {
            return NextResponse.json(
                {
                    message: `DUDI masih memiliki kouta magang (${dudi.kouta_magang}), tidak bisa dihapus`,
                },
                { status: 400 }
            );
        }

        // Hapus dudi utama
        await prisma.dudi.delete({
            where: { id: dudiId },
        });

        return NextResponse.json({ message: "Berhasil menghapus dudi" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Hapus dudi gagal", error: error.message }, { status: 500 });
    }
}