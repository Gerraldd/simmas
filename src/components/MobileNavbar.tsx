"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

/**
 * MobileNavbar
 * - Hamburger menu for mobile
 * - Keeps original structure (links passed as children or use default)
 * - Tailwind-based responsive styles (md: shows full nav; below md: hamburger)
 *
 * Usage:
 * import MobileNavbar from "@/components/MobileNavbar";
 * 
 * <MobileNavbar
 *   brand={{ title: "Simmas", href: "/" }}
 *   links={[
 *     { label: "Dashboard", href: "/" },
 *     { label: "Magang", href: "/magang" },
 *     { label: "Siswa", href: "/siswa" },
 *   ]}
 * />
 */
export default function MobileNavbar({ brand = { title: "Simmas", href: "/" }, links = [] } : { brand?: { title: string, href: string }, links?: { label: string, href: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href={brand.href} className="text-lg font-bold">{brand.title}</Link>
            <div className="hidden md:flex items-center gap-4 ml-6">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-gray-700 hover:text-cyan-600">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* desktop actions placeholder */}
          <div className="hidden md:flex items-center gap-2">
            {/* keep existing buttons or user can slot here */}
          </div>

          {/* mobile hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* mobile menu panel */}
      <div
        className={`md:hidden transition-all duration-200 ease-in-out overflow-hidden ${open ? "max-h-screen" : "max-h-0"}`}
      >
        <nav className="px-4 pb-4 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
