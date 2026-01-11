"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Eye, EyeOff, Lock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import FullPageLoader from "@/components/FullPageLoader";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setPageLoading(true);
        document.cookie = `token=${data.token}; path=/`;
        router.push(`/main/${data.user.role}`);
        toast.success(data.message || "Login berhasil!");
      } else {
        toast.error(data.error || "Gagal Login!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }

  return (
    <>
      {pageLoading && <FullPageLoader />}

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-100 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-md shadow-xl rounded-2xl bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-gray-200/60 py-3 sm:py-4">
          {/* Header */}
          <CardHeader className="text-center flex flex-col items-center space-y-1 sm:space-y-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 flex items-center justify-center mb-2 shadow-md">
              <span className="text-white text-lg font-bold">
                <User size="25" />
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          {/* Form */}
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white shadow-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white shadow-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Tombol Login */}
              <Button
                type="submit"
                onClick={handleClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <img src="/spinner.gif" alt="loading" className="h-6 w-6" />
                ) : (
                  <span
                    className={`inline-block transition-transform duration-300 ${isClicked ? "animate-bounceOnce" : ""
                      }`}
                  >
                    Sign In
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex justify-center mt-1 sm:mt-2">
            <p className="text-xs sm:text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <a href="/auth/register" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
