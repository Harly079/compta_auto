import { Router } from "express";
export const router = Router();
router.get("/", (_, res) => res.status(200).json({ ok: true, ts: Date.now() }));
