"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, User, Search, Eye, MapPin, Send, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
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
import { Progress } from "@/components/ui/progress";
import SiswaDudiSkeleton from "@/components/loading/siswa/loading_dudi";
import SiswaPaginationDudiSkeleton from "@/components/loading/siswa/loading_paginationDUDI";

interface DUDIType {
    id: number;
    nama_perusahaan: string;
    guru_id: number,
    tentang_perusahaan: string;
    bidang_usaha: string;
    alamat: string;
    telepon: string;
    email: string;
    penanggung_jawab: string;
    kouta_magang: number;
    status: string;
}

interface DecodedToken {
    id: number;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

export default function SiswaDudiPage() {
    const [dudi, setDUDI] = useState<DUDIType[]>([]);
    const [allDUDI, setAllDUDI] = useState<DUDIType[]>([]);
    const [dudibyId, setDUDIbyId] = useState<DUDIType | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6);
    const [totalPage, setTotalPages] = useState(1);
    const [total, setTotalItems] = useState(0);
    const [openDetail, setOpenDetail] = useState(false);
    const [openDaftar, setOpenDaftar] = useState(false);
    const [formDaftarData, setFormDaftarData] = useState({
        siswa_id: "",
        guru_id: "",
        dudi_id: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        status: "pending",
    });
    const [loading, setLoading] = useState(true);
    const [paginationLoading, setPaginationLoading] = useState(false);
    const [namaDUDI, setNamaDUDI] = useState("");
    const [magangList, setMagangList] = useState<any[]>([]);
    const [siswaLoginId, setSiswaLoginId] = useState<number | null>(null);
    const [magangAll, setMagangAll] = useState<any[]>([]);

    function getTokenFromCookie() {
        return Cookies.get("token") || "";
    }

    async function fetchDUDI() {
        try {
            const token = getTokenFromCookie();

            setPaginationLoading(true);
            const res = await fetch(`/api/dudi?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Gagal mengambil data DUDI");

            const aktifOnly = (data.data || []).filter((item: any) => item.status === "aktif");
            setDUDI(aktifOnly);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
        } catch (err) {
            console.error("Failed to fetch dudi:", err);
            toast.error("Gagal mengambil data DUDI");
        } finally {
            setPaginationLoading(false);
        }
    }

    async function fetchAllDUDI() {
        try {
            const token = getTokenFromCookie();

            const res = await fetch("/api/dudi?page=1&limit=9999", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Gagal mengambil semua data DUDI");

            const aktifOnly = (data.data || []).filter((item: any) => item.status === "aktif");
            setAllDUDI(aktifOnly);

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            setDUDI(aktifOnly.slice(startIndex, endIndex));
            setTotalPages(Math.ceil(aktifOnly.length / limit) || 1);
            setTotalItems(aktifOnly.length || 0);
        } catch (err) {
            console.error("Failed to fetch all dudi:", err);
            toast.error("Gagal mengambil semua data DUDI");
        }
    }

    async function fetchMagang(siswaId: number) {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/magang?siswa_id=${siswaId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (res.ok) {
                setMagangList(data.data || []);
            } else {
                throw new Error(data.message || "Gagal mengambil data magang");
            }
        } catch (err) {
            console.error("Gagal ambil data magang:", err);
            toast.error("Gagal mengambil data magang");
        }
    }

    async function fetchMagangAll() {
        try {
            const token = getTokenFromCookie();

            const res = await fetch("/api/magang?limit=9999", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();
            if (res.ok) {
                setMagangAll(data.data || []);
            } else {
                throw new Error(data.message || "Gagal mengambil semua data magang");
            }
        } catch (err) {
            console.error("Gagal ambil semua data magang:", err);
            toast.error("Gagal mengambil semua data magang");
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDaftarData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenDetail = async (id: number) => {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/dudi/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Gagal mengambil data DUDI");

            setDUDIbyId(data.data);
            setOpenDetail(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data DUDI");
        } finally {
        }
    };

    const handleOpenDaftar = async (id: number) => {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/dudi/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Gagal mengambil data DUDI");

            setDUDIbyId(data.data);
            console.log("Data DUDI", dudibyId)
            setOpenDaftar(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat DUDI");
        }
    }

    const handleDaftarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = getTokenFromCookie();

            setPaginationLoading(true);
            const res = await fetch("/api/magang", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    siswa_id: Number(formDaftarData.siswa_id),
                    guru_id: Number(dudibyId?.guru_id),
                    dudi_id: Number(formDaftarData.dudi_id),
                    tanggal_mulai: null,
                    tanggal_selesai: null,
                    status: "pending",
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Pendaftaran magang berhasil dikirim! Menunggu verifikasi dari pihak guru pembimbing.");
                setOpenDaftar(false);

                if (formDaftarData.siswa_id) {
                    await fetchMagang(Number(formDaftarData.siswa_id));
                }
                await fetchMagangAll();

                setFormDaftarData({
                    siswa_id: "",
                    guru_id: "",
                    dudi_id: "",
                    tanggal_mulai: "",
                    tanggal_selesai: "",
                    status: "pending",
                });
            } else {
                toast.error(data.message || "Gagal daftar magang");
            }
        } catch (err) {
            console.error("Failed to submit magang:", err);
            toast.error("Gagal daftar magang");
        } finally {
            setPaginationLoading(false);
        }
    };

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            setLoading(false);
            return;
        }

        async function initializeData() {
            try {
                setLoading(true);

                const decoded: DecodedToken = jwtDecode(token || "");
                const userId = decoded.id;

                const siswaRes = await fetch("/api/siswa", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const siswaData = await siswaRes.json();

                if (siswaRes.ok && Array.isArray(siswaData.data)) {
                    const siswaLogin = siswaData.data.find((s: any) => s.user_id === userId);

                    if (siswaLogin) {
                        setFormDaftarData((prev) => ({
                            ...prev,
                            siswa_id: String(siswaLogin.id),
                        }));
                        setSiswaLoginId(siswaLogin.id);
                        await fetchMagang(siswaLogin.id);
                    } else {
                        console.warn("Siswa dengan user_id ini tidak ditemukan");
                        toast.error("Siswa tidak ditemukan");
                    }
                } else {
                    console.error("Gagal mengambil data siswa");
                    toast.error("Gagal mengambil data siswa");
                }

                await Promise.all([fetchAllDUDI(), fetchMagangAll()]);
            } catch (err) {
                console.error("Initialization error:", err);
                toast.error("Gagal memuat data awal");
            } finally {
                setLoading(false);
                setPaginationLoading(false);
            }
        }

        initializeData();
    }, []);

    useEffect(() => {
        if (!loading && !search.trim()) {
            fetchDUDI();
        }
    }, [page, limit, loading]);

    if (loading) {
        return <SiswaDudiSkeleton />;
    }

    const filteredDUDISearch = Array.isArray(allDUDI)
        ? allDUDI.filter((u) =>
            [u.nama_perusahaan, u.bidang_usaha]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : [];

    const filteredDUDI = Array.isArray(dudi) ? dudi : [];
    const isSearching = search.trim() !== "";
    const displayedDUDI = isSearching ? filteredDUDISearch : filteredDUDI;
    const currentPage = isSearching ? 1 : page;
    const totalPages = isSearching ? 1 : totalPage;
    const totalItems = isSearching ? displayedDUDI.length : total;

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return "-";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    return (
        <div className="space-y-6 overflow-x-hidden">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-xl sm:text-2xl">Cari Tempat Magang</h2>
            </div>

            {/* Status jumlah pendaftaran */}
            <Card className="shadow-md border border-cyan-200 bg-cyan-50">
                <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-6 px-6">
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            Pendaftaran yang sudah dilakukan:
                        </p>
                        <p className="text-xl font-bold text-cyan-600">
                            {magangList.length} / 3
                        </p>
                    </div>
                    <div className="w-full sm:w-50">
                        {magangList !== null && (
                            <>
                                <Progress
                                    value={(magangList.length / 3) * 100}
                                    className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-sky-600"
                                />
                                <p className="text-xs text-center text-gray-500 mt-1">
                                    Maksimal 3 kali pendaftaran
                                </p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card className="shadow-md border">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-1">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Cari perusahaan, bidang usaha..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex flex-row sm:ml-2 items-center">
                            <div className="flex flex-row items-center">
                                <h1 className="text-sm mr-2">Tampilkan: </h1>
                                <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Tampilkan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="6">6</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                    </SelectContent>
                                </Select>
                                <h1 className="text-sm ml-2">entri</h1>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Grid Card */}
            {paginationLoading ? (
                <SiswaPaginationDudiSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {displayedDUDI.map((p) => {
                        const terisi = magangAll.filter((m) => m.dudi_id === p.id && ['diterima', 'berlangsung'].includes(m.status)).length;
                        const thisMagang = magangList.find((m) => m.dudi_id === p.id);
                        const sisa = p.kouta_magang - terisi;
                        const hasFinishedMagang = magangList.some((m) => m.status === "selesai");
                        const disableDaftar = hasFinishedMagang && (!thisMagang || thisMagang.status !== "selesai");

                        return (
                            <Card key={p.id} className="shadow-md rounded-xl flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex flex-row gap-2 items-center">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white bg-gradient-to-r from-cyan-500 to-sky-600">
                                            <Building2 size={18} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span>{p.nama_perusahaan}</span>
                                            <span className="text-[13px] font-medium text-cyan-600">
                                                {p.bidang_usaha}
                                            </span>
                                            {(() => {
                                                const magang = magangList.find((m) => m.dudi_id === p.id);
                                                if (magang) {
                                                    const statusStyles: { [key: string]: string } = {
                                                        pending: "bg-[#AEA500] text-white",
                                                        diterima: "bg-blue-600 text-white",
                                                        ditolak: "bg-red-600 text-white",
                                                        berlangsung: "bg-green-600 text-white",
                                                        selesai: "bg-gray-500 text-white",
                                                        dibatalkan: "bg-red-500 text-white",
                                                    };
                                                    const statusText: { [key: string]: string } = {
                                                        pending: "Menunggu",
                                                        diterima: "Diterima",
                                                        ditolak: "Ditolak",
                                                        berlangsung: "Aktif",
                                                        selesai: "Selesai",
                                                        dibatalkan: "Dibatalkan",
                                                    };
                                                    return (
                                                        <div
                                                            className={`inline-flex items-center w-fit px-2 py-1 rounded-md text-[12px] font-medium ${statusStyles[magang.status]}`}
                                                        >
                                                            {statusText[magang.status]}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-grow">
                                    <div className="text-[13px] text-gray-600">
                                        <div className="flex flex-row gap-1 items-center break-words">
                                            <MapPin size={12} />
                                            <p className="break-words">{p.alamat}</p>
                                        </div>
                                        <div className="flex flex-row gap-1 items-center break-words">
                                            <User size={12} />
                                            <p className="break-words">PIC: {p.penanggung_jawab}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg px-3 py-3">
                                        <div className="flex flex-row justify-between mb-1">
                                            <p className="text-sm font-medium">Kuota Magang</p>
                                            <p className="text-[12px] font-semibold">{terisi}/{p.kouta_magang}</p>
                                        </div>
                                        <Progress
                                            value={(terisi / p.kouta_magang) * 100}
                                            className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-sky-600"
                                        />
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500">{sisa} slot tersisa</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 px-3 py-3 rounded-lg">
                                        <p className="text-xs text-gray-600 break-words">{truncateText(p.tentang_perusahaan, 100)}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
                                    <Button
                                        onClick={() => handleOpenDetail(p.id)}
                                        variant="outline"
                                        className="w-full border-none shadow-none text-[13px] text-gray-600 cursor-pointer text-center"
                                    >
                                        <Eye size={12} /> Detail
                                    </Button>
                                    {(() => {
                                        const magang = magangList.find((m) => m.dudi_id === p.id);
                                        if (magang) {
                                            const statusText: { [key: string]: string } = {
                                                pending: "Sudah Mendaftar",
                                                berlangsung: "Aktif",
                                                diterima: "Diterima",
                                                ditolak: "Ditolak",
                                                selesai: "Selesai",
                                                dibatalkan: "Dibatalkan",
                                            };
                                            return (
                                                <Button
                                                    disabled
                                                    className="bg-slate-400 text-slate-900 font-semibold text-[13px] w-full rounded-lg cursor-not-allowed"
                                                >
                                                    {statusText[magang.status]}
                                                </Button>
                                            );
                                        }
                                        if (sisa <= 0) {
                                            return (
                                                <Button
                                                    disabled
                                                    className="bg-red-500 text-white font-semibold text-[13px] w-full rounded-lg opacity-100 cursor-not-allowed"
                                                >
                                                    Penuh
                                                </Button>
                                            );
                                        }
                                        if (magangList.length >= 3) {
                                            return (
                                                <Button
                                                    disabled
                                                    className="bg-slate-400 text-slate-900 font-semibold text-[13px] w-full rounded-lg"
                                                >
                                                    Batas Daftar Tercapai
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button
                                                onClick={() => {
                                                    handleOpenDaftar(p.id);
                                                    setNamaDUDI(p.nama_perusahaan);
                                                    setFormDaftarData((prev) => ({
                                                        ...prev,
                                                        dudi_id: String(p.id || ""),
                                                    }));
                                                }}
                                                disabled={disableDaftar}
                                                className={`w-full text-[13px] text-white cursor-pointer ${disableDaftar
                                                    ? "bg-slate-400 text-slate-900 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-700 hover:to-sky-700"
                                                    }`}
                                            >
                                                <Send size={12} /> Daftar
                                            </Button>
                                        );
                                    })()}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Detail form */}
            <Dialog open={openDetail} onOpenChange={setOpenDetail}>
                <DialogContent className="w-full max-w-[95vw] sm:w-[650px] sm:max-w-3xl rounded-2xl sm:rounded-xl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader className="flex flex-col sm:flex-row sm:justify-between text-left">
                        <div className="flex flex-row gap-3 items-center w-full">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-r from-cyan-500 to-sky-600">
                                <Building2 size={22} className="text-white" />
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                                <DialogTitle className="text-left">{dudibyId?.nama_perusahaan}</DialogTitle>
                                <DialogDescription className="text-cyan-600 text-left">{dudibyId?.bidang_usaha}</DialogDescription>
                            </div>
                        </div>
                        {/* Mobile-only status badge below header row to keep icon/text aligned */}
                        <div className="sm:hidden mt-2">
                            {(() => {
                                const magang = magangList.find((m) => m.dudi_id === dudibyId?.id);
                                if (magang) {
                                    const statusStyles: { [key: string]: string } = {
                                        pending: "bg-[#AEA500] text-white",
                                        diterima: "bg-blue-600 text-white",
                                        ditolak: "bg-red-600 text-white",
                                        berlangsung: "bg-green-600 text-white",
                                        selesai: "bg-gray-500 text-white",
                                        dibatalkan: "bg-red-500 text-white",
                                    };
                                    const statusText: { [key: string]: string } = {
                                        pending: "Menunggu Verifikasi",
                                        diterima: "Diterima",
                                        ditolak: "Ditolak",
                                        berlangsung: "Aktif",
                                        selesai: "Selesai",
                                        dibatalkan: "Dibatalkan",
                                    };
                                    return (
                                        <div className={`inline-flex items-center w-fit px-2 py-1 rounded-md text-[12px] font-medium ${statusStyles[magang.status]}`}>
                                            {statusText[magang.status]}
                                        </div>
                                    );
                                }
                                // Show a neutral badge on mobile when belum mendaftar
                                return (
                                    <div className="inline-flex items-center w-fit px-2 py-1 rounded-md text-[12px] font-medium bg-gray-200 text-gray-800">
                                        Belum mendaftar
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="hidden sm:block">
                            {(() => {
                                const magang = magangList.find((m) => m.dudi_id === dudibyId?.id);
                                if (magang) {
                                    const statusStyles: { [key: string]: string } = {
                                        pending: "bg-[#AEA500] text-white",
                                        diterima: "bg-blue-600 text-white",
                                        ditolak: "bg-red-600 text-white",
                                        berlangsung: "bg-green-600 text-white",
                                        selesai: "bg-gray-500 text-white",
                                        dibatalkan: "bg-red-500 text-white",
                                    };
                                    const statusText: { [key: string]: string } = {
                                        pending: "Menunggu Verifikasi",
                                        diterima: "Diterima",
                                        ditolak: "Ditolak",
                                        berlangsung: "Aktif",
                                        selesai: "Selesai",
                                        dibatalkan: "Dibatalkan",
                                    };
                                    return (
                                        <div
                                            className={`inline-flex items-center w-fit px-2 py-1 rounded-md text-[12px] font-medium ${statusStyles[magang.status]}`}
                                        >
                                            {statusText[magang.status]}
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </DialogHeader>
                    <div className="w-full border-t mt-1 border-gray-200" />
                    <div className="flex-1 overflow-y-auto max-h-[60vh] px-2">
                        <div className="flex flex-col py-3 px-3 gap-2 mt-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <p className="font-medium text-sm">Tentang Perusahaan</p>
                            </div>
                            <div>
                                <p className="font-normal text-[13px] text-gray-700">{dudibyId?.tentang_perusahaan}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <p className="font-medium text-[15px]">Informasi Kontak</p>
                        </div>
                        <div className="flex flex-col py-3 px-3 gap-2 mt-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex flex-row gap-3 items-center text-gray-600">
                                <MapPin size={16} />
                                <div>
                                    <p className="text-xs">Alamat</p>
                                    <p className="text-sm text-gray-700">{dudibyId?.alamat}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex flex-col py-3 px-3 gap-2 mt-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex flex-row gap-3 items-center text-gray-600">
                                    <Phone size={16} />
                                    <div>
                                        <p className="text-xs">Telepon</p>
                                        <p className="text-sm text-gray-700">{dudibyId?.telepon}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col py-3 px-3 gap-2 mt-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex flex-row gap-3 items-center text-gray-600">
                                    <Mail size={16} />
                                    <div>
                                        <p className="text-xs">Email</p>
                                        <p className="text-sm text-gray-700">{dudibyId?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col py-3 px-3 gap-2 mt-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex flex-row gap-3 items-center text-gray-600 mt-2">
                                <User size={16} />
                                <div>
                                    <p className="text-xs">Penanggung Jawab</p>
                                    <p className="text-sm text-gray-700">{dudibyId?.penanggung_jawab}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <p className="font-medium text-[15px]">Informasi Magang</p>
                        </div>
                        {dudibyId && (
                            <div className="flex flex-col py-3 px-3 gap-2 my-3 bg-cyan-50 rounded-lg border border-cyan-200">
                                {(() => {
                                    const terisi = magangAll.filter((m) => m.dudi_id === dudibyId.id && ['diterima', 'berlangsung'].includes(m.status)).length;
                                    const sisa = (dudibyId.kouta_magang || 0) - terisi;
                                    return (
                                        <>
                                            <div className="flex flex-row justify-between gap-3 items-center text-gray-600">
                                                <p className="text-xs">Bidang Usaha</p>
                                                <p className="text-sm font-normal text-black">{dudibyId.bidang_usaha}</p>
                                            </div>
                                            <div className="flex flex-row justify-between gap-3 items-center text-gray-600">
                                                <p className="text-xs">Kuota Magang</p>
                                                <p className="text-sm font-normal text-black">{terisi}/{dudibyId.kouta_magang}</p>
                                            </div>
                                            <div className="flex flex-row justify-between gap-3 items-center text-gray-600">
                                                <p className="text-xs">Slot Tersisa</p>
                                                <p className="text-sm font-normal text-black">{sisa} slot</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center sm:justify-end pt-3 border-t bg-white gap-3">
                        <DialogClose asChild>
                            <Button variant="outline" className="w-30 cursor-pointer">
                                Tutup
                            </Button>
                        </DialogClose>
                        {(() => {
                            if (!dudibyId) return null;
                            const magang = magangList.find((m) => m.dudi_id === dudibyId.id);
                            const terisi = magangAll.filter((m) => m.dudi_id === dudibyId.id).length;
                            const sisa = (dudibyId.kouta_magang || 0) - terisi;
                            if (magang) {
                                const statusText: { [key: string]: string } = {
                                    pending: "Sudah Mendaftar",
                                    berlangsung: "Aktif",
                                    diterima: "Diterima",
                                    ditolak: "Ditolak",
                                    selesai: "Selesai",
                                    dibatalkan: "Dibatalkan",
                                };
                                return (
                                    <Button
                                        disabled
                                        className="bg-slate-400 text-slate-900 font-semibold text-[13px] w-40 rounded-lg cursor-not-allowed"
                                    >
                                        {statusText[magang.status]}
                                    </Button>
                                );
                            }
                            if (sisa <= 0) {
                                return (
                                    <Button
                                        disabled
                                        className="bg-red-500 text-white font-semibold text-[13px] w-40 rounded-lg opacity-100 cursor-not-allowed"
                                    >
                                        Penuh
                                    </Button>
                                );
                            }
                            if (magangList.length >= 3) {
                                return (
                                    <Button
                                        disabled
                                        className="bg-slate-400 text-slate-900 font-semibold text-[13px] w-40 rounded-lg cursor-not-allowed"
                                    >
                                        Batas Daftar Tercapai
                                    </Button>
                                );
                            }
                            return (
                                <Button
                                    onClick={() => {
                                        handleOpenDaftar(dudibyId?.id);
                                        setNamaDUDI(dudibyId?.nama_perusahaan || "");
                                        setFormDaftarData((prev) => ({
                                            ...prev,
                                            dudi_id: String(dudibyId?.id || ""),
                                        }));
                                    }}
                                    className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-700 hover:to-sky-700 w-40 text-[13px] text-white cursor-pointer"
                                >
                                    <Send size={12} /> Daftar Magang
                                </Button>
                            );
                        })()}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Daftar form */}
            <Dialog open={openDaftar} onOpenChange={setOpenDaftar}>
                <DialogContent className="w-full max-w-[95vw] sm:w-[500px] sm:max-w-4xl rounded-2xl sm:rounded-xl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <form onSubmit={handleDaftarSubmit}>
                        <DialogHeader>
                            <div className="flex flex-col gap-2 mb-2">
                                <DialogTitle>Daftar Magang</DialogTitle>
                                <DialogDescription>Isilah isian yang diperlukan untuk mendaftar</DialogDescription>
                            </div>
                            <div className="w-full border-t mt-3 border-gray-200" />
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto max-h-[70vh] px-2">
                            <div className="grid gap-2 my-4">
                                <label>Pilihan Industri</label>
                                <Input type="text" value={namaDUDI} disabled className="bg-gray-100 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="flex flex-row flex-nowrap justify-center sm:justify-end pt-3 border-t bg-white gap-2 items-center">
                            <DialogClose asChild>
                                <Button variant="outline" className="w-30 cursor-pointer">
                                    Tutup
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                className="w-40 bg-gradient-to-r from-cyan-500 to-sky-600 transition-all duration-300 ease-in-out hover:shadow-lg hover:from-cyan-600 hover:to-sky-700 cursor-pointer"
                                disabled={paginationLoading}
                            >
                                <Send size={13} /> Daftar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader className="py-3">
                    <div className="flex flex-col sm:flex-row items-center w-full gap-3">
                        <p className="text-sm text-gray-500">
                            Menampilkan {((page - 1) * limit) + 1} sampai {Math.min(page * limit, total)} dari {total} entri
                        </p>
                        <div className="sm:ml-auto w-full sm:w-auto overflow-x-auto">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => !isSearching && setPage(page - 1)}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => {
                                        const pageNumber = i + 1;
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    isActive={currentPage === pageNumber}
                                                    onClick={() => !isSearching && setPage(pageNumber)}
                                                    className={`cursor-pointer ${currentPage === pageNumber
                                                        ? "bg-gradient-to-r from-cyan-500 to-sky-600 text-white"
                                                        : "hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => !isSearching && setPage(page + 1)}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}