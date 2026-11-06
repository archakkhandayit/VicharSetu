import dotenv from "dotenv";
dotenv.config();

/**
 * Parses comma-separated origin strings from environment variables
 * e.g. CLIENT_URL="http://localhost:5173,https://vichar-setu.vercel.app"
 */
export const getAllowedOrigins = () => {
  const envOrigins = [
    process.env.CLIENT_URL
  ]
    .filter(Boolean)
    .flatMap((item) => item.split(","))
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return envOrigins;
};

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, Postman, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    const allowed = getAllowedOrigins();
    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS error: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

export default corsOptions;
