import { z } from "zod";

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});
export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;

export const signupUsingEmailInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName:z.string()
});
export type SignupUsingEmailInput = z.infer<typeof signupUsingEmailInputSchema>;

export const signupUsingEmailOutputSchema = z.object({
  userId: z.string(),
  email: z.string(),
  sessionToken: z.string(),
});
export type SignupUsingEmailOutput = z.infer<typeof signupUsingEmailOutputSchema>;

export const verifyEmailTokenInputSchema = z.object({
  token: z.string().min(1, "Token is required"),
  sessionToken: z.string().min(1, "Session token is required"),
});
export type VerifyEmailTokenInput = z.infer<typeof verifyEmailTokenInputSchema>;

export const verifyEmailTokenOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  sessionToken: z.string().optional(),
});
export type VerifyEmailTokenOutput = z.infer<typeof verifyEmailTokenOutputSchema>;
