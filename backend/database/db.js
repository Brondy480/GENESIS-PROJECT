import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // 👈 FORCE IPV4
    });

    console.log("✅ Mongoose connected to MongoDB");
    console.log("📦 Database:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error("Error Message:", error.message);

    setTimeout(connectDB, 5000); // auto-retry
  }
};  

export default connectDB;
