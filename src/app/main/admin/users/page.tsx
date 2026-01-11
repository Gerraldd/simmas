"use client";

import * as React from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DialogClose } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Eye, EyeOff, Shield, GraduationCap, BookOpen, UserCheck, UserX, Search, Funnel, Mail, SquarePen, Trash2, Plus, Users } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import LoadingDataPage from "@/components/loading/admin/loading-data";
import Cookies from "js-cookie";

interface UserType {
    id: number;
    name: string;
    email: string;
    role: "admin" | "guru" | "siswa";
    email_verified_at: string;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [search, setSearch] = useState("");
    const [isClicked, setIsClicked] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "siswa",
        password: "",
        confirmPassword: "",
        verified: false,
        // Data siswa
        nis: "",
        kelas: "",
        jurusan: "",
        alamat_siswa: "",
        telepon_siswa: "",
        // Data guru
        nip: "",
        alamat_guru: "",
        telepon_guru: ""
    });
    const [formEditData, setFormEditData] = useState({
        name: "",
        email: "",
        role: "siswa",
        verified: false,
        // Data siswa
        nis: "",
        kelas: "",
        jurusan: "",
        alamat_siswa: "",
        telepon_siswa: "",
        // Data guru
        nip: "",
        alamat_guru: "",
        telepon_guru: ""
    });
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [openTambah, setOpenTambah] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [filterRole, setFilterRole] = useState("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPage, setTotalPages] = useState(1);
    const [total, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [firstLoad, setFirstLoad] = useState(true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({ ...prev, role: value }));
        setFormEditData((prev) => ({ ...prev, role: value }));
    };

    function getTokenFromCookie() {
        return Cookies.get("token") || "";
    }

    // Untuk menangani submit form - tambah users
    const handleSubmitTambahUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Password tidak sama!");
            return;
        }

        try {
            const token = getTokenFromCookie();

            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                 },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    password: formData.password,
                    email_verified_at: formData.verified,
                    // Data Siswa
                    nis: formData.nis,
                    kelas: formData.kelas,
                    jurusan: formData.jurusan,
                    alamat_siswa: formData.alamat_siswa,
                    telepon_siswa: formData.telepon_siswa,
                    // Data guru
                    nip: formData.nip,
                    alamat_guru: formData.alamat_guru,
                    telepon_guru: formData.telepon_guru
                }),
            });

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || "Gagal menambah user");
                return;
            }

            toast.success("Berhasil menambah user");

            // refresh tabel data
            fetchUsers();
            fetchUsersSearch();

            // reset form
            setFormData({
                name: "",
                email: "",
                role: "siswa",
                password: "",
                confirmPassword: "",
                verified: false,
                // Data siswa
                nis: "",
                kelas: "",
                jurusan: "",
                alamat_siswa: "",
                telepon_siswa: "",
                // Data guru
                nip: "",
                alamat_guru: "",
                telepon_guru: ""
            });

            setOpenTambah(false); // tutup dialog form jika berhasil menambahkan user
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menambah user");
        }
    };

    // ambil data untuk form edit user
    const handleOpenEdit = async (userId: number) => {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Gagal mengambil data user");

            setFormEditData({
                name: data.data.name || "",
                email: data.data.email || "",
                role: data.data.role || "siswa",
                verified: !!data.data.email_verified_at,
                // Data siswa (gunakan optional chaining biar aman)
                nis: data.data.siswa?.nis || "",
                kelas: data.data.siswa?.kelas || "",
                jurusan: data.data.siswa?.jurusan || "",
                alamat_siswa: data.data.siswa?.alamat || "",
                telepon_siswa: data.data.siswa?.telepon || "",
                // Data guru
                nip: data.data.guru?.nip || "",
                alamat_guru: data.data.guru?.alamat || "",
                telepon_guru: data.data.guru?.telepon || "",
            });

            setEditingUserId(userId);
            setOpenEdit(true);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data user");
        }
    };


    // untuk menangani edit user
    const handleSubmitEditUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/users/${editingUserId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                 },
                body: JSON.stringify({
                    name: formEditData.name,
                    email: formEditData.email,
                    role: formEditData.role,
                    // kirim date string kalau verified true
                    email_verified_at: formEditData.verified,
                    // Data siswa
                    nis: formEditData.nis,
                    kelas: formEditData.kelas,
                    jurusan: formEditData.jurusan,
                    alamat_siswa: formEditData.alamat_siswa,
                    telepon_siswa: formEditData.telepon_siswa,
                    // Data guru
                    nip: formEditData.nip,
                    alamat_guru: formEditData.alamat_guru,
                    telepon_guru: formEditData.telepon_guru,
                }),
            });

            if (!res.ok) {
                toast.error("Gagal memperbarui user");
                return;
            }

            toast.success("Berhasil memperbarui user");

            // refresh tabel data
            fetchUsers();
            fetchUsersSearch();

            // Reset form
            setFormEditData({
                name: "",
                email: "",
                role: "siswa",
                verified: false,
                nis: "",
                kelas: "",
                jurusan: "",
                alamat_siswa: "",
                telepon_siswa: "",
                nip: "",
                alamat_guru: "",
                telepon_guru: "",
            });

            setOpenEdit(false);
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat memperbarui user");
        }
    };


    // untuk menangani hapus user
    async function handleDeleteUser(userId: number) {
        try {
            const token = getTokenFromCookie();
            
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                } 
            });

            if (!res.ok) {
                toast.error("Gagal menghapus user");
                return;
            }

            // Refresh data user
            fetchUsers();
            fetchUsersSearch();

            toast.success("User berhasil dihapus");
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan server");
        }
    }

    // handle email verification
    const handleVerifiedChange = (val: string) => {
        setFormData((prev) => ({
            ...prev,
            verified: val === "verified", // kalau pilih verified → true
        }));
        setFormEditData((prev) => ({
            ...prev,
            verified: val === "verified", // kalau pilih verified → true
        }));
    };

    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 150); // durasi animasi
    };

    async function fetchUsers() {
        try {
            if (firstLoad) {
                setFirstLoad(true);
                setLoading(true);
            }

            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();
            console.log(data);

            setUsers(data.data || []);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
            setFirstLoad(false);
        }
    }

    async function fetchUsersSearch() {
        try {
            const token = getTokenFromCookie();

            const res = await fetch(`/api/admin/users?page=1&limit=9999`, {
                cache: "no-store",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }); 
            if (!res.ok) throw new Error("Gagal mengambil data users (search)");

            const data = await res.json();
            const allUsers: UserType[] = data?.data || [];

            setAllUsers(allUsers);
        } catch (err) {
            console.error("Gagal ambil data users search:", err);
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchUsersSearch();
    }, [page, limit]);

    const filteredUsersSearch = Array.isArray(allUsers)
        ? allUsers.filter((u) =>
            [u.name, u.email, u.role]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
            .filter((u) => (filterRole === "all" ? true : u.role === filterRole))
        : [];

    const filteredUsers = Array.isArray(users) ? users : [];

    // Tentukan data tabel yang akan ditampilkan
    const isSearching = search.trim() !== "" || filterRole !== "all";

    const displayedUsers = isSearching
        ? filteredUsersSearch // tampilkan semua hasil saat search/filter
        : filteredUsers;      // tampilkan per page biasa

    const currentPage = isSearching ? 1 : page;
    const totalPages = isSearching ? 1 : totalPage;
    const totalItems = isSearching ? displayedUsers.length : total;

    if (loading && firstLoad) return <LoadingDataPage />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-2xl">Manajemen User</h2>
            </div>

            {/* Card User */}
            <Card className="shadow-md border w-full">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <Users className="text-cyan-500" size={22} />
                        <CardTitle className="flex items-center gap-2">Daftar User</CardTitle>
                    </div>
                    <Dialog open={openTambah} onOpenChange={setOpenTambah}>
                        <DialogTrigger asChild>
                            <Button onClick={handleClick} className="bg-gradient-to-r from-cyan-500 to-sky-600 h-10 rounded-lg text-white flex gap-2 items-center justify-center
                            cursor-pointer hover:from-cyan-600 hover:to-sky-700">
                                <Plus size={20} /> Tambah User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[600px] sm:max-w-2xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden rounded-lg flex flex-col">
                            {/* Form */}
                            <form onSubmit={handleSubmitTambahUser} className="grid gap-3 py-1 h-full">

                                <DialogHeader>
                                    <DialogTitle>Tambah User Baru</DialogTitle>
                                    <DialogDescription>
                                        Lengkapi semua informasi yang diperlukan
                                    </DialogDescription>
                                </DialogHeader>
                                {/* Garis full width */}
                                <div className="w-full border-t mt-2 border-gray-200" />

                                <div className="flex flex-col gap-4 sm:gap-6 overflow-y-auto px-1 max-h-[calc(70vh-180px)] sm:max-h-[calc(95vh-200px)] px-2">

                                    {/* Nama Lengkap */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Nama Lengkap <span className="text-red-500">*</span></label>
                                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="Masukkan nama lengkap" className="text-sm" required />
                                    </div>

                                    {/* Email */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                        <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Contoh: user@email.com" className="text-sm" />
                                    </div>

                                    {/* Role */}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Role <span className="text-red-500">*</span></label>
                                        <Select defaultValue="siswa" value={formData.role} onValueChange={handleRoleChange} required >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="siswa">Siswa</SelectItem>
                                                <SelectItem value="guru">Guru</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Form Siswa */}
                                    {formData.role === "siswa" && (
                                        <div className="grid gap-2 px-4 bg-cyan-50 rounded-lg py-4 border border-cyan-300">
                                            <div className="flex flex-row gap-2 items-center text-md text-cyan-900">
                                                <GraduationCap size={24} />
                                                <p className="font-medium">Data Siswa</p>
                                            </div>

                                            {/* NIS */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-medium">NIS <span className="text-red-500">*</span></label>
                                                <Input type="text" name="nis" value={formData.nis || ""} onChange={handleChange} placeholder="Masukkan NIS Siswa" className="text-sm" />
                                            </div>

                                            {/* Kelas */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-medium">Kelas <span className="text-red-500">*</span></label>
                                                <Input type="text" name="kelas" value={formData.kelas || ""} onChange={handleChange} placeholder="Contoh: XII RPL C" className="text-sm" />
                                            </div>

                                            {/* Jurusan */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-medium">Jurusan <span className="text-red-500">*</span></label>
                                                <Select value={formData.jurusan || ""} onValueChange={(val) => setFormData(prev => ({ ...prev, jurusan: val }))} required>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih jurusan" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60 overflow-y-auto">
                                                        <SelectItem value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</SelectItem>
                                                        <SelectItem value="Teknik Komputer dan Jaringan">Teknik Komputer dan Jaringan</SelectItem>
                                                        <SelectItem value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</SelectItem>
                                                        <SelectItem value="Teknik Pemesinan">Teknik Pemesinan</SelectItem>
                                                        <SelectItem value="Teknik Bangunan">Teknik Bangunan</SelectItem>
                                                        <SelectItem value="Teknik Sepeda Motor">Teknik Sepeda Motor</SelectItem>
                                                        <SelectItem value="Akuntansi dan Keuangan Lembaga">Akuntansi dan Keuangan Lembaga</SelectItem>
                                                        <SelectItem value="Otomatisasi dan Tata Kelola Perkantoran">Otomatisasi dan Tata Kelola Perkantoran</SelectItem>
                                                        <SelectItem value="Farmasi">Farmasi</SelectItem>
                                                        <SelectItem value="Perhotelan">Perhotelan</SelectItem>
                                                        <SelectItem value="Tata Boga">Tata Boga</SelectItem>
                                                        <SelectItem value="Tata Busana">Tata Busana</SelectItem>
                                                        <SelectItem value="Multimedia">Multimedia</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Alamat */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-medium">Alamat <span className="text-red-500">*</span></label>
                                                <Input type="text" name="alamat_siswa" value={formData.alamat_siswa || ""} onChange={handleChange} placeholder="Masukkan Alamat Siswa" className="text-sm" />
                                            </div>

                                            {/* Telepon */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-medium">Telepon <span className="text-red-500">*</span></label>
                                                <Input type="text" name="telepon_siswa" value={formData.telepon_siswa || ""} onChange={handleChange} placeholder="Masukkan Telepon Siswa" className="text-sm" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Form Guru */}
                                    {formData.role === "guru" && (
                                        <div className="grid gap-2 px-4 bg-blue-50 rounded-lg py-4 border border-blue-300">
                                            <div className="flex flex-row gap-2 items-center text-md text-blue-900">
                                                <BookOpen size={24} />
                                                <p className="font-medium">Data Guru</p>
                                            </div>

                                            {/* NIP */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-medium">NIP <span className="text-red-500">*</span></label>
                                                <Input type="text" name="nip" value={formData.nip || ""} onChange={handleChange} placeholder="Masukkan NIP Guru" className="text-sm" />
                                            </div>

                                            {/* Alamat */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-medium">Alamat <span className="text-red-500">*</span></label>
                                                <Input type="text" name="alamat_guru" value={formData.alamat_guru || ""} onChange={handleChange} placeholder="Masukkan Alamat Guru" className="text-sm" />
                                            </div>

                                            {/* Telepon */}
                                            <div className="grid gap-2 mt-2">
                                                <label className="text-sm font-medium">Telepon <span className="text-red-500">*</span></label>
                                                <Input type="text" name="telepon_guru" value={formData.telepon_guru || ""} onChange={handleChange} placeholder="Masukkan Telepon Guru" className="text-sm" />
                                            </div>
                                        </div>
                                    )}


                                    {/* Password */}
                                    <div className="grid gap-2 relative">
                                        <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                                        <Input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Masukkan password (min. 6 karakter)" className="text-sm" required />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute bottom-6 mt-1 right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    {/* Konfirmasi Password */}
                                    <div className="grid gap-2 relative">
                                        <label className="text-sm font-medium">Konfirmasi Password <span className="text-red-500">*</span></label>
                                        <Input type={showPassword2 ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Ulangi password" className="text-sm" required />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword2(!showPassword2)}
                                            className="absolute bottom-6 mt-1 right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                                        >
                                            {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    {/* Email Verification */}
                                    <div className="grid gap-2 mb-6">
                                        <label className="text-sm font-medium">Email Verification</label>
                                        <Select defaultValue="unverified" value={formData.verified ? "verified" : "unverified"} onValueChange={handleVerifiedChange} >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="verified">Verified</SelectItem>
                                                <SelectItem value="unverified">Unverified</SelectItem>
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
                                    <Button className="w-full sm:w-50 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-600 cursor-pointer order-1 sm:order-2" >Simpan</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {/* Search + Filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                        <div className="relative w-full sm:w-130">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Cari nama, email, atau role..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:gap-0 sm:flex-row">
                             <div className="flex flex-row items-center justify-center">
                                 <Funnel className="mr-3" size={18} />
                                 <Select value={filterRole} onValueChange={setFilterRole}>
                                     <SelectTrigger className="w-full max-w-[200px] sm:w-[200px]">
                                         <SelectValue placeholder="Semua Role" />
                                     </SelectTrigger>
                                     <SelectContent>
                                         <SelectItem value="all">Semua Role</SelectItem>
                                         <SelectItem value="admin">Admin</SelectItem>
                                         <SelectItem value="guru">Guru</SelectItem>
                                         <SelectItem value="siswa">Siswa</SelectItem>
                                     </SelectContent>
                                 </Select>
                             </div>
                             <div className="flex flex-row ml-2 items-center justify-center">
                                 <h1 className="text-sm mr-2">Tampilkan: </h1>
                                 <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                                     <SelectTrigger className="w-[370px] max-w-[200px] sm:w-[140px]">
                                         <SelectValue placeholder="Tampilkan" />
                                     </SelectTrigger>
                                     <SelectContent>
                                         <SelectItem value="5">5</SelectItem>
                                         <SelectItem value="10">10</SelectItem>
                                         <SelectItem value="20">20</SelectItem>
                                     </SelectContent>
                                 </Select>
                                 <h1 className="text-sm ml-2">entri</h1>
                             </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="text-left bg-white">
                                    <th className="px-4 py-2 font-semibold">User</th>
                                    <th className="px-4 py-2 font-semibold">Email & Verifikasi</th>
                                    <th className="px-4 py-2 text-center font-semibold">Role</th>
                                    <th className="px-4 py-2 text-center font-semibold" >Terdaftar</th>
                                    <th className="px-4 py-2 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="border-t hover:bg-gray-50 transition"
                                    >
                                        {/* User */}
                                        <td className="px-4 py-6 flex items-center gap-3">
                                            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white flex items-center justify-center font-semibold">
                                                {u.name?.charAt(0).toUpperCase() ?? "?"}
                                            </div>
                                            <div>
                                                <p className="font-medium">{u.name ?? "Tanpa Nama"}</p>
                                                <p className="text-xs text-gray-500">ID: {u.id}</p>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Mail size={14} /> {u.email}
                                            </div>
                                            {u.email_verified_at ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md text-xs font-medium bg-green-100 text-green-600 mt-2 border border-green-300">
                                                    <UserCheck size={14} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md text-xs font-medium bg-red-100 text-red-600 mt-2 border border-red-300">
                                                    <UserX size={14} /> Unverified
                                                </span>

                                            )}
                                        </td>

                                        {/* Role */}
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
      ${u.role === "admin"
                                                        ? "bg-purple-100 text-purple-600 border border-purple-300"
                                                        : u.role === "guru"
                                                            ? "bg-blue-100 text-blue-600 border border-blue-300"
                                                            : u.role === "siswa"
                                                                ? "bg-cyan-100 text-cyan-600 border border-cyan-300"
                                                                : "bg-green-100 text-green-600 border border-green-300"
                                                    }`}
                                            >
                                                {u.role === "admin" && <Shield size={14} />}
                                                {u.role === "guru" && <GraduationCap size={14} />}
                                                {u.role === "siswa" && <BookOpen size={14} />}
                                                <span>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span>
                                            </span>
                                        </td>

                                        {/* Registered */}
                                        <td className="px-4 py-3 text-gray-600 text-center">
                                            {new Date(u.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 justify-center items-center">
                                                <button className="p-2 rounded text-gray-600 hover:text-yellow-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(255,255,0,0.8)] cursor-pointer" onClick={() => handleOpenEdit(u.id)}>
                                                    <SquarePen size={16} />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className="p-2 rounded text-gray-600 hover:text-red-600 hover:scale-110 transition-transform hover:drop-shadow-[0_0_12px_rgba(255,0,0,0.8)] cursor-pointer">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-xl sm:w-full sm:max-w-[450px] max-w-[350px]">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Data user <b>{u.name}</b> akan dihapus permanen dan tidak bisa dikembalikan.
                                                                Apakah kamu yakin?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-600 hover:bg-red-700 cursor-pointer"
                                                                onClick={() => handleDeleteUser(u.id)}>
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
                            <DialogTrigger asChild>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[600px] sm:max-w-2xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden rounded-lg flex flex-col">
                                {/* Form */}
                                <form onSubmit={handleSubmitEditUser} className="grid gap-3 py-1">

                                    <DialogHeader>
                                        <DialogTitle>Edit User</DialogTitle>
                                        <DialogDescription>
                                            Perbarui informasi user
                                        </DialogDescription>
                                    </DialogHeader>
                                    {/* Garis full width */}
                                    <div className="w-full border-t mt-2 border-gray-200" />

                                    <div className="flex flex-col gap-6 overflow-y-auto max-h-[50vh] px-2">

                                        {/* Nama Lengkap */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Nama Lengkap <span className="text-red-500">*</span></label>
                                            <Input name="name" value={formEditData.name} onChange={handleChange} placeholder="Masukkan nama lengkap" required className="text-sm" />
                                        </div>

                                        {/* Email */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                            <Input type="email" name="email" value={formEditData.email} onChange={handleChange} placeholder="Contoh: user@email.com" className="text-sm" />
                                        </div>

                                        {/* Role */}
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Role <span className="text-red-500">*</span></label>
                                            <Select defaultValue="siswa" value={formEditData.role} onValueChange={handleRoleChange} required >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="siswa">Siswa</SelectItem>
                                                    <SelectItem value="guru">Guru</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Form Siswa */}
                                        {formEditData.role === "siswa" && (
                                            <div className="grid gap-2 px-4 bg-cyan-50 rounded-lg py-4 border border-cyan-300">
                                                <div className="flex flex-row gap-2 items-center text-md text-cyan-900">
                                                    <GraduationCap size={24} />
                                                    <p className="font-medium">Data Siswa</p>
                                                </div>

                                                {/* NIS */}
                                                <div className="grid gap-2 mt-2">
                                                    <label className="text-sm font-medium">NIS <span className="text-red-500">*</span></label>
                                                    <Input type="text" name="nis" value={formEditData.nis || ""} onChange={handleChange} placeholder="Masukkan NIS Siswa" className="text-sm" />
                                                </div>

                                                {/* Kelas */}
                                                <div className="grid gap-2 mt-2">
                                                    <label className="text-sm font-medium">Kelas <span className="text-red-500">*</span></label>
                                                    <Input type="text" name="kelas" value={formEditData.kelas || ""} onChange={handleChange} placeholder="Contoh: XII RPL C" className="text-sm" />
                                                </div>

                                                {/* Jurusan */}
                                                <div className="grid gap-2 mt-2">
                                                    <label className="text-sm font-medium">Jurusan <span className="text-red-500">*</span></label>
                                                    <Select value={formEditData.jurusan || ""} onValueChange={(val) => setFormEditData(prev => ({ ...prev, jurusan: val }))} required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih jurusan" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60 overflow-y-auto">
                                                            <SelectItem value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</SelectItem>
                                                            <SelectItem value="Teknik Komputer dan Jaringan">Teknik Komputer dan Jaringan</SelectItem>
                                                            <SelectItem value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</SelectItem>
                                                            <SelectItem value="Teknik Pemesinan">Teknik Pemesinan</SelectItem>
                                                            <SelectItem value="Teknik Bangunan">Teknik Bangunan</SelectItem>
                                                            <SelectItem value="Teknik Sepeda Motor">Teknik Sepeda Motor</SelectItem>
                                                            <SelectItem value="Akuntansi dan Keuangan Lembaga">Akuntansi dan Keuangan Lembaga</SelectItem>
                                                            <SelectItem value="Otomatisasi dan Tata Kelola Perkantoran">Otomatisasi dan Tata Kelola Perkantoran</SelectItem>
                                                            <SelectItem value="Farmasi">Farmasi</SelectItem>
                                                            <SelectItem value="Perhotelan">Perhotelan</SelectItem>
                                                            <SelectItem value="Tata Boga">Tata Boga</SelectItem>
                                                            <SelectItem value="Tata Busana">Tata Busana</SelectItem>
                                                            <SelectItem value="Multimedia">Multimedia</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Alamat */}
                                                <div className="grid gap-2 mt-2">
                                                    <label className="text-sm font-medium">Alamat <span className="text-red-500">*</span></label>
                                                    <Input type="text" name="alamat_siswa" value={formEditData.alamat_siswa || ""} onChange={handleChange} placeholder="Masukkan Alamat Siswa" className="text-sm" />
                                                </div>

                                                {/* Telepon */}
                                                <div className="grid gap-2 mt-2">
                                                    <label className="text-sm font-medium">Telepon <span className="text-red-500">*</span></label>
                                                    <Input type="text" name="telepon_siswa" value={formEditData.telepon_siswa || ""} onChange={handleChange} placeholder="Masukkan Telepon Siswa" className="text-sm" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Form Guru */}
                                        {formEditData.role === "guru" && (
                                            <div className="grid gap-2 px-4 bg-blue-50 rounded-lg py-4 border border-blue-300">
                                                <div className="flex flex-row gap-2 items-center text-md text-blue-900">
                                                    <BookOpen size={24} />
                                                    <p className="font-medium">Data Guru</p>
                                                </div>

                                                {/* NIP */}
                                                <div className="grid gap-2 mt-2">
                                                    <label className="text-sm font-medium">NIP <span className="text-red-500">*</span></label>
                                                    <Input type="text" name="nip" value={formEditData.nip || ""} onChange={handleChange} placeholder="Masukkan NIP Guru" className="text-sm" />
                                                </div>

                                                {/* Alamat */}
                                                <div className="grid gap-2 mt-2">
                                                    <label className="text-sm font-medium">Alamat <span className="text-red-500">*</span></label>
                                                    <Input type="text" name="alamat_guru" value={formEditData.alamat_guru || ""} onChange={handleChange} placeholder="Masukkan Alamat Guru" className="text-sm" />
                                                </div>

                                                {/* Telepon */}
                                                <div className="grid gap-2 mt-2">
                                                    <label className="text-sm font-medium">Telepon <span className="text-red-500">*</span></label>
                                                    <Input type="text" name="telepon_guru" value={formEditData.telepon_guru || ""} onChange={handleChange} placeholder="Masukkan Telepon Guru" className="text-sm" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-300">
                                            <p className="text-sm text-blue-700"><span className="font-bold">Catatan: </span>Untuk mengubah password, silakan gunakan fitur reset password yang terpisah.</p>
                                        </div>

                                        {/* Email Verification */}
                                        <div className="grid gap-2 mb-6">
                                            <label className="text-sm font-medium">Email Verification</label>
                                            <Select defaultValue="unverified" value={formEditData.verified ? "verified" : "unverified"} onValueChange={handleVerifiedChange} >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="verified">Verified</SelectItem>
                                                    <SelectItem value="unverified">Unverified</SelectItem>
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
                                        <Button className="w-full sm:w-50 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-600 cursor-pointer order-1 sm:order-2" >Simpan</Button>
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
                    <div className="flex flex-col sm:flex-row items-center py-2 w-full">
                        {/* Text kiri */}
                        <p className="text-sm text-gray-500">
                            Menampilkan {((page - 1) * limit) + 1} sampai {Math.min(page * limit, total)} dari {total} entri
                        </p>

                        {/* Pagination di kanan */}
                        <div className="mt-4 sm:mt-0 mx-auto sm:mx-0 sm:ml-auto">
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
        </div >
    );
}