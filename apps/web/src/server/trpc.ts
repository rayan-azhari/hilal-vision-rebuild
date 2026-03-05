import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { auth } from "@clerk/nextjs/server";

const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(async ({ next }) => {
  const { userId } = await auth();
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { userId },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
