import { UserQuery } from "@repo/database/queries/user.query";
import { SignupUsingEmailInput } from "./model";

export interface SignupResponse {
  userId: string;
  email: string;
  sessionToken: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  sessionToken?: string;
}

class UserService {
  private userQuery = new UserQuery();

  async signupUsingEmail(input:SignupUsingEmailInput): Promise<SignupResponse> {
    const existingUser = await this.userQuery.findUserByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const verificationToken = sessionService.generateEmailVerificationToken();
    const tokenExpiry = sessionService.getEmailVerificationTokenExpiry(24);

    const user = await this.userQuery.createUser({
      email,
      fullName: email.split("@")[0],
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiry: tokenExpiry,
      emailVerified: false,
      isSubscribed: false,
    });

    const sessionToken = sessionService.createSession(user.id, email, 24);

    try {
      await mailingService.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email. Please try again.");
    }

    return {
      userId: user.id,
      email: user.email,
      sessionToken,
    };
  }

  async verifyEmailToken(token: string, sessionToken: string): Promise<VerifyEmailResponse> {
    const session = sessionService.getSession(sessionToken);
    if (!session) {
      throw new Error("Invalid or expired session. Please sign up again.");
    }

    const user = await this.userQuery.findUserById(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerificationToken !== token) {
      throw new Error("Invalid verification token");
    }

    if (!user.emailVerificationTokenExpiry || new Date() > user.emailVerificationTokenExpiry) {
      throw new Error("Verification token has expired. Please sign up again.");
    }

    const updatedUser = await this.userQuery.verifyUserEmail(user.id);
    if (!updatedUser) {
      throw new Error("Failed to verify email");
    }

    try {
      await mailingService.sendWelcomeEmail(user.email, user.fullName);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    return {
      success: true,
      message: "Email verified successfully",
      sessionToken,
    };
  }

  async getAuthenticationMethods() {
    return [];
  }
}

export default UserService;
