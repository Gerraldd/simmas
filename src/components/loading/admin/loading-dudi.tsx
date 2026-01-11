import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DudiLoadingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Skeleton className="h-6 w-48 sm:h-8 sm:w-64" />
            </div>

            {/* 4 Card Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((idx) => (
                    <Card key={idx} className="shadow-md border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
                            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                        </CardHeader>
                        <CardContent className="mt-2">
                            <Skeleton className="h-6 w-12 sm:h-8 sm:w-16 mb-2" />
                            <Skeleton className="h-3 w-32 sm:h-4 sm:w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card */}
            <Card className="shadow-md border">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2 items-center">
                        <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                        <Skeleton className="h-5 w-24 sm:h-6 sm:w-32" />
                    </div>
                    <Skeleton className="h-8 w-32 sm:h-10 sm:w-40 rounded-lg" />
                </CardHeader>
                
                <CardContent>
                    {/* Search + Filter */}
                    <div className="flex flex-col gap-4 mb-4 w-full">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <div className="flex flex-row items-center gap-2 justify-center sm:justify-start">
                            <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
                            <Skeleton className="h-8 w-16 sm:h-10 sm:w-24" />
                            <Skeleton className="h-3 w-8 sm:h-4 sm:w-10" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto w-full" style={{ minWidth: '100%' }}>
                            <table className="min-w-[800px] w-full border-collapse text-sm sm:text-[15px]">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-3 py-2">
                                            <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                                        </th>
                                        <th className="px-3 py-2">
                                            <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
                                        </th>
                                        <th className="px-3 py-2 text-center">
                                            <Skeleton className="h-3 w-24 sm:h-4 sm:w-32 mx-auto" />
                                        </th>
                                        <th className="px-3 py-2 text-center">
                                            <Skeleton className="h-3 w-12 sm:h-4 sm:w-16 mx-auto" />
                                        </th>
                                        <th className="px-3 py-2 text-center">
                                            <Skeleton className="h-3 w-16 sm:h-4 sm:w-24 mx-auto" />
                                        </th>
                                        <th className="px-3 py-2 text-center">
                                            <Skeleton className="h-3 w-12 sm:h-4 sm:w-16 mx-auto" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5].map((row) => (
                                        <tr key={row} className="border-t">
                                            {/* Perusahaan */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg" />
                                                    <div className="space-y-1 sm:space-y-2">
                                                        <Skeleton className="h-3 w-24 sm:h-4 sm:w-40" />
                                                        <Skeleton className="h-2 w-32 sm:h-3 sm:w-48" />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kontak */}
                                            <td className="px-3 py-3">
                                                <div className="space-y-1 sm:space-y-2">
                                                    <Skeleton className="h-2 w-24 sm:h-3 sm:w-36" />
                                                    <Skeleton className="h-2 w-20 sm:h-3 sm:w-32" />
                                                </div>
                                            </td>

                                            {/* Penanggung Jawab */}
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <Skeleton className="h-5 w-5 sm:h-7 sm:w-7 rounded-full" />
                                                    <Skeleton className="h-3 w-16 sm:h-4 sm:w-28" />
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-3 text-center">
                                                <Skeleton className="h-5 w-12 sm:h-6 sm:w-20 rounded-md mx-auto" />
                                            </td>

                                            {/* Siswa Magang */}
                                            <td className="px-3 py-3 text-center">
                                                <Skeleton className="h-5 w-6 sm:h-6 sm:w-8 rounded-lg mx-auto" />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex gap-1 justify-center">
                                                    <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded" />
                                                    <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="px-3 sm:px-6 flex flex-col gap-4">
                    <div className="w-full border-t border-gray-200" />

                    <div className="flex flex-col sm:flex-row items-center py-2 w-full gap-4">
                        <Skeleton className="h-3 w-48 sm:h-4 sm:w-64" />

                        <div className="flex items-center gap-2">
                            <Skeleton className="h-7 w-16 sm:h-9 sm:w-24 rounded-md" />
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-7 w-7 sm:h-9 sm:w-9 rounded-md" />
                            ))}
                            <Skeleton className="h-7 w-16 sm:h-9 sm:w-24 rounded-md" />
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}