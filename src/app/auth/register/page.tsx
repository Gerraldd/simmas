"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Password dan konfirmasi password tidak sama!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Pendaftaran berhasil! 🎉 Silakan login.");
                router.push("/auth/login");
            } else {
                toast.error(data.message || "Gagal Register!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md shadow-2xl rounded-2xl bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-blue-100/50 py-3 sm:py-4">
                {/* Header */}
                <CardHeader className="text-center flex flex-col items-center space-y-1 sm:space-y-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 flex items-center justify-center mb-2 shadow-md">
                        <span className="text-white text-lg font-bold">
                            <User size="25" />
                        </span>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">Create Account</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Sign up to get started
                    </CardDescription>
                </CardHeader>

                {/* Form */}
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                        {/* Name */}
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative mt-1">
                                <User
                                    size={18}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                />
                                <Input
                                    id="name"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 bg-white shadow-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base"
                                    required
                                />
                            </div>
                        </div>

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
                                    className="pl-10 bg-white shadow-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base"
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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 bg-white shadow-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base"
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

                        {/* Confirm Password */}
                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative mt-1">
                                <Lock
                                    size={18}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 pr-10 bg-white shadow-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Button */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-2.5 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? (
                                <img src="/spinner.gif" alt="loading" className="h-6 w-6" />
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex justify-center mt-1 sm:mt-2">
                    <p className="text-xs sm:text-sm text-gray-500">
                        Already have an account?{" "}
                        <a href="/auth/login" className="text-blue-600 hover:underline">
                            Sign in
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
