"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CircleCheckBig, Building2, CircleX, User, Plus, Search, MapPin, Mail, Phone, Trash2, SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DudiLoadingSkeleton from "@/components/loading/admin/loading-dudi";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Textarea } from "@/components/ui/textarea";
import Cookies from "js-cookie";

interface DUDIType {
    id: number;
    nama_perusahaan: string;
    guru_id: number,
    guru: {
        id: number
        nama: string,
        nip: string,
    }
    tentang_perusahaan: string,
    bidang_usaha: string,
    alamat: string;
    telepon: string;
    email: string;
    penanggung_jawab: string;
    kouta_magang: number;
    status: "pending" | "aktif" | "nonaktif";
}

export default function AdminDudiPage() {
    const [dudi, setDUDI] = useState<DUDIType[]>([]);
    const [allDUDI, setAllDUDI] = useState<DUDIType[]>([]);
    const [isClicked, setIsClicked] = useState(false);
    const [statsData, setStatsData] = useState({ total: 0, aktif: 0, nonaktif: 0 })
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPage, setTotalPages] = useState(1);
    const [total, setTotalItems] = useState(0);
    const [openTambah, setOpenTambah] = useState(false);
    const [formTambahData, setFormTambahData] = useState({
        nama_perusahaan: "",
        tentang_perusahaan: "",
        bidang_usaha: "",
        alamat: "",
        telepon: "",
        email: "",
        penanggung_jawab: "",
        guru_id: "",
        kouta_magang: 0,
        status: "pending"
    });
    const [formEditData, setFormEditData] = useState({
        nama_perusahaan: "",
        tentang_perusahaan: "",
        bidang_usaha: "",
        alamat: "",
        telepon: "",
        email: "",
        penanggung_jawab: "",
        guru_id: "",
        kouta_magang: 0,
        status: "pending"
    });
    const [loading, setLoading] = useState(true);
    const [editingDUDIId, setEditingDUDIId] = useState<number | null>(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [magangAll, setMagangAll] = useState<any[]>([]);
    const [totalMagangAktif, setTotalMagangAktif] = useState(0);
    const [guruList, setGuruList] = useState<{
        user_id: number;
        id: number,
        nama: string
    }[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormTambahData((prev) => ({ ...prev, [name]: value }));
        setFormEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value: string) => {
        setFormTambahData((prev) => ({ ...prev, status: value }));
        setFormEditData((prev) => ({ ...prev, status: value }));
    };

    const handleBidangUsahaChange = (value: string) => {
        setFormTambahData((prev) => ({ ...prev, bidang_usaha: value }));
        setFormEditData((prev) => ({ ...prev, bidang_usaha: value }));
    };

    // Handler untuk select guru
    const handleGuruChange = (val: string) => {
        setFormTambahData(prev => ({ ...prev, guru_id: val }));
        setFormEditData(prev => ({ ...prev, guru_id: val }));
    };

    function getTokenFromCookie() {
        return Cookies.get("token") || "";
    }

    async function fetchOptions(editingId?: number) {
        try {
            const token = getTokenFromCookie();

            const [guruRes] = await Promise.all([
                fetch("/api/guru", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }).then(r => r.json()),
            ]);

            const allGuru = guruRes.data || [];

            // Set ke state
            setGuruList(allGuru);
        } catch (err) {
            console.error("Gagal fetch data opsi:", err);
        }
    }

    // Untuk menangani submit form - tambah dudi
    const handleSubmitTambahDUDI = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = getTokenFromCookie();

            const res = await fetch("/api/admin/dudi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nama_perusahaan: formTambahData.nama_perusahaan,
                    tentang_perusahaan: formTambahData.tentang_perusahaan,
                    bidang_usaha: formTambahData.bidang_usaha,
                    alamat: formTambahData.alamat,
                    telepon: formTambahData.telepon,
                    email: formTambahData.email,
                    penanggung_jawab: formTambahData.penanggung_jawab,
                    guru_id: Number(formTambahData.guru_id),
                    kouta_magang: formTambahData.kouta_magang,
                    status: formTambahData.status,
                }),
            });

            if (!res.ok) {
                toast.error("Gagal menambah dudi");
                return;
            }

            toast.success("Berhasil menambah dudi");

            const res_get = await fetch("/api/admin/dudi", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const result = await res_get.json();
            const newDUDI = result.data;

            console.log("New dudi response:", newDUDI);
            // update daftar dudi
            fetchDUDI();
            fetchDUDISearch();

            setTotalPages(result.totalPages);
            setTotalItems(result.total);
            setStatsData({ total: result.total, aktif: result.aktif, nonaktif: result.nonaktif })

            // reset form
            setFormTambahData({
                nama_perusahaan: "",
                tentang_perusahaan: "",
                bidang_usaha: "",
                alamat: "",
                telepon: "",
                email: "",
                penanggung_jawab: "",
                guru_id: "",
                kouta_magang: 0,
                status: "pending"
            });

            setOpenTambah(false); // tutup dialog form jika berhasil menambahkan dudi
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menambah dudi");
        }
    };

    // ambil data untuk form edit dudi
    const handleOpenEdit = async (id: number) => {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/dudi/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Gagal mengambil data dudi");

            setFormEditData({
                nama_perusahaan: data.data.nama_perusahaan,
                tentang_perusahaan: data.data.tentang_perusahaan,
                bidang_usaha: data.data.bidang_usaha,
                alamat: data.data.alamat,
                telepon: data.data.telepon,
                email: data.data.email,
                penanggung_jawab: data.data.penanggung_jawab,
                guru_id: String(data.data.guru_id),
                kouta_magang: data.data.kouta_magang,
                status: data.data.status,
            });

            setEditingDUDIId(id);
            setOpenEdit(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data dudi");
        }
    };

    // untuk menangani edit dudi
    const handleSubmitEditDUDI = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/dudi/${editingDUDIId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nama_perusahaan: formEditData.nama_perusahaan,
                    alamat: formEditData.alamat,
                    telepon: formEditData.telepon,
                    email: formEditData.email,
                    penanggung_jawab: formEditData.penanggung_jawab,
                    kouta_magang: formEditData.kouta_magang,
                    guru_id: Number(formEditData.guru_id),
                    status: formEditData.status,
                }),
            });

            if (!res.ok) {
                toast.error("Gagal memperbarui dudi");
                return;
            }

            toast.success("Berhasil memperbarui dudi");

            const res_get = await fetch("/api/admin/dudi", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const result = await res_get.json();

            console.log("New dudi response:", result.data);
            // update daftar dudi
            fetchDUDI();
            fetchDUDISearch();

            setStatsData({ total: result.total, aktif: result.aktif, nonaktif: result.nonaktif })

            // reset form dudi
            setFormEditData({
                nama_perusahaan: "",
                tentang_perusahaan: "",
                bidang_usaha: "",
                alamat: "",
                telepon: "",
                email: "",
                penanggung_jawab: "",
                guru_id: "",
                kouta_magang: 0,
                status: "pending"
            });

            setOpenEdit(false); // tutup dialog form jika berhasil menambahkan dudi
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat memperbarui dudi");
        }
    };

    // untuk menangani hapus dudi
    async function handleDeleteDUDI(id: number) {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/dudi/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const result_delete = await res.json()

            if (!res.ok) {
                toast.error(result_delete.message || "Gagal menghapus dudi");
                return;
            }

            // Refresh data dudi
            const res_get = await fetch("/api/admin/dudi", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const result = await res_get.json();
            // update list data dudi
            fetchDUDI();
            fetchDUDISearch();

            setTotalPages(result.totalPages);
            setTotalItems(result.total);

            toast.success("DUDI berhasil dihapus");
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan server");
        }
    }

    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 150); // durasi animasi
    };

    async function fetchDUDI() {
        try {
            if (loading) {
                setLoading(true);
            }

            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/dudi?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();
            console.log(data);

            setStatsData(data);
            setDUDI(data.data || []);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (err) {
            console.error("Failed to fetch dudi:", err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchDUDISearch() {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/dudi?page=1&limit=9999`, {
                cache: "no-store",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!res.ok) throw new Error("Gagal mengambil data dudi (search)");

            const data = await res.json();
            const allDUDI: DUDIType[] = data?.data || [];

            setAllDUDI(allDUDI);
        } catch (err) {
            console.error("Gagal ambil data dudi search:", err);
        }
    }

    async function fetchMagangAll() {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/magang?limit=9999`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }); // ambil semua data
            const data = await res.json();
            if (res.ok) {
                const allMagang = data.data || [];
                setMagangAll(allMagang);

                // hitung siswa magang aktif
                const aktifCount = allMagang.filter((m: any) => m.status === "berlangsung").length;
                setTotalMagangAktif(aktifCount);
            }
        } catch (err) {
            console.error("Gagal ambil semua data magang:", err);
        }
    }

    useEffect(() => {
        fetchOptions();
        fetchMagangAll();
        fetchDUDI();
        fetchDUDISearch();
    }, [page, limit]);

    const filteredDUDISearch = Array.isArray(allDUDI)
        ? allDUDI.filter((u) =>
            [u.nama_perusahaan, u.alamat, u.penanggung_jawab]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : [];

    const filteredDUDI = Array.isArray(dudi) ? dudi : [];

    // Tentukan data tabel yang akan ditampilkan
    const isSearching = search.trim() !== "";

    const displayedDUDI = isSearching
        ? filteredDUDISearch // tampilkan semua hasil saat search/filter
        : filteredDUDI;      // tampilkan per page biasa

    const currentPage = isSearching ? 1 : page;
    const totalPages = isSearching ? 1 : totalPage;
    const totalItems = isSearching ? displayedDUDI.length : total;

    // dummy data
    const stats = [
        { title: "Total DUDI", value: statsData.total, icon: Building2, color: "text-cyan-500", description: "Perusahaan mitra" },
        { title: "DUDI Aktif", value: statsData.aktif, icon: CircleCheckBig, color: "text-green-500", description: "Perusahaan aktif" },
        { title: "DUDI Tidak Aktif", value: statsData.nonaktif, icon: CircleX, color: "text-red-500", description: "Perusahaan tidak aktif" },
        { title: "Total Siswa Magang", value: totalMagangAktif, icon: User, color: "text-cyan-500", description: "Siswa magang aktif" },
    ];

    if (loading) return <DudiLoadingSkeleton />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-bold text-xl sm:text-2xl">Manajemen DUDI</h2>
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
                            <p className="text-xl sm:text-2xl font-bold group-hover:-translate-y-2 transition-all duration-300 ease-in-out">{item.value}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{item.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-md border w-full overflow-x-auto">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <Building2 className="text-cyan-500" size={22} />
                        <CardTitle className="flex items-center gap-2">Daftar DUDI</CardTitle>
                    </div>
                    <Dialog open={openTambah} onOpenChange={setOpenTambah}>
                        <form>
                            <DialogTrigger asChild>
                                <Button onClick={handleClick} className="bg-gradient-to-r from-cyan-500 to-sky-600 h-10 rounded-lg text-white flex gap-2 items-center justify-center
                                        cursor-pointer hover:from-cyan-600 hover:to-sky-700"
                                >
                                    <Plus size={20} /> Tambah DUDI
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[600px] sm:max-w-2xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden rounded-lg flex flex-col">
                                {/* Form */}
                                <form onSubmit={handleSubmitTambahDUDI} className="flex flex-col h-full">
                                    <DialogHeader>
                                        <DialogTitle>Tambah DUDI Baru</DialogTitle>
                                        <DialogDescription>
                                            Lengkapi semua informasi yang diperlukan
                                        </DialogDescription>
                                    </DialogHeader>
                                    {/* Garis full width */}
                                    <div className="w-full border-t mt-2 border-gray-200" />

                                    <div className="flex flex-col gap-4 sm:gap-6 overflow-y-auto px-1 max-h-[calc(70vh-180px)] sm:max-h-[calc(95vh-200px)]">

                                        {/* Nama Perusahaan */}
                                        <div className="grid gap-2 mt-3">
                                            <label className="text-sm font-medium">Nama Perusahaan <span className="text-red-500">*</span></label>
                                            <Input name="nama_perusahaan" type="text" value={formTambahData.nama_perusahaan} onChange={handleChange} placeholder="Masukkan nama perusahaan" className="text-sm" required />
                                        </div>

                                        {/* Tentang Perusahaan */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Tentang Perusahaan <span className="text-red-500">*</span></label>
                                            <Textarea
                                                name="tentang_perusahaan"
                                                value={formTambahData.tentang_perusahaan}
                                                onChange={handleChange}
                                                placeholder="Masukkan tentang perusahaan"
                                                className="h-15 text-sm"
                                                required />
                                        </div>

                                        {/* Bidang Usaha */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Bidang Usaha <span className="text-red-500">*</span></label>
                                            <Select value={formTambahData.bidang_usaha} onValueChange={handleBidangUsahaChange} >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih bidang usaha" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 overflow-y-auto">
                                                    <SelectItem value="Teknologi Informasi">Teknologi Informasi</SelectItem>
                                                    <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                                    <SelectItem value="Software Development">Software Development</SelectItem>
                                                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                                                    <SelectItem value="Konsultan IT">Konsultan IT</SelectItem>
                                                    <SelectItem value="Hardware & Networking">Hardware & Networking</SelectItem>
                                                    <SelectItem value="Perbankan & Keuangan">Perbankan & Keuangan</SelectItem>
                                                    <SelectItem value="Akuntansi">Akuntansi</SelectItem>
                                                    <SelectItem value="Multimedia">Multimedia</SelectItem>
                                                    <SelectItem value="Perhotelan">Perhotelan</SelectItem>
                                                    <SelectItem value="Farmasi">Farmasi</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Alamat */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Alamat <span className="text-red-500">*</span></label>
                                            <Input name="alamat" type="text" value={formTambahData.alamat} onChange={handleChange} placeholder="Masukkan alamat lengkap" className="text-sm" required />
                                        </div>

                                        {/* Telepon */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Telepon <span className="text-red-500">*</span></label>
                                            <Input name="telepon" type="text" value={formTambahData.telepon} onChange={handleChange} placeholder="Contoh: 021-12345678" className="text-sm" required />
                                        </div>

                                        {/* Email */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                            <Input type="email" value={formTambahData.email} onChange={handleChange} name="email" placeholder="Contoh: info@perusahaan.com" className="text-sm" />
                                        </div>

                                        {/* Penanggung Jawab */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Penanggung Jawab <span className="text-red-500">*</span></label>
                                            <Input name="penanggung_jawab" type="text" value={formTambahData.penanggung_jawab} onChange={handleChange} placeholder="Nama penanggung jawab" className="text-sm" required />
                                        </div>

                                        {/* Guru Pembimbing */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-small">Guru Pembimbing</label>
                                            <Select name="guru_id" value={formTambahData.guru_id} onValueChange={handleGuruChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Guru Pembimbing" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 overflow-y-auto">
                                                    {guruList.map(g => (
                                                        <SelectItem key={g.id} value={String(g.id)}>
                                                            {g.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Kouta Magang */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Kouta Magang <span className="text-red-500">*</span></label>
                                            <Input name="kouta_magang" type="number" value={formTambahData.kouta_magang} onChange={handleChange} placeholder="Masukkan kouta magang" className="text-sm" required />
                                        </div>

                                        {/* Status DUDI */}
                                        <div className="grid gap-2 mb-6">
                                            <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                                            <Select value={formTambahData.status} onValueChange={handleStatusChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Menunggu</SelectItem>
                                                    <SelectItem value="aktif">Aktif</SelectItem>
                                                    <SelectItem value="nonaktif">Tidak Aktif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="w-full border-t border-gray-200" />

                                    {/* Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 flex-shrink-0">
                                        <DialogClose asChild>
                                            <Button variant="outline" className="w-full sm:w-50 cursor-pointer order-2 sm:order-1">Batal</Button>
                                        </DialogClose>
                                        <Button className="w-full sm:w-50 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 cursor-pointer order-1 sm:order-2">Simpan</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </form>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {/* Search + Filter */}
                    <div className="flex flex-col sm:justify-between sm:flex-row gap-4 mb-4 w-full">
                        <div className="relative w-full sm:w-[600px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Cari perusahaan, alamat, penanggung jawab..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl placeholder:text-gray-400 text-sm"
                            />
                        </div>
                        <div className="flex flex-row items-center gap-2 justify-center sm:justify-start">
                            <span className="text-xs sm:text-sm text-gray-600">Tampilkan:</span>
                            <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                                <SelectTrigger className="w-[70px] sm:w-[80px] text-sm">
                                    <SelectValue placeholder="5" />
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

                    {/* Table */}
                    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto w-full" style={{ minWidth: '100%' }}>
                            <table className="min-w-[800px] w-full border-collapse text-sm sm:text-[15px]">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-3 py-2 text-start font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Perusahaan</th>
                                        <th className="px-3 py-2 text-start font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Kontak</th>
                                        <th className="px-3 py-2 text-start font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Penanggung Jawab</th>
                                        <th className="px-3 py-2 text-start font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Guru Pembimbing</th>
                                        <th className="px-3 py-2 text-center font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Status</th>
                                        <th className="px-3 py-2 text-center font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Siswa Magang</th>
                                        <th className="px-3 py-2 text-center font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedDUDI.map((u) => {
                                        const terisi = magangAll.filter(
                                            (m) => m.dudi_id === u.id && m.status === "berlangsung"
                                        ).length;

                                        return (
                                            <tr
                                                key={u.id}
                                                className="border-t hover:bg-gray-50 transition"
                                            >
                                                {/* Perusahaan */}
                                                <td className="px-3 py-3 align-top min-w-[200px] sm:min-w-[200px]">
                                                    <div className="flex flex-row gap-2 sm:gap-3 items-center">
                                                        <div className="inline-flex self-center bg-gradient-to-r from-cyan-500 to-sky-600 px-2 py-2 sm:px-3 sm:py-3 rounded-lg shadow-sm flex-shrink-0">
                                                            <Building2 className="text-white" size={16} />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 min-w-0">
                                                            <p className="font-medium font-semibold text-xs sm:text-sm">{u.nama_perusahaan ?? "Tanpa Nama"}</p>
                                                            <div className="flex flex-row items-center gap-1 text-gray-500">
                                                                <MapPin size={10} className="flex-shrink-0" />
                                                                <p className="font-small text-[10px] sm:text-[12px] w-60">{u.alamat ?? "Tanpa Alamat"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Kontak */}
                                                <td className="px-3 py-3 min-w-[150px] sm:min-w-[180px]">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex flex-row items-center gap-2 text-gray-500">
                                                            <Mail size={10} />
                                                            <p className="font-small text-[10px] sm:text-[12px]">{u.email}</p>
                                                        </div>
                                                        <div className="flex flex-row items-center gap-2 text-gray-500">
                                                            <Phone size={10} />
                                                            <p className="font-small text-[10px] sm:text-[12px]">{u.telepon}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Penanggung Jawab */}
                                                <td className="px-3 py-3 text-xs sm:text-sm whitespace-nowrap min-w-[120px]">
                                                    <div className="flex flex-row items-center gap-2">
                                                        <div className="inline-flex p-1 rounded-full bg-gray-200">
                                                            <User className="text-black" size={12} />
                                                        </div>
                                                        <p className="font-medium text-[10px] sm:text-[12px]">{u.penanggung_jawab}</p>
                                                    </div>
                                                </td>

                                                {/* Guru Pembimbing */}
                                                <td className="px-4 py-4 w-[180px] min-w-[180px]">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="font-medium text-black text-sm">{u.guru.nama || "Tanpa nama"}</p>
                                                        <p className="text-xs text-gray-500">NIP: {u.guru.nip || "-"}</p>
                                                    </div>
                                                </td>

                                                {/* Status DUDI */}
                                                <td className="px-3 py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium 
                                                    ${u.status === "pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-300" :
                                                            u.status === "aktif" ? "bg-green-100 text-green-800 border border-green-300" :
                                                                u.status === "nonaktif" ? "bg-red-100 text-red-800 border border-red-300" :
                                                                    "bg-blue-100 text-blue-800 border border-blue-300"}`}>
                                                        {u.status === "pending" && <span>Menunggu</span>}
                                                        {u.status === "aktif" && <span>Aktif</span>}
                                                        {u.status === "nonaktif" && <span>Tidak Aktif</span>}
                                                    </span>
                                                </td>

                                                {/* Siswa Magang */}
                                                <td className="px-3 py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white font-medium bg-[#AEA500] shadow-sm">
                                                        {terisi}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                                                    <div className="flex gap-1 justify-center items-center">
                                                        <button className="p-2 rounded text-gray-600 hover:text-yellow-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(255,255,0,0.8)] cursor-pointer" onClick={() => handleOpenEdit(u.id)}>
                                                            <SquarePen size={14} />
                                                        </button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <button className="p-2 rounded text-gray-600 hover:text-red-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(255,0,0,0.8)] cursor-pointer">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="w-[90vw] sm:max-w-md rounded-lg">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Hapus DUDI?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Data dudi <b>{u.nama_perusahaan}</b> akan dihapus permanen dan tidak bisa dikembalikan.
                                                                        Apakah kamu yakin?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-600 hover:bg-red-700 cursor-pointer"
                                                                        onClick={() => handleDeleteDUDI(u.id)}>
                                                                        Ya, Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                        <DialogTrigger asChild>

                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[600px] sm:max-w-2xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden rounded-lg flex flex-col">
                            {/* Form */}
                            <form onSubmit={handleSubmitEditDUDI} className="flex flex-col h-full">
                                <DialogHeader>
                                    <DialogTitle>Edit DUDI</DialogTitle>
                                    <DialogDescription>
                                        Perbarui informasi DUDI
                                    </DialogDescription>
                                </DialogHeader>
                                {/* Garis full width */}
                                <div className="w-full border-t mt-2 border-gray-200" />

                                <div className="flex flex-col gap-4 sm:gap-6 overflow-y-auto px-1 max-h-[calc(70vh-180px)] sm:max-h-[calc(95vh-200px)]">

                                    {/* Nama Perusahaan */}
                                    <div className="grid gap-2 mt-4">
                                        <label className="text-sm font-medium">Nama Perusahaan <span className="text-red-500">*</span></label>
                                        <Input name="nama_perusahaan" type="text" value={formEditData.nama_perusahaan} onChange={handleChange} placeholder="Masukkan nama perusahaan" className="text-sm" required />
                                    </div>

                                    {/* Tentang Perusahaan */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Tentang Perusahaan <span className="text-red-500">*</span></label>
                                        <Textarea
                                            name="tentang_perusahaan"
                                            value={formEditData.tentang_perusahaan}
                                            onChange={handleChange}
                                            placeholder="Masukkan tentang perusahaan"
                                            className="h-25 text-sm"
                                            required />
                                    </div>

                                    {/* Bidang Usaha */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Bidang Usaha <span className="text-red-500">*</span></label>
                                        <Select value={formEditData.bidang_usaha} onValueChange={handleBidangUsahaChange} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih bidang usaha" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                <SelectItem value="Teknologi Informasi">Teknologi Informasi</SelectItem>
                                                <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                                <SelectItem value="Software Development">Software Development</SelectItem>
                                                <SelectItem value="E-commerce">E-commerce</SelectItem>
                                                <SelectItem value="Konsultan IT">Konsultan IT</SelectItem>
                                                <SelectItem value="Hardware & Networking">Hardware & Networking</SelectItem>
                                                <SelectItem value="Perbankan & Keuangan">Perbankan & Keuangan</SelectItem>
                                                <SelectItem value="Akuntansi">Akuntansi</SelectItem>
                                                <SelectItem value="Multimedia">Multimedia</SelectItem>
                                                <SelectItem value="Perhotelan">Perhotelan</SelectItem>
                                                <SelectItem value="Farmasi">Farmasi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Alamat */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Alamat <span className="text-red-500">*</span></label>
                                        <Input name="alamat" type="text" value={formEditData.alamat} onChange={handleChange} placeholder="Masukkan alamat lengkap" className="text-sm" required />
                                    </div>

                                    {/* Telepon */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Telepon <span className="text-red-500">*</span></label>
                                        <Input name="telepon" type="text" value={formEditData.telepon} onChange={handleChange} placeholder="Contoh: 021-12345678" className="text-sm" required />
                                    </div>

                                    {/* Email */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                        <Input type="email" value={formEditData.email} onChange={handleChange} name="email" placeholder="Contoh: info@perusahaan.com" className="text-sm" />
                                    </div>

                                    {/* Penanggung Jawab */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Penanggung Jawab <span className="text-red-500">*</span></label>
                                        <Input name="penanggung_jawab" type="text" value={formEditData.penanggung_jawab} onChange={handleChange} placeholder="Nama penanggung jawab" className="text-sm" required />
                                    </div>

                                    {/* Guru Pembimbing */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-small">Guru Pembimbing</label>
                                        <Select name="guru_id" value={formEditData.guru_id} onValueChange={handleGuruChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Guru Pembimbing" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                {guruList.map(g => (
                                                    <SelectItem key={g.id} value={String(g.id)}>
                                                        {g.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Kouta Magang */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Kouta Magang <span className="text-red-500">*</span></label>
                                        <Input name="kouta_magang" type="number" value={formEditData.kouta_magang} onChange={handleChange} placeholder="Masukkan kouta magang" className="text-sm" required />
                                    </div>

                                    {/* Status DUDI */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                                        <Select value={formEditData.status} onValueChange={handleStatusChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Menunggu</SelectItem>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                                <SelectItem value="nonaktif">Tidak Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Garis full width */}
                                <div className="w-full border-t mt-2 border-gray-200" />

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 flex-shrink-0">
                                    <DialogClose asChild>
                                        <Button variant="outline" className="w-full sm:w-50 cursor-pointer order-2 sm:order-1">Batal</Button>
                                    </DialogClose>
                                    <Button className="w-full sm:w-50 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 cursor-pointer order-1 sm:order-2">Simpan</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
                <CardFooter className="px-3 sm:px-6 flex flex-col gap-4">
                    <div className="w-full border-t border-gray-200" />

                    <div className="flex flex-col sm:flex-row items-center py-2 w-full gap-4">
                        <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                            Menampilkan {((page - 1) * limit) + 1} sampai {Math.min(page * limit, total)} dari {total} entri
                        </p>

                        <div className="ml-auto">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => !isSearching && setPage(page - 1)}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "text-xs"}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => {
                                        const pageNumber = i + 1;
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    isActive={currentPage === pageNumber}
                                                    onClick={() => !isSearching && setPage(pageNumber)}
                                                    className={`cursor-pointer text-xs ${currentPage === pageNumber
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
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "text-xs"}
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