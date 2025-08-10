import { Request, Response } from "express";
import { getIO } from "../../realtime/socket";
import {
  getActiveAttemptForUser,
  invalidateActiveAttempt,
} from "./supervisor.services";

export class SupervisorController {
  /**
   * GET /api/supervisor/monitor/:userId
   * Returns current in-progress attempt for the specified user (if any)
   * plus lightweight telemetry extracted from attempt meta.
   */
  static async monitor(req: Request, res: Response) {
    const { userId } = req.params;
    const attempt = await getActiveAttemptForUser(userId);
    if (!attempt) {
      return res.json({ attempt: null, message: "No active attempt for user" });
    }
    const telemetry = {
      lastSuspicious: (attempt.meta as any)?.lastSuspicious,
      invalidated: (attempt.meta as any)?.invalidated,
    };
    res.json({
      attempt: {
        id: attempt._id,
        step: attempt.step,
        startedAt: attempt.startedAt,
        status: attempt.status,
        questionCount: attempt.questions.length,
        telemetry,
      },
    });
  }

  /**
   * POST /api/supervisor/invalidate/:userId
   * Body: { reason: string }
   * Invalidates an ongoing attempt & emits socket event to the student.
   */
  static async invalidate(req: Request, res: Response) {
    const { userId } = req.params;
    const { reason } = req.body || {};
    if (!reason || typeof reason !== "string" || reason.length < 3) {
      return res
        .status(400)
        .json({ error: "Reason is required (min length 3)" });
    }
    const result = await invalidateActiveAttempt(req.user!.sub, userId, reason);
    if (!result)
      return res.status(404).json({ error: "No active attempt to invalidate" });

    // Emit socket event to the target user room
    try {
      const io = getIO();
      io.to(userId).emit("sessionInvalidated", {
        attemptId: result.attemptId,
        reason,
      });
    } catch {
      // swallow if socket not initialized
    }

    res.json({ message: "Attempt invalidated", ...result, reason });
  }
}
