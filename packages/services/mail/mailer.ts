
import transport from "../clients/mail-transport";
import { getTemplate, TemplateProps } from "./templates";

interface MailProps{
  templateProps:TemplateProps,
  to:string,
  subject:string
}

export async function sendMail(props:MailProps) {
  const {templateProps,to,subject}=props;
  try {
    const mailTemplate=getTemplate(templateProps);
    const res=await transport.sendMail({
      from:process.env.MAIL_USERNAME,
      to,
      subject,
      html:mailTemplate
    });
    return res;
  } catch (error) {
    throw error;
  }
}