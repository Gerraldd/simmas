"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function SiswaPaginationDudiSkeleton() {
    return (
        <div className="space-y-6 overflow-x-hidden">
            {/* Grid Card Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <Card key={idx} className="shadow-md rounded-xl w-full overflow-hidden">
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
        </div>
    );
}