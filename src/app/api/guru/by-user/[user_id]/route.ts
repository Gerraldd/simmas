import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { user_id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const guruIdToken = verifyToken(authHeader); // validasi token

        const userId = Number(params.user_id);

        const guru = await prisma.guru.findUnique({
            where: { user_id: userId },
            select: { id: true, nama: true, user_id: true },
        });

        if (!guru) {
            return NextResponse.json({ message: "Guru tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json({ data: guru });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Gagal mengambil guru", error: error.message },
            { status: 500 }
        );
    }
}