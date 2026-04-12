import { createClient } from "redis";

let redisClient = null;

const connectRedis = async () => {
  try {
    const config = {
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    };

    // Enable TLS for Redis Cloud
    if (process.env.REDIS_USE_TLS === "true") {
      config.socket.tls = true;
    }

    redisClient = createClient(config);

    redisClient.on("error", (err) => {
      console.log("Redis Client Error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully");
    });

    await redisClient.connect();
    return redisClient;

  } catch (error) {
    console.log("Redis connection failed - continuing without cache:", error.message);
    redisClient = null;
    return null;
  }
};

export { redisClient, connectRedis };
export default connectRedis;