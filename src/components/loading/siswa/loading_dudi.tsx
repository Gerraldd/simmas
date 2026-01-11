"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function SiswaDudiSkeleton() {
    return (
        <div className="space-y-6 overflow-x-hidden">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
            </div>

            {/* Status Card Skeleton */}
            <Card className="shadow-md border border-cyan-200 bg-cyan-50 w-full overflow-hidden">
                <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-6 px-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="w-full sm:w-50 space-y-2">
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-32 mx-auto" />
                    </div>
                </CardContent>
            </Card>

            {/* Search & Filter Card Skeleton */}
            <Card className="shadow-md border w-full overflow-hidden">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-1">
                        <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
                        <div className="flex flex-row items-center">
                            <Skeleton className="h-4 w-20 mr-2" />
                            <Skeleton className="h-10 w-28" />
                            <Skeleton className="h-4 w-16 ml-2" />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Grid Card Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <Card key={idx} className="shadow-md rounded-xl">
                        <CardHeader>
                            <div className="flex flex-row gap-2 items-center">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-5 w-20 rounded-md" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <div className="bg-slate-50 rounded-lg px-3 py-3 space-y-2">
                                <div className="flex flex-row justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="bg-slate-50 px-3 py-3 rounded-lg">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4 mt-1" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Pagination Card Skeleton */}
            <Card className="w-full overflow-hidden">
                <CardHeader>
                    <div className="flex items-center w-full">
                        <Skeleton className="h-4 w-48" />
                        <div className="ml-auto flex gap-2 flex-wrap overflow-x-hidden">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}