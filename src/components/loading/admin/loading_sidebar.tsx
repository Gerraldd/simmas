import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarSkeleton() {
    return (
        // Sidebar hanya muncul di layar md ke atas
        <aside className="hidden md:flex h-screen w-70 bg-white border-r shadow-sm flex-col animate-pulse">
            {/* Logo Section Skeleton */}
            <div className="py-[13px] px-3 border-b flex items-center">
                <Skeleton className="ml-1 w-10 h-10 rounded-2xl" />
                <div className="flex flex-col gap-2 ml-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            {/* Navigation Menu Skeleton */}
            <nav className="flex-1 p-4 mt-2 space-y-3">
                {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="flex items-center gap-3 px-3 py-3">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <div className="flex flex-col gap-2 flex-1">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer Info Skeleton */}
            <div className="p-4 border-t">
                <div className="bg-gray-100 py-2 px-3 rounded-xl flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
