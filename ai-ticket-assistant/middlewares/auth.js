import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Authorization header missing
    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "Access Denied. Authorization header missing." });
    }

    // Bearer TOKEN
    const token = authHeader.split(" ")[1];

    // Token missing after Bearer
    if (!token) {
      return res
        .status(401)
        .json({ error: "Access Denied. Token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { _id, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
