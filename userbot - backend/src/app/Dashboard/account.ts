import ClientManager from "../../services/ClientManager.js";
import type { ExpressContextPromise } from "../../types/express.js";

const Account: ExpressContextPromise = async ({ req, res, next }) => {
  const uid = req.user?.uid;
  const phone = req.body.phone;

  if (!uid) return res.status(400).json({ message: "no-auth" });

  if (!phone) return res.status(400).json({ message: "no-phone" });

  const result = await ClientManager.getUserProfile(uid, phone);

  if (!result.status) return res.status(400).json({ message: "no-user-data" });

  return res.status(200).json({ success: true, user: result });
};

export default Account;
