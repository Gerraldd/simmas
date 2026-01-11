"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

export default function PasswordInput({
    label,
    placeholder,
    value,
    onChange,
    required = false,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <label className="text-sm font-medium text-black">{label}</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
                <Lock className="text-gray-400 mr-2" size={18} />
                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="flex-1 outline-none text-gray-600 h-6 text-sm"
                        placeholder={placeholder}
                        required={required}
                        value={value}
                        onChange={onChange}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
