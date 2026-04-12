export const verifiedOnly = (req, res, next) => {
    if (req.user.verificationStatus !== "verified") {
      return res.status(403).json({
        message: "Account verification required",
      });
    }
    next();
  };
  