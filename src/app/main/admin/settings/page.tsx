"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Globe, User, Hash, Settings, PenLine, School, MapPin, ImagePlus, Upload, Eye, Monitor, FileText, Printer, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSchoolSettings } from "@/context/SchoolSettingsContext";
import PengaturanSekolahSkeleton from '@/components/loading/admin/loading_settings'
import Cookies from "js-cookie";

// Komponen Spinner Soft
const SoftSpinner = () => (
    <div className="flex items-center justify-center">
        <div className="relative">
            <div className="w-8 h-8 border-2 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    </div>
);

// Komponen Loading Overlay
const LoadingOverlay = ({ isVisible }: { isVisible: boolean }) => {
    if (!isVisible) return null;
    
    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 shadow-2xl border flex flex-col items-center gap-4 min-w-[200px]">
                <SoftSpinner />
                <p className="text-sm font-medium text-gray-700">Menyimpan perubahan...</p>
            </div>
        </div>
    );
};

export default function PengaturanSekolahPage() {
    const [logo, setLogo] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        logo_url: "",
        nama_sekolah: "",
        alamat: "",
        telepon: "",
        email: "",
        website: "",
        kepala_sekolah: "",
        npsn: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>("");
    const { setSettings } = useSchoolSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    function getTokenFromCookie() {
        return Cookies.get("token") || "";
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setLogo(result);
                setFormData(prev => ({ ...prev, logo_url: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    async function fetchSettings() {
        try {
            // Always enter loading before fetch
            if (loading) {
                setLoading(true);
            }

            const token = getTokenFromCookie();

            const res = await fetch("/api/admin/settings", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Default empty settings shape
            const emptySettings = {
                logo_url: "",
                nama_sekolah: "",
                alamat: "",
                telepon: "",
                email: "",
                website: "",
                kepala_sekolah: "",
                npsn: "",
            };

            if (!res.ok) {
                // No settings yet or error → hydrate with empty defaults and stop loading
                setFormData(emptySettings);
                setSettings(emptySettings);
                setLogo(null);
                setLastUpdate("");
                return;
            }

            const data = await res.json();

            const settingsData = {
                logo_url: data.settings?.logo_url || "",
                nama_sekolah: data.settings?.nama_sekolah || "",
                alamat: data.settings?.alamat || "",
                telepon: data.settings?.telepon || "",
                email: data.settings?.email || "",
                website: data.settings?.website || "",
                kepala_sekolah: data.settings?.kepala_sekolah || "",
                npsn: data.settings?.npsn || "",
            };

            setFormData(settingsData);
            setSettings(settingsData);

            // Set logo state if present
            if (settingsData.logo_url) {
                setLogo(settingsData.logo_url);
            } else {
                setLogo(null);
            }

            setLastUpdate(data.settings?.updated_at || "");
        } catch (error) {
            console.error("Error fetching settings:", error);
            // On unexpected error, also hydrate empty and allow UI to render
            setFormData({
                logo_url: "",
                nama_sekolah: "",
                alamat: "",
                telepon: "",
                email: "",
                website: "",
                kepala_sekolah: "",
                npsn: "",
            });
            setSettings({
                logo_url: "",
                nama_sekolah: "",
                alamat: "",
                telepon: "",
                email: "",
                website: "",
                kepala_sekolah: "",
                npsn: "",
            });
            setLogo(null);
            setLastUpdate("");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    async function handleSubmit(e: any) {
        e.preventDefault();

        try {
            setSaving(true);
            const token = getTokenFromCookie();

            // Kirim data dengan logo yang sudah di-set
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            // Update state dengan data terbaru dari response
            if (data.settings) {
                setLastUpdate(data.settings.updated_at || "");
                setSettings(data.settings);
            } else {
                // Fallback jika response tidak sesuai format
                setLastUpdate(new Date().toISOString());
                setSettings(formData);
            }
            setIsEditing(false);

            toast.success("Pengaturan berhasil diubah");

            // Tampilkan notifikasi sukses (opsional)
            // alert("Data berhasil disimpan!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Gagal menyimpan data!");
        } finally {
            setSaving(false);
        }
    }

    function formatTanggal(dateString: string) {
        if (!dateString) return "";
        const date = new Date(dateString);

        const tanggal = date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        const jam = date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });

        return `${tanggal} pukul ${jam}`;
    }

    if (loading) return <PengaturanSekolahSkeleton />

    return (
        <>
            <LoadingOverlay isVisible={saving} />
            <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold">Pengaturan Sekolah</h2>
            </div>

            {/* Grid Utama */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 xl:items-start">
                {/* Kolom Kiri: Form Informasi Sekolah */}
                <Card className="xl:col-span-2 shadow-md border">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <CardTitle className="flex items-center gap-2">
                            <div className="flex flex-row gap-2 items-center">
                                <Settings size={18} className="text-cyan-600" />
                                <span className="font-semibold text-sm sm:text-base">Informasi Sekolah</span>
                            </div>
                        </CardTitle>
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 rounded-xl cursor-pointer w-full sm:w-auto text-sm"
                            >
                                <PenLine size={13} /> Edit
                            </Button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="bg-green-600 hover:bg-green-700 rounded-xl cursor-pointer hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Menyimpan...
                                        </div>
                                    ) : (
                                        "Simpan"
                                    )}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form ke data awal jika batal
                                        fetchSettings();
                                    }}
                                    disabled={saving}
                                    variant="outline"
                                    className="rounded-xl cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                        {/* Logo Upload */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1">
                                <Upload size={12} className="sm:w-3.5 sm:h-3.5" />Logo Sekolah
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <label
                                    htmlFor="logo-upload"
                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 shadow-sm border-dashed border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0 ${isEditing ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed opacity-60'}`}
                                >
                                    {logo ? (
                                        <img
                                            src={logo}
                                            alt="Logo Sekolah"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <ImagePlus className="text-gray-400" size={20} />
                                    )}
                                </label>
                                <input
                                    name="logo_url"
                                    type="file"
                                    id="logo-upload"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    disabled={!isEditing}
                                />
                                {isEditing && (
                                    <p className="text-xs text-gray-500">Klik kotak untuk upload logo</p>
                                )}
                            </div>
                        </div>

                        {/* Nama Sekolah */}
                        <div>
                            <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1">
                                <School size={12} className="sm:w-3.5 sm:h-3.5" /> Nama Sekolah/Instansi
                            </label>
                            <Input name="nama_sekolah" value={formData.nama_sekolah} onChange={handleChange} placeholder="Masukkan nama sekolah/instasi" disabled={!isEditing} className="text-sm" />
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1">
                                <MapPin size={12} className="sm:w-3.5 sm:h-3.5" />Alamat Lengkap
                            </label>
                            <Textarea name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Masukkan alamat lengkap sekolah" disabled={!isEditing} className="text-sm min-h-[80px]" />
                        </div>

                        {/* Telepon & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1">
                                    <Phone size={12} className="sm:w-3.5 sm:h-3.5" /> Telepon
                                </label>
                                <Input name="telepon" value={formData.telepon} onChange={handleChange} placeholder="Contoh: 031-5678910" disabled={!isEditing} className="text-sm" />
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1">
                                    <Mail size={12} className="sm:w-3.5 sm:h-3.5" /> Email
                                </label>
                                <Input name="email" value={formData.email} onChange={handleChange} placeholder="Contoh: info@example.com" disabled={!isEditing} className="text-sm" />
                            </div>
                        </div>

                        {/* Website */}
                        <div>
                            <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1">
                                <Globe size={12} className="sm:w-3.5 sm:h-3.5" /> Website
                            </label>
                            <Input name="website" value={formData.website} onChange={handleChange} placeholder="www.example.sch.id" disabled={!isEditing} className="text-sm" />
                        </div>

                        {/* Kepala Sekolah */}
                        <div>
                            <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1">
                                <User size={12} className="sm:w-3.5 sm:h-3.5" /> Kepala Sekolah
                            </label>
                            <Input name="kepala_sekolah" value={formData.kepala_sekolah} onChange={handleChange} placeholder="Masukkan kepala sekolah" disabled={!isEditing} className="text-sm" />
                        </div>

                        {/* NPSN */}
                        <div>
                            <label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-1">
                                <Hash size={12} className="sm:w-3.5 sm:h-3.5" /> NPSN (Nomor Pokok Sekolah Nasional)
                            </label>
                            <Input name="npsn" value={formData.npsn} onChange={handleChange} placeholder="Masukkan NPSN" disabled={!isEditing} className="text-sm" />
                        </div>

                        <p className="text-xs text-gray-400">
                            Terakhir diperbarui: {formatTanggal(lastUpdate)}
                        </p>

                    </CardContent>
                </Card>

                {/* Kolom Kanan: Preview */}
                <div className="space-y-4 sm:space-y-6 xl:col-span-2 xl:sticky xl:top-6">
                    {/* Preview Dashboard */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm sm:text-md flex items-center gap-2">
                                <Eye className="text-cyan-600" size={16} /> Preview Tampilan
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-gray-600">Pratinjau bagaimana informasi sekolah akan ditampilkan</p>
                        </CardHeader>
                    </Card>

                    {/* Preview Dashboard */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                                <Monitor className="text-blue-600" size={16} /> Dashboard Header
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border rounded-xl p-2 sm:p-3 flex gap-3 sm:gap-4 items-center">
                                {/* Logo */}
                                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {logo ? (
                                        <img src={logo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-gray-400">Logo</span>
                                    )}
                                </div>
                                {/* Nama Sekolah & Sistem */}
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm sm:text-lg truncate">{formData.nama_sekolah || "Nama Sekolah"}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">Sistem Informasi Magang</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Header Rapot/Sertifikat */}
                    <Card className="w-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                                <FileText className="text-green-600" size={16} />
                                Header Rapor/Sertifikat
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="relative bg-white rounded-lg border p-2 sm:p-4 mx-2 sm:mx-6 mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                                {/* Logo */}
                                <div className="w-10 h-10 sm:w-13 sm:h-13 bg-gray-100 rounded-lg shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {logo ? (
                                        <img src={logo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-gray-400">Logo</span>
                                    )}
                                </div>

                                {/* Info Sekolah */}
                                <div className="flex flex-col text-center flex-1">
                                    <p className="font-bold text-sm sm:text-xl">{formData.nama_sekolah || "Nama Sekolah"}</p>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1">{formData.alamat || "Alamat Sekolah"}</p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 mb-1">
                                        <p className="text-[10px] sm:text-[12px] text-gray-500">
                                            Telp: {formData.telepon || "-"}
                                        </p>
                                        <p className="text-[10px] sm:text-[12px] text-gray-500">
                                            Email: {formData.email || "-"}
                                        </p>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-gray-600">Website: {formData.website || "-"}</p>
                                </div>
                            </div>

                            {/* Garis pemisah */}
                            <hr className="my-3 sm:my-4 border-gray-300" />

                            {/* Tulisan SERTIFIKAT MAGANG */}
                            <div className="text-center mt-2">
                                <p className="font-semibold text-sm sm:text-lg">SERTIFIKAT MAGANG</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dokumen Cetak */}
                    <Card className="w-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs sm:text-sm flex items-center gap-2"><Printer className="text-purple-600" size={16} />Dokumen Cetak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 flex flex-col gap-0.5 rounded-xl p-2 sm:p-3 space-y-1 text-xs border border-gray-200">
                                <div className="flex flex-row items-center gap-2">
                                    {/* Logo */}
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-md shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {logo ? (
                                            <img src={logo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-[6px] sm:text-[8px] text-gray-400">Logo</span>
                                        )}
                                    </div>

                                    {/* Nama Sekolah dan NPSN */}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-xs sm:text-sm truncate">{formData.nama_sekolah || "Nama Sekolah"}</p>
                                        <p className="text-gray-600 text-xs">NPSN: {formData.npsn || "-"}</p>
                                    </div>
                                </div>
                                <p className="flex items-center text-[10px] sm:text-xs gap-1 mt-2 sm:mt-3 text-gray-600"><MapPin size={10} className="sm:w-3 sm:h-3" />{formData.alamat || "Alamat Sekolah"}</p>
                                <p className="flex items-center text-[10px] sm:text-xs gap-1 text-gray-600"><Phone size={10} className="sm:w-3 sm:h-3" />{formData.telepon || "-"}</p>
                                <p className="flex items-center text-[10px] sm:text-xs gap-1 text-gray-600"><Mail size={10} className="sm:w-3 sm:h-3" />{formData.email || "-"}</p>
                                <hr className="my-1 sm:my-2 border-gray-300" />
                                <p className="flex items-center text-[10px] sm:text-xs gap-1 text-gray-600"><User size={10} className="sm:w-3 sm:h-3" />Kepala Sekolah: {formData.kepala_sekolah || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Penggunaan */}
                    <Card className="bg-blue-50 border-blue-200 text-xs sm:text-sm">
                        <CardContent className="mt-4 sm:mt-6">
                            <div>
                                <p className="text-blue-900 font-semibold text-sm sm:text-base">Informasi Penggunaan: </p>
                                <div className="mt-2 sm:mt-3 flex flex-col gap-1">
                                    <p className="text-[11px] sm:text-[13px] text-blue-800 flex items-start gap-2"><Monitor size={14} className="sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" /><span className="font-bold text-xs sm:text-sm">Dashboard: </span><span className="text-[11px] sm:text-[13px]">Logo dan nama sekolah ditampilkan di header navigasi</span></p>
                                    <p className="text-[11px] sm:text-[13px] text-blue-800 flex items-start gap-2"><FileText size={14} className="sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" /><span className="font-bold text-xs sm:text-sm">Rapor/Sertifikat: </span><span className="text-[11px] sm:text-[13px]">Informasi lengkap sebagai kop dokumen resmi</span></p>
                                    <p className="text-[11px] sm:text-[13px] text-blue-800 flex items-start gap-2"><Printer size={14} className="sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" /><span className="font-bold text-xs sm:text-sm">Dokumen Cetak: </span><span className="text-[11px] sm:text-[13px]">Footer atau header pada laporan yang dicetak</span></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            </div>
        </>
    );
}