import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import authMiddleware from "../Middleware/authMiddleware.js";
import Accounts from "../app/Dashboard/accounts.js";
import Account from "../app/Dashboard/account.js";

const router = Router();

router.post(
  "/my-accounts",
  asyncHandler(authMiddleware),
  asyncHandler(Accounts),
);
router.post("/account", asyncHandler(authMiddleware), asyncHandler(Account));

export default router;
