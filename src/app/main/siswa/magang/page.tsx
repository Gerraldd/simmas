"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Building2,
  Calendar,
  GraduationCap,
  Users,
  MapPin,
  User,
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader
} from "lucide-react"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import LoadingMagangSiswa from "@/components/loading/siswa/loading_magang"

interface Siswa {
  id: number
  user_id: number
  nama: string
  nis: string
  kelas: string
  jurusan: string
}

interface Magang {
  id: number
  siswa_id: number
  guru_id: number
  dudi_id: number
  tanggal_mulai: string
  tanggal_selesai: string
  status: string
  nilai_akhir?: number | null
  siswa: Siswa
  guru: {
    id: number
    user_id: number
    nama: string
    nip: string
  }
  dudi: {
    id: number
    nama_perusahaan: string
    alamat: string
    penanggung_jawab: string
  }
}

interface DecodedToken {
  id: number
  name: string
  role: string
  iat: number
  exp: number
}

export default function StatusMagangPage() {
  const [magangData, setMagangData] = useState<Magang | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hapus spinner custom; gunakan skeleton komponen

  useEffect(() => {
    async function fetchData() {
      const token = Cookies.get("token")
      if (!token) {
        setError("User tidak login atau token tidak ditemukan")
        setLoading(false)
        return
      }

      let userId: number
      try {
        const decodedToken: DecodedToken = jwtDecode(token)
        userId = decodedToken.id
        if (!userId) {
          throw new Error("user_id tidak ditemukan di token")
        }
      } catch (err) {
        setError("Gagal memproses token")
        setLoading(false)
        return
      }

      try {
        const siswaRes = await fetch("/api/siswa", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        if (!siswaRes.ok) {
          throw new Error("Gagal fetch data siswa")
        }
        const siswaData = await siswaRes.json()
        const matchedSiswa = siswaData.data.find((s: Siswa) => s.user_id === userId)

        if (!matchedSiswa) {
          setError("Siswa tidak ditemukan untuk user ini")
          setLoading(false)
          return
        }

        const siswaId = matchedSiswa.id

        const magangRes = await fetch("/api/magang?page=1&limit=9999", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        if (!magangRes.ok) {
          throw new Error("Gagal fetch data magang")
        }
        const magangAllData = await magangRes.json()
        const matchedMagang = magangAllData.data.find((m: Magang) => m.siswa_id === siswaId)

        if (!matchedMagang) {
          setError("Data magang tidak ditemukan untuk siswa ini")
          setLoading(false)
          return
        }

        setMagangData(matchedMagang)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; bgClass: string; icon: any; textColor: string }> = {
      pending: {
        label: "Menunggu Verifikasi",
        bgClass: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200",
        icon: Loader,
        textColor: "text-yellow-700"
      },
      diterima: {
        label: "Diterima",
        bgClass: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
        icon: CheckCircle2,
        textColor: "text-blue-700"
      },
      ditolak: {
        label: "Ditolak",
        bgClass: "bg-gradient-to-br from-red-50 to-rose-50 border-red-200",
        icon: XCircle,
        textColor: "text-red-700"
      },
      berlangsung: {
        label: "Sedang Berlangsung",
        bgClass: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
        icon: CheckCircle2,
        textColor: "text-green-700"
      },
      selesai: {
        label: "Selesai",
        bgClass: "bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200",
        icon: Award,
        textColor: "text-cyan-700"
      },
      dibatalkan: {
        label: "Dibatalkan",
        bgClass: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200",
        icon: XCircle,
        textColor: "text-gray-700"
      }
    }
    return configs[status] || configs.pending
  }

  if (loading) {
    return <LoadingMagangSiswa />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md border-red-200 shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-gray-900">Terjadi Kesalahan</h3>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!magangData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md border-gray-200 shadow-lg">
          <CardContent className="pt-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-gray-900">Belum Ada Data Magang</h3>
            <p className="text-gray-600">Anda belum terdaftar dalam program magang</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig(magangData.status)
  const StatusIcon = statusConfig.icon

  const tanggalMulai = new Date(magangData.tanggal_mulai)
  const tanggalSelesai = new Date(magangData.tanggal_selesai)
  const periode = `${tanggalMulai.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} - ${tanggalSelesai.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`

  // Hitung durasi magang
  const durasiHari = Math.ceil((tanggalSelesai.getTime() - tanggalMulai.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-3xl text-gray-900">Status Magang</h2>
          <p className="text-gray-600 mt-1">Informasi detail program magang Anda</p>
        </div>
      </div>

      {/* Status Badge */}
      <Card className={`border-2 shadow-lg ${statusConfig.bgClass}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full ${statusConfig.bgClass} flex items-center justify-center border-2`}>
                <StatusIcon className={`w-8 h-8 ${statusConfig.textColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Status Magang</p>
                <h3 className={`text-xl sm:text-2xl font-bold ${statusConfig.textColor}`}>
                  {statusConfig.label}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Durasi</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{durasiHari} Hari</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Info Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Data Siswa */}
        <Card className="border border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-blue-600" />
              Data Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Nama Lengkap</p>
                <p className="font-semibold text-gray-900">{magangData.siswa.nama}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">NIS</p>
                <p className="font-semibold text-gray-900">{magangData.siswa.nis}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Kelas</p>
                <p className="font-semibold text-gray-900">{magangData.siswa.kelas}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Jurusan</p>
                <p className="font-semibold text-gray-900 text-sm">{magangData.siswa.jurusan}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Perusahaan */}
        <Card className="border border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
              Data Perusahaan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Nama Perusahaan</p>
                <p className="font-semibold text-gray-900">{magangData.dudi.nama_perusahaan}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Alamat</p>
                <p className="font-semibold text-gray-900">{magangData.dudi.alamat}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Penanggung Jawab</p>
                <p className="font-semibold text-gray-900">{magangData.dudi.penanggung_jawab}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Periode & Nilai */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              Periode Magang
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Mulai</p>
                  <p className="font-bold text-green-700">{tanggalMulai.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Selesai</p>
                  <p className="font-bold text-blue-700">{tanggalSelesai.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-orange-600" />
              Penilaian
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
              <Award className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">Nilai Akhir</p>
              {magangData.nilai_akhir ? (
                <div>
                  <p className="text-5xl font-bold text-orange-600 mb-2">{magangData.nilai_akhir}</p>
                  <p className="text-sm text-gray-600">
                    {magangData.nilai_akhir >= 90 ? "Sangat Baik" :
                      magangData.nilai_akhir >= 80 ? "Baik" :
                        magangData.nilai_akhir >= 70 ? "Cukup" : "Kurang"}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-semibold text-gray-500">Belum Ada Nilai</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}