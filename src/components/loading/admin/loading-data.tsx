
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function LoadingDataPage() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            <Card className="shadow-md border">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <Users className="text-gray-300 animate-pulse" size={22} />
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                        </CardTitle>
                    </div>
                    {/* Button Skeleton */}
                    <div className="h-10 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
                </CardHeader>

                <CardContent>
                    {/* Search + Filter Skeleton */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-130 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="flex flex-row gap-2">
                            <div className="h-10 w-40 bg-gray-200 rounded-md animate-pulse" />
                            <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
                        </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="overflow-x-auto" style={{ minHeight: `${5 * 48 + 240}px` }}>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="text-left bg-white border-b">
                                    <th className="px-4 py-2">
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    </th>
                                    <th className="px-4 py-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, index) => (
                                    <tr key={index} className="border-t">
                                        {/* User Column */}
                                        <td className="px-4 py-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                                            <div className="space-y-2">
                                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </td>

                                        {/* Email Column */}
                                        <td className="px-4 py-3">
                                            <div className="space-y-2">
                                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />
                                            </div>
                                        </td>

                                        {/* Role Column */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center">
                                                <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse" />
                                            </div>
                                        </td>

                                        {/* Registered Column */}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center">
                                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </td>

                                        {/* Actions Column */}
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 justify-center">
                                                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                                                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>

                <CardFooter className="px-6 flex flex-col gap-4">
                    {/* Divider */}
                    <div className="w-full border-t border-gray-200" />

                    {/* Footer Content */}
                    <div className="flex items-center py-2 w-full">
                        {/* Text kiri */}
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />

                        {/* Pagination skeleton */}
                        <div className="ml-auto flex gap-2">
                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </CardFooter>
            </Card>

            {/* Loading Overlay (optional - untuk efek tambahan) */}
            {/* <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">Memuat data users...</p>
                </div>
            </div> */}
        </div>
    );
}