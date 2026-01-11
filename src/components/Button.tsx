"use client";

interface ButtonProps {
    loading?: boolean;
    children: React.ReactNode;
}

export default function Button({ loading, children }: ButtonProps) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-lg transition-colors text-md mt-2 h-11 cursor-pointer flex items-center justify-center disabled:opacity-60"
        >
            {loading ? (
                <img src="/spinner.gif" alt="loading" className="h-6 w-6" />
            ) : (
                children
            )}
        </button>
    );
}
