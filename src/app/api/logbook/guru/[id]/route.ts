import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Method PUT: Update logbook by ID oleh guru
export async function PUT(
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

        const body = await req.json();
        const { status_verifikasi, catatan_guru } = body;

        // Update logbook utama
        await prisma.logbook.update({
            where: { id: Number(logbookId) },
            data: {
                status_verifikasi,
                catatan_guru
            },
        });

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
                        }
                    }
                }
            }
        });

        return NextResponse.json(
            {
                message: "Berhasil memperbarui data logbook",
                status: "success",
                data: logbook
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: "Update data logbook gagal", error: error.message }, { status: 500 });
    }
}