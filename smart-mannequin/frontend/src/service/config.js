const normalizedApiUrl = (import.meta.env.VITE_API_URL || "http://localhost:4013").replace(
  /\/$/,
  "",
);

export const API_BASE_URL = normalizedApiUrl;
