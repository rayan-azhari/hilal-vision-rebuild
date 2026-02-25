import express from "express";
import { publicApiRouter } from "../../server/publicApi.js";

const app = express();
// Configure body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach public API router
app.use("/api/v1", publicApiRouter);

export default app;
