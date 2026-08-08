import sendCode from "../integrations/telegram/send-code.js";
import type { ExpressContextPromise } from "../types/express.js";

const Login: ExpressContextPromise = async ({ req, res, next }) => {
  const uid = req.user?.uid;
  const { code, phone } = req.body;
  const isCheck = typeof phone !== "string" || typeof code !== "string";

  if (!uid) {
    return res.status(401).json({ message: "no-auth" });
  }

  if (isCheck || !code || !phone) {
    return res.status(400).json({ message: "PHONE_NUMBER_INVALID" });
  }

  const fullPhone = `${code}${phone}`.replace(/\s+/g, "");
  const result = await sendCode(uid, fullPhone);

  if (!result.success) return res.status(401).json({ message: result.error });

  return res.status(200).json({ success: true, phone: fullPhone });
};

export default Login;
