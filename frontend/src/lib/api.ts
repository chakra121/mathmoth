export const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://mathmoth-api.vercel.app"
    : "http://localhost:8000";