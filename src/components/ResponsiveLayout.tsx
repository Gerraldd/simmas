"use client";
import React, { ReactNode } from "react";
import MobileNavbar from "./MobileNavbar";

/**
 * ResponsiveLayout
 * - Wrap your pages with this layout to get responsive padding, centered container,
 *   and a mobile hamburger navbar.
 * - It does NOT change your page structure; it only provides consistent responsive wrappers.
 *
 * Usage:
 * import ResponsiveLayout from "@/components/ResponsiveLayout";
 * export default function Page() {
 *   return (
 *     <ResponsiveLayout>
 *       ...your page content...
 *     </ResponsiveLayout>
 *   );
 * }
 */
export default function ResponsiveLayout({ children, navLinks, brand }: { children: ReactNode; navLinks?: {label: string, href: string}[]; brand?: {title: string, href: string} }) {
  const links = navLinks ?? [
    { label: "Dashboard", href: "/" },
    { label: "Magang", href: "/magang" },
    { label: "Siswa", href: "/siswa" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <MobileNavbar brand={brand ?? { title: "Simmas", href: "/" }} links={links} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Make inner cards and containers responsive */}
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
