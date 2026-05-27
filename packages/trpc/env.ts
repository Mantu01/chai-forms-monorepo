import { z } from "zod";

const envSchema = z.object({
  REDIS_USERNAME:z.string(),
  REDIS_PASSWORD:z.string(),
  REDIS_HOST:z.string(),
  REDIS_PORT:z.coerce.number(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
