// import { Request, Response } from "express";
// import { UserModel } from "./user.model";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: { sub: string };
//     }
//   }
// }

// export class UserController {
//   static async me(req: Request, res: Response) {
//     const user = await UserModel.findById(req.user?.sub).select(
//       "-passwordHash"
//     );
//     res.json({ user });
//   }

//   static async updateMe(req: Request, res: Response) {
//     const allowed = (({ name, avatarUrl }) => ({ name, avatarUrl }))(req.body);
//     const user = await UserModel.findByIdAndUpdate(
//       req.user?.sub,
//       { "profile.name": allowed.name, "profile.avatarUrl": allowed.avatarUrl },
//       { new: true }
//     ).select("-passwordHash");
//     res.json({ user });
//   }

//   static async listUsers(req: Request, res: Response) {
//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 20);
//     const skip = (page - 1) * limit;
//     const [items, total] = await Promise.all([
//       UserModel.find().skip(skip).limit(limit).select("-passwordHash"),
//       UserModel.countDocuments(),
//     ]);
//     res.json({ items, page, total, pages: Math.ceil(total / limit) });
//   }

//   static async getUser(req: Request, res: Response) {
//     const user = await UserModel.findById(req.params.id).select(
//       "-passwordHash"
//     );
//     if (!user) return res.status(404).json({ error: "Not found" });
//     res.json({ user });
//   }

//   static async deleteUser(req: Request, res: Response) {
//     await UserModel.findByIdAndDelete(req.params.id);
//     res.json({ message: "Deleted" });
//   }
// }

import { Request, Response } from "express";
import { UserModel } from "./user.model";

export class UserController {
  static async me(req: Request, res: Response) {
    const user = await UserModel.findById(req.user?.sub).select(
      "-passwordHash"
    );
    res.json({ user });
  }

  static async updateMe(req: Request, res: Response) {
    // Prevent email updates explicitly
    if ("email" in req.body) {
      return res.status(400).json({ error: "Email cannot be updated" });
    }

    const updates: any = {};
    if (req.body.name) updates["profile.name"] = req.body.name;
    if (req.body.avatarUrl) updates["profile.avatarUrl"] = req.body.avatarUrl;
    if (req.body.phone) updates["profile.phone"] = req.body.phone;

    const user = await UserModel.findByIdAndUpdate(req.user?.sub, updates, {
      new: true,
    }).select("-passwordHash");
    res.json({ user });
  }

  static async listUsers(req: Request, res: Response) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.supervisorApproved)
      filter.supervisorApproved = req.query.supervisorApproved === "true";

    const [items, total] = await Promise.all([
      UserModel.find(filter).skip(skip).limit(limit).select("-passwordHash"),
      UserModel.countDocuments(filter),
    ]);
    res.json({ items, page, total, pages: Math.ceil(total / limit) });
  }

  static async getUser(req: Request, res: Response) {
    const user = await UserModel.findById(req.params.id).select(
      "-passwordHash"
    );
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({ user });
  }

  static async deleteUser(req: Request, res: Response) {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  }

  static async approveSupervisor(req: Request, res: Response) {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "supervisor")
      return res.status(400).json({ error: "Not a supervisor account" });
    if (user.supervisorApproved)
      return res.json({ message: "Already approved" });
    user.supervisorApproved = true;
    await user.save();
    res.json({ message: "Supervisor approved", userId: user._id });
  }
}
