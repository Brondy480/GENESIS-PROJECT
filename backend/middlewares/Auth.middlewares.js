import jwt from "jsonwebtoken";
import Users from "../models/Users.model.js";
import { JWT_SECRET } from "../config/env.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from database
    const user = await Users.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (user.verificationStatus === "suspended") {
      return res.status(403).json({
        message: "Account suspended",
        reason: user.suspensionReason,
      });
    }
    

    req.user = user; // Attach user object to request
    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


