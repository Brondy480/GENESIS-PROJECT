import dotenv from "dotenv";
import path from "path";

// In production (Render), environment variables are injected directly
if (process.env.NODE_ENV !== "production") {
  const envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
  const envPath = path.resolve(process.cwd(), envFile);
  
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    dotenv.config();
  }
}

// Export all environment variables for use across the app
export const PORT = process.env.PORT || 8080;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";
export const ARCJET_KEY = process.env.ARCJET_KEY;
export const ARCJET_ENV = process.env.ARCJET_ENV;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const ADMIN_NAME = process.env.ADMIN_NAME;
export const PAYMENT_MODE = process.env.PAYMENT_MODE || "mvp";
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";