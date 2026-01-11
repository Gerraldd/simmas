"use client";

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children, icon }: AuthLayoutProps) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg w-full max-w-md border-2 border-blue-100/50">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mb-3">
                        {/* Bisa kasih icon berbeda di tiap halaman */}
                        <span className="text-white text-lg font-bold">{icon}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-black">{title}</h2>
                    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
                </div>

                {/* Content (Form) */}
                {children}
            </div>
        </div>
    );
}
