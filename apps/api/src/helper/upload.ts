import multer from "multer";
import { uploadImage } from "@repo/services";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export async function uploadLogoHelper(file: Express.Multer.File): Promise<string> {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  return uploadImage(dataUri, "chai-form");
}
