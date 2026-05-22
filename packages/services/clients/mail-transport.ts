import nodemailer from "nodemailer";
import { env } from "../env";

const auth = {
  user: env.MAIL_USERNAME,
  pass: env.MAIL_PASSWORD,
};

const productionConfig = {
  service:env.MAIL_SERVICE ,
  auth,
};

const developmentConfig = {
  host: env.MAIL_PROVIDER,
  port: Number(env.MAIL_PORT),
  auth,
};

const isProduction = env.NODE_ENV === "production";
const config = isProduction ? productionConfig : developmentConfig;

const transport = nodemailer.createTransport(config);

export default transport;