import { router } from "../trpc";
import { visibilityRouter } from "./visibility";
import { weatherRouter } from "./weather";

export const appRouter = router({
    visibility: visibilityRouter,
    weather: weatherRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
