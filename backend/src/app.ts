import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import consentRouter from "./api/consent";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use(async (req, res, next) => { req.user = null; next(); });

app.use("/api/consent", consentRouter);

app.get("/api/status", (req, res) => {
  res.json({ ok: true, version: "1.0.0", commit: process.env.COMMIT_SHA ?? null });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("API error", err);
  res.status(500).json({ error: "Server error", details: err?.message || String(err) });
});

export default app;
