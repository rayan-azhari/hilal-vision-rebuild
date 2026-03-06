import { router } from "../trpc";
import { visibilityRouter } from "./visibility";
import { weatherRouter } from "./weather";
import { notificationsRouter } from "./notifications";
import { telemetryRouter } from "./telemetry";
import { demRouter } from "./dem";

export const appRouter = router({
    visibility: visibilityRouter,
    weather: weatherRouter,
    notifications: notificationsRouter,
    telemetry: telemetryRouter,
    dem: demRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
