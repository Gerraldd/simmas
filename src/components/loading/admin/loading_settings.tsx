import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Upload, School, MapPin, Phone, Mail, Globe, User, Hash, Eye, Monitor, FileText, Printer } from "lucide-react";

export default function PengaturanSekolahSkeleton() {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            </div>

            {/* Grid Utama */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 xl:items-start">
                {/* Kolom Kiri: Form Informasi Sekolah */}
                <Card className="xl:col-span-2 shadow-md border">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                            <Skeleton className="h-4 w-32 sm:h-6 sm:w-40" />
                        </div>
                        <Skeleton className="h-8 w-full sm:h-10 sm:w-20" />
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                        {/* Logo Upload Skeleton */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 mb-1">
                                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                                <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg" />
                            </div>
                        </div>

                        {/* Nama Sekolah */}
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                                <Skeleton className="h-3 w-36 sm:h-4 sm:w-44" />
                            </div>
                            <Skeleton className="h-8 sm:h-10 w-full" />
                        </div>

                        {/* Alamat */}
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                                <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                            </div>
                            <Skeleton className="h-16 sm:h-20 w-full" />
                        </div>

                        {/* Telepon & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                                    <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
                                </div>
                                <Skeleton className="h-8 sm:h-10 w-full" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                                    <Skeleton className="h-3 w-10 sm:h-4 sm:w-12" />
                                </div>
                                <Skeleton className="h-8 sm:h-10 w-full" />
                            </div>
                        </div>

                        {/* Website */}
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                                <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
                            </div>
                            <Skeleton className="h-8 sm:h-10 w-full" />
                        </div>

                        {/* Kepala Sekolah */}
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                                <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                            </div>
                            <Skeleton className="h-8 sm:h-10 w-full" />
                        </div>

                        {/* NPSN */}
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                                <Skeleton className="h-3 w-40 sm:h-4 sm:w-56" />
                            </div>
                            <Skeleton className="h-8 sm:h-10 w-full" />
                        </div>

                        <Skeleton className="h-3 w-64" />
                    </CardContent>
                </Card>

                {/* Kolom Kanan: Preview */}
                <div className="space-y-4 sm:space-y-6 xl:col-span-2 xl:sticky xl:top-6">
                    {/* Preview Tampilan Header */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                                <Skeleton className="h-4 w-28 sm:h-5 sm:w-36" />
                            </div>
                            <Skeleton className="h-3 w-60 sm:h-4 sm:w-80 mt-2" />
                        </CardHeader>
                    </Card>

                    {/* Preview Dashboard */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                                <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border rounded-xl p-2 sm:p-3 flex gap-3 sm:gap-4 items-center">
                                <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg" />
                                <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                                    <Skeleton className="h-4 w-32 sm:h-6 sm:w-48" />
                                    <Skeleton className="h-3 w-28 sm:h-4 sm:w-40" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Header Rapor/Sertifikat */}
                    <Card className="w-full">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                                <Skeleton className="h-3 w-32 sm:h-4 sm:w-40" />
                            </div>
                        </CardHeader>

                        <CardContent className="relative bg-white rounded-lg border p-2 sm:p-4 mx-2 sm:mx-6 mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                                <Skeleton className="w-10 h-10 sm:w-13 sm:h-13 rounded-lg flex-shrink-0" />
                                <div className="flex flex-col text-center flex-1 space-y-1 sm:space-y-2">
                                    <Skeleton className="h-5 w-3/4 mx-auto sm:h-7" />
                                    <Skeleton className="h-3 w-full mx-auto sm:h-4" />
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
                                        <Skeleton className="h-2 w-24 sm:h-3 sm:w-32" />
                                        <Skeleton className="h-2 w-28 sm:h-3 sm:w-40" />
                                    </div>
                                    <Skeleton className="h-2 w-36 mx-auto sm:h-3 sm:w-48" />
                                </div>
                            </div>

                            <hr className="my-3 sm:my-4 border-gray-300" />

                            <div className="text-center mt-2">
                                <Skeleton className="h-4 w-32 mx-auto sm:h-6 sm:w-48" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dokumen Cetak */}
                    <Card className="w-full">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                                <Skeleton className="h-3 w-20 sm:h-4 sm:w-28" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 flex flex-col gap-0.5 rounded-xl p-2 sm:p-3 space-y-1 border border-gray-200">
                                <div className="flex flex-row items-center gap-2">
                                    <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-md" />
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <Skeleton className="h-2 w-24 sm:h-3 sm:w-32" />
                                        <Skeleton className="h-2 w-16 sm:h-3 sm:w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-2 w-full mt-2 sm:mt-3" />
                                <Skeleton className="h-2 w-20 sm:h-3 sm:w-28" />
                                <Skeleton className="h-2 w-24 sm:h-3 sm:w-36" />
                                <hr className="my-1 sm:my-2 border-gray-300" />
                                <Skeleton className="h-2 w-28 sm:h-3 sm:w-40" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Penggunaan */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="mt-4 sm:mt-6">
                            <div>
                                <Skeleton className="h-4 w-32 sm:h-5 sm:w-44 mb-2 sm:mb-3" />
                                <div className="mt-2 sm:mt-3 flex flex-col gap-2 sm:gap-3">
                                    <div className="flex items-start gap-2">
                                        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded flex-shrink-0 mt-0.5" />
                                        <Skeleton className="h-3 w-full sm:h-4" />
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded flex-shrink-0 mt-0.5" />
                                        <Skeleton className="h-3 w-full sm:h-4" />
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded flex-shrink-0 mt-0.5" />
                                        <Skeleton className="h-3 w-full sm:h-4" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}