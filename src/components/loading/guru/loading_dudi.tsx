import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GuruDudiSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="shadow-md border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-5 rounded" />
                        </CardHeader>
                        <CardContent className="mt-2">
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-4 w-28" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Card Skeleton */}
            <Card className="shadow-md border">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                </CardHeader>
                
                <CardContent>
                    {/* Search and Filter Skeleton */}
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-10 w-130 rounded-xl" />
                        <div className="flex flex-row items-center gap-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-24 rounded" />
                            <Skeleton className="h-4 w-10" />
                        </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="overflow-x-auto" style={{ minHeight: `${5 * 48 + 250}px` }}>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="text-left bg-white">
                                    <th className="px-4 py-2">
                                        <Skeleton className="h-4 w-24" />
                                    </th>
                                    <th className="px-4 py-2">
                                        <Skeleton className="h-4 w-20" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <Skeleton className="h-4 w-32 mx-auto" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <Skeleton className="h-4 w-16 mx-auto" />
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        <Skeleton className="h-4 w-28 mx-auto" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="border-t">
                                        {/* Perusahaan Column */}
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-12 h-12 rounded-lg" />
                                                <div className="flex flex-col gap-2">
                                                    <Skeleton className="h-4 w-40" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kontak Column */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-2">
                                                <Skeleton className="h-3 w-36" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </td>

                                        {/* Penanggung Jawab Column */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-row items-center gap-3">
                                                <Skeleton className="w-7 h-7 rounded-full" />
                                                <Skeleton className="h-4 w-28" />
                                            </div>
                                        </td>

                                        {/* Status Column */}
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="h-6 w-20 mx-auto rounded-md" />
                                        </td>

                                        {/* Siswa Magang Column */}
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="h-6 w-8 mx-auto rounded-lg" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>

                {/* Footer Skeleton */}
                <CardFooter className="px-6 flex flex-col gap-4">
                    <div className="w-full border-t border-gray-200" />
                    <div className="flex items-center py-2 w-full">
                        <Skeleton className="h-4 w-56" />
                        <div className="ml-auto flex gap-2">
                            <Skeleton className="h-8 w-24 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-24 rounded" />
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}