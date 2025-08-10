import { Server } from "socket.io";
import { verifyToken } from "../config/jwt";
import { AssessmentAttemptModel } from "../modules/assessment/assessmentAttempt.model";
// import { AssessmentAttemptModel } from '../models/AssessmentAttempt.model.js';

interface ServerToClientEvents {
  supervisorAlert: (data: { userId: string; reason: string }) => void;
  sessionInvalidated: (payload: { attemptId: string; reason?: string }) => void;
}

interface ClientToServerEvents {
  heartbeat: (data: {
    attemptId: string;
    fullscreen: boolean;
    visible: boolean;
    ts: number;
  }) => void;
  proctorStart: (data: { attemptId: string }) => void;
  videoChunk: (data: { attemptId: string; chunk: ArrayBuffer }) => void;
}

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export function initSocket(httpServer: any) {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET!);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    socket.join(user.sub);

    socket.on("heartbeat", async (data) => {
      if (!data.attemptId) return;
      // Save minimal telemetry; optionally enforce time window or suspicious flags
      if (!data.fullscreen || !data.visible) {
        await AssessmentAttemptModel.updateOne(
          { _id: data.attemptId },
          { $set: { "meta.lastSuspicious": Date.now() } }
        );
        // Notify supervisors (optional broadcast)
        io?.emit("supervisorAlert", {
          userId: user.sub,
          reason: !data.fullscreen
            ? "Exited fullscreen"
            : "Tab/visibility change",
        });
      }
    });

    socket.on("proctorStart", (_data) => {
      // Reserve for future video start events
    });

    socket.on("videoChunk", (_data) => {
      // Future: route chunk to supervisor or store temporarily
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
