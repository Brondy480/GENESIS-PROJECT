import dotenv from "dotenv";
import path from "path";

const loadEnv = () => {
  // In production (Render), environment variables are injected directly
  // No need to load from file — they are already available via process.env
  if (process.env.NODE_ENV === "production") {
    console.log("Production environment - using injected env vars");
    return;
  }

  // In development, load from .env.development.local
  const envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
  const envPath = path.resolve(process.cwd(), envFile);
  
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    // Try loading from .env as fallback
    dotenv.config();
  }

  console.log("Loaded env from:", envFile);
};

loadEnv();

export default loadEnv;