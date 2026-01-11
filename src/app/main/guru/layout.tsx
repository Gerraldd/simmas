import SidebarWrapper from "@/components/SidebarWrapper";
import HeaderWrapper from "@/components/HeaderWrapper";
import { SchoolSettingsProvider } from "@/context/SchoolSettingsContext";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) redirect("/auth/login");

    let user: { name: string; role: "admin" | "guru" | "siswa"; email: string };

    try {
        const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
        const role = decoded.role as "admin" | "guru" | "siswa";

        if (role !== "guru") {
            if (role === "siswa") redirect("/main/siswa");
            if (role === "admin") redirect("/main/admin");
        }

        user = { name: decoded.name, role, email: decoded.email };
    } catch {
        redirect("/auth/login");
    }

    return (
        <SchoolSettingsProvider>
            <div className="flex h-screen overflow-hidden"> {/* ⬅️ tambahkan overflow-hidden di sini */}
                <SidebarWrapper role={user.role} />
                <div className="flex flex-1 flex-col min-w-0 w-full overflow-hidden"> {/* ⬅️ pastikan ini juga overflow-hidden */}
                    <HeaderWrapper user={user} />
                    <main className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto overflow-x-auto no-scrollbar"> {/* ⬅️ tambahkan overflow-x-hidden */}
                        {children}
                    </main>
                </div>
            </div>
        </SchoolSettingsProvider>
    );
}