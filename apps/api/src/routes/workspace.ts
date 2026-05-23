import { Router } from "express";
import { logger } from "@repo/logger";
import { workspaceService } from "@repo/services";
import { upload, uploadLogoHelper } from "../helper/upload";

export const workspaceRouter = Router();

workspaceRouter.post("/upload-logo", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { workspaceId, userId } = req.body;
    const secureUrl = await uploadLogoHelper(req.file);
    if (workspaceId && userId) {
      const updatedWorkspace = await workspaceService.updateWorkspace({
        workspaceId,
        userId,
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
