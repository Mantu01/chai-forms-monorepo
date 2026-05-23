import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema, GetLoggedInUserSchema } from "./model";
import {UserQuery} from "@repo/database/queries";

class UserService {

  private userQuery=new UserQuery()

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
