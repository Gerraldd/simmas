"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, User, Search, GraduationCap, BookOpen, Clock, ThumbsUp, ThumbsDown, FileText, Eye, Check, X, CircleAlert, File, PenLine, MessageSquare, RefreshCcw, Download, IdCard, Save, Filter, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Dialog,
    DialogTrigger,
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
} from "@/components/ui/pagination"
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import GuruLogbookSkeleton from "@/components/loading/guru/loading_logbook";

interface LogbookType {
    id: number;
    magang: {
        id: number,
        siswa: {
            id: number,
            nama: string,
            nis: string,
            kelas: string,
            jurusan: string,
        },
        guru: {
            id: number,
            nama: string,
            nip: string,
        },
        dudi: {
            id: number,
            nama_perusahaan: string,
            alamat: string,
            penanggung_jawab: string,
        }
    };
    tanggal: Date;
    kegiatan: string;
    kendala: string;
    file: string;
    status_verifikasi: string;
    catatan_guru: string
    created_at: string;
    updated_at: string;
}

interface DecodedToken {
    id: number;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

export default function GuruLogbookPage() {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [guruLoginId, setGuruLoginId] = useState<number | null>(null);
    const [logbook, setLogbook] = useState<LogbookType[]>([]);
    const [allLogbook, setAllLogbook] = useState<LogbookType[]>([]);
    const [logbookbyId, setLogbookbyId] = useState<LogbookType | null>(null);
    const [baseFiltered, setBaseFiltered] = useState<LogbookType[]>([]);
    const [isClicked, setIsClicked] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPage, setTotalPages] = useState(1);
    const [total, setTotalItems] = useState(0);
    const [formEditData, setFormEditData] = useState({
        catatan_guru: "",
    });
    const [loading, setLoading] = useState(true);
    const [editingMagangId, setEditingMagangId] = useState<number | null>(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [siswaList, setSiswaList] = useState<{ id: number, nama: string }[]>([]);
    const [dataDate, setDataDate] = useState({ tanggal: "", created_at: "", updated_at: "" })
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [loadingSaveNote, setLoadingSaveNote] = useState(false);
    const [loadingApprove, setLoadingApprove] = useState(false);
    const [loadingReject, setLoadingReject] = useState(false);
    const [showFilter, setShowFilter] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterBulan, setFilterBulan] = useState("all");
    const [filterTahun, setFilterTahun] = useState("all");

    // Fungsi download
    const handleDownloadFile = (filePath: string) => {
        if (!filePath) return;

        const fileName = filePath.split('/').pop() || 'file';
        const link = document.createElement('a');

        link.href = `/uploads/${fileName}`;

        link.download = fileName;

        link.click();
    };

    function truncateText(text: string, maxLength: number) {
        if (!text) return "-";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormEditData((prev) => ({ ...prev, [name]: value }));
    };

    function getTokenFromCookie() {
        return Cookies.get("token") || "";
    }

    // ambil data untuk form detail logbook siswa
    const handleOpenDetail = async (id: number) => {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/logbook/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Gagal mengambil data logbook");

            setFormEditData({
                catatan_guru: data.data.catatan_guru,
            });

            setDataDate({
                tanggal: format(parseISO(data.data.tanggal as any), "EEEE, dd MMMM yyyy", { locale: localeId }),
                created_at: format(parseISO(data.data.created_at as any), "dd/MM/yyyy", { locale: localeId }),
                updated_at: format(parseISO(data.data.updated_at as any), "dd/MM/yyyy", { locale: localeId }),
            });

            setLogbookbyId(data.data)
            setEditingMagangId(id);
            setOpenDetail(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data logbook");
        }
    };

    // Simpan catatan guru
    const handleSaveNote = async () => {
        if (!editingMagangId) return;
        setLoadingSaveNote(true)

        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/logbook/guru/${editingMagangId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    catatan_guru: formEditData.catatan_guru,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal menyimpan catatan");

            toast.success("Catatan berhasil disimpan ✅");
            setIsEditingNote(false);

            // refresh data logbook by id
            await handleOpenDetail(editingMagangId);
            // refresh list logbook
            fetchAllLogbook();
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menyimpan catatan");
        } finally {
            setLoadingSaveNote(false)
        }
    };

    // Setujui logbook
    const handleApprove = async () => {
        if (!editingMagangId) return;
        setLoadingApprove(true);

        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/logbook/guru/${editingMagangId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status_verifikasi: "disetujui",
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal menyetujui logbook");

            toast.success("Logbook disetujui ✅");
            setOpenDetail(false);
            // refresh list logbook
            fetchAllLogbook();
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menyetujui logbook");
        } finally {
            setLoadingApprove(false);
        }
    };

    // Tolak logbook
    const handleReject = async () => {
        if (!editingMagangId) return;
        setLoadingReject(true);

        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/logbook/guru/${editingMagangId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status_verifikasi: "ditolak",
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal menolak logbook");

            toast.success("Logbook ditolak ❌");
            setOpenDetail(false); // tutup modal setelah reject
            // refresh list logbook
            fetchAllLogbook();
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menolak logbook");
        } finally {
            setLoadingReject(false);
        }
    };

    const handleChangePending = async () => {
        if (!editingMagangId) return;

        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/logbook/guru/${editingMagangId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status_verifikasi: "pending",
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal mengubah logbook ke pending ");

            toast.success("Logbook diubah ke pending 🔃");

            setLogbookbyId(prev => prev ? { ...prev, status_verifikasi: "pending" } : prev);

            // refresh list logbook
            fetchAllLogbook();
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menolak logbook");
        }
    }

    // Decode JWT dari cookie
    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            const decoded = jwtDecode<DecodedToken>(token);
            setUser(decoded);
        }
    }, []);

    // Ambil data guru login berdasarkan user_id
    useEffect(() => {
        async function fetchGuruLogin() {
            if (!user?.id) return;

            try {
                const token = getTokenFromCookie();

                const res = await fetch(`/api/guru/by-user/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!res.ok) throw new Error("Gagal mengambil guru berdasarkan user_id");

                const result = await res.json();
                const guruLogin = result?.data;

                if (guruLogin?.id) {
                    setGuruLoginId(guruLogin.id);
                } else {
                    console.warn("Guru tidak ditemukan untuk user_id:", user.id);
                }
            } catch (error) {
                console.error("Gagal ambil guru login:", error);
                setLoading(false);
            }
        }
        fetchGuruLogin();
    }, [user]);

    useEffect(() => {
        if (guruLoginId) {
            fetchAllLogbook();
        }
    }, [guruLoginId, page, limit]);

    async function fetchAllLogbook() {
        if (!guruLoginId) return;
        if (!guruLoginId && loading) {
            setLoading(true)
        }

        try {
            const token = getTokenFromCookie();

            // jalankan 2 fetch sekaligus
            const [tabelRes, statsRes] = await Promise.all([
                fetch(`/api/logbook?guru_id=${guruLoginId}&page=${page}&limit=${limit}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                }),
                fetch(`/api/logbook?guru_id=${guruLoginId}&page=1&limit=9999`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                }),
            ]);

            // parsing JSON
            const tabelData = await tabelRes.json();
            const statsData = await statsRes.json();

            if (!tabelRes.ok) throw new Error("Gagal fetch tabel logbook");
            if (!statsRes.ok) throw new Error("Gagal fetch stats logbook");

            setLogbook(tabelData.data || []);
            setTotalItems(tabelData.total);
            setTotalPages(tabelData.totalPages);

            setAllLogbook(statsData.data || []);
        } catch (err) {
            console.error("Gagal fetch logbook & stats:", err);
            toast.error("Gagal memuat data logbook");
        } finally {
            setLoading(false); // baru false kalau semua sudah selesai
        }
    }

    // Efek untuk memfilter data berdasarkan status, bulan, tahun
    useEffect(() => {
        let data = [...allLogbook];

        if (filterStatus !== "all") {
            data = data.filter((l) => l.status_verifikasi === filterStatus);
        }

        if (filterBulan !== "all") {
            const bulan = parseInt(filterBulan);
            data = data.filter((l) => new Date(l.tanggal).getMonth() + 1 === bulan);
        }

        if (filterTahun !== "all") {
            const tahun = parseInt(filterTahun);
            data = data.filter((l) => new Date(l.tanggal).getFullYear() === tahun);
        }

        setBaseFiltered(data);
    }, [allLogbook, filterStatus, filterBulan, filterTahun]);

    // Efek untuk pagination ketika tidak ada search
    useEffect(() => {
        if (search.trim() === "") {
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            setLogbook(baseFiltered.slice(startIndex, endIndex));
            setTotalPages(Math.ceil(baseFiltered.length / limit));
            setTotalItems(baseFiltered.length);
        }
    }, [baseFiltered, page, limit, search]);

    // Filter data logbook 
    const filteredLogbookSearch = Array.isArray(baseFiltered)
        ? baseFiltered.filter((u) =>
            [u.magang.siswa.nama, u.kegiatan, u.kendala]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : [];

    const filteredLogbook = Array.isArray(logbook) ? logbook : [];

    // Tentukan data tabel yang akan ditampilkan
    const isSearching = search.trim() !== "";

    const displayedLogbook = isSearching
        ? filteredLogbookSearch // tampilkan semua hasil saat search/filter
        : filteredLogbook;      // tampilkan per page biasa

    const currentPage = isSearching ? 1 : page;
    const totalPages = isSearching ? 1 : totalPage;
    const totalItems = isSearching ? displayedLogbook.length : total;

    const totalLogbook = allLogbook.length;
    const logbookNoVerified = allLogbook.filter(l => l.status_verifikasi === "pending").length;
    const logbookDisetujui = allLogbook.filter(l => l.status_verifikasi === "disetujui").length;
    const logbookDitolak = allLogbook.filter(l => l.status_verifikasi === "ditolak").length;

    // stats data
    const stats = [
        { title: "Total Logbook", value: totalLogbook, icon: BookOpen, color: "text-cyan-500", description: "Laporan harian terdaftar" },
        { title: "Belum Diverifikasi", value: logbookNoVerified, icon: Clock, color: "text-cyan-500", description: "Menunggu verifikasi" },
        { title: "Disetujui", value: logbookDisetujui, icon: ThumbsUp, color: "text-cyan-500", description: "Sudah diverifikasi" },
        { title: "Ditolak", value: logbookDitolak, icon: ThumbsDown, color: "text-cyan-500", description: "Perlu perbaikan" },
    ];

    if (loading) return <GuruLogbookSkeleton />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-2xl">Manajemen Jurnal Harian Magang</h2>
            </div>

            {/* 4 Card Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

            <Card className="shadow-md border">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <FileText className="text-cyan-500" size={22} />
                        <CardTitle className="flex items-center gap-2">Daftar Logbook Siswa</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search + Filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                        <div className="relative w-full sm:w-130">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Cari siswa, kegiatan, atau kendala..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilter(!showFilter)}
                            className="flex items-center gap-2 w-full sm:w-fit justify-center"
                        >
                            <Filter size={16} />
                            {showFilter ? 'Sembunyikan' : 'Tampilkan'} Filter
                            <ChevronUp size={16} className={`transition-transform ${showFilter ? '' : 'rotate-180'}`} />
                        </Button>

                        <div className="flex flex-row items-center gap-2 justify-center sm:justify-start">
                            <span className="text-xs sm:text-sm text-gray-600">Tampilkan:</span>
                            <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                                <SelectTrigger className="w-[70px] sm:w-[80px] text-sm">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5" className="text-sm">5</SelectItem>
                                    <SelectItem value="10" className="text-sm">10</SelectItem>
                                    <SelectItem value="20" className="text-sm">20</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs sm:text-sm text-gray-600">per halaman</span>
                        </div>
                    </div>

                    {/* Filter Options */}
                    {showFilter && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f8fafc] border px-4 py-4 my-3 rounded-lg">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="bg-white shadow-none text-sm">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-sm">Semua Status</SelectItem>
                                        <SelectItem value="pending" className="text-sm">Belum Diverifikasi</SelectItem>
                                        <SelectItem value="disetujui" className="text-sm">Disetujui</SelectItem>
                                        <SelectItem value="ditolak" className="text-sm">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">Bulan</label>
                                <Select value={filterBulan} onValueChange={setFilterBulan}>
                                    <SelectTrigger className="bg-white shadow-none text-sm">
                                        <SelectValue placeholder="Semua Bulan" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60 overflow-y-auto">
                                        <SelectItem value="all" className="text-sm">Semua Bulan</SelectItem>
                                        <SelectItem value="1" className="text-sm">Januari</SelectItem>
                                        <SelectItem value="2" className="text-sm">Februari</SelectItem>
                                        <SelectItem value="3" className="text-sm">Maret</SelectItem>
                                        <SelectItem value="4" className="text-sm">April</SelectItem>
                                        <SelectItem value="5" className="text-sm">Mei</SelectItem>
                                        <SelectItem value="6" className="text-sm">Juni</SelectItem>
                                        <SelectItem value="7" className="text-sm">Juli</SelectItem>
                                        <SelectItem value="8" className="text-sm">Agustus</SelectItem>
                                        <SelectItem value="9" className="text-sm">September</SelectItem>
                                        <SelectItem value="10" className="text-sm">Oktober</SelectItem>
                                        <SelectItem value="11" className="text-sm">November</SelectItem>
                                        <SelectItem value="12" className="text-sm">Desember</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">Tahun</label>
                                <Select value={filterTahun} onValueChange={setFilterTahun}>
                                    <SelectTrigger className="bg-white shadow-none text-sm">
                                        <SelectValue placeholder="Semua Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-sm">Semua Tahun</SelectItem>
                                        <SelectItem value="2024" className="text-sm">2024</SelectItem>
                                        <SelectItem value="2025" className="text-sm">2025</SelectItem>
                                        <SelectItem value="2026" className="text-sm">2026</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-start sm:col-span-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setFilterStatus('all');
                                        setFilterBulan('all');
                                        setFilterTahun('all');
                                    }}
                                    className="text-gray-600 hover:text-gray-800 cursor-pointer shadow-none text-sm"
                                >
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full border-collapse text-sm" style={{ minWidth: "1200px" }}>
                            <thead>
                                <tr className="text-left bg-white">
                                    <th className="px-4 py-3 font-semibold text-sm w-[200px] min-w-[200px]">Siswa & Tanggal</th>
                                    <th className="px-4 py-3 font-semibold text-sm w-[400px] min-w-[400px]">Kegiatan & Kendala</th>
                                    <th className="px-4 py-3 font-semibold text-sm text-center w-[150px] min-w-[150px]">Status</th>
                                    <th className="px-4 py-3 font-semibold text-sm w-[250px] min-w-[250px]">Catatan Guru</th>
                                    <th className="px-4 py-3 text-center font-semibold text-sm w-[100px] min-w-[100px]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedLogbook.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada data Logbook yang ditemukan
                                        </td>
                                    </tr>
                                ) : displayedLogbook.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="border-t hover:bg-gray-50 transition"
                                    >
                                        {/* Siswa & Tanggal */}
                                        <td className="px-4 py-4 w-[200px] min-w-[200px]">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-semibold text-sm">{u.magang.siswa.nama || "Tanpa nama"}</p>
                                                <span className="flex flex-col gap-1 text-gray-500 text-xs">
                                                    <p>NIS: {u.magang.siswa.nis || "-"}</p>
                                                    <p>{u.magang.siswa.kelas || "Tanpa kelas"}</p>
                                                    {u.tanggal && (
                                                        <>
                                                            <p className="text-xs text-gray-600">{format(parseISO(u.tanggal as any), "d MMM yyyy", { locale: localeId })}</p>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Kegiatan & Kendala */}
                                        <td className="px-4 py-4 w-[400px] min-w-[400px]">
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <h1 className="font-semibold text-sm">Kegiatan:</h1>
                                                    <p className="text-gray-800 text-xs">{truncateText(u.kegiatan, 200)}</p>
                                                </div>
                                                <div>
                                                    <h1 className="font-semibold text-sm">Kendala:</h1>
                                                    <p className="text-gray-800 text-xs">{truncateText(u.kendala, 200)}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status Verifikasi */}
                                        <td className="px-4 py-4 w-[150px] min-w-[150px] text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium 
                                                ${u.status_verifikasi === "pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-300" :
                                                    u.status_verifikasi === "disetujui" ? "bg-green-100 text-green-800 border border-green-300" :
                                                        u.status_verifikasi === "ditolak" ? "bg-red-100 text-red-800 border border-red-300" :
                                                            "bg-gray-100 text-gray-800 border border-gray-300"}`}>

                                                {u.status_verifikasi === "pending" && <span>Belum Diverifikasi</span>}
                                                {u.status_verifikasi === "disetujui" && <span>Disetujui</span>}
                                                {u.status_verifikasi === "ditolak" && <span>Ditolak</span>}
                                            </span>
                                        </td>

                                        {/* Catatan Guru */}
                                        <td className="px-4 py-4 w-[250px] min-w-[250px]">
                                            <span
                                                className={`inline-flex items-center py-1 rounded-sm w-full
                                                ${u.catatan_guru && u.catatan_guru.trim() !== "" ? "bg-gray-100 text-gray-600 border border-gray-300 font-normal px-2"
                                                        : "font-semibold text-gray-400"}`}
                                            >
                                                {u.catatan_guru && u.catatan_guru.trim() !== "" ? (
                                                    <span className="text-[13px] truncate">{u.catatan_guru}</span>
                                                ) : (
                                                    <span className="text-[13px]">Belum ada catatan</span>
                                                )}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 w-[100px] min-w-[100px] text-center">
                                            <button onClick={() => handleOpenDetail(u.id)} className="p-2 rounded text-gray-600 hover:text-cyan-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.8)] cursor-pointer">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Detail form */}
                        <Dialog open={openDetail} onOpenChange={setOpenDetail}>

                            <DialogTrigger asChild>

                            </DialogTrigger>
                            <DialogContent
                                className="w-[95vw] max-w-[95vw] sm:w-[800px] sm:max-w-3xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden rounded-lg flex flex-col"
                                onInteractOutside={(e) => e.preventDefault()}
                                onEscapeKeyDown={(e) => e.preventDefault()}
                            >
                                <form>
                                    <DialogHeader className="flex flex-row gap-3 items-center">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-r from-cyan-500 to-sky-600">
                                            <FileText size={22} className="text-white" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <DialogTitle>Detail Jurnal Harian</DialogTitle>
                                            <DialogDescription>
                                                {dataDate.tanggal || "-"}
                                            </DialogDescription>
                                        </div>
                                    </DialogHeader>

                                    {/* Garis full width */}
                                    <div className="w-full border-t mt-2 border-gray-200" />

                                    {/* Form */}


                                    <div className="flex-1 overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(95vh-200px)] py-3 px-2 gap-2">
                                        {/* Siswa */}
                                        <div className="py-3 px-3 gap-2 mt-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex flex-row gap-2 items-center">
                                                    <User size={18} className="text-cyan-600" />
                                                    <p className="font-medium">Informasi Siswa</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row px-1 gap-4">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex flex-row gap-3">
                                                            <div className="inline-flex w-10 h-10 items-center justify-center rounded-md text-white bg-gradient-to-r from-cyan-500 to-sky-600">
                                                                <User size={19} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm sm:text-[14px] font-medium">{logbookbyId?.magang.siswa.nama}</p>
                                                                <div className="flex flex-row items-center gap-0.5 text-gray-600">
                                                                    <IdCard size={14} />
                                                                    <p className="text-xs sm:text-[12px]">NIS: {logbookbyId?.magang.siswa.nis || "-"}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row gap-1 text-gray-600">
                                                            <GraduationCap size={15} />
                                                            <p className="text-xs sm:text-[12px]">{logbookbyId?.magang.siswa.kelas || "Tanpa Kelas"}</p>
                                                        </div>
                                                        <div className="flex flex-row gap-1">
                                                            <p className="text-xs sm:text-[12px] font-semibold">Jurusan: </p>
                                                            <p className="text-xs sm:text-[12px] text-gray-600">{logbookbyId?.magang.siswa.jurusan || "Tanpa jurusan"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 sm:ml-25">
                                                        <div className="flex flex-row items-center gap-1 text-gray-700">
                                                            <Building2 size={15} />
                                                            <p className="text-xs sm:text-[12px] font-medium">Tempat Magang</p>
                                                        </div>
                                                        <p className="text-sm sm:text-[14px] font-medium">{logbookbyId?.magang.dudi.nama_perusahaan}</p>
                                                        <p className="text-xs sm:text-[12px] text-gray-600">{logbookbyId?.magang.dudi.alamat}</p>
                                                        <div className="flex flex-row gap-1">
                                                            <p className="text-xs sm:text-[12px] font-semibold">PIC: </p>
                                                            <p className="text-xs sm:text-[12px] text-gray-600">{logbookbyId?.magang.dudi.penanggung_jawab}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Kegiatan */}
                                        <div className="grid grid-cols-1 gap-2 mt-5">
                                            <div className="flex flex-row gap-2 items-center">
                                                <FileText size={18} className="text-blue-600" />
                                                <p className="font-semibold">Kegiatan</p>
                                            </div>
                                            <div className="bg-blue-50 px-3 py-3 rounded-md border border-blue-300">
                                                <p className="text-sm text-gray-600 whitespace-pre-line break-words">{logbookbyId?.kegiatan}</p>
                                            </div>
                                        </div>

                                        {/* Kendala yang dihadapi */}
                                        <div className="grid grid-cols-1 gap-2 mt-5">
                                            <div className="flex flex-row gap-2 items-center">
                                                <CircleAlert size={18} className="text-yellow-600" />
                                                <p className="font-semibold">Kendala yang dihadapi</p>
                                            </div>
                                            <div className="bg-yellow-50 px-3 py-3 rounded-md border border-yellow-300">
                                                <p className="text-sm text-gray-600 whitespace-pre-line break-words">{logbookbyId?.kendala}</p>
                                            </div>
                                        </div>

                                        {/* Dokumentasi */}
                                        <div className="grid grid-cols-1 gap-2 mt-5">
                                            <div className="flex flex-row gap-2 items-center">
                                                <File size={18} className="text-green-600" />
                                                <p className="font-semibold">Dokumentasi</p>
                                            </div>

                                            <div className={`flex flex-row justify-between items-center bg-green-50 px-4 rounded-md border border-green-300 ${logbookbyId?.file ? "py-4" : "py-6"}`}>
                                                {logbookbyId?.file ? (
                                                    <>
                                                        <div className="flex flex-row gap-2 items-center">
                                                            <File size={20} className="text-green-600 flex-shrink-0" />
                                                            <p className="text-[13px] mt-1 text-gray-600 whitespace-pre-line break-words">
                                                                {logbookbyId.file.split("/").pop()}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleDownloadFile(logbookbyId.file)}
                                                            className="bg-green-600 w-23 h-8 font-normal rounded-lg transition-all hover:bg-green-800 cursor-pointer"
                                                        >
                                                            <Download size={12} /> Unduh
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <p className="text-gray-600 text-sm text-center w-full">
                                                        Belum ada file yang diunggah
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Garis full width */}
                                        <div className="w-full border-t mt-5 border-gray-200" />

                                        {/* Catatan Guru */}
                                        <div className="grid grid-cols-1 gap-4 mt-8">
                                            <div className="flex flex-row gap-2 items-center justify-between">
                                                <div className="flex flex-row gap-2 items-center">
                                                    <MessageSquare size={18} className="text-purple-600" />
                                                    <p className="font-semibold">Catatan Guru</p>
                                                </div>
                                                <div>
                                                    <div>
                                                        {!isEditingNote ? (
                                                            <Button
                                                                type="button"
                                                                onClick={() => setIsEditingNote(true)}
                                                                className="bg-blue-600 w-18 h-8 rounded-lg transition-all hover:bg-blue-800 cursor-pointer"
                                                            >
                                                                <PenLine size={12} /> Edit
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                onClick={() => {
                                                                    handleSaveNote();
                                                                }}
                                                                className="bg-green-600 w-25 h-8 rounded-lg transition-all hover:bg-green-800 cursor-pointer"
                                                            >
                                                                {loadingSaveNote ? (
                                                                    "Loading..."
                                                                ) : (
                                                                    <>
                                                                        <Save size={12} /> Simpan
                                                                    </>
                                                                )}

                                                            </Button>
                                                        )}
                                                    </div>

                                                </div>
                                            </div>
                                            {/* Catatan Guru Input */}
                                            <div className="relative grid gap-2 mb-3">
                                                <Textarea
                                                    name="catatan_guru"
                                                    value={formEditData.catatan_guru || ""}
                                                    onChange={handleChange}
                                                    placeholder={`${isEditingNote ? "Masukkan catatan guru" : ""}`}
                                                    className={`border-2 h-30 border-gray-300 text-sm ${!isEditingNote && "bg-gray-100 cursor-not-allowed border-dashed"
                                                        }`}
                                                    disabled={!isEditingNote}
                                                />

                                                {/* Overlay text kalau kosong */}
                                                {!isEditingNote && (!formEditData.catatan_guru || formEditData.catatan_guru.trim() === "") && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                                                        Belum ada catatan dari guru
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Setujui dan Tolak */}
                                        {logbookbyId?.status_verifikasi === "pending" ? (
                                            <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-2 mt-3 bg-white bottom-0 mb-3">
                                                <Button
                                                    type="button"
                                                    onClick={handleApprove}
                                                    className="bg-green-600 w-full sm:w-24 cursor-pointer hover:bg-green-700 text-center"
                                                >
                                                    {loadingApprove ? (
                                                        "Loading..."
                                                    ) : (
                                                        <>
                                                            <Check size={12} /> Setujui
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={handleReject}
                                                    className="bg-red-600 w-full sm:w-24 cursor-pointer hover:bg-red-700 text-center"
                                                >
                                                    {loadingReject ? (
                                                        "Loading..."
                                                    ) : (
                                                        <>
                                                            <X size={12} /> Tolak
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        ) :
                                            <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-2 mt-3 bg-white bottom-0 mb-3">
                                                <Button
                                                    type="button"
                                                    onClick={handleChangePending}
                                                    className="bg-yellow-600 w-full sm:w-45 cursor-pointer hover:bg-yellow-700"
                                                >
                                                    {loadingAction ? (
                                                        "Loading..."
                                                    ) : (
                                                        <>
                                                            <RefreshCcw size={12} /> Ubah ke Pending
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        }

                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between pt-4 border-t bg-white bottom-0 gap-2">
                                        <div className="flex justify-between sm:flex-row gap-2 text-xs sm:text-[14px] items-center text-gray-600">
                                            <p>Dibuat: {dataDate.created_at}</p>
                                            <p className="hidden sm:block">|</p>
                                            <p>Diperbarui: {dataDate.updated_at}</p>
                                        </div>
                                        <DialogClose asChild>
                                            <Button variant="outline" className="w-full sm:w-50 cursor-pointer">Batal</Button>
                                        </DialogClose>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
                <CardFooter className="px-6 flex flex-col gap-4">
                    {/* Garis full width */}
                    <div className="w-full border-t border-gray-200" />

                    {/* Konten bawah garis */}
                    <div className="flex flex-col sm:flex-row items-center py-2 w-full gap-4">
                        {/* Text kiri */}
                        <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                            Menampilkan {((page - 1) * limit) + 1} sampai {Math.min(page * limit, total)} dari {total} entri
                        </p>

                        {/* Pagination di kanan */}
                        <div className="mx-auto sm:mx-0 sm:ml-auto">
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
                </CardFooter>
            </Card>
        </div>
    )
}