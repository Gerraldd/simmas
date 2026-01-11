"use client";

import { ReactNode } from "react";

interface InputFieldProps {
    label: string;
    type?: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: ReactNode;
    required?: boolean;
}

export default function InputField({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    icon,
    required = false,
}: InputFieldProps) {
    return (
        <div>
            <label className="text-sm font-medium text-black">{label}</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
                {icon && <div className="mr-2 text-gray-400">{icon}</div>}
                <input
                    type={type}
                    className="flex-1 outline-none text-gray-600 h-6 text-sm"
                    placeholder={placeholder}
                    required={required}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}
