import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        msg: "Unauthorized, no token provided",
        success: "false",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded, "decoded");
    if (!decoded) {
      return res.status(401).json({
        msg: "Unauthorized",
        success: "false",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error, "error in middleware verifyToken");
    return res.status(400).json({
      msg: "something's wrong",
      success: "false",
    });
  }
};
