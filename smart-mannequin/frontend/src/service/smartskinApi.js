import { API_BASE_URL } from "./config";

const API_BASE = import.meta.env.VITE_SMARTSKIN_API_URL || API_BASE_URL || "http://localhost:4013";

export function smartskinApiUrl(path) {
    if (/^https?:\/\//.test(path)) return path;
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function smartskinFetch(input, options = {}) {
    const token = localStorage.getItem("smartskin_token");
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const target = typeof input === "string" ? smartskinApiUrl(input) : input.toString();

    try {
        const res = await fetch(target, { ...options, headers });
        return res;
    } catch (error) {
        console.warn(`SmartSkin API fetch warning (${target}):`, error.message);
        throw error;
    }
}
