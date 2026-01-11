"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, Building2, GraduationCap, BookOpen, Calendar, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useSchoolSettings } from "@/context/SchoolSettingsContext";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import GuruDashboardSkeleton from "@/components/loading/guru/guru_dashboard";

interface MagangType {
  id: number;
  siswa_id: number;
  dudi_id: number;
  guru_id: number;
  status: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  siswa: {
    id: number;
    nama: string;
    nis: string;
    kelas: string;
    jurusan: string;
  };
  dudi: {
    id: number;
    nama_perusahaan: string;
    alamat: string;
    telepon: string,
    penanggung_jawab: string;
  };
  guru: {
    id: number;
    nama: string;
    nip: string;
  };
  created_at: string,
  updated_at: string,
}

interface DUDIType {
  id: number;
  nama_perusahaan: string;
  alamat: string;
  telepon: string;
  jumlah: number,
}

interface LogbookType {
  id: number;
  magang_id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string;
  status_verifikasi: string;
  magang: {
    siswa: {
      id: number;
      nama: string;
      nis: string;
      kelas: string;
      jurusan: string;
    };
    dudi: {
      id: number;
      nama_perusahaan: string;
      alamat: string;
    };
  };
}

export default function GuruDashboardPage() {
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [guruId, setGuruId] = useState<number | null>(null);

  // State untuk data
  const [magangData, setMagangData] = useState<MagangType[]>([]);
  const [logbookData, setLogbookData] = useState<LogbookType[]>([]);
  const [dudiAktif, setDudiAktif] = useState<DUDIType[]>([]);

  // State untuk stats
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [totalDudiPartner, setTotalDudiPartner] = useState(0);
  const [totalSiswaMagang, setTotalSiswaMagang] = useState(0);
  const [totalLogbookHariIni, setTotalLogbookHariIni] = useState(0);

  function getTokenFromCookie() {
    return Cookies.get("token") || "";
  }

  // Fungsi untuk mendapatkan guru_id dari user_id
  const fetchGuruId = async (userId: number) => {
    try {
      const token = getTokenFromCookie();

      const res = await fetch(`/api/guru/by-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();

      if (res.ok && data.data) {
        return data.data.id;
      } else {
        toast.error("Gagal mengambil data guru");
        return null;
      }
    } catch (error) {
      console.error("Error fetching guru ID:", error);
      toast.error("Terjadi kesalahan saat mengambil data guru");
      return null;
    }
  };

  // Fungsi untuk fetch semua data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Decode token untuk mendapatkan user_id
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Token tidak ditemukan");
        setLoading(false);
        return;
      }

      const decoded: any = jwtDecode(token);
      const userId = decoded?.id;

      if (!userId) {
        toast.error("User ID tidak ditemukan");
        setLoading(false);
        return;
      }

      // 2. Ambil guru_id dari user_id
      const fetchedGuruId = await fetchGuruId(userId);
      if (!fetchedGuruId) {
        setLoading(false);
        return;
      }

      setGuruId(fetchedGuruId);

      // 3. Fetch data magang dan logbook berdasarkan guru_id
      const [DudiRes, magangRes, logbookRes] = await Promise.all([
        fetch(`/api/dashboard/guru/dudi?guru_id=${fetchedGuruId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }),
        fetch(`/api/dashboard/guru/magang?guru_id=${fetchedGuruId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }),
        fetch(`/api/dashboard/guru/logbook?guru_id=${fetchedGuruId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }),
      ]);

      const [dudiResult, magangResult, logbookResult] = await Promise.all([
        DudiRes.json(),
        magangRes.json(),
        logbookRes.json(),
      ]);

      // 4. Set data magang
      if (magangResult.status === "success" && magangResult.data) {
        const magang = magangResult.data;
        setMagangData(magang);

        // Hitung stats dari data magang
        // Total Siswa = semua siswa magang (semua status)
        setTotalSiswa(magang.length);

        // Siswa Magang Aktif = siswa dengan status "berlangsung"
        const siswaMagang = magang.filter((m: MagangType) => m.status === "berlangsung");
        setTotalSiswaMagang(siswaMagang.length);
      }

      // 5. Set data logbook
      if (logbookResult.status === "success" && logbookResult.data) {
        const logbook = logbookResult.data;
        setLogbookData(logbook);

        // Hitung logbook hari ini
        const now = new Date();
        const logbookHariIni = logbook.filter((l: LogbookType) => {
          const tanggal = new Date(l.tanggal);
          return (
            tanggal.getDate() === now.getDate() &&
            tanggal.getMonth() === now.getMonth() &&
            tanggal.getFullYear() === now.getFullYear()
          );
        });
        setTotalLogbookHariIni(logbookHariIni.length);
      }

      // 6. Set data DUDI
      if (dudiResult.status === "success" && dudiResult.data) {
        const dudi = dudiResult.data;

        // Pastikan pakai data magang yang baru di-fetch
        const dudiWithCounts = dudi.map((d: any) => {
          const siswaAktif = magangResult.data.filter(
            (m: MagangType) => m.dudi_id === d.id && m.status === "berlangsung"
          );
          return {
            id: d.id,
            nama_perusahaan: d.nama_perusahaan,
            alamat: d.alamat,
            telepon: d.telepon,
            jumlah: siswaAktif.length,
          };
        });

        setTotalDudiPartner(dudiWithCounts.length);
        setDudiAktif(dudiWithCounts);
      }


    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Gagal mengambil data dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi helper untuk truncate text
  function truncateText(text: string, maxLength: number) {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  // Filter untuk Magang Terbaru (bulan ini)
  // const now = new Date();
  // const currentMonth = now.getMonth();
  // const currentYear = now.getFullYear();

  // const magangBulanIni = magangData.filter((m) => {
  //   const tanggalMulai = new Date(m.tanggal_mulai);
  //   const tanggalSelesai = new Date(m.tanggal_selesai);

  //   // Magang yang sedang berlangsung di bulan ini
  //   return (
  //     (tanggalMulai.getMonth() === currentMonth && tanggalMulai.getFullYear() === currentYear) ||
  //     (tanggalMulai <= now && tanggalSelesai >= now)
  //   );
  // });

  // Filter Magang Terbaru Berdasarkan created_at (7 hari terakhir)
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const magangTerbaru = magangData
    .filter((m) => {
      const createdAt = new Date(m.created_at);
      return createdAt >= sevenDaysAgo && createdAt <= now;
    })
    // Urutkan dari terbaru ke terlama
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  

  // Filter untuk Logbook Hari Ini
  const logbookHariIni = logbookData.filter((l) => {
    const tanggal = new Date(l.tanggal);
    return (
      tanggal.getDate() === now.getDate() &&
      tanggal.getMonth() === now.getMonth() &&
      tanggal.getFullYear() === now.getFullYear()
    );
  });

  // Stats data
  const stats = [
    {
      title: "Total Siswa",
      value: totalSiswa,
      icon: Users,
      color: "text-cyan-500",
      description: "Siswa bimbingan",
    },
    {
      title: "DUDI Partner",
      value: totalDudiPartner,
      icon: Building2,
      color: "text-cyan-500",
      description: "Perusahaan mitra",
    },
    {
      title: "Siswa Magang",
      value: totalSiswaMagang,
      icon: GraduationCap,
      color: "text-cyan-500",
      description: "Siswa aktif magang",
    },
    {
      title: "Logbook Hari Ini",
      value: totalLogbookHariIni,
      icon: BookOpen,
      color: "text-cyan-500",
      description: "Laporan masuk hari ini",
    },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return <GuruDashboardSkeleton />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2 className="font-bold text-xl sm:text-2xl">Dashboard Guru</h2>
          <h2 className="text-sm sm:text-md text-gray-700">
            Selamat datang di sistem pembimbingan magang siswa {settings.nama_sekolah}
          </h2>
        </div>
      </div>

      {/* 4 Card Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, idx) => (
          <Card key={idx} className="shadow-md border group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm sm:text-md font-medium">{item.title}</CardTitle>
              <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold group-hover:-translate-y-3 transition-all duration-300 ease-in-out">
                {item.value}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">{item.description}</p>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        ))}
      </div>

      {/* Panel bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Magang Terbaru */}
        <Card className="shadow-md border lg:col-span-2">
          <CardHeader className="flex flex-row gap-2">
            <GraduationCap className="text-cyan-600" size={18} />
            <CardTitle className="font-semibold leading-tight text-sm sm:text-base">Magang Terbaru</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4 max-h-[387px] overflow-y-auto mb-4 sm:mb-6 mr-2 rounded-2xl border-t border-b py-3 px-3 sm:py-4 shadow-inner mx-2 sm:mx-6">
            {magangTerbaru.length > 0 ? (
              magangTerbaru.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row justify-between bg-gray-50 rounded-xl p-3 sm:p-4 border shadow-sm hover:shadow-md transition-all gap-2 sm:gap-4"
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 flex items-center justify-center text-white shadow flex-none">
                      <GraduationCap size={14} className="sm:size-4" />
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{m.siswa.nama}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{m.dudi.nama_perusahaan}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                        <Calendar size={12} className="sm:size-3.5" />
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
                  <div className="self-start sm:self-center mt-2 sm:mt-0 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-lg text-[10px] sm:text-xs font-medium border relative sm:bottom-8
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
                                  : m.status === "dibatalkan"
                                    ? "bg-gray-100 text-gray-800 border-gray-300"
                                    : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                    >
                      {m.status === "pending" && <span>Pending</span>}
                      {m.status === "diterima" && <span>Diterima</span>}
                      {m.status === "ditolak" && <span>Ditolak</span>}
                      {m.status === "berlangsung" && <span>Aktif</span>}
                      {m.status === "selesai" && <span>Selesai</span>}
                      {m.status === "dibatalkan" && <span>Dibatalkan</span>}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center text-center text-gray-500 text-sm min-h-[150px]">
                Belum ada data magang bulan ini
              </div>
            )}
          </CardContent>
        </Card>

        {/* DUDI Aktif */}
        <Card className="shadow-md border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Building2 className="text-orange-600" size={18} />
            <CardTitle className="font-semibold leading-none mb-1 text-sm sm:text-base">DUDI Aktif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto mb-4 sm:mb-6 mr-2 rounded-2xl border-t border-b py-3 sm:py-4 shadow-inner mx-2 sm:mx-2 h-auto">
            {dudiAktif.length > 0 ? (
              dudiAktif.map((d) => (
                <div key={d.id} className="flex flex-col gap-2 pb-[8px] sm:pb-[10px] border-b">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs sm:text-sm font-medium truncate flex-1">{d.nama_perusahaan}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-md text-[10px] sm:text-xs text-white font-medium bg-[#AEA500] shadow-sm flex-shrink-0">
                      {d.jumlah} siswa
                    </span>
                  </div>
                  <div className="flex text-gray-600 items-center gap-1">
                    <MapPin size={10} className="sm:w-3 sm:h-3" />
                    <span className="text-[10px] sm:text-xs leading-none">{d.alamat}</span>
                  </div>
                  <div className="flex text-gray-600 items-center gap-1">
                    <Phone size={10} className="sm:w-3 sm:h-3" />
                    <span className="text-[10px] sm:text-xs leading-none">{d.telepon}</span>
                  </div>
                </div>
              ))
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
            <BookOpen className="text-lime-500 flex-shrink-0" size={18} />
            <CardTitle className="font-semibold text-sm sm:text-base leading-none mb-[4px]">
              Logbook Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto rounded-lg border-t border-b py-4 sm:py-6 px-3 mx-2 sm:mx-6 sm:mb-6 shadow-inner bg-white">
            {logbookHariIni.length > 0 ? (
              logbookHariIni.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-col sm:flex-row justify-between bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all gap-3 sm:gap-4"
                >
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r from-lime-500 to-green-600 flex items-center justify-center text-white shadow flex-none">
                      <BookOpen size={16} className="sm:size-5" />
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2 text-sm sm:text-base flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-cyan-600 truncate">
                        {l.magang.siswa.nama}
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-gray-800 break-words">
                        {l.kegiatan}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                        <Calendar size={12} className="sm:size-4" />
                        <span>{new Date(l.tanggal).toLocaleDateString("id-ID")}</span>
                      </p>
                      {l.kendala && (
                        <p className="italic text-[12px] sm:text-[13px] text-yellow-600 break-words">
                          Kendala: {l.kendala}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="self-end sm:self-center flex-shrink-0">
                    <span
                      className={`inline-flex items-center justify-center text-center gap-1 px-2 sm:px-3 py-[2px] rounded-lg text-[10px] sm:text-xs font-medium relative sm:bottom-20 border
                        ${l.status_verifikasi === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : l.status_verifikasi === "disetujui"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : l.status_verifikasi === "ditolak"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                    >
                      {l.status_verifikasi === "pending" && <span>Belum Diverifikasi</span>}
                      {l.status_verifikasi === "disetujui" && <span>Disetujui</span>}
                      {l.status_verifikasi === "ditolak" && <span>Ditolak</span>}
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