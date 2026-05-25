import UserService from "./user";
import { WorkspaceService } from "./workspace";
import { SubmissionService } from "./submission";
import { WorkspaceService as FormService } from "./form";
import { CommentService } from "./comment";
import { DashboardService } from "./dashboard";

export const userService = new UserService();
export const workspaceService = new WorkspaceService();
export const submissionService = new SubmissionService();
export const formService = new FormService();
export const commentService = new CommentService();
export const dashboardService = new DashboardService();

export { uploadImage } from "./clients/cloudinary";