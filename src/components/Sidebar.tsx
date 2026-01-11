"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    BookOpen,
    GraduationCap,
    Menu,
    X,
} from "lucide-react";
import { useSchoolSettings } from "@/context/SchoolSettingsContext";
import { useState } from "react";

interface SidebarProps {
    role: "admin" | "siswa" | "guru";
    onClose?: () => void;
}

export default function Sidebar({ role, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { settings } = useSchoolSettings();
  // Sidebar is controlled by SidebarWrapper for mobile; no local toggle here

    const menus = {
        admin: [
            { href: "/main/admin", label: "Dashboard", icon: LayoutDashboard, description: "Ringkasan sistem" },
            { href: "/main/admin/dudi", label: "DUDI", icon: Building2, description: "Manajemen DUDI" },
            { href: "/main/admin/users", label: "Pengguna", icon: Users, description: "Manajemen user" },
            { href: "/main/admin/settings", label: "Pengaturan", icon: Settings, description: "Konfigurasi sistem" },
        ],
        guru: [
            { href: "/main/guru", label: "Dashboard", icon: LayoutDashboard, description: "Ringkasan aktivitas" },
            { href: "/main/guru/dudi", label: "DUDI", icon: Building2, description: "Dunia Usaha & Industri" },
            { href: "/main/guru/magang", label: "Magang", icon: GraduationCap, description: "Data siswa magang" },
            { href: "/main/guru/logbook", label: "Jurnal Harian", icon: BookOpen, description: "Catatan harian" },
        ],
        siswa: [
            { href: "/main/siswa", label: "Dashboard", icon: LayoutDashboard, description: "Ringkasan aktivitas" },
            { href: "/main/siswa/dudi", label: "DUDI", icon: Building2, description: "Dunia Usaha & Industri" },
            { href: "/main/siswa/logbook", label: "Jurnal Harian", icon: BookOpen, description: "Catatan harian" },
            { href: "/main/siswa/magang", label: "Magang", icon: GraduationCap, description: "Data magang saya" },
        ],
    };

    return (
        <aside className={"h-screen w-70 bg-white border-r shadow-sm flex flex-col"}>
                {/* Logo Section */}
                <div className="py-3 sm:py-[13px] px-2 border-b flex items-center justify-between">
                    <div className="ml-3 w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 flex items-center justify-center shadow-md">
                        <span className="text-white text-lg font-bold">
                            <GraduationCap size={20} />
                        </span>
                    </div>
                    <div className="flex items-center justify-between flex-1">
                        <div className="flex flex-col leading-tight ml-2">
                            <p className="text-[17px] font-semibold text-black">SIMMAS</p>
                            <p className="text-[13px] text-gray-500 capitalize">Panel {role}</p>
                        </div>
                        {/* Close button hanya di mobile */}
                        <button
                            onClick={onClose}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-2"
                            aria-label="Tutup Sidebar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <nav className="flex-1 min-h-0 overflow-y-auto p-4 mt-2 space-y-3">
                    {menus[role].map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all 
              ${active
                                        ? "bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-[0_1px_5px_rgba(6,182,212,0.6)]"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {/* Kotak Icon */}
                                <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm
                ${active ? "bg-white/20 text-white" : "bg-gray-100"}
              `}
                                >
                                    <Icon size={15} />
                                </div>

                                {/* Label + Deskripsi */}
                                <div className="flex flex-col text-left">
                                    <span className="text-[14px] leading-tight">{item.label}</span>
                                    <span
                                        className={`text-[12px] ${active ? "text-white/80" : "text-gray-500"
                                            }`}
                                    >
                                        {item.description}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>


                {/* Footer Info */}
                <div className="p-4 border-t text-xs text-gray-500">
                    <div className="bg-gray-100 py-2 px-3 rounded-xl flex items-center gap-3">
                        {/* Bulatan hijau */}
                        <div className="w-8 h-8 rounded-lg bg-[#eaffb4] flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-green-400 shadow-sm"></span>
                        </div>

                        {/* Teks */}
                        <div>
                            <p className="text-black font-semibold text-[13px]">{settings.nama_sekolah || "Nama Sekolah"}</p>
                            <p className="text-[12px] text-gray-500">Sistem Pelaporan v1.0</p>
                        </div>
                    </div>
                </div>
        </aside>
    );
}
