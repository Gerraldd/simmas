"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HeaderSkeleton from "@/components/loading/admin/loading_header";
import { useSchoolSettings } from "@/context/SchoolSettingsContext";

interface HeaderWrapperProps {
    user: { name: string; role: "admin" | "siswa" | "guru"; email: string };
}

export default function HeaderWrapper({ user }: HeaderWrapperProps) {
    const { settings, loading } = useSchoolSettings();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Delay mounting untuk memastikan context sudah ready
        // const timer = setTimeout(() => setMounted(true), 100);
        // return () => clearTimeout(timer);
        setMounted(true)
    }, []);

    // Tampilkan skeleton saat:
    // 1. Component belum mounted (hydration)
    // 2. Settings masih loading
    // 3. Settings belum ada data (logo_url atau nama_sekolah kosong)
    if (!mounted || loading) {
        return <HeaderSkeleton />;
    }

    return <Header user={user} />;
}