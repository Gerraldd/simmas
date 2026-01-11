"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, CircleX, User, Plus, Search, Trash2, SquarePen, FileText, CheckCircle, Clock, MessageSquare, Eye, IdCard, GraduationCap, Calendar, CircleAlert, File, Upload, Download, Filter, ChevronUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils"
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
    PaginationEllipsis,
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
import SiswaLogbookSkeleton from "@/components/loading/siswa/loading_logbook";

interface LogbookType {
    id: number,
    magang: {
        id: number,
        siswa: {
            id: number,
            nama: string,
            nis: string,
            kelas: string,
            jurusan: string,
        },
        dudi: {
            id: number,
            nama_perusahaan: string,
            alamat: string,
            penanggung_jawab: string,
        }
    }
    tanggal: Date,
    kegiatan: string,
    kendala: string,
    file: string | null,
    status_verifikasi: string,
    catatan_guru: string
    created_at: string,
    updated_at: string,
}

interface DecodedToken {
    id: number;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

export default function SiswaLogbookPage() {
    const [logbook, setLogbook] = useState<LogbookType[]>([]);
    const [allLogbook, setAllLogbook] = useState<LogbookType[]>([]);
    const [baseFiltered, setBaseFiltered] = useState<LogbookType[]>([]);
    const [logbookbyId, setLogbookbyId] = useState<LogbookType | null>(null);
    const [isClicked, setIsClicked] = useState(false);
    const [statsData, setStatsData] = useState({ total: 0, disetujui: 0, menunggu: 0, ditolak: 0 })
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPage, setTotalPages] = useState(1);
    const [total, setTotalItems] = useState(0);
    const [openDetail, setOpenDetail] = useState(false);
    const [openTambah, setOpenTambah] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [formTambahData, setFormTambahData] = useState({
        magang_id: 0,
        tanggal: new Date().toISOString().split("T")[0],
        status_verifikasi: "pending",
        kegiatan: "",
        kendala: "",
        file: null as File | null,
    });
    const [formEditData, setFormEditData] = useState({
        tanggal: "",
        kegiatan: "",
        kendala: "",
        status_verifikasi: "pending",
        file: null as File | null,
        existingFilePath: null as string | null,
        removeFile: false,
    });
    const [loading, setLoading] = useState(true);
    const [editingLogbookId, setEditingLogbookId] = useState<number | null>(null);
    const [dataDate, setDataDate] = useState({ tanggal: "", created_at: "", updated_at: "" })
    const [error, setError] = useState<string | null>(null);
    const [showFilter, setShowFilter] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterBulan, setFilterBulan] = useState("all");
    const [filterTahun, setFilterTahun] = useState("all");

    const isToday = (date: Date | string) => {
        const today = new Date();
        const target = new Date(date);

        return (
            today.getFullYear() === target.getFullYear() &&
            today.getMonth() === target.getMonth() &&
            today.getDate() === target.getDate()
        );
    };

    function getTokenFromCookie() {
        return Cookies.get("token") || "";
    }

    // Fungsi download
    const handleDownloadFile = (filePath: string) => {
        if (!filePath) return;

        const fileName = filePath.split('/').pop() || 'file';
        const link = document.createElement('a');

        link.href = `/uploads/${fileName}`;

        link.download = fileName;

        link.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormTambahData((prev) => ({ ...prev, [name]: value }));
        setFormEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormTambahData((prev) => ({ ...prev, file }));
            setFormEditData((prev) => ({ ...prev, file, removeFile: false }));
        }
    };

    const handleRemoveFile = () => {
        setFormEditData((prev) => ({ ...prev, file: null, removeFile: true }));
    };

    const handleSubmitTambahData = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formTambahData.magang_id) {
            toast.error("Magang ID tidak ditemukan");
            return;
        }

        if (!formTambahData.tanggal || !formTambahData.kegiatan || !formTambahData.kendala) {
            toast.error("Tanggal, kegiatan, dan kendala wajib diisi");
            return;
        }

        if (formTambahData.kegiatan.length < 50 || formTambahData.kendala.length < 50) {
            toast.error("Kegiatan dan kendala harus minimal 50 karakter");
            return;
        }

        try {
            const token = getTokenFromCookie();

            const formData = new FormData();
            formData.append("magang_id", formTambahData.magang_id.toString());
            formData.append("tanggal", new Date(formTambahData.tanggal).toISOString());
            formData.append("status_verifikasi", formTambahData.status_verifikasi || "pending");
            formData.append("kegiatan", formTambahData.kegiatan);
            formData.append("kendala", formTambahData.kendala);

            if (formTambahData.file) {
                formData.append("file", formTambahData.file);
            }

            const res = await fetch("/api/logbook", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("API error:", errorText);
                throw new Error("Tambah logbook gagal: " + errorText);
            }

            toast.success("Berhasil menambah jurnal");

            // Refresh data logbook
            fetchData();

            // Reset form
            setFormTambahData({
                magang_id: formTambahData.magang_id,
                tanggal: "",
                status_verifikasi: "pending",
                kegiatan: "",
                kendala: "",
                file: null,
            });

            setOpenTambah(false);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Terjadi kesalahan saat menambah jurnal");
        }
    };

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

            setDataDate({
                tanggal: format(parseISO(data.data.tanggal as any), "EEEE, dd MMMM yyyy", { locale: localeId }),
                created_at: format(parseISO(data.data.created_at as any), "dd/MM/yyyy", { locale: localeId }),
                updated_at: format(parseISO(data.data.updated_at as any), "dd/MM/yyyy", { locale: localeId }),
            });

            setLogbookbyId(data.data)
            setEditingLogbookId(id);
            setOpenDetail(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data logbook");
        }
    };

    const handleOpenEdit = async (id: number) => {
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
                tanggal: data.data.tanggal.split("T")[0],
                kegiatan: data.data.kegiatan,
                kendala: data.data.kendala,
                status_verifikasi: data.data.status_verifikasi,
                file: null,
                existingFilePath: data.data.file,
                removeFile: false,
            });

            setLogbookbyId(data.data)
            setEditingLogbookId(id);
            setOpenEdit(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data logbook");
        }
    }

    const handleSubmitEditLogbook = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingLogbookId) return;

        try {
            const token = getTokenFromCookie();

            const formData = new FormData();
            formData.append("tanggal", new Date(formEditData.tanggal).toISOString());
            formData.append("kegiatan", formEditData.kegiatan);
            formData.append("kendala", formEditData.kendala);
            formData.append("removeFile", formEditData.removeFile.toString());

            const pending = "pending";
            if (formEditData.status_verifikasi === "ditolak") {
                formData.append("status_verifikasi", pending);
            }

            // Only append file if a new file is selected
            if (formEditData.file && typeof formEditData.file.name === "string") {
                formData.append("file", formEditData.file);
            }

            const res = await fetch(`/api/logbook/${editingLogbookId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("API error:", errorText);
                toast.error("Gagal memperbarui data logbook: " + errorText);
                return;
            }

            toast.success("Berhasil memperbarui data logbook");

            // Refresh logbook list
            fetchData();

            // Reset form
            setFormEditData({
                tanggal: "",
                kegiatan: "",
                kendala: "",
                status_verifikasi: "",
                file: null,
                existingFilePath: null,
                removeFile: false,
            });

            setOpenEdit(false);
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Terjadi kesalahan saat memperbarui logbook");
        }
    };

    // untuk menangani hapus logbook
    async function handleDeleteLogbook(id: number) {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/logbook/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const result_delete = await res.json()

            if (!res.ok) {
                toast.error(result_delete.message || "Gagal menghapus data logbook");
                return;
            }

            fetchData();

            toast.success("Data logbook berhasil dihapus");
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan server");
        }
    }

    async function fetchData() {
        if (loading) {
            setLoading(true);
        }

        const token = Cookies.get("token");
        console.log("Token:", token); // Debugging
        if (!token) {
            setError("User tidak login atau token tidak ditemukan");
            setLoading(false);
            return;
        }

        let userId: number;
        try {
            const decodedToken: DecodedToken = jwtDecode(token);
            console.log("Decoded token:", decodedToken); // Debugging
            userId = decodedToken.id;
            if (!userId) {
                throw new Error("user_id tidak ditemukan di token");
            }
        } catch (err) {
            console.log("Error decoding token:", err); // Debugging
            setError("Gagal memproses token");
            setLoading(false);
            return;
        }

        try {
            // Langkah 1: Fetch semua siswa untuk mencocokkan user_id
            const siswaRes = await fetch("/api/siswa", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!siswaRes.ok) {
                throw new Error("Gagal fetch data siswa");
            }
            const siswaData = await siswaRes.json();
            console.log("Siswa data:", siswaData); // Debugging
            const matchedSiswa = siswaData.data.find((s: any) => s.user_id === userId);

            if (!matchedSiswa) {
                setError("Siswa tidak ditemukan untuk user ini");
                setLoading(false);
                return;
            }

            const siswaId = matchedSiswa.id;

            // Langkah 2: Fetch semua magang untuk mencocokkan siswa_id
            const magangRes = await fetch("/api/magang?page=1&limit=9999", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!magangRes.ok) {
                throw new Error("Gagal fetch data magang");
            }
            const magangAllData = await magangRes.json();
            console.log("Magang data:", magangAllData); // Debugging
            // Ambil semua magang untuk siswa ini
            const siswaMagang = magangAllData.data.filter((m: any) => m.siswa_id === siswaId);

            if (siswaMagang.length === 0) {
                throw new Error("Data magang tidak ditemukan untuk siswa ini yang aktif");
            }

            // Ambil magang yang statusnya "berlangsung"
            const ongoingMagang = siswaMagang.find((m: any) => m.status === "berlangsung");

            if (!ongoingMagang) {
                throw new Error("Tidak ada magang yang sedang berlangsung untuk siswa ini");
            }

            const magangId = ongoingMagang.id;

            // Simpan magang_id ke formTambahData
            setFormTambahData((prev) => ({ ...prev, magang_id: magangId }));

            // Langkah 3: Fetch SEMUA data logbook tanpa pagination dulu
            const logbookAllRes = await fetch(`/api/logbook?page=1&limit=9999`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!logbookAllRes.ok) {
                throw new Error("Gagal fetch data logbook");
            }
            const logbookAllData = await logbookAllRes.json();
            console.log("All Logbook data:", logbookAllData); // Debugging

            // Filter hanya logbook milik siswa yang login
            const filteredLogbookData = (logbookAllData.data || []).filter(
                (log: LogbookType) => log.magang.id === magangId
            );

            setAllLogbook(filteredLogbookData);
            console.log("Filtered Logbook:", filteredLogbookData); // Debugging

            // Update stats berdasarkan SEMUA data siswa
            const total = filteredLogbookData.length;
            const disetujui = filteredLogbookData.filter((l: LogbookType) => l.status_verifikasi === "disetujui").length;
            const pending = filteredLogbookData.filter((l: LogbookType) => l.status_verifikasi === "pending").length;
            const ditolak = filteredLogbookData.filter((l: LogbookType) => l.status_verifikasi === "ditolak").length;
            setStatsData({ total, disetujui, menunggu: pending, ditolak });
        } catch (err: any) {
            console.log("Fetch error:", err); // Debugging
            setError(err.message);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <SiswaLogbookSkeleton />;
    }

    const filteredLogbookSearch = Array.isArray(baseFiltered)
        ? baseFiltered.filter((u) =>
            [u.kegiatan, u.kendala]
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

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return "-";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const hasTodayLogbook = allLogbook.some((item) => isToday(item.tanggal));

    // Update stats berdasarkan data logbook
    const stats = [
        { title: "Total Jurnal", value: statsData.total, icon: FileText, color: "text-cyan-500", description: "Jurnal yang telah dibuat" },
        { title: "Disetujui", value: statsData.disetujui, icon: CheckCircle, color: "text-cyan-500", description: "Jurnal disetujui guru" },
        { title: "Menunggu", value: statsData.menunggu, icon: Clock, color: "text-cyan-500", description: "Menunggu diverifikasi" },
        { title: "Ditolak", value: statsData.ditolak, icon: CircleX, color: "text-cyan-500", description: "Perlu diperbaiki" },
    ];

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md border-red-200 shadow-lg">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2 text-gray-900">Terjadi Kesalahan</h3>
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="font-bold text-xl sm:text-2xl text-center sm:text-left">Jurnal Harian Magang</h2>

                {/* Tambah form */}
                <Dialog open={openTambah} onOpenChange={setOpenTambah}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-cyan-500 to-sky-600 h-10 rounded-lg text-white flex gap-2 items-center justify-center
                                    cursor-pointer hover:from-cyan-600 hover:to-sky-700 w-full sm:w-auto">
                            <Plus size={20} /> Tambah Jurnal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[750px] sm:max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
                        <form onSubmit={handleSubmitTambahData}>
                            <DialogHeader>
                                <div className="flex flex-col gap-1 mb-2">
                                    <DialogTitle className="text-lg sm:text-xl">Tambah Jurnal Harian</DialogTitle>
                                    <DialogDescription className="text-sm">
                                        Dokumentasikan kegiatan magang harian Anda
                                    </DialogDescription>
                                </div>
                                <div className="w-full border-t mt-3 border-gray-200" />
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto max-h-[60vh] px-3 sm:px-1">
                                {/* Panduan Penulisan */}
                                <div className="mt-4 py-3 px-3 gap-2 bg-blue-50 rounded-lg border border-blue-300">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex flex-row gap-2 items-center">
                                            <CircleAlert size={16} className="text-blue-600" />
                                            <p className="font-medium text-sm text-blue-900">Panduan Penulisan Jurnal</p>
                                        </div>
                                        <div className="flex flex-col text-xs px-1 text-blue-800 ml-5 gap-0.5">
                                            <p>• Minimal 50 karakter untuk deskripsi kegiatan</p>
                                            <p>• Deskripsikan kegiatan dengan detail dan spesifik</p>
                                            <p>• Sertakan kendala yang dihadapi (jika ada)</p>
                                            <p>• Upload dokumentasi pendukung untuk memperkuat laporan</p>
                                            <p>• Pastikan tanggal sesuai dengan hari kerja</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Informasi Dasar */}
                                <div className="mt-6 sm:mt-8">
                                    <h1 className="font-medium text-sm sm:text-base">Informasi Dasar</h1>
                                    <hr className="border-gray-200 mt-2" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2 mt-4">
                                        <label className="text-sm font-small">Tanggal <span className="text-red-600">*</span></label>
                                        <Input
                                            type="date"
                                            name="tanggal"
                                            value={formTambahData.tanggal}
                                            onChange={handleChange}
                                            required
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="grid gap-2 mt-4">
                                        <label className="text-sm font-small">Status</label>
                                        <Input
                                            type="text"
                                            value={formTambahData.status_verifikasi && "Menunggu Verifikasi"}
                                            disabled
                                            className="bg-gray-100 cursor-not-allowed text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Kegiatan Harian */}
                                <div className="mt-6 sm:mt-8">
                                    <h1 className="font-medium text-sm sm:text-base">Kegiatan Harian</h1>
                                    <hr className="border-gray-200 mt-2" />
                                </div>

                                <div className="grid gap-2 mt-4">
                                    <div className="flex flex-row justify-between">
                                        <label className="text-sm font-small">Deskripsi Kegiatan <span className="text-red-600">*</span></label>
                                        <div className={`px-2 py-1 rounded-sm text-xs ${formTambahData.kegiatan.length < 50 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                            {formTambahData.kegiatan.length}/50 minimum
                                        </div>
                                    </div>
                                    <Textarea
                                        name="kegiatan"
                                        value={formTambahData.kegiatan}
                                        onChange={handleChange}
                                        placeholder="Deskripsikan kegiatan yang Anda lakukan hari ini secara detail..."
                                        className="placeholder:text-xs placeholder:text-gray-400 h-20 sm:h-25 text-sm"
                                        required
                                    />
                                </div>

                                {/* Kendala yang dihadapi */}
                                <div className="mt-6 sm:mt-8">
                                    <h1 className="font-medium text-sm sm:text-base">Kendala yang dihadapi</h1>
                                    <hr className="border-gray-200 mt-2" />
                                </div>

                                <div className="grid gap-2 mt-4">
                                    <div className="flex flex-row justify-between">
                                        <label className="text-sm font-small">Deskripsi Kendala <span className="text-red-600">*</span></label>
                                        <div className={`px-2 py-1 rounded-sm text-xs ${formTambahData.kendala.length < 50 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                            {formTambahData.kendala.length}/50 minimum
                                        </div>
                                    </div>
                                    <Textarea
                                        name="kendala"
                                        value={formTambahData.kendala}
                                        onChange={handleChange}
                                        placeholder="Tuliskan kendala atau hambatan yang Anda hadapi hari ini..."
                                        className="placeholder:text-xs placeholder:text-gray-400 h-20 sm:h-25 text-sm"
                                        required
                                    />
                                </div>

                                {/* Dokumentasi Pendukung */}
                                <div className="mt-6 sm:mt-8">
                                    <h1 className="font-medium text-sm sm:text-base">Dokumentasi Pendukung</h1>
                                    <hr className="border-gray-200 mt-2" />
                                </div>

                                <div className="grid gap-2 mt-4 mb-6">
                                    <label className="text-sm font-small">Upload File (Opsional)</label>

                                    {formTambahData.file ? (
                                        <div className="flex items-center justify-between border rounded-lg p-3 bg-green-50 border-2 border-dashed border-green-300">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 bg-green-100 rounded-md items-center justify-center flex-shrink-0">
                                                    <File className="text-green-600" size={16} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs sm:text-[14px] text-green-900 truncate">File terpilih</span>
                                                    <span className="text-xs font-medium text-green-700 truncate">{formTambahData.file.name}</span>
                                                </div>
                                            </div>
                                            <Trash2 size={16} className="text-red-600 ml-2 cursor-pointer hover:text-red-800 flex-shrink-0" onClick={() =>
                                                setFormTambahData((prev) => ({ ...prev, file: null }))
                                            } />
                                        </div>
                                    ) : (
                                        <div
                                            className={cn(
                                                "border-2 border-dashed rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center gap-2",
                                                "hover:border-blue-500 transition"
                                            )}
                                        >
                                            <div className="flex items-center justify-center bg-gray-100 h-8 w-8 sm:h-11 sm:w-11 rounded-md mb-1">
                                                <Upload className="text-gray-400" size={16} />
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-center">Pilih file dokumentasi</p>
                                            <p className="text-xs text-gray-500 text-center">
                                                PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                                            </p>
                                            <Button
                                                asChild
                                                type="button"
                                                variant="default"
                                                className="mt-2 bg-blue-700 hover:bg-blue-900 cursor-pointer text-xs h-8"
                                            >
                                                <label htmlFor="fileInput">Browse File</label>
                                            </Button>
                                            <input
                                                id="fileInput"
                                                name="file"
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    )}
                                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1">Jenis file yang dapat diupload: Screenshot hasil kerja, dokumentasi code, foto kegiatan</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end pt-3 border-t bg-white gap-2">
                                <DialogClose asChild>
                                    <Button variant="outline" className="w-full sm:w-30 cursor-pointer order-2 sm:order-1">Batal</Button>
                                </DialogClose>
                                <Button type="submit" className="w-full sm:w-40 bg-gradient-to-r from-cyan-500 to-sky-600 
                                    transition-all duration-300 ease-in-out hover:shadow-lg hover:from-cyan-600 hover:to-sky-700 cursor-pointer order-1 sm:order-2">
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {!hasTodayLogbook && (
                <div className="flex flex-col sm:flex-row bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-4 gap-4 justify-between">
                    <div className="flex flex-row gap-3 items-center">
                        <div className="inline-flex w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 text-yellow-600 items-center justify-center rounded-lg">
                            <FileText size={18} />
                        </div>
                        <div>
                            <p className="font-semibold text-sm sm:text-md text-yellow-900">Jangan Lupa Jurnal Hari Ini!</p>
                            <p className="text-xs sm:text-[13px] text-orange-700">
                                Anda belum membuat jurnal untuk hari ini.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end">
                        <Button
                            className="bg-orange-600 h-9 w-full sm:w-35 rounded-lg text-white flex gap-2 items-center cursor-pointer hover:bg-orange-700"
                            onClick={() => setOpenTambah(true)}
                        >
                            Buat Sekarang
                        </Button>
                    </div>
                </div>
            )}

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

            <Card className="shadow-md border">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <FileText className="text-cyan-500" size={20} />
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">Riwayat Jurnal</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                    {/* Search + Filter */}
                    <div className="flex flex-col gap-4 mb-4 w-full">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Cari kegiatan, atau kendala..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl placeholder:text-gray-400 text-sm"
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
                    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto w-full" style={{ minWidth: '100%' }}>
                            <table className="min-w-[800px] w-full border-collapse text-sm sm:text-[15px]">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-3 py-2 font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Tanggal</th>
                                        <th className="px-3 py-2 font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Kegiatan & Kendala</th>
                                        <th className="px-3 py-2 text-center font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Status</th>
                                        <th className="px-3 py-2 text-start font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Feedback Guru</th>
                                        <th className="px-3 py-2 text-center font-semibold tracking-wider text-xs sm:text-sm whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedLogbook.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                Belum ada data Jurnal Harian yang dibuat
                                            </td>
                                        </tr>
                                    ) : displayedLogbook.map((u) => (
                                        <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                                            {/* Tanggal */}
                                            <td className="px-3 py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                                                {format(parseISO(u.tanggal as any), "EEE, dd MMM yyyy", { locale: localeId })}
                                            </td>

                                            {/* Kegiatan & Kendala */}
                                            <td className="px-3 py-3 align-top min-w-[250px] sm:min-w-[350px] whitespace-normal break-words">
                                                <div className="flex flex-col gap-2">
                                                    <div>
                                                        <p className="font-semibold text-xs sm:text-sm">Kegiatan:</p>
                                                        <p className="text-gray-800 text-xs sm:text-sm break-words">{truncateText(u.kegiatan, 100)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-xs sm:text-sm">Kendala:</p>
                                                        <p className="text-gray-800 text-xs sm:text-sm break-words">{truncateText(u.kendala, 100)}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Verifikasi */}
                                            <td className="px-3 py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span
                                                        className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium ${u.status_verifikasi === "pending"
                                                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                                            : u.status_verifikasi === "disetujui"
                                                                ? "bg-green-100 text-green-800 border border-green-300"
                                                                : u.status_verifikasi === "ditolak"
                                                                    ? "bg-red-100 text-red-800 border border-red-300"
                                                                    : "bg-gray-100 text-gray-800 border border-gray-300"
                                                            }`}
                                                    >
                                                        {u.status_verifikasi === "pending" && "Belum Diverifikasi"}
                                                        {u.status_verifikasi === "disetujui" && "Disetujui"}
                                                        {u.status_verifikasi === "ditolak" && "Ditolak"}
                                                    </span>
                                                    {u.status_verifikasi === "ditolak" && (
                                                        <span className="text-red-500 text-[11px]">Perlu diperbaiki</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Feedback Guru */}
                                            <td className="px-3 py-3 text-xs sm:text-sm align-center min-w-[150px] sm:min-w-[250px]">
                                                {u.catatan_guru?.trim() ? (
                                                    <div className="bg-gray-50 border border-gray-300 p-2 rounded-md text-gray-700">
                                                        <div className="flex gap-1 items-center mb-1">
                                                            <MessageSquare size={12} />
                                                            <span className="text-xs font-medium">Catatan:</span>
                                                        </div>
                                                        <p className="text-xs break-words">{u.catatan_guru}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 font-medium text-[13px]">Belum ada feedback</span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                <div className="flex justify-center items-center gap-1">
                                                    <button
                                                        onClick={() => handleOpenDetail(u.id)}
                                                        className="p-2 rounded text-gray-600 hover:text-cyan-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.8)] cursor-pointer"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {u.status_verifikasi !== "disetujui" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenEdit(u.id)}
                                                                className="p-2 rounded text-gray-600 hover:text-yellow-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(255,255,0,0.8)] cursor-pointer"
                                                            >
                                                                <SquarePen size={16} />
                                                            </button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <button className="p-2 rounded text-gray-600 hover:text-red-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(255,0,0,0.8)] cursor-pointer">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="w-[90vw] sm:max-w-md rounded-lg">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="text-base sm:text-lg">
                                                                            Hapus Jurnal Harian
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-sm">
                                                                            Data logbook akan dihapus permanen dan tidak bisa dikembalikan.
                                                                            Apakah kamu yakin?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="text-sm cursor-pointer">Batal</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteLogbook(u.id)}
                                                                            className="bg-red-600 hover:bg-red-700 text-sm cursor-pointer"
                                                                        >
                                                                            Ya, Hapus
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detail form */}
                    <Dialog open={openDetail} onOpenChange={setOpenDetail}>
                        <DialogContent
                            className="w-[95vw] max-w-[95vw] sm:w-[750px] sm:max-w-3xl max-h-[90vh] overflow-hidden rounded-lg"
                            onInteractOutside={(e) => e.preventDefault()}
                            onEscapeKeyDown={(e) => e.preventDefault()}
                        >
                            <DialogHeader className="flex flex-row gap-3 items-center">
                                <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-gradient-to-r from-cyan-500 to-sky-600">
                                    <FileText size={18} className="text-white" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <DialogTitle className="text-lg sm:text-xl">Detail Jurnal Harian</DialogTitle>
                                    <DialogDescription className="text-sm">
                                        {dataDate.tanggal || "-"}
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="w-full border-t mt-1 border-gray-200" />

                            <div className="flex-1 overflow-y-auto max-h-[60vh] px-3 sm:px-1">
                                {/* Siswa */}
                                <div className="py-3 px-3 gap-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex flex-row gap-2 items-center">
                                            <User size={16} className="text-cyan-600" />
                                            <p className="font-medium text-sm">Informasi Siswa</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 px-1">
                                            <div className="flex flex-col gap-3 flex-1">
                                                <div className="flex flex-row gap-3 items-center">
                                                    <div className="inline-flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-md text-white bg-gradient-to-r from-cyan-500 to-sky-600">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-[14px] font-medium">{logbookbyId?.magang.siswa.nama}</p>
                                                        <div className="flex flex-row items-center gap-0.5 text-gray-600">
                                                            <IdCard size={12} />
                                                            <p className="text-[11px]">NIS: {logbookbyId?.magang.siswa.nis || "-"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row gap-1 text-gray-600">
                                                    <GraduationCap size={14} />
                                                    <p className="text-[11px]">{logbookbyId?.magang.siswa.kelas || "Tanpa Kelas"}</p>
                                                </div>
                                                <div className="flex flex-row gap-1">
                                                    <p className="text-[11px] font-semibold">Jurusan: </p>
                                                    <p className="text-[11px] text-gray-600">{logbookbyId?.magang.siswa.jurusan || "Tanpa jurusan"}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 flex-1">
                                                <div className="flex flex-row items-center gap-1 text-gray-700">
                                                    <Building2 size={14} />
                                                    <p className="text-[11px] font-medium">Tempat Magang</p>
                                                </div>
                                                <p className="text-xs sm:text-[14px] font-medium">{logbookbyId?.magang.dudi.nama_perusahaan}</p>
                                                <p className="text-[11px] text-gray-600">{logbookbyId?.magang.dudi.alamat}</p>
                                                <div className="flex flex-row gap-1">
                                                    <p className="text-[11px] font-semibold">PIC: </p>
                                                    <p className="text-[11px] text-gray-600">{logbookbyId?.magang.dudi.penanggung_jawab}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tanggal dan Status Verifikasi */}
                                <div className="flex flex-col sm:flex-row justify-between py-3 px-3 gap-2 bg-gray-50 rounded-lg border border-gray-200 mt-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar size={12} />
                                        <p className="text-[11px] font-medium">{dataDate.tanggal || "-"}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2 sm:mt-0">
                                        <span className={`inline-flex items-center justify-center m-auto gap-1 px-2 py-1 rounded-md text-xs font-medium 
                                                ${logbookbyId?.status_verifikasi === "pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-300" :
                                                logbookbyId?.status_verifikasi === "disetujui" ? "bg-green-100 text-green-800 border border-green-300" :
                                                    logbookbyId?.status_verifikasi === "ditolak" ? "bg-red-100 text-red-800 border border-red-300" :
                                                        "bg-gray-100 text-gray-800 border border-gray-300"}`}>

                                            {logbookbyId?.status_verifikasi === "pending" && <span>Belum Diverifikasi</span>}
                                            {logbookbyId?.status_verifikasi === "disetujui" && <span>Disetujui</span>}
                                            {logbookbyId?.status_verifikasi === "ditolak" && <span>Ditolak</span>}
                                        </span>
                                    </div>
                                </div>

                                {/* Kegiatan Hari Ini */}
                                <div className="flex flex-row gap-2 items-center mt-6">
                                    <FileText size={14} className="text-blue-600" />
                                    <p className="font-medium text-sm">Kegiatan Hari Ini</p>
                                </div>

                                <div className="py-3 px-3 bg-white rounded-lg border border-gray-300 mt-2">
                                    <p className="text-xs text-gray-700 whitespace-pre-line break-words">{logbookbyId?.kegiatan || "-"}</p>
                                </div>

                                {/* Kendala yang dihadapi */}
                                <div className="flex flex-row gap-2 items-center mt-6">
                                    <CircleAlert size={14} className="text-yellow-600" />
                                    <p className="font-medium text-sm">Kendala yang dihadapi</p>
                                </div>

                                <div className="py-3 px-3 bg-white rounded-lg border border-gray-300 mt-2">
                                    <p className="text-xs text-gray-700 whitespace-pre-line break-words">{logbookbyId?.kendala || "-"}</p>
                                </div>

                                {/* Dokumentasi */}
                                {logbookbyId?.status_verifikasi !== "ditolak" && (
                                    <>
                                        <div className="flex flex-row gap-2 items-center mt-6">
                                            <File size={14} className="text-green-600" />
                                            <p className="font-medium text-sm">Dokumentasi</p>
                                        </div>

                                        <div className={`flex flex-col sm:flex-row justify-between items-center bg-green-50 px-3 py-3 sm:py-4 mt-2 mb-4 rounded-md border border-green-300 gap-2`}>
                                            {logbookbyId?.file ? (
                                                <>
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <File size={18} className="text-green-600" />
                                                        <p className="text-xs mt-1 text-gray-600 whitespace-pre-line break-words">
                                                            {logbookbyId.file.split("/").pop()}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleDownloadFile(logbookbyId.file || "")}
                                                        className="bg-green-600 w-full sm:w-23 h-8 font-normal rounded-lg transition-all hover:bg-green-800 cursor-pointer text-xs"
                                                    >
                                                        <Download size={12} /> Unduh
                                                    </Button>
                                                </>
                                            ) : (
                                                <p className="text-gray-600 text-xs text-center w-full">
                                                    Belum ada file yang diunggah
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between pt-3 border-t bg-white gap-2">
                                <div className="flex flex-row sm:flex-row gap-1 text-[11px] items-center text-gray-600 justify-between sm:justify-center sm:justify-start">
                                    <p>Dibuat: {dataDate.created_at}</p>
                                    <p className="hidden sm:block">|</p>
                                    <p>Diperbarui: {dataDate.updated_at}</p>
                                </div>
                                <DialogClose asChild>
                                    <Button variant="outline" className="w-full sm:w-30 cursor-pointer mt-2 sm:mt-0 text-sm">Tutup</Button>
                                </DialogClose>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Edit form */}
                    <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[750px] sm:max-w-4xl max-h-[90vh] overflow-hidden rounded-lg flex flex-col">
                            <form onSubmit={handleSubmitEditLogbook} className="flex flex-col h-full">
                                <DialogHeader>
                                    <div className="flex flex-col gap-0.5">
                                        <DialogTitle className="text-lg sm:text-xl">Edit Jurnal Harian</DialogTitle>
                                        <DialogDescription className="text-sm">
                                            Perbarui dokumentasi kegiatan magang Anda
                                        </DialogDescription>
                                    </div>
                                </DialogHeader>

                                <div className="w-full border-t mt-3 border-gray-200" />

                                <div className="flex-1 overflow-y-auto max-h-[60vh] px-3 sm:px-1">
                                    {/* Panduan Penulisan */}
                                    <div className="mt-4 py-3 px-3 gap-2 bg-blue-50 rounded-lg border border-blue-300">
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex flex-row gap-2 items-center">
                                                <CircleAlert size={16} className="text-blue-600" />
                                                <p className="font-medium text-sm text-blue-900">Panduan Penulisan Jurnal</p>
                                            </div>
                                            <div className="flex flex-col text-xs px-1 text-blue-800 ml-5 gap-0.5">
                                                <p>• Minimal 50 karakter untuk deskripsi kegiatan</p>
                                                <p>• Deskripsikan kegiatan dengan detail dan spesifik</p>
                                                <p>• Sertakan kendala yang dihadapi (jika ada)</p>
                                                <p>• Upload dokumentasi pendukung untuk memperkuat laporan</p>
                                                <p>• Pastikan tanggal sesuai dengan hari kerja</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informasi Dasar */}
                                    <div className="mt-6 sm:mt-8">
                                        <h1 className="font-medium text-sm sm:text-base">Informasi Dasar</h1>
                                        <hr className="border-gray-200 mt-2" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2 mt-4">
                                            <label className="text-sm font-small">Tanggal <span className="text-red-600">*</span></label>
                                            <Input
                                                type="date"
                                                name="tanggal"
                                                value={formEditData.tanggal}
                                                onChange={handleChange}
                                                required
                                                className="bg-gray-100 border border-gray-400 cursor-not-allowed text-sm"
                                                disabled
                                            />
                                        </div>
                                        <div className="grid gap-2 mt-4">
                                            <label className="text-sm font-small">Status</label>
                                            <Input
                                                type="text"
                                                value="Edit Mode"
                                                disabled
                                                className="bg-gray-100 border border-gray-400 cursor-not-allowed text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Kegiatan Harian */}
                                    <div className="mt-6 sm:mt-8">
                                        <h1 className="font-medium text-sm sm:text-base">Kegiatan Harian</h1>
                                        <hr className="border-gray-200 mt-2" />
                                    </div>

                                    <div className="grid gap-2 mt-4">
                                        <div className="flex flex-row justify-between">
                                            <label className="text-sm font-small">Deskripsi Kegiatan <span className="text-red-600">*</span></label>
                                            <div className={`px-2 py-1 rounded-sm text-xs ${formEditData.kegiatan.length < 50 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                                {formEditData.kegiatan.length}/50 minimum
                                            </div>
                                        </div>
                                        <Textarea
                                            name="kegiatan"
                                            value={formEditData.kegiatan}
                                            onChange={handleChange}
                                            placeholder="Deskripsikan kegiatan yang Anda lakukan hari ini secara detail..."
                                            className="placeholder:text-xs placeholder:text-gray-400 h-25 sm:h-25 text-sm"
                                            required
                                        />
                                    </div>

                                    {/* Kendala yang dihadapi */}
                                    <div className="mt-6 sm:mt-8">
                                        <h1 className="font-medium text-sm sm:text-base">Kendala yang dihadapi</h1>
                                        <hr className="border-gray-200 mt-2" />
                                    </div>

                                    <div className="grid gap-2 mt-4">
                                        <div className="flex flex-row justify-between">
                                            <label className="text-sm font-small">Deskripsi Kendala <span className="text-red-600">*</span></label>
                                            <div className={`px-2 py-1 rounded-sm text-xs ${formEditData.kendala.length < 50 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                                {formEditData.kendala.length}/50 minimum
                                            </div>
                                        </div>
                                        <Textarea
                                            name="kendala"
                                            value={formEditData.kendala}
                                            onChange={handleChange}
                                            placeholder="Tuliskan kendala atau hambatan yang Anda hadapi hari ini..."
                                            className="placeholder:text-xs placeholder:text-gray-400 h-25 sm:h-25 text-sm"
                                            required
                                        />
                                    </div>

                                    {/* Dokumentasi Pendukung */}
                                    <div className="mt-6 sm:mt-8">
                                        <h1 className="font-medium text-sm sm:text-base">Dokumentasi Pendukung</h1>
                                        <hr className="border-gray-200 mt-2" />
                                    </div>

                                    <div className="flex flex-col gap-2 mt-4 mb-6 w-full">
                                        <label className="text-sm font-small">Upload File (Opsional)</label>

                                        {formEditData.existingFilePath && !formEditData.removeFile && !formEditData.file ? (
                                            <div className="flex items-center justify-between border rounded-lg p-3 bg-green-50 border-2 border-dashed border-green-300 w-full">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 bg-green-100 rounded-md items-center justify-center flex-shrink-0">
                                                        <File className="text-green-600" size={16} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 break-words">
                                                        <span className="text-xs sm:text-[14px] text-green-900">File terpilih</span>
                                                        <span className="text-xs font-medium text-green-700">{formEditData.existingFilePath.split('/').pop()}</span>
                                                    </div>
                                                </div>
                                                <Trash2 size={16} className="text-red-600 ml-2 cursor-pointer hover:text-red-800 flex-shrink-0" onClick={handleRemoveFile} />
                                            </div>
                                        ) : formEditData.file ? (
                                            <div className="flex items-center justify-between border rounded-lg p-3 bg-green-50 border-2 border-dashed border-green-300 w-full">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 bg-green-100 rounded-md items-center justify-center flex-shrink-0">
                                                        <File className="text-green-600" size={16} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 break-words">
                                                        <span className="text-xs sm:text-[14px] text-green-900">File terpilih</span>
                                                        <span className="text-xs font-medium text-green-700">{formEditData.file.name}</span>
                                                    </div>
                                                </div>
                                                <Trash2 size={16} className="text-red-600 ml-2 cursor-pointer hover:text-red-800 flex-shrink-0" onClick={() =>
                                                    setFormEditData((prev) => ({ ...prev, file: null }))
                                                } />
                                            </div>
                                        ) : (
                                            <div
                                                className={cn(
                                                    "border-2 border-dashed rounded-lg p-3 sm:p-6 flex flex-col items-center justify-center gap-2 w-full",
                                                    "hover:border-blue-500 transition"
                                                )}
                                            >
                                                <div className="flex items-center justify-center bg-gray-100 h-8 w-8 sm:h-11 sm:w-11 rounded-md mb-1">
                                                    <Upload className="text-gray-400" size={16} />
                                                </div>
                                                <p className="text-xs sm:text-sm font-medium text-center">Pilih file dokumentasi</p>
                                                <p className="text-xs text-gray-500 text-center">
                                                    PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                                                </p>
                                                <Button
                                                    asChild
                                                    type="button"
                                                    variant="default"
                                                    className="mt-2 bg-blue-700 hover:bg-blue-900 cursor-pointer text-xs h-8 w-auto px-4"
                                                >
                                                    <label htmlFor="fileInputEdit">Browse File</label>
                                                </Button>
                                                <input
                                                    id="fileInputEdit"
                                                    name="file"
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        )}
                                        <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1">Jenis file yang dapat diupload: Screenshot hasil kerja, dokumentasi code, foto kegiatan</p>
                                    </div>
                                </div>
                                <div className={`flex flex-col ${logbookbyId?.status_verifikasi === "ditolak" ? "gap-4" : "gap-2"} pt-6 border-t bg-white flex-shrink-0`}>
                                    {logbookbyId?.status_verifikasi === "ditolak" &&
                                        <div className="flex items-center justify-center gap-2 px-2 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-600">
                                            <CircleAlert size={14} />
                                            <p className="font-small text-xs sm:text-[13px]">Jurnal ini ditolak dan perlu diperbaiki</p>
                                        </div>
                                    }
                                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                        <DialogClose asChild>
                                            <Button variant="outline" className="w-full sm:w-30 cursor-pointer order-2 sm:order-1">Batal</Button>
                                        </DialogClose>
                                        <Button type="submit" className="w-full sm:w-40 bg-gradient-to-r from-cyan-500 to-sky-600 
                                        transition-all duration-300 ease-in-out hover:shadow-lg hover:from-cyan-600 hover:to-sky-700 cursor-pointer order-1 sm:order-2">
                                            Simpan
                                        </Button>
                                    </div>
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