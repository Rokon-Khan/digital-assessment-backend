import dotenv from "dotenv";
dotenv.config();

import type { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { connectRedis, disconnectRedis } from "./app/config/redis";

let server: Server | null = null;
let shuttingDown = false;

async function startServer() {
  try {
    if (!process.env.DB_URL) {
      throw new Error("DB_URL environment variable is not defined");
    }

    // Connect Mongo
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    // Connect Redis
    await connectRedis();

    const port = Number(process.env.PORT) || 5000;
    server = app().listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      gracefulShutdown();
    });
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      gracefulShutdown();
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Graceful shutdown initiated...");

  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server!.close(() => {
          console.log("HTTP server closed");
          resolve();
        });
      });
    }
    await disconnectRedis();
    await mongoose.disconnect();
    console.log("All connections closed. Exiting.");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

startServer();
