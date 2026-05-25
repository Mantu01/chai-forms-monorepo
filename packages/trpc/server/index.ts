import { router } from "./trpc";
import { authRouter } from "./routes/auth/route";
import { workspaceRouter } from "./routes/workspace/route";
import { submissionRouter } from "./routes/submission/route";
import { formRouter } from "./routes/form/route";
import { commentRouter } from "./routes/comment/route";
import { dashboardRouter } from "./routes/dashboard/route";

export const serverRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  submission: submissionRouter,
  form: formRouter,
  comment: commentRouter,
  dashboard: dashboardRouter,
});

export { createContext } from "./context";
export { signToken, verifyToken } from "./utils/auth";
export type ServerRouter = typeof serverRouter;
