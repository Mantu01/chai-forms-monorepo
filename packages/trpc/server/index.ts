import { router } from "./trpc";
import { authRouter } from "./routes/auth/route";
import { workspaceRouter } from "./routes/workspace/route";

export const serverRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
});

export { createContext } from "./context";
export { signToken, verifyToken } from "./utils/auth";
export type ServerRouter = typeof serverRouter;
