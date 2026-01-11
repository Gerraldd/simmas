"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, Building2, GraduationCap, BookOpen, Calendar, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useSchoolSettings } from "@/context/SchoolSettingsContext";
import AdminDashboardSkeleton from "@/components/loading/admin/admin_dashboard";
import Cookies from "js-cookie";

interface MagangType {
  id: number;
  siswa: {
    id: number,
    nama: string,
  };
  dudi: {
    id: number
    nama_perusahaan: string,
  };
  tanggal_mulai: Date,
  tanggal_selesai: Date,
  status: string,
  created_at: string,
  updated_at: string,
}

interface DUDIType {
  id: number;
  nama_perusahaan: string;
  alamat: string;
  kouta_magang: number;
  telepon: string;
  jumlah: number;
}

interface LogbookType {
  id: number;
  kegiatan: string;
  magang: MagangType;
  tanggal: Date;
  kendala: string;
  status_verifikasi: string;
}

export default function AdminDashboardPage() {
  const [valueSiswa, setValueSiswa] = useState({ total: 0 });
  const [valueDUDI, setValueDUDI] = useState({ total: 0 });
  const [magang, setMagang] = useState<MagangType[]>([]);
  const [dudi, setDUDI] = useState<DUDIType[]>([]);
  const [logbook, setLogbook] = useState<LogbookType[]>([]);
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);

  function getTokenFromCookie() {
    return Cookies.get("token") || "";
  }

  // Fetch data sekaligus
  async function fetchAllData() {
    setLoading(true);
    try {
      const token = getTokenFromCookie();

      const [siswaRes, dudiRes, magangRes, logbookRes] = await Promise.all([
        fetch("/api/admin/dashboard/siswa", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }),
        fetch("/api/admin/dashboard/dudi", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }),
        fetch("/api/admin/dashboard/magang", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }),
        fetch("/api/admin/dashboard/logbook", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }),
      ]);

      const [siswaData, dudiData, magangData, logbookData] = await Promise.all([
        siswaRes.json(),
        dudiRes.json(),
        magangRes.json(),
        logbookRes.json(),
      ]);

      if (siswaData.status === "success") setValueSiswa({ total: siswaData.data.length });
      if (magangData.status === "success") setMagang(magangData.data);
      if (logbookData.status === "success") setLogbook(logbookData.data);

      if (dudiData.status === "success" && magangData.status === "success") {
        const dudiDenganJumlah = dudiData.data.map((dudiItem: any) => {
          const aktif = magangData.data.filter(
            (m: any) => m.dudi_id === dudiItem.id && m.status === "berlangsung"
          ).length;
          return { ...dudiItem, jumlah: aktif };
        });
        setValueDUDI({ total: dudiData.data.length });
        setDUDI(dudiDenganJumlah);
      }
    } catch (err) {
      console.error("Gagal fetch data:", err);
    } finally {
      setLoading(false);
    }
  }

  function truncateText(text: string, maxLength: number) {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  // Stats data
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const logbookHariIni = logbook.filter((l) => {
    const tanggal = new Date(l.tanggal);
    return (
      tanggal.getDate() === now.getDate() &&
      tanggal.getMonth() === now.getMonth() &&
      tanggal.getFullYear() === now.getFullYear()
    );
  });

  // // Filter Magang Terbaru (bulan ini)
  // const magangBaruBulanIni = magang.filter((m) => {
  //   const start = new Date(m.tanggal_mulai);
  //   const end = new Date(m.tanggal_selesai);

  //   // cek apakah tanggal sekarang berada di antara tanggal_mulai dan tanggal_selesai
  //   return start <= now && end >= now;
  // });

  // Filter Magang Terbaru Berdasarkan created_at (7 hari terakhir)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const magangTerbaru = magang
    .filter((m) => {
      const createdAt = new Date(m.created_at);
      return createdAt >= sevenDaysAgo && createdAt <= now;
    })
    // Urutkan dari terbaru ke terlama
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const siswaAktifSet = new Set<number>(); // untuk simpan siswa unik

  const magangSiswaAktifUnik = magang.filter((m) => {
    if (m.status === "berlangsung" && !siswaAktifSet.has(m.siswa.id)) {
      siswaAktifSet.add(m.siswa.id); // tandai siswa sudah dihitung
      return true; // ambil data ini
    }
    return false; // kalau siswa sudah pernah dihitung, skip
  });

  // Filter Logbook Terbaru (bulan ini)
  const logbookBulanIni = logbook.filter((l) => {
    const tanggal = new Date(l.tanggal);
    return tanggal.getMonth() === currentMonth && tanggal.getFullYear() === currentYear;
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Stats data
  const stats = [
    { title: "Total Siswa", value: valueSiswa.total, icon: Users, color: "text-cyan-500", description: "Seluruh siswa terdaftar" },
    { title: "DUDI Partner", value: valueDUDI.total, icon: Building2, color: "text-cyan-500", description: "Perusahaan mitra" },
    { title: "Siswa Magang", value: magangSiswaAktifUnik.length, icon: GraduationCap, color: "text-cyan-500", description: "Siswa aktif magang" },
    { title: "Logbook Hari Ini", value: logbookHariIni.length, icon: BookOpen, color: "text-cyan-500", description: "Laporan masuk hari ini" },
  ];

  if (loading) {
    return <AdminDashboardSkeleton />; // tampilkan skeleton saat loading
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl">Dashboard</h2>
          <h2 className="text-md text-gray-700">
            Selamat datang di sistem pelaporan magang siswa {settings.nama_sekolah}
          </h2>
        </div>
      </div>

      {/* 4 Card Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <Card key={idx} className="shadow-md border group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">{item.title}</CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold group-hover:-translate-y-3 transition-all duration-300 ease-in-out">{item.value}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        ))}
      </div>

      {/* Panel bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Magang Terbaru */}
        <Card className="shadow-md border lg:col-span-2 w-full">
          <CardHeader className="flex flex-row gap-2">
            <GraduationCap className="text-cyan-600" size={20} />
            <CardTitle className="font-semibold leading-tight">Magang Terbaru</CardTitle>
          </CardHeader>

          <CardContent
            className="max-h-[387px] overflow-y-auto mb-6 mr-2 rounded-2xl border-t border-b py-4 px-3 shadow-inner mx-2 sm:mx-6"
          >
            {magangTerbaru.length > 0 ? (
              <div className="space-y-4">
                {magangTerbaru.map((m) => (
                  <div
                    key={m.id}
                    className="
              flex flex-col sm:flex-row justify-between
              bg-gray-50 rounded-xl
              p-3 sm:p-4
              border shadow-sm hover:shadow-md
              transition-all
              gap-2 sm:gap-4
            "
                  >
                    <div className="flex gap-3 items-start">
                      {/* Ikon */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 flex items-center justify-center text-white shadow flex-none">
                        <GraduationCap size={14} className="sm:size-[16px]" />
                      </div>

                      {/* Detail Magang */}
                      <div className="flex flex-col gap-1 sm:gap-2 min-w-0">
                        <p className="font-semibold text-gray-800 text-[13px] sm:text-sm truncate">
                          {m.siswa?.nama}
                        </p>
                        <p className="text-[12px] sm:text-sm text-gray-500 truncate">
                          {m.dudi?.nama_perusahaan}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                          <Calendar size={12} className="sm:size-[14px]" />
                          <span className="leading-none text-xs sm:text-sm">
                            {m.tanggal_mulai
                              ? `${new Date(m.tanggal_mulai).toLocaleDateString("id-ID")} - ${m.tanggal_selesai
                                ? new Date(m.tanggal_selesai).toLocaleDateString("id-ID")
                                : "-"}`
                              : "Belum diset"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="self-start sm:self-center mt-2 sm:mt-0 flex-shrink-0">
                      <span
                        className={`
                  inline-flex items-center relative sm:bottom-8 sm:left-1
                  gap-1 px-2 py-[2px] 
                  rounded-lg 
                  text-[10px] sm:text-xs font-medium 
                  border 
                  ${m.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : m.status === "diterima"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : m.status === "ditolak"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : m.status === "berlangsung"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : m.status === "selesai"
                                    ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                                    : "bg-gray-100 text-gray-800 border-gray-300"}
                `}
                      >
                        {m.status === "pending" && "Pending"}
                        {m.status === "diterima" && "Diterima"}
                        {m.status === "ditolak" && "Ditolak"}
                        {m.status === "berlangsung" && "Aktif"}
                        {m.status === "selesai" && "Selesai"}
                        {m.status === "dibatalkan" && "Dibatalkan"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-center text-gray-500 text-sm min-h-[150px]">
                Belum ada magang terbaru
              </div>
            )}
          </CardContent>
        </Card>

        {/* DUDI Aktif */}
        <Card className="shadow-md border w-full">
          <CardHeader className="flex flex-row items-center gap-2">
            <Building2 className="text-orange-600" size={20} />
            <CardTitle className="font-semibold leading-none mb-1">DUDI Aktif</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto mx-2 mb-6 rounded-2xl border-t border-b py-4 shadow-inner">
            {dudi.length > 0 ? (
              <div className="space-y-4">
                {dudi.map((d) => (
                  <div key={d.id} className="flex flex-col gap-2 pb-[10px] border-b">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{d.nama_perusahaan}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-md text-xs text-white font-medium bg-[#AEA500] shadow-sm">{d.jumlah} siswa</span>
                    </div>
                    <div className="flex text-gray-600 items-center gap-1">
                      <MapPin size={12} />
                      <span className="text-xs leading-none">{d.alamat}</span>
                    </div>
                    <div className="flex text-gray-600 items-center gap-1">
                      <Phone size={12} />
                      <span className="text-xs leading-none">{d.telepon}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-center text-gray-500 text-sm min-h-[150px]">
                Belum ada DUDI aktif
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logbook Terbaru */}
        <Card className="shadow-md border lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 px-4 sm:px-6">
            <BookOpen className="text-lime-500 flex-shrink-0" size={20} />
            <CardTitle className="font-semibold text-base sm:text-lg leading-none mb-[4px]">
              Logbook Terbaru
            </CardTitle>
          </CardHeader>

          <CardContent
            className="
      space-y-4 
      max-h-[400px] 
      overflow-y-auto 
      rounded-lg 
      border-t border-b 
      py-4 sm:py-6 
      px-3 mx-2 sm:mx-6 
      sm:mb-6
      shadow-inner 
      bg-white
    "
          >
            {logbookHariIni.length > 0 ? (
              logbookHariIni.map((l) => (
                <div
                  key={l.id}
                  className="
            flex flex-col sm:flex-row justify-between 
            bg-gray-50 rounded-xl p-3 sm:p-4 
            shadow-sm border hover:shadow-md 
            transition-all gap-3 sm:gap-4
          "
                >
                  <div className="flex gap-3 sm:gap-4 items-start">
                    {/* Ikon */}
                    <div className="
              w-10 h-10 sm:w-12 sm:h-12 
              rounded-lg bg-gradient-to-r from-lime-500 to-green-600 
              flex items-center justify-center text-white shadow flex-none
            ">
                      <BookOpen size={18} className="sm:size-5" />
                    </div>

                    {/* Detail */}
                    <div className="flex flex-col gap-1 sm:gap-2 text-sm sm:text-base flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-cyan-600 truncate">
                        {l.magang?.siswa?.nama ?? "Tidak diketahui"}
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-gray-800 break-words">
                        {l.kegiatan}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                        <Calendar size={12} className="sm:size-4" />
                        <span>{new Date(l.tanggal).toLocaleDateString()}</span>
                      </p>
                      {l.kendala && (
                        <p className="italic text-[12px] sm:text-[13px] text-yellow-600 break-words">
                          Kendala: {l.kendala}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-end sm:self-center flex-shrink-0">
                    <span
                      className={`
                inline-flex items-center justify-center text-center 
                gap-1 px-2 sm:px-3 py-[2px] rounded-lg 
                text-[10px] sm:text-xs font-medium relative sm:bottom-20 
                border 
                ${l.status_verifikasi === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : l.status_verifikasi === "disetujui"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : l.status_verifikasi === "ditolak"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"}
              `}
                    >
                      {l.status_verifikasi === "pending" && "Belum Diverifikasi"}
                      {l.status_verifikasi === "disetujui" && "Disetujui"}
                      {l.status_verifikasi === "ditolak" && "Ditolak"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center text-center text-gray-500 text-sm min-h-[150px]">
                Belum ada logbook hari ini
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}