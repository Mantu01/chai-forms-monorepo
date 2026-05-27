import { generateContactMail, generateSubmissionMail, generateInviteMail } from "./submission-mail";

export interface ContactData {
  username: string;
  message: string;
}

export interface SubmissionAnswer {
  label: string;
  value: any;
}

export interface SubmissionData {
  formTitle: string;
  submissionId: string;
  submittedAt: string;
  submittedBy?: string;
  answers: SubmissionAnswer[];
  formUrl?: string;
}

export interface InviteData {
  workspaceName: string;
  role: string;
  inviteLink: string;
}

export type TemplateProps =
  | { type: "contact"; data: ContactData }
  | { type: "submission"; data: SubmissionData }
  | { type: "invite"; data: InviteData };

export function getTemplate(props: TemplateProps): string {
  const { data, type } = props;
  if (type === "contact") {
    return generateContactMail(data);
  }
  if (type === "submission") {
    return generateSubmissionMail(data);
  }
  if (type === "invite") {
    return generateInviteMail(data);
  }
  return "";
}