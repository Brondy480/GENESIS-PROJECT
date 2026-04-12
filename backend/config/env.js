import { config } from "dotenv";

config({path: `.env.${process.env.NODE_ENV || "development"}.local`});


export const {PORT,NODE_ENV,MONGO_URI,JWT_SECRET,
    JWT_EXPIRES_IN,CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,PAYMENT_MODE,STRIPE_SECRET_KEY,EMAIL_USER,EMAIL_FROM,EMAIL_PASS} = process.env;

    console.log("Loaded env:", {
        NODE_ENV: process.env.NODE_ENV,
        MONGO_URI: process.env.MONGO_URI,
      });
       