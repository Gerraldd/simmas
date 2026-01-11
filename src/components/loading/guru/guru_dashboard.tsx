import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GuruDashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1 sm:gap-2">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-40" />
          <Skeleton className="h-4 sm:h-5 w-72 sm:w-96" />
        </div>
      </div>

      {/* 4 Card Statistik Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((idx) => (
          <Card key={idx} className="shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-12 sm:h-8 sm:w-16 mb-2" />
              <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        ))}
      </div>

      {/* Panel bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Magang Terbaru Skeleton */}
        <Card className="shadow-md border lg:col-span-2">
          <CardHeader className="flex flex-row gap-2">
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
            <Skeleton className="h-4 w-24 sm:h-6 sm:w-32" />
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto mb-4 sm:mb-6 mr-2 rounded-2xl border-t border-b py-3 sm:py-4 shadow-inner mx-2 sm:mx-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm border gap-2 sm:gap-4">
                <div className="flex gap-3 items-start">
                  <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-none" />
                  <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-w-0">
                    <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />
                    <Skeleton className="h-3 w-40 sm:h-4 sm:w-48" />
                    <Skeleton className="h-3 w-48 sm:h-3 sm:w-56" />
                  </div>
                </div>
                <div className="self-start sm:self-center mt-2 sm:mt-0 flex-shrink-0">
                  <Skeleton className="h-5 w-16 sm:h-6 sm:w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* DUDI Aktif Skeleton */}
        <Card className="shadow-md border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
            <Skeleton className="h-4 w-20 sm:h-6 sm:w-24" />
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto mb-4 sm:mb-6 mr-2 rounded-2xl border-t border-b py-3 sm:py-4 shadow-inner mx-2 sm:mx-2 h-auto">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex flex-col gap-2 pb-[8px] sm:pb-[10px] border-b">
                <div className="flex justify-between items-start gap-2">
                  <Skeleton className="h-3 w-24 sm:h-4 sm:w-32 flex-1" />
                  <Skeleton className="h-4 w-12 sm:h-5 sm:w-16 rounded-md flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-2 w-2 sm:h-3 sm:w-3 rounded" />
                  <Skeleton className="h-2 w-36 sm:h-3 sm:w-48" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-2 w-2 sm:h-3 sm:w-3 rounded" />
                  <Skeleton className="h-2 w-24 sm:h-3 sm:w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logbook Terbaru Skeleton */}
        <Card className="shadow-md border lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 px-4 sm:px-6">
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
            <Skeleton className="h-4 w-24 sm:h-6 sm:w-32" />
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto rounded-lg border-t border-b py-4 sm:py-6 px-3 mx-2 sm:mx-6 sm:mb-6 shadow-inner bg-white">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm border gap-3 sm:gap-4">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-none" />
                  <div className="flex flex-col gap-1 sm:gap-2 text-sm sm:text-base flex-1 min-w-0">
                    <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                    <Skeleton className="h-4 w-full max-w-md sm:h-5" />
                    <Skeleton className="h-3 w-32 sm:h-3 sm:w-48" />
                  </div>
                </div>
                <div className="self-end sm:self-center flex-shrink-0">
                  <Skeleton className="h-5 w-16 sm:h-6 sm:w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}