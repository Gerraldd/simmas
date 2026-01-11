import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logout berhasil" });

  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
  } catch (error: any) {
    console.error("Logout error", error);

    return NextResponse.json(
      { message: "Logout gagal" },
      { status: 500 }
    )
  }
}
