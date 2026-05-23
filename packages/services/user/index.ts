import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema, GetLoggedInUserSchema } from "./model";
import {UserQuery} from "@repo/database/queries";
import { SelectUser } from "@repo/database";

class UserService {

  private userQuery=new UserQuery()

  public async handleGoogleCallback(code: string): Promise<SelectUser> {
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
        const created = await this.userQuery.createUser({
          fullName: userInfo.name,
          email: userInfo.email,
          googleId: userInfo.sub,
          profileImageUrl: userInfo.picture || null,
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
      },
    };
  }


}

export default UserService;
