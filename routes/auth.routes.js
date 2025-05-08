import express from "express";
import {
  handleLogin,
  handleLogout,
  handleRequestNewOtp,
  handleSignup,
  handleVerifyOtp,
  forgotPassword,
  resetPassword,
  checkAuth
} from "../controller/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", handleSignup);
router.post("/verifyOtp", handleVerifyOtp);
router.post("/requestNewOtp", handleRequestNewOtp);

router.post("/login", handleLogin);

router.get("/logout", handleLogout);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/check-auth", verifyToken, checkAuth);

export default router;
