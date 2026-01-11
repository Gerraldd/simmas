import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 py-4 sm:py-0">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-60" />
          <Skeleton className="h-4 sm:h-5 w-64 sm:w-96" />
        </div>
      </div>

      {/* 4 Card Statistik Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 sm:mt-7">
        {[1, 2, 3, 4].map((idx) => (
          <Card key={idx} className="shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-20 sm:w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 sm:h-8 w-14 sm:w-16 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        ))}
      </div>

      {/* Panel bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Magang Terbaru Skeleton */}
        <Card className="shadow-md border lg:col-span-2">
          <CardHeader className="flex flex-row gap-2 items-center">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-28 sm:w-32" />
          </CardHeader>

          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto mb-6 mr-1 sm:mr-2">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:justify-between bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm border gap-3"
              >
                <div className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
                    <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
                    <Skeleton className="h-3 w-44 sm:w-56" />
                  </div>
                </div>
                <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-lg self-end sm:self-auto" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* DUDI Aktif Skeleton */}
        <Card className="shadow-md border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-20 sm:w-24" />
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto mr-1 sm:mr-2">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 pb-2 border-b"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28 sm:w-32" />
                  <Skeleton className="h-4 sm:h-5 w-14 sm:w-16 rounded-md" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-36 sm:w-48" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-28 sm:w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logbook Terbaru Skeleton */}
        <Card className="shadow-md border lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-28 sm:w-32" />
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto mb-4 mr-1 sm:mr-2">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:justify-between bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm border gap-3"
              >
                <div className="flex gap-3 flex-1">
                  <Skeleton className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex-none" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-3 sm:h-4 w-full max-w-md" />
                    <Skeleton className="h-3 w-24 sm:w-32" />
                    <Skeleton className="h-3 w-36 sm:w-48" />
                  </div>
                </div>
                <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-lg self-end sm:self-auto" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
