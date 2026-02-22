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
  const auth = getAuth(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user: auth.userId ? { id: auth.userId } : null,
  };
}
