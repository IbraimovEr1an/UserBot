import CheckCode from "../integrations/telegram/check-code.js";
import type { ExpressContextPromise } from "../types/express.js";

const Code: ExpressContextPromise = async ({ req, res, next }) => {
  const uid = req.user?.uid;
  const { phone, code } = req.body;

  if (!uid) {
    return res.status(401).json({ message: "no-auth" });
  }

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ message: "PHONE_NUMBER_INVALID" });
  }

  const result = await CheckCode(uid, phone, code);
  if (!result.success) return res.status(401).json({ message: result.error });

  return res.status(200).json({ success: true });
};

export default Code;
