import { Router } from "express";
import { logger } from "@repo/logger";
import { workspaceService } from "@repo/services";
import { verifyToken } from "@repo/trpc/server";
import { upload, uploadLogoHelper } from "../helper/upload";

export const workspaceRouter = Router();

function getUserIdFromCookie(req: any): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce((acc: any, cookie: string) => {
    const [name, ...rest] = cookie.split("=");
    if (name) {
      acc[name.trim()] = rest.join("=").trim();
    }
    return acc;
  }, {});
  const token = cookies["cookie"];
  if (!token) return null;
  const payload = verifyToken(token);
  return payload ? payload.userId : null;
}

workspaceRouter.post("/upload-logo", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { workspaceId } = req.body;
    const secureUrl = await uploadLogoHelper(req.file);
    if (workspaceId) {
      const updatedWorkspace = await workspaceService.updateWorkspace(userId, {
        workspaceId,
        data: {
          logoUrl: secureUrl,
        },
      });
      return res.json(updatedWorkspace);
    }
    return res.json({ logoUrl: secureUrl });
  } catch (error: any) {
    logger.error("Logo upload error", { error });
    return res.status(500).json({ error: error.message || "Failed to upload logo" });
  }
});
