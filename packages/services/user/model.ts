import { z } from "zod";

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});

export const getLoggedInUserSchema=z.object({
  user:z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string().email(),
    profileImageUrl: z.string().nullable(),
    isSubscribed: z.boolean(),
  }).nullable()
});


export type GetAuthenticationMethodOutputSchema = z.infer<typeof getAuthenticationMethodOutputSchema>;
export type GetLoggedInUserSchema=z.infer<typeof getLoggedInUserSchema>;