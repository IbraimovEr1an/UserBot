import Authenticator2FA from "../integrations/telegram/Authenticator.js";
import type { ExpressContextPromise } from "../types/express.js";

const Authenticator: ExpressContextPromise = async ({ req, res, next }) => {
  const uid = req.user?.uid;
  const { phone, password } = req.body;

  if (!uid) {
    return res.status(401).json({ message: "no-auth" });
  }

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ message: "SESSION_NOT_FOUND" });
  }

  if (!password || typeof phone !== "string")
    return res.status(400).json({ message: "PASSWORD_MISSING" });

  const result = await Authenticator2FA(uid, phone, password);
  if (!result.success) return res.status(401).json({ message: result.error });

  return res.status(200).json({ success: true });
};

export default Authenticator;
