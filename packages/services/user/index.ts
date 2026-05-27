import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema, GetLoggedInUserSchema } from "./model";
import {UserQuery} from "@repo/database/queries";
import { SelectUser } from "@repo/database";
import crypto from "node:crypto";
import { uploadImage } from "../clients/cloudinary";

class UserService {

  private userQuery=new UserQuery()

  public async handleGoogleCallback(code: string, referralCode?: string): Promise<SelectUser> {
    const { tokens } = await googleOAuth2Client.getToken(code);
    const accessToken = tokens.access_token;
    if (!accessToken) {
      throw new Error("Failed to retrieve access token");
    }
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error("Failed to retrieve user info from Google");
    }
    const userInfo = (await response.json()) as {
      sub: string;
      name: string;
      email: string;
      picture?: string;
    };
    let user = await this.userQuery.findUserByGoogleId(userInfo.sub);
    if (!user) {
      user = await this.userQuery.findUserByEmail(userInfo.email);
      if (user) {
        const updated = await this.userQuery.updateUser(user.id, {
          googleId: userInfo.sub,
          profileImageUrl: userInfo.picture || user.profileImageUrl,
        });
        if (!updated) {
          throw new Error("Failed to update user");
        }
        user = updated;
      } else {
        const isSubscribed = referralCode ? await this.userQuery.checkReferralCode(referralCode) : false;
        const created = await this.userQuery.createUser({
          fullName: userInfo.name,
          email: userInfo.email,
          googleId: userInfo.sub,
          profileImageUrl: userInfo.picture || null,
          isSubscribed,
        });
        if (!created) {
          throw new Error("Failed to create user");
        }
        user = created;
      }
    }
    if (!user) {
      throw new Error("Failed to resolve user");
    }
    return user;
  }

  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];
    const isGoogleConfigured = !!(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);
    if (isGoogleConfigured) {
      const url = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
      });
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }
    return supportedAuthenticationProviders;
  }

  public async getLoggedInUser(userId:string | null):Promise<GetLoggedInUserSchema>{
    if(userId==null){
      return {user:null};
    }
    const user = await this.userQuery.findUserById(userId);
    if (!user) {
      return { user: null };
    }
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        isSubscribed: !!user.isSubscribed,
      },
    };
  }

  // Helper to hash password
  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
  }

  // Helper to verify password
  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
  }

  public async signupWithPassword(data: {
    fullName: string;
    email: string;
    password: string;
    referralCode?: string;
  }): Promise<SelectUser> {
    const existing = await this.userQuery.findUserByEmail(data.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = this.hashPassword(data.password);
    const isSubscribed = data.referralCode
      ? await this.userQuery.checkReferralCode(data.referralCode)
      : false;

    const created = await this.userQuery.createUser({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      isSubscribed,
    });

    if (!created) {
      throw new Error("Failed to create user");
    }

    return created;
  }

  public async loginWithPassword(data: {
    email: string;
    password: string;
  }): Promise<SelectUser> {
    const user = await this.userQuery.findUserByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const isValid = this.verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  public async updateProfile(
    userId: string,
    data: { fullName?: string; profileImageUrl?: string | null }
  ): Promise<GetLoggedInUserSchema["user"]> {
    const updated = await this.userQuery.updateUser(userId, data);
    if (!updated) {
      throw new Error("Failed to update profile");
    }
    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      profileImageUrl: updated.profileImageUrl,
      isSubscribed: !!updated.isSubscribed,
    };
  }

  public async uploadProfileImage(userId: string, base64Data: string): Promise<string> {
    const imageUrl = await uploadImage(base64Data, "profiles");
    const updated = await this.userQuery.updateProfileImage(userId, imageUrl);
    if (!updated) {
      throw new Error("Failed to update profile image in database");
    }
    return imageUrl;
  }
}

export default UserService;
