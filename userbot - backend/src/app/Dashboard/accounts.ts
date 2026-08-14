import ClientManager from "../../services/ClientManager.js";
import type { ExpressContextPromise } from "../../types/express.js";

const Accounts: ExpressContextPromise = async ({ req, res }) => {
  const uid = req.user?.uid;

  if (!uid) return res.status(400).json({ message: "no-auth" });

  const results = await ClientManager.getAllUserProfiles(uid);

  return res.status(200).json({ success: true, users: results });
};

export default Accounts;
