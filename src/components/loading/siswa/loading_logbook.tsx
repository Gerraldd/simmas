"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, CircleX } from "lucide-react";

export default function SiswaLogbookSkeleton() {
  const statsIcons = [FileText, CheckCircle, Clock, CircleX];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <Skeleton className="h-7 sm:h-8 w-48 sm:w-60" />
        <Skeleton className="h-9 sm:h-10 w-full sm:w-40" />
      </div>

      {/* Banner Skeleton */}
      <div className="flex bg-yellow-50 border border-yellow-300 rounded-lg p-3 sm:p-4 gap-3 sm:gap-4 justify-between">
        <div className="flex flex-row gap-2 sm:gap-3 items-start sm:items-center flex-1">
          <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
            <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-64" />
          </div>
        </div>
        <Skeleton className="h-8 sm:h-9 w-20 sm:w-36 rounded-lg flex-shrink-0 ml-2" />
      </div>

      {/* Statistic Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsIcons.map((Icon, idx) => (
          <Card key={idx} className="shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6">
              <Skeleton className="h-4 sm:h-5 w-20 sm:w-28" />
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
            </CardHeader>
            <CardContent className="mt-1 sm:mt-2 px-3 sm:px-6">
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-32 mt-1.5 sm:mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Card Skeleton */}
      <Card className="shadow-md border">
        <CardHeader className="flex flex-row justify-between items-center px-4 sm:px-6">
          <div className="flex flex-row gap-2 items-center">
            <Skeleton className="h-5 w-5 sm:h-6 sm:w-6" />
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {/* Search and Filter Skeleton - Mobile Vertical Layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-80">
              <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
            </div>
            <div className="flex flex-row items-center justify-between sm:justify-start">
              <Skeleton className="h-3.5 sm:h-4 w-16 sm:w-20 mr-2" />
              <Skeleton className="h-9 sm:h-10 w-20 sm:w-24" />
              <Skeleton className="h-3.5 sm:h-4 w-16 sm:w-20 ml-2 sm:ml-3" />
            </div>
          </div>

          {/* Table Container with Horizontal Scroll for Mobile */}
          <div className="w-full overflow-x-auto" style={{ minHeight: `${5 * 44 + 180}px` }}>
            <table className="w-full border-collapse text-sm min-w-[600px] sm:min-w-full">
              <thead>
                <tr className="text-left bg-white">
                  <th className="px-2 sm:px-3 py-2 min-w-[80px] sm:min-w-[100px]">
                    <Skeleton className="h-3.5 sm:h-4 w-12 sm:w-16 mx-auto sm:mx-0" />
                  </th>
                  <th className="px-2 sm:px-3 py-2 min-w-[150px] sm:min-w-[200px] lg:min-w-[300px]">
                    <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24 mx-auto sm:mx-0" />
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center min-w-[80px] sm:min-w-[100px]">
                    <Skeleton className="h-3.5 sm:h-4 w-14 sm:w-16 mx-auto" />
                  </th>
                  <th className="px-2 sm:px-3 py-2 min-w-[100px] sm:min-w-[120px] lg:min-w-[150px]">
                    <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24 mx-auto sm:mx-0" />
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center min-w-[70px] sm:min-w-[80px]">
                    <Skeleton className="h-3.5 sm:h-4 w-10 sm:w-12 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-t">
                    {/* Tanggal - Mobile Center, Desktop Left */}
                    <td className="px-2 sm:px-3 py-3 text-center sm:text-left min-w-[80px] sm:min-w-[100px]">
                      <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mx-auto sm:mx-0" />
                    </td>

                    {/* Kegiatan & Kendala */}
                    <td className="px-2 sm:px-3 py-3 max-w-[150px] sm:max-w-[200px] lg:max-w-[300px] min-w-[150px] sm:min-w-[200px] lg:min-w-[300px]">
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        <div>
                          <Skeleton className="h-3.5 sm:h-4 w-16 sm:w-20" />
                          <Skeleton className="h-3.5 sm:h-4 w-32 sm:w-48 mt-1" />
                        </div>
                        <div>
                          <Skeleton className="h-3.5 sm:h-4 w-16 sm:w-20" />
                          <Skeleton className="h-3.5 sm:h-4 w-28 sm:w-48 mt-1" />
                        </div>
                      </div>
                    </td>

                    {/* Status Verifikasi */}
                    <td className="px-2 sm:px-3 py-3 text-center min-w-[80px] sm:min-w-[100px]">
                      <div className="flex flex-col gap-1 items-center">
                        <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 rounded-md" />
                        <Skeleton className="h-3.5 w-16 rounded-sm" />
                      </div>
                    </td>

                    {/* Feedback Guru */}
                    <td className="px-2 sm:px-3 py-3 min-w-[100px] sm:min-w-[120px] lg:min-w-[150px]">
                      <Skeleton className="h-5 sm:h-6 w-full rounded-sm" />
                    </td>

                    {/* Aksi */}
                    <td className="px-2 sm:px-3 py-3 min-w-[70px] sm:min-w-[80px]">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <Skeleton className="h-6 w-6 sm:h-7 sm:w-7 rounded" />
                        <Skeleton className="h-6 w-6 sm:h-7 sm:w-7 rounded" />
                        <Skeleton className="h-6 w-6 sm:h-7 sm:w-7 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter className="px-3 sm:px-6 flex flex-col gap-3 sm:gap-4">
          <div className="w-full border-t border-gray-200" />
          <div className="flex flex-col sm:flex-row sm:items-center py-2 w-full gap-3 sm:gap-0">
            <Skeleton className="h-3.5 sm:h-4 w-32 sm:w-48" />
            <div className="flex justify-center sm:ml-auto gap-1 sm:gap-2">
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8" />
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8" />
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8" />
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}