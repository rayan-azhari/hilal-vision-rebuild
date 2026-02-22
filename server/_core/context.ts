import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getAuth } from "@clerk/express";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: { id: string } | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: { id: string } | null = null;

  try {
    const auth = getAuth(opts.req);
    if (auth.userId) {
      user = { id: auth.userId };
    }
  } catch {
    // Clerk middleware not applied — public endpoint, no user context
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
