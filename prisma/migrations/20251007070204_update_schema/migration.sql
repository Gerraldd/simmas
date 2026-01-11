-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'siswa', 'guru', 'dudi');

-- CreateEnum
CREATE TYPE "public"."DudiStatus" AS ENUM ('aktif', 'nonaktif', 'pending');

-- CreateEnum
CREATE TYPE "public"."MagangStatus" AS ENUM ('pending', 'diterima', 'ditolak', 'berlangsung', 'selesai', 'dibatalkan');

-- CreateEnum
CREATE TYPE "public"."LogbookStatus" AS ENUM ('pending', 'disetujui', 'ditolak');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."siswa" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nama" VARCHAR(255),
    "nis" VARCHAR(255),
    "kelas" VARCHAR(50),
    "jurusan" VARCHAR(100),
    "alamat" TEXT,
    "telepon" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guru" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nip" VARCHAR(50),
    "nama" VARCHAR(255),
    "alamat" TEXT,
    "telepon" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dudi" (
    "id" SERIAL NOT NULL,
    "guru_id" INTEGER NOT NULL,
    "nama_perusahaan" VARCHAR(255),
    "tentang_perusahaan" TEXT,
    "alamat" TEXT,
    "telepon" VARCHAR(20),
    "email" VARCHAR(255),
    "penanggung_jawab" VARCHAR(255),
    "kouta_magang" INTEGER DEFAULT 0,
    "bidang_usaha" VARCHAR(255),
    "status" "public"."DudiStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dudi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."magang" (
    "id" SERIAL NOT NULL,
    "siswa_id" INTEGER NOT NULL,
    "dudi_id" INTEGER NOT NULL,
    "guru_id" INTEGER NOT NULL,
    "status" "public"."MagangStatus" NOT NULL DEFAULT 'pending',
    "nilai_akhir" DECIMAL(5,2),
    "tanggal_mulai" TIMESTAMP(3),
    "tanggal_selesai" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."logbook" (
    "id" SERIAL NOT NULL,
    "magang_id" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "kendala" TEXT,
    "file" VARCHAR(500),
    "status_verifikasi" "public"."LogbookStatus" NOT NULL DEFAULT 'pending',
    "catatan_guru" TEXT,
    "catatan_dudi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_settings" (
    "id" SERIAL NOT NULL,
    "logo_url" TEXT,
    "nama_sekolah" VARCHAR(255),
    "alamat" TEXT,
    "telepon" VARCHAR(20),
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "kepala_sekolah" VARCHAR(255),
    "npsn" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_user_id_key" ON "public"."siswa"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_nis_key" ON "public"."siswa"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "guru_user_id_key" ON "public"."guru"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nip_key" ON "public"."guru"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "school_settings_npsn_key" ON "public"."school_settings"("npsn");

-- AddForeignKey
ALTER TABLE "public"."siswa" ADD CONSTRAINT "siswa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guru" ADD CONSTRAINT "guru_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dudi" ADD CONSTRAINT "dudi_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "public"."guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."magang" ADD CONSTRAINT "magang_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "public"."siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."magang" ADD CONSTRAINT "magang_dudi_id_fkey" FOREIGN KEY ("dudi_id") REFERENCES "public"."dudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."magang" ADD CONSTRAINT "magang_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "public"."guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logbook" ADD CONSTRAINT "logbook_magang_id_fkey" FOREIGN KEY ("magang_id") REFERENCES "public"."magang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
