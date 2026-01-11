"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, Building, User, Search, MapPin, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import GuruDudiSkeleton from "@/components/loading/guru/loading_dudi";

interface DUDIType {
    id: number;
    nama_perusahaan: string;
    alamat: string;
    telepon: string;
    email: string;
    penanggung_jawab: string;
    kouta_magang: number;
    status: "pending" | "aktif" | "nonaktif";
}

interface DecodedToken {
    id: number;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

export default function GuruDudiPage() {
    const [allDudi, setAllDudi] = useState<DUDIType[]>([]);
    const [siswaCountPerDudi, setSiswaCountPerDudi] = useState<Record<number, number>>({});
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [loading, setLoading] = useState(true);

    // Fetch data DUDI berdasarkan guru yang login
    async function fetchDUDIByGuru() {
        try {
            setLoading(true);

            const token = Cookies.get("token");
            if (!token) {
                console.warn("Token tidak ditemukan");
                return;
            }

            const decoded = jwtDecode<DecodedToken>(token);
            const userId = decoded.id;

            // Ambil guru_id dari user yang login
            const resGuru = await fetch(`/api/guru/by-user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!resGuru.ok) throw new Error("Gagal mengambil guru_id");
            const dataGuru = await resGuru.json();
            const guruId = dataGuru?.data?.id;

            if (!guruId) {
                console.warn("Guru tidak ditemukan");
                setAllDudi([]);
                setSiswaCountPerDudi({});
                return;
            }

            // Ambil data DUDI yang guru_id-nya sesuai dengan guru yang login
            const resDudi = await fetch(`/api/dudi?guru_id=${guruId}&limit=9999&page=1`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!resDudi.ok) throw new Error("Gagal mengambil data DUDI");
            const dataDudi = await resDudi.json();
            const dudiList = dataDudi?.data || [];

            // Ambil semua magang aktif dari guru ini untuk hitung siswa per DUDI
            const resMagang = await fetch(`/api/magang?guru_id=${guruId}&limit=9999&page=1`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const dataMagang = await resMagang.json();
            const magangList = (dataMagang?.data || []).filter(
                (m: any) => m.status === "berlangsung"
            );

            // Hitung siswa aktif per DUDI
            const countMap: Record<number, number> = {};
            magangList.forEach((m: any) => {
                countMap[m.dudi_id] = (countMap[m.dudi_id] || 0) + 1;
            });

            console.log("DUDI untuk guru ini:", dudiList);
            setAllDudi(dudiList);
            setSiswaCountPerDudi(countMap);
        } catch (err) {
            console.error("Gagal memuat data DUDI guru:", err);
            setAllDudi([]);
            setSiswaCountPerDudi({});
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDUDIByGuru();
    }, []);

    // Filter dudi berdasarkan pencarian
    const filteredDudiSearch = Array.isArray(allDudi)
        ? allDudi.filter((u) =>
            [u.nama_perusahaan, u.alamat, u.penanggung_jawab]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : [];

    // Tentukan data tabel yang akan ditampilkan
    const isSearching = search.trim() !== "";

    // Pagination manual di frontend
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    let displayedDudi: DUDIType[] = [];
    let totalItems = 0;
    let totalPages = 1;

    if (isSearching) {
        // Saat search aktif → tampilkan semua hasil, 1 halaman aja
        displayedDudi = filteredDudiSearch;
        totalItems = filteredDudiSearch.length;
        totalPages = 1;
    } else {
        // Saat tidak search → tampilkan sesuai pagination normal
        displayedDudi = allDudi.slice(startIndex, endIndex);
        totalItems = allDudi.length;
        totalPages = Math.ceil(totalItems / limit) || 1;
    }

    // Stats (hitung dari semua data aktif, bukan yang di halaman)
    const totalDudi = allDudi.length;
    const totalSiswaMagang = Object.values(siswaCountPerDudi).reduce((a, b) => a + b, 0);
    const rataValue = totalDudi > 0 ? totalSiswaMagang / totalDudi : 0;
    const rataSiswaPerDudi = Number.isInteger(rataValue)
        ? rataValue
        : rataValue.toFixed(1);

    const stats = [
        { title: "Total DUDI", value: totalDudi, icon: Building2, color: "text-cyan-500", description: "Perusahaan mitra" },
        { title: "Total Siswa Magang", value: totalSiswaMagang, icon: User, color: "text-cyan-500", description: "Siswa magang aktif" },
        { title: "Rata-rata Siswa", value: rataSiswaPerDudi, icon: Building, color: "text-cyan-500", description: "Per perusahaan" },
    ];

    // Reset ke page 1 tiap kali search berubah
    useEffect(() => {
        setPage(1);
    }, [search]);

    if (loading) {
        return <GuruDudiSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-2xl">Manajemen DUDI</h2>
            </div>

            {/* Card Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stats.map((item, idx) => (
                    <Card key={idx} className="shadow-md border group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm sm:text-md font-medium">{item.title}</CardTitle>
                            <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
                        </CardHeader>
                        <CardContent className="mt-2">
                            <p className="text-xl sm:text-2xl font-bold group-hover:-translate-y-3 transition-all duration-300 ease-in-out">{item.value}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{item.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="shadow-md border">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <Building2 className="text-cyan-500" size={22} />
                        <CardTitle className="flex items-center gap-2">Daftar DUDI</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search + Filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-130">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Cari perusahaan, alamat, penanggung jawab..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl placeholder:text-gray-400"
                            />
                        </div>

                        {/* Filter Controls */}
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Tampilkan:</span>
                            <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                                <SelectTrigger className="w-[120px] sm:w-[140px]">
                                    <SelectValue placeholder="Tampilkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-600">entri</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="text-left bg-white">
                                    <th className="px-3 sm:px-4 py-2 font-semibold text-sm sm:text-sm">Perusahaan</th>
                                    <th className="px-3 sm:px-4 py-2 font-semibold text-sm sm:text-sm">Kontak</th>
                                    <th className="px-3 sm:px-4 py-2 font-semibold text-sm sm:text-sm hidden md:table-cell">Penanggung Jawab</th>
                                    <th className="px-3 sm:px-4 py-2 text-center font-semibold text-sm sm:text-sm">Status</th>
                                    <th className="px-3 sm:px-4 py-2 text-center font-semibold text-sm sm:text-sm">Siswa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedDudi.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada data DUDI yang ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    displayedDudi.map((u) => (
                                        <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                                            <td className="px-3 sm:px-4 py-4 sm:py-5">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="inline-flex bg-gradient-to-r from-cyan-500 to-sky-600 px-2 py-2 sm:px-3 sm:py-3 rounded-lg shadow-sm flex-shrink-0">
                                                        <Building2 className="text-white" size={16} />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <p className="font-medium font-semibold text-sm sm:text-base truncate">{u.nama_perusahaan ?? "Tanpa Nama"}</p>
                                                        <div className="flex flex-row items-center gap-1 text-gray-500">
                                                            <MapPin size={10} className="flex-shrink-0" />
                                                            <p className="font-small text-[10px] sm:text-[12px] truncate">{u.alamat ?? "Tanpa Alamat"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex flex-row items-center gap-2 mt-1 text-gray-500">
                                                        <Mail size={13} />
                                                        <p className="font-small text-[13px] truncate">{u.email}</p>
                                                    </div>
                                                    <div className="flex flex-row items-center gap-2 mt-1 text-gray-500">
                                                        <Phone size={13} />
                                                        <p className="font-small text-[13px] truncate">{u.telepon}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                                                <div className="flex flex-row items-center gap-3">
                                                    <div className="inline-flex p-[7px] rounded-full bg-gray-200 flex-shrink-0">
                                                        <User className="text-black" size={14} />
                                                    </div>
                                                    <p className="font-medium text-[14px] truncate">{u.penanggung_jawab}</p>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${u.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-600 border border-yellow-300"
                                                        : u.status === "aktif"
                                                            ? "bg-green-100 text-green-600 border border-green-300"
                                                            : u.status === "nonaktif"
                                                                ? "bg-red-100 text-red-600 border border-red-300"
                                                                : "bg-blue-100 text-blue-600 border border-blue-300"
                                                        }`}
                                                >
                                                    {u.status === "pending" && <span>Menunggu</span>}
                                                    {u.status === "aktif" && <span>Aktif</span>}
                                                    {u.status === "nonaktif" && <span>Tidak Aktif</span>}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white font-medium bg-[#AEA500] shadow-sm">
                                                    {siswaCountPerDudi[u.id] || 0}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <CardFooter className="px-4 sm:px-6 flex flex-col gap-4">
                    <div className="w-full border-t border-gray-200" />

                    {/* Pagination Info & Controls */}
                    <div className="flex flex-col sm:flex-row items-center py-2 w-full gap-4">
                        {/* Text Info */}
                        <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                            Menampilkan {totalItems === 0 ? 0 : (startIndex + 1)} sampai {Math.min(endIndex, totalItems)} dari {totalItems} entri
                        </p>

                        {/* Pagination Controls */}
                        <div className="mx-auto sm:mx-0 sm:ml-auto">
                            <Pagination>
                                <PaginationContent>
                                    {/* Tombol Previous */}
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>

                                    {/* Tombol nomor halaman */}
                                    {Array.from({ length: totalPages }, (_, i) => {
                                        const pageNumber = i + 1;
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    isActive={page === pageNumber}
                                                    onClick={() => setPage(pageNumber)}
                                                    className={`cursor-pointer ${page === pageNumber
                                                        ? "bg-gradient-to-r from-cyan-500 to-sky-600 text-white"
                                                        : "hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    {/* Tombol Next */}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}