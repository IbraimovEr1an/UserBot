import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import authMiddleware from "../Middleware/authMiddleware.js";
import Accounts from "../app/Dashboard/accounts.js";

const router = Router();

router.post(
  "/my-accounts",
  asyncHandler(authMiddleware),
  asyncHandler(Accounts),
);

export default router;
