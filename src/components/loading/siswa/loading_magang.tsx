"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingMagangSiswa() {
    return (
        <div className="space-y-6 bg-gray-50 min-h-screen w-full min-w-0 overflow-x-hidden">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
            </div>

            {/* Status Badge Skeleton */}
            <Card className="border-2 shadow-lg w-full overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center space-x-4 min-w-0">
                            <Skeleton className="w-16 h-16 rounded-full" />
                            <div className="min-w-0">
                                <Skeleton className="h-4 w-28 mb-2" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-4 w-16 ml-auto mb-2" />
                            <Skeleton className="h-6 w-24 ml-auto" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Info Grid */}
            <div className="grid gap-4 lg:grid-cols-2 min-w-0 w-full">
                {/* Data Siswa */}
                <Card className="border-2 shadow-lg w-full overflow-hidden">
                    <CardHeader className="rounded-xl">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="h-5 w-28" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Perusahaan */}
                <Card className="border-2 shadow-lg w-full overflow-hidden">
                    <CardHeader className="rounded-xl">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="h-5 w-32" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-28 mb-2" />
                                <Skeleton className="h-5 w-48" />
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-5 w-56" />
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Periode & Nilai */}
            <div className="grid gap-6 lg:grid-cols-2 min-w-0 w-full">
                <Card className="border-2 shadow-lg w-full overflow-hidden">
                    <CardHeader className="rounded-xl">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="h-5 w-32" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                            <Skeleton className="w-8 h-8 rounded" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div>
                                <Skeleton className="h-4 w-28 mb-2" />
                                <Skeleton className="h-5 w-44" />
                            </div>
                            <Skeleton className="w-8 h-8 rounded" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-lg w-full overflow-hidden">
                    <CardHeader className="rounded-xl">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="h-5 w-24" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center p-8 bg-gray-50 rounded-lg border-2">
                            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                            <Skeleton className="h-4 w-24 mx-auto mb-2" />
                            <Skeleton className="h-8 w-24 mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


