import { SignJWT, jwtVerify } from "jose";
import { Role } from "@prisma/client";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

export type Payload = {
  sub: string;
  email: string;
  role: Role;
  merchantId: string | null;
};

export async function signToken(payload: Payload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.headers.get("cookie");
  const m = cookie?.match(/\btoken=([^;]+)/);
  return m ? m[1].trim() : null;
}

export async function getSession(req: Request): Promise<Payload | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Payload;
  } catch {
    return null;
  }
}

export function requireRole(session: Payload | null, allowed: Role[]): boolean {
  return session !== null && allowed.includes(session.role);
}
