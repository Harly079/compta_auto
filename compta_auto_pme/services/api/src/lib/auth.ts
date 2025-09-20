import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf-8");
}

export function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret missing");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Token format invalid");
  const [headerB64, payloadB64, signature] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  if (expected !== signature) throw new Error("Signature invalide");
  const payload = JSON.parse(base64UrlDecode(payloadB64));
  return payload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers["authorization"];
    if (!header) throw new Error("missing auth header");
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) throw new Error("invalid auth header");
    const payload = verifyJwt(token);
    (req as any).user = payload;
    return next();
  } catch (err: any) {
    return res.status(401).json({ ok: false, error: err?.message || "unauthorized" });
  }
}
