import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { users, oauthAccounts, InsertUser, SelectUser, InsertOauthAccount, SelectOauthAccount } from "../models/user.model";
import db from "..";

export class UserQuery {
  
  async findUserByEmail(email: string): Promise<SelectUser | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findUserById(id: string): Promise<SelectUser | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async createUser(data: InsertUser): Promise<SelectUser | undefined> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<SelectUser | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async findAllUsers(): Promise<SelectUser[]> {
    return db.query.users.findMany();
  }

  async findUsersBySubscription(isSubscribed: boolean): Promise<SelectUser[]> {
    return db.query.users.findMany({
      where: eq(users.isSubscribed, isSubscribed),
    });
  }

  async findVerifiedUsers(): Promise<SelectUser[]> {
    return db.query.users.findMany({
      where: eq(users.emailVerified, true),
    });
  }

  async findUnverifiedUsers(): Promise<SelectUser[]> {
    return db.query.users.findMany({
      where: eq(users.emailVerified, false),
    });
  }

  async verifyUserEmail(id: string): Promise<SelectUser | undefined> {
    const [user] = await db.update(users)
      .set({ emailVerified: true, emailVerificationToken: "" })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateEmailVerificationToken(id: string, token: string, expiry: Date): Promise<SelectUser | undefined> {
    const [user] = await db.update(users)
      .set({ emailVerificationToken: token, emailVerificationTokenExpiry: expiry })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateProfileImage(id: string, imageUrl: string): Promise<SelectUser | undefined> {
    const [user] = await db.update(users)
      .set({ profileImageUrl: imageUrl })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateSubscriptionStatus(id: string, isSubscribed: boolean): Promise<SelectUser | undefined> {
    const [user] = await db.update(users)
      .set({ isSubscribed })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async findUserWithOAuthAccounts(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        oauthAccounts: true,
      },
    });
  }

  async createOAuthAccount(data: InsertOauthAccount): Promise<SelectOauthAccount | undefined> {
    const [account] = await db.insert(oauthAccounts).values(data).returning();
    return account;
  }

  async findOAuthAccount(id: string): Promise<SelectOauthAccount | undefined> {
    return db.query.oauthAccounts.findFirst({
      where: eq(oauthAccounts.id, id),
    });
  }

  async findOAuthAccountByProvider(userId: string, provider: string): Promise<SelectOauthAccount | undefined> {
    return db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.userId, userId),
        eq(oauthAccounts.provider, provider)
      ),
    });
  }

  async findOAuthAccountByProviderAccountId(providerAccountId: string, provider: string): Promise<SelectOauthAccount | undefined> {
    return db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.providerAccountId, providerAccountId),
        eq(oauthAccounts.provider, provider)
      ),
    });
  }

  async findUserOAuthAccounts(userId: string): Promise<SelectOauthAccount[]> {
    return db.query.oauthAccounts.findMany({
      where: eq(oauthAccounts.userId, userId),
    });
  }

  async updateOAuthAccount(id: string, data: Partial<InsertOauthAccount>): Promise<SelectOauthAccount | undefined> {
    const [account] = await db.update(oauthAccounts)
      .set(data)
      .where(eq(oauthAccounts.id, id))
      .returning();
    return account;
  }

  async deleteOAuthAccount(id: string): Promise<void> {
    await db.delete(oauthAccounts).where(eq(oauthAccounts.id, id));
  }

  async deleteUserOAuthAccounts(userId: string): Promise<void> {
    await db.delete(oauthAccounts).where(eq(oauthAccounts.userId, userId));
  }

  async findOAuthAccountsWithValidTokens(userId: string): Promise<SelectOauthAccount[]> {
    return db.query.oauthAccounts.findMany({
      where: and(
        eq(oauthAccounts.userId, userId),
        isNotNull(oauthAccounts.expiresAt)
      ),
    });
  }

  async updateOAuthAccessToken(id: string, accessToken: string, refreshToken?: string): Promise<SelectOauthAccount | undefined> {
    const [account] = await db.update(oauthAccounts)
      .set({
        accessToken,
        ...(refreshToken && { refreshToken }),
      })
      .where(eq(oauthAccounts.id, id))
      .returning();
    return account;
  }

  async findUsersWithoutProfileImage(): Promise<SelectUser[]> {
    return db.query.users.findMany({
      where: isNull(users.profileImageUrl),
    });
  }

  async countTotalUsers(): Promise<number> {
    const result = await db.query.users.findMany();
    return result.length;
  }

  async countVerifiedUsers(): Promise<number> {
    const result = await db.query.users.findMany({
      where: eq(users.emailVerified, true),
    });
    return result.length;
  }

  async countSubscribedUsers(): Promise<number> {
    const result = await db.query.users.findMany({
      where: eq(users.isSubscribed, true),
    });
    return result.length;
  }

  async findUsersByCreatedDate(startDate: Date, endDate: Date): Promise<SelectUser[]> {
    return db.query.users.findMany({
      where: and(
        isNotNull(users.createdAt),
      ),
    });
  }

  async updateUserFullName(id: string, fullName: string): Promise<SelectUser | undefined> {
    const [user] = await db.update(users)
      .set({ fullName })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async findUserByEmailPartial(emailPattern: string): Promise<SelectUser[]> {
    return db.query.users.findMany();
  }
}