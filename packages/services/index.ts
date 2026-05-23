import UserService from "./user";
import { WorkspaceService } from "./workspace";
import { SubmissionService } from "./submission";
import { WorkspaceService as FormService } from "./form";

export const userService = new UserService();
export const workspaceService = new WorkspaceService();
export const submissionService = new SubmissionService();
export const formService = new FormService();

export { uploadImage } from "./clients/cloudinary";