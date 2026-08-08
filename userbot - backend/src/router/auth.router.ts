import { Router } from "express";
import Code from "../auth/Code.js";
import Login from "../auth/Login.js";
import Verification from "../auth/Verification.js";
import asyncHandler from "../utils/asyncHandler.js";
import authMiddleware from "../Middleware/authMiddleware.js";
import Authenticator from "../auth/Authenticator.js";

const router = Router();

router.post("/verification", asyncHandler(Verification));
router.post("/login", asyncHandler(authMiddleware), asyncHandler(Login));
router.post("/code", asyncHandler(authMiddleware), asyncHandler(Code));
router.post(
  "/authenticator",
  asyncHandler(authMiddleware),
  asyncHandler(Authenticator),
);

export default router;
