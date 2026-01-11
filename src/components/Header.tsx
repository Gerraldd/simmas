"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LogOut, User, Menu } from "lucide-react"; // ⬅️ Tambahkan Menu
import { useSchoolSettings } from "@/context/SchoolSettingsContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface HeaderProps {
    user: {
        name: string;
        role: string;
        email: string;
    };
    onToggleSidebar?: () => void; // ⬅️ Tambahkan agar bisa buka sidebar dari parent
}

export default function Header({ user, onToggleSidebar }: HeaderProps) {
    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const { settings } = useSchoolSettings();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState(user.name);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formEditProfile, setFormEditProfile] = useState({
        name: "",
        nis: "",
        kelas: "",
        jurusan: "",
        alamat_siswa: "",
        telepon_siswa: "",
        nip: "",
        alamat_guru: "",
        telepon_guru: "",
    });
    
    const fetchUserData = async () => {
        try {
            const token = Cookies.get("token");
            if (!token) return;
            const decoded: any = jwtDecode(token);
            const userId = decoded?.id;

            const res = await fetch(`/api/profile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (res.ok && data?.data) {
                const u = data.data;
                setFormEditProfile({
                    name: u.name ?? "",
                    nis: u.siswa?.nis ?? "",
                    kelas: u.siswa?.kelas ?? "",
                    jurusan: u.siswa?.jurusan ?? "",
                    alamat_siswa: u.siswa?.alamat ?? "",
                    telepon_siswa: u.siswa?.telepon ?? "",
                    nip: u.guru?.nip ?? "",
                    alamat_guru: u.guru?.alamat ?? "",
                    telepon_guru: u.guru?.telepon ?? "",
                });
                setOpen(true);
            } else {
                toast.error("Gagal memuat data profil");
            }
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat memuat profil");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormEditProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            if (!token) throw new Error("Token tidak ditemukan");

            const decoded: any = jwtDecode(token);
            const userId = decoded?.id;
            const role = decoded?.role;

            const res = await fetch(`/api/profile/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formEditProfile.name,
                    role: role,
                    nis: formEditProfile.nis,
                    kelas: formEditProfile.kelas,
                    jurusan: formEditProfile.jurusan,
                    alamat_siswa: formEditProfile.alamat_siswa,
                    telepon_siswa: formEditProfile.telepon_siswa,
                    nip: formEditProfile.nip,
                    alamat_guru: formEditProfile.alamat_guru,
                    telepon_guru: formEditProfile.telepon_guru,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Profil berhasil diperbarui!");
                setDisplayName(formEditProfile.name);
                setOpen(false);
            } else {
                toast.error(data.message || "Gagal memperbarui profil");
            }
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat memperbarui profil");
        } finally {
            setLoading(false);
        }
    };

    async function logout() {
        try {
            const token = Cookies.get("token");

            const res = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Logout berhasil!");
                router.push("/auth/login");
            } else {
                toast.error(data.error || "Gagal Logout!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat logout");
        }
    }

    return (
        <header className="w-full flex items-center justify-between px-4 sm:px-6 py-[7px] bg-white border-b shadow-sm sticky top-0 z-50">
            {/* LEFT: Hamburger + Logo */}
            <div className="flex items-center gap-3">
                {/* Hamburger hanya muncul di mobile */}
                <button
                    onClick={() => {
                        if (onToggleSidebar) onToggleSidebar();
                        try {
                            window.dispatchEvent(new CustomEvent("toggle-sidebar"));
                        } catch {}
                    }}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={22} className="text-gray-700" />
                </button>

                {/* Logo dan nama sekolah */}
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {settings.logo_url ? (
                            <img src={settings.logo_url} alt="Logo Sekolah" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400">Logo</span>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="font-bold text-black text-sm sm:text-base">{settings.nama_sekolah || "Nama Sekolah   "}</h2>
                        <h2 className="font-medium text-gray-500 text-xs sm:text-sm">Sistem Manajemen Magang Siswa</h2>
                    </div>
                </div>
            </div>

            {/* RIGHT: User Info */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Tanggal & sapaan (disembunyikan di layar kecil) */}
                <div className="hidden lg:flex flex-col text-end text-gray-600 text-sm">
                    <span>{today}</span>
                    <span>Selamat datang, {user.name}</span>
                </div>

                {/* Dropdown User */}
                <DropdownMenu onOpenChange={setIsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 sm:gap-3 hover:bg-gray-100 rounded-lg pr-3 py-[6px] cursor-pointer transition-all duration-300 ease-in-out">
                            <div className="ml-2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 flex items-center justify-center shadow-md">
                                <User size={20} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-sm truncate max-w-[150px]">{displayName}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                            <ChevronDown 
                                className={`text-gray-500 transition-transform duration-200 ease-in-out ${
                                    isDropdownOpen ? 'rotate-180' : 'rotate-0'
                                }`} 
                                size={16} 
                            />
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48 sm:w-56">
                        <DropdownMenuLabel className="text-xs text-start">
                            <p className="font-semibold capitalize text-[13px]">{user.name}</p>
                            <p className="font-normal text-[12px]">{user.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user.role != "admin" && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => fetchUserData()}>
                                <User size={14} className="mr-1" /> Profile
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => logout()}>
                            <LogOut size={14} className="mr-1" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-[90vw] max-w-[95vw] sm:w-[800px] sm:max-w-2xl max-h-[60vh] sm:max-h-[95vh] overflow-hidden rounded-lg flex flex-col">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="flex flex-row items-center gap-1 text-lg font-bold justify-center sm:justify-start">
                            <User className="text-cyan-600" size={20} /> Edit Profil{" "}
                            {user.role === "siswa" ? "Siswa" : "Guru"}
                        </DialogTitle>
                        <DialogDescription>Perbarui informasi pribadi Anda.</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto px-2 py-2">
                        {user.role === "siswa" ? (
                            <>
                                <div className="grid gap-1.5">
                                    <Label>Nama Siswa</Label>
                                    <Input name="name" value={formEditProfile.name} onChange={handleChange} className="text-sm placeholder:text-sm"/>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>NIS</Label>
                                    <Input name="nis" value={formEditProfile.nis} onChange={handleChange} className="text-sm placeholder:text-sm" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Kelas</Label>
                                    <Input name="kelas" value={formEditProfile.kelas} onChange={handleChange} className="text-sm placeholder:text-sm" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Jurusan</Label>
                                    <Select
                                        onValueChange={(v) => setFormEditProfile((p) => ({ ...p, jurusan: v }))}
                                        value={formEditProfile.jurusan}
                                    >
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
                                <div className="grid gap-1.5">
                                    <Label>Alamat</Label>
                                    <Textarea
                                        name="alamat_siswa"
                                        value={formEditProfile.alamat_siswa}
                                        onChange={handleChange}
                                        className="text-sm placeholder:text-sm"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Telepon</Label>
                                    <Input
                                        name="telepon_siswa"
                                        value={formEditProfile.telepon_siswa}
                                        onChange={handleChange}
                                        className="text-sm placeholder:text-sm"
                                    />
                                </div>{formEditProfile.telepon_siswa.length > 20 &&
                                <div className="bg-red-50 p-4">                                            
                                    <span>Nomor Telepon tidak boleh lebih dari 20 karakter</span>
                                </div>}
                            </>
                        ) : (
                            <>
                                <div className="grid gap-1.5">
                                    <Label>Nama Guru</Label>
                                    <Input name="name" value={formEditProfile.name} onChange={handleChange} className="text-sm"/>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>NIP</Label>
                                    <Input name="nip" value={formEditProfile.nip} onChange={handleChange} className="text-sm" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Alamat</Label>
                                    <Textarea
                                        name="alamat_guru"
                                        value={formEditProfile.alamat_guru}
                                        onChange={handleChange}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Telepon</Label>
                                    <Input
                                        name="telepon_guru"
                                        value={formEditProfile.telepon_guru}
                                        onChange={handleChange}
                                        className="text-sm"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="flex justify-center gap-1 pt-6 border-t">
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full cursor-pointer">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white hover:from-cyan-600 hover:to-sky-700 w-full cursor-pointer"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </Button>

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    );
}
