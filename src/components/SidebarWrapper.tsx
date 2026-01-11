"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SidebarSkeleton from "@/components/loading/admin/loading_sidebar";
import { useSchoolSettings } from "@/context/SchoolSettingsContext";

interface SidebarWrapperProps {
    role: "admin" | "siswa" | "guru";
}

export default function SidebarWrapper({ role }: SidebarWrapperProps) {
    const { settings, loading } = useSchoolSettings();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

  // Listen to global toggle event from Header
  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    if (typeof window !== "undefined") {
      window.addEventListener("toggle-sidebar", handler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("toggle-sidebar", handler as EventListener);
      }
    };
  }, []);

    // 🧩 Tambahkan efek untuk mengunci scroll body saat sidebar terbuka
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"; // kunci scroll
        } else {
            document.body.style.overflow = ""; // balikin normal
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!mounted || loading) {
        return <SidebarSkeleton />;
    }

    return (
        <>
            {/* Overlay untuk mobile */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] md:hidden transition-opacity duration-300 
                ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 z-[60] md:static md:z-auto md:translate-x-0 transform transition-transform duration-300 ease-in-out 
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                h-full`}
            >
                <Sidebar role={role} onClose={() => setIsOpen(false)} />
            </div>

            {/* Tombol toggle mengambang dihilangkan; gunakan hamburger di Header dan tombol X di dalam Sidebar */}
        </>
    );
}
