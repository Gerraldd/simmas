"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Building2,
    GraduationCap,
    BookOpen,
    Calendar,
    FileText,
    TrendingUp,
    Clock,
    Award,
    MapPin,
    ArrowRight,
    CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

interface SiswaData {
    nama: string;
    nis: string;
    kelas: string;
    jurusan: string;
    tempat_magang?: string;
    status_magang?: string;
}

export default function SiswaDashboardPage() {
    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const currentTime = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const [siswaData, setSiswaData] = useState<SiswaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; role: string; id: string }>({
        name: "Guest",
        role: "siswa",
        id: "",
    });


    const getTokenFromCookie = () => {
        return Cookies.get("token") || "";
    };

    useEffect(() => {
        const token = getTokenFromCookie();

        try {
            const decoded: any = jwt.decode(token);
            if (decoded?.name) {
                setUser({ name: decoded.name, role: decoded.role, id: decoded.id });
            }
        } catch (err) {
            console.error("Invalid token", err);
        }
    }, []);

    useEffect(() => {
        if (user.id) {
            fetchSiswaData();
        }
    }, [user.id]);

    const fetchSiswaData = async () => {
        try {
            const token = getTokenFromCookie();

            const response = await fetch(`/api/siswa/profile?user_id=${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();
            console.log("Data Siswa: ", data.data)
            if (data.success) {
                setSiswaData(data.data);
            }
        } catch (error) {
            console.error("Error fetching siswa data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 11) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 18) return "Selamat Sore";
        return "Selamat Malam";
    };

    if (loading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <div className="animate-pulse">
                    <div className="h-32 sm:h-40 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-2xl mb-4 sm:mb-6"></div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mt-4 sm:mt-6">
                        <div className="h-20 sm:h-24 bg-gray-200 rounded-xl"></div>
                        <div className="h-20 sm:h-24 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Hero Welcome Section */}
            <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-8 text-white overflow-hidden shadow-xl">
                {/* <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div> */}

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-2 mb-2">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                                    <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 break-words">
                                        {getGreeting()}, {siswaData?.nama || user.name}! 👋
                                    </h1>
                                    <p className="text-cyan-100 text-xs sm:text-sm">
                                        Semangat untuk hari ini! Mari catat aktivitas magangmu
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-xs sm:text-sm font-medium">{today}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-xs sm:text-sm font-medium">{currentTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Info Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">NIS</CardTitle>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 w-full break-words">
                            {siswaData?.nis || "-"}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Nomor Induk Siswa</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Kelas</CardTitle>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                            {siswaData?.kelas || "-"}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Kelas saat ini</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Jurusan</CardTitle>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm sm:text-lg font-bold text-orange-600 break-words">
                            {siswaData?.jurusan || "-"}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Program Keahlian</p>
                    </CardContent>
                </Card>

                {/* <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Status</CardTitle>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm sm:text-lg font-bold text-purple-600">
                            {siswaData?.status_magang || "Tidak ada Data Magang"}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Status Magang</p>
                    </CardContent>
                </Card> */}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                <Link href="/main/siswa/dudi" className="block">
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-cyan-500 to-blue-600 text-white h-full flex flex-col justify-between py-6 sm:py-10">
                        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-base sm:text-lg">Cari DUDI</h3>
                                        <p className="text-xs sm:text-sm text-cyan-100">Temukan tempat magang</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/main/siswa/logbook" className="block">
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-green-500 to-emerald-600 text-white h-full flex flex-col justify-between py-6 sm:py-10">
                        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-base sm:text-lg">Tulis Jurnal</h3>
                                        <p className="text-xs sm:text-sm text-green-100">Catat kegiatan harian</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}