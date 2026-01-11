import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, } = body;
        const role = "siswa"; // default role siswa

        // Cek email sudah terdaftar
        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
        }

        // Cek data lengkap
        if (!name || !email || !password) {
            return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
        }

        // // Cek role valid
        // const validRoles = ["admin", "guru", "siswa", "dudi"];
        // if (!validRoles.includes(role)) {
        //     return NextResponse.json({ message: "Role tidak valid" }, { status: 400 });
        // }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan user
        const newUser = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role, // default role siswa
            },
        });

        // Jika role siswa, guru, atau dudi, buat entri di tabel terkait
        if (role === "siswa") {
            await prisma.siswa.create({
                data: { 
                    user_id: newUser.id, 
                    nama: name,
                    nis: null
                }
            })
        } else if (role === "guru") {
            await prisma.guru.create({
                data: { 
                    user_id: newUser.id,
                    nama: name,
                    nip: null
                }
            })
        } else if (role === "dudi") {
            await prisma.dudi.create({
                data: { 
                    user_id: newUser.id,
                    nama_perusahaan: null
                }
            })
        }

        return NextResponse.json(newUser);
    } catch (error: any) {
        return NextResponse.json({ message: "Gagal Register", error: error.message }, { status: 500 });
    }
}