import { router } from "../trpc";
import { visibilityRouter } from "./visibility";
import { weatherRouter } from "./weather";
import { notificationsRouter } from "./notifications";
import { telemetryRouter } from "./telemetry";

export const appRouter = router({
    visibility: visibilityRouter,
    weather: weatherRouter,
    notifications: notificationsRouter,
    telemetry: telemetryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
