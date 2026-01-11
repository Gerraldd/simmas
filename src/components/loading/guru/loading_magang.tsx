"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Users, GraduationCap, CheckCircle, Calendar } from "lucide-react";

export default function GuruMagangSkeleton() {
    // Icons for the statistic cards, matching the original component
    const statsIcons = [Users, GraduationCap, CheckCircle, Calendar];

    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-60" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Statistic Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Card key={idx} className="shadow-md border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-5 w-24" />
                            {statsIcons[idx] && (
                                (() => {
                                    const Icon = statsIcons[idx]; // Assign the component to a capitalized variable
                                    return <Skeleton className="h-5 w-5" />
                                })()
                            )}
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
                    <Skeleton className="h-10 w-32" />
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
                                    <th className="px-4 py-2 w-[100px] max-w-[500px]">
                                        <Skeleton className="h-4 w-16" />
                                    </th>
                                    <th className="px-4 py-2">
                                        <Skeleton className="h-4 w-24" />
                                    </th>
                                    <th className="px-4 py-2 w-[250px] max-w-[500px]">
                                        <Skeleton className="h-4 w-16" />
                                    </th>
                                    <th className="px-4 py-2">
                                        <Skeleton className="h-4 w-16" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <Skeleton className="h-4 w-16 mx-auto" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <Skeleton className="h-4 w-12 mx-auto" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <Skeleton className="h-4 w-12 mx-auto" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="border-t">
                                        {/* Siswa */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <Skeleton className="h-5 w-32" />
                                                <div className="flex flex-col gap-1">
                                                    <Skeleton className="h-3 w-20" />
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        </td>
                                        {/* Guru Pembimbing */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <Skeleton className="h-5 w-28" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </td>
                                        {/* DUDI */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-row gap-3">
                                                <Skeleton className="h-8 w-8 rounded-lg" />
                                                <div className="flex flex-col gap-1">
                                                    <Skeleton className="h-5 w-36" />
                                                    <Skeleton className="h-3 w-28" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        </td>
                                        {/* Periode */}
                                        <td className="px-4 py-4">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-3 w-24 mt-1" />
                                            <Skeleton className="h-3 w-16 mt-1" />
                                        </td>
                                        {/* Status */}
                                        <td className="px-4 py-4 text-center">
                                            <Skeleton className="h-6 w-24 mx-auto rounded-md" />
                                        </td>
                                        {/* Nilai */}
                                        <td className="px-4 py-4 text-center">
                                            <Skeleton className="h-6 w-12 mx-auto rounded-lg" />
                                        </td>
                                        {/* Aksi */}
                                        <td className="px-4 py-4 flex justify-center gap-2">
                                            <Skeleton className="h-6 w-6 rounded" />
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