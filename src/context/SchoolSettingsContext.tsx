"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface SchoolSettings {
  logo_url: string;
  nama_sekolah: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  kepala_sekolah: string;
  npsn: string;
}

interface SchoolSettingsContextType {
  settings: SchoolSettings;
  loading: boolean; // ✅ Tambahkan loading state
  setSettings: (s: SchoolSettings) => void;
  fetchSettings: () => Promise<void>;
}

const defaultSettings: SchoolSettings = {
  logo_url: "",
  nama_sekolah: "",
  alamat: "",
  telepon: "",
  email: "",
  website: "",
  kepala_sekolah: "",
  npsn: "",
};

const SchoolSettingsContext = createContext<SchoolSettingsContextType>({
  settings: defaultSettings,
  loading: true, // ✅ Default loading true
  setSettings: () => { },
  fetchSettings: async () => { },
});

export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
  const [loading, setLoading] = useState(true); // ✅ Tambahkan loading state

  function getTokenFromCookie() {
    return Cookies.get("token") || "";
  }

  async function fetchSettings() {
    try {
      const token = getTokenFromCookie();

      if (loading) {
        setLoading(true); 
      }
      
      const res = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      setSettings({
        logo_url: data.settings?.logo_url || "",
        nama_sekolah: data.settings?.nama_sekolah || "",
        alamat: data.settings?.alamat || "",
        telepon: data.settings?.telepon || "",
        email: data.settings?.email || "",
        website: data.settings?.website || "",
        kepala_sekolah: data.settings?.kepala_sekolah || "",
        npsn: data.settings?.npsn || "",
      });
    } catch (err) {
      console.error("Gagal fetch settings:", err);
    } finally {
      setLoading(false); // ✅ Set loading false setelah selesai (sukses/gagal)
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SchoolSettingsContext.Provider value={{ settings, loading, setSettings, fetchSettings }}>
      {children}
    </SchoolSettingsContext.Provider>
  );
}

export function useSchoolSettings() {
  return useContext(SchoolSettingsContext);
}