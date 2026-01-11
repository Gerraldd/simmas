import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "rahasia123"; // bisa diambil dari .env

export function verifyToken(authHeader: string | null) {
    if (!authHeader) throw new Error("Authorization header missing");

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) throw new Error("Invalid token format");

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded; // bisa berisi user info, misal { userId, role }
    } catch (err) {
        throw new Error("Token tidak valid atau expired");
    }
}
