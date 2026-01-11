"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, Plus, Search, Trash2, SquarePen, Users, GraduationCap, CheckCircle, Calendar } from "lucide-react";
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
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { format, differenceInDays, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import GuruMagangSkeleton from "@/components/loading/guru/loading_magang";

interface MagangType {
    id: number,
    siswa: { nama: string, nis: string, kelas: string, jurusan: string },
    guru: {
        id: number; nama: string, nip: string
    },
    dudi: { nama_perusahaan: string, alamat: string, penanggung_jawab: string },
    tanggal_mulai: Date,
    tanggal_selesai: Date,
    status: string,
    nilai_akhir?: number,
}

interface DecodedToken {
    id: number;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

export default function GuruMagangPage() {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [guruLoginId, setGuruLoginId] = useState<number | null>(null);
    const [magang, setMagang] = useState<MagangType[]>([]);
    const [allMagang, setAllMagang] = useState<MagangType[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPage, setTotalPages] = useState(1);
    const [total, setTotalItems] = useState(0);
    const [openTambah, setOpenTambah] = useState(false);
    const [formTambahData, setFormTambahData] = useState({
        siswa_id: "",
        dudi_id: "",
        guru_id: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        status: "pending",
    });
    const [formEditData, setFormEditData] = useState({
        siswa_id: "",
        dudi_id: "",
        guru_id: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        status: "pending",
        nilai_akhir: "",
    });
    const [loading, setLoading] = useState(true);
    const [editingMagangId, setEditingMagangId] = useState<number | null>(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [siswaList, setSiswaList] = useState<{
        id: number,
        nama: string
    }[]>([]);
    const [guruList, setGuruList] = useState<{
        user_id: number;
        id: number,
        nama: string
    }[]>([]);
    const [dudiList, setDudiList] = useState<{
        id: number,
        nama_perusahaan: string
    }[]>([]);
    const [optionsLoaded, setOptionsLoaded] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormTambahData((prev) => ({ ...prev, [name]: value }));
        setFormEditData((prev) => ({ ...prev, [name]: value }));
    };

    // Handler untuk select siswa
    const handleSiswaChange = (val: string) => {
        setFormTambahData(prev => ({ ...prev, siswa_id: val }));
    };
    // Handler untuk select guru
    const handleGuruChange = (val: string) => {
        setFormTambahData(prev => ({ ...prev, guru_id: val }));
    };
    // Handler untuk select dudi
    const handleDudiChange = (val: string) => {
        setFormTambahData(prev => ({ ...prev, dudi_id: val }));
    };

    const handleStatusChange = (value: string) => {
        setFormTambahData((prev) => ({ ...prev, status: value }));
        setFormEditData((prev) => ({ ...prev, status: value }));
    };

    function getTokenFromCookie() {
        return Cookies.get("token") || "";
    }

    // Untuk menangani submit form - tambah data magang
    const handleSubmitTambahMagang = async (e: React.FormEvent) => {
        e.preventDefault();

        // Konversi tanggal ke ISO string lengkap
        const tanggalMulaiISO = formTambahData.tanggal_mulai
            ? new Date(formTambahData.tanggal_mulai).toISOString()
            : "";
        const tanggalSelesaiISO = formTambahData.tanggal_selesai
            ? new Date(formTambahData.tanggal_selesai).toISOString()
            : "";

        try {
            const token = getTokenFromCookie();

            // Cek apakah DUDI sudah penuh
            const selectedDudi = dudiList.find(d => String(d.id) === formTambahData.dudi_id);
            if (!selectedDudi) {
                toast.error("DUDI tidak ditemukan!");
                return;
            }

            // Ambil data magang yang sudah menggunakan DUDI ini
            const resMagang = await fetch(`/api/magang?dudi_id=${selectedDudi.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const dataMagang = await resMagang.json();
            const jumlahTerdaftar = dataMagang.data?.length || 0;

            const resDudi = await fetch(`/api/dudi/${selectedDudi.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const dataDudi = await resDudi.json();
            const kuota = dataDudi.data?.kouta_magang || 0;

            // Jika sudah penuh, tampilkan notifikasi & hentikan proses
            if (jumlahTerdaftar >= kuota) {
                toast.error(`DUDI "${selectedDudi.nama_perusahaan}" telah penuh. Silakan pilih DUDI lain.`);
                return;
            }

            // Jika masih ada slot, lanjut POST
            const res = await fetch("/api/magang", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    siswa_id: Number(formTambahData.siswa_id),
                    guru_id: Number(formTambahData.guru_id),
                    dudi_id: Number(formTambahData.dudi_id),
                    tanggal_mulai: tanggalMulaiISO,
                    tanggal_selesai: tanggalSelesaiISO,
                    status: formTambahData.status,
                }),
            });

            if (!res.ok) {
                toast.error("Gagal menambah data magang");
                return;
            }

            toast.success("Berhasil menambah data magang");

            // reset tabel magang dan stats
            fetchAllMagangData();

            // reset form
            setFormTambahData({
                siswa_id: "",
                dudi_id: "",
                guru_id: "",
                tanggal_mulai: "",
                tanggal_selesai: "",
                status: "pending",
            });

            setOpenTambah(false); // tutup dialog form jika berhasil menambahkan data magang
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menambah data magang");
        }
    };

    // ambil data untuk form edit magang
    const handleOpenEdit = async (id: number) => {
        try {
            const token = getTokenFromCookie();

            setIsEditLoading(true); // tampilkan blur loading

            await fetchOptions(id);

            const res = await fetch(`/api/magang/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Gagal mengambil data magang");

            setFormEditData({
                siswa_id: String(data.data.siswa_id),
                dudi_id: String(data.data.dudi_id),
                guru_id: String(data.data.guru_id),
                tanggal_mulai: data.data.tanggal_mulai ? data.data.tanggal_mulai.split("T")[0] : "",
                tanggal_selesai: data.data.tanggal_selesai ? data.data.tanggal_selesai.split("T")[0] : "",
                status: data.data.status,
                nilai_akhir: data.data.nilai_akhir ? String(data.data.nilai_akhir) : "",
            });

            setEditingMagangId(id);
            setOpenEdit(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data magang");
        } finally {
            setIsEditLoading(false); // sembunyikan loading blur
        }
    };

    // untuk menangani edit data magang
    const handleSubmitEditMagang = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = getTokenFromCookie();

            // Konversi tanggal ke ISO string lengkap
            const tanggalMulaiISO = formEditData.tanggal_mulai
                ? new Date(formEditData.tanggal_mulai).toISOString()
                : "";
            const tanggalSelesaiISO = formEditData.tanggal_selesai
                ? new Date(formEditData.tanggal_selesai).toISOString()
                : "";

            const res = await fetch(`/api/magang/${editingMagangId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    siswa_id: Number(formEditData.siswa_id),
                    dudi_id: Number(formEditData.dudi_id),
                    guru_id: Number(formEditData.guru_id),
                    tanggal_mulai: tanggalMulaiISO,
                    tanggal_selesai: tanggalSelesaiISO,
                    status: formEditData.status,
                    nilai_akhir: formEditData.nilai_akhir || null
                }),
            });

            const result_update = await res.json()

            if (!res.ok) {
                toast.error(result_update.message || "Gagal memperbarui data magang");
                return;
            }

            toast.success("Berhasil memperbarui data magang");

            // refresh data magang dan stats
            fetchAllMagangData();

            // reset form magang
            setFormEditData({
                siswa_id: "",
                dudi_id: "",
                guru_id: "",
                tanggal_mulai: "",
                tanggal_selesai: "",
                status: "pending",
                nilai_akhir: ""
            });

            setOpenEdit(false); // tutup dialog form jika berhasil edit data magang
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat memperbarui magang");
        }
    };

    // untuk menangani hapus magang
    async function handleDeleteMagang(id: number) {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/magang/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const result_delete = await res.json()

            if (!res.ok) {
                toast.error(result_delete.message || "Gagal menghapus data magang");
                return;
            }

            // Refresh data magang
            fetchAllMagangData();

            toast.success("Data magang berhasil dihapus");
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan server");
        }
    }

    async function fetchOptions(editingId?: number) {
        try {
            const token = getTokenFromCookie();

            if (optionsLoaded && !editingId) return;
            // Ambil semua data tanpa pagination
            const [siswaRes, guruRes, dudiRes, magangRes] = await Promise.all([
                fetch("/api/siswa?page=1&limit=9999", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }).then(r => r.json()),
                fetch("/api/guru?page=1&limit=9999", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }).then(r => r.json()),
                fetch("/api/dudi?page=1&limit=9999", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }).then(r => r.json()),
                fetch("/api/magang?page=1&limit=9999", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }).then(r => r.json()),
            ]);

            const allSiswa = siswaRes.data || [];
            const allGuru = guruRes.data || [];
            const allDudi = dudiRes.data || [];
            const allMagang = magangRes.data || [];

            // Ambil siswa yang sudah punya magang
            const siswaSudahMagang = allMagang.map((m: any) => m.siswa_id);

            // Filter siswa agar hanya tampil yang belum magang (atau yang sedang diedit)
            const filteredSiswa = editingId
                ? allSiswa.filter((s: any) =>
                    !siswaSudahMagang.includes(s.id) ||
                    allMagang.find((m: any) => m.id === editingId)?.siswa_id === s.id
                )
                : allSiswa.filter((s: any) => !siswaSudahMagang.includes(s.id));

            setOptionsLoaded(true);

            // Set ke state
            setSiswaList(filteredSiswa);
            setGuruList(allGuru);
            setDudiList(allDudi);
        } catch (err) {
            console.error("Gagal fetch data opsi:", err);
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
                    cache: "no-store",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!res.ok) throw new Error("Gagal mengambil guru berdasarkan user_id");

                const result = await res.json();
                const guruLogin = result?.data;

                if (guruLogin?.id) {
                    setGuruLoginId(guruLogin.id);

                    // Auto set di form
                    setFormTambahData((prev) => ({
                        ...prev,
                        guru_id: String(guruLogin.id),
                    }));
                } else {
                    console.warn("Guru tidak ditemukan untuk user_id:", user.id);
                }
            } catch (error) {
                console.error("Gagal ambil guru login:", error);
            } finally {
                setLoading(false)
            }
        }
        fetchGuruLogin();
    }, [user]);

    const fetchAllMagangData = async () => {
        if (!guruLoginId) return;
        setLoading(true);

        const token = getTokenFromCookie();

        try {
            const [tabelRes, statsRes] = await Promise.all([
                fetch(`/api/magang?guru_id=${guruLoginId}&page=${page}&limit=${limit}`, {
                    cache: "no-store",
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.json()),

                fetch(`/api/magang?guru_id=${guruLoginId}&page=1&limit=9999`, {
                    cache: "no-store",
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.json()),
            ]);

            setMagang(tabelRes.data || []);
            setTotalItems(tabelRes.total || 0);
            setTotalPages(tabelRes.totalPages || 1);

            setAllMagang(statsRes.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Gagal mengambil data magang");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data magang berdasarkan guru pembimbing login
    useEffect(() => {
        if (guruLoginId) {
            fetchAllMagangData();
        }
    }, [guruLoginId, page, limit]);


    useEffect(() => {
        fetchOptions(); // hanya 1x di awal
    }, []);

    // Filter magang hanya untuk guru pembimbing yang sedang login
    const filteredMagangSearch = Array.isArray(allMagang)
        ? allMagang.filter((u) =>
            [u.siswa.nama, u.guru.nama, u.dudi.nama_perusahaan]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : [];

    const filteredMagang = Array.isArray(magang) ? magang : [];

    // Tentukan data tabel yang akan ditampilkan
    const isSearching = search.trim() !== "";

    const displayedMagang = isSearching
        ? filteredMagangSearch // tampilkan semua hasil saat search/filter
        : filteredMagang;      // tampilkan per page biasa

    const currentPage = isSearching ? 1 : page;
    const totalPages = isSearching ? 1 : totalPage;
    const totalItems = isSearching ? displayedMagang.length : total;

    // Hitung data statistik dinamis
    const totalSiswaMagang = allMagang.length;
    const siswaAktifMagang = allMagang.filter(m => m.status === "berlangsung").length;
    const siswaSelesaiMagang = allMagang.filter(m => m.status === "selesai").length;
    const siswaMenungguVerifikasi = allMagang.filter(m => m.status === "pending").length;

    // stats data
    const stats = [
        { title: "Total Siswa", value: totalSiswaMagang, icon: Users, color: "text-cyan-500", description: "Siswa magang terdaftar" },
        { title: "Aktif", value: siswaAktifMagang, icon: GraduationCap, color: "text-cyan-500", description: "Sedang magang" },
        { title: "Selesai", value: siswaSelesaiMagang, icon: CheckCircle, color: "text-cyan-500", description: "Magang selesai" },
        { title: "Pending", value: siswaMenungguVerifikasi, icon: Calendar, color: "text-cyan-500", description: "Menunggu penempatan" },
    ];

    if (loading) {
        return <GuruMagangSkeleton />;
    }

    return (
        <>
            {/* Overlay Loading Blur saat klik Edit */}
            {isEditLoading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-[3px] bg-black/50">
                    <div className="flex flex-col items-center text-white">
                        <img
                            src="/spinner.gif"
                            alt="Loading..."
                            className="w-10 h-10 mb-3 animate-pulse"
                        />
                        <p className="text-sm font-medium">Memuat data magang...</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl">Manajemen Siswa Magang</h2>
                </div>

                {/* Card Statistik */}
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
                            <Users className="text-cyan-500" size={22} />
                            <CardTitle className="flex items-center gap-2">Daftar Siswa Magang</CardTitle>
                        </div>
                        <Dialog open={openTambah} onOpenChange={setOpenTambah}>
                            <form onSubmit={handleSubmitTambahMagang} className="grid gap-2 py-1">
                                <DialogTrigger asChild>
                                    <Button onClick={() => {
                                        fetchOptions();
                                    }} className="bg-gradient-to-r from-cyan-500 to-sky-600 h-10 rounded-lg text-white flex gap-2 items-center justify-center
                                        cursor-pointer hover:from-cyan-600">
                                        <Plus size={20} /> Tambah
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[800px] sm:max-w-2xl max-h-[80vh] sm:max-h-[95vh] overflow-hidden rounded-lg flex flex-col">
                                    <DialogHeader className="border-b pb-4">
                                        <DialogTitle>Tambah Data Siswa Magang</DialogTitle>
                                        <DialogDescription className="text-[13px]">
                                            Masukkan informasi data magang siswa baru
                                        </DialogDescription>
                                    </DialogHeader>

                                    {/* Form */}
                                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(95vh-200px)] px-2">
                                        {/* Siswa & Pembimbing */}
                                        <div className="mt-4">
                                            <h1 className="font-medium text-sm sm:text-base">Siswa & Guru Pembimbing</h1>
                                            <hr className="border-gray-200 mt-2" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                            {/* Siswa */}
                                            <div className="grid gap-2">
                                                <label className="text-sm font-small">Siswa</label>
                                                <Select name="siswa_id" value={formTambahData.siswa_id} onValueChange={handleSiswaChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Siswa" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {siswaList.map(s => (
                                                            <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Hanya menampilkan siswa yang belum terdaftar magang
                                                </p>
                                            </div>

                                            {/* Guru Pembimbing */}
                                            <div className="grid gap-2">
                                                <label className="text-sm font-small">Guru Pembimbing</label>
                                                <Select name="guru_id" value={formTambahData.guru_id} onValueChange={handleGuruChange} disabled>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Guru Pembimbing" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {guruList.map(g => (
                                                            <SelectItem key={g.id} value={String(g.id)}>
                                                                {g.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Guru pembimbing akan otomatis menyesuaikan dengan akun yang login
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tempat Magang */}
                                        <div className="mt-6">
                                            <h1 className="font-medium">Tempat Magang</h1>
                                            <hr className="border-gray-200 mt-2" />
                                        </div>

                                        <div className="grid gap-2 mt-2">
                                            <label className="text-sm font-small">Dunia Usaha/Dunia Industri</label>
                                            <Select name="dudi_id" value={formTambahData.dudi_id} onValueChange={handleDudiChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih DUDI" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dudiList.map(s => (
                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                            {s.nama_perusahaan}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Periode & Status */}
                                        <div className="mt-6">
                                            <h1 className="font-medium">Periode & Status</h1>
                                            <hr className="border-gray-200 mt-2" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-small">Tanggal Mulai</label>
                                                <Input
                                                    id="tanggal_mulai"
                                                    name="tanggal_mulai"
                                                    type="date"
                                                    value={formTambahData.tanggal_mulai}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-small">Tanggal Selesai</label>
                                                <Input
                                                    id="tanggal_selesai"
                                                    name="tanggal_selesai"
                                                    type="date"
                                                    value={formTambahData.tanggal_selesai}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-small">Status</label>
                                                <Select value={formTambahData.status} onValueChange={handleStatusChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="diterima">Diterima</SelectItem>
                                                        <SelectItem value="ditolak">Ditolak</SelectItem>
                                                        <SelectItem value="berlangsung">Aktif</SelectItem>
                                                        <SelectItem value="selesai">Selesai</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-2 pt-4 border-t">
                                        <DialogClose asChild>
                                            <Button variant="outline" className="w-full sm:w-50 cursor-pointer order-2 sm:order-1">Batal</Button>
                                        </DialogClose>
                                        <Button className="w-full sm:w-50 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 cursor-pointer order-1">Simpan</Button>
                                    </div>
                                </DialogContent>
                            </form>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {/* Search + Filter */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                            {/* Search Bar */}
                            <div className="relative w-full sm:w-130">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Cari siswa, guru, atau DUDI..."
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
                                <span className="text-sm text-gray-600">per halaman</span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full border-collapse text-sm" style={{ minWidth: "1200px" }}>
                                <thead>
                                    <tr className="text-left bg-white">
                                        <th className="px-4 py-3 font-semibold text-sm w-[200px] min-w-[200px]">Siswa</th>
                                        <th className="px-4 py-3 font-semibold text-sm w-[180px] min-w-[180px]">Guru Pembimbing</th>
                                        <th className="px-4 py-3 font-semibold text-sm w-[250px] min-w-[250px]">DUDI</th>
                                        <th className="px-4 py-3 font-semibold text-sm w-[150px] min-w-[150px]">Periode</th>
                                        <th className="px-4 py-3 text-center font-semibold text-sm w-[120px] min-w-[120px]">Status</th>
                                        <th className="px-4 py-3 text-center font-semibold text-sm w-[80px] min-w-[80px]">Nilai</th>
                                        <th className="px-4 py-3 text-center font-semibold text-sm w-[100px] min-w-[100px]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedMagang.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                Tidak ada data Magang yang ditemukan
                                            </td>
                                        </tr>
                                    ) : displayedMagang.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="border-t hover:bg-gray-50 transition"
                                        >
                                            {/* Siswa */}
                                            <td className="px-4 py-4 w-[200px] min-w-[200px]">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-semibold text-sm">{u.siswa.nama || "Tanpa nama"}</p>
                                                    <span className="flex flex-col gap-1 text-gray-500 text-xs">
                                                        <p>NIS: {u.siswa.nis || "-"}</p>
                                                        <p>{u.siswa.kelas || "Tanpa kelas"}</p>
                                                        <p>{u.siswa.jurusan || "Tanpa jurusan"}</p>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Guru Pembimbing */}
                                            <td className="px-4 py-4 w-[180px] min-w-[180px]">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-medium text-black text-sm">{u.guru.nama || "Tanpa nama"}</p>
                                                    <p className="text-xs text-gray-500">NIP: {u.guru.nip || "-"}</p>
                                                </div>
                                            </td>

                                            {/* DUDI */}
                                            <td className="px-4 py-4 w-[250px] min-w-[250px]">
                                                <div className="flex flex-row gap-3">
                                                    <div className="flex-shrink-0 bg-gray-300 rounded-lg w-8 h-8 flex items-center justify-center">
                                                        <Building2 className="text-black" size={16} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-sm text-gray-700 leading-tight">{u.dudi.nama_perusahaan || "Tanpa nama"}</span>
                                                        <span className="text-xs text-gray-500 leading-tight">{u.dudi.alamat || "-"}</span>
                                                        <span className="text-xs text-gray-400 leading-tight">{u.dudi.penanggung_jawab || "-"}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Periode */}
                                            <td className="px-4 py-4 w-[150px] min-w-[150px] text-xs text-gray-400">
                                                {u.tanggal_mulai && u.tanggal_selesai && (
                                                    <>
                                                        <div>
                                                            <p className="text-xs text-gray-600">{format(parseISO(u.tanggal_mulai as any), "d MMM yyyy", { locale: id })}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600">s.d {format(parseISO(u.tanggal_selesai as any), "d MMM yyyy", { locale: id })}</p>
                                                        </div>
                                                        <div>
                                                            {differenceInDays(
                                                                parseISO(u.tanggal_selesai as any),
                                                                parseISO(u.tanggal_mulai as any)
                                                            )}{" "}
                                                            hari
                                                        </div>
                                                    </>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4 w-[120px] min-w-[120px] text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium 
                                                ${u.status === "pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-300" :
                                                        u.status === "diterima" ? "bg-blue-100 text-blue-800 border border-blue-300" :
                                                            u.status === "ditolak" ? "bg-red-100 text-red-800 border border-red-300" :
                                                                u.status === "berlangsung" ? "bg-green-100 text-green-800 border border-green-300" :
                                                                    u.status === "selesai" ? "bg-cyan-100 text-cyan-800 border border-cyan-300" :
                                                                        u.status === "dibatalkan" ? "bg-gray-100 text-gray-800 border border-gray-300" :
                                                                            "bg-gray-100 text-gray-800 border border-gray-300"}`}>

                                                    {u.status === "pending" && <span>Menunggu Diverifikasi</span>}
                                                    {u.status === "diterima" && <span>Diterima</span>}
                                                    {u.status === "ditolak" && <span>Ditolak</span>}
                                                    {u.status === "berlangsung" && <span>Aktif</span>}
                                                    {u.status === "selesai" && <span>Selesai</span>}
                                                    {u.status === "dibatalkan" && <span>Dibatalkan</span>}
                                                </span>
                                            </td>

                                            {/* Nilai */}
                                            <td className="px-4 py-3 w-[80px] min-w-[80px] text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white font-medium bg-[#AEA500] shadow-sm">
                                                    {u.nilai_akhir || "-"}/100
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 w-[100px] min-w-[100px]">
                                                <div className="flex gap-2 justify-center items-center">
                                                    <button onClick={() => {
                                                        handleOpenEdit(u.id)
                                                    }} className="p-2 rounded text-gray-600 hover:text-yellow-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(255,255,0,0.8)] cursor-pointer">
                                                        <SquarePen size={16} />
                                                    </button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="p-2 rounded text-gray-600 hover:text-red-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(255,0,0,0.8)] cursor-pointer">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-xl sm:w-full sm:max-w-[600px] max-w-[350px]">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-lg font-semibold">Hapus Magang?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-sm text-gray-600">
                                                                    Data magang <b>{u.siswa.nama}</b> akan dihapus permanen dan tidak bisa dikembalikan.
                                                                    Apakah kamu yakin?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
                                                                <AlertDialogCancel className="cursor-pointer order-2 sm:order-1">Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-red-600 hover:bg-red-700 cursor-pointer order-1 sm:order-2"
                                                                    onClick={() => handleDeleteMagang(u.id)}
                                                                >
                                                                    Ya, Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Edit Form */}
                            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                                <DialogTrigger asChild></DialogTrigger>
                                <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[800px] sm:max-w-2xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden rounded-lg flex flex-col">
                                    <form onSubmit={handleSubmitEditMagang}>
                                        <DialogHeader className="border-b pb-4">
                                            <DialogTitle>Edit Data Siswa Magang</DialogTitle>
                                            <DialogDescription>
                                                Perbarui informasi data magang siswa
                                            </DialogDescription>
                                        </DialogHeader>

                                        {/* Form Body */}
                                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(80vh-180px)] sm:max-h-[calc(95vh-200px)] px-2">
                                            {/* Siswa & Guru Pembimbing */}
                                            <div className="mt-4">
                                                <h1 className="font-medium text-sm sm:text-base">Siswa & Guru Pembimbing</h1>
                                                <hr className="border-gray-200 mt-2" />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                {/* Siswa */}
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-small">Siswa</label>
                                                    <Select
                                                        name="siswa_id"
                                                        value={formEditData.siswa_id}
                                                        onValueChange={handleSiswaChange}
                                                        disabled
                                                    >
                                                        <SelectTrigger className="bg-gray-100 cursor-not-allowed border border-gray-300">
                                                            <SelectValue placeholder="Pilih Siswa" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {siswaList.map((s) => (
                                                                <SelectItem key={s.id} value={String(s.id)}>
                                                                    {s.nama}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Siswa tidak dapat diganti saat mengedit data magang
                                                    </p>
                                                </div>

                                                {/* Guru Pembimbing */}
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-small">Guru Pembimbing</label>
                                                    <Select
                                                        name="guru_id"
                                                        value={formEditData.guru_id}
                                                        onValueChange={handleGuruChange}
                                                        disabled
                                                    >
                                                        <SelectTrigger className="bg-gray-100 cursor-not-allowed border border-gray-300">
                                                            <SelectValue placeholder="Pilih Guru Pembimbing" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {guruList.map((g) => (
                                                                <SelectItem key={g.id} value={String(g.id)}>
                                                                    {g.nama}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Guru pembimbing akan otomatis menyesuaikan dengan akun yang login
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Tempat Magang */}
                                            <div className="mt-6">
                                                <h1 className="font-medium">Tempat Magang</h1>
                                                <hr className="border-gray-200 mt-2" />
                                            </div>

                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-small">Dunia Usaha/Dunia Industri</label>
                                                <Select
                                                    name="dudi_id"
                                                    value={formEditData.dudi_id}
                                                    onValueChange={handleDudiChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih DUDI" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dudiList.map((s) => (
                                                            <SelectItem key={s.id} value={String(s.id)}>
                                                                {s.nama_perusahaan}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Periode & Status */}
                                            <div className="mt-6">
                                                <h1 className="font-medium">Periode & Status</h1>
                                                <hr className="border-gray-200 mt-2" />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-small">Tanggal Mulai</label>
                                                    <Input
                                                        id="tanggal_mulai"
                                                        name="tanggal_mulai"
                                                        type="date"
                                                        value={formEditData.tanggal_mulai}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-small">Tanggal Selesai</label>
                                                    <Input
                                                        id="tanggal_selesai"
                                                        name="tanggal_selesai"
                                                        type="date"
                                                        value={formEditData.tanggal_selesai}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-small">Status</label>
                                                    <Select
                                                        value={formEditData.status}
                                                        onValueChange={handleStatusChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="diterima">Diterima</SelectItem>
                                                            <SelectItem value="ditolak">Ditolak</SelectItem>
                                                            <SelectItem value="berlangsung">Aktif</SelectItem>
                                                            <SelectItem value="selesai">Selesai</SelectItem>
                                                            <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Penilaian */}
                                            <div className="mt-6">
                                                <h1 className="font-medium">Penilaian</h1>
                                                <hr className="border-gray-200 mt-2" />
                                            </div>

                                            {/* Nilai Akhir */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-small">Nilai Akhir</label>
                                                <Input
                                                    name="nilai_akhir"
                                                    type="text"
                                                    value={formEditData.nilai_akhir}
                                                    onChange={handleChange}
                                                    className={`w-full ${formEditData.status !== "selesai"
                                                        ? "bg-gray-100 border border-gray-500"
                                                        : "bg-white"
                                                        } text-sm`}
                                                    placeholder={
                                                        formEditData.status === "selesai"
                                                            ? ""
                                                            : "Hanya bisa diisi jika status selesai"
                                                    }
                                                    disabled={formEditData.status !== "selesai"}
                                                />
                                                {formEditData.status !== "selesai" && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Nilai hanya dapat diisi setelah status magang selesai
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-2 pt-4 border-t">
                                            <DialogClose asChild>
                                                <Button variant="outline" className="w-full sm:w-50 cursor-pointer order-1 sm:order-2">
                                                    Batal
                                                </Button>
                                            </DialogClose>
                                            <Button className="bg-gradient-to-r from-cyan-500 to-sky-600 w-full sm:w-50 hover:from-cyan-600 hover:to-sky-700 cursor-pointer order-2">
                                                Simpan
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>

                        </div>
                    </CardContent>
                    <CardFooter className="px-4 sm:px-6 flex flex-col gap-4">
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
        </>
    )
}