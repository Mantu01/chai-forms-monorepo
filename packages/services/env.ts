import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string(),

  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string(),

  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_SERVICE: z.string(),
  MAIL_PORT: z.string(),
  MAIL_PROVIDER: z.string(),
  
  CLOUDINARY_CLOUD_NAME : z.string(),
  CLOUDINARY_API_KEY : z.string(),
  CLOUDINARY_API_SECRET : z.string(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
