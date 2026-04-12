import redis from "../config/redis.js";

export const cache = (keyPrefix) => {
  return async (req, res, next) => {
    const key = `${keyPrefix}:${req.originalUrl}`;

    try {
      const data = await redis.get(key);

      if (data) {
        console.log("📦 Cache Hit:", key);
        return res.status(200).json({
          cached: true,
          data: JSON.parse(data),
        });  
      }

      console.log("🆕 Cache Miss:", key);
      res.sendResponse = res.json;

      // override `res.json` to store data automatically
      res.json = (body) => {
        redis.set(key, JSON.stringify(body), "EX", 60 * 5); // cache for 5 min
        res.sendResponse(body);
      };

      next();
    } catch (err) {
      console.error("Cache Error:", err);
      next();
    }
  };
};
