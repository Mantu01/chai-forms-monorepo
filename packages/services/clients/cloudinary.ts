import {v2 as cloudinary} from 'cloudinary';
import { env } from '../env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(filePathOrData: string, folderName: string): Promise<string> {
  const result = await cloudinary.uploader.upload(filePathOrData, {
    resource_type: "auto",
    folder: folderName,
  });
  return result.secure_url;
}

export default cloudinary;