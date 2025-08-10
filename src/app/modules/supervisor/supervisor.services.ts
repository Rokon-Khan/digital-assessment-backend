import { AssessmentAttemptModel } from "../assessment/assessmentAttempt.model";
import { UserModel } from "../user/user.model";

export async function getActiveAttemptForUser(userId: string) {
  return AssessmentAttemptModel.findOne({
    user: userId,
    status: "in_progress",
  });
}

export interface InvalidateResult {
  attemptId: string;
  previousStatus: string;
  newStatus: string;
}

export async function invalidateActiveAttempt(
  supervisorId: string,
  targetUserId: string,
  reason: string
): Promise<InvalidateResult | null> {
  const attempt = await AssessmentAttemptModel.findOne({
    user: targetUserId,
    status: "in_progress",
  });
  if (!attempt) return null;

  const previousStatus = attempt.status;
  attempt.status = "invalidated";
  attempt.meta = {
    ...(attempt.meta || {}),
    invalidated: {
      by: supervisorId,
      reason,
      at: new Date().toISOString(),
    },
  };
  await attempt.save();

  // (Optional) Demote / keep user level unchanged; no level change here.
  await UserModel.updateOne(
    { _id: targetUserId },
    {
      $set: {
        /* optional flags */
      },
    }
  );

  return {
    attemptId: attempt._id.toString(),
    previousStatus,
    newStatus: attempt.status,
  };
}
