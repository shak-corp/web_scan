import express from "express";
import { recordConsent } from "../db/consent";
import { appendAuditLog } from "../db/audit";

const consentRouter = express.Router();

consentRouter.post("/", async (req, res) => {
  try {
    const { userId, acceptedAt, statement } = req.body;
    if (!acceptedAt || !statement) {
      return res.status(400).json({ error: "Missing consent details." });
    }
    const consent = await recordConsent({
      userId: userId || null,
      acceptedAt,
      statement: String(statement).slice(0, 256),
      ip: req.ip,
    });

    await appendAuditLog({
      eventType: "user_consent",
      userId: userId || null,
      details: `Accepted T&C at ${acceptedAt} from IP ${req.ip}`,
      refId: consent.id,
    });

    res.json({ ok: true, consentId: consent.id });
  } catch (err: any) {
    console.error("Consent error", err);
    res.status(500).json({ error: "Could not record consent" });
  }
});

export default consentRouter;
