import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import {
  errorHandler,
  notFoundHandler,
} from "./app/middleware/error.middleware";
import { analyticsRouter } from "./app/routes/analytics.routes";
import { assessmentRouter } from "./app/routes/assessment.routes";
import { authRouter } from "./app/routes/auth.routes";
import { certificateRouter } from "./app/routes/certificate.routes";
import { questionRouter } from "./app/routes/question.routes";
import { supervisorRouter } from "./app/routes/supervisor.routes";
import { userRouter } from "./app/routes/user.routes";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) =>
    res.json({ status: "ok", timestamp: Date.now() })
  );

  app.use("/api/auth", authRouter);
  app.use("/api", userRouter);
  app.use("/api", assessmentRouter);
  app.use("/api", questionRouter);
  app.use("/api", certificateRouter);
  app.use("/api", analyticsRouter);
  app.use("/api", supervisorRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

export default createApp;
