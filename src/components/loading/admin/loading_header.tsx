import { Skeleton } from "@/components/ui/skeleton";

export default function HeaderSkeleton() {
    return (
        <header className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-[11px] lg:py-[9px] bg-white border-b shadow-sm gap-3 sm:gap-0">
            {/* Kanan: User Info + Date */}
            <div className="flex flex-col sm:flex-row sm:gap-2 items-end sm:items-center">
                {/* User Dropdown Skeleton */}
                <div className="flex items-center gap-3 pr-0 sm:pr-4 py-[4px] order-1 sm:order-2">
                    {/* Avatar Skeleton */}
                    <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />

                    {/* User Info Skeleton */}
                    <div className="hidden sm:flex flex-col gap-1">
                        <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                        <Skeleton className="h-3 w-16 sm:w-20" />
                    </div>

                    {/* Chevron Skeleton */}
                    <Skeleton className="hidden sm:block w-4 h-4 rounded-full" />
                </div>
            </div>
        </header>
    );
}
