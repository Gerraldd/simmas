"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BookOpen, Clock, ThumbsUp, ThumbsDown, FileText } from "lucide-react";

export default function GuruLogbookSkeleton() {
    // Icons for the statistic cards, matching the original component
    const statsIcons = [BookOpen, Clock, ThumbsUp, ThumbsDown];

    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-72" />
            </div>

            {/* Statistic Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsIcons.map((Icon, idx) => (
                    <Card key={idx} className="shadow-md border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-5 w-5" />
                        </CardHeader>
                        <CardContent className="mt-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 w-32 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Card Skeleton */}
            <Card className="shadow-md border">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2 items-center">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search and Filter Skeleton */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-80">
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div className="flex flex-row items-center">
                            <Skeleton className="h-4 w-20 mr-2" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-4 w-20 ml-2" />
                        </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="overflow-x-auto" style={{ minHeight: `${5 * 48 + 210}px` }}>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="text-left bg-white">
                                    <th className="px-4 py-2 w-[100px]">
                                        <Skeleton className="h-4 w-24" />
                                    </th>
                                    <th className="px-4 py-2">
                                        <Skeleton className="h-4 w-24" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <Skeleton className="h-4 w-16 mx-auto" />
                                    </th>
                                    <th className="px-4 py-2">
                                        <Skeleton className="h-4 w-24" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <Skeleton className="h-4 w-12 mx-auto" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="border-t">
                                        {/* Siswa & Tanggal */}
                                        <td className="px-4 py-4 w-[150px]">
                                            <div className="flex flex-col gap-1">
                                                <Skeleton className="h-5 w-32" />
                                                <div className="flex flex-col gap-1">
                                                    <Skeleton className="h-3 w-20" />
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        </td>
                                        {/* Kegiatan & Kendala */}
                                        <td className="px-4 py-4 w-[500px]">
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-48 mt-1" />
                                                </div>
                                                <div>
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-48 mt-1" />
                                                </div>
                                            </div>
                                        </td>
                                        {/* Status Verifikasi */}
                                        <td className="px-4 py-4 text-center">
                                            <Skeleton className="h-6 w-24 mx-auto rounded-md" />
                                        </td>
                                        {/* Catatan Guru */}
                                        <td className="px-4 py-4 w-[250px]">
                                            <Skeleton className="h-6 w-48 rounded-sm" />
                                        </td>
                                        {/* Aksi */}
                                        <td className="px-4 py-4 flex justify-center">
                                            <Skeleton className="h-6 w-6 rounded" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <CardFooter className="px-6 flex flex-col gap-4">
                    <div className="w-full border-t border-gray-200" />
                    <div className="flex items-center py-2 w-full">
                        <Skeleton className="h-4 w-48" />
                        <div className="ml-auto flex gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}