import { ContactData, SubmissionData, InviteData } from "./index";

export function generateContactMail(data: ContactData): string {
  return `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
  <h2 style="color: #1a202c; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; margin-top: 0;">New Contact Message</h2>
  <p style="color: #4a5568; font-size: 14px; margin: 8px 0;"><strong>From:</strong> ${data.username}</p>
  <div style="color: #2d3748; font-size: 16px; white-space: pre-wrap; margin-top: 15px; padding: 12px; background-color: #f7fafc; border-radius: 6px; border: 1px solid #edf2f7;">${data.message}</div>
</div>
  `;
}

export function generateSubmissionMail(data: SubmissionData): string {
  const rows = data.answers
    .map(
      (ans) => `
      <tr>
        <td style="border: 1px solid #e2e8f0; padding: 10px; font-weight: bold; color: #4a5568; background-color: #f8fafc; width: 30%; font-size: 14px;">${ans.label}</td>
        <td style="border: 1px solid #e2e8f0; padding: 10px; color: #2d3748; font-size: 14px;">${
          ans.value === null || ans.value === undefined
            ? '<em style="color: #a0aec0;">No response</em>'
            : typeof ans.value === "object"
            ? `<pre style="margin: 0; font-family: monospace; font-size: 13px;">${JSON.stringify(ans.value, null, 2)}</pre>`
            : String(ans.value)
        }</td>
      </tr>
    `
    )
    .join("");

  return `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
  <h2 style="color: #1a202c; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; margin-top: 0;">New Submission: ${data.formTitle}</h2>
  <p style="color: #4a5568; font-size: 14px; margin: 6px 0;"><strong>Submission ID:</strong> ${data.submissionId}</p>
  <p style="color: #4a5568; font-size: 14px; margin: 6px 0;"><strong>Submitted At:</strong> ${data.submittedAt}</p>
  ${
    data.submittedBy
      ? `<p style="color: #4a5568; font-size: 14px; margin: 6px 0;"><strong>Submitted By:</strong> ${data.submittedBy}</p>`
      : ""
  }
  
  <h3 style="color: #2d3748; margin-top: 24px; margin-bottom: 10px; border-bottom: 1px solid #edf2f7; padding-bottom: 6px; font-size: 16px;">Response Answers</h3>
  <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #e2e8f0;">
    <thead>
      <tr style="background-color: #edf2f7;">
        <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left; color: #4a5568; font-size: 14px; width: 30%;">Question Field</th>
        <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left; color: #4a5568; font-size: 14px;">Value</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="2" style="border: 1px solid #e2e8f0; padding: 12px; text-align: center; color: #718096; font-size: 14px;">No answers provided.</td></tr>'}
    </tbody>
  </table>
</div>
  `;
}

export function generateInviteMail(data: InviteData): string {
  return `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
  <h2 style="color: #1a202c; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; margin-top: 0;">Workspace Invitation</h2>
  <p style="color: #2d3748; font-size: 16px; line-height: 1.5;">You have been invited to join the workspace <strong>${data.workspaceName}</strong> as a <strong>${data.role}</strong>.</p>
  <p style="color: #4a5568; font-size: 14px; margin-bottom: 24px; line-height: 1.5;">Please click the button below or log into your account to accept this invitation.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${data.inviteLink}" style="display: inline-block; background-color: #3182ce; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Accept Invitation</a>
  </div>
  <p style="color: #718096; font-size: 12px; margin-top: 24px; border-top: 1px solid #edf2f7; padding-top: 12px;">If you cannot click the button above, copy and paste the following URL into your browser:<br/><a href="${data.inviteLink}" style="color: #3182ce; word-break: break-all;">${data.inviteLink}</a></p>
</div>
  `;
}
